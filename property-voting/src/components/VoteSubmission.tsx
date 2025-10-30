import React, { useState, useEffect } from 'react';
import { formatTimestamp, calculateTimeRemaining } from '../utils';
import { fhevmIntegration } from '../fhevm-integration';

interface Proposal {
  id: number;
  title: string;
  description: string;
  isActive: boolean;
  startTime: number;
  endTime: number;
  totalVotes: number;
}

interface VoteSubmissionProps {
  proposal: Proposal | null;
  onSubmitVote: (proposalId: number, encryptedVote: Uint8Array) => Promise<void>;
}

export const VoteSubmission: React.FC<VoteSubmissionProps> = ({
  proposal,
  onSubmitVote,
}) => {
  const [loading, setLoading] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState({ hours: 0, minutes: 0, seconds: 0, total: 0 });

  useEffect(() => {
    if (!proposal) return;

    const updateTimer = () => {
      const remaining = calculateTimeRemaining(proposal.endTime);
      setTimeRemaining(remaining);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [proposal]);

  const handleVote = async (voteChoice: number) => {
    const voteText = voteChoice === 1 ? 'YES' : 'NO';
    const confirmed = window.confirm(
      `Confirm your vote: ${voteText}?\n\nNote: Vote cannot be changed once submitted!`
    );

    if (!confirmed || !proposal) return;

    setLoading(true);
    try {
      // Initialize FHEVM SDK if not already initialized
      if (!fhevmIntegration.isInitialized()) {
        console.log('Initializing FHEVM SDK for vote encryption...');
        await fhevmIntegration.init();
      }

      // Encrypt vote using FHEVM SDK
      console.log(`Encrypting vote: ${voteText} (${voteChoice})`);
      const encryptedVote = await fhevmIntegration.encryptVote(voteChoice);
      console.log('Vote encrypted successfully');

      // Submit encrypted vote
      await onSubmitVote(proposal.id, encryptedVote);
    } catch (err) {
      console.error('Vote submission failed:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!proposal || !proposal.isActive) {
    return (
      <div className="card">
        <h2>Current Voting</h2>
        <div style={{ textAlign: 'center', color: '#718096', padding: '40px 0' }}>
          <p>No active voting currently</p>
        </div>
      </div>
    );
  }

  const isVotingEnded = timeRemaining.total <= 0;

  return (
    <div className="card">
      <h2>Current Voting</h2>
      <div className="proposal-info">
        <h3>{proposal.title}</h3>
        <p style={{ marginBottom: '10px' }}>
          <strong>Description:</strong>
        </p>
        <p style={{ marginBottom: '15px' }}>{proposal.description}</p>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '10px',
            fontSize: '0.9rem',
            color: '#666',
          }}
        >
          <div>
            <strong>Start Time:</strong> {formatTimestamp(proposal.startTime)}
          </div>
          <div>
            <strong>End Time:</strong> {formatTimestamp(proposal.endTime)}
          </div>
          <div>
            <strong>Total Votes:</strong> {proposal.totalVotes}
          </div>
          <div>
            <strong>Proposal ID:</strong> #{proposal.id}
          </div>
        </div>
      </div>

      <div className="timer">
        {isVotingEnded ? (
          'Voting Period Ended'
        ) : (
          `Time Remaining: ${timeRemaining.hours}h ${timeRemaining.minutes}m ${timeRemaining.seconds}s`
        )}
      </div>

      <div className="voting-section">
        <button
          className="btn vote-btn vote-yes"
          onClick={() => handleVote(1)}
          disabled={loading || isVotingEnded}
        >
          YES
        </button>
        <button
          className="btn vote-btn vote-no"
          onClick={() => handleVote(0)}
          disabled={loading || isVotingEnded}
        >
          NO
        </button>
      </div>
    </div>
  );
};
