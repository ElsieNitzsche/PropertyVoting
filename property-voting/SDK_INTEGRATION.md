# Property Voting - FHEVM SDK Integration Guide

This document explains how the Property Voting dApp integrates with the FHEVM Universal SDK.

## Overview

The Property Voting example has been updated to use the FHEVM Universal SDK for all encryption and utility operations. This provides a cleaner, more maintainable codebase and demonstrates SDK usage in a vanilla JavaScript application.

## Integration Files

### 1. `src/fhevm-integration.js`

Main FHEVM SDK integration module that provides:

```javascript
import { fhevmIntegration, initFHEVM, encryptVote } from './src/fhevm-integration.js';

// Initialize FHEVM
await initFHEVM();

// Encrypt a vote
const encryptedVote = await encryptVote(1); // 1 for YES, 0 for NO
```

**Available Functions:**

- `initFHEVM()` - Initialize the FHEVM client
- `encryptVote(vote)` - Encrypt vote value (0 or 1)
- `encryptUnitNumber(unitNumber)` - Encrypt unit number for registration
- `decryptVotingResult(handle, contractAddress, signer)` - Decrypt results
- `generateContractPermit(contractAddress, signer)` - Generate permit signature

### 2. `src/utils.js`

Utility functions using SDK utilities:

```javascript
import { displayAddress, validateAddress, formatTimestamp } from './src/utils.js';

// Display shortened address
const shortAddr = displayAddress('0x1234...5678'); // "0x12...5678"

// Validate Ethereum address
const isValid = validateAddress('0x1234567890123456789012345678901234567890');

// Format timestamp
const dateStr = formatTimestamp(1234567890);
```

**Available Utilities:**

- **Address Utilities:**
  - `displayAddress(address, chars)` - Truncate address for display
  - `validateAddress(address)` - Validate Ethereum address

- **Formatting:**
  - `displayHandle(handle)` - Format encrypted handle
  - `displayError(error)` - Format error messages
  - `displayDuration(seconds)` - Format time duration
  - `formatTimestamp(timestamp)` - Format Unix timestamp

- **Validation:**
  - `validateUnitNumber(unitNumber, min, max)` - Validate unit number
  - `validateProposal(title, description)` - Validate proposal inputs

- **Time Utilities:**
  - `calculateTimeRemaining(endTime)` - Calculate remaining time
  - `isVotingActive(endTime)` - Check if voting is active
  - `getCurrentTimestamp()` - Get current timestamp

- **Transaction Helpers:**
  - `waitForTransaction(tx, confirmations)` - Wait for transaction
  - `retryOperation(fn, maxAttempts, delayMs)` - Retry with backoff

- **Vote Utilities:**
  - `formatVoteChoice(choice)` - Format vote to 'YES'/'NO'
  - `getVoteEmoji(choice)` - Get vote emoji
  - `calculatePercentage(votes, total)` - Calculate percentage

## Usage Examples

### Example 1: Encrypt and Submit Vote

```javascript
import { fhevmIntegration } from './src/fhevm-integration.js';
import { formatVoteChoice, waitForTransaction } from './src/utils.js';

async function submitVote(voteChoice, proposalId) {
  try {
    // Initialize FHEVM if not already done
    if (!fhevmIntegration.isInitialized()) {
      await fhevmIntegration.init();
    }

    // Encrypt the vote
    const encryptedVote = await fhevmIntegration.encryptVote(voteChoice);

    console.log(`Submitting ${formatVoteChoice(voteChoice)} vote...`);

    // Submit to contract
    const tx = await contract.submitVote(proposalId, encryptedVote);

    // Wait for confirmation
    const receipt = await waitForTransaction(tx);

    console.log('Vote submitted successfully!');
    return receipt;
  } catch (error) {
    console.error('Failed to submit vote:', displayError(error));
    throw error;
  }
}
```

### Example 2: Register Resident with Encrypted Unit Number

```javascript
import { encryptUnitNumber } from './src/fhevm-integration.js';
import { validateUnitNumber, displayError } from './src/utils.js';

async function registerResident(unitNumber) {
  try {
    // Validate input
    if (!validateUnitNumber(unitNumber)) {
      throw new Error('Invalid unit number (must be 1-200)');
    }

    // Encrypt unit number
    const encryptedUnit = await encryptUnitNumber(unitNumber);

    // Submit to contract
    const tx = await contract.registerResident(encryptedUnit);
    await tx.wait();

    console.log('Resident registered successfully!');
  } catch (error) {
    console.error('Registration failed:', displayError(error));
    throw error;
  }
}
```

### Example 3: Display Voting Results with Formatting

