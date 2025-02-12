// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./PokemonCard.sol";

contract PokemonMarketplace is Ownable, ReentrancyGuard, AccessControl {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    
    enum SaleType { Minted, DutchAuction, FixedPrice, Burned }
    
    struct Listing {
        address seller;
        SaleType saleType;
        uint256 tokenId;
        uint256 startTime;
        uint256 endTime;
        uint256 duration;
        uint256 startPrice;
        uint256 endPrice;
        bool isActive;
    }

    //******************************************************//
    //                      Event                           //
    //******************************************************//
    // event Listed(uint256 indexed tokenId, SaleType saleType);
    // event Sold(uint256 indexed tokenId, address buyer);
    event EmergencyPaused(address indexed admin);
    event EmergencyWithdraw(uint256 indexed tokenId);
    // for withdraw
    event WithdrawFairly(
        address user,
        uint256 amount
    );
    // for auction
    event TradeStarted(
        uint256 tokenId,
        uint256 startTime,
        uint256 endTime,
        uint256 duration,
        uint256 startPrice,
        uint256 endPrice,
        address seller,
        bool isActive,
        SaleType cardType
    );

    event TokenSold(
        uint256 tokenId,
        address originalOwner,
        address newOwner,
        uint256 price,
        uint256 time,
        SaleType cardType
    );

    event TradeCancel(
        uint256 tokenId,
        address owner,
        uint256 time,
        SaleType cardType
    );

    //******************************************************//
    //               Constant and Variables                 //
    //******************************************************//
    // uint256 public constant DURATION = 7 days;
    uint256 public constant ONE_ETHER = 1 ether;
    bool public paused = false;
    PokemonCard public metadataContract;

    //******************************************************//
    //                      Mapping                         //
    //******************************************************//
    // storage
    mapping(uint256 => Listing) public listings;
    mapping(address => uint256) public pendingWithdraw;

    //******************************************************//
    //                      Modifier                        //
    //******************************************************//
    modifier whenNotPaused {
        require(!paused, "Contract paused.");
        _;
    }

    //******************************************************//
    //                      constructor                     //
    //******************************************************//
    // constructor
    constructor(address _nftAddress) Ownable(msg.sender) {
        metadataContract = PokemonCard(_nftAddress);
        // initial role
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender); // default admin role
        _grantRole(ADMIN_ROLE, msg.sender);         // set custom ADMIN_ROLE
    }


    //******************************************************//
    //              Main trading functions                  //
    //******************************************************//
    /// @notice check if trade is active and started
    function isTradeStarted(uint256 tokenId) public view returns(bool){
        return block.timestamp >= listings[tokenId].startTime && listings[tokenId].isActive;
    }

    /// @notice list a NFT for sales, pricing method depends on saleType
    function listItem(
        uint256 tokenId,
        uint256 cardType,
        uint256 initialPrice,
        uint256 endPrice,
        uint256 duration
    ) external whenNotPaused returns (Listing memory) {
        _startTradeCheck(tokenId);

        require(metadataContract.ownerOf(tokenId) == msg.sender, "Not owner");
        require(initialPrice > 0 && endPrice >= 0, "Invalid price");
        require(duration > 0, "Invalid duration");
        SaleType saleType = SaleType(cardType);

        // DutchAuctionConfig memory config;
        if (saleType == SaleType.DutchAuction) {
            // for dutch auction
            require(endPrice <= initialPrice, "End price must be lower for dutch auction");
        }else if(saleType == SaleType.FixedPrice){
            // fixed price trade
            require(endPrice == initialPrice, "two price shall be equal for fixed price trade");
        }else{
            revert("Wrong sale type selected");
        }
        Listing memory _list = Listing(
            address(_msgSender()),
            saleType,
            tokenId,
            block.timestamp,
            block.timestamp + duration,
            duration,
            initialPrice * ONE_ETHER,
            endPrice * ONE_ETHER,
            true
        );

        listings[tokenId] = _list;
        metadataContract.setSalesStatus(tokenId, true, uint256(SaleType.DutchAuction));

        // nftContract.transferFrom(msg.sender, address(this), tokenId);
        // emit Listed(tokenId, saleType);
        emit TradeStarted(
            tokenId,
            block.timestamp,
            block.timestamp + duration,
            duration,
            initialPrice * ONE_ETHER,
            endPrice * ONE_ETHER,
            address(_msgSender()),
            true,
            saleType
        );

        return _list;
    }

    /// @notice calculate price for dutch auction
    function calculateDutchPrice(uint256 tokenId) public view whenNotPaused returns (uint256) {
        Listing memory _dutch = listings[tokenId];
        require(_dutch.saleType == SaleType.DutchAuction, "Not Dutch auction");
        require(_dutch.isActive, "Dutch: Not active");

        if(block.timestamp <= _dutch.startTime){
            return _dutch.startPrice;
        }

        if(block.timestamp >= _dutch.endTime){
            return _dutch.endPrice;
        }

        uint256 elapsed = block.timestamp - _dutch.startTime;
        uint256 priceDrop = (_dutch.startPrice - _dutch.endPrice) * elapsed / (_dutch.endTime - _dutch.startTime);
        uint256 curPrice = _dutch.startPrice - priceDrop;

        return (curPrice > _dutch.endPrice)? curPrice : _dutch.endPrice;
    }

    function cancelDutchAuction(uint256 tokenId) public whenNotPaused{
        _cancelTrade(tokenId);
        listings[tokenId].isActive = false;
        emit TradeCancel(tokenId, _msgSender(), block.timestamp, listings[tokenId].saleType);
    }

    //******************************************************//
    //               Safe transaction                       //
    //******************************************************//
    /// @notice execute purchase
    function executePurchase(uint256 tokenId) public payable whenNotPaused nonReentrant{
        Listing memory _listing = listings[tokenId];

        require(_listing.seller != _msgSender(), "buy nft: buyer & seller shall be different.");
        require(!metadataContract.checkBurned(tokenId), "buy nft: NFT has been burned");
        require(_listing.isActive, "buy nft: not on sales.");
        require(block.timestamp <= _listing.endTime, "buy nft: out of sales period");

        uint256 requiredPrice = (_listing.saleType == SaleType.DutchAuction)
            ? calculateDutchPrice(tokenId)
            : _listing.startPrice;

        require(msg.value >= requiredPrice, "buy nft: insufficient funds.");

        metadataContract.setSalesStatus(tokenId, false, uint256(SaleType.Minted));

        listings[tokenId].isActive = false;

        metadataContract.changeOwnership(_listing.seller, _msgSender(), tokenId);
        _setWithdraw(requiredPrice, _listing.seller);

        if(msg.value - requiredPrice > 0){
            _setWithdraw(msg.value - requiredPrice, _msgSender());
        }

        emit TokenSold(tokenId, _listing.seller, _msgSender(), requiredPrice, block.timestamp, _listing.saleType);
    }

    //******************************************************//
    //              emergency exit                         //
    //******************************************************//

    /// @notice emergency stop
    function emergencyPause() external onlyRole(ADMIN_ROLE) {
        paused = true;
        metadataContract.setPauseTrigger(paused);
        emit EmergencyPaused(msg.sender);
    }

   //******************************************************//
    //                    General  Fun                      //
    //******************************************************//

    function isTradeOngoing(uint256 tokenId) public view returns(bool){
        return (listings[tokenId].isActive && block.timestamp < listings[tokenId].endTime && block.timestamp >= listings[tokenId].startTime);
    }

    function _cancelTrade(uint256 tokenId) internal{
        require(metadataContract.verifyToken(tokenId, _msgSender()), "Wrong owner or token be burned");
        metadataContract.setSalesStatus(tokenId, false, uint256(SaleType.Minted));
    }

    function _startTradeCheck(uint256 tokenId) internal view{
        require(metadataContract.verifyToken(tokenId, _msgSender()), "Wrong owner or token be burned");
        require(!isTradeOngoing(tokenId), " NFT already on sales.");
    }

    //******************************************************//
    //                    Getter                            //
    //******************************************************//
    function getATrade(uint256 _tokenId) external view returns(Listing memory){
        return listings[_tokenId];
    }

    function getAllTrade(bool onlyAcitve) external view returns (Listing[] memory) {
        uint256 _tokenIdCounter = metadataContract.getCounter();
        Listing[] memory tokensId = new Listing[](_tokenIdCounter);
        if(_tokenIdCounter == 0){
            return tokensId;
        }
        uint256 key = 0;
        for (uint256 i = 1; i <= _tokenIdCounter; i++) {
            if(onlyAcitve && !listings[i].isActive){
                continue;
            }
            tokensId[key] = listings[i];
            key++;
        }

        return tokensId;
    }

    //******************************************************//
    //                    Setter                            //
    //******************************************************//
    function setPause(bool _toggle) public onlyOwner {
        paused = _toggle;
        metadataContract.setPauseTrigger(_toggle);
    }

    function _setWithdraw(uint256 amt, address user) internal {
        pendingWithdraw[user] += amt;
    }

    //******************************************************//
    //                    Withdraw                          //
    //******************************************************//
    function safeWithdraw() external nonReentrant {
        require(address(this).balance > 0, "Withdraw: no funds for withdraw.");
        uint256 toBeWithdraw = pendingWithdraw[_msgSender()];
        require(address(this).balance >= toBeWithdraw, "Withdraw: insufficient funds for withdraw.");
        pendingWithdraw[_msgSender()] = 0;
        payable(_msgSender()).transfer(toBeWithdraw);
        emit WithdrawFairly(_msgSender(), toBeWithdraw);
    }

}
