// SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract PokemonMarket is ReentrancyGuard, Ownable {
    IERC721 public nftContract;

    // 上架信息
    struct Listing {
        address seller;
        uint256 price;
        bool isAuction;
        uint256 auctionEndTime;
        address highestBidder;
        uint256 highestBid;
    }

    mapping(uint256 => Listing) public listings;

    event Listed(uint256 tokenId, address seller, uint256 price, bool isAuction);
    event Sold(uint256 tokenId, address buyer, uint256 price);
    event AuctionEnded(uint256 tokenId, address winner, uint256 price);

    constructor(address _nftAddress) {
        nftContract = IERC721(_nftAddress);
    }

    // 上架（固定价格）
    function listForSale(uint256 tokenId, uint256 price) external {
        require(nftContract.ownerOf(tokenId) == msg.sender, "Not owner");
        require(price > 0, "Price must be > 0");
        listings[tokenId] = Listing(msg.sender, price, false, 0, address(0), 0);
        emit Listed(tokenId, msg.sender, price, false);
    }

    // 购买（固定价格）
    function buy(uint256 tokenId) external payable nonReentrant {
        Listing storage listing = listings[tokenId];
        require(msg.value >= listing.price, "Insufficient funds");
        require(!listing.isAuction, "Use auction functions");
        nftContract.safeTransferFrom(listing.seller, msg.sender, tokenId);
        payable(listing.seller).transfer(msg.value);
        delete listings[tokenId];
        emit Sold(tokenId, msg.sender, msg.value);
    }

    // 上架拍卖
    function startAuction(uint256 tokenId, uint256 duration, uint256 startingPrice) external {
        require(nftContract.ownerOf(tokenId) == msg.sender, "Not owner");
        require(duration > 0, "Duration must be > 0");
        listings[tokenId] = Listing(
            msg.sender,
            startingPrice,
            true,
            block.timestamp + duration,
            address(0),
            startingPrice
        );
        emit Listed(tokenId, msg.sender, startingPrice, true);
    }

    // 出价（拍卖）
    function bid(uint256 tokenId) external payable nonReentrant {
        Listing storage listing = listings[tokenId];
        require(listing.isAuction, "Not an auction");
        require(block.timestamp < listing.auctionEndTime, "Auction ended");
        require(msg.value > listing.highestBid, "Bid too low");
        // 退回前一个最高出价
        if (listing.highestBidder != address(0)) {
            payable(listing.highestBidder).transfer(listing.highestBid);
        }
        listing.highestBidder = msg.sender;
        listing.highestBid = msg.value;
    }

    // 结束拍卖
    function endAuction(uint256 tokenId) external nonReentrant {
        Listing storage listing = listings[tokenId];
        require(block.timestamp >= listing.auctionEndTime, "Auction ongoing");
        require(msg.sender == listing.seller, "Not seller");
        if (listing.highestBidder != address(0)) {
            nftContract.safeTransferFrom(listing.seller, listing.highestBidder, tokenId);
            payable(listing.seller).transfer(listing.highestBid);
            emit AuctionEnded(tokenId, listing.highestBidder, listing.highestBid);
        }
        delete listings[tokenId];
    }
}
