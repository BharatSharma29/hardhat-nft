const {assert, expect} = require("chai");
const {developmentChains} = require("../../helper-hardhat-config");
const {getNamedAccounts, deployments, network, ethers} = require("hardhat");

!developmentChains.includes(network.name)? describe.skip : describe("RandomIpfsNft Unit test", function() {
    let deployer, randomNft;
    const chaiId = network.config.chaiId;
    
    beforeEach(async function() {
        deployer = (await getNamedAccounts()).deployer;
        await deployments.fixture(["all"]);
        randomNft = await ethers.getContract("RandomIpfsNft", deployer);
        vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock");
        const subscriptionId = await randomNft.getSubscriptionId();
        await vrfCoordinatorV2Mock.addConsumer(subscriptionId, randomNft.address);
    });

    describe("constructor", function() {
        it("Initializes the RandomNft correctly", async function(){
            const dogTokenUri = await randomNft.getDogTokenUris(0);
            assert(dogTokenUri.includes("ipfs://"));
        });
    });

    describe("requestNft", function() {
        it("Get's reverted if no amount is send", async function() {
            await expect(randomNft.requestNft()).to.be.revertedWith("RandomIpfsNft__NotEnoughEThSent");
        });

        it("Get's reverted if not enough Eth is send", async function() {
            const senderFee = await randomNft.getMintFee();
            await expect(randomNft.requestNft({value: senderFee.sub(ethers.utils.parseEther("0.005"))})).to.be.revertedWith("RandomIpfsNft__NotEnoughEThSent");
        });

        it("emits an event and calls requestRandomWords", async function() {
            const senderFee = await randomNft.getMintFee();
            await expect(randomNft.requestNft({value: senderFee})).to.emit(randomNft, "NftRequested");
        });
    });

    describe("fulfillRandomWords", function() {
        it("can only be called after requestNft", async function() {
            await expect(vrfCoordinatorV2Mock.fulfillRandomWords(0, randomNft.address)).to.be.revertedWith("nonexistent request");
            await expect(vrfCoordinatorV2Mock.fulfillRandomWords(1, randomNft.address)).to.be.revertedWith("nonexistent request");
        });

        it("It mint's NFT after random number is returned", async function() {
            await new Promise(async (resolve,  reject) => {
                randomNft.once("NftMinted", async () => {
                    try {
                        const dogTokenUri = await randomNft.getDogTokenUris(0);
                        const dogTokenCounter = await randomNft.getDogTokenCounter();
                        assert(dogTokenUri.includes("ipfs://"));
                        assert.equal(dogTokenCounter.toString(), "1");
                        resolve();
                    } catch (error) {
                        console.log(error);
                        reject(error);
                    }
                });

                const senderFee = await randomNft.getMintFee();
                const tx = await randomNft.requestNft({value: senderFee});
                const txReceipt = await tx.wait(1);
                await vrfCoordinatorV2Mock.fulfillRandomWords(txReceipt.events[1].args.requestId, randomNft.address);
               
            });
        });
    });

    describe("getBreedFromModdedRng", function() {
        it("should return pug for moddedRng < 10", async function() {
            const dog = await randomNft.getBreedFromModdedRng(7);
            assert.equal(0, dog);
        });

        it("should return shiba-inu for moddedRng between 10-39", async function() {
            const dog = await randomNft.getBreedFromModdedRng(17);
            assert.equal(1, dog);
        });

        it("should return st. bernard for moddedRng between 40-99", async function() {
            const dog = await randomNft.getBreedFromModdedRng(70);
            assert.equal(2, dog);
        });
    });
});