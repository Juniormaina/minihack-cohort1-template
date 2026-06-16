// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract YourContract is ERC20 {
    address public owner;

    event Deployed(address indexed owner, uint256 timestamp);

    constructor() ERC20("YourToken", "YTK") {
        owner = msg.sender;
        _mint(msg.sender, 1_000_000 * 10 ** decimals());
        emit Deployed(msg.sender, block.timestamp);
    }

    function mint(address to, uint256 amount) external {
        require(msg.sender == owner, "Only owner can mint");
        _mint(to, amount);
    }
}
