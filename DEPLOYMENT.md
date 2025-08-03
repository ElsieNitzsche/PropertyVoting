# Deployment Guide

## Property Voting System - Complete Deployment Instructions

### Prerequisites

- Node.js 18.x or 20.x
- npm or yarn
- MetaMask or compatible wallet
- Sepolia testnet ETH

### Environment Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd property-voting-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**

   Create a `.env` file in the root directory:
   ```env
   # Deployment Account
   PRIVATE_KEY=your_private_key_here

   # Network RPC URLs
   SEPOLIA_RPC_URL=https://rpc.sepolia.org

   # Etherscan API Key (for verification)
   ETHERSCAN_API_KEY=your_etherscan_api_key

   # Optional: Gateway Contract Address
   GATEWAY_CONTRACT_ADDRESS=0x0000000000000000000000000000000000000000
   ```

### Smart Contract Deployment

#### Step 1: Compile Contracts

```bash
npm run compile
```

This will:
- Compile all Solidity contracts
- Generate TypeScript bindings
- Create artifacts in `artifacts/` directory

#### Step 2: Run Tests

```bash
# Run all tests
npm test

# Run with gas reporting
npm run test:gas

# Generate coverage report
npm run test:coverage
```

#### Step 3: Deploy to Sepolia

```bash
npm run deploy:sepolia
# or
npx hardhat run scripts/deploy.js --network sepolia
```

Expected output:
```
========================================
Property Voting System Deployment
========================================

Deployer Account: 0x...
Account Balance: X.XX ETH

✅ AnonymousPropertyVotingV2 deployed to: 0x...
✅ Property Manager: 0x...
✅ Current Proposal ID: 1
```

The deployment script will:
- Deploy the main voting contract
- Verify contract initialization
- Save deployment info to `deployment-info.json`
- Display verification command

#### Step 4: Verify Contract on Etherscan

**Option 1: Using the verify script**
```bash
npm run verify
# or
npx hardhat run scripts/verify.js --network sepolia
```

**Option 2: Manual verification**
```bash
npx hardhat verify --network sepolia <CONTRACT_ADDRESS> <GATEWAY_ADDRESS>
```

Example:
```bash
npx hardhat verify --network sepolia 0x1234... 0x0000000000000000000000000000000000000000
```

### Frontend Deployment

#### Local Development

```bash
# Serve on port 1251
PORT=1251 npx http-server public -p 1251 -c-1 --cors
```

Visit: `http://localhost:1251`

#### GitHub Pages Deployment

1. **Update contract address in public/main.js**
   ```javascript
   const CONFIG = {
       CONTRACT_ADDRESS: '0xYourContractAddress',
       // ... other config
   };
   ```

2. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Deploy to production"
   git push origin main
   ```

3. **GitHub Actions will automatically:**
   - Run tests
   - Build the project
   - Deploy to GitHub Pages

4. **Access your dApp**
   ```
   https://<username>.github.io/<repository-name>/
   ```

### Deployment Checklist

- [ ] Environment variables configured
- [ ] Contracts compiled successfully
- [ ] All tests passing
- [ ] Deployed to Sepolia testnet
- [ ] Contract verified on Etherscan
- [ ] Deployment info saved
- [ ] Frontend updated with contract address
- [ ] GitHub Pages configured
- [ ] CI/CD workflows running

### Contract Addresses

After deployment, update these files:

1. **Frontend Config** (`public/main.js`)
   ```javascript
   CONTRACT_ADDRESS: '0xYourContractAddress'
   ```

2. **Environment File** (`.env`)
   ```env
   VOTING_CONTRACT_ADDRESS=0xYourContractAddress
   ```

3. **Documentation** (this file)
   - Network: Sepolia
   - Contract: `0xYourContractAddress`
   - Etherscan: `https://sepolia.etherscan.io/address/0xYourContractAddress`

### Interacting with Deployed Contract

#### Using Scripts

**Interact with contract**
```bash
npm run interact
```

**Simulate voting process**
```bash
npm run simulate
```

#### Using Etherscan

1. Go to contract page on Etherscan
2. Click "Contract" tab
3. Click "Write Contract"
4. Connect wallet
5. Execute functions

#### Using Frontend

1. Visit deployed dApp URL
2. Connect MetaMask wallet
3. Ensure you're on Sepolia network
4. Interact through UI

### Network Information

**Sepolia Testnet**
- Chain ID: 11155111
- RPC URL: https://rpc.sepolia.org
- Block Explorer: https://sepolia.etherscan.io
- Faucet: https://sepoliafaucet.com

### Troubleshooting

**Issue: Insufficient funds**
```
Error: insufficient funds for gas
```
Solution: Get Sepolia ETH from faucet

**Issue: Contract already verified**
```
Error: Already Verified
```
Solution: This is normal, verification already complete

**Issue: Wrong network**
```
Error: unsupported network
```
Solution: Switch MetaMask to Sepolia testnet

**Issue: Nonce too low**
```
Error: nonce has already been used
```
Solution: Reset MetaMask account or wait for transaction to clear

### Gas Optimization

Current gas usage (approximate):
- Deploy Contract: ~2,500,000 gas
- Register Resident: ~150,000 gas
- Create Proposal: ~200,000 gas
- Submit Vote: ~180,000 gas
- End Proposal: ~120,000 gas

### Security Considerations

1. **Never commit `.env` file** - Contains private keys
2. **Use hardware wallet** for production deployments
3. **Audit contracts** before mainnet deployment
4. **Test thoroughly** on testnet first
5. **Monitor contract** after deployment

### Support

For issues or questions:
1. Check deployment logs
2. Review contract on Etherscan
3. Test on local network first
4. Create GitHub issue with details

---

**Deployment Date**: Update after deployment
**Contract Version**: v2.0.0
**Network**: Sepolia Testnet
**Status**: ✅ Ready for deployment
