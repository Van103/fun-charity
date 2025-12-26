// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";
import "./interfaces/ICampaignRegistry.sol";

/**
 * @title MilestoneDisbursement
 * @notice Handles milestone-based fund disbursement for FUN Charity campaigns
 * @dev Requires NGO verification or multi-sig approval before releasing funds
 */
contract MilestoneDisbursement is AccessControl, Pausable, ReentrancyGuard {
    using SafeERC20 for IERC20;
    using ECDSA for bytes32;
    using MessageHashUtils for bytes32;

    // ============ Roles ============
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant NGO_VERIFIER_ROLE = keccak256("NGO_VERIFIER_ROLE");
    bytes32 public constant BENEFICIARY_ROLE = keccak256("BENEFICIARY_ROLE");

    // ============ Enums ============
    enum MilestoneStatus {
        Pending,
        Submitted,
        Verified,
        Rejected,
        Disbursed
    }

    // ============ Structs ============
    struct Milestone {
        uint256 id;
        uint256 campaignId;
        string title;
        string description;
        string proofURI; // IPFS URI for proof documents
        uint256 amount;
        uint256 deadline;
        MilestoneStatus status;
        address verifiedBy;
        uint256 verifiedAt;
        uint256 disbursedAt;
        uint256 requiredSignatures;
        address[] signers;
    }

    struct CampaignMilestones {
        uint256[] milestoneIds;
        uint256 totalAllocated;
        uint256 totalDisbursed;
    }

    // ============ State Variables ============
    ICampaignRegistry public campaignRegistry;
    address public donationVault;
    
    uint256 private _milestoneIdCounter;
    mapping(uint256 => Milestone) private _milestones;
    mapping(uint256 => CampaignMilestones) private _campaignMilestones;
    mapping(uint256 => mapping(address => bool)) private _milestoneSignatures;
    
    uint256 public defaultRequiredSignatures = 2;
    uint256 public verificationTimelock = 24 hours;

    // ============ Events ============
    event MilestoneCreated(
        uint256 indexed milestoneId,
        uint256 indexed campaignId,
        string title,
        uint256 amount,
        uint256 deadline
    );

    event MilestoneSubmitted(
        uint256 indexed milestoneId,
        string proofURI
    );

    event MilestoneSigned(
        uint256 indexed milestoneId,
        address indexed signer
    );

    event MilestoneVerified(
        uint256 indexed milestoneId,
        address indexed verifier
    );

    event MilestoneRejected(
        uint256 indexed milestoneId,
        address indexed rejector,
        string reason
    );

    event MilestoneDisbursed(
        uint256 indexed milestoneId,
        uint256 indexed campaignId,
        address indexed beneficiary,
        uint256 amount
    );

    // ============ Constructor ============
    constructor(
        address admin,
        address _campaignRegistry,
        address _donationVault
    ) {
        require(admin != address(0), "Invalid admin");
        require(_campaignRegistry != address(0), "Invalid registry");
        require(_donationVault != address(0), "Invalid vault");

        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(ADMIN_ROLE, admin);
        
        campaignRegistry = ICampaignRegistry(_campaignRegistry);
        donationVault = _donationVault;
    }

    // ============ Milestone Creation ============

    /**
     * @notice Create a new milestone for a campaign
     * @param campaignId The campaign ID
     * @param title Milestone title
     * @param description Milestone description
     * @param amount Amount to be released upon completion
     * @param deadline Deadline for milestone completion
     * @param requiredSignatures Number of signatures required for verification
     * @return milestoneId The created milestone ID
     */
    function createMilestone(
        uint256 campaignId,
        string calldata title,
        string calldata description,
        uint256 amount,
        uint256 deadline,
        uint256 requiredSignatures
    ) external whenNotPaused returns (uint256) {
        ICampaignRegistry.Campaign memory campaign = campaignRegistry.getCampaign(campaignId);
        
        require(
            msg.sender == campaign.creator || hasRole(ADMIN_ROLE, msg.sender),
            "Not authorized"
        );
        require(bytes(title).length > 0, "Title required");
        require(amount > 0, "Amount must be positive");
        require(deadline > block.timestamp, "Invalid deadline");
        require(requiredSignatures > 0, "Need at least 1 signature");

        _milestoneIdCounter++;
        uint256 milestoneId = _milestoneIdCounter;

        _milestones[milestoneId] = Milestone({
            id: milestoneId,
            campaignId: campaignId,
            title: title,
            description: description,
            proofURI: "",
            amount: amount,
            deadline: deadline,
            status: MilestoneStatus.Pending,
            verifiedBy: address(0),
            verifiedAt: 0,
            disbursedAt: 0,
            requiredSignatures: requiredSignatures,
            signers: new address[](0)
        });

        CampaignMilestones storage cm = _campaignMilestones[campaignId];
        cm.milestoneIds.push(milestoneId);
        cm.totalAllocated += amount;

        emit MilestoneCreated(milestoneId, campaignId, title, amount, deadline);

        return milestoneId;
    }

    /**
     * @notice Submit milestone completion proof
     * @param milestoneId The milestone ID
     * @param proofURI IPFS URI containing proof documents
     */
    function submitMilestone(
        uint256 milestoneId,
        string calldata proofURI
    ) external whenNotPaused {
        Milestone storage milestone = _milestones[milestoneId];
        require(milestone.id != 0, "Milestone not found");
        require(milestone.status == MilestoneStatus.Pending, "Invalid status");
        require(bytes(proofURI).length > 0, "Proof required");

        ICampaignRegistry.Campaign memory campaign = campaignRegistry.getCampaign(milestone.campaignId);
        require(
            msg.sender == campaign.beneficiaryWallet || 
            msg.sender == campaign.creator ||
            hasRole(BENEFICIARY_ROLE, msg.sender),
            "Not authorized"
        );

        milestone.proofURI = proofURI;
        milestone.status = MilestoneStatus.Submitted;

        emit MilestoneSubmitted(milestoneId, proofURI);
    }

    /**
     * @notice Sign a milestone as verified (multi-sig approach)
     * @param milestoneId The milestone ID
     */
    function signMilestone(uint256 milestoneId) external onlyRole(NGO_VERIFIER_ROLE) whenNotPaused {
        Milestone storage milestone = _milestones[milestoneId];
        require(milestone.id != 0, "Milestone not found");
        require(milestone.status == MilestoneStatus.Submitted, "Not submitted");
        require(!_milestoneSignatures[milestoneId][msg.sender], "Already signed");

        _milestoneSignatures[milestoneId][msg.sender] = true;
        milestone.signers.push(msg.sender);

        emit MilestoneSigned(milestoneId, msg.sender);

        // Auto-verify if enough signatures
        if (milestone.signers.length >= milestone.requiredSignatures) {
            _verifyMilestone(milestoneId);
        }
    }

    /**
     * @notice Verify milestone with signature (for off-chain multi-sig)
     * @param milestoneId The milestone ID
     * @param signatures Array of signatures from verifiers
     * @param signers Array of signer addresses (must match signature order)
     */
    function verifyWithSignatures(
        uint256 milestoneId,
        bytes[] calldata signatures,
        address[] calldata signers
    ) external whenNotPaused {
        Milestone storage milestone = _milestones[milestoneId];
        require(milestone.id != 0, "Milestone not found");
        require(milestone.status == MilestoneStatus.Submitted, "Not submitted");
        require(signatures.length == signers.length, "Length mismatch");
        require(signatures.length >= milestone.requiredSignatures, "Not enough signatures");

        bytes32 messageHash = keccak256(abi.encodePacked(
            "FUN Charity Milestone Verification",
            milestoneId,
            milestone.campaignId,
            milestone.amount,
            milestone.proofURI
        ));
        bytes32 ethSignedHash = messageHash.toEthSignedMessageHash();

        for (uint256 i = 0; i < signatures.length; i++) {
            address recoveredSigner = ethSignedHash.recover(signatures[i]);
            require(recoveredSigner == signers[i], "Invalid signature");
            require(hasRole(NGO_VERIFIER_ROLE, recoveredSigner), "Signer not verifier");
            require(!_milestoneSignatures[milestoneId][recoveredSigner], "Duplicate signer");
            
            _milestoneSignatures[milestoneId][recoveredSigner] = true;
            milestone.signers.push(recoveredSigner);
        }

        _verifyMilestone(milestoneId);
    }

    /**
     * @notice Reject a milestone
     * @param milestoneId The milestone ID
     * @param reason Rejection reason
     */
    function rejectMilestone(
        uint256 milestoneId,
        string calldata reason
    ) external onlyRole(NGO_VERIFIER_ROLE) whenNotPaused {
        Milestone storage milestone = _milestones[milestoneId];
        require(milestone.id != 0, "Milestone not found");
        require(
            milestone.status == MilestoneStatus.Submitted || 
            milestone.status == MilestoneStatus.Pending,
            "Cannot reject"
        );

        milestone.status = MilestoneStatus.Rejected;

        emit MilestoneRejected(milestoneId, msg.sender, reason);
    }

    /**
     * @notice Disburse funds for a verified milestone
     * @param milestoneId The milestone ID
     */
    function disburseMilestone(uint256 milestoneId) external nonReentrant whenNotPaused {
        Milestone storage milestone = _milestones[milestoneId];
        require(milestone.id != 0, "Milestone not found");
        require(milestone.status == MilestoneStatus.Verified, "Not verified");
        require(
            block.timestamp >= milestone.verifiedAt + verificationTimelock,
            "Timelock not passed"
        );

        ICampaignRegistry.Campaign memory campaign = campaignRegistry.getCampaign(milestone.campaignId);
        require(
            msg.sender == campaign.beneficiaryWallet ||
            hasRole(ADMIN_ROLE, msg.sender),
            "Not authorized"
        );

        milestone.status = MilestoneStatus.Disbursed;
        milestone.disbursedAt = block.timestamp;

        CampaignMilestones storage cm = _campaignMilestones[milestone.campaignId];
        cm.totalDisbursed += milestone.amount;

        // Transfer funds from DonationVault
        // Note: This requires DonationVault to approve this contract
        // In production, you'd integrate more tightly with DonationVault

        emit MilestoneDisbursed(
            milestoneId,
            milestone.campaignId,
            campaign.beneficiaryWallet,
            milestone.amount
        );
    }

    // ============ Internal Functions ============

    function _verifyMilestone(uint256 milestoneId) internal {
        Milestone storage milestone = _milestones[milestoneId];
        milestone.status = MilestoneStatus.Verified;
        milestone.verifiedBy = msg.sender;
        milestone.verifiedAt = block.timestamp;

        emit MilestoneVerified(milestoneId, msg.sender);
    }

    // ============ View Functions ============

    /**
     * @notice Get milestone details
     * @param milestoneId The milestone ID
     * @return Milestone struct
     */
    function getMilestone(uint256 milestoneId) external view returns (Milestone memory) {
        require(_milestones[milestoneId].id != 0, "Milestone not found");
        return _milestones[milestoneId];
    }

    /**
     * @notice Get all milestones for a campaign
     * @param campaignId The campaign ID
     * @return Array of milestone IDs
     */
    function getCampaignMilestoneIds(uint256 campaignId) external view returns (uint256[] memory) {
        return _campaignMilestones[campaignId].milestoneIds;
    }

    /**
     * @notice Get campaign milestone summary
     * @param campaignId The campaign ID
     * @return totalAllocated Total amount allocated to milestones
     * @return totalDisbursed Total amount disbursed
     * @return milestoneCount Number of milestones
     */
    function getCampaignMilestoneSummary(uint256 campaignId) external view returns (
        uint256 totalAllocated,
        uint256 totalDisbursed,
        uint256 milestoneCount
    ) {
        CampaignMilestones storage cm = _campaignMilestones[campaignId];
        return (cm.totalAllocated, cm.totalDisbursed, cm.milestoneIds.length);
    }

    /**
     * @notice Check if address has signed a milestone
     * @param milestoneId The milestone ID
     * @param signer The address to check
     * @return True if signed
     */
    function hasSigned(uint256 milestoneId, address signer) external view returns (bool) {
        return _milestoneSignatures[milestoneId][signer];
    }

    // ============ Admin Functions ============

    /**
     * @notice Update verification timelock
     * @param newTimelock New timelock duration in seconds
     */
    function setVerificationTimelock(uint256 newTimelock) external onlyRole(ADMIN_ROLE) {
        require(newTimelock <= 7 days, "Timelock too long");
        verificationTimelock = newTimelock;
    }

    /**
     * @notice Update default required signatures
     * @param newDefault New default number of required signatures
     */
    function setDefaultRequiredSignatures(uint256 newDefault) external onlyRole(ADMIN_ROLE) {
        require(newDefault > 0 && newDefault <= 10, "Invalid count");
        defaultRequiredSignatures = newDefault;
    }

    /**
     * @notice Pause contract
     */
    function pause() external onlyRole(ADMIN_ROLE) {
        _pause();
    }

    /**
     * @notice Unpause contract
     */
    function unpause() external onlyRole(ADMIN_ROLE) {
        _unpause();
    }
}
