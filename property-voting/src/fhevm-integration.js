/**
 * FHEVM SDK Integration Module for Property Voting
 * This module provides FHEVM encryption/decryption capabilities using the universal SDK
 */

import { createFHEVMClient, NETWORKS } from '@fhevm/universal-sdk';

class FHEVMIntegration {
  constructor() {
    this.client = null;
    this.initialized = false;
  }

  /**
   * Initialize FHEVM client
   */
  async init() {
    if (this.initialized) {
      return this.client;
    }

    try {
      console.log('Initializing FHEVM SDK...');

      // Create FHEVM client for Sepolia network
      this.client = createFHEVMClient({
        network: NETWORKS.SEPOLIA
      });

      await this.client.init();
      this.initialized = true;

      console.log('FHEVM SDK initialized successfully');
      return this.client;
    } catch (error) {
      console.error('Failed to initialize FHEVM SDK:', error);
      throw error;
    }
  }

  /**
   * Encrypt a vote value (0 for NO, 1 for YES)
   * @param {number} vote - Vote value (0 or 1)
   * @returns {Promise<Uint8Array>} Encrypted vote
   */
  async encryptVote(vote) {
    if (!this.initialized) {
      await this.init();
    }

    try {
      // Encrypt as uint8
      const encrypted = await this.client.encryptNumber(vote, 8);
      console.log(`Vote ${vote} encrypted successfully`);
      return encrypted;
    } catch (error) {
      console.error('Failed to encrypt vote:', error);
      throw error;
    }
  }

  /**
   * Encrypt unit number for resident registration
   * @param {number} unitNumber - Unit number (1-200)
   * @returns {Promise<Uint8Array>} Encrypted unit number
   */
  async encryptUnitNumber(unitNumber) {
    if (!this.initialized) {
      await this.init();
    }

    try {
      // Encrypt as uint8
      const encrypted = await this.client.encryptNumber(unitNumber, 8);
      console.log(`Unit number ${unitNumber} encrypted successfully`);
      return encrypted;
    } catch (error) {
      console.error('Failed to encrypt unit number:', error);
      throw error;
    }
  }

  /**
   * Create encrypted input for contract
   * @param {string} contractAddress - Contract address
   * @param {object} signer - Ethers signer
   * @returns {object} Encrypted input builder
   */
  createEncryptedInput(contractAddress, signer) {
    if (!this.initialized) {
      throw new Error('FHEVM client not initialized. Call init() first.');
    }

    return this.client.createEncryptedInput(contractAddress, signer);
  }

  /**
   * Decrypt voting results
   * @param {bigint} handle - Encrypted handle
   * @param {string} contractAddress - Contract address
   * @param {object} signer - Ethers signer
   * @returns {Promise<bigint>} Decrypted value
   */
  async decryptResult(handle, contractAddress, signer) {
    if (!this.initialized) {
      await this.init();
    }

    try {
      const decrypted = await this.client.userDecrypt(handle, contractAddress, signer);
      console.log('Result decrypted successfully');
      return decrypted;
    } catch (error) {
      console.error('Failed to decrypt result:', error);
      throw error;
    }
  }

  /**
   * Generate permit signature for contract access
   * @param {string} contractAddress - Contract address
   * @param {object} signer - Ethers signer
   * @returns {Promise<string>} Permit signature
   */
  async generatePermit(contractAddress, signer) {
    if (!this.initialized) {
      await this.init();
    }

    try {
      const signature = await this.client.generatePermitSignature(contractAddress, signer);
      console.log('Permit signature generated successfully');
      return signature;
    } catch (error) {
      console.error('Failed to generate permit:', error);
      throw error;
    }
  }

  /**
   * Get the FHEVM client instance
   * @returns {object} FHEVM client
   */
  getClient() {
    if (!this.initialized) {
      throw new Error('FHEVM client not initialized. Call init() first.');
    }
    return this.client;
  }

  /**
   * Check if client is initialized
   * @returns {boolean} Initialization status
   */
  isInitialized() {
    return this.initialized;
  }

  /**
   * Get public key for encryption
   * @returns {string} Public key
   */
  getPublicKey() {
    if (!this.initialized) {
      throw new Error('FHEVM client not initialized. Call init() first.');
    }
    return this.client.getPublicKey();
  }
}

// Export singleton instance
export const fhevmIntegration = new FHEVMIntegration();

// Export utility functions
export async function initFHEVM() {
  return await fhevmIntegration.init();
}

export async function encryptVote(vote) {
  return await fhevmIntegration.encryptVote(vote);
}

export async function encryptUnitNumber(unitNumber) {
  return await fhevmIntegration.encryptUnitNumber(unitNumber);
}

export async function decryptVotingResult(handle, contractAddress, signer) {
  return await fhevmIntegration.decryptResult(handle, contractAddress, signer);
}

export async function generateContractPermit(contractAddress, signer) {
  return await fhevmIntegration.generatePermit(contractAddress, signer);
}

// Default export
export default fhevmIntegration;
