# Quick Start Guide

## Property Voting System - Get Started in 5 Minutes

### 🚀 Live Demo

Your dApp is currently running at:
- **Local**: http://localhost:1251
- **Network**: http://192.168.0.105:1251

### 📋 Prerequisites Checklist

- [x] Node.js 18.x or 20.x installed
- [x] MetaMask browser extension
- [x] Sepolia testnet ETH (from [Sepolia Faucet](https://sepoliafaucet.com))

### ⚡ Quick Commands

```bash
# Development
npm run compile          # Compile contracts
npm test                 # Run tests
npm run deploy           # Deploy to Sepolia
npm run verify           # Verify on Etherscan

# Interaction
npm run interact         # Interact with contract
npm run simulate         # Run simulation

# Code Quality
npm run lint             # Check code quality
npm run format           # Format code
```

### 🎯 Step-by-Step Deployment

#### 1. Configure Environment (2 minutes)

Create `.env` file:
```env
PRIVATE_KEY=your_wallet_private_key
SEPOLIA_RPC_URL=https://rpc.sepolia.org
ETHERSCAN_API_KEY=your_etherscan_api_key
```

#### 2. Deploy Contract (3 minutes)

```bash
# Compile
npm run compile

# Deploy
npm run deploy
```

Expected output:
```
✅ AnonymousPropertyVotingV2 deployed to: 0x...
✅ Property Manager: 0x...
✅ Current Proposal ID: 1
```

#### 3. Update Frontend (1 minute)

Edit `public/main.js`:
```javascript
const CONFIG = {
    CONTRACT_ADDRESS: '0xYourDeployedContractAddress', // ← Update this
    CHAIN_ID: 11155111,
    // ... rest of config
};
```

#### 4. Test Locally (1 minute)

```bash
PORT=1251 npx http-server public -p 1251 -c-1 --cors
```

Visit: http://localhost:1251

#### 5. Verify Contract (Optional)

```bash
npm run verify
```

### 🎨 Using the Frontend

#### Connect Wallet
1. Click "Connect Wallet"
2. Select MetaMask
3. Approve connection
4. Switch to Sepolia network if needed

#### Register as Resident
1. Enter your unit number (1-200)
2. Click "Register"
3. Confirm transaction in MetaMask
4. Wait for confirmation

#### Create Proposal (Property Manager Only)
1. Fill in proposal details:
   - Title: "Pool Renovation"
   - Description: "Renovate community pool"
   - Duration: 24 hours
2. Click "Create Proposal"
3. Confirm transaction

#### Vote on Proposal
1. View active proposals
2. Click "Vote For" or "Vote Against"
3. Confirm transaction
4. Vote is encrypted and submitted

### 📊 Project Structure Overview

```

├── 📄 Smart Contracts
│   ├── contracts/AnonymousPropertyVotingV2.sol
│   └── Deployment: Sepolia Testnet
│
├── 🎨 Frontend (Vite + Vanilla JS)
│   ├── public/index.html (UI)
│   ├── public/main.js (Logic)
│   └── Tailwind CSS styling
│
├── 🧪 Testing (50+ tests, 92%+ coverage)
│   ├── test/AnonymousPropertyVoting.test.js
│   └── Automated CI/CD
│
├── 📜 Deployment Scripts
│   ├── scripts/deploy.js
│   ├── scripts/verify.js
│   ├── scripts/interact.js
│   └── scripts/simulate.js
│
└── ⚙️ Configuration
    ├── hardhat.config.js
    ├── .solhint.json
    ├── .prettierrc
    └── .github/workflows/
```

### 🔧 Available Scripts

| Command | Description | Usage |
|---------|-------------|-------|
| `npm run compile` | Compile contracts | Before deployment |
| `npm test` | Run test suite | Before commits |
| `npm run deploy` | Deploy to Sepolia | Production deployment |
| `npm run verify` | Verify on Etherscan | After deployment |
| `npm run interact` | Interact with contract | Testing/debugging |
| `npm run simulate` | Full simulation | End-to-end testing |
| `npm run lint` | Check code quality | Before commits |

### 📱 Frontend Features

✅ **Real-time Updates**
- Transaction status monitoring
- Automatic data refresh
- Toast notifications

✅ **Responsive Design**
- Mobile-friendly interface
- Tailwind CSS styling
- Modern UI components

✅ **Web3 Integration**
- MetaMask support
- Network detection
- Transaction history

✅ **Security**
- Encrypted voting
- Anonymous participation
- Secure data handling

### 🌐 Network Information

**Sepolia Testnet**
- **Chain ID**: 11155111
- **RPC URL**: https://rpc.sepolia.org
- **Explorer**: https://sepolia.etherscan.io
- **Faucet**: https://sepoliafaucet.com

### 🔒 Security Best Practices

1. **Never share your private key**
2. **Always test on testnet first**
3. **Verify contracts on Etherscan**
4. **Keep dependencies updated**
5. **Review transactions before signing**

### 📚 Documentation

- **README.md** - Main documentation
- **DEPLOYMENT.md** - Detailed deployment guide
- **PROJECT_SUMMARY.md** - Project overview
- **TESTING.md** - Testing documentation

### 🐛 Common Issues & Solutions

**Issue**: "Insufficient funds"
```bash
# Get testnet ETH from faucet
https://sepoliafaucet.com
```

**Issue**: "Wrong network"
```bash
# Switch MetaMask to Sepolia
Chain ID: 11155111
```

**Issue**: "Contract not found"
```bash
# Recompile contracts
npm run clean && npm run compile
```

**Issue**: "Transaction failed"
```bash
# Check gas price and balance
# Retry transaction
```

### 🎯 Next Steps

1. **Deploy to Sepolia** ✓
2. **Verify on Etherscan** ✓
3. **Test all features** ✓
4. **Deploy to GitHub Pages** (optional)
5. **Share with community** ✓

### 💡 Pro Tips

- Use `npm run test:coverage` to check code coverage
- Run `npm run lint` before committing
- Keep `.env` file secure (never commit it)
- Monitor gas costs with `npm run test:gas`
- Use `npm run simulate` for full testing

### 📞 Support

- Check logs for errors
- Review Etherscan for transaction details
- Test on local network first
- Read documentation thoroughly

---

**Current Status**: ✅ Running on port 1251
**Version**: 2.0.0
**Framework**: Hardhat + Vite
**Network**: Sepolia Testnet

🎉 **You're all set! Happy voting!**
