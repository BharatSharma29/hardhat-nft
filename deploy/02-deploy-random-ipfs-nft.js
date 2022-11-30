const { network } = require("hardhat");
const {developmentChains, networkConfig} = require("../helper-hardhat-config");
const { verify } = require("../utils/verify");
const {storeImages, storeTokenUriMetadata} = require("../utils/uploadToPinata");

const imagesLocation = "./images/randomNft";

const metadataTemplate = {
    name: "",
    description: "",
    image: "",
    attributes: [
        {
            trait_type: "Cuteness",
            value: 100,
        },
    ]
}

let tokenUris = [
    'ipfs://QmPsddgwx2s4HE5V9so61eSR3NfGgJMkHgpTRBw1jnmTrH',
    'ipfs://QmYzrvrN5pSqx19qXUCvJm4uau1rcpytPJGzzBkJQDdv82',
    'ipfs://QmPU6NzQQFJKWJ6MukigvnU4D2GWTvcTtSqQu1U735UNqV'
  ];

const FUND_AMOUNT = "1000000000000000000000" // 10 Link ethers.utils.parseEther("10");

module.exports = async function ({ getNamedAccounts, deployments }) {
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();
    const chainId = network.config.chainId;

    // get IPFS hashes of our images
    if(process.env.UPLOAD_TO_PINATA == "true"){
        tokenUris = await handleTokenUris();
    }
    // 1. With our own IPFS node. https://docs.ipfs.io/
    // 2. Pinata https://www.pinata.cloud/
    // 3. NFT.storage https://nft.storage/ 

    let vrfCoordinatorV2Address, subscriptionId;
    
    if(developmentChains.includes(network.name)){
        vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock");
        vrfCoordinatorV2Address = vrfCoordinatorV2Mock.address;
        const txResponse = await vrfCoordinatorV2Mock.createSubscription();
        const txReceipt = await txResponse.wait(1);
        subscriptionId = txReceipt.events[0].args.subId;
        await vrfCoordinatorV2Mock.fundSubscription(subscriptionId, FUND_AMOUNT);
    }else{
        vrfCoordinatorV2Address = networkConfig[chainId].vrfCoordinatorV2;
        subscriptionId = networkConfig[chainId].subscriptionId;
    }
    
    log("--------------------02-RandomIPFS-Start-------------------");

    const gasLane = networkConfig[chainId].gasLane;
    const callbackGasLimit = networkConfig[chainId].callbackGasLimit;
    const mintFee = networkConfig[chainId].mintFee;

    const args = [vrfCoordinatorV2Address, subscriptionId, gasLane, callbackGasLimit, tokenUris, mintFee];

    const randomIpfsNft = await deploy("RandomIpfsNft", {
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    });

    if(!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY){
        log("Verifying...");
        await verify(randomIpfsNft.address, args);
    }

    log("--------------------02-RandomIPFS-End---------------------");
}

async function handleTokenUris() {
    tokenUris = [];
    // store the Image in IPFS
    // store the metadata in IPFS
    const {responses: imageUploadResponses, files} = await storeImages(imagesLocation);
    for(imageUploadResponseIndex in imageUploadResponses){
        // create metadata
        // upload metadata
        let tokenUriMetadata = {...metadataTemplate};
        tokenUriMetadata.name = files[imageUploadResponseIndex].replace(".png", "");
        tokenUriMetadata.description = `An adorable ${tokenUriMetadata.name} pup`;
        tokenUriMetadata.image = `ipfs://${imageUploadResponses[imageUploadResponseIndex].IpfsHash}`;
        console.log(`Uploading ${tokenUriMetadata.name}...`);
        // store JASON to pinata / IPFS 
        const metadataUploadResponse = await storeTokenUriMetadata(tokenUriMetadata);
        tokenUris.push(`ipfs://${metadataUploadResponse.IpfsHash}`);
    } 
    console.log("Token URI's uploaded!");
    console.log("They are :");
    console.log(tokenUris);
    return tokenUris;
}

module.exports.tags = ["all", "randomipfs", "main"];