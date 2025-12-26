// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "./interfaces/ICampaignRegistry.sol";

/**
 * @title DonationVault
 * @notice Handles donations for FUN Charity campaigns
 * @dev Supports both native tokens (ETH/MATIC) and ERC20 tokens
 */
contract DonationVault is AccessControl, Pausable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    // ============ Roles ============
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant BENEFICIARY_ROLE = keccak256("BENEFICIARY_ROLE");

    // ============ Structs ============
    struct DonationRecord {
        address donor;
        uint256 campaignId;
        uint256 amount;
        address tokenAddress; // address(0) for native token
        uint256 timestamp;
        bytes32 proofHash; // IPFS hash of donation proof
    }

    struct CampaignBalance {
        uint256 nativeBalance;
        mapping(address => uint256) tokenBalances;
    }

    // ============ State Variables ============
    ICampaignRegistry public campaignRegistry;
    
    mapping(uint256 => CampaignBalance) private _campaignBalances;
    mapping(uint256 => uint256) public totalReceivedPerCampaign;
    mapping(address => bool) public allowedTokens;
    
    DonationRecord[] private _allDonations;
    mapping(address => uint256[]) private _donorDonations;
    mapping(uint256 => uint256[]) private _campaignDonations;

    uint256 public platformFeePercent = 250; // 2.5% = 250 basis points
    uint256 public constant MAX_FEE_PERCENT = 500; // Max 5%
    address public feeRecipient;

    // ============ Events ============
    event DonationReceived(
        address indexed donor,
        uint256 indexed campaignId,
        uint256 amount,
        address tokenAddress,
        bytes32 proofHash
    );

    event FundsWithdrawn(
        uint256 indexed campaignId,
        address indexed beneficiary,
        uint256 amount,
        address tokenAddress
    );

    event TokenAllowlistUpdated(address indexed token, bool allowed);
    event PlatformFeeUpdated(uint256 newFeePercent);
    event FeeRecipientUpdated(address newRecipient);

    // ============ Constructor ============
    constructor(
        address admin,
        address _campaignRegistry,
        address _feeRecipient
    ) {
        require(admin != address(0), "Invalid admin");
        require(_campaignRegistry != address(0), "Invalid registry");
        require(_feeRecipient != address(0), "Invalid fee recipient");

        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(ADMIN_ROLE, admin);
        
        campaignRegistry = ICampaignRegistry(_campaignRegistry);
        feeRecipient = _feeRecipient;
    }

    // ============ Donation Functions ============

    /**
     * @notice Donate native tokens (ETH/MATIC) to a campaign
     * @param campaignId The campaign to donate to
     */
    function donate(uint256 campaignId) external payable whenNotPaused nonReentrant {
        require(msg.value > 0, "Donation must be positive");
        _processDonation(campaignId, msg.value, address(0), bytes32(0));
    }

    /**
     * @notice Donate native tokens with proof hash
     * @param campaignId The campaign to donate to
     * @param proofHash IPFS hash of donation proof/message
     */
    function donateWithProof(
        uint256 campaignId, 
        bytes32 proofHash
    ) external payable whenNotPaused nonReentrant {
        require(msg.value > 0, "Donation must be positive");
        _processDonation(campaignId, msg.value, address(0), proofHash);
    }

    /**
     * @notice Donate ERC20 tokens to a campaign
     * @param campaignId The campaign to donate to
     * @param tokenAddress The ERC20 token address
     * @param amount Amount of tokens to donate
     */
    function donateToken(
        uint256 campaignId,
        address tokenAddress,
        uint256 amount
    ) external whenNotPaused nonReentrant {
        require(allowedTokens[tokenAddress], "Token not allowed");
        require(amount > 0, "Donation must be positive");
        
        // Transfer tokens from donor to vault
        IERC20(tokenAddress).safeTransferFrom(msg.sender, address(this), amount);
        
        _processDonation(campaignId, amount, tokenAddress, bytes32(0));
    }

    /**
     * @notice Donate ERC20 tokens with proof hash
     * @param campaignId The campaign to donate to
     * @param tokenAddress The ERC20 token address
     * @param amount Amount of tokens to donate
     * @param proofHash IPFS hash of donation proof
     */
    function donateTokenWithProof(
        uint256 campaignId,
        address tokenAddress,
        uint256 amount,
        bytes32 proofHash
    ) external whenNotPaused nonReentrant {
        require(allowedTokens[tokenAddress], "Token not allowed");
        require(amount > 0, "Donation must be positive");
        
        IERC20(tokenAddress).safeTransferFrom(msg.sender, address(this), amount);
        
        _processDonation(campaignId, amount, tokenAddress, proofHash);
    }

    // ============ Internal Functions ============

    function _processDonation(
        uint256 campaignId,
        uint256 amount,
        address tokenAddress,
        bytes32 proofHash
    ) internal {
        // Verify campaign is active
        ICampaignRegistry.Campaign memory campaign = campaignRegistry.getCampaign(campaignId);
        require(campaign.status == ICampaignRegistry.CampaignStatus.Active, "Campaign not active");
        require(block.timestamp <= campaign.deadline, "Campaign expired");

        // Calculate fee
        uint256 fee = (amount * platformFeePercent) / 10000;
        uint256 netAmount = amount - fee;

        // Update balances
        if (tokenAddress == address(0)) {
            _campaignBalances[campaignId].nativeBalance += netAmount;
            // Transfer fee
            if (fee > 0) {
                (bool success, ) = feeRecipient.call{value: fee}("");
                require(success, "Fee transfer failed");
            }
        } else {
            _campaignBalances[campaignId].tokenBalances[tokenAddress] += netAmount;
            // Transfer fee
            if (fee > 0) {
                IERC20(tokenAddress).safeTransfer(feeRecipient, fee);
            }
        }

        // Update totals
        totalReceivedPerCampaign[campaignId] += netAmount;

        // Update campaign registry
        campaignRegistry.incrementRaisedAmount(campaignId, netAmount);

        // Record donation
        uint256 donationIndex = _allDonations.length;
        _allDonations.push(DonationRecord({
            donor: msg.sender,
            campaignId: campaignId,
            amount: netAmount,
            tokenAddress: tokenAddress,
            timestamp: block.timestamp,
            proofHash: proofHash
        }));

        _donorDonations[msg.sender].push(donationIndex);
        _campaignDonations[campaignId].push(donationIndex);

        emit DonationReceived(msg.sender, campaignId, netAmount, tokenAddress, proofHash);
    }

    // ============ Withdrawal Functions ============

    /**
     * @notice Withdraw native tokens from a campaign (beneficiary only)
     * @param campaignId The campaign to withdraw from
     * @param amount Amount to withdraw
     */
    function withdrawNative(
        uint256 campaignId,
        uint256 amount
    ) external nonReentrant {
        ICampaignRegistry.Campaign memory campaign = campaignRegistry.getCampaign(campaignId);
        require(msg.sender == campaign.beneficiaryWallet, "Not beneficiary");
        require(
            campaign.status == ICampaignRegistry.CampaignStatus.Completed ||
            campaign.status == ICampaignRegistry.CampaignStatus.Active,
            "Campaign not withdrawable"
        );

        uint256 available = _campaignBalances[campaignId].nativeBalance;
        require(amount <= available, "Insufficient balance");

        _campaignBalances[campaignId].nativeBalance -= amount;

        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Transfer failed");

        emit FundsWithdrawn(campaignId, msg.sender, amount, address(0));
    }

    /**
     * @notice Withdraw ERC20 tokens from a campaign (beneficiary only)
     * @param campaignId The campaign to withdraw from
     * @param tokenAddress The token to withdraw
     * @param amount Amount to withdraw
     */
    function withdrawToken(
        uint256 campaignId,
        address tokenAddress,
        uint256 amount
    ) external nonReentrant {
        ICampaignRegistry.Campaign memory campaign = campaignRegistry.getCampaign(campaignId);
        require(msg.sender == campaign.beneficiaryWallet, "Not beneficiary");
        require(
            campaign.status == ICampaignRegistry.CampaignStatus.Completed ||
            campaign.status == ICampaignRegistry.CampaignStatus.Active,
            "Campaign not withdrawable"
        );

        uint256 available = _campaignBalances[campaignId].tokenBalances[tokenAddress];
        require(amount <= available, "Insufficient balance");

        _campaignBalances[campaignId].tokenBalances[tokenAddress] -= amount;

        IERC20(tokenAddress).safeTransfer(msg.sender, amount);

        emit FundsWithdrawn(campaignId, msg.sender, amount, tokenAddress);
    }

    // ============ View Functions ============

    /**
     * @notice Get campaign native token balance
     * @param campaignId The campaign ID
     * @return Native token balance
     */
    function getCampaignNativeBalance(uint256 campaignId) external view returns (uint256) {
        return _campaignBalances[campaignId].nativeBalance;
    }

    /**
     * @notice Get campaign ERC20 token balance
     * @param campaignId The campaign ID
     * @param tokenAddress The token address
     * @return Token balance
     */
    function getCampaignTokenBalance(
        uint256 campaignId,
        address tokenAddress
    ) external view returns (uint256) {
        return _campaignBalances[campaignId].tokenBalances[tokenAddress];
    }

    /**
     * @notice Get donor's donation history
     * @param donor The donor address
     * @return Array of donation records
     */
    function getDonorDonations(address donor) external view returns (DonationRecord[] memory) {
        uint256[] storage indices = _donorDonations[donor];
        DonationRecord[] memory donations = new DonationRecord[](indices.length);
        
        for (uint256 i = 0; i < indices.length; i++) {
            donations[i] = _allDonations[indices[i]];
        }
        
        return donations;
    }

    /**
     * @notice Get campaign's donation history
     * @param campaignId The campaign ID
     * @return Array of donation records
     */
    function getCampaignDonations(uint256 campaignId) external view returns (DonationRecord[] memory) {
        uint256[] storage indices = _campaignDonations[campaignId];
        DonationRecord[] memory donations = new DonationRecord[](indices.length);
        
        for (uint256 i = 0; i < indices.length; i++) {
            donations[i] = _allDonations[indices[i]];
        }
        
        return donations;
    }

    // ============ Admin Functions ============

    /**
     * @notice Update allowed token list
     * @param tokenAddress The token to update
     * @param allowed Whether the token is allowed
     */
    function setAllowedToken(address tokenAddress, bool allowed) external onlyRole(ADMIN_ROLE) {
        require(tokenAddress != address(0), "Invalid token");
        allowedTokens[tokenAddress] = allowed;
        emit TokenAllowlistUpdated(tokenAddress, allowed);
    }

    /**
     * @notice Update platform fee
     * @param newFeePercent New fee in basis points (100 = 1%)
     */
    function setPlatformFee(uint256 newFeePercent) external onlyRole(ADMIN_ROLE) {
        require(newFeePercent <= MAX_FEE_PERCENT, "Fee too high");
        platformFeePercent = newFeePercent;
        emit PlatformFeeUpdated(newFeePercent);
    }

    /**
     * @notice Update fee recipient
     * @param newRecipient New fee recipient address
     */
    function setFeeRecipient(address newRecipient) external onlyRole(ADMIN_ROLE) {
        require(newRecipient != address(0), "Invalid recipient");
        feeRecipient = newRecipient;
        emit FeeRecipientUpdated(newRecipient);
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

    /**
     * @notice Emergency withdraw (admin only)
     * @param tokenAddress Token to withdraw (address(0) for native)
     * @param amount Amount to withdraw
     * @param to Recipient address
     */
    function emergencyWithdraw(
        address tokenAddress,
        uint256 amount,
        address to
    ) external onlyRole(ADMIN_ROLE) {
        require(to != address(0), "Invalid recipient");
        
        if (tokenAddress == address(0)) {
            (bool success, ) = to.call{value: amount}("");
            require(success, "Transfer failed");
        } else {
            IERC20(tokenAddress).safeTransfer(to, amount);
        }
    }

    // ============ Receive ============
    receive() external payable {
        revert("Use donate() function");
    }
}
