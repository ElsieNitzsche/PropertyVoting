import React, { useState } from 'react';
import { validateProposal } from '../utils';

interface AdminPanelProps {
  onCreateProposal: (title: string, description: string, duration: number) => Promise<void>;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onCreateProposal }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState('72');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreateProposal = async () => {
    setError('');

    const validation = validateProposal(title, description);
    if (!validation.valid) {
      setError(validation.error || 'Invalid proposal');
      return;
    }

    setLoading(true);
    try {
      await onCreateProposal(title, description, parseInt(duration));
      setTitle('');
      setDescription('');
    } catch (err: any) {
      setError(err.message || 'Proposal creation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h2>Admin Functions</h2>
      <div className="form-group">
        <label htmlFor="proposalTitle">Proposal Title:</label>
        <input
          type="text"
          id="proposalTitle"
          placeholder="e.g., Community Fitness Equipment Upgrade"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={loading}
        />
      </div>
      <div className="form-group">
        <label htmlFor="proposalDescription">Proposal Description:</label>
        <textarea
          id="proposalDescription"
          rows={4}
          placeholder="Detailed description of the proposal and its purpose..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={loading}
        />
      </div>
      <div className="form-group">
        <label htmlFor="votingDuration">Voting Duration (hours):</label>
        <select
          id="votingDuration"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          disabled={loading}
        >
          <option value="24">24 hours (1 day)</option>
          <option value="48">48 hours (2 days)</option>
          <option value="72">72 hours (3 days)</option>
          <option value="96">96 hours (4 days)</option>
          <option value="120">120 hours (5 days)</option>
          <option value="144">144 hours (6 days)</option>
          <option value="168">168 hours (7 days)</option>
        </select>
      </div>
      <button
        className="btn btn-secondary"
        onClick={handleCreateProposal}
        disabled={loading}
      >
        {loading ? 'Creating...' : 'Create New Proposal'}
      </button>
      {error && (
        <div className="error-message" style={{ marginTop: '15px' }}>
          {error}
        </div>
      )}
    </div>
  );
};
