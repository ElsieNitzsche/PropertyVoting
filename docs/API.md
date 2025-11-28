# API Documentation

## Contract: PrivatePropertyMarket

Complete API reference for the PrivatePropertyMarket smart contract.

---

## Table of Contents

1. [State Variables](#state-variables)
2. [Core Functions](#core-functions)
3. [Emergency Controls](#emergency-controls)
4. [View Functions](#view-functions)
5. [Events](#events)
6. [Error Messages](#error-messages)
7. [Integration Examples](#integration-examples)

---

## State Variables

### Public Variables

```solidity
address public propertyManager        // Contract owner
address public guardian               // Emergency pause authority
uint16 public currentProposal         // Current active proposal ID
bool public paused                    // Emergency pause state
uint256 public platformFees           // Accumulated platform fees
uint256 public proposalCreationStake  // Required stake to create (default: 0.02 ETH)
```

### Constants

```solidity
uint256 public constant DECRYPTION_TIMEOUT = 1 hours
uint256 public constant MIN_VOTING_DURATION = 24 hours
uint256 public constant MAX_VOTING_DURATION = 7 days
uint256 public constant MIN_PARTICIPATION_STAKE = 0.005 ether
```

---

## Core Functions

### registerResident

Register a new resident with encrypted unit number.

**Signature:**
```solidity
function registerResident(uint8 unitNumber) external whenNotPaused
```

**Parameters:**
- `unitNumber` (uint8): Unit number between 1-200

**Requirements:**
- Not already registered
- Contract not paused
- Valid unit number [1, 200]

**Events:**
- `ResidentRegistered(address indexed resident, uint256 timestamp)`

**Gas:** ~120,000

**Example:**
```javascript
await contract.registerResident(42);
```

---

### createProposal

Create a new voting proposal.

**Signature:**
```solidity
function createProposal(
    string memory title,
    string memory description,
    uint256 votingDurationHours,
    uint256 participationStake
) external payable onlyPropertyManager whenNotPaused
```

**Parameters:**
- `title` (string): Proposal title (1-200 characters)
- `description` (string): Proposal description (1-1000 characters)
- `votingDurationHours` (uint256): Duration in hours (24-168)
- `participationStake` (uint256): Required stake per participant (min 0.005 ETH)

**Requirements:**
- Caller is property manager
- Contract not paused
- `msg.value` equals `proposalCreationStake`
- Valid string lengths
- Duration between 24-168 hours
- Stake >= MIN_PARTICIPATION_STAKE
- No active proposal

**Events:**
- `ProposalCreated(uint16 indexed proposalId, address indexed creator, string title, uint256 startTime, uint256 endTime, uint256 participationStake)`

**Gas:** ~180,000

**Example:**
```javascript
await contract.createProposal(
    "Install Solar Panels",
    "Proposal to install solar panels on building roof",
    72, // 3 days
    ethers.utils.parseEther("0.01"),
    { value: ethers.utils.parseEther("0.02") }
);
```

---

### submitVote

Submit an encrypted vote with weight.

**Signature:**
```solidity
function submitVote(
    uint16 proposalId,
    externalEuint64 encryptedWeight,
    uint8 voteType,
    bytes calldata inputProof
) external payable onlyRegisteredResident whenNotPaused
```

**Parameters:**
- `proposalId` (uint16): Proposal to vote on
- `encryptedWeight` (externalEuint64): Encrypted vote weight
- `voteType` (uint8): 0 for No, 1 for Yes
- `inputProof` (bytes): FHE input proof

**Requirements:**
- Registered resident
- Contract not paused
- Valid proposal
- Within voting period
- Correct stake amount
- voteType is 0 or 1
- Not already voted

**Events:**
- `VoteSubmitted(address indexed voter, uint16 indexed proposalId, uint256 timestamp)`

**Gas:** ~280,000

**Example:**
```javascript
const instance = await fhevm.createInstance();
const weight = instance.encrypt64(100);

await contract.submitVote(
    1,
    weight.handles[0],
    1, // Yes
    weight.inputProof,
    { value: ethers.utils.parseEther("0.01") }
);
```

---

### requestTallyDecryption

Request Gateway to decrypt vote tallies.

**Signature:**
```solidity
function requestTallyDecryption(uint16 proposalId) external
```

**Parameters:**
- `proposalId` (uint16): Proposal to decrypt

**Requirements:**
- Valid proposal
- Voting period ended
- Contract not paused
- Not already revealed
- Not already requested
- Caller is creator or manager

**Events:**
- `DecryptionRequested(uint16 indexed proposalId, uint256 requestId, uint256 timestamp)`

**Gas:** ~100,000 + (participants × 5,000)

**Example:**
```javascript
await contract.requestTallyDecryption(1);
```

---

### resolveTallyCallback

Gateway callback to resolve tallies (Gateway only).

**Signature:**
```solidity
function resolveTallyCallback(
    uint256 requestId,
    bytes memory cleartexts,
    bytes memory decryptionProof
) external
```

**Parameters:**
- `requestId` (uint256): Decryption request ID
- `cleartexts` (bytes): ABI-encoded decrypted tallies
- `decryptionProof` (bytes): Gateway signature proof

**Events:**
- `ProposalResolved(uint16 indexed proposalId, bool yesWon, uint64 yesVotes, uint64 noVotes, uint256 prizePool)`

**Gas:** ~80,000

**Note:** Called automatically by Gateway; users don't call this.

---

### claimPrize

Claim prize for winning vote.

**Signature:**
```solidity
function claimPrize(uint16 proposalId) external
```

**Parameters:**
- `proposalId` (uint16): Proposal to claim from

**Requirements:**
- Valid proposal
- Contract not paused
- Results revealed
- Not already claimed
- User participated
- Not a tie
- User voted on winning side

**Events:**
- `PrizeClaimed(uint16 indexed proposalId, address indexed winner, uint256 amount)`

**Gas:** ~65,000

**Example:**
```javascript
await contract.claimPrize(1);
```

---

### claimRefund

Claim refund in case of tie, timeout, or emergency.

**Signature:**
```solidity
function claimRefund(uint16 proposalId) external
```

**Parameters:**
- `proposalId` (uint16): Proposal to claim refund from

**Refund Conditions:**
1. **Tie**: `revealedYesVotes == revealedNoVotes`
2. **Timeout**: Decryption requested but not resolved within DECRYPTION_TIMEOUT
3. **Emergency**: Contract paused without resolution

**Events:**
- `RefundClaimed(uint16 indexed proposalId, address indexed claimer, uint256 amount, string reason)`
- `DecryptionTimeout(uint16 indexed proposalId, uint256 timeoutAt)` (if timeout)

**Gas:** ~55,000

**Example:**
```javascript
await contract.claimRefund(1);
```

---

## Emergency Controls

### pause

Pause contract in emergency.

**Signature:**
```solidity
function pause() external onlyOwnerOrGuardian
```

**Requirements:**
- Caller is manager or guardian
- Not already paused

**Events:**
- `EmergencyPause(address indexed by, uint256 timestamp)`

**Gas:** ~30,000

---

### unpause

Unpause contract.

**Signature:**
```solidity
function unpause() external onlyPropertyManager
```

**Requirements:**
- Caller is property manager
- Contract is paused

**Events:**
- `EmergencyUnpause(address indexed by, uint256 timestamp)`

**Gas:** ~30,000

---

### setGuardian

Update guardian address.

**Signature:**
```solidity
function setGuardian(address newGuardian) external onlyPropertyManager
```

**Parameters:**
- `newGuardian` (address): New guardian address

**Events:**
- `GuardianChanged(address indexed oldGuardian, address indexed newGuardian)`

**Gas:** ~35,000

---

### setProposalCreationStake

Update proposal creation stake.

**Signature:**
```solidity
function setProposalCreationStake(uint256 newStake) external onlyPropertyManager
```

**Parameters:**
- `newStake` (uint256): New stake amount

**Gas:** ~30,000

---

### withdrawPlatformFees

Withdraw accumulated platform fees.

**Signature:**
```solidity
function withdrawPlatformFees(address to) external onlyPropertyManager
```

**Parameters:**
- `to` (address): Recipient address

**Events:**
- `PlatformFeesWithdrawn(address indexed to, uint256 amount)`

**Gas:** ~45,000

---

## View Functions

### getCurrentProposalInfo

Get current proposal details.

**Signature:**
```solidity
function getCurrentProposalInfo() external view returns (
    uint16 proposalId,
    string memory title,
    string memory description,
    address creator,
    bool isActive,
    uint256 startTime,
    uint256 endTime,
    uint256 participationStake,
    uint16 totalParticipants,
    uint256 prizePool
)
```

**Example:**
```javascript
const info = await contract.getCurrentProposalInfo();
console.log(`Title: ${info.title}`);
console.log(`Participants: ${info.totalParticipants}`);
```

---

### getProposalResults

Get proposal results.

**Signature:**
```solidity
function getProposalResults(uint16 proposalId) external view returns (
    bool resultsRevealed,
    uint64 yesVotes,
    uint64 noVotes,
    bool yesWon,
    uint256 prizePool,
    uint16 totalParticipants
)
```

**Example:**
```javascript
const results = await contract.getProposalResults(1);
if (results.resultsRevealed) {
    console.log(`Yes: ${results.yesVotes}, No: ${results.noVotes}`);
}
```

---

### getResidentStatus

Get resident status and participation history.

**Signature:**
```solidity
function getResidentStatus(address resident) external view returns (
    bool isRegistered,
    uint256 registrationTime,
    uint256 totalVotesCast,
    bool hasParticipatedInCurrent
)
```

---

### isRefundAvailable

Check if refund is available for user.

**Signature:**
```solidity
function isRefundAvailable(uint16 proposalId, address user)
    external view returns (bool available, string memory reason)
```

**Reason Codes:**
- `"tie"`: Votes tied
- `"timeout"`: Decryption timeout
- `"emergency_pause"`: Contract paused
- `"not_participant"`: User didn't participate
- `"already_claimed"`: Already claimed
- `"no_refund_condition"`: No refund condition met

**Example:**
```javascript
const [available, reason] = await contract.isRefundAvailable(1, userAddress);
if (available) {
    console.log(`Refund available: ${reason}`);
}
```

---

### getDecryptionStatus

Get decryption status for proposal.

**Signature:**
```solidity
function getDecryptionStatus(uint16 proposalId) external view returns (
    bool requested,
    uint256 requestTime,
    uint256 requestId,
    bool timedOut,
    bool resolved
)
```

---

### Other View Functions

- `hasUserClaimed(uint16 proposalId, address user)`: Check if user claimed
- `getVotingTimeLeft(uint16 proposalId)`: Seconds remaining
- `isVotingActive(uint16 proposalId)`: Check if voting is active
- `getTotalResidents()`: Total registered residents

---

## Events

### ResidentRegistered
```solidity
event ResidentRegistered(address indexed resident, uint256 timestamp)
```

### ProposalCreated
```solidity
event ProposalCreated(
    uint16 indexed proposalId,
    address indexed creator,
    string title,
    uint256 startTime,
    uint256 endTime,
    uint256 participationStake
)
```

### VoteSubmitted
```solidity
event VoteSubmitted(
    address indexed voter,
    uint16 indexed proposalId,
    uint256 timestamp
)
```

### DecryptionRequested
```solidity
event DecryptionRequested(
    uint16 indexed proposalId,
    uint256 requestId,
    uint256 timestamp
)
```

### ProposalResolved
```solidity
event ProposalResolved(
    uint16 indexed proposalId,
    bool yesWon,
    uint64 yesVotes,
    uint64 noVotes,
    uint256 prizePool
)
```

### PrizeClaimed
```solidity
event PrizeClaimed(
    uint16 indexed proposalId,
    address indexed winner,
    uint256 amount
)
```

### RefundClaimed
```solidity
event RefundClaimed(
    uint16 indexed proposalId,
    address indexed claimer,
    uint256 amount,
    string reason
)
```

### DecryptionTimeout
```solidity
event DecryptionTimeout(
    uint16 indexed proposalId,
    uint256 timeoutAt
)
```

### EmergencyPause / EmergencyUnpause
```solidity
event EmergencyPause(address indexed by, uint256 timestamp)
event EmergencyUnpause(address indexed by, uint256 timestamp)
```

### GuardianChanged
```solidity
event GuardianChanged(address indexed oldGuardian, address indexed newGuardian)
```

### PlatformFeesWithdrawn
```solidity
event PlatformFeesWithdrawn(address indexed to, uint256 amount)
```

---

## Error Messages

| Error | Reason |
|-------|--------|
| `"Not authorized: manager only"` | Caller is not property manager |
| `"Not authorized: owner or guardian only"` | Caller is neither manager nor guardian |
| `"Not registered resident"` | Caller is not registered |
| `"Contract is paused"` | Contract in emergency pause |
| `"Proposal doesn't exist"` | Invalid proposal ID |
| `"Already registered"` | User already registered |
| `"Invalid unit number: must be 1-200"` | Unit number out of range |
| `"Incorrect creation stake"` | Wrong ETH amount sent |
| `"Invalid title length"` | Title too short/long |
| `"Invalid description length"` | Description too short/long |
| `"Duration must be 24-168 hours"` | Invalid voting duration |
| `"Stake too low"` | Participation stake below minimum |
| `"Vote type must be 0 (No) or 1 (Yes)"` | Invalid vote type |
| `"Already participated"` | User already voted |
| `"Results not revealed yet"` | Decryption not complete |
| `"Already claimed"` | Prize/refund already claimed |
| `"Tie - use claimRefund instead"` | Cannot claim prize on tie |
| `"Not a winner"` | User voted on losing side |
| `"Refund not available: ..."` | No refund condition met |

---

## Integration Examples

### Complete Voting Flow

```javascript
// 1. Register as resident
await contract.registerResident(42);

// 2. Create proposal (manager only)
await contract.createProposal(
    "Install Solar Panels",
    "Proposal to install solar panels",
    72, // 3 days
    ethers.utils.parseEther("0.01"),
    { value: ethers.utils.parseEther("0.02") }
);

// 3. Submit encrypted vote
const instance = await fhevm.createInstance();
const weight = instance.encrypt64(100);
await contract.submitVote(
    1,
    weight.handles[0],
    1, // Yes
    weight.inputProof,
    { value: ethers.utils.parseEther("0.01") }
);

// 4. Wait for voting to end...

// 5. Request decryption
await contract.requestTallyDecryption(1);

// 6. Wait for Gateway callback...

// 7. Check results
const results = await contract.getProposalResults(1);

// 8. Claim prize or refund
if (results.yesVotes > results.noVotes) {
    await contract.claimPrize(1);
} else if (results.yesVotes === results.noVotes) {
    await contract.claimRefund(1);
}
```

### Event Listening

```javascript
// Listen for new proposals
contract.on("ProposalCreated", (id, creator, title) => {
    console.log(`New proposal #${id}: ${title}`);
});

// Listen for results
contract.on("ProposalResolved", (id, yesWon, yes, no, pool) => {
    console.log(`Proposal #${id} resolved!`);
    console.log(`Winner: ${yesWon ? 'Yes' : 'No'}`);
});
```

---

## Gas Optimization

| Operation | Gas Cost | HCU Cost |
|-----------|----------|----------|
| Register Resident | ~120k | ~30k |
| Create Proposal | ~180k | 0 |
| Submit Vote | ~280k | ~60k |
| Request Decryption | ~100k+ | ~20k |
| Resolve Callback | ~80k | 0 |
| Claim Prize | ~65k | 0 |
| Claim Refund | ~55k | 0 |

---

For more information, see:
- **Architecture**: `docs/ARCHITECTURE.md`
- **README**: `README.md`
- **GitHub Issues**: [repository]/issues
