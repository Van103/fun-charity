# FUN Charity Smart Contracts

Smart contracts cho nền tảng từ thiện FUN Charity, được xây dựng trên EVM (Ethereum/Polygon).

## 📋 Tổng quan

Hệ thống bao gồm 3 smart contracts chính:

### 1. CampaignRegistry
- Quản lý tạo và cập nhật campaigns
- Lưu trữ metadata trên IPFS
- Kiểm soát trạng thái campaign (Active, Paused, Completed, Cancelled)

### 2. DonationVault
- Nhận donations (Native token + ERC20)
- Quản lý số dư từng campaign
- Thu phí platform (2.5% mặc định)
- Cho phép beneficiary rút tiền

### 3. MilestoneDisbursement
- Quản lý milestone-based disbursement
- Yêu cầu multi-sig verification từ NGO verifiers
- Timelock protection (24 giờ)
- Theo dõi progress của campaigns

## 🛠️ Cài đặt

```bash
cd blockchain
npm install
```

## ⚙️ Cấu hình

1. Copy file `.env.example` thành `.env`:
```bash
cp .env.example .env
```

2. Điền các giá trị:
```env
PRIVATE_KEY=your_wallet_private_key
POLYGON_RPC_URL=https://rpc-amoy.polygon.technology
POLYGONSCAN_API_KEY=your_api_key
```

## 🧪 Chạy Tests

```bash
# Chạy tất cả tests
npm test

# Chạy với coverage
npm run test:coverage

# Chạy test cụ thể
npx hardhat test test/CampaignRegistry.test.js
```

## 🚀 Deploy

### Local Development

1. Khởi động local node:
```bash
npm run node
```

2. Deploy lên local:
```bash
npm run deploy:local
```

### Polygon Amoy Testnet

1. Đảm bảo có MATIC testnet trong wallet (lấy từ [Polygon Faucet](https://faucet.polygon.technology/))

2. Deploy:
```bash
npm run deploy:amoy
```

### Polygon Mainnet

```bash
npm run deploy:polygon
```

## 📝 Verify Contracts

Sau khi deploy, verify contracts trên block explorer:

```bash
# CampaignRegistry
npx hardhat verify --network polygonAmoy <CAMPAIGN_REGISTRY_ADDRESS> "<ADMIN_ADDRESS>"

# DonationVault
npx hardhat verify --network polygonAmoy <DONATION_VAULT_ADDRESS> "<ADMIN_ADDRESS>" "<REGISTRY_ADDRESS>" "<FEE_RECIPIENT>"

# MilestoneDisbursement
npx hardhat verify --network polygonAmoy <MILESTONE_ADDRESS> "<ADMIN_ADDRESS>" "<REGISTRY_ADDRESS>" "<VAULT_ADDRESS>"
```

## 🔐 Roles & Permissions

| Role | Mô tả |
|------|-------|
| `DEFAULT_ADMIN_ROLE` | Quản lý tất cả roles |
| `ADMIN_ROLE` | Pause/unpause, cấu hình contracts |
| `NGO_VERIFIER_ROLE` | Verify milestones |
| `BENEFICIARY_ROLE` | Submit milestones |
| `DONATION_VAULT_ROLE` | Update campaign raised amount |

## 📊 Platform Settings

| Setting | Giá trị mặc định |
|---------|------------------|
| Platform Fee | 2.5% (250 basis points) |
| Max Fee | 5% (500 basis points) |
| Min Campaign Duration | 1 ngày |
| Max Campaign Duration | 365 ngày |
| Verification Timelock | 24 giờ |
| Required Signatures | 2 |

## 🔄 Events

### CampaignRegistry
- `CampaignCreated(campaignId, creator, beneficiary, title, targetAmount, deadline, metadataURI)`
- `CampaignUpdated(campaignId, status, raisedAmount)`
- `CampaignClosed(campaignId, finalStatus, totalRaised)`

### DonationVault
- `DonationReceived(donor, campaignId, amount, tokenAddress, proofHash)`
- `FundsWithdrawn(campaignId, beneficiary, amount, tokenAddress)`
- `TokenAllowlistUpdated(token, allowed)`
- `PlatformFeeUpdated(newFeePercent)`

### MilestoneDisbursement
- `MilestoneCreated(milestoneId, campaignId, title, amount, deadline)`
- `MilestoneSubmitted(milestoneId, proofURI)`
- `MilestoneSigned(milestoneId, signer)`
- `MilestoneVerified(milestoneId, verifier)`
- `MilestoneRejected(milestoneId, rejector, reason)`
- `MilestoneDisbursed(milestoneId, campaignId, beneficiary, amount)`

## 🔗 Tích hợp với Frontend

```typescript
import { ethers } from 'ethers';

// Connect to contracts
const provider = new ethers.BrowserProvider(window.ethereum);
const signer = await provider.getSigner();

const campaignRegistry = new ethers.Contract(
  CAMPAIGN_REGISTRY_ADDRESS,
  CampaignRegistryABI,
  signer
);

const donationVault = new ethers.Contract(
  DONATION_VAULT_ADDRESS,
  DonationVaultABI,
  signer
);

// Create campaign
const tx = await campaignRegistry.createCampaign(
  "Help Children",
  "A campaign to help children",
  ethers.parseEther("100"),
  Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60, // 30 days
  beneficiaryAddress,
  "ipfs://QmMetadata"
);

// Donate to campaign
const donateTx = await donationVault.donate(1, {
  value: ethers.parseEther("1")
});
```

## 🛡️ Security Features

- **AccessControl**: Role-based permissions
- **ReentrancyGuard**: Chống reentrancy attacks
- **Pausable**: Emergency pause functionality
- **SafeERC20**: Safe token transfers
- **Signature Verification**: ECDSA for multi-sig

## 📁 Cấu trúc thư mục

```
blockchain/
├── contracts/
│   ├── interfaces/
│   │   └── ICampaignRegistry.sol
│   ├── CampaignRegistry.sol
│   ├── DonationVault.sol
│   └── MilestoneDisbursement.sol
├── scripts/
│   └── deploy.js
├── test/
│   ├── CampaignRegistry.test.js
│   ├── DonationVault.test.js
│   └── MilestoneDisbursement.test.js
├── hardhat.config.js
├── package.json
└── README.md
```

## 📜 License

MIT
