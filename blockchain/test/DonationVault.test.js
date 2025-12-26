const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time, loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");

describe("DonationVault", function () {
  async function deployFixture() {
    const [admin, creator, beneficiary, donor, feeRecipient] = await ethers.getSigners();

    // Deploy CampaignRegistry
    const CampaignRegistry = await ethers.getContractFactory("CampaignRegistry");
    const registry = await CampaignRegistry.deploy(admin.address);

    // Deploy DonationVault
    const DonationVault = await ethers.getContractFactory("DonationVault");
    const vault = await DonationVault.deploy(
      admin.address,
      await registry.getAddress(),
      feeRecipient.address
    );

    // Configure registry to allow vault
    await registry.connect(admin).setDonationVault(await vault.getAddress());

    // Create a test campaign
    const deadline = (await time.latest()) + 30 * 24 * 60 * 60;
    await registry.connect(creator).createCampaign(
      "Test Campaign",
      "Description",
      ethers.parseEther("100"),
      deadline,
      beneficiary.address,
      "ipfs://QmTest"
    );

    return { registry, vault, admin, creator, beneficiary, donor, feeRecipient };
  }

  describe("Deployment", function () {
    it("Should set correct initial values", async function () {
      const { vault, feeRecipient } = await loadFixture(deployFixture);

      expect(await vault.platformFeePercent()).to.equal(250); // 2.5%
      expect(await vault.feeRecipient()).to.equal(feeRecipient.address);
    });
  });

  describe("Native Token Donations", function () {
    it("Should accept native token donations", async function () {
      const { vault, donor } = await loadFixture(deployFixture);

      const donationAmount = ethers.parseEther("1");

      await expect(vault.connect(donor).donate(1, { value: donationAmount }))
        .to.emit(vault, "DonationReceived");
    });

    it("Should deduct platform fee correctly", async function () {
      const { vault, donor, feeRecipient } = await loadFixture(deployFixture);

      const donationAmount = ethers.parseEther("1");
      const expectedFee = donationAmount * 250n / 10000n; // 2.5%
      const expectedNet = donationAmount - expectedFee;

      const feeBalanceBefore = await ethers.provider.getBalance(feeRecipient.address);

      await vault.connect(donor).donate(1, { value: donationAmount });

      const feeBalanceAfter = await ethers.provider.getBalance(feeRecipient.address);
      expect(feeBalanceAfter - feeBalanceBefore).to.equal(expectedFee);

      const campaignBalance = await vault.getCampaignNativeBalance(1);
      expect(campaignBalance).to.equal(expectedNet);
    });

    it("Should update totalReceivedPerCampaign", async function () {
      const { vault, donor } = await loadFixture(deployFixture);

      const donationAmount = ethers.parseEther("1");
      const expectedNet = donationAmount - (donationAmount * 250n / 10000n);

      await vault.connect(donor).donate(1, { value: donationAmount });

      expect(await vault.totalReceivedPerCampaign(1)).to.equal(expectedNet);
    });

    it("Should accept donations with proof hash", async function () {
      const { vault, donor } = await loadFixture(deployFixture);

      const proofHash = ethers.keccak256(ethers.toUtf8Bytes("donation proof"));

      await expect(
        vault.connect(donor).donateWithProof(1, proofHash, { value: ethers.parseEther("1") })
      ).to.emit(vault, "DonationReceived");
    });

    it("Should reject zero amount donations", async function () {
      const { vault, donor } = await loadFixture(deployFixture);

      await expect(
        vault.connect(donor).donate(1, { value: 0 })
      ).to.be.revertedWith("Donation must be positive");
    });
  });

  describe("Withdrawals", function () {
    it("Should allow beneficiary to withdraw", async function () {
      const { vault, donor, beneficiary } = await loadFixture(deployFixture);

      const donationAmount = ethers.parseEther("10");
      await vault.connect(donor).donate(1, { value: donationAmount });

      const campaignBalance = await vault.getCampaignNativeBalance(1);
      const balanceBefore = await ethers.provider.getBalance(beneficiary.address);

      const tx = await vault.connect(beneficiary).withdrawNative(1, campaignBalance);
      const receipt = await tx.wait();
      const gasUsed = receipt.gasUsed * receipt.gasPrice;

      const balanceAfter = await ethers.provider.getBalance(beneficiary.address);

      expect(balanceAfter - balanceBefore + gasUsed).to.equal(campaignBalance);
      expect(await vault.getCampaignNativeBalance(1)).to.equal(0);
    });

    it("Should reject non-beneficiary withdrawals", async function () {
      const { vault, donor } = await loadFixture(deployFixture);

      await vault.connect(donor).donate(1, { value: ethers.parseEther("1") });

      await expect(
        vault.connect(donor).withdrawNative(1, ethers.parseEther("0.5"))
      ).to.be.revertedWith("Not beneficiary");
    });

    it("Should reject withdrawals exceeding balance", async function () {
      const { vault, donor, beneficiary } = await loadFixture(deployFixture);

      await vault.connect(donor).donate(1, { value: ethers.parseEther("1") });

      await expect(
        vault.connect(beneficiary).withdrawNative(1, ethers.parseEther("100"))
      ).to.be.revertedWith("Insufficient balance");
    });
  });

  describe("Donation History", function () {
    it("Should track donor donations", async function () {
      const { vault, donor } = await loadFixture(deployFixture);

      await vault.connect(donor).donate(1, { value: ethers.parseEther("1") });
      await vault.connect(donor).donate(1, { value: ethers.parseEther("2") });

      const donations = await vault.getDonorDonations(donor.address);
      expect(donations.length).to.equal(2);
    });

    it("Should track campaign donations", async function () {
      const { vault, donor, creator, beneficiary, admin, registry } = await loadFixture(deployFixture);

      // Create second campaign
      const deadline = (await time.latest()) + 30 * 24 * 60 * 60;
      await registry.connect(creator).createCampaign(
        "Campaign 2",
        "Description",
        ethers.parseEther("50"),
        deadline,
        beneficiary.address,
        "ipfs://QmTest2"
      );

      await vault.connect(donor).donate(1, { value: ethers.parseEther("1") });
      await vault.connect(donor).donate(2, { value: ethers.parseEther("2") });
      await vault.connect(donor).donate(1, { value: ethers.parseEther("3") });

      const campaign1Donations = await vault.getCampaignDonations(1);
      expect(campaign1Donations.length).to.equal(2);

      const campaign2Donations = await vault.getCampaignDonations(2);
      expect(campaign2Donations.length).to.equal(1);
    });
  });

  describe("Admin Functions", function () {
    it("Should allow admin to update platform fee", async function () {
      const { vault, admin } = await loadFixture(deployFixture);

      await vault.connect(admin).setPlatformFee(100); // 1%
      expect(await vault.platformFeePercent()).to.equal(100);
    });

    it("Should reject fee above maximum", async function () {
      const { vault, admin } = await loadFixture(deployFixture);

      await expect(vault.connect(admin).setPlatformFee(600)).to.be.revertedWith("Fee too high");
    });

    it("Should allow admin to update fee recipient", async function () {
      const { vault, admin, donor } = await loadFixture(deployFixture);

      await vault.connect(admin).setFeeRecipient(donor.address);
      expect(await vault.feeRecipient()).to.equal(donor.address);
    });

    it("Should allow admin to pause/unpause", async function () {
      const { vault, admin, donor } = await loadFixture(deployFixture);

      await vault.connect(admin).pause();
      expect(await vault.paused()).to.be.true;

      await expect(
        vault.connect(donor).donate(1, { value: ethers.parseEther("1") })
      ).to.be.revertedWithCustomError(vault, "EnforcedPause");

      await vault.connect(admin).unpause();
      await vault.connect(donor).donate(1, { value: ethers.parseEther("1") });
    });
  });
});
