'use client';

import { useState } from 'react';
import { useAccount, useWriteContract, useReadContract } from 'wagmi';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '@/lib/contract';
import { useToast } from '@/hooks/useToast';

export function CreateProposalSection() {
  const { address } = useAccount();
  const { showToast } = useToast();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState('24');
  const [isCreating, setIsCreating] = useState(false);

  const { data: propertyManager } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'propertyManager',
  }) as { data: string | undefined };

  const { writeContractAsync } = useWriteContract();

  const isManager = address && propertyManager && typeof propertyManager === 'string' && address.toLowerCase() === propertyManager.toLowerCase();

  const handleCreateProposal = async () => {
    if (!title.trim()) {
      showToast('Please enter a proposal title', 'error');
      return;
    }

    if (!description.trim()) {
      showToast('Please enter a proposal description', 'error');
      return;
    }

    const hours = Number(duration);
    if (isNaN(hours) || hours < 1 || hours > 168) {
      showToast('Duration must be between 1 and 168 hours (1-7 days)', 'error');
      return;
    }

    try {
      setIsCreating(true);

      await writeContractAsync({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'createProposal',
        args: [title, description, BigInt(hours)],
      } as any);

      showToast('Proposal created successfully!', 'success');
      setTitle('');
      setDescription('');
      setDuration('24');
    } catch (error: any) {
      console.error('Create proposal error:', error);
      showToast(error?.message || 'Failed to create proposal', 'error');
    } finally {
      setIsCreating(false);
    }
  };

  if (!isManager) {
    return null;
  }

  return (
    <section className="glass-panel p-6 space-y-4">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <h2 className="text-2xl font-bold">Create Proposal</h2>
          <span className="badge-info">Manager Only</span>
        </div>
        <p className="text-gray-400">
          Create a new voting proposal for the community
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Proposal Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="input-field"
            placeholder="e.g., Install Solar Panels on Rooftop"
            disabled={isCreating}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="input-field min-h-[120px] resize-none"
            placeholder="Provide details about the proposal..."
            disabled={isCreating}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Voting Duration (Hours)
          </label>
          <input
            type="number"
            min="1"
            max="168"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            className="input-field"
            disabled={isCreating}
          />
          <p className="text-xs text-gray-500 mt-1">
            Between 1 and 168 hours (1-7 days)
          </p>
        </div>

        <button
          onClick={handleCreateProposal}
          disabled={isCreating || !title || !description}
          className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isCreating ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Creating Proposal...
            </span>
          ) : (
            'Create Proposal'
          )}
        </button>
      </div>
    </section>
  );
}
