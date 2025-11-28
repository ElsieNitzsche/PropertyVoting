# PrivateMarket - FHEVM Prediction Market

A privacy-preserving prediction market built on FHEVM (Fully Homomorphic Encryption Virtual Machine) with advanced features including Gateway callback pattern, refund mechanisms, and timeout protection.

Video: demo.mp4

Live :https://property-voting.vercel.app/

## Features

### Core Functionality
- **Privacy-Preserving Voting**: Uses FHE to keep votes encrypted on-chain
- **Gateway Callback Pattern**: Asynchronous decryption with callback mechanism
- **Refund System**: Automatic refunds for decryption failures and ties
- **Timeout Protection**: Prevents permanent fund locks with deadline enforcement

### Security Features
- ✅ Input validation on all public functions
- ✅ Role-based access control (Owner, Guardian)
- ✅ Overflow protection (Solidity 0.8+)
- ✅ Reentrancy guards
- ✅ Emergency pause mechanism

### Privacy Protection
- 🔒 Random multipliers to protect division privacy
- 🔒 Price obfuscation techniques
- 🔒 Encrypted vote tallies until resolution

### Gas Optimization
- ⚡ Efficient HCU (Homomorphic Computation Unit) usage
- ⚡ Optimized storage patterns
- ⚡ Minimal decryption operations

## Architecture

### Gateway Callback Flow
```
1. User submits encrypted request
   ↓
2. Contract records request
   ↓
3. Gateway decrypts (off-chain)
   ↓
4. Callback completes transaction
```

### Refund Mechanism
Refunds are available when:
- Decryption fails or times out
- Market results in a tie
- Emergency pause activated

### Timeout Protection
- Each market has a decryption deadline (expiry + 1 hour)
- If Gateway fails to decrypt within deadline, refunds become available
- Prevents permanent fund locks

## Installation

```bash
# Clone repository
git clone <repository-url>
cd dapp125

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

### Random Multipliers
Each market generates a random multiplier (1-1000) used to obfuscate vote weights:
```solidity
obfuscatedWeight = weight * randomMultiplier
```

On decryption, the multiplier is removed:
```solidity
actualVotes = revealedVotes / randomMultiplier
```

### Price Obfuscation
- Vote weights are encrypted client-side
- Multiplied by random factors on-chain
- Only final totals are decrypted after market expiry

## Gas Optimization

### HCU Usage
- Minimal FHE operations per transaction
- Batched decryption requests
- Efficient storage patterns

### Examples
| Operation | Estimated Gas | HCU |
|-----------|--------------|-----|
| Create Market | ~150k | 0 |
| Participate | ~250k | ~50k |
| Request Reveal | ~80k | 0 |
| Claim Prize | ~60k | 0 |

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
