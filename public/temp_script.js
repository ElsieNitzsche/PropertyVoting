// Temporary script to expose window.CONFIG to main.js module
if (typeof window.CONFIG === 'undefined') {
    console.error('CONFIG not loaded from config.js!');
} else {
    console.log('✓ CONFIG loaded successfully from config.js');
    console.log('Contract Address:', window.CONFIG.CONTRACT_ADDRESS);
}
