import React from 'react';
import { displayAddress } from '../utils';

interface WalletConnectionProps {
  isConnected: boolean;
  account: string | null;
  isCorrectNetwork: boolean;
  onConnect: () => void;
}

export const WalletConnection: React.FC<WalletConnectionProps> = ({
  isConnected,
  account,
  isCorrectNetwork,
  onConnect,
}) => {
  return (
    <div className="card">
      <h2>Wallet Connection</h2>
      <div className={`status ${isConnected ? 'connected' : 'disconnected'}`}>
        {isConnected ? 'Wallet Connected' : 'Wallet Not Connected'}
      </div>
      {!isConnected && (
        <button className="btn" onClick={onConnect}>
          Connect MetaMask Wallet
        </button>
      )}
      {account && (
        <div style={{ marginTop: '15px' }}>
          <strong>Account Address:</strong>
          <div
            style={{
              wordBreak: 'break-all',
              marginTop: '5px',
              fontFamily: 'monospace',
              background: '#f7fafc',
              padding: '10px',
              borderRadius: '5px',
            }}
          >
            {account}
          </div>
        </div>
      )}
      {isConnected && !isCorrectNetwork && (
        <div className="error-message" style={{ marginTop: '15px' }}>
          Please switch to Sepolia Testnet to use this application
        </div>
      )}
    </div>
  );
};
