# 🚀 Next.js Frontend Deployment Guide

## Anonymous Property Voting - Modern Frontend Stack

**Migration Completed**: October 17, 2024
**Status**: ✅ Ready for Vercel Deployment

---

## 📦 What Was Built

A complete Next.js + React + TypeScript frontend replacing the vanilla JavaScript implementation with:

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript for full type safety
- **Styling**: Tailwind CSS with glassmorphism design
- **Web3**: wagmi v2 + RainbowKit for wallet integration
- **Deployment**: Vercel-optimized configuration

---

## 🎯 Quick Start - Deploy in 5 Minutes

### Step 1: Get WalletConnect Project ID

1. Go to https://cloud.walletconnect.com/
2. Sign up / Log in
3. Create a new project
4. Copy your Project ID

### Step 2: Deploy to Vercel

**Option A: Using Vercel Dashboard**

1. Go to https://vercel.com
2. Click "Import Project"
3. Select your GitHub repository
4. Configure:
   - **Root Directory**: `frontend`
   - **Framework Preset**: Next.js
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

5. Add Environment Variables:
   ```
   NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id_here
   NEXT_PUBLIC_CONTRACT_ADDRESS=0x6Ece9C29F6E47876bC3809BAC99c175273E184aB
   NEXT_PUBLIC_CHAIN_ID=11155111
   NEXT_PUBLIC_NETWORK_NAME=Sepolia
   ```

6. Click "Deploy"

**Option B: Using Vercel CLI**

```bash
# Install Vercel CLI
npm i -g vercel

# Navigate to frontend
cd frontend

# Login to Vercel
vercel login

# Deploy
vercel

# When prompted:
# - Set root directory: ./
# - Framework: Next.js
# - Add environment variables when prompted

# Deploy to production
vercel --prod
```

---

## 📂 Project Structure

```
frontend/
├── app/                    # Next.js App Router
│   ├── globals.css        # Tailwind + custom styles
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Home page
│   └── providers.tsx       # Web3 providers
├── components/             # React components
│   ├── Header.tsx
│   ├── RegisterSection.tsx
│   ├── CreateProposalSection.tsx
│   ├── ProposalList.tsx
│   ├── ProposalCard.tsx
│   └── StatsSection.tsx
├── hooks/                  # Custom React hooks
│   └── useToast.tsx
├── lib/                    # Configuration
│   ├── wagmi.ts
│   └── contract.ts
├── utils/                  # Utilities
│   └── date.ts
├── public/                 # Static assets
├── .env.example            # Environment template
├── .env.local              # Local environment (git ignored)
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.js
├── vercel.json
└── README.md
```

---

## 🔧 Local Development

```bash
# 1. Navigate to frontend directory
cd frontend

# 2. Install dependencies
npm install

# 3. Create .env.local file
cp .env.example .env.local

# 4. Edit .env.local and add your WalletConnect Project ID
# NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id_here

# 5. Start development server
npm run dev

# 6. Open browser
# http://localhost:3000
```

---

## 🌐 Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` | WalletConnect Project ID | `a1b2c3d4e5f6...` |
| `NEXT_PUBLIC_CONTRACT_ADDRESS` | Voting contract address | `0x6Ece9C29...` |
| `NEXT_PUBLIC_CHAIN_ID` | Network chain ID | `11155111` (Sepolia) |
| `NEXT_PUBLIC_NETWORK_NAME` | Network name | `Sepolia` |

### Where to Add Variables

**Local Development**: `.env.local` file

**Vercel Deployment**:
1. Go to your project in Vercel dashboard
2. Settings → Environment Variables
3. Add each variable
4. Redeploy if needed

---

## ✅ Pre-Deployment Checklist

- [ ] WalletConnect Project ID obtained
- [ ] Environment variables configured
- [ ] Code pushed to GitHub
- [ ] Vercel account created
- [ ] Repository imported to Vercel
- [ ] Environment variables added in Vercel
- [ ] Deployment successful
- [ ] Live site tested with wallet connection
- [ ] Proposal creation tested (owner only)
- [ ] Voting tested (registered residents)

---

## 🎨 Features Overview

### For All Users
- ✅ Connect wallet (MetaMask, WalletConnect, Coinbase, etc.)
- ✅ View all proposals
- ✅ See real-time voting statistics
- ✅ Responsive design (mobile, tablet, desktop)

### For Residents
- ✅ Register with unit number (encrypted)
- ✅ Vote on active proposals anonymously
- ✅ View voting history

### For Property Owners
- ✅ Create new proposals
- ✅ Set voting duration (1-7 days)
- ✅ Close expired proposals
- ✅ Request results revelation

---

## 🔐 Security Features

- ✅ Encrypted unit numbers (FHE)
- ✅ Encrypted votes (FHE)
- ✅ Owner-only proposal creation
- ✅ Time-locked voting periods
- ✅ Gateway-verified results
- ✅ Client-side wallet signatures

