const { assert, expect } = require("chai");
const { developmentChains } = require("../../helper-hardhat-config");
const {
    /* getNamedAccounts ,*/ deployments,
    network,
    ethers,
} = require("hardhat");

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("BasicNft unit tests", function () {
          let basicNft, deployer;

          beforeEach(async function () {
              //deployer = (await getNamedAccounts()).deployer;
              accounts = await ethers.getSigners();
              deployer = accounts[0];
              await deployments.fixture(["all"]);
              basicNft = await ethers.getContract("BasicNft");
          });

          describe("constructor", function () {
              it("Initialise NFT correctly", async function () {
                  const name = await basicNft.name();
                  const symbol = await basicNft.symbol();
                  const tokenCounter = await basicNft.getTokenCounter();
                  assert.equal(name, "Dogie");
                  assert.equal(symbol, "DOG");
                  assert.equal(tokenCounter.toString(), "0");
              });
          });
          describe("Mint NFT", function () {
              beforeEach(async function () {
                  const txResponse = await basicNft.mintNft();
                  await txResponse.wait(1);
              });

              it("Mint's NFT and updates appropriately", async function () {
                  const tokenUri = await basicNft.tokenURI(0);
                  const tokenCounter = await basicNft.getTokenCounter();

                  assert.equal(tokenCounter.toString(), "1");
                  assert.equal(tokenUri.toString(), await basicNft.TOKEN_URI());
              });

              it("Have correct balance and owner of NFT", async function () {
                  const owner = await basicNft.ownerOf("0");
                  const deployerAddress = deployer.address;
                  const deployerBalance = await basicNft.balanceOf(
                      deployerAddress
                  );

                  assert.equal(deployerBalance.toString(), "1");
                  assert.equal(owner, deployerAddress);
              });
          });
      });
