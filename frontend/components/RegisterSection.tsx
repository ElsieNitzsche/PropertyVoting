'use client';

import { useState } from 'react';
import { useAccount, useWriteContract, useReadContract } from 'wagmi';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '@/lib/contract';
import { useToast } from '@/hooks/useToast';

export function RegisterSection() {
  const { address } = useAccount();
  const { showToast } = useToast();
  const [unitNumber, setUnitNumber] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  const { data: isRegistered } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'isRegisteredResident',
    args: address ? [address] : undefined,
  }) as { data: boolean | undefined };

  const { writeContractAsync } = useWriteContract();

  const handleRegister = async () => {
    if (!unitNumber || isNaN(Number(unitNumber))) {
      showToast('Please enter a valid unit number (1-200)', 'error');
      return;
    }

    const num = Number(unitNumber);
    if (num < 1 || num > 200) {
      showToast('Unit number must be between 1 and 200', 'error');
      return;
    }

    try {
      setIsRegistering(true);

      // Note: Current contract accepts uint8 (plain number), not encrypted
      // In a full FHE implementation, this would be encrypted
      await writeContractAsync({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'registerResident',
        args: [num],
      } as any);

      showToast('Successfully registered as resident!', 'success');
      setUnitNumber('');
    } catch (error: any) {
      console.error('Registration error:', error);
      showToast(error?.message || 'Failed to register', 'error');
    } finally {
      setIsRegistering(false);
    }
  };

  if (isRegistered) {
    return (
      <section className="glass-panel p-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-success/20 flex items-center justify-center">
            <svg className="w-6 h-6 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-success">Registered Resident</h3>
            <p className="text-sm text-gray-400">You can now participate in voting</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="glass-panel p-6 space-y-4">
      <div>
        <h2 className="text-2xl font-bold mb-2">Register as Resident</h2>
        <p className="text-gray-400">
          Register your unit number (encrypted) to participate in community voting
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Unit Number (1-200)
          </label>
          <input
            type="number"
            min="1"
            max="200"
            value={unitNumber}
            onChange={(e) => setUnitNumber(e.target.value)}
            className="input-field"
            placeholder="Enter your unit number"
            disabled={isRegistering}
          />
          <p className="text-xs text-gray-500 mt-1">
            Your unit number will be encrypted before submission
          </p>
        </div>

        <button
          onClick={handleRegister}
          disabled={isRegistering || !unitNumber}
          className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isRegistering ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Registering...
            </span>
          ) : (
            'Register Now'
          )}
        </button>
      </div>
    </section>
  );
}
