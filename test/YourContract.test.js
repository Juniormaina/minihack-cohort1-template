const { expect } = require("chai");
const { ethers } = require("hardhat");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");

// Run tests: npx hardhat test
// Run tests with gas report: REPORT_GAS=true npx hardhat test

describe("YourContract", function () {
  let contract;
  let owner;
  let addr1;
  let addr2;

  // Deploy a fresh instance before each test
  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();

    const Contract = await ethers.getContractFactory("YourContract");
    contract = await Contract.deploy();
    await contract.waitForDeployment();
  });

  describe("Deployment", function () {
    it("should set the deployer as the owner", async function () {
      expect(await contract.owner()).to.equal(owner.address);
    });

    it("should emit a Deployed event with the correct owner and timestamp", async function () {
      const Contract = await ethers.getContractFactory("YourContract");
      const newContract = await Contract.deploy();

      await expect(newContract.deployTransaction)
        .to.emit(newContract, "Deployed")
        .withArgs(owner.address, anyValue);
    });
  });

  // Add your own tests below.
  //
  // For an ERC-20 token (Week 2), your tests should cover:
  //   - Initial supply is minted to the correct address
  //   - Transfer moves the correct amount between accounts
  //   - Transfer fails when sender has insufficient balance
  //   - Approve and transferFrom work correctly
  //   - Minting increases total supply (if your token has a mint function)
  //
  // Example structure:
  //
  // describe("Token transfers", function () {
  //   it("should transfer tokens between accounts", async function () {
  //     await contract.transfer(addr1.address, 100);
  //     expect(await contract.balanceOf(addr1.address)).to.equal(100);
  //   });
  //
  //   it("should fail if sender does not have enough tokens", async function () {
  //     await expect(
  //       contract.connect(addr1).transfer(addr2.address, 1)
  //     ).to.be.revertedWith("ERC20: transfer amount exceeds balance");
  //   });
  // });
});
