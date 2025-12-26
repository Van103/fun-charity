const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time, loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");

describe("MilestoneDisbursement", function () {
  async function deployFixture() {
    const [admin, creator, beneficiary, verifier1, verifier2, other] = await ethers.getSigners();

    // Deploy CampaignRegistry
    const CampaignRegistry = await ethers.getContractFactory("CampaignRegistry");
    const registry = await CampaignRegistry.deploy(admin.address);

    // Deploy DonationVault
    const DonationVault = await ethers.getContractFactory("DonationVault");
    const vault = await DonationVault.deploy(
      admin.address,
      await registry.getAddress(),
      admin.address
    );

    // Deploy MilestoneDisbursement
    const MilestoneDisbursement = await ethers.getContractFactory("MilestoneDisbursement");
    const milestone = await MilestoneDisbursement.deploy(
      admin.address,
      await registry.getAddress(),
      await vault.getAddress()
    );

    // Configure registry
    await registry.connect(admin).setDonationVault(await vault.getAddress());

    // Grant verifier roles
    const NGO_VERIFIER_ROLE = await milestone.NGO_VERIFIER_ROLE();
    await milestone.connect(admin).grantRole(NGO_VERIFIER_ROLE, verifier1.address);
    await milestone.connect(admin).grantRole(NGO_VERIFIER_ROLE, verifier2.address);

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

    return { registry, vault, milestone, admin, creator, beneficiary, verifier1, verifier2, other };
  }

  describe("Milestone Creation", function () {
    it("Should create milestone successfully", async function () {
      const { milestone, creator } = await loadFixture(deployFixture);

      const milestoneDeadline = (await time.latest()) + 7 * 24 * 60 * 60;

      await expect(
        milestone.connect(creator).createMilestone(
          1,
          "Phase 1",
          "Initial phase",
          ethers.parseEther("10"),
          milestoneDeadline,
          2
        )
      )
        .to.emit(milestone, "MilestoneCreated")
        .withArgs(1, 1, "Phase 1", ethers.parseEther("10"), milestoneDeadline);
    });

    it("Should track campaign milestones", async function () {
      const { milestone, creator } = await loadFixture(deployFixture);

      const milestoneDeadline = (await time.latest()) + 7 * 24 * 60 * 60;

      await milestone.connect(creator).createMilestone(
        1, "Phase 1", "Description", ethers.parseEther("10"), milestoneDeadline, 2
      );
      await milestone.connect(creator).createMilestone(
        1, "Phase 2", "Description", ethers.parseEther("20"), milestoneDeadline, 2
      );

      const milestoneIds = await milestone.getCampaignMilestoneIds(1);
      expect(milestoneIds.length).to.equal(2);

      const [totalAllocated, totalDisbursed, count] = await milestone.getCampaignMilestoneSummary(1);
      expect(totalAllocated).to.equal(ethers.parseEther("30"));
      expect(totalDisbursed).to.equal(0);
      expect(count).to.equal(2);
    });

    it("Should reject unauthorized milestone creation", async function () {
      const { milestone, other } = await loadFixture(deployFixture);

      const milestoneDeadline = (await time.latest()) + 7 * 24 * 60 * 60;

      await expect(
        milestone.connect(other).createMilestone(
          1, "Phase 1", "Description", ethers.parseEther("10"), milestoneDeadline, 2
        )
      ).to.be.revertedWith("Not authorized");
    });
  });

  describe("Milestone Submission", function () {
    async function createMilestoneFixture() {
      const fixture = await loadFixture(deployFixture);
      const { milestone, creator } = fixture;

      const milestoneDeadline = (await time.latest()) + 7 * 24 * 60 * 60;
      await milestone.connect(creator).createMilestone(
        1, "Phase 1", "Description", ethers.parseEther("10"), milestoneDeadline, 2
      );

      return fixture;
    }

    it("Should allow beneficiary to submit milestone", async function () {
      const { milestone, beneficiary } = await loadFixture(createMilestoneFixture);

      await expect(
        milestone.connect(beneficiary).submitMilestone(1, "ipfs://QmProof")
      )
        .to.emit(milestone, "MilestoneSubmitted")
        .withArgs(1, "ipfs://QmProof");

      const m = await milestone.getMilestone(1);
      expect(m.status).to.equal(1); // Submitted
      expect(m.proofURI).to.equal("ipfs://QmProof");
    });

    it("Should reject submission without proof", async function () {
      const { milestone, beneficiary } = await loadFixture(createMilestoneFixture);

      await expect(
        milestone.connect(beneficiary).submitMilestone(1, "")
      ).to.be.revertedWith("Proof required");
    });
  });

  describe("Milestone Verification", function () {
    async function submitMilestoneFixture() {
      const fixture = await loadFixture(deployFixture);
      const { milestone, creator, beneficiary } = fixture;

      const milestoneDeadline = (await time.latest()) + 7 * 24 * 60 * 60;
      await milestone.connect(creator).createMilestone(
        1, "Phase 1", "Description", ethers.parseEther("10"), milestoneDeadline, 2
      );
      await milestone.connect(beneficiary).submitMilestone(1, "ipfs://QmProof");

      return fixture;
    }

    it("Should allow verifier to sign milestone", async function () {
      const { milestone, verifier1 } = await loadFixture(submitMilestoneFixture);

      await expect(milestone.connect(verifier1).signMilestone(1))
        .to.emit(milestone, "MilestoneSigned")
        .withArgs(1, verifier1.address);

      expect(await milestone.hasSigned(1, verifier1.address)).to.be.true;
    });

    it("Should auto-verify when enough signatures", async function () {
      const { milestone, verifier1, verifier2 } = await loadFixture(submitMilestoneFixture);

      await milestone.connect(verifier1).signMilestone(1);

      await expect(milestone.connect(verifier2).signMilestone(1))
        .to.emit(milestone, "MilestoneVerified")
        .withArgs(1, verifier2.address);

      const m = await milestone.getMilestone(1);
      expect(m.status).to.equal(2); // Verified
    });

    it("Should reject duplicate signatures", async function () {
      const { milestone, verifier1 } = await loadFixture(submitMilestoneFixture);

      await milestone.connect(verifier1).signMilestone(1);

      await expect(
        milestone.connect(verifier1).signMilestone(1)
      ).to.be.revertedWith("Already signed");
    });
  });

  describe("Milestone Rejection", function () {
    async function submitMilestoneFixture() {
      const fixture = await loadFixture(deployFixture);
      const { milestone, creator, beneficiary } = fixture;

      const milestoneDeadline = (await time.latest()) + 7 * 24 * 60 * 60;
      await milestone.connect(creator).createMilestone(
        1, "Phase 1", "Description", ethers.parseEther("10"), milestoneDeadline, 2
      );
      await milestone.connect(beneficiary).submitMilestone(1, "ipfs://QmProof");

      return fixture;
    }

    it("Should allow verifier to reject milestone", async function () {
      const { milestone, verifier1 } = await loadFixture(submitMilestoneFixture);

      await expect(
        milestone.connect(verifier1).rejectMilestone(1, "Insufficient proof")
      )
        .to.emit(milestone, "MilestoneRejected")
        .withArgs(1, verifier1.address, "Insufficient proof");

      const m = await milestone.getMilestone(1);
      expect(m.status).to.equal(3); // Rejected
    });
  });

  describe("Milestone Disbursement", function () {
    async function verifiedMilestoneFixture() {
      const fixture = await loadFixture(deployFixture);
      const { milestone, creator, beneficiary, verifier1, verifier2 } = fixture;

      const milestoneDeadline = (await time.latest()) + 7 * 24 * 60 * 60;
      await milestone.connect(creator).createMilestone(
        1, "Phase 1", "Description", ethers.parseEther("10"), milestoneDeadline, 2
      );
      await milestone.connect(beneficiary).submitMilestone(1, "ipfs://QmProof");
      await milestone.connect(verifier1).signMilestone(1);
      await milestone.connect(verifier2).signMilestone(1);

      return fixture;
    }

    it("Should reject disbursement before timelock", async function () {
      const { milestone, beneficiary } = await loadFixture(verifiedMilestoneFixture);

      await expect(
        milestone.connect(beneficiary).disburseMilestone(1)
      ).to.be.revertedWith("Timelock not passed");
    });

    it("Should allow disbursement after timelock", async function () {
      const { milestone, beneficiary } = await loadFixture(verifiedMilestoneFixture);

      // Advance time past timelock
      await time.increase(25 * 60 * 60); // 25 hours

      await expect(milestone.connect(beneficiary).disburseMilestone(1))
        .to.emit(milestone, "MilestoneDisbursed");

      const m = await milestone.getMilestone(1);
      expect(m.status).to.equal(4); // Disbursed
    });
  });

  describe("Admin Functions", function () {
    it("Should allow admin to update timelock", async function () {
      const { milestone, admin } = await loadFixture(deployFixture);

      await milestone.connect(admin).setVerificationTimelock(12 * 60 * 60); // 12 hours
      expect(await milestone.verificationTimelock()).to.equal(12 * 60 * 60);
    });

    it("Should reject timelock too long", async function () {
      const { milestone, admin } = await loadFixture(deployFixture);

      await expect(
        milestone.connect(admin).setVerificationTimelock(10 * 24 * 60 * 60)
      ).to.be.revertedWith("Timelock too long");
    });

    it("Should allow admin to update required signatures", async function () {
      const { milestone, admin } = await loadFixture(deployFixture);

      await milestone.connect(admin).setDefaultRequiredSignatures(3);
      expect(await milestone.defaultRequiredSignatures()).to.equal(3);
    });
  });
});
