// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./interfaces/ICampaignRegistry.sol";

/**
 * @title CampaignRegistry
 * @notice Registry for managing charity campaigns on FUN Charity platform
 * @dev Uses OpenZeppelin AccessControl for role-based permissions
 */
contract CampaignRegistry is ICampaignRegistry, AccessControl, Pausable, ReentrancyGuard {
    // ============ Roles ============
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant NGO_VERIFIER_ROLE = keccak256("NGO_VERIFIER_ROLE");
    bytes32 public constant DONATION_VAULT_ROLE = keccak256("DONATION_VAULT_ROLE");

    // ============ State Variables ============
    uint256 private _campaignIdCounter;
    mapping(uint256 => Campaign) private _campaigns;
    mapping(address => uint256[]) private _creatorCampaigns;
    
    uint256 public constant MIN_CAMPAIGN_DURATION = 1 days;
    uint256 public constant MAX_CAMPAIGN_DURATION = 365 days;

    // ============ Modifiers ============
    modifier campaignExists(uint256 campaignId) {
        require(_campaigns[campaignId].createdAt != 0, "Campaign does not exist");
        _;
    }

    modifier onlyCampaignCreatorOrAdmin(uint256 campaignId) {
        require(
            _campaigns[campaignId].creator == msg.sender || hasRole(ADMIN_ROLE, msg.sender),
            "Not authorized"
        );
        _;
    }

    // ============ Constructor ============
    constructor(address admin) {
        require(admin != address(0), "Invalid admin address");
        
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(ADMIN_ROLE, admin);
    }

    // ============ External Functions ============
    
    /**
     * @notice Create a new charity campaign
     * @param title Campaign title
     * @param description Campaign description (stored off-chain, hash can be in metadataURI)
     * @param targetAmount Fundraising goal in wei
     * @param deadline Unix timestamp for campaign end
     * @param beneficiaryWallet Address to receive donations
     * @param metadataURI IPFS URI for campaign metadata
     * @return campaignId The ID of the newly created campaign
     */
    function createCampaign(
        string calldata title,
        string calldata description,
        uint256 targetAmount,
        uint256 deadline,
        address beneficiaryWallet,
        string calldata metadataURI
    ) external override whenNotPaused nonReentrant returns (uint256) {
        // Validations
        require(bytes(title).length > 0 && bytes(title).length <= 256, "Invalid title length");
        require(targetAmount > 0, "Target amount must be positive");
        require(beneficiaryWallet != address(0), "Invalid beneficiary address");
        require(deadline > block.timestamp + MIN_CAMPAIGN_DURATION, "Deadline too soon");
        require(deadline < block.timestamp + MAX_CAMPAIGN_DURATION, "Deadline too far");
        
        // Increment counter and create campaign
        _campaignIdCounter++;
        uint256 campaignId = _campaignIdCounter;
        
        Campaign storage campaign = _campaigns[campaignId];
        campaign.id = campaignId;
        campaign.title = title;
        campaign.metadataURI = metadataURI;
        campaign.targetAmount = targetAmount;
        campaign.raisedAmount = 0;
        campaign.deadline = deadline;
        campaign.beneficiaryWallet = beneficiaryWallet;
        campaign.creator = msg.sender;
        campaign.status = CampaignStatus.Active;
        campaign.createdAt = block.timestamp;
        campaign.updatedAt = block.timestamp;
        
        // Track creator's campaigns
        _creatorCampaigns[msg.sender].push(campaignId);
        
        emit CampaignCreated(
            campaignId,
            msg.sender,
            beneficiaryWallet,
            title,
            targetAmount,
            deadline,
            metadataURI
        );
        
        // Description is emitted for indexing but not stored on-chain (gas optimization)
        // Indexers can pick this up from the transaction input data
        
        return campaignId;
    }

    /**
     * @notice Update campaign status
     * @param campaignId The campaign to update
     * @param status New status for the campaign
     */
    function updateCampaignStatus(
        uint256 campaignId, 
        CampaignStatus status
    ) external override campaignExists(campaignId) onlyCampaignCreatorOrAdmin(campaignId) whenNotPaused {
        Campaign storage campaign = _campaigns[campaignId];
        
        // Validate status transitions
        require(campaign.status != CampaignStatus.Completed, "Campaign already completed");
        require(campaign.status != CampaignStatus.Cancelled, "Campaign already cancelled");
        
        CampaignStatus oldStatus = campaign.status;
        campaign.status = status;
        campaign.updatedAt = block.timestamp;
        
        emit CampaignUpdated(campaignId, status, campaign.raisedAmount);
        
        // Emit close event for final states
        if (status == CampaignStatus.Completed || status == CampaignStatus.Cancelled) {
            emit CampaignClosed(campaignId, status, campaign.raisedAmount);
        }
    }

    /**
     * @notice Increment raised amount (called by DonationVault)
     * @param campaignId The campaign to update
     * @param amount Amount to add to raised total
     */
    function incrementRaisedAmount(
        uint256 campaignId, 
        uint256 amount
    ) external override campaignExists(campaignId) onlyRole(DONATION_VAULT_ROLE) {
        Campaign storage campaign = _campaigns[campaignId];
        require(campaign.status == CampaignStatus.Active, "Campaign not active");
        require(block.timestamp <= campaign.deadline, "Campaign expired");
        
        campaign.raisedAmount += amount;
        campaign.updatedAt = block.timestamp;
        
        emit CampaignUpdated(campaignId, campaign.status, campaign.raisedAmount);
        
        // Auto-complete if target reached
        if (campaign.raisedAmount >= campaign.targetAmount) {
            campaign.status = CampaignStatus.Completed;
            emit CampaignClosed(campaignId, CampaignStatus.Completed, campaign.raisedAmount);
        }
    }

    /**
     * @notice Get campaign details
     * @param campaignId The campaign ID
     * @return Campaign struct with all details
     */
    function getCampaign(uint256 campaignId) external view override returns (Campaign memory) {
        require(_campaigns[campaignId].createdAt != 0, "Campaign does not exist");
        return _campaigns[campaignId];
    }

    /**
     * @notice Get all campaign IDs created by an address
     * @param creator The creator address
     * @return Array of campaign IDs
     */
    function getCampaignsByCreator(address creator) external view returns (uint256[] memory) {
        return _creatorCampaigns[creator];
    }

    /**
     * @notice Get total number of campaigns
     * @return Total campaign count
     */
    function getTotalCampaigns() external view returns (uint256) {
        return _campaignIdCounter;
    }

    /**
     * @notice Check if a campaign is active and accepting donations
     * @param campaignId The campaign to check
     * @return True if campaign can receive donations
     */
    function isCampaignActive(uint256 campaignId) external view returns (bool) {
        Campaign storage campaign = _campaigns[campaignId];
        return campaign.status == CampaignStatus.Active && 
               block.timestamp <= campaign.deadline;
    }

    // ============ Admin Functions ============
    
    /**
     * @notice Pause all campaign operations
     */
    function pause() external onlyRole(ADMIN_ROLE) {
        _pause();
    }

    /**
     * @notice Unpause campaign operations
     */
    function unpause() external onlyRole(ADMIN_ROLE) {
        _unpause();
    }

    /**
     * @notice Set the DonationVault contract address
     * @param vault The DonationVault contract address
     */
    function setDonationVault(address vault) external onlyRole(ADMIN_ROLE) {
        require(vault != address(0), "Invalid vault address");
        _grantRole(DONATION_VAULT_ROLE, vault);
    }
}
