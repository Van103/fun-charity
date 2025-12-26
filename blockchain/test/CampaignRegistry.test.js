const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time, loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");

describe("CampaignRegistry", function () {
  async function deployFixture() {
    const [admin, creator, beneficiary, other] = await ethers.getSigners();

    const CampaignRegistry = await ethers.getContractFactory("CampaignRegistry");
    const registry = await CampaignRegistry.deploy(admin.address);

    return { registry, admin, creator, beneficiary, other };
  }

  describe("Deployment", function () {
    it("Should set the correct admin", async function () {
      const { registry, admin } = await loadFixture(deployFixture);
      const ADMIN_ROLE = await registry.ADMIN_ROLE();
      expect(await registry.hasRole(ADMIN_ROLE, admin.address)).to.be.true;
    });

    it("Should start with 0 campaigns", async function () {
      const { registry } = await loadFixture(deployFixture);
      expect(await registry.getTotalCampaigns()).to.equal(0);
    });
  });

  describe("Campaign Creation", function () {
    it("Should create a campaign successfully", async function () {
      const { registry, creator, beneficiary } = await loadFixture(deployFixture);

      const deadline = (await time.latest()) + 30 * 24 * 60 * 60; // 30 days
      const targetAmount = ethers.parseEther("10");

      await expect(
        registry.connect(creator).createCampaign(
          "Help Children",
          "A campaign to help children",
          targetAmount,
          deadline,
          beneficiary.address,
          "ipfs://QmTest123"
        )
      )
        .to.emit(registry, "CampaignCreated")
        .withArgs(
          1,
          creator.address,
          beneficiary.address,
          "Help Children",
          targetAmount,
          deadline,
          "ipfs://QmTest123"
        );

      expect(await registry.getTotalCampaigns()).to.equal(1);
    });

    it("Should store campaign details correctly", async function () {
      const { registry, creator, beneficiary } = await loadFixture(deployFixture);

      const deadline = (await time.latest()) + 30 * 24 * 60 * 60;
      const targetAmount = ethers.parseEther("10");

      await registry.connect(creator).createCampaign(
        "Help Children",
        "Description",
        targetAmount,
        deadline,
        beneficiary.address,
        "ipfs://QmTest123"
      );

      const campaign = await registry.getCampaign(1);

      expect(campaign.id).to.equal(1);
      expect(campaign.title).to.equal("Help Children");
      expect(campaign.targetAmount).to.equal(targetAmount);
      expect(campaign.beneficiaryWallet).to.equal(beneficiary.address);
      expect(campaign.creator).to.equal(creator.address);
      expect(campaign.status).to.equal(0); // Active
    });

    it("Should reject empty title", async function () {
      const { registry, creator, beneficiary } = await loadFixture(deployFixture);

      const deadline = (await time.latest()) + 30 * 24 * 60 * 60;

      await expect(
        registry.connect(creator).createCampaign(
          "",
          "Description",
          ethers.parseEther("10"),
          deadline,
          beneficiary.address,
          "ipfs://QmTest"
        )
      ).to.be.revertedWith("Invalid title length");
    });

    it("Should reject zero target amount", async function () {
      const { registry, creator, beneficiary } = await loadFixture(deployFixture);

      const deadline = (await time.latest()) + 30 * 24 * 60 * 60;

      await expect(
        registry.connect(creator).createCampaign(
          "Campaign",
          "Description",
          0,
          deadline,
          beneficiary.address,
          "ipfs://QmTest"
        )
      ).to.be.revertedWith("Target amount must be positive");
    });

    it("Should reject deadline too soon", async function () {
      const { registry, creator, beneficiary } = await loadFixture(deployFixture);

      const deadline = (await time.latest()) + 60 * 60; // 1 hour

      await expect(
        registry.connect(creator).createCampaign(
          "Campaign",
          "Description",
          ethers.parseEther("10"),
          deadline,
          beneficiary.address,
          "ipfs://QmTest"
        )
      ).to.be.revertedWith("Deadline too soon");
    });

    it("Should reject deadline too far", async function () {
      const { registry, creator, beneficiary } = await loadFixture(deployFixture);

      const deadline = (await time.latest()) + 400 * 24 * 60 * 60; // 400 days

      await expect(
        registry.connect(creator).createCampaign(
          "Campaign",
          "Description",
          ethers.parseEther("10"),
          deadline,
          beneficiary.address,
          "ipfs://QmTest"
        )
      ).to.be.revertedWith("Deadline too far");
    });
  });

  describe("Campaign Status Updates", function () {
    it("Should allow creator to update status", async function () {
      const { registry, creator, beneficiary } = await loadFixture(deployFixture);

      const deadline = (await time.latest()) + 30 * 24 * 60 * 60;

      await registry.connect(creator).createCampaign(
        "Campaign",
        "Description",
        ethers.parseEther("10"),
        deadline,
        beneficiary.address,
        "ipfs://QmTest"
      );

      await expect(registry.connect(creator).updateCampaignStatus(1, 1)) // Paused
        .to.emit(registry, "CampaignUpdated")
        .withArgs(1, 1, 0);

      const campaign = await registry.getCampaign(1);
      expect(campaign.status).to.equal(1); // Paused
    });

    it("Should allow admin to update status", async function () {
      const { registry, admin, creator, beneficiary } = await loadFixture(deployFixture);

      const deadline = (await time.latest()) + 30 * 24 * 60 * 60;

      await registry.connect(creator).createCampaign(
        "Campaign",
        "Description",
        ethers.parseEther("10"),
        deadline,
        beneficiary.address,
        "ipfs://QmTest"
      );

      await registry.connect(admin).updateCampaignStatus(1, 3); // Cancelled
      const campaign = await registry.getCampaign(1);
      expect(campaign.status).to.equal(3);
    });

    it("Should emit CampaignClosed for final states", async function () {
      const { registry, creator, beneficiary } = await loadFixture(deployFixture);

      const deadline = (await time.latest()) + 30 * 24 * 60 * 60;

      await registry.connect(creator).createCampaign(
        "Campaign",
        "Description",
        ethers.parseEther("10"),
        deadline,
        beneficiary.address,
        "ipfs://QmTest"
      );

      await expect(registry.connect(creator).updateCampaignStatus(1, 2)) // Completed
        .to.emit(registry, "CampaignClosed")
        .withArgs(1, 2, 0);
    });

    it("Should reject unauthorized status updates", async function () {
      const { registry, creator, beneficiary, other } = await loadFixture(deployFixture);

      const deadline = (await time.latest()) + 30 * 24 * 60 * 60;

      await registry.connect(creator).createCampaign(
        "Campaign",
        "Description",
        ethers.parseEther("10"),
        deadline,
        beneficiary.address,
        "ipfs://QmTest"
      );

      await expect(
        registry.connect(other).updateCampaignStatus(1, 1)
      ).to.be.revertedWith("Not authorized");
    });
  });

  describe("Pause Functionality", function () {
    it("Should allow admin to pause", async function () {
      const { registry, admin } = await loadFixture(deployFixture);

      await registry.connect(admin).pause();
      expect(await registry.paused()).to.be.true;
    });

    it("Should block campaign creation when paused", async function () {
      const { registry, admin, creator, beneficiary } = await loadFixture(deployFixture);

      await registry.connect(admin).pause();

      const deadline = (await time.latest()) + 30 * 24 * 60 * 60;

      await expect(
        registry.connect(creator).createCampaign(
          "Campaign",
          "Description",
          ethers.parseEther("10"),
          deadline,
          beneficiary.address,
          "ipfs://QmTest"
        )
      ).to.be.revertedWithCustomError(registry, "EnforcedPause");
    });

    it("Should allow admin to unpause", async function () {
      const { registry, admin } = await loadFixture(deployFixture);

      await registry.connect(admin).pause();
      await registry.connect(admin).unpause();
      expect(await registry.paused()).to.be.false;
    });
  });

  describe("Creator Campaigns Tracking", function () {
    it("Should track campaigns by creator", async function () {
      const { registry, creator, beneficiary } = await loadFixture(deployFixture);

      const deadline = (await time.latest()) + 30 * 24 * 60 * 60;

      await registry.connect(creator).createCampaign(
        "Campaign 1",
        "Description",
        ethers.parseEther("10"),
        deadline,
        beneficiary.address,
        "ipfs://QmTest1"
      );

      await registry.connect(creator).createCampaign(
        "Campaign 2",
        "Description",
        ethers.parseEther("20"),
        deadline,
        beneficiary.address,
        "ipfs://QmTest2"
      );

      const creatorCampaigns = await registry.getCampaignsByCreator(creator.address);
      expect(creatorCampaigns.length).to.equal(2);
      expect(creatorCampaigns[0]).to.equal(1);
      expect(creatorCampaigns[1]).to.equal(2);
    });
  });
});
