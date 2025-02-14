const { ethers } = require("hardhat");

describe("PokemonCard & PokemonMarketplace Test Case", function () {
  let owner, admin, user1, user2;
  let PokemonCard, PokemonMarketplace;
  let pokemonCard, pokemonMarketplace;

  // 在所有测试开始前，拿到测试用的地址
  before(async () => {
    [owner, admin, user1, user2, ...addrs] = await ethers.getSigners();
  });

  describe("Deployment", function () {
    it("Should deploy PokemonCard", async function () {
      PokemonCard = await ethers.getContractFactory("PokemonCard");
      pokemonCard = await PokemonCard.deploy("https://mybaseuri.com/");
      await pokemonCard.deployed();

      // 简单检查一下合约名和符号
      expect(await pokemonCard.name()).to.equal("PokemonCard");
      expect(await pokemonCard.symbol()).to.equal("PKMN");
    });

    it("PokemonMarketplace connect PokemonCard", async function () {
      const Marketplace = await ethers.getContractFactory("PokemonMarketplace");
      pokemonMarketplace = await Marketplace.deploy(pokemonCard.address);
      await pokemonMarketplace.deployed();

      const tx = await pokemonCard.setAuctionAddr(pokemonMarketplace.address);
      await tx.wait();

      expect(await pokemonCard.getCounter()).to.be.gt(0); 
    });
  });

  describe("Roles and Ownership", () => {
    it(" Owner can set admin in PokemonCard", async () => {
      // 检查 owner 是否是默认管理员
      let isOwnerAdmin = await pokemonCard.isAdmin(owner.address);
      expect(isOwnerAdmin).to.be.true;

      // admin 尚未拥有 Admin 权限
      let isAdmin = await pokemonCard.isAdmin(admin.address);
      expect(isAdmin).to.be.false;

      // Owner 调用 setAdmin，把 admin 地址设为管理员
      await pokemonCard.connect(owner).setAdmin(admin.address);

      // 再查一次，看看 admin 是否已成为管理员
      isAdmin = await pokemonCard.isAdmin(admin.address);
      expect(isAdmin).to.be.true;
    });
  });

  describe("(Mint) and  (Burn)", () => {
    it("PokemonCard Mint", async () => {
      // user1 调用 mint
      await pokemonCard.connect(user1).mint("traitCID_1", "imageCID_1");
      // 取得当前最新 tokenId
      const currentCounter = await pokemonCard.getCounter();

      // 检查 user1 是否拥有 1 个 NFT
      const balanceUser1 = await pokemonCard.balanceOf(user1.address);
      expect(balanceUser1).to.equal(1);

      // 获取刚铸造的卡片信息
      const cardData = await pokemonCard.getACard(currentCounter);
      expect(cardData.owner).to.equal(user1.address);
      expect(cardData.isOnSale).to.equal(false);
    });

    it("Admin or Owner can set pause", async () => {
      // Owner 暂停合约
      await pokemonCard.connect(owner).setPause(true);

      // 再让 user1 尝试 mint，会失败
      await expect(
        pokemonCard.connect(user1).mint("traitCID_2", "imageCID_2")
      ).to.be.revertedWith("Market paused.");

      // 再把合约恢复
      await pokemonCard.connect(owner).setPause(false);
    });

    it("marketplace Burn", async () => {
      // user1 之前已经 mint 了一个 NFT，其 tokenId = currentCounter
      const tokenId = await pokemonCard.getCounter();
      await pokemonCard.connect(owner).setAuctionAddr(pokemonMarketplace.address);

      // 假设 user1 是拥有者，marketplace 会在合约内部判断后允许销毁
      // user1 没有单独调用 approve，但合约中用 _isApprovedOrOwner(callerAddr)
      // 所以这里直接用 marketplace.signer 来执行 burn
      await pokemonCard.connect(pokemonMarketplace.signer).burn(tokenId, user1.address);

      // 验证是否烧毁成功
      const isBurned = await pokemonCard.checkBurned(tokenId);
      expect(isBurned).to.equal(true);

      // 验证卡片的 owner 是否变为 0x000...
      const newOwner = await pokemonCard.getOwner(tokenId);
      expect(newOwner).to.equal(ethers.constants.AddressZero);
    });
  });

  describe("Fixed price buy and Dutch Auction", () => {
    let user1TokenId;

    // 先让 user1 铸造一个新的 NFT，用于后面做交易
    before(async () => {
      await pokemonCard.connect(user1).mint("traitCID_3", "imageCID_3");
      user1TokenId = await pokemonCard.getCounter();
    });

    it(" token -- Dutch Auction", async () => {
      const initialPrice = 10; // 表示 10 ETH，合约内部会转换成 10 * 10^18
      const endPrice = 1; 
      const durationHours = 24; 

      await pokemonMarketplace.connect(user1).listItem(
        user1TokenId,
        1,               // SaleType.DutchAuction
        initialPrice,    // 10
        endPrice,        // 1
        durationHours    // 24
      );

      const listing = await pokemonMarketplace.getATrade(user1TokenId);
      expect(listing.isActive).to.be.true;
      expect(listing.seller).to.equal(user1.address);
      expect(listing.saleType).to.equal(1);  // 1 => DutchAuction
    });

    it("Wrong owner", async () => {
      // user2 尝试上架 user1 的 NFT
      await expect(
        pokemonMarketplace.connect(user2).listItem(user1TokenId, 1, 5, 2, 10)
      ).to.be.revertedWith("Wrong owner or token be burned");
    });

    it("Dutch Auction Buyer", async () => {
      // 当前上架的还是 user1TokenId
      const listing = await pokemonMarketplace.getATrade(user1TokenId);
      expect(listing.isActive).to.be.true;

      // 合约里 calculatePrice() 返回当前荷兰拍卖的价格
      const priceNow = await pokemonMarketplace.calculatePrice(user1TokenId);

      // 让 user2 以此价格购买
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
          priceNow,
        );

      // 购买后 listing 应设置为不活跃
      const updatedListing = await pokemonMarketplace.getATrade(user1TokenId);
      expect(updatedListing.isActive).to.be.false;

      // PokemonCard 中的所有者也会改变
      const newOwner = await pokemonCard.getOwner(user1TokenId);
      expect(newOwner).to.equal(user2.address);
    });

    it("Withdraw", async () => {
      // user1卖NFT后，会有 pendingWithdraw
      const pendingBefore = await pokemonMarketplace.pendingWithdraw(user1.address);
      expect(pendingBefore).to.be.gt(0);

      // 获取 user1 的当前余额
      const beforeBalance = await ethers.provider.getBalance(user1.address);

      // 让 user1 调用 safeWithdraw 将 pending 的金额取走
      await pokemonMarketplace.connect(user1).safeWithdraw();

      // 再次获取余额
      const afterBalance = await ethers.provider.getBalance(user1.address);
      const pendingAfter = await pokemonMarketplace.pendingWithdraw(user1.address);

      // pendingAfter 应该是 0
      expect(pendingAfter).to.equal(0);

      // afterBalance 应该大于 beforeBalance，但要考虑 gas 消耗，所以只验证 > 即可
      expect(afterBalance).to.be.gt(beforeBalance);
    });
  });

  describe("Fixed price", () => {
    let user1FixedToken;

    before(async () => {
      // user1 再铸造一个用于一口价交易
      await pokemonCard.connect(user1).mint("traitCID_4", "imageCID_4");
      user1FixedToken = await pokemonCard.getCounter();
    });

    it("Should allow a fixed price listing", async () => {
      const price = 5; // 5 ETH

      await pokemonMarketplace.connect(user1).listItem(
        user1FixedToken,
        2, // FixedPrice
        price,
        price,  // 与 startPrice 相同
        12      // 持续时间 12 小时
      );

      const listing = await pokemonMarketplace.getATrade(user1FixedToken);
      expect(listing.isActive).to.be.true;
      expect(listing.saleType).to.equal(2); // 2 => FixedPrice
    });

    it("Should revert listing if startPrice != endPrice for fixed price", async () => {
      await expect(
        pokemonMarketplace.connect(user1).listItem(
          user1FixedToken,
          2,  // FixedPrice
          6,
          7,  // 不相等
          12
        )
      ).to.be.revertedWith("two price shall be equal for fixed price trade"); 
    });

    it("Buy fixed price NFT", async () => {
      // 查看合约中的当前价格
      const priceNow = await pokemonMarketplace.calculatePrice(user1FixedToken);

      // user2 直接发送 priceNow
      await pokemonMarketplace.connect(user2).executePurchase(user1FixedToken, {
        value: priceNow,
      });

      // 查看 listing 状态
      const updatedListing = await pokemonMarketplace.getATrade(user1FixedToken);
      expect(updatedListing.isActive).to.be.false;

      // 检查新的 owner
      const newOwner = await pokemonCard.getOwner(user1FixedToken);
      expect(newOwner).to.equal(user2.address);
    });
  });

  describe("Cancel", () => {
    let cancelTokenId;

    before(async () => {
      // user1 再铸造一个
      await pokemonCard.connect(user1).mint("traitCID_5", "imageCID_5");
      cancelTokenId = await pokemonCard.getCounter();

      await pokemonMarketplace.connect(user1).listItem(
        cancelTokenId,
        2, // FixedPrice
        2, // 2 ETH
        2, // 2 ETH
        5  // 5 小时
      );
    });

    it("Should allow seller to cancel a listing", async () => {
      let listing = await pokemonMarketplace.getATrade(cancelTokenId);
      expect(listing.isActive).to.equal(true);

      // 调用取消上架
      await pokemonMarketplace.connect(user1).cancelDutchAuction(cancelTokenId);

      listing = await pokemonMarketplace.getATrade(cancelTokenId);
      expect(listing.isActive).to.equal(false);

      // 检查该 listing 是否还处于有效期
      const isOngoing = await pokemonMarketplace.isTradeOngoing(cancelTokenId);
      expect(isOngoing).to.equal(false);

      // 在 PokemonCard 中卡片的 isOnSale 应该改回 false
      const card = await pokemonCard.getACard(cancelTokenId);
      expect(card.isOnSale).to.equal(false);
    });

    it("Should revert if non-owner tries to cancel", async () => {
      // 重新让 user1 上架一次
      await pokemonMarketplace.connect(user1).listItem(
        cancelTokenId,
        2, 
        2,
        2,
        5
      );

      // user2 尝试取消，应该失败
      await expect(
        pokemonMarketplace.connect(user2).cancelDutchAuction(cancelTokenId)
      ).to.be.revertedWith("Wrong owner or token be burned");
    });
  });
});
