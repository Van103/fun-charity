// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ICampaignRegistry
 * @notice Interface for the CampaignRegistry contract
 */
interface ICampaignRegistry {
    enum CampaignStatus {
        Active,
        Paused,
        Completed,
        Cancelled
    }

    struct Campaign {
        uint256 id;
        string title;
        string metadataURI;
        uint256 targetAmount;
        uint256 raisedAmount;
        uint256 deadline;
        address beneficiaryWallet;
        address creator;
        CampaignStatus status;
        uint256 createdAt;
        uint256 updatedAt;
    }

    event CampaignCreated(
        uint256 indexed campaignId,
        address indexed creator,
        address indexed beneficiaryWallet,
        string title,
        uint256 targetAmount,
        uint256 deadline,
        string metadataURI
    );

    event CampaignUpdated(
        uint256 indexed campaignId,
        CampaignStatus newStatus,
        uint256 raisedAmount
    );

    event CampaignClosed(
        uint256 indexed campaignId,
        CampaignStatus finalStatus,
        uint256 totalRaised
    );

    function createCampaign(
        string calldata title,
        string calldata description,
        uint256 targetAmount,
        uint256 deadline,
        address beneficiaryWallet,
        string calldata metadataURI
    ) external returns (uint256);

    function updateCampaignStatus(uint256 campaignId, CampaignStatus status) external;
    
    function getCampaign(uint256 campaignId) external view returns (Campaign memory);
    
    function incrementRaisedAmount(uint256 campaignId, uint256 amount) external;
}