---

## 📊 Technology Stack

### Frontend
- **Next.js 14**: React framework with App Router
- **React 18**: UI library
- **TypeScript**: Type-safe JavaScript
- **Tailwind CSS**: Utility-first CSS framework

### Web3
- **wagmi v2**: React hooks for Ethereum
- **RainbowKit**: Wallet connection UI
- **viem**: TypeScript Ethereum library
- **ethers.js v5**: Ethereum library (fallback)

### Deployment
- **Vercel**: Hosting and CDN
- **GitHub**: Version control
- **npm**: Package management

---

## 🚀 Deployment Workflow

### Automatic Deployments

Once connected to Vercel:

1. **Push to `main` branch** → Production deployment
2. **Push to other branches** → Preview deployment
3. **Pull requests** → Preview deployments with unique URLs

### Manual Deployments

```bash
# Deploy to preview
vercel

# Deploy to production
vercel --prod

# Check deployment status
vercel ls
```

---

## 🔄 Update Workflow

### Update Frontend

```bash
# 1. Make changes to frontend code
cd frontend

# 2. Test locally
npm run dev

# 3. Build to verify
npm run build

# 4. Commit and push
git add .
git commit -m "Update: description"
git push origin main

# Vercel will automatically deploy
```

### Update Contract Address

If you deploy a new contract:

1. Update `NEXT_PUBLIC_CONTRACT_ADDRESS` in Vercel
2. Update `lib/contract.ts` if ABI changed
3. Redeploy

---

## 🐛 Troubleshooting

### Build Fails

**Problem**: Build fails with TypeScript errors
**Solution**:
```bash
cd frontend
rm -rf .next node_modules
npm install
npm run build
```

### Wallet Won't Connect

**Problem**: Wallet connection fails
**Solution**:
- Check WalletConnect Project ID is correct
- Ensure you're on Sepolia network
- Try disconnecting and reconnecting wallet

### Transaction Fails

**Problem**: Transactions fail or revert
**Solution**:
- Verify you have Sepolia ETH
- Check you're registered as resident (for voting)
- Ensure proposal is still active
- Check you haven't already voted

### Environment Variables Not Working

**Problem**: Environment variables undefined
**Solution**:
- Ensure variables start with `NEXT_PUBLIC_`
- Restart development server after adding variables
- In Vercel: redeploy after adding variables

---

## 📈 Performance

### Build Optimization
- ✅ Automatic code splitting
- ✅ Tree shaking enabled
- ✅ Image optimization ready
- ✅ CSS purging (Tailwind)

### Runtime Performance
- ✅ React 18 concurrent features
- ✅ wagmi query caching
- ✅ Optimized re-renders
- ✅ Lazy component loading

---

## 📝 Post-Deployment

### After First Deployment

1. **Test all features**:
   - Wallet connection
   - Resident registration
   - Proposal creation (if owner)
   - Voting functionality
   - Results display

2. **Update repository README**:
   - Add live demo URL
   - Update deployment status
   - Add screenshots

3. **Monitor**:
   - Vercel Analytics (free tier)
   - Error tracking
   - User feedback

---

## 🔗 Useful Links

### Development
- **Next.js Docs**: https://nextjs.org/docs
- **Tailwind CSS**: https://tailwindcss.com/docs
- **wagmi Docs**: https://wagmi.sh
- **RainbowKit**: https://rainbowkit.com

### Deployment
- **Vercel Dashboard**: https://vercel.com/dashboard
- **Vercel Docs**: https://vercel.com/docs
- **WalletConnect Cloud**: https://cloud.walletconnect.com/

### Smart Contracts
- **Contract Address**: `0x6Ece9C29F6E47876bC3809BAC99c175273E184aB`
- **Sepolia Explorer**: https://sepolia.etherscan.io/
- **fhEVM Docs**: https://docs.zama.ai/fhevm

---

## 🎯 Success Metrics

After deployment, you should have:

✅ Live URL from Vercel (e.g., `your-project.vercel.app`)
✅ Working wallet connection
✅ Functional voting system
✅ Responsive on all devices
✅ Fast load times (<2s)
✅ No console errors
✅ SSL certificate (automatic)
✅ Custom domain ready (optional)

---

## 🎉 Deployment Complete!

Once deployed, your Anonymous Property Voting frontend will be:

- 🌐 **Live** on Vercel's global CDN
- 🔒 **Secure** with HTTPS by default
- ⚡ **Fast** with automatic optimization
- 📱 **Responsive** on all devices
- 🔄 **Auto-updating** with each git push

**Next Steps**:
1. Deploy using guide above
2. Test all functionality
3. Share live URL
4. Collect feedback
5. Iterate and improve

---

**Deployment Guide Version**: 1.0.0
**Last Updated**: October 17, 2024
**License**: MIT

🚀 **Happy Deploying!**
