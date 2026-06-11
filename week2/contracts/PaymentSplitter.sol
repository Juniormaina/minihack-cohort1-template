// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/// @title PaymentSplitter
/// @notice Accepts an ERC-20 token and splits a payment between two
///         recipients in any ratio specified by the caller.
///
/// @dev The caller must approve this contract to spend (amountA + amountB)
///      of tokenA before calling splitPayment. The contract pulls the total
///      from the caller and distributes to the two recipients atomically.
contract PaymentSplitter {
    using SafeERC20 for IERC20;

    event PaymentSplit(
        address indexed token,
        address indexed payer,
        address indexed recipientA,
        address recipientB,
        uint256 amountA,
        uint256 amountB
    );

    /// @notice Split a payment between two recipients
    /// @param tokenA     The ERC-20 token address to split
    /// @param recipientA First recipient
    /// @param recipientB Second recipient
    /// @param amountA    Amount sent to recipientA
    /// @param amountB    Amount sent to recipientB
    function splitPayment(
        address tokenA,
        address recipientA,
        address recipientB,
        uint256 amountA,
        uint256 amountB
    ) external {
        require(tokenA != address(0), "PaymentSplitter: zero token address");
        require(recipientA != address(0), "PaymentSplitter: zero recipientA");
        require(recipientB != address(0), "PaymentSplitter: zero recipientB");
        require(amountA > 0 || amountB > 0, "PaymentSplitter: zero amounts");

        IERC20 token = IERC20(tokenA);
        uint256 total = amountA + amountB;

        token.safeTransferFrom(msg.sender, address(this), total);

        if (amountA > 0) token.safeTransfer(recipientA, amountA);
        if (amountB > 0) token.safeTransfer(recipientB, amountB);

        emit PaymentSplit(tokenA, msg.sender, recipientA, recipientB, amountA, amountB);
    }
}
