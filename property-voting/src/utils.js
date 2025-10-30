/**
 * Utility functions for Property Voting dApp
 * Integrates with FHEVM Universal SDK
 */

import {
  formatHandle,
  truncateAddress,
  isValidAddress,
  formatError,
  formatDuration,
  retry
} from '@fhevm/universal-sdk';

/**
 * Format encrypted handle for display
 * @param {bigint|number} handle - Encrypted handle
 * @returns {string} Formatted handle
 */
export function displayHandle(handle) {
  return formatHandle(handle);
}

/**
 * Display shortened Ethereum address
 * @param {string} address - Ethereum address
 * @param {number} chars - Number of characters to show (default: 4)
 * @returns {string} Truncated address
 */
export function displayAddress(address, chars = 4) {
  return truncateAddress(address, chars);
}

/**
 * Validate Ethereum address
 * @param {string} address - Address to validate
 * @returns {boolean} True if valid
 */
export function validateAddress(address) {
  return isValidAddress(address);
}

/**
 * Format error message for user display
 * @param {Error|string|object} error - Error object or message
 * @returns {string} User-friendly error message
 */
export function displayError(error) {
  return formatError(error);
}

/**
 * Format time duration
 * @param {number} seconds - Duration in seconds
 * @returns {string} Formatted duration string
 */
export function displayDuration(seconds) {
  return formatDuration(seconds);
}

/**
 * Retry failed operations with exponential backoff
 * @param {Function} fn - Function to retry
 * @param {number} maxAttempts - Maximum retry attempts
 * @param {number} delayMs - Initial delay in milliseconds
 * @returns {Promise<any>} Result of successful operation
 */
export async function retryOperation(fn, maxAttempts = 3, delayMs = 1000) {
  return await retry(fn, maxAttempts, delayMs);
}

/**
 * Format timestamp to readable date
 * @param {number} timestamp - Unix timestamp
 * @returns {string} Formatted date string
 */
export function formatTimestamp(timestamp) {
  return new Date(timestamp * 1000).toLocaleString();
}

/**
 * Calculate time remaining
 * @param {number} endTime - End timestamp
 * @returns {object} Object with hours, minutes, seconds
 */
export function calculateTimeRemaining(endTime) {
  const now = Math.floor(Date.now() / 1000);
  const timeLeft = Math.max(0, endTime - now);

  return {
    total: timeLeft,
    hours: Math.floor(timeLeft / 3600),
    minutes: Math.floor((timeLeft % 3600) / 60),
    seconds: timeLeft % 60
  };
}

/**
 * Calculate voting percentage
 * @param {number} votes - Number of votes
 * @param {number} total - Total votes
 * @returns {string} Percentage string
 */
export function calculatePercentage(votes, total) {
  if (total === 0) return '0.0';
  return ((votes / total) * 100).toFixed(1);
}

/**
 * Check if voting is active
 * @param {number} endTime - Voting end timestamp
 * @returns {boolean} True if active
 */
export function isVotingActive(endTime) {
  const now = Math.floor(Date.now() / 1000);
  return now < endTime;
}

/**
 * Validate unit number
 * @param {number} unitNumber - Unit number to validate
 * @param {number} min - Minimum allowed (default: 1)
 * @param {number} max - Maximum allowed (default: 200)
 * @returns {boolean} True if valid
 */
export function validateUnitNumber(unitNumber, min = 1, max = 200) {
  const num = parseInt(unitNumber);
  return !isNaN(num) && num >= min && num <= max;
}

/**
 * Validate proposal inputs
 * @param {string} title - Proposal title
 * @param {string} description - Proposal description
 * @returns {object} Validation result { valid: boolean, error: string }
 */
export function validateProposal(title, description) {
  if (!title || title.trim().length === 0) {
    return { valid: false, error: 'Proposal title is required' };
  }

  if (title.length > 200) {
    return { valid: false, error: 'Proposal title is too long (max 200 characters)' };
  }

  if (!description || description.trim().length === 0) {
    return { valid: false, error: 'Proposal description is required' };
  }

  if (description.length > 2000) {
    return { valid: false, error: 'Proposal description is too long (max 2000 characters)' };
  }

  return { valid: true, error: null };
}

/**
 * Wait for transaction confirmation
 * @param {object} tx - Ethers transaction object
 * @param {number} confirmations - Number of confirmations to wait for
 * @returns {Promise<object>} Transaction receipt
 */
export async function waitForTransaction(tx, confirmations = 1) {
  console.log(`Waiting for transaction ${tx.hash}...`);
  const receipt = await tx.wait(confirmations);
  console.log(`Transaction confirmed in block ${receipt.blockNumber}`);
  return receipt;
}

/**
 * Safe number conversion
 * @param {any} value - Value to convert
 * @param {number} defaultValue - Default value if conversion fails
 * @returns {number} Converted number
 */
export function safeNumber(value, defaultValue = 0) {
  const num = Number(value);
  return isNaN(num) ? defaultValue : num;
}

/**
 * Delay execution
 * @param {number} ms - Milliseconds to delay
 * @returns {Promise<void>}
 */
export function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Get current timestamp in seconds
 * @returns {number} Current timestamp
 */
export function getCurrentTimestamp() {
  return Math.floor(Date.now() / 1000);
}

/**
 * Check if MetaMask is installed
 * @returns {boolean} True if installed
 */
export function hasMetaMask() {
  return typeof window !== 'undefined' && typeof window.ethereum !== 'undefined';
}

/**
 * Format vote choice to string
 * @param {number} choice - Vote choice (0 or 1)
 * @returns {string} Vote string ('YES' or 'NO')
 */
export function formatVoteChoice(choice) {
  return choice === 1 ? 'YES' : 'NO';
}

/**
 * Get vote emoji
 * @param {number} choice - Vote choice (0 or 1)
 * @returns {string} Emoji
 */
export function getVoteEmoji(choice) {
  return choice === 1 ? '✅' : '❌';
}

export default {
  displayHandle,
  displayAddress,
  validateAddress,
  displayError,
  displayDuration,
  retryOperation,
  formatTimestamp,
  calculateTimeRemaining,
  calculatePercentage,
  isVotingActive,
  validateUnitNumber,
  validateProposal,
  waitForTransaction,
  safeNumber,
  delay,
  getCurrentTimestamp,
  hasMetaMask,
  formatVoteChoice,
  getVoteEmoji
};
