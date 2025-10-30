# Property Voting - SDK Integration Usage

This file documents how to use the SDK integration in the Property Voting example.

## SDK Integration Files

The property-voting example has been enhanced with SDK integration modules:

### 1. `src/fhevm-integration.js`
Main FHEVM SDK wrapper for vanilla JavaScript applications.

### 2. `src/utils.js`
Utility functions powered by the FHEVM Universal SDK.

## How to Use in HTML/JavaScript

While the current `index.html` uses vanilla ethers.js for compatibility, you can integrate the SDK modules as follows:

### Option 1: ES6 Modules (Recommended for Modern Browsers)

Update your HTML to use ES6 modules:

```html
<!DOCTYPE html>
<html>
<head>
    <title>Property Voting with SDK</title>
</head>
<body>
    <script type="module">
        // Import SDK integration
        import { initFHEVM, encryptVote, encryptUnitNumber } from './src/fhevm-integration.js';
        import { displayAddress, validateUnitNumber, formatVoteChoice } from './src/utils.js';

        // Initialize FHEVM
        await initFHEVM();

        // Use utilities
        const shortAddr = displayAddress('0x1234567890123456789012345678901234567890');
        console.log(shortAddr); // "0x1234...7890"

        // Encrypt vote
        const encryptedVote = await encryptVote(1); // 1 = YES

        // Validate unit number
        if (validateUnitNumber(42)) {
            const encryptedUnit = await encryptUnitNumber(42);
        }
    </script>
</body>
</html>
```

### Option 2: Build with Bundler (Webpack/Vite)

If you use a bundler, you can import directly:

```javascript
import { fhevmIntegration } from './src/fhevm-integration.js';
import utils from './src/utils.js';

async function init() {
    await fhevmIntegration.init();

    // Now use SDK features
    const encrypted = await fhevmIntegration.encryptVote(1);
}
```

## Example: Enhanced Voting with SDK

```html
<script type="module">
    import {
        initFHEVM,
        encryptVote,
        encryptUnitNumber,
        decryptVotingResult,
        generateContractPermit
    } from './src/fhevm-integration.js';

    import {
        displayAddress,
        validateAddress,
        validateUnitNumber,
        formatVoteChoice,
        calculatePercentage,
        waitForTransaction,
        displayError
    } from './src/utils.js';

    // Initialize
    let fhevmClient = null;

    async function initialize() {
        try {
            fhevmClient = await initFHEVM();
            console.log('SDK initialized successfully');
        } catch (error) {
            alert(`Initialization failed: ${displayError(error)}`);
        }
    }

    // Register resident
    async function registerResident(unitNumber) {
        try {
            // Validate
            if (!validateUnitNumber(unitNumber)) {
                throw new Error('Invalid unit number (1-200)');
            }

            // Encrypt unit number
            const encrypted = await encryptUnitNumber(unitNumber);

            // Submit to contract
            const tx = await contract.registerResident(encrypted);
            await waitForTransaction(tx);

            alert('Registration successful!');
        } catch (error) {
            alert(`Registration failed: ${displayError(error)}`);
        }
    }

    // Submit vote
    async function submitVote(proposalId, voteChoice) {
        try {
            // Encrypt vote
            const encrypted = await encryptVote(voteChoice);

            console.log(`Submitting ${formatVoteChoice(voteChoice)} vote...`);

            // Submit to contract
            const tx = await contract.submitVote(proposalId, encrypted);
            await waitForTransaction(tx);

            alert('Vote submitted successfully!');
        } catch (error) {
            alert(`Vote failed: ${displayError(error)}`);
        }
    }

    // Display results
    function displayResults(yesVotes, noVotes, totalVotes) {
        const yesPercent = calculatePercentage(yesVotes, totalVotes);
        const noPercent = calculatePercentage(noVotes, totalVotes);

        console.log(`YES: ${yesVotes} (${yesPercent}%)`);
        console.log(`NO: ${noVotes} (${noPercent}%)`);
    }

    // Display address
    function showAddress(address) {
        if (validateAddress(address)) {
            return displayAddress(address);
        }
        return 'Invalid address';
    }

    // Initialize on load
    window.addEventListener('load', initialize);
</script>
```

## Current Implementation

The current `index.html` uses standard ethers.js for maximum compatibility. To use the SDK modules:

1. **For development**: Use the ES6 module approach above
2. **For production**: Consider bundling with Webpack/Vite
3. **For simple integration**: Import the SDK utilities where needed

## Benefits of SDK Integration

1. **Simplified API**: Single-line functions for complex operations
2. **Better Validation**: Built-in validators for addresses, unit numbers, etc.
3. **Error Handling**: Consistent error formatting
4. **Utilities**: Common functions like address truncation, percentage calculation
5. **Type Safety**: Full TypeScript support (when using .ts files)

## Migration Path

To fully migrate `index.html` to use SDK:

1. Change script tag to `<script type="module">`
2. Import SDK functions at top of script
3. Replace custom implementations with SDK utilities
4. Update error handling to use `formatError()`
5. Use validation utilities instead of regex

See `SDK_INTEGRATION.md` for complete documentation and examples.
