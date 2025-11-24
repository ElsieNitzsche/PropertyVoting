# API Documentation

## Core Functions

### createMarket
Create a new prediction market

**Signature:**
```solidity
function createMarket(
    string memory marketId,
    uint256 participantStake,
    uint256 duration
) external payable
```

**Parameters:**
- `marketId`: Unique identifier (1-64 characters)
- `participantStake`: Stake required per participant (min: 0.005 ETH)
- `duration`: Market duration in seconds (5 min - 30 days)

**Requirements:**
- msg.value must equal creator stake
- marketId must be unique
- Contract must not be paused

**Events:**
- `MarketCreated(marketId, creator, stakeAmount, participantStake, expiryTime, decryptionDeadline)`

---

### participate
Submit encrypted vote to a market

**Signature:**
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
- `encryptedWeight`: Encrypted vote weight (FHE encrypted)
- `voteType`: 0 = No, 1 = Yes
- `inputProof`: FHE input proof

**Requirements:**
- Market must exist and not be expired
- msg.value must equal participant stake
- User can only vote once
- voteType must be 0 or 1

**Events:**
- `ParticipationRecorded(marketId, participant)`

---

### requestTallyReveal
Request decryption of vote tallies via Gateway

**Signature:**
```solidity
function requestTallyReveal(string memory marketId) external
```

**Parameters:**
- `marketId`: Market identifier

**Requirements:**
- Market must be expired
- Only creator or owner can call
- Can only be requested once

**Events:**
- `DecryptionRequested(marketId, requestId, deadline)`

---

### claimPrize
Claim prize for winning vote

**Signature:**
```solidity
function claimPrize(string memory marketId) external
```

**Parameters:**
- `marketId`: Market identifier

**Requirements:**
- Market must be resolved
- User must have voted on winning side
- Can only claim once
- No tie result

**Events:**
- `PrizeDistributed(marketId, winner, amount)`

---

### claimRefund
Claim refund when conditions allow

**Signature:**
```solidity
function claimRefund(string memory marketId) external
```

**Parameters:**
- `marketId`: Market identifier

**Refund Conditions:**
1. Decryption failed/timed out
2. Market resulted in tie
3. Emergency pause without resolution

**Events:**
- `RefundIssued(marketId, user, amount, reason)`

---

### handleDecryptionTimeout
Mark decryption as failed after timeout

**Signature:**
```solidity
function handleDecryptionTimeout(string memory marketId) external
```

**Parameters:**
- `marketId`: Market identifier

**Requirements:**
- Decryption must be requested
- Deadline must have passed
- Market not resolved

**Events:**
- `DecryptionTimeout(marketId, requestId)`

---

## Admin Functions

### transferOwnership
Transfer contract ownership

**Signature:**
```solidity
function transferOwnership(address newOwner) external onlyOwner
```

---

### setGuardian
Update guardian address

**Signature:**
```solidity
function setGuardian(address newGuardian) external onlyOwner
```

---

### pause / unpause
Emergency controls

**Signature:**
```solidity
function pause() external onlyOwnerOrGuardian
function unpause() external onlyOwner
```

---

### withdrawPlatformFees
Withdraw accumulated fees

**Signature:**
```solidity
function withdrawPlatformFees(address to) external onlyOwner
```

---

## View Functions

### getMarket
Get market information

**Signature:**
```solidity
function getMarket(string memory marketId) external view returns (
    address creator,
    uint256 creatorStake,
    uint256 participantStake,
    uint256 expiryTime,
    uint256 decryptionDeadline,
    bool isResolved,
    bool decryptionFailed,
    uint64 yesVotes,
    uint64 noVotes,
    uint256 prizePool,
    bool yesWon
)
```

---

### getDecryptionStatus
Get decryption request status

**Signature:**
```solidity
function getDecryptionStatus(string memory marketId) external view returns (
    uint256 requestId,
    uint256 deadline,
    bool completed,
    bool failed
)
```

---

## Events Reference

```solidity
event MarketCreated(
    string indexed marketId,
    address indexed creator,
    uint256 stakeAmount,
    uint256 participantStake,
    uint256 expiryTime,
    uint256 decryptionDeadline
);

event ParticipationRecorded(
    string indexed marketId,
    address indexed participant
);

event MarketResolved(
    string indexed marketId,
    bool yesWon,
    uint64 revealedYes,
    uint64 revealedNo,
    uint256 totalPrize
);

event PrizeDistributed(
    string indexed marketId,
    address indexed winner,
    uint256 amount
);

event RefundIssued(
    string indexed marketId,
    address indexed user,
    uint256 amount,
    string reason
);

event DecryptionRequested(
    string indexed marketId,
    uint256 requestId,
    uint256 deadline
);

event DecryptionTimeout(
    string indexed marketId,
    uint256 requestId
);
```

## Constants

```solidity
MIN_PARTICIPANT_STAKE = 0.005 ether
MIN_DURATION = 5 minutes
MAX_DURATION = 30 days
DECRYPTION_TIMEOUT = 1 hour
PLATFORM_FEE_PERCENT = 2
MAX_RANDOM_MULTIPLIER = 1000
```
