'use client';

import { useState } from 'react';
import { useAccount, useReadContract, useWriteContract } from 'wagmi';
import { CONTRACT_ADDRESS, CONTRACT_ABI, type Proposal } from '@/lib/contract';
import { useToast } from '@/hooks/useToast';
import { formatDistanceToNow } from '@/utils/date';

interface ProposalCardProps {
  proposalId: number;
}

export function ProposalCard({ proposalId }: ProposalCardProps) {
  const { address } = useAccount();
  const { showToast } = useToast();
  const [isVoting, setIsVoting] = useState(false);

  const { data: proposal } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getProposal',
    args: [BigInt(proposalId)],
  }) as { data: Proposal | undefined };

  const { data: hasVoted } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'hasVoted',
    args: address ? [BigInt(proposalId), address] : undefined,
  }) as { data: boolean | undefined };

  const { data: voteCount } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getVoteCount',
    args: [BigInt(proposalId)],
  }) as { data: bigint | undefined };

  const { data: results } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getProposalResults',
    args: [BigInt(proposalId)],
  }) as { data: [bigint, bigint] | undefined };

  const { data: owner } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'owner',
  }) as { data: string | undefined };

  const { writeContractAsync } = useWriteContract();

  const isOwner = address && owner && typeof owner === 'string' && address.toLowerCase() === owner.toLowerCase();

  const handleVote = async (voteYes: boolean) => {
    try {
      setIsVoting(true);

      // In production, this would use fhevmjs to encrypt the vote
      // For now, we'll use a placeholder encrypted value
      const encryptedVote = `0x${Buffer.from(voteYes ? 'yes' : 'no').toString('hex').padEnd(64, '0')}`;

      await writeContractAsync({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'vote',
        args: [BigInt(proposalId), encryptedVote],
      });

      showToast(`Vote cast successfully! (${voteYes ? 'Yes' : 'No'})`, 'success');
    } catch (error: any) {
      console.error('Vote error:', error);
      showToast(error?.message || 'Failed to cast vote', 'error');
    } finally {
      setIsVoting(false);
    }
  };

  const handleClose = async () => {
    try {
      await writeContractAsync({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'closeProposal',
        args: [BigInt(proposalId)],
      });

      showToast('Proposal closed successfully!', 'success');
    } catch (error: any) {
      console.error('Close proposal error:', error);
      showToast(error?.message || 'Failed to close proposal', 'error');
    }
  };

  const handleRevealResults = async () => {
    try {
      await writeContractAsync({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'requestResultRevelation',
        args: [BigInt(proposalId)],
      });

      showToast('Results revelation requested!', 'success');
    } catch (error: any) {
      console.error('Reveal results error:', error);
      showToast(error?.message || 'Failed to reveal results', 'error');
    }
  };

  if (!proposal) {
    return (
      <div className="glass-panel p-6">
        <div className="animate-pulse space-y-3">
          <div className="h-6 bg-white/10 rounded w-3/4" />
          <div className="h-4 bg-white/10 rounded w-full" />
          <div className="h-4 bg-white/10 rounded w-5/6" />
        </div>
      </div>
    );
  }

  const now = Date.now();
  const endTime = Number(proposal.endTime) * 1000;
  const isExpired = now > endTime;
  const timeRemaining = isExpired ? 'Ended' : formatDistanceToNow(endTime);

  return (
    <div className="glass-panel p-6 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-xl font-bold">{proposal.title}</h3>
            {proposal.isActive ? (
              <span className="badge-success">Active</span>
            ) : (
              <span className="badge-error">Closed</span>
            )}
            {proposal.resultsRevealed && (
              <span className="badge-info">Results Revealed</span>
            )}
          </div>
          <p className="text-gray-400 text-sm">{proposal.description}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white/5 rounded-lg p-3">
          <p className="text-xs text-gray-400">Proposal ID</p>
          <p className="text-lg font-semibold">#{proposalId}</p>
        </div>
        <div className="bg-white/5 rounded-lg p-3">
          <p className="text-xs text-gray-400">Total Votes</p>
          <p className="text-lg font-semibold">{voteCount?.toString() || '0'}</p>
        </div>
        <div className="bg-white/5 rounded-lg p-3">
          <p className="text-xs text-gray-400">Status</p>
          <p className="text-lg font-semibold">{timeRemaining}</p>
        </div>
        <div className="bg-white/5 rounded-lg p-3">
          <p className="text-xs text-gray-400">Your Vote</p>
          <p className="text-lg font-semibold">{hasVoted ? 'Cast ✓' : 'Pending'}</p>
        </div>
      </div>

      {/* Results (if revealed) */}
      {proposal.resultsRevealed && results && (
        <div className="space-y-2">
          <p className="text-sm font-medium">Results:</p>
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="flex-1 bg-white/5 rounded-full h-8 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-success to-green-600 flex items-center px-3"
                  style={{
                    width: `${
                      Number(results[0]) + Number(results[1]) > 0
                        ? (Number(results[0]) / (Number(results[0]) + Number(results[1]))) * 100
                        : 0
                    }%`,
                  }}
                >
                  <span className="text-xs font-medium">Yes: {results[0].toString()}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1 bg-white/5 rounded-full h-8 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-error to-red-600 flex items-center px-3"
                  style={{
                    width: `${
                      Number(results[0]) + Number(results[1]) > 0
                        ? (Number(results[1]) / (Number(results[0]) + Number(results[1]))) * 100
                        : 0
                    }%`,
                  }}
                >
                  <span className="text-xs font-medium">No: {results[1].toString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        {proposal.isActive && !hasVoted && !isExpired && (
          <>
            <button
              onClick={() => handleVote(true)}
              disabled={isVoting}
              className="btn-success flex-1 disabled:opacity-50"
            >
              Vote Yes
            </button>
            <button
              onClick={() => handleVote(false)}
              disabled={isVoting}
              className="btn-secondary flex-1 disabled:opacity-50"
            >
              Vote No
            </button>
          </>
        )}

        {hasVoted && (
          <div className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-success/10 border border-success/20 text-success">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Vote Cast
          </div>
        )}

        {isOwner && proposal.isActive && isExpired && (
          <button onClick={handleClose} className="btn-secondary flex-1">
            Close Proposal
          </button>
        )}

        {isOwner && !proposal.isActive && !proposal.resultsRevealed && (
          <button onClick={handleRevealResults} className="btn-primary flex-1">
            Reveal Results
          </button>
        )}
      </div>
    </div>
  );
}
