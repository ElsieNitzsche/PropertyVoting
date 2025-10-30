import React from 'react';
import { calculatePercentage } from '../utils';

interface VotingResults {
  resultsRevealed: boolean;
  totalVotes: number;
  yesVotes: number;
  noVotes: number;
  approved: boolean;
}

interface ResultsDisplayProps {
  results: VotingResults | null;
  currentProposalId: number;
}

export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({
  results,
  currentProposalId,
}) => {
  if (!results || !results.resultsRevealed || results.totalVotes === 0) {
    return (
      <div className="card full-width">
        <h2>Voting Results</h2>
        <p style={{ textAlign: 'center', color: '#718096', padding: '20px 0' }}>
          {currentProposalId > 0
            ? 'Voting in progress, results not yet revealed'
            : 'No voting results available'}
        </p>
      </div>
    );
  }

  const yesPercentage = calculatePercentage(results.yesVotes, results.totalVotes);
  const noPercentage = calculatePercentage(results.noVotes, results.totalVotes);

  return (
    <div className="card full-width">
      <h2>Voting Results</h2>
      <div className="results-display">
        <h4>
          Voting Results - {results.approved ? 'APPROVED' : 'REJECTED'}
        </h4>
        <div style={{ marginBottom: '15px' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '5px',
            }}
          >
            <span>
              <strong>YES Votes</strong>
            </span>
            <span>
              {results.yesVotes} votes ({yesPercentage}%)
            </span>
          </div>
          <div className="result-bar">
            <div
              className="result-fill yes"
              style={{ width: `${yesPercentage}%` }}
            >
              {results.yesVotes} votes
            </div>
          </div>
        </div>
        <div style={{ marginBottom: '15px' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '5px',
            }}
          >
            <span>
              <strong>NO Votes</strong>
            </span>
            <span>
              {results.noVotes} votes ({noPercentage}%)
            </span>
          </div>
          <div className="result-bar">
            <div
              className="result-fill no"
              style={{ width: `${noPercentage}%` }}
            >
              {results.noVotes} votes
            </div>
          </div>
        </div>
        <div
          style={{
            textAlign: 'center',
            marginTop: '20px',
            paddingTop: '15px',
            borderTop: '1px solid #e2e8f0',
          }}
        >
          <p>
            <strong>Total Votes:</strong> {results.totalVotes}
          </p>
          <p
            style={{
              marginTop: '5px',
              color: results.approved ? '#38a169' : '#e53e3e',
              fontWeight: 'bold',
            }}
          >
            Result: {results.approved ? 'Proposal APPROVED' : 'Proposal REJECTED'}
          </p>
        </div>
      </div>
    </div>
  );
};
