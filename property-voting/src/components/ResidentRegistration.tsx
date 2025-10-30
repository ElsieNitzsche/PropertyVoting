import React, { useState } from 'react';
import { validateUnitNumber, formatTimestamp } from '../utils';
import { fhevmIntegration } from '../fhevm-integration';

interface ResidentRegistrationProps {
  isRegistered: boolean;
  registrationTime?: number;
  hasVoted: boolean;
  onRegister: (encryptedUnitNumber: Uint8Array) => Promise<void>;
}

export const ResidentRegistration: React.FC<ResidentRegistrationProps> = ({
  isRegistered,
  registrationTime,
  hasVoted,
  onRegister,
}) => {
  const [unitNumber, setUnitNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async () => {
    setError('');

    if (!validateUnitNumber(unitNumber)) {
      setError('Please enter a valid unit number (1-200)');
      return;
    }

    setLoading(true);
    try {
      // Initialize FHEVM SDK if not already initialized
      if (!fhevmIntegration.isInitialized()) {
        console.log('Initializing FHEVM SDK for unit number encryption...');
        await fhevmIntegration.init();
      }

      // Encrypt unit number using FHEVM SDK
      const unitNum = parseInt(unitNumber);
      console.log(`Encrypting unit number: ${unitNum}`);
      const encryptedUnit = await fhevmIntegration.encryptUnitNumber(unitNum);
      console.log('Unit number encrypted successfully');

      // Register with encrypted unit number
      await onRegister(encryptedUnit);
      setUnitNumber('');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h2>Resident Registration</h2>
      <div className="form-group">
        <label htmlFor="unitNumber">Unit Number:</label>
        <input
          type="number"
          id="unitNumber"
          min="1"
          max="200"
          placeholder="Enter your unit number (1-200)"
          value={unitNumber}
          onChange={(e) => setUnitNumber(e.target.value)}
          disabled={isRegistered || loading}
        />
      </div>
      <button
        className="btn"
        onClick={handleRegister}
        disabled={isRegistered || loading}
      >
        {loading ? 'Registering...' : 'Register as Resident'}
      </button>
      {error && (
        <div className="error-message" style={{ marginTop: '15px' }}>
          {error}
        </div>
      )}
      {isRegistered && registrationTime && (
        <div className="success-message" style={{ marginTop: '15px' }}>
          Registered Resident
          <br />
          Registration Time: {formatTimestamp(registrationTime)}
          <br />
          Current Proposal Vote Status: {hasVoted ? 'Voted' : 'Not Voted'}
        </div>
      )}
      {!isRegistered && !loading && (
        <div className="error-message" style={{ marginTop: '15px' }}>
          Not registered yet. Please register as a resident first.
        </div>
      )}
    </div>
  );
};
