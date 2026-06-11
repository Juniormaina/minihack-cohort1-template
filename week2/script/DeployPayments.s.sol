// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../contracts/PaymentSplitter.sol";
import "../contracts/Escrow.sol";
import "../contracts/MockUSDC.sol";

/// @notice Deploy Week 2 contracts to Fuji
/// @dev source .env && forge script script/DeployPayments.s.sol:DeployPayments --rpc-url $FUJI_RPC_URL --private-key $PRIVATE_KEY --broadcast -vvvv
contract DeployPayments is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        console.log("Deploying with:", deployer);
        vm.startBroadcast(deployerPrivateKey);
        MockUSDC musdc = new MockUSDC();
        PaymentSplitter splitter = new PaymentSplitter();
        Escrow escrow = new Escrow();
        vm.stopBroadcast();
        console.log("MockUSDC:       ", address(musdc));
        console.log("PaymentSplitter:", address(splitter));
        console.log("Escrow:         ", address(escrow));
    }
}
