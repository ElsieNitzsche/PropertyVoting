# PrivatePropertyMarket - FHEVM Privacy Voting System

A privacy-preserving property voting system built on FHEVM (Fully Homomorphic Encryption Virtual Machine) with advanced features including Gateway callback pattern, comprehensive refund mechanisms, and robust timeout protection.

**Video Demo**: demo.mp4
**Live Demo**: https://property-voting.vercel.app/

## Overview

PrivatePropertyMarket enables property residents to vote on proposals while maintaining complete vote privacy throughout the entire process. Built with production-grade security features and innovative privacy protection techniques.

## Features

### Core Functionality
- **🔐 Privacy-Preserving Voting**: Votes remain encrypted on-chain using FHE technology
- **⚙️ Gateway Callback Pattern**: Asynchronous decryption with secure callback mechanism
- **💰 Comprehensive Refund System**: Automatic refunds for decryption failures, ties, and emergencies
- **⏱️ Timeout Protection**: Prevents permanent fund locks with deadline enforcement (1 hour)
- **🎯 Proportional Prize Distribution**: Winners receive prizes proportional to their stake

### Security Features
- ✅ **Input Validation**: All parameters validated before processing
- ✅ **Role-Based Access Control**: PropertyManager and Guardian roles
- ✅ **Overflow Protection**: Solidity 0.8+ built-in checks
- ✅ **Reentrancy Guards**: Check-Effects-Interactions pattern
- ✅ **Emergency Pause**: Multi-level pause mechanism for emergencies
- ✅ **Access Modifiers**: Comprehensive permission system

### Privacy Protection
- 🔒 **Random Multipliers**: Each proposal uses unique multiplier (1-1000) to obfuscate vote weights
- 🔒 **Price Obfuscation**: Vote weights encrypted and obfuscated on-chain
- 🔒 **Encrypted Tallies**: Vote totals remain encrypted until Gateway decryption
- 🔒 **Unit Number Privacy**: Resident unit numbers stored encrypted
- 🔒 **Homomorphic Operations**: All vote tallying uses FHE operations

### Gas Optimization
- ⚡ **Efficient HCU Usage**: Minimal homomorphic computation units per transaction
- ⚡ **Optimized Storage**: Strategic use of mappings and arrays
- ⚡ **Batched Decryption**: Single decryption request for all votes
- ⚡ **Lazy Evaluation**: Compute only when necessary

## Architecture

### Gateway Callback Flow

The system uses an innovative asynchronous decryption pattern:

```
User Action              Contract State              Gateway
─────────────────────────────────────────────────────────────
1. submitVote()    →    Store encrypted vote
                        (euint64 weight +
                         euint8 voteType)

2. Wait for voting      Accumulate all
   period to end        encrypted votes

3. requestDecryption() → Aggregate votes         → Receive request
                         Set timeout deadline

4. Wait...              Monitor timeout           Decrypt off-chain
                                                  Verify signatures

5. resolveTallyCallback()← Process results       ← Send decrypted data
                           Verify signatures        + proof
                           Remove multiplier
                           Distribute results

6. claimPrize()    →    Transfer winnings
   or claimRefund()     (proportional to stake)
```

**Key Innovation**: Privacy multiplier applied during vote submission, removed during decryption callback.

### Refund Mechanism

The contract provides **three automatic refund scenarios**:

#### 1. Tie Scenario
```
Condition: revealedYesVotes == revealedNoVotes
Trigger:   Results revealed with equal votes
Action:    All participants can claim full refund
Reason:    No clear winner determined
```

#### 2. Decryption Timeout
```
Condition: block.timestamp > decryptionRequestTime + DECRYPTION_TIMEOUT (1 hour)
Trigger:   Gateway fails to respond within deadline
Action:    All participants can claim full refund
Reason:    Prevents permanent fund locks
```

#### 3. Emergency Pause
```
Condition: paused == true && !resultsRevealed
Trigger:   Contract emergency paused before resolution
Action:    All participants can claim full refund
Reason:    Emergency situation requires fund recovery
```

### Timeout Protection

Multi-layer protection against fund locks:

