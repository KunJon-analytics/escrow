require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
  solidity: "0.8.17",
  networks: {
    goerli: {
      url: process.env.ALCHEMY_TESTNET_RPC_URL,
      accounts: [process.env.TESTNET_PRIVATE_KEY],
    },
  },
  paths: {
    artifacts: "./app/src/artifacts",
  },
};
