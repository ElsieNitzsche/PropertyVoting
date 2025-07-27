'use client';

import { useReadContract } from 'wagmi';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '@/lib/contract';
import { ProposalCard } from './ProposalCard';

export function ProposalList() {
  const { data: proposalCount } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getProposalCount',
  }) as { data: bigint | undefined };

  const count = Number(proposalCount || 0);

  if (count === 0) {
    return (
      <section className="glass-panel p-12 text-center">
        <div className="space-y-4">
          <svg
            className="w-20 h-20 mx-auto text-gray-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h3 className="text-2xl font-semibold text-gray-400">No Proposals Yet</h3>
          <p className="text-gray-500">
            Proposals created by the property manager will appear here
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Active Proposals</h2>
        <p className="text-gray-400">
          Vote on community proposals anonymously with FHE encryption
        </p>
      </div>

      <div className="space-y-4">
        {Array.from({ length: count }, (_, i) => (
          <ProposalCard key={i} proposalId={i} />
        ))}
      </div>
    </section>
  );
}