```
Timeline Protection:
────────────────────────────────────────────────────────
T0: Proposal Created
    │
    ├─ Voting Period (24h - 7 days)
    │  └─ Users submit encrypted votes
    │
T1: Voting Ends
    │
    ├─ Decryption Request Window
    │  └─ Creator/Manager requests decryption
    │
T2: Decryption Requested
    │
    ├─ Gateway Processing (max 1 hour)
    │  └─ Gateway decrypts and calls back
    │
T3: Decryption Deadline (T2 + 1 hour)
    │
    └─ If no callback: TIMEOUT → Refunds Available
```

**Protection Mechanisms:**
- `DECRYPTION_TIMEOUT`: Hard deadline for Gateway response (1 hour)
- `decryptionRequestTime`: Timestamp recorded at decryption request
- `isRefundAvailable()`: View function to check refund eligibility
- `claimRefund()`: Permissionless refund claim after timeout

## Installation

```bash
# Clone repository
git clone <repository-url>
cd private-property-market

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your settings
```

## Configuration

Edit `.env` file:
```env
PRIVATE_KEY=your_private_key_here
SEPOLIA_RPC_URL=https://devnet.zama.ai
ETHERSCAN_API_KEY=your_etherscan_api_key
REPORT_GAS=true
```

## Usage

### Compile Contracts
```bash
npm run compile
```

### Run Tests
```bash
npm run test
```

### Deploy
```bash
# Local deployment
npm run deploy:local

# Sepolia testnet
npm run deploy
```

## Smart Contract API

### Market Creation
```solidity
function createMarket(
    string memory marketId,
    uint256 participantStake,
    uint256 duration
) external payable
```

**Parameters:**
- `marketId`: Unique identifier for the market
- `participantStake`: Stake required from each participant (min: 0.005 ETH)
- `duration`: Market duration in seconds (5 min - 30 days)

**Requirements:**
- `msg.value` must equal creator stake (default: 0.02 ETH)

### Participate (Vote)
```solidity
function participate(
    string memory marketId,
    externalEuint64 encryptedWeight,
    uint8 voteType,
    bytes calldata inputProof
) external payable
```

**Parameters:**
- `marketId`: Market identifier
- `encryptedWeight`: Encrypted vote weight
- `voteType`: 0 for No, 1 for Yes
- `inputProof`: FHE input proof

**Requirements:**
- `msg.value` must equal participant stake
- User can only vote once per market

### Request Decryption
```solidity
function requestTallyReveal(string memory marketId) external
```

**Requirements:**
- Market must be expired
- Only creator or owner can request
- Can only be requested once

### Claim Prize
```solidity
function claimPrize(string memory marketId) external
```

**Requirements:**
- Market must be resolved
- User must have voted on winning side
- Can only claim once

### Claim Refund
```solidity
function claimRefund(string memory marketId) external
```

**Available when:**
- Decryption failed or timed out
- Market resulted in a tie
- Emergency pause with no resolution

### Emergency Controls
```solidity
function pause() external onlyOwnerOrGuardian
function unpause() external onlyOwner
function setGuardian(address newGuardian) external onlyOwner
```

## Privacy Protection Techniques

### 1. Random Multipliers (Solving Division Privacy Problem)

Each proposal generates a unique pseudo-random multiplier (1-1000) to protect vote weight privacy:

```solidity
// Generation (at proposal creation)
randomMultiplier = keccak256(block.timestamp, block.prevrandao, creator, proposalId) % 1000 + 1

// Application (during vote submission)
obfuscatedWeight = actualWeight × randomMultiplier

// Removal (during decryption callback)
actualWeight = obfuscatedWeight ÷ randomMultiplier
```

**Benefits:**
- Prevents direct observation of individual vote weights
- Protects against on-chain pattern analysis
- Maintains relative proportions for fair prize distribution
- Different multiplier per proposal (no cross-proposal correlation)

### 2. Price Obfuscation (Multi-Layer Protection)

**Layer 1 - Client-Side Encryption:**
```javascript
const instance = await fhevm.createInstance();
const encryptedWeight = instance.encrypt64(voteWeight);
// Encrypted data sent to contract
```

**Layer 2 - On-Chain Obfuscation:**
```solidity
euint64 weight = FHE.fromExternal(encryptedWeight, inputProof);
euint64 obfuscated = FHE.mul(weight, FHE.asEuint64(randomMultiplier));
```

