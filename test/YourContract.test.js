<<<<<<< HEAD
const { expect } = require("chai");
const { ethers } = require("hardhat");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");

describe("PaymentBridge", function () {
  let bridge;
  let token;
  let owner;
  let addr1;
  let addr2;

  const initialSupply = ethers.parseUnits("1000000", 6);

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();

    const Token = await ethers.getContractFactory("MockERC20");
    token = await Token.deploy("Test USDC", "tUSDC", initialSupply);
    await token.waitForDeployment();

    const Bridge = await ethers.getContractFactory("PaymentBridge");
    bridge = await Bridge.deploy(await token.getAddress());
    await bridge.waitForDeployment();
  });

<<<<<<< HEAD
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
=======
  it("should set deployer as owner and store payment token", async function () {
    expect(await bridge.owner()).to.equal(owner.address);
    expect(await bridge.paymentToken()).to.equal(await token.getAddress());
>>>>>>> 6946d67 (Updates from Junior)
  });

  it("should accept token payments with allowance", async function () {
    const paymentAmount = ethers.parseUnits("100", 6);
    await token.transfer(addr1.address, paymentAmount);
    await token.connect(addr1).approve(await bridge.getAddress(), paymentAmount);

    await expect(bridge.connect(addr1).payWithToken(paymentAmount, "invoice-001"))
      .to.emit(bridge, "TokenPayment")
      .withArgs(addr1.address, paymentAmount, "invoice-001", await ethers.provider.getBlock("latest").then(b => b.timestamp));

    expect(await token.balanceOf(await bridge.getAddress())).to.equal(paymentAmount);
  });

  it("should record M-Pesa payments only by owner", async function () {
    await expect(bridge.recordMpesaPayment("+254712345678", ethers.parseUnits("500", 6), "mpesa-ref-001"))
      .to.emit(bridge, "MpesaPaymentRecorded")
      .withArgs(owner.address, "+254712345678", ethers.parseUnits("500", 6), "mpesa-ref-001", await ethers.provider.getBlock("latest").then(b => b.timestamp));

    expect(await bridge.mpesaCount()).to.equal(1);
    const payment = await bridge.mpesaPayments(0);
    expect(payment.phone).to.equal("+254712345678");
    expect(payment.reference).to.equal("mpesa-ref-001");
  });

  it("should reject duplicate M-Pesa references", async function () {
    await bridge.recordMpesaPayment("+254712345678", ethers.parseUnits("200", 6), "mpesa-ref-002");

    await expect(
      bridge.recordMpesaPayment("+254712345678", ethers.parseUnits("200", 6), "mpesa-ref-002")
    ).to.be.revertedWith("PaymentBridge: reference already used");
  });

  it("should allow owner to withdraw tokens", async function () {
    const paymentAmount = ethers.parseUnits("150", 6);
    await token.transfer(addr1.address, paymentAmount);
    await token.connect(addr1).approve(await bridge.getAddress(), paymentAmount);
    await bridge.connect(addr1).payWithToken(paymentAmount, "invoice-002");

    await bridge.withdrawTokens(addr2.address, paymentAmount);
    expect(await token.balanceOf(addr2.address)).to.equal(paymentAmount);
  });
});
=======
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("PaymentBridge", function () {
  let bridge;
  let token;
  let owner;
  let addr1;
  let addr2;

  const initialSupply = ethers.parseUnits("1000000", 6);

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();

    const Token = await ethers.getContractFactory("MockERC20");
    token = await Token.deploy("Test USDC", "tUSDC", initialSupply);
    await token.waitForDeployment();

    const Bridge = await ethers.getContractFactory("PaymentBridge");
    bridge = await Bridge.deploy(await token.getAddress());
    await bridge.waitForDeployment();
  });

  it("should set deployer as owner and store payment token", async function () {
    expect(await bridge.owner()).to.equal(owner.address);
    expect(await bridge.paymentToken()).to.equal(await token.getAddress());
  });

  it("should accept token payments with allowance", async function () {
    const paymentAmount = ethers.parseUnits("100", 6);
    await token.transfer(addr1.address, paymentAmount);
    await token.connect(addr1).approve(await bridge.getAddress(), paymentAmount);

    await expect(bridge.connect(addr1).payWithToken(paymentAmount, "invoice-001"))
      .to.emit(bridge, "TokenPayment")
      .withArgs(addr1.address, paymentAmount, "invoice-001", await ethers.provider.getBlock("latest").then(b => b.timestamp));

    expect(await token.balanceOf(await bridge.getAddress())).to.equal(paymentAmount);
  });

  it("should record M-Pesa payments only by owner", async function () {
    await expect(bridge.recordMpesaPayment("+254712345678", ethers.parseUnits("500", 6), "mpesa-ref-001"))
      .to.emit(bridge, "MpesaPaymentRecorded")
      .withArgs(owner.address, "+254712345678", ethers.parseUnits("500", 6), "mpesa-ref-001", await ethers.provider.getBlock("latest").then(b => b.timestamp));

    expect(await bridge.mpesaCount()).to.equal(1);
    const payment = await bridge.mpesaPayments(0);
    expect(payment.phone).to.equal("+254712345678");
    expect(payment.reference).to.equal("mpesa-ref-001");
  });

  it("should reject duplicate M-Pesa references", async function () {
    await bridge.recordMpesaPayment("+254712345678", ethers.parseUnits("200", 6), "mpesa-ref-002");

    await expect(
      bridge.recordMpesaPayment("+254712345678", ethers.parseUnits("200", 6), "mpesa-ref-002")
    ).to.be.revertedWith("PaymentBridge: reference already used");
  });

  it("should allow owner to withdraw tokens", async function () {
    const paymentAmount = ethers.parseUnits("150", 6);
    await token.transfer(addr1.address, paymentAmount);
    await token.connect(addr1).approve(await bridge.getAddress(), paymentAmount);
    await bridge.connect(addr1).payWithToken(paymentAmount, "invoice-002");

    await bridge.withdrawTokens(addr2.address, paymentAmount);
    expect(await token.balanceOf(addr2.address)).to.equal(paymentAmount);
  });
});
>>>>>>> 1a2fcda (Kuzana Hidden Champions)