```javascript
import { calculatePercentage, formatTimestamp } from './src/utils.js';

async function displayResults(proposalId) {
  const [revealed, totalVotes, yesVotes, noVotes, approved] =
    await contract.getProposalResults(proposalId);

  if (revealed) {
    const yesPercent = calculatePercentage(yesVotes, totalVotes);
    const noPercent = calculatePercentage(noVotes, totalVotes);

    console.log(`Results for Proposal #${proposalId}:`);
    console.log(`YES: ${yesVotes} votes (${yesPercent}%)`);
    console.log(`NO: ${noVotes} votes (${noPercent}%)`);
    console.log(`Status: ${approved ? 'APPROVED' : 'REJECTED'}`);
  }
}
```

### Example 4: Validate and Create Proposal

```javascript
import { validateProposal, waitForTransaction } from './src/utils.js';

async function createProposal(title, description, durationHours) {
  try {
    // Validate inputs
    const validation = validateProposal(title, description);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    // Create proposal
    const tx = await contract.createProposal(title, description, durationHours);

    console.log('Creating proposal...');
    const receipt = await waitForTransaction(tx);

    console.log('Proposal created successfully!');
    return receipt;
  } catch (error) {
    console.error('Failed to create proposal:', displayError(error));
    throw error;
  }
}
```

### Example 5: Timer Display with Time Utilities

```javascript
import { calculateTimeRemaining, isVotingActive } from './src/utils.js';

function updateVotingTimer(endTime) {
  if (!isVotingActive(endTime)) {
    console.log('Voting period has ended');
    return;
  }

  const { hours, minutes, seconds } = calculateTimeRemaining(endTime);
  console.log(`Time remaining: ${hours}h ${minutes}m ${seconds}s`);
}

// Update timer every second
setInterval(() => updateVotingTimer(proposalEndTime), 1000);
```

## Benefits of SDK Integration

1. **Simplified Encryption**: Single-line encryption instead of manual fhevmjs setup
2. **Consistent Utilities**: Standardized formatting and validation across all examples
3. **Better Error Handling**: Built-in error formatting and retry logic
4. **Type Safety**: Full TypeScript support when needed
5. **Maintainability**: Centralized SDK updates benefit all examples
6. **Best Practices**: SDK enforces secure patterns and proper usage

## Migration Notes

The vanilla HTML/JavaScript implementation maintains compatibility while using SDK modules:

- Uses ES6 modules for SDK integration
- Falls back to direct ethers.js for contract interactions
- Maintains existing UI/UX while improving backend logic
- Adds validation and error handling from SDK utilities

## File Structure

```
property-voting/
├── src/
│   ├── fhevm-integration.js    # FHEVM SDK integration
│   └── utils.js                # SDK utility functions
├── public/
│   ├── index.html              # Main HTML (can import SDK modules)
│   └── config.js               # Configuration
├── contracts/
│   └── AnonymousPropertyVoting.sol
├── package.json                # Includes @fhevm/universal-sdk
└── SDK_INTEGRATION.md          # This file
```

## Testing the Integration

1. Install dependencies:
   ```bash
   npm install
   ```

2. Build the SDK (from project root):
   ```bash
   npm run build:sdk
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open in browser and test:
   - Connect wallet
   - Register as resident with encrypted unit number
   - Create proposals
   - Submit encrypted votes
   - View decrypted results

## Advanced Usage

### Using SDK Type Definitions

```javascript
// For TypeScript projects, import types
import type { FHEVMClient, FHEVMConfig } from '@fhevm/universal-sdk';
```

### Batch Operations

```javascript
import { fhevmIntegration } from './src/fhevm-integration.js';

// Batch encrypt multiple values
async function batchEncrypt(values) {
  const encrypted = [];
  for (const value of values) {
    encrypted.push(await fhevmIntegration.encryptVote(value));
  }
  return encrypted;
}
```

### Error Recovery

```javascript
import { retryOperation, displayError } from './src/utils.js';

// Retry failed encryption with exponential backoff
const encryptedVote = await retryOperation(
  () => encryptVote(1),
  3,  // max attempts
  1000 // initial delay (ms)
);
```

## SDK Benefits Summary

| Feature | Before SDK | With SDK |
|---------|-----------|----------|
| Encryption | Manual fhevmjs setup | One-line function call |
| Validation | Custom code | Built-in validators |
| Error handling | Basic try-catch | Formatted errors + retry |
| Address display | Manual truncation | `displayAddress()` |
| Type safety | None | Full TypeScript support |
| Code reuse | Duplicated logic | Shared SDK utilities |

## Conclusion

The FHEVM Universal SDK integration provides a cleaner, more maintainable codebase while demonstrating how the SDK can be used in different types of JavaScript applications (vanilla JS, React, Next.js, etc.).
