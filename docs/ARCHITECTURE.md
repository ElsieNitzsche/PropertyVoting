# Architecture Documentation

## System Overview

PrivatePropertyMarket is a privacy-preserving voting system built on FHEVM (Fully Homomorphic Encryption Virtual Machine) that enables residents to vote on property proposals while maintaining vote privacy throughout the entire process.

## Core Architecture

### 1. Gateway Callback Pattern

The system uses an asynchronous decryption pattern via the Zama Gateway:

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   User      │         │   Contract   │         │   Gateway   │
└──────┬──────┘         └──────┬───────┘         └──────┬──────┘
       │                       │                        │
       │ submitVote()          │                        │
       │──────────────────────>│                        │
       │                       │                        │
       │                       │ Store encrypted        │
       │                       │ vote on-chain          │
       │                       │                        │
       │ requestDecryption()   │                        │
       │──────────────────────>│                        │
       │                       │                        │
       │                       │ FHE.requestDecryption()│
       │                       │───────────────────────>│
       │                       │                        │
       │                       │                        │ Decrypt
       │                       │                        │ off-chain
       │                       │                        │
       │                       │ resolveTallyCallback() │
       │                       │<───────────────────────│
       │                       │                        │
       │                       │ Verify & process       │
       │                       │                        │
       │ claimPrize()          │                        │
       │──────────────────────>│                        │
       │                       │                        │
       │<──── ETH transfer ────│                        │
       │                       │                        │
```

**Key Benefits:**
- **Privacy**: Votes remain encrypted on-chain until decryption
- **Scalability**: Off-chain decryption reduces gas costs
- **Security**: Gateway signatures verify decryption authenticity

### 2. Privacy Protection Layer

#### Random Multipliers
Each proposal generates a unique random multiplier (1-1000) used to obfuscate vote weights:

```solidity
// On vote submission
obfuscatedWeight = actualWeight * randomMultiplier

// On decryption callback
actualWeight = obfuscatedWeight / randomMultiplier
```

**Purpose:**
- Prevents direct observation of vote weights
- Protects against on-chain analysis
- Maintains relative proportions for prize distribution

#### Encrypted Operations
All vote tallying uses homomorphic operations:

```solidity
totalYesVotes = FHE.add(totalYesVotes, FHE.select(isYes, weight, zero))
totalNoVotes = FHE.add(totalNoVotes, FHE.select(isNo, weight, zero))
```

### 3. Refund Mechanism

The system provides automatic refunds in three scenarios:

#### Scenario A: Tie
```
Condition: revealedYesVotes == revealedNoVotes
Action: All participants receive full refund
Reason: No clear winner
```

#### Scenario B: Decryption Timeout
```
Condition: block.timestamp > decryptionRequestTime + DECRYPTION_TIMEOUT
Action: All participants receive full refund
Reason: Gateway failed to decrypt within deadline
```

#### Scenario C: Emergency Pause
```
Condition: paused && !resultsRevealed
Action: All participants receive full refund
Reason: Contract paused before resolution
```

**Implementation:**
```solidity
function claimRefund(uint16 proposalId) external {
    // Verify participation and no previous claim
    require(hasParticipated[msg.sender], "Did not participate");
    require(!hasClaimed[msg.sender], "Already claimed");

    // Check refund conditions
    bool isTie = resultsRevealed && (revealedYesVotes == revealedNoVotes);
    bool isTimeout = decryptionRequested && !resultsRevealed &&
                     (block.timestamp > decryptionRequestTime + TIMEOUT);
    bool isPaused = paused && !resultsRevealed;

    require(isTie || isTimeout || isPaused, "No refund available");

    // Transfer refund
    (bool success, ) = payable(msg.sender).call{value: participationStake}("");
    require(success, "Refund failed");
}
```

### 4. Timeout Protection

Prevents permanent fund locks through deadline enforcement:

```
Timeline:
├─ T0: Proposal created
├─ T1: Voting period (24h - 7d)
├─ T2: Decryption requested
├─ T3: Decryption deadline (T2 + 1 hour)
└─ T4: Timeout → Refunds available
```

**Constants:**
- `MIN_VOTING_DURATION`: 24 hours
- `MAX_VOTING_DURATION`: 7 days
- `DECRYPTION_TIMEOUT`: 1 hour

**Protection Flow:**
1. Voting ends at `endTime`
2. Decryption requested, timestamp recorded
3. If Gateway doesn't respond within `DECRYPTION_TIMEOUT`
4. Users can claim refunds via `claimRefund()`

### 5. Security Features

#### Access Control
```
┌──────────────────┐
│ Property Manager │ → Create proposals, manage settings
├──────────────────┤
│ Guardian         │ → Emergency pause (not unpause)
├──────────────────┤
│ Registered Users │ → Vote on proposals
└──────────────────┘
```

#### Input Validation
All public functions validate inputs:
- String length limits
- Numeric range checks
- Address validity
- Stake amount verification

#### Reentrancy Protection
All external calls use check-effects-interactions pattern:
```solidity
// 1. Checks
require(conditions);

