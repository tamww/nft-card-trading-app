// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract PokemonMarketplace is ReentrancyGuard, AccessControl {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    
    enum SaleType { FixedPrice, DutchAuction }
    
    struct DutchAuctionConfig {
        uint256 startPrice;
        uint256 endPrice;
        uint256 duration;
        uint256 startTime;
    }

    struct Listing {
        address seller;
        SaleType saleType;
        uint256 fixedPrice;
        DutchAuctionConfig dutchConfig;
    }

    // 安全状态变量
    bool public paused;
    IERC721 public immutable nftContract;
    
    // 存储结构
    mapping(uint256 => Listing) public listings;
    mapping(address => bytes32) public commitHashes;

    // 事件日志
    event Listed(uint256 indexed tokenId, SaleType saleType);
    event Sold(uint256 indexed tokenId, address buyer);
    event EmergencyPaused(address indexed admin);
    event EmergencyWithdraw(uint256 indexed tokenId);


    constructor(address _nftAddress) {
        nftContract = IERC721(_nftAddress);
        // 初始化角色
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender); // 必须设置默认管理员
        _grantRole(ADMIN_ROLE, msg.sender);         // 授予ADMIN_ROLE
    }


    // ======================
    // 核心交易功能
    // ======================

    /// @notice 上架NFT（带荷兰拍卖支持）
    function listItem(
        uint256 tokenId,
        SaleType saleType,
        uint256 initialPrice,
        uint256 endPrice,
        uint256 duration
    ) external whenNotPaused {
        require(nftContract.ownerOf(tokenId) == msg.sender, "Not owner");
        require(initialPrice > 0, "Invalid price");

        DutchAuctionConfig memory config;
        if (saleType == SaleType.DutchAuction) {
            require(endPrice < initialPrice, "End price must be lower");
            require(duration > 0, "Invalid duration");
            config = DutchAuctionConfig(initialPrice, endPrice, duration, block.timestamp);
        }

        listings[tokenId] = Listing({
            seller: msg.sender,
            saleType: saleType,
            fixedPrice: initialPrice,
            dutchConfig: config
        });

        nftContract.transferFrom(msg.sender, address(this), tokenId);
        emit Listed(tokenId, saleType);
    }

    /// @notice 荷兰拍卖价格计算
    function calculateDutchPrice(uint256 tokenId) public view returns (uint256) {
        Listing storage listing = listings[tokenId];
        require(listing.saleType == SaleType.DutchAuction, "Not Dutch auction");
        
        DutchAuctionConfig memory config = listing.dutchConfig;
        uint256 elapsed = block.timestamp - config.startTime;
        
        if (elapsed >= config.duration) return config.endPrice;
        
        uint256 priceRange = config.startPrice - config.endPrice;
        uint256 currentPrice = config.startPrice - (priceRange * elapsed / config.duration);
        
        return currentPrice;
    }

    // ======================
    // 安全交易流程
    // ======================

    /// @notice 提交交易哈希（防抢跑）
    function commitTrade(bytes32 hashedData) external {
        commitHashes[msg.sender] = hashedData;
    }

    /// @notice 执行购买（带揭示机制）
    function executePurchase(
        uint256 tokenId,
        uint256 bidValue,
        bytes32 secret
    ) external payable nonReentrant whenNotPaused {
        // 验证揭示数据
        require(
            keccak256(abi.encodePacked(bidValue, secret)) == commitHashes[msg.sender],
            "Invalid reveal"
        );
        
        Listing storage listing = listings[tokenId];
        uint256 requiredPrice = (listing.saleType == SaleType.DutchAuction)
            ? calculateDutchPrice(tokenId)
            : listing.fixedPrice;

        require(msg.value >= requiredPrice, "Insufficient funds");
        
        // 执行转账
        _safeTransfer(tokenId, msg.sender);
        
        // 资金处理
        payable(listing.seller).transfer(requiredPrice);
        if (msg.value > requiredPrice) {
            payable(msg.sender).transfer(msg.value - requiredPrice);
        }
        
        emit Sold(tokenId, msg.sender);
    }

    // ======================
    // 安全控制功能
    // ======================

    /// @notice 紧急暂停合约
    function emergencyPause() external onlyRole(ADMIN_ROLE) {
        paused = true;
        emit EmergencyPaused(msg.sender);
    }

    /// @notice 紧急取回NFT
    function emergencyWithdraw(uint256 tokenId) external onlyRole(ADMIN_ROLE) {
        require(listings[tokenId].seller != address(0), "Item not listed");
        _safeTransfer(tokenId, listings[tokenId].seller);
        delete listings[tokenId];
        emit EmergencyWithdraw(tokenId);
    }

    // ======================
    // 内部工具函数
    // ======================

    function _safeTransfer(uint256 tokenId, address to) private {
        nftContract.transferFrom(address(this), to, tokenId);
        delete listings[tokenId];
    }

    modifier whenNotPaused() {
        require(!paused, "Contract paused");
        _;
    }
}
