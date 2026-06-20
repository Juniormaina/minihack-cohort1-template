<<<<<<< HEAD
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

<<<<<<< HEAD
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract YourContract is ERC20 {
=======
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract PaymentBridge {
>>>>>>> 6946d67 (Updates from Junior)
    address public owner;
    IERC20 public paymentToken;
    uint256 public mpesaCount;

    struct MpesaPayment {
        address recorder;
        string phone;
        uint256 amount;
        string reference;
        uint256 timestamp;
    }

<<<<<<< HEAD
    constructor() ERC20("YourToken", "YTK") {
        owner = msg.sender;
        _mint(msg.sender, 1_000_000 * 10 ** decimals());
        emit Deployed(msg.sender, block.timestamp);
=======
    mapping(uint256 => MpesaPayment) public mpesaPayments;
    mapping(bytes32 => bool) public mpesaReferenceUsed;

    event Deployed(address indexed owner, address indexed paymentToken, uint256 timestamp);
    event TokenPayment(address indexed payer, uint256 amount, string reference, uint256 timestamp);
    event MpesaPaymentRecorded(address indexed recorder, string phone, uint256 amount, string reference, uint256 timestamp);
    event PaymentTokenUpdated(address indexed oldToken, address indexed newToken);

    modifier onlyOwner() {
        require(msg.sender == owner, "PaymentBridge: caller is not owner");
        _;
    }

    constructor(address _paymentToken) {
        owner = msg.sender;
        paymentToken = IERC20(_paymentToken);
        emit Deployed(msg.sender, _paymentToken, block.timestamp);
    }

    function updatePaymentToken(address _paymentToken) external onlyOwner {
        address oldToken = address(paymentToken);
        paymentToken = IERC20(_paymentToken);
        emit PaymentTokenUpdated(oldToken, _paymentToken);
    }

    function payWithToken(uint256 amount, string calldata reference) external {
        require(address(paymentToken) != address(0), "PaymentBridge: payment token not set");
        require(amount > 0, "PaymentBridge: amount must be greater than 0");
        require(bytes(reference).length > 0, "PaymentBridge: reference required");

        bool sent = paymentToken.transferFrom(msg.sender, address(this), amount);
        require(sent, "PaymentBridge: token transfer failed");

        emit TokenPayment(msg.sender, amount, reference, block.timestamp);
    }

    function recordMpesaPayment(string calldata phone, uint256 amount, string calldata reference) external onlyOwner {
        require(bytes(phone).length > 0, "PaymentBridge: phone required");
        require(amount > 0, "PaymentBridge: amount must be greater than 0");
        require(bytes(reference).length > 0, "PaymentBridge: reference required");

        bytes32 referenceKey = keccak256(abi.encodePacked(reference));
        require(!mpesaReferenceUsed[referenceKey], "PaymentBridge: reference already used");
        mpesaReferenceUsed[referenceKey] = true;

        mpesaPayments[mpesaCount] = MpesaPayment({
            recorder: msg.sender,
            phone: phone,
            amount: amount,
            reference: reference,
            timestamp: block.timestamp
        });

        mpesaCount += 1;

        emit MpesaPaymentRecorded(msg.sender, phone, amount, reference, block.timestamp);
    }

    function withdrawTokens(address recipient, uint256 amount) external onlyOwner {
        require(recipient != address(0), "PaymentBridge: recipient is zero address");
        require(amount > 0, "PaymentBridge: amount must be greater than 0");

        bool sent = paymentToken.transfer(recipient, amount);
        require(sent, "PaymentBridge: transfer failed");
>>>>>>> 6946d67 (Updates from Junior)
    }

    function mint(address to, uint256 amount) external {
        require(msg.sender == owner, "Only owner can mint");
        _mint(to, amount);
    }
}
=======
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract PaymentBridge {
    address public owner;
    IERC20 public paymentToken;
    uint256 public mpesaCount;

    struct MpesaPayment {
        address recorder;
        string phone;
        uint256 amount;
        string reference;
        uint256 timestamp;
    }

    mapping(uint256 => MpesaPayment) public mpesaPayments;
    mapping(bytes32 => bool) public mpesaReferenceUsed;

    event Deployed(address indexed owner, address indexed paymentToken, uint256 timestamp);
    event TokenPayment(address indexed payer, uint256 amount, string reference, uint256 timestamp);
    event MpesaPaymentRecorded(address indexed recorder, string phone, uint256 amount, string reference, uint256 timestamp);
    event PaymentTokenUpdated(address indexed oldToken, address indexed newToken);

    modifier onlyOwner() {
        require(msg.sender == owner, "PaymentBridge: caller is not owner");
        _;
    }

    constructor(address _paymentToken) {
        owner = msg.sender;
        paymentToken = IERC20(_paymentToken);
        emit Deployed(msg.sender, _paymentToken, block.timestamp);
    }

    function updatePaymentToken(address _paymentToken) external onlyOwner {
        address oldToken = address(paymentToken);
        paymentToken = IERC20(_paymentToken);
        emit PaymentTokenUpdated(oldToken, _paymentToken);
    }

    function payWithToken(uint256 amount, string calldata reference) external {
        require(address(paymentToken) != address(0), "PaymentBridge: payment token not set");
        require(amount > 0, "PaymentBridge: amount must be greater than 0");
        require(bytes(reference).length > 0, "PaymentBridge: reference required");

        bool sent = paymentToken.transferFrom(msg.sender, address(this), amount);
        require(sent, "PaymentBridge: token transfer failed");

        emit TokenPayment(msg.sender, amount, reference, block.timestamp);
    }

    function recordMpesaPayment(string calldata phone, uint256 amount, string calldata reference) external onlyOwner {
        require(bytes(phone).length > 0, "PaymentBridge: phone required");
        require(amount > 0, "PaymentBridge: amount must be greater than 0");
        require(bytes(reference).length > 0, "PaymentBridge: reference required");

        bytes32 referenceKey = keccak256(abi.encodePacked(reference));
        require(!mpesaReferenceUsed[referenceKey], "PaymentBridge: reference already used");
        mpesaReferenceUsed[referenceKey] = true;

        mpesaPayments[mpesaCount] = MpesaPayment({
            recorder: msg.sender,
            phone: phone,
            amount: amount,
            reference: reference,
            timestamp: block.timestamp
        });

        mpesaCount += 1;

        emit MpesaPaymentRecorded(msg.sender, phone, amount, reference, block.timestamp);
    }

    function withdrawTokens(address recipient, uint256 amount) external onlyOwner {
        require(recipient != address(0), "PaymentBridge: recipient is zero address");
        require(amount > 0, "PaymentBridge: amount must be greater than 0");

        bool sent = paymentToken.transfer(recipient, amount);
        require(sent, "PaymentBridge: transfer failed");
    }
}
>>>>>>> 1a2fcda (Kuzana Hidden Champions)