**Layer 3 - Homomorphic Aggregation:**
```solidity
totalYesVotes = FHE.add(totalYesVotes, FHE.select(isYes, obfuscated, zero));
totalNoVotes = FHE.add(totalNoVotes, FHE.select(isNo, obfuscated, zero));
```

**Layer 4 - Gateway Decryption:**
- Only aggregated totals decrypted (not individual votes)
- Off-chain decryption via Zama Gateway
- Results verified with cryptographic signatures

### 3. Async Processing (Gateway Callback Pattern)

**Problem Solved**: On-chain decryption is expensive and reveals intermediate values

**Solution**: Asynchronous Gateway decryption

```
Traditional                      Our Solution
────────────────                 ──────────────────
Request → Decrypt                Request → Record
(High gas, reveals data)         (Low gas, private)
↓                                ↓
Process results                  Gateway decrypts off-chain
                                 ↓
                                 Callback + proof
                                 ↓
                                 Verify & process
```

### 4. Problem Solutions

#### Division Problem
**Issue**: Division reveals information
```
prizeShare = prizePool / winningVotes  // Reveals winningVotes!
```

**Solution**: Random multiplier obfuscation
```solidity
obfuscatedVotes = actualVotes × randomMultiplier
// After decryption:
actualVotes = obfuscatedVotes ÷ randomMultiplier
```

#### Price Leakage
**Mitigation**:
- Constant-time operations where possible
- Similar gas costs regardless of vote choice
- Encrypted vote type processed identically

#### Async Timeout Risk
**Solution**: Automatic refunds after 1-hour timeout
```solidity
if (block.timestamp > decryptionRequestTime + 1 hours) {
    // Users can claim refunds
}
```

#### HCU Gas Optimization
**Optimizations**:
1. Only 2 decryptions per proposal (yes/no totals)
2. Batch processing: aggregate before decrypt
3. Efficient storage: mappings over arrays
4. Lazy evaluation: compute only when needed

## Gas Optimization

### HCU (Homomorphic Computation Units) Efficiency

| Operation | Gas Cost | HCU Cost | Notes |
|-----------|----------|----------|-------|
| Register Resident | ~120k | ~30k | One-time per user |
| Create Proposal | ~180k | 0 | Manager only |
| Submit Vote | ~280k | ~60k | Per participant |
| Request Decryption | ~100k+ | ~20k | Once per proposal |
| Resolve Callback | ~80k | 0 | Gateway only |
| Claim Prize | ~65k | 0 | Per winner |
| Claim Refund | ~55k | 0 | When eligible |

### Optimization Strategies

1. **Minimize FHE Operations**: Only essential encrypted operations
2. **Batched Decryption**: Single request for all votes
3. **Storage Efficiency**: Strategic use of mappings
4. **Lazy Evaluation**: Compute tallies only at decryption request

## Security Considerations

### Audit Checklist
- ✅ Input validation on all user inputs
- ✅ Access control on privileged functions
- ✅ Reentrancy protection
- ✅ Integer overflow protection (Solidity 0.8+)
- ✅ Front-running mitigation (encrypted votes)
- ✅ DoS attack prevention (timeout protection)

### Known Limitations
- Gateway dependency (mitigated with timeout + refunds)
- Pseudo-random multipliers (sufficient for obfuscation)

## Testing

### Test Structure
```
test/
├── PrivateMarket.test.js      # Main contract tests
├── refund.test.js             # Refund mechanism tests
├── timeout.test.js            # Timeout protection tests
└── security.test.js           # Security tests
```

### Run Tests
```bash
npm run test
```

## Development

### Linting
```bash
npm run lint
```

### Formatting
```bash
npm run format
```

### Coverage
```bash
npm run coverage
```

## License

BSD-3-Clause-Clear

## Support

For issues and questions:
- GitHub Issues: <repository-url>/issues
- Documentation: See `docs/` folder

## Acknowledgments

Built with:
- [FHEVM](https://github.com/zama-ai/fhevm) by Zama
- [Hardhat](https://hardhat.org/)
- [OpenZeppelin](https://openzeppelin.com/)
