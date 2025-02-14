const { ethers } = require("hardhat");
const { expect } = require("chai");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");

describe("PokemonCard & PokemonMarketplace Test Case", function () {
  let owner, admin, user1, user2;
  let PokemonCard, PokemonMarketplace;
  let pokemonCard, pokemonMarketplace;
  let PokeAuctionContractFactory, PokeAuctionAddr
  let PokeMetadataContractFactory, PokeMetadataContractAddr
  // 1.jpg
  const CID_1 = ["bafkreidav26rjxft3o23zdpgaqskh3prpuqbqiwps56eacfzej7lnrhgje",
      "bafybeigywuua7rqcqitqahb3shvnogyau25pnu7pq3luq3gpmeprybiqye"]
  // 2.jpg
  const CID_2 = ["bafkreiezoni2wcimis3sroijaghzswfo57cefvjei5m4qmupbnoqe5f3gy",
      "bafybeic7b6dyjuvjvvb6v2lkwny2a6penuus2fhhviyksai32fhcomld2e"]
  // 3.jpg
  const CID_3 = ["bafkreidtoxzzfjriz5gt7trfe6m7pcmhyqu5fjorvvlxyldoelni2yaxg4",
      "bafybeifikmiue25spqy4sbvb3fh56xz4eicto5236heyhwrpgfayzfm5dm"]
  // 4.jpg
  const CID_4 = ["bafkreiey3ybv4ifeaxf2tmn3u3nowxezn4mzfxfdohc2hvh5n5d5fwwwgm",
      "bafybeia3pphj277spnl5jhdy4oa6bzkfsctpc5xrxoaz2fzjyqx6tmju2e"] 
  // 5.jpg
  const CID_5 = ["bafkreihdzkn6zgq3hpsqcojkmx5jcpq33tfltbgrvbcsjlrq26leizjtue",
      "bafybeigfztaqqutt2dgj2e76xmvoljpyvnh4immv7yyjtw3zfofj3xdphi"]
  // 6.jpg
  const CID_6 = ["bafkreihhem5jcvwwuw267lvfejl6xmhvm4f5vvzpic75vtxnntheda2uoe",
      "bafybeih243c34x72v3jxlz56vysp52ujv6yba2uneifcjdpyltany2mk2y"] 

  // retrieve testing accounts before start testing
  before(async () => {
    [owner, admin, user1, user2, ...addrs] = await ethers.getSigners();
  });

  describe("Deployment", function () {
    it("Should deploy PokemonCard", async function () {
      const pokeMetadataContractFactory = await ethers.getContractFactory("PokemonCard");
      PokeMetadataContractFactory = pokeMetadataContractFactory
      const pokeMetadataContract = await pokeMetadataContractFactory.deploy("https://mybaseuri.com/",owner);
      // await pokemonCard.wait();
      pokemonCard = pokeMetadataContract
      // check contract name and symbol
      expect(await pokemonCard.name()).to.equal("PokemonCard");
      expect(await pokemonCard.symbol()).to.equal("PKMN");
    });

    it("PokemonMarketplace connect PokemonCard", async function () {
      const pokeAuctionContractFactory = await ethers.getContractFactory("PokemonMarketplace");
      PokeAuctionContractFactory = pokeAuctionContractFactory;
      const pokeMetadataContractAddr = await pokemonCard.getAddress();
      PokeMetadataContractAddr = pokeMetadataContractAddr


      const pokeAuctionContract = await pokeAuctionContractFactory.deploy(pokeMetadataContractAddr, owner);
      // await pokemonMarketplace.wait();
      pokemonMarketplace = pokeAuctionContract
      const pokeAuctionAddr = await pokeAuctionContract.getAddress();
      PokeAuctionAddr = pokeAuctionAddr
      const tx = await pokemonCard.setAuctionAddr(pokeAuctionAddr);
      await tx.wait();

      expect(await pokemonCard.getCounter()).to.be.gt(0); 
    });
  });

  describe("Roles and Ownership", () => {
    it(" Owner can set admin in PokemonCard", async () => {
      // check if owner is the default admin
      let isOwnerAdmin = await pokemonCard.isAdmin(owner.address);
      expect(isOwnerAdmin).to.be.true;

      // admin not have Admin rights
      let isAdmin = await pokemonCard.isAdmin(admin.address);
      expect(isAdmin).to.be.false;

      // Owner use setAdmin to set admin as the system administrator
      await pokemonCard.connect(owner).setAdmin(admin.address);

      // double check if admin become the administrator now
      isAdmin = await pokemonCard.isAdmin(admin.address);
      expect(isAdmin).to.be.true;
    });
  });

  describe("(Mint) and  (Burn)", () => {
    it("PokemonCard Mint", async () => {
      // user1 mint a token
      await pokemonCard.connect(user1).mint(CID_1[0], CID_1[1]);
      // get the latest tokenId valued
      const currentCounter = await pokemonCard.getCounter();

      // check if user1 own 1 token
      const balanceUser1 = await pokemonCard.balanceOf(user1.address);
      expect(balanceUser1).to.equal(1);

      // acquire the data of pokemon nft card just minted
      const cardData = await pokemonCard.getACard(currentCounter);
      expect(cardData.owner).to.equal(user1.address);
      expect(cardData.isOnSale).to.equal(false);
    });

    it("Admin or Owner can set pause", async () => {
      // Owner stops the contract
      await pokemonCard.connect(owner).setPause(true);

      // user1 will faill if try to mint while pause
      await expect(
        pokemonCard.connect(user1).mint(CID_2[0], CID_2[1])
      ).to.be.revertedWith("Market paused.");

      // 再把合约恢复
      await pokemonCard.connect(owner).setPause(false);
    });

    it("marketplace Burn", async () => {
      // user1 has already mint a NFT，the tokenId = currentCounter
      const tokenId = await pokemonCard.getCounter();
      await pokemonCard.connect(owner).setAuctionAddr(PokeAuctionAddr);
      // if user1 is the owner，marketplace contract will allow user 1 to burn the token
      // user1 does not use approval before, _isApprovedOrOwner(callerAddr) is used within contract to check the ownership
      await pokemonCard.connect(user1).burn(tokenId, user1.address);

      // verify if token is burned
      const isBurned = await pokemonCard.checkBurned(tokenId);
      expect(isBurned).to.equal(true);

      // verify the burned coin has owner address of 0x0000
      const newOwner = await pokemonCard.getOwner(tokenId);
      expect(newOwner).to.equal(ethers.ZeroAddress);
    });
  });

  describe("Fixed price buy and Dutch Auction", () => {
    let user1TokenId;

    // user1 mint a new nft token for later testing
    before(async () => {
      await pokemonCard.connect(user1).mint(CID_3[0], CID_3[1]);
      user1TokenId = await pokemonCard.getCounter();
    });

    it(" token -- Dutch Auction", async () => {
      const initialPrice = 10; //  10 ETH，will convert to 10 * 10^18 WEI inside the contract
      const endPrice = 1; 
      const durationHours = 24; 
      await pokemonCard.connect(user1).setApprovalForAll(PokeAuctionAddr, true);

      await pokemonMarketplace.connect(user1).listItem(
        user1TokenId,
        1,               // SaleType.DutchAuction
        initialPrice,    // 10
        endPrice,        // 1
        durationHours    // 24
      );

      const listing = await pokemonMarketplace.getATrade(user1TokenId);
      expect(listing.isActive).to.be.true;
      expect(listing.seller).to.equal(user1);
      expect(listing.saleType).to.equal(1);  // 1 => DutchAuction
    });

    it("Wrong owner", async () => {
      // user2 try to list the nft of user1
      await expect(
        pokemonMarketplace.connect(user2).listItem(user1TokenId, 1, 5, 2, 10)
      ).to.be.revertedWith("Wrong owner or token be burned");
    });

    it("Dutch Auction Buyer", async () => {
      // user1TokenId token is still open for trade
      const listing = await pokemonMarketplace.getATrade(user1TokenId);
      expect(listing.isActive).to.be.true;

      // the contract function calculatePrice() will reply the current dutch auction price
      const priceNow = await pokemonMarketplace.calculatePrice(user1TokenId);

      //  user2 will buy at the latest price
      await expect(
        pokemonMarketplace.connect(user2).executePurchase(user1TokenId, {
          value: priceNow,
        })
      )
        .to.emit(pokemonMarketplace, "TokenSold")
        .withArgs(
          user1TokenId,
          user1.address,
          user2.address,
          anyValue,
          anyValue,
          1
        );

      // after purchased, the listing object will be inactive
      const updatedListing = await pokemonMarketplace.getATrade(user1TokenId);
      expect(updatedListing.isActive).to.be.false;

      // PokemonCard's ownership will change accordingly
      const newOwner = await pokemonCard.getOwner(user1TokenId);
      expect(newOwner).to.equal(user2);
    });

    it("Withdraw", async () => {
      // user1 will have pendingWithdraw after sold the token
      const pendingBefore = await pokemonMarketplace.pendingWithdraw(user1);
      expect(pendingBefore).to.be.gt(0);

      // current pending to withdraw balance of user1
      const beforeBalance = await ethers.provider.getBalance(user1);

      // user1 use safeWithdraw to withdraw all the money pending in contract
      await pokemonMarketplace.connect(user1).safeWithdraw();

      // check the remain balance again
      const afterBalance = await ethers.provider.getBalance(user1);
      const pendingAfter = await pokemonMarketplace.pendingWithdraw(user1);

      // pendingAfter shall have value of 0
      expect(pendingAfter).to.equal(0);

      // afterBalance shall larger than beforeBalance，might not be equal given to loss for gas fee
      expect(afterBalance).to.be.gt(beforeBalance);
    });
  });

  describe("Fixed price", () => {
    let user1FixedToken;

    before(async () => {
      // user1 mint another token with fixed price
      await pokemonCard.connect(user1).mint(CID_4[0], CID_4[1]);
      user1FixedToken = await pokemonCard.getCounter();

    });

    it("Should allow a fixed price listing", async () => {
      const price = 5; // 5 ETH

      await pokemonMarketplace.connect(user1).listItem(
        user1FixedToken,
        2, // FixedPrice
        price,
        price,  // same as startPrice
        12      // last for 12 hours
      );

      const listing = await pokemonMarketplace.getATrade(user1FixedToken);
      expect(listing.isActive).to.be.true;
      expect(listing.saleType).to.equal(2); // 2 => FixedPrice
    });

    it("Should revert listing if startPrice != endPrice for fixed price", async () => {
      await pokemonCard.connect(user1).mint(CID_4[0], CID_4[1]);
      const user1FixedTokenTemp = await pokemonCard.getCounter();
      await expect(
        pokemonMarketplace.connect(user1).listItem(
          user1FixedTokenTemp,
          2,  // FixedPrice
          6,
          7,  // not equal price as the start price
          12
        )
      ).to.be.revertedWith("two price shall be equal for fixed price trade"); 
    });

    it("Buy fixed price NFT", async () => {
      // check current price calculated by the contract
      const priceNow = await pokemonMarketplace.calculatePrice(user1FixedToken);

      // user2 purchase with priceNow
      await pokemonMarketplace.connect(user2).executePurchase(user1FixedToken, {
        value: priceNow,
      });

      // check the status of listing
      const updatedListing = await pokemonMarketplace.getATrade(user1FixedToken);
      expect(updatedListing.isActive).to.be.false;

      // check for new owner
      const newOwner = await pokemonCard.getOwner(user1FixedToken);
      expect(newOwner).to.equal(user2.address);
    });
  });

  describe("Cancel", () => {
    let cancelTokenId;

    before(async () => {
      // user1 mint another token
      await pokemonCard.connect(user1).mint(CID_5[0], CID_5[1]);
      cancelTokenId = await pokemonCard.getCounter();

      await pokemonMarketplace.connect(user1).listItem(
        cancelTokenId,
        2, // FixedPrice
        2, // 2 ETH
        2, // 2 ETH
        5  // 5 hrs
      );
    });

    it("Should allow seller to cancel a listing", async () => {
      let listing = await pokemonMarketplace.getATrade(cancelTokenId);
      expect(listing.isActive).to.equal(true);

      // cancel the listing
      await pokemonMarketplace.connect(user1).cancelListing(cancelTokenId);

      listing = await pokemonMarketplace.getATrade(cancelTokenId);
      expect(listing.isActive).to.equal(false);

      // check is listing will ongoing, which shall be false
      const isOngoing = await pokemonMarketplace.isTradeOngoing(cancelTokenId);
      expect(isOngoing).to.equal(false);

      // PokemonCard will return false for isOnSale
      const card = await pokemonCard.getACard(cancelTokenId);
      expect(card.isOnSale).to.equal(false);
    });

    it("Should revert if non-owner tries to cancel", async () => {
      // user1 list the token again
      await pokemonMarketplace.connect(user1).listItem(
        cancelTokenId,
        2, 
        2,
        2,
        5
      );

      // user2 could not cancel it as wrong ownership
      await expect(
        pokemonMarketplace.connect(user2).cancelListing(cancelTokenId)
      ).to.be.revertedWith('Not seller');
    });
  });
});
