# Anonymous Property Voting - Frontend

Modern Next.js + React + TypeScript frontend for the Anonymous Property Voting system.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom glassmorphism design
- **Web3**: wagmi + RainbowKit + viem
- **Network**: Ethereum Sepolia Testnet

## Features

- 🔐 **Wallet Connection**: RainbowKit integration for seamless wallet connectivity
- 🎨 **Glassmorphism UI**: Modern design with backdrop blur and gradients
- 📱 **Responsive**: Mobile-first design that works on all devices
- ⚡ **Real-time Updates**: Automatic contract state updates
- 🔔 **Toast Notifications**: User-friendly feedback system
- 🌐 **TypeScript**: Full type safety throughout the application

## Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- MetaMask or compatible Web3 wallet
- Sepolia testnet ETH

### Installation

```bash
# Install dependencies
npm install

# Create environment file
cp .env.example .env.local

# Add your WalletConnect Project ID to .env.local
# Get one from: https://cloud.walletconnect.com/
```

### Development

```bash
# Start development server
npm run dev

# Open http://localhost:3000
```

### Build

```bash
# Build for production
npm run build

# Start production server
npm start
```

## Environment Variables

Create a `.env.local` file with:

```bash
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id
NEXT_PUBLIC_CONTRACT_ADDRESS=0x6Ece9C29F6E47876bC3809BAC99c175273E184aB
NEXT_PUBLIC_CHAIN_ID=11155111
NEXT_PUBLIC_NETWORK_NAME=Sepolia
```

## Deployment to Vercel

### Option 1: Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Deploy to production
vercel --prod
```

### Option 2: GitHub Integration

1. Push code to GitHub repository
2. Import project in Vercel dashboard
3. Add environment variables in Vercel project settings
4. Deploy automatically

### Environment Variables on Vercel

Add these in your Vercel project settings:

- `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`: Your WalletConnect project ID
- `NEXT_PUBLIC_CONTRACT_ADDRESS`: Contract address (default: 0x6Ece9C29F6E47876bC3809BAC99c175273E184aB)
- `NEXT_PUBLIC_CHAIN_ID`: Chain ID (default: 11155111)
- `NEXT_PUBLIC_NETWORK_NAME`: Network name (default: Sepolia)

## Project Structure

```
frontend/
├── app/
│   ├── globals.css          # Global styles with Tailwind
│   ├── layout.tsx            # Root layout
│   ├── page.tsx              # Home page
│   └── providers.tsx         # Web3 providers
├── components/
│   ├── Header.tsx            # Navigation header
│   ├── RegisterSection.tsx   # Resident registration
│   ├── CreateProposalSection.tsx  # Create proposals
│   ├── ProposalList.tsx      # List all proposals
│   ├── ProposalCard.tsx      # Individual proposal card
│   └── StatsSection.tsx      # Statistics display
├── hooks/
│   └── useToast.tsx          # Toast notification hook
├── lib/
│   ├── wagmi.ts              # wagmi configuration
│   └── contract.ts           # Contract ABI and config
├── utils/
│   └── date.ts               # Date formatting utilities
└── public/                   # Static assets
```

## Key Features Implementation

### Wallet Connection

Using RainbowKit for multi-wallet support:
- MetaMask
- WalletConnect
- Coinbase Wallet
- Rainbow
- And more...

### Contract Interaction

All contract interactions use wagmi hooks:
- `useReadContract` - Read contract state
- `useWriteContract` - Execute transactions
- `useAccount` - Get connected account
- Automatic re-fetching and caching

### UI Components

Built with Tailwind CSS utility classes:
- Glassmorphism panels with `backdrop-blur-glass`
- Pill-shaped buttons with `rounded-full`
- Gradient backgrounds
- Responsive grid layouts
- Toast notifications

### Type Safety

Full TypeScript coverage:
- Contract ABI types
- Component props
- Hook return types
- Utility functions

## Development Tips

### Adding New Components

```typescript
// components/MyComponent.tsx
'use client';

export function MyComponent() {
  return (
    <div className="glass-panel p-6">
      {/* Your content */}
    </div>
  );
}
```

### Using Contract Hooks

```typescript
import { useReadContract } from 'wagmi';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '@/lib/contract';

const { data } = useReadContract({
  address: CONTRACT_ADDRESS,
  abi: CONTRACT_ABI,
  functionName: 'yourFunction',
  args: [/* your args */],
});
```

### Showing Toast Notifications

```typescript
import { useToast } from '@/hooks/useToast';

const { showToast } = useToast();

showToast('Success message!', 'success');
showToast('Error occurred', 'error');
```

## Troubleshooting

### Build Errors

If you encounter webpack errors:
```bash
npm run clean
rm -rf .next node_modules
npm install
npm run build
```

### Wallet Connection Issues

1. Ensure you're on Sepolia testnet
2. Check MetaMask network settings
3. Try disconnecting and reconnecting wallet

### Contract Interaction Fails

1. Verify contract address in `.env.local`
2. Check you have Sepolia ETH
3. Ensure wallet is connected to Sepolia network

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Links

- **Main Repository**: https://github.com/ElsieNitzsche/AnonymousPropertyVoting
- **Zama fhEVM Docs**: https://docs.zama.ai/fhevm
- **Vercel Deployment**: https://vercel.com
- **RainbowKit Docs**: https://rainbowkit.com
- **wagmi Docs**: https://wagmi.sh

---

**Built with ❤️ using Next.js, TypeScript, and fhEVM**
