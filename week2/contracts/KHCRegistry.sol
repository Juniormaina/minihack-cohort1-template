// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract KHCRegistry {
    struct ChampionRecord {
        string companyName;
        string sector;
        uint256 validationDate;
        uint256 score;
        string profileHash;
        bool isVerified;
    }

    // Mapping from businessId to its verified champion record
    mapping(string => ChampionRecord) private _registry;

    // Array of businessIds to allow enumeration of all champions
    string[] private _businessIds;

    // Owner of the contract
    address public owner;

    event ChampionVerified(
        string indexed businessId,
        string companyName,
        string sector,
        uint256 score,
        string profileHash,
        uint256 validationDate
    );

    modifier onlyOwner() {
        require(msg.sender == owner, "KHCRegistry: caller is not the owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    /**
     * @dev Register or update a verified Hidden Champion on-chain
     * @param businessId The unique identifier of the business (e.g. khc-12345)
     * @param companyName Name of the business
     * @param sector Industry sector
     * @param score Calculated performance score (0-100)
     * @param profileHash Cryptographic SHA-256 profile hash
     */
    function verifyChampion(
        string calldata businessId,
        string calldata companyName,
        string calldata sector,
        uint256 score,
        string calldata profileHash
    ) external {
        require(bytes(businessId).length > 0, "KHCRegistry: businessId cannot be empty");
        require(bytes(companyName).length > 0, "KHCRegistry: companyName cannot be empty");
        require(score <= 100, "KHCRegistry: score must be between 0 and 100");

        if (!_registry[businessId].isVerified) {
            _businessIds.push(businessId);
        }

        _registry[businessId] = ChampionRecord({
            companyName: companyName,
            sector: sector,
            validationDate: block.timestamp,
            score: score,
            profileHash: profileHash,
            isVerified: true
        });

        emit ChampionVerified(
            businessId,
            companyName,
            sector,
            score,
            profileHash,
            block.timestamp
        );
    }

    /**
     * @dev Retrieve champion details by business ID
     */
    function getChampion(string calldata businessId)
        external
        view
        returns (
            string memory companyName,
            string memory sector,
            uint256 validationDate,
            uint256 score,
            string memory profileHash,
            bool isVerified
        )
    {
        ChampionRecord memory record = _registry[businessId];
        return (
            record.companyName,
            record.sector,
            record.validationDate,
            record.score,
            record.profileHash,
            record.isVerified
        );
    }

    /**
     * @dev Get total count of verified champions
     */
    function getVerifiedChampionsCount() external view returns (uint256) {
        return _businessIds.length;
    }

    /**
     * @dev Retrieve business ID by index for enumeration
     */
    function getBusinessIdAtIndex(uint256 index) external view returns (string memory) {
        require(index < _businessIds.length, "KHCRegistry: index out of bounds");
        return _businessIds[index];
    }
}
