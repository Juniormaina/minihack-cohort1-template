// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/// @title Escrow
/// @notice Holds ERC-20 tokens in escrow between a depositor and beneficiary.
contract Escrow {
    using SafeERC20 for IERC20;

    enum State { FUNDED, RELEASED, REFUNDED }

    struct EscrowRecord {
        address depositor;
        address beneficiary;
        address token;
        uint256 amount;
        State state;
    }

    mapping(uint256 => EscrowRecord) public escrows;
    uint256 public nextId;

    event Deposited(uint256 indexed id, address indexed depositor, address indexed beneficiary, uint256 amount);
    event Released(uint256 indexed id, address indexed beneficiary, uint256 amount);
    event Refunded(uint256 indexed id, address indexed depositor, uint256 amount);

    function deposit(address token, address beneficiary, uint256 amount) external returns (uint256 id) {
        require(token != address(0), "Escrow: zero token");
        require(beneficiary != address(0), "Escrow: zero beneficiary");
        require(amount > 0, "Escrow: zero amount");
        id = nextId++;
        escrows[id] = EscrowRecord(msg.sender, beneficiary, token, amount, State.FUNDED);
        IERC20(token).safeTransferFrom(msg.sender, address(this), amount);
        emit Deposited(id, msg.sender, beneficiary, amount);
    }

    function release(uint256 id) external {
        EscrowRecord storage e = escrows[id];
        require(msg.sender == e.depositor, "Escrow: not depositor");
        require(e.state == State.FUNDED, "Escrow: not funded");
        e.state = State.RELEASED;
        IERC20(e.token).safeTransfer(e.beneficiary, e.amount);
        emit Released(id, e.beneficiary, e.amount);
    }

    function refund(uint256 id) external {
        EscrowRecord storage e = escrows[id];
        require(msg.sender == e.depositor, "Escrow: not depositor");
        require(e.state == State.FUNDED, "Escrow: not funded");
        e.state = State.REFUNDED;
        IERC20(e.token).safeTransfer(e.depositor, e.amount);
        emit Refunded(id, e.depositor, e.amount);
    }
}
