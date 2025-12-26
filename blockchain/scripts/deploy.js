const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Starting FUN Charity Smart Contracts Deployment...\n");

  const [deployer] = await ethers.getSigners();
  const balance = await ethers.provider.getBalance(deployer.address);

  console.log("📋 Deployment Configuration:");
  console.log("   Deployer:", deployer.address);
  console.log("   Balance:", ethers.formatEther(balance), "ETH/MATIC");
  console.log("   Network:", (await ethers.provider.getNetwork()).name);
  console.log("");

  // 1. Deploy CampaignRegistry
  console.log("1️⃣  Deploying CampaignRegistry...");
  const CampaignRegistry = await ethers.getContractFactory("CampaignRegistry");
  const campaignRegistry = await CampaignRegistry.deploy(deployer.address);
  await campaignRegistry.waitForDeployment();
  const campaignRegistryAddress = await campaignRegistry.getAddress();
  console.log("   ✅ CampaignRegistry deployed at:", campaignRegistryAddress);

  // 2. Deploy DonationVault
  console.log("\n2️⃣  Deploying DonationVault...");
  const DonationVault = await ethers.getContractFactory("DonationVault");
  const donationVault = await DonationVault.deploy(
    deployer.address,
    campaignRegistryAddress,
    deployer.address // Fee recipient (change in production)
  );
  await donationVault.waitForDeployment();
  const donationVaultAddress = await donationVault.getAddress();
  console.log("   ✅ DonationVault deployed at:", donationVaultAddress);

  // 3. Deploy MilestoneDisbursement
  console.log("\n3️⃣  Deploying MilestoneDisbursement...");
  const MilestoneDisbursement = await ethers.getContractFactory("MilestoneDisbursement");
  const milestoneDisbursement = await MilestoneDisbursement.deploy(
    deployer.address,
    campaignRegistryAddress,
    donationVaultAddress
  );
  await milestoneDisbursement.waitForDeployment();
  const milestoneAddress = await milestoneDisbursement.getAddress();
  console.log("   ✅ MilestoneDisbursement deployed at:", milestoneAddress);

  // 4. Configure CampaignRegistry to allow DonationVault
  console.log("\n4️⃣  Configuring contracts...");
  const setVaultTx = await campaignRegistry.setDonationVault(donationVaultAddress);
  await setVaultTx.wait();
  console.log("   ✅ DonationVault registered in CampaignRegistry");

  // 5. Summary
  console.log("\n" + "=".repeat(60));
  console.log("📝 DEPLOYMENT SUMMARY");
  console.log("=".repeat(60));
  console.log("\n🏛️  Contract Addresses:");
  console.log(`   CampaignRegistry:      ${campaignRegistryAddress}`);
  console.log(`   DonationVault:         ${donationVaultAddress}`);
  console.log(`   MilestoneDisbursement: ${milestoneAddress}`);

  console.log("\n🔐 Roles Configured:");
  console.log(`   Admin:         ${deployer.address}`);
  console.log(`   Fee Recipient: ${deployer.address}`);

  console.log("\n⚙️  Platform Settings:");
  console.log("   Platform Fee: 2.5%");
  console.log("   Verification Timelock: 24 hours");
  console.log("   Min Campaign Duration: 1 day");
  console.log("   Max Campaign Duration: 365 days");

  console.log("\n📋 Next Steps:");
  console.log("   1. Verify contracts on block explorer");
  console.log("   2. Add NGO_VERIFIER_ROLE to trusted verifiers");
  console.log("   3. Add allowed ERC20 tokens (USDT, USDC, etc.)");
  console.log("   4. Update fee recipient to multisig wallet");
  console.log("   5. Transfer DEFAULT_ADMIN_ROLE to secure multisig");

  console.log("\n🔍 Verification Commands:");
  console.log(`   npx hardhat verify --network <network> ${campaignRegistryAddress} "${deployer.address}"`);
  console.log(`   npx hardhat verify --network <network> ${donationVaultAddress} "${deployer.address}" "${campaignRegistryAddress}" "${deployer.address}"`);
  console.log(`   npx hardhat verify --network <network> ${milestoneAddress} "${deployer.address}" "${campaignRegistryAddress}" "${donationVaultAddress}"`);

  // Return addresses for programmatic use
  return {
    campaignRegistry: campaignRegistryAddress,
    donationVault: donationVaultAddress,
    milestoneDisbursement: milestoneAddress,
    deployer: deployer.address,
  };
}

main()
  .then((addresses) => {
    console.log("\n✅ Deployment completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Deployment failed:", error);
    process.exit(1);
  });
