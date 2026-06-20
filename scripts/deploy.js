const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  const paymentToken = process.env.PAYMENT_TOKEN || "0x0000000000000000000000000000000000000000";

  console.log("Deploying with account:", deployer.address);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "AVAX");

  if (balance === 0n) {
    console.error(
      "Error: account has no AVAX. Get testnet AVAX from https://core.app/tools/testnet-faucet"
    );
    process.exit(1);
  }

  if (paymentToken === "0x0000000000000000000000000000000000000000") {
    console.warn(
      "Warning: PAYMENT_TOKEN not set in .env. Deploying with zero address."
    );
  }

  const Contract = await ethers.getContractFactory("PaymentBridge");

  console.log("Deploying PaymentBridge...", paymentToken);
  const contract = await Contract.deploy(paymentToken);
  await contract.waitForDeployment();

  const address = await contract.getAddress();

  console.log("Contract deployed to:", address);
  console.log("Payment token:", paymentToken);
  console.log(
    "View on Snowtrace: https://testnet.snowtrace.io/address/" + address
  );
  console.log("");
  console.log("To verify on Snowtrace, run:");
  console.log(`npx hardhat verify --network fuji ${address} ${paymentToken}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
