const {ethers, network} = require("hardhat");
const { developmentChains } = require("../helper-hardhat-config");

module.exports = async function({getNamedAccounts}) {
    const {deployer} = await getNamedAccounts();

    // Basic NFT
    const basicNft = await ethers.getContract("BasicNft", deployer);
    const basicNftTx = await basicNft.mintNft();
    await basicNftTx.wait(1);
    console.log(`Basic NFT index 0 Token URI: ${await basicNft.tokenURI(0)}`);

    // Random IPFS NFT
    const randomNft = await ethers.getContract("RandomIpfsNft", deployer);
    const mintFee = await randomNft.getMintFee();
    await new Promise(async (resolve, reject) => {
        setTimeout(() => reject("Timeout: 'NFTMinted' event did not fire"), 500000);
        randomNft.once("NftMinted", async function(){
            resolve();
        });
        // const randomNftTx = await randomNft.requestNft({value: mintFee});
        // const randomNftReceipt = await randomNftTx.wait(1);
        if(developmentChains.includes(network.name)){
            // const requestId = randomNftReceipt.events[1].args.requestId;
            const vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock", deployer);
            const subscriptionId = await randomNft.getSubscriptionId();
            await vrfCoordinatorV2Mock.addConsumer(subscriptionId, randomNft.address);
            const randomNftTx = await randomNft.requestNft({value: mintFee});
            const randomNftReceipt = await randomNftTx.wait(1);
            const requestId = randomNftReceipt.events[1].args.requestId;
            await vrfCoordinatorV2Mock.fulfillRandomWords(requestId, randomNft.address);
        }
    });
    console.log(`Random IPFS NFT index 0 Token URI: ${await randomNft.tokenURI(0)}`);

    // Dynamic SVG NFT
    const dynamicNft = await ethers.getContract("DynamicSvgNft", deployer);
    const highValue = await ethers.utils.parseEther("4000");
    const dynamicNftTx = await dynamicNft.mintNft(highValue);
    await dynamicNftTx.wait(1);
    console.log(`Dynamic SVG NFT index 0 Token URI: ${await dynamicNft.tokenURI(0)}`);
}

module.exports.tags = ["all", "mint"];