require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.20",
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      mining: {
        auto: true,
        interval: 5000,
        mempool: {
          order: "fifo"
        }
      },
      // chainId: 1339,
      fork:"merge",
      // hardfork:"shanghai",
      loggingEnabled:true
    }
  },
};
