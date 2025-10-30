# Anonymous Property Voting System

## Overview

A revolutionary blockchain-based property management voting system that leverages Fully Homomorphic Encryption (FHE) technology to ensure complete privacy and anonymity in community decision-making processes. This system empowers property owners and residents to participate in community affairs while maintaining their voting privacy.

## Core Concept

**FHE Contract Anonymous Property Management Voting - Community Affairs Privacy Decision System**

This innovative platform addresses the critical need for transparent yet private voting in residential communities. Traditional property management voting systems often lack privacy protections, potentially exposing individual preferences and creating social pressure. Our FHE-powered solution ensures that while the voting process remains transparent and verifiable on the blockchain, individual votes remain completely confidential.

## Key Features

### 🔐 **Fully Homomorphic Encryption (FHE)**
- **Complete Vote Privacy**: Individual votes are encrypted and remain private throughout the entire process
- **Homomorphic Computations**: Vote tallying occurs on encrypted data without decryption
- **Zero Knowledge**: No party can determine how any individual voted

### 🏢 **Property Management Integration**
- **Community Governance**: Streamlined voting for property management decisions
- **Stakeholder Participation**: All property owners and eligible residents can participate
- **Transparent Results**: Final outcomes are publicly verifiable while maintaining vote secrecy

### 🌐 **Blockchain Technology**
- **Immutable Records**: All votes and decisions are permanently recorded on the blockchain
- **Decentralized Trust**: No central authority controls the voting process
- **Smart Contract Automation**: Automated vote counting and result publication

### 🛡️ **Privacy-First Design**
- **Anonymous Participation**: Voters can participate without revealing their identity
- **Encrypted Communications**: All vote data is encrypted end-to-end
- **Privacy Preservation**: Mathematical guarantees of vote secrecy

## Technology Stack

- **Smart Contracts**: Solidity-based FHE contracts
- **Frontend**: React 18 with TypeScript
- **Web3 Integration**: Ethers.js v6
- **Encryption**: TFHE (Threshold Fully Homomorphic Encryption) via FHEVM Universal SDK
- **Blockchain**: Ethereum-compatible networks (Sepolia Testnet)
- **Privacy**: Zero-knowledge proofs and homomorphic encryption
- **Build Tool**: Parcel bundler

## Contract Information

**Contract Address**: `0xD30412C56d2E50dE333512Bd91664d98475E8eFf`

*The contract implements state-of-the-art FHE protocols to ensure that vote aggregation can be performed without compromising individual vote privacy.*

## Use Cases

### 🏘️ **Community Decisions**
- Property maintenance and improvement projects
- Budget allocation and fee adjustments
- Community rules and regulation changes
- Facility usage policies

### 🗳️ **Board Elections**
- Property management board member selection
- Committee appointments
- Leadership position voting

### 💰 **Financial Decisions**
- Special assessment approvals
- Budget approvals
- Contractor selection

## Demo Resources

### 📹 **Demonstration Video**
*Comprehensive video demonstration showcasing the voting process, privacy features, and system capabilities.*

### 📊 **On-Chain Transaction Screenshots**
*Visual documentation of blockchain transactions, vote submissions, and result verification processes.*

## Benefits

### For Property Owners
- **Confidential Voting**: Cast votes without fear of retaliation or social pressure
- **Convenient Access**: Vote from anywhere using web interface
- **Transparent Process**: Verify results while maintaining personal privacy

### For Property Managers
- **Efficient Governance**: Streamlined decision-making processes
- **Increased Participation**: Higher voter turnout due to privacy guarantees
- **Audit Trail**: Complete transparency and accountability

### For Communities
- **Democratic Participation**: Fair representation of all stakeholders
- **Trust Building**: Enhanced confidence in governance processes
- **Privacy Protection**: Safeguarded individual preferences and opinions

## Security Features

- **Encryption at Rest**: All sensitive data is encrypted when stored
- **Secure Transmission**: End-to-end encryption for all communications
- **Smart Contract Security**: Thoroughly audited and tested contracts
- **Privacy Preservation**: Mathematical guarantees of anonymity

## Getting Started

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3001`

### Build for Production

```bash
npm run build
```

The production build will be created in the `dist/` directory.

## How to Use

1. **Connect Wallet**: Use MetaMask on Sepolia network
2. **Register**: Submit your unit number (encrypted automatically)
3. **Vote**: Participate in active proposals anonymously
4. **View Results**: See aggregated results after voting ends

## Project Structure

```
property-voting/
├── public/
│   └── index.html          # Minimal HTML entry point
├── src/
│   ├── components/
│   │   ├── VotingApp.tsx           # Main app component
│   │   ├── WalletConnection.tsx    # Wallet connection UI
│   │   ├── ResidentRegistration.tsx # Resident registration form
│   │   ├── AdminPanel.tsx          # Admin proposal creation
│   │   ├── VoteSubmission.tsx      # Voting interface
│   │   └── ResultsDisplay.tsx      # Results visualization
│   ├── config.ts           # Contract configuration
│   ├── fhevm-integration.js # FHEVM SDK integration
│   ├── utils.js            # Utility functions
│   ├── index.tsx           # React entry point
│   └── styles.css          # Application styles
├── package.json            # Dependencies
└── tsconfig.json          # TypeScript configuration
```

## React Components

### VotingApp
Main application component that manages global state and coordinates all child components. Handles wallet connection, contract interactions, and data loading.

### WalletConnection
Displays wallet connection status and provides the connect button. Shows the connected account address and network warnings.

### ResidentRegistration
Form for residents to register with their unit number. Shows registration status and voting status.

### AdminPanel
Interface for admins to create new proposals with title, description, and duration selection.

### VoteSubmission
Displays current proposal details and provides voting buttons. Includes a countdown timer for the voting period.

### ResultsDisplay
Visualizes voting results with progress bars showing YES/NO vote distribution and approval status.

## Future Enhancements

- Multi-language support for diverse communities
- Mobile application for enhanced accessibility
- Integration with existing property management systems
- Advanced analytics and reporting features
- Cross-platform compatibility

## Links

- **Live Application**: [https://anonymous-property-voting-4ars.vercel.app/](https://anonymous-property-voting-4ars.vercel.app/)
- **GitHub Repository**: [https://github.com/ElsieNitzsche/AnonymousPropertyVoting](https://github.com/ElsieNitzsche/AnonymousPropertyVoting)

## Contributing

We welcome contributions from the community to improve this privacy-preserving voting system. Please feel free to submit issues, feature requests, or pull requests through our GitHub repository.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

---

*Building the future of private, transparent, and democratic property management governance.*