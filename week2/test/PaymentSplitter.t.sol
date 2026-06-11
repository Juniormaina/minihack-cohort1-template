// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../contracts/PaymentSplitter.sol";
import "../contracts/MockUSDC.sol";

contract PaymentSplitterTest is Test {
    PaymentSplitter public splitter;
    MockUSDC public token;
    address public payer = makeAddr("payer");
    address public recipientA = makeAddr("recipientA");
    address public recipientB = makeAddr("recipientB");

    function setUp() public {
        splitter = new PaymentSplitter();
        token = new MockUSDC();
        token.mint(payer, 1_000_000 * 10 ** 6);
    }

    function test_SplitPayment_70_30() public {
        uint256 amountA = 70 * 10 ** 6;
        uint256 amountB = 30 * 10 ** 6;
        vm.startPrank(payer);
        token.approve(address(splitter), amountA + amountB);
        splitter.splitPayment(address(token), recipientA, recipientB, amountA, amountB);
        vm.stopPrank();
        assertEq(token.balanceOf(recipientA), amountA);
        assertEq(token.balanceOf(recipientB), amountB);
    }

    function test_SplitPayment_EmitsEvent() public {
        vm.startPrank(payer);
        token.approve(address(splitter), 100 * 10 ** 6);
        vm.expectEmit(true, true, true, true);
        emit PaymentSplitter.PaymentSplit(address(token), payer, recipientA, recipientB, 70 * 10 ** 6, 30 * 10 ** 6);
        splitter.splitPayment(address(token), recipientA, recipientB, 70 * 10 ** 6, 30 * 10 ** 6);
        vm.stopPrank();
    }

    function test_RevertWhen_NoApproval() public {
        vm.prank(payer);
        vm.expectRevert();
        splitter.splitPayment(address(token), recipientA, recipientB, 50e6, 50e6);
    }

    function test_RevertWhen_ZeroAmounts() public {
        vm.prank(payer);
        vm.expectRevert("PaymentSplitter: zero amounts");
        splitter.splitPayment(address(token), recipientA, recipientB, 0, 0);
    }
}
