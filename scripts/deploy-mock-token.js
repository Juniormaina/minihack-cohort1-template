const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying mock token with account:", deployer.address);

  const initialSupply = ethers.parseUnits("1000000", 6);
  const Token = await ethers.getContractFactory("MockERC20");
  const token = await Token.deploy("Test USDC", "tUSDC", initialSupply);
  await token.waitForDeployment();

  console.log("Mock token deployed to:", await token.getAddress());
  console.log("Token symbol:", await token.symbol());
  console.log("Token decimals:", await token.decimals());
  console.log("View on Snowtrace: https://testnet.snowtrace.io/address/" + await token.getAddress());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
