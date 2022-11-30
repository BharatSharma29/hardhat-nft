const { network } = require("hardhat");
const {developmentChains, networkConfig} = require("../helper-hardhat-config");
const { verify } = require("../utils/verify");
const fs = require("fs");

module.exports = async function ({ getNamedAccounts, deployments }) {
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();

    const chainId = network.config.chainId;
    let ethUsdPriceFeedAddress;

    if(developmentChains.includes(network.name)){
        const EthUsdAggregator = await ethers.getContract("MockV3Aggregator");
        ethUsdPriceFeedAddress = EthUsdAggregator.address;
    }else{
        ethUsdPriceFeedAddress = networkConfig[chainId].ethUsdPriceFeed;
    }

    log("-------------------02-DynamicSVG-Starts-------------------");

    const lowSvg = await fs.readFileSync("./images/dynamicNft/frown.svg", {encoding: "utf8"});
    const highSvg = await fs.readFileSync("./images/dynamicNft/happy.svg", {encoding: "utf8"});

    const args = [ethUsdPriceFeedAddress, lowSvg, highSvg];

    const dynamicSvgNft = await deploy("DynamicSvgNft", {
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    });

    if(!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY){
        log("Verifying...");
        await verify(dynamicSvgNft.address, args);
    }

    log("--------------------02-DynamicSVG-Ends--------------------");
}

module.exports.tags = ["all", "dynamicsvg", "main"];