require("@nomiclabs/hardhat-waffle");
require("hardhat-gas-reporter");
require("@nomiclabs/hardhat-etherscan");
require("dotenv").config();
require("solidity-coverage");
require("hardhat-deploy");
// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more
/**
 * @type import('hardhat/config').HardhatUserConfig
 */

// const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY || "";
// const GOERLI_RPC_URL =
//   process.env.GOERLI_RPC_URL ||
//   "https://eth-mainnet.alchemyapi.io/v2/your-api-key";
// const PRIVATE_KEY =
//   process.env.PRIVATE_KEY ||
//   "0x11ee3108a03081fe260ecdc106554d09d9d1209bcafd46942b10e02943effc4a";
// const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "";

const GOERLI_RPC_URL = process.env.GOERLI_RPC_URL;
const GOERLI_PRIVATE_KEY = process.env.GOERLI_PRIVATE_KEY;

module.exports = {
    solidity: {
        compilers: [{ version: "0.8.8" }, { version: "0.6.6" }],
    },
    defaultNetwork: "hardhat",
    networks: {
        hardhat: {
            chainId: 31337,
            // gasPrice: 130000000000,
        },
        ropsten: {
            url: process.env.ROPSTEN_URL || "",
            accounts: [],
        },
        goerli: {
            url: GOERLI_RPC_URL,
            accounts: [GOERLI_PRIVATE_KEY],
            chainId: 5,
            blockConfirmations: 6,
        },
    },

    etherscan: {
        apiKey: process.env.ETHERSCAN_API_KEY,
    },
    gasReporter: {
        enabled: false,
        currency: "USD",
        //outputFile: "gas-report.txt",
        noColors: true,
        coinmarketcap: process.env.COINMARKETCAP_API_KEY,
    },
    namedAccounts: {
        deployer: {
            default: 0, // here this will by default take the first account as deployer
            //31337: 0, // similarly on mainnet it will take the first account as deployer. Note though that depending on how hardhat network are configured, the account 0 on one network can be different than on another
        },
        user: {
            default: 1,
        },
    },
    mocha: {
        timeout: 1000000,
    },
};

// require("@nomicfoundation/hardhat-toolbox");
// require("hardhat-deploy");
// require("@nomiclabs/hardhat-etherscan");
// require("@nomiclabs/hardhat-waffle");
// require("hardhat-gas-reporter");
// require("solidity-coverage");
// require("dotenv").config();
// require("@nomiclabs/hardhat-ethers");

// /** @type import('hardhat/config').HardhatUserConfig */
// module.exports = {
//   solidity: "0.8.8",

//   networks: {
//     defaultNetwork: "hardhat",
//   },
//   gasReporter: {
//     enabled: process.env.REPORT_GAS !== undefined,
//     currency: "USD",
//   },
// };
