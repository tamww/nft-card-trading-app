require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.20",
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      mining: {
        auto: true,
        interval: [10000, 15000],
        mempool: {
          order: "priority"
        }
      },
      // fork:"merge"
      gasPrice:"auto",
      gasMultiplier:3,
      // hardfork:"shanghai",
      // loggingEnabled:true
    }
  },
};
