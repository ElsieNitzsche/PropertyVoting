'use client';

import { useState } from 'react';
import { useAccount, useReadContract, useWriteContract } from 'wagmi';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '@/lib/contract';
import { useToast } from '@/hooks/useToast';

export function CurrentProposal() {
  const { address } = useAccount();
  const { showToast } = useToast();
  const [isVoting, setIsVoting] = useState(false);

  // Get current proposal info
  const { data: proposalInfo } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getCurrentProposalInfo',
  }) as { data: any };

  // Check if user has voted
  const { data: hasVotedData } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getResidentStatus',
    args: address ? [address] : undefined,
  }) as { data: any };

  const { writeContractAsync } = useWriteContract();

  if (!proposalInfo || !proposalInfo[3]) { // isActive is at index 3
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
          <h3 className="text-2xl font-semibold text-gray-400">No Active Proposal</h3>
          <p className="text-gray-500">
            The property manager will create a proposal for community voting
          </p>
        </div>
      </section>
    );
  }

  const proposalId = proposalInfo[0];
  const title = proposalInfo[1];
  const description = proposalInfo[2];
  const isActive = proposalInfo[3];
  const startTime = Number(proposalInfo[4]);
  const endTime = Number(proposalInfo[5]);
  const totalVotes = Number(proposalInfo[6]);

  const now = Date.now() / 1000;
  const timeLeft = endTime - now;
  const hoursLeft = Math.max(0, Math.floor(timeLeft / 3600));
  const isRegistered = hasVotedData && hasVotedData[0]; // isRegistered at index 0
  const hasVoted = hasVotedData && hasVotedData[2]; // hasVotedCurrentProposal at index 2

  const handleVote = async (voteChoice: number) => {
    try {
      setIsVoting(true);

      await writeContractAsync({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'submitVote',
        args: [proposalId, voteChoice],
      } as any);

      showToast(`Vote cast successfully! (${voteChoice === 1 ? 'Yes' : 'No'})`, 'success');
    } catch (error: any) {
      console.error('Vote error:', error);
      showToast(error?.message || 'Failed to cast vote', 'error');
    } finally {
      setIsVoting(false);
    }
  };

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Current Proposal</h2>
        <p className="text-gray-400">
          Vote on the active community proposal
        </p>
      </div>

      <div className="glass-panel p-6 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-xl font-bold">{title}</h3>
              {isActive ? (
                <span className="badge-success">Active</span>
              ) : (
                <span className="badge-error">Closed</span>
              )}
            </div>
            <p className="text-gray-400 text-sm">{description}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="bg-white/5 rounded-lg p-3">
            <p className="text-xs text-gray-400">Proposal ID</p>
            <p className="text-lg font-semibold">#{proposalId}</p>
          </div>
          <div className="bg-white/5 rounded-lg p-3">
            <p className="text-xs text-gray-400">Total Votes</p>
            <p className="text-lg font-semibold">{totalVotes}</p>
          </div>
          <div className="bg-white/5 rounded-lg p-3">
            <p className="text-xs text-gray-400">Time Left</p>
            <p className="text-lg font-semibold">{hoursLeft > 0 ? `${hoursLeft}h` : 'Ended'}</p>
          </div>
        </div>

        {/* Voting Actions */}
        <div className="flex flex-wrap gap-3">
          {!isRegistered && (
            <div className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-warning/10 border border-warning/20 text-warning">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Please register as resident first
            </div>
          )}

          {isRegistered && isActive && !hasVoted && hoursLeft > 0 && (
            <>
              <button
                onClick={() => handleVote(1)}
                disabled={isVoting}
                className="btn-success flex-1 disabled:opacity-50"
              >
                Vote Yes
              </button>
              <button
                onClick={() => handleVote(0)}
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

          {hoursLeft <= 0 && !hasVoted && (
            <div className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-error/10 border border-error/20 text-error">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Voting Ended
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