// 2. Effects
state.hasClaimed[user] = true;

// 3. Interactions
(bool success, ) = payable(user).call{value: amount}("");
```

#### Emergency Pause
Two-level pause mechanism:
- **Guardian**: Can pause (emergency response)
- **Manager**: Can unpause (after review)

### 6. Data Structures

#### Resident Profile
```solidity
struct ResidentProfile {
    bool isRegistered;           // Registration status
    uint256 registrationTime;    // When registered
    euint8 encryptedUnit;        // Encrypted unit number
    uint256 totalVotesCast;      // Participation history
}
```

#### Voting Proposal
```solidity
struct VotingProposal {
    // Metadata
    string title;
    string description;
    address creator;

    // Timing
    bool isActive;
    uint256 startTime;
    uint256 endTime;

    // Economics
    uint256 participationStake;
    uint256 prizePool;
    uint16 totalParticipants;

    // Decryption state
    bool decryptionRequested;
    uint256 decryptionRequestTime;
    uint256 decryptionRequestId;

    // Results
    bool resultsRevealed;
    uint64 revealedYesVotes;
    uint64 revealedNoVotes;
    bool yesWon;

    // Privacy
    uint256 randomMultiplier;

    // Mappings
    mapping(address => bool) hasParticipated;
    mapping(address => uint8) participantVoteType;
    mapping(address => bool) hasClaimed;
    address[] participants;
}
```

#### Encrypted Vote
```solidity
struct EncryptedVote {
    euint64 weight;       // Obfuscated vote weight
    euint8 voteType;      // 0 = No, 1 = Yes (encrypted)
    uint256 timestamp;    // When submitted
    bool submitted;       // Submission flag
}
```

## Gas Optimization

### HCU (Homomorphic Computation Units)

HCU is the computational cost for FHE operations. Our optimizations:

1. **Minimal Decryptions**: Only 2 values decrypted per proposal (yes/no totals)
2. **Batched Operations**: Aggregate all votes before decryption
3. **Efficient Storage**: Use mappings instead of arrays where possible
4. **Lazy Evaluation**: Only compute when necessary

### Gas Estimates

| Operation | Gas Cost | HCU Cost |
|-----------|----------|----------|
| Register Resident | ~120k | ~30k |
| Create Proposal | ~180k | 0 |
| Submit Vote | ~280k | ~60k |
| Request Decryption | ~100k | ~20k |
| Resolve Callback | ~80k | 0 |
| Claim Prize | ~65k | 0 |
| Claim Refund | ~55k | 0 |

## Privacy Analysis

### What Is Protected

1. **Vote Content**: Encrypted until decryption
2. **Vote Weight**: Obfuscated with random multiplier
3. **Intermediate Tallies**: Never revealed on-chain
4. **User Unit Numbers**: Encrypted storage

### What Is Public

1. **Participation**: Who voted (address visible)
2. **Final Tallies**: Total yes/no votes after decryption
3. **Winners**: Who claims prizes (public transactions)
4. **Proposal Details**: Title, description, timing

### Privacy Limitations

1. **Metadata Leakage**: Transaction timing and gas costs visible
2. **Participation Graph**: Can track who votes on what proposals
3. **Prize Claims**: Reveal winner addresses
4. **Statistical Analysis**: Large sample sizes may reveal patterns

**Mitigation Strategies:**
- Use privacy-focused wallets (e.g., Aztec, Tornado Cash)
- Submit votes via relayers
- Batch transactions to hide timing
- Use multiple addresses for different proposals

## Threat Model

### Considered Threats

1. **Vote Manipulation**: ❌ Prevented by FHE encryption
2. **Double Voting**: ❌ Prevented by `hasParticipated` mapping
3. **Gateway Failure**: ✅ Mitigated by timeout + refunds
4. **Reentrancy**: ❌ Prevented by CEI pattern
5. **Integer Overflow**: ❌ Prevented by Solidity 0.8+
6. **Front-Running**: ❌ Prevented by encrypted votes
7. **DoS (Gas Limit)**: ⚠️ Partially mitigated by participant limits

### Attack Scenarios

#### Scenario 1: Malicious Gateway
**Attack**: Gateway refuses to decrypt or provides fake results
**Defense**:
- Timeout protection enables refunds
- Gateway signatures verified on-chain
- Only Zama Gateway can call callback

#### Scenario 2: Griefing via Spam
**Attack**: Create many proposals to bloat state
**Defense**:
- Creation stake required (economic barrier)
- Only property manager can create
- Auto-increment prevents collisions

#### Scenario 3: Prize Manipulation
**Attack**: Try to claim multiple times or from wrong side
**Defense**:
- `hasClaimed` prevents double claims
- `participantVoteType` records original vote
- Proportional distribution prevents inequality

## Deployment Architecture

```
Development:
├─ Local Hardhat Network
├─ FHEVM Mock Gateway
└─ Test Accounts

Staging:
├─ Zama Devnet (Sepolia-based)
├─ Real FHEVM Gateway
└─ Test ETH Faucet

Production:
├─ Zama Mainnet
├─ Production Gateway
└─ Real ETH
```

## Integration Points

### Frontend Integration
```javascript
// 1. Register Resident
await contract.registerResident(unitNumber);

// 2. Create Proposal
await contract.createProposal(title, desc, hours, stake, {
    value: creationStake
});

// 3. Submit Encrypted Vote
const weight = await fhevm.encrypt(voteWeight);
await contract.submitVote(proposalId, weight, voteType, proof, {
    value: participationStake
});

// 4. Request Decryption
await contract.requestTallyDecryption(proposalId);

// 5. Claim Prize
await contract.claimPrize(proposalId);
```

### Gateway Integration
```
1. Contract calls FHE.requestDecryption()
2. Gateway monitors contract events
3. Gateway decrypts ciphertexts off-chain
4. Gateway calls resolveTallyCallback() with proof
5. Contract verifies and processes results
```

## Future Enhancements

### Potential Improvements

1. **Quadratic Voting**: Weight votes by stake²
2. **Delegation**: Allow vote delegation
3. **Multi-Option Polls**: Beyond yes/no
4. **Time-Weighted Voting**: Longer residents get more weight
5. **Reputation System**: Track voting history
6. **Slashing**: Penalize malicious behavior
7. **Layer 2 Integration**: Reduce gas costs
8. **ZK-SNARKs**: Additional privacy layer

### Scalability Considerations

Current limitations:
- Max ~1000 participants per proposal (gas limit)
- Sequential proposal processing
- Linear vote aggregation complexity

Potential solutions:
- Merkle tree vote accumulation
- Off-chain vote aggregation with ZK proofs
- Sharded proposal processing
- Layer 2 rollups

## Audit Checklist

### Security Audit Points

- [ ] Access control on all privileged functions
- [ ] Input validation on all parameters
- [ ] Reentrancy protection on all external calls
- [ ] Integer overflow/underflow checks
- [ ] Front-running vulnerability analysis
- [ ] DoS attack vectors
- [ ] Signature replay attacks
- [ ] Gateway integration security
- [ ] Emergency pause functionality
- [ ] Upgrade path (if applicable)

### Privacy Audit Points

- [ ] Vote confidentiality until decryption
- [ ] Proper use of FHE operations
- [ ] Random multiplier effectiveness
- [ ] Metadata leakage analysis
- [ ] Gateway trust assumptions
- [ ] Decryption proof verification

### Gas Audit Points

- [ ] HCU optimization review
- [ ] Storage pattern efficiency
- [ ] Loop complexity analysis
- [ ] Unnecessary computations
- [ ] Redundant storage operations

## References

- [FHEVM Documentation](https://docs.zama.ai/fhevm)
- [Zama Gateway Specification](https://docs.zama.ai/fhevm/fundamentals/decryption)
- [Solidity Security Best Practices](https://consensys.github.io/smart-contract-best-practices/)
- [EIP-712: Typed Structured Data](https://eips.ethereum.org/EIPS/eip-712)
