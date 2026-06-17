// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../contracts/PaymentSplitter.sol";
import "../contracts/Escrow.sol";

contract DeployPayments is Script {
    function run() external {
        // Load your private key from .env
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

        vm.startBroadcast(deployerPrivateKey);

        // Deploy PaymentSplitter
        PaymentSplitter splitter = new PaymentSplitter();

        // Deploy Escrow
        Escrow escrow = new Escrow();

        vm.stopBroadcast();
    }
}

