import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { WalletConnection } from './WalletConnection';
import { ResidentRegistration } from './ResidentRegistration';
import { AdminPanel } from './AdminPanel';
import { VoteSubmission } from './VoteSubmission';
import { ResultsDisplay } from './ResultsDisplay';
import { CONTRACT_CONFIG } from '../config';
import { displayError } from '../utils';

interface ResidentStatus {
  isRegistered: boolean;
  registrationTime: number;
  hasVoted: boolean;
}

interface Proposal {
  id: number;
  title: string;
  description: string;
  isActive: boolean;
  startTime: number;
  endTime: number;
  totalVotes: number;
}

interface VotingResults {
  resultsRevealed: boolean;
  totalVotes: number;
  yesVotes: number;
  noVotes: number;
  approved: boolean;
}

export const VotingApp: React.FC = () => {
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null);
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [account, setAccount] = useState<string | null>(null);
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(false);
  const [residentStatus, setResidentStatus] = useState<ResidentStatus | null>(null);
  const [currentProposal, setCurrentProposal] = useState<Proposal | null>(null);
  const [votingResults, setVotingResults] = useState<VotingResults | null>(null);
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  // Initialize on mount
  useEffect(() => {
    checkConnection();

    if (typeof window.ethereum !== 'undefined') {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
    }

    return () => {
      if (typeof window.ethereum !== 'undefined') {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, []);

  // Load data when contract is available
  useEffect(() => {
    if (contract && account) {
      loadData();
    }
  }, [contract, account]);

  const handleAccountsChanged = (accounts: string[]) => {
    if (accounts.length === 0) {
      window.location.reload();
    } else {
      window.location.reload();
    }
  };

  const handleChainChanged = () => {
    window.location.reload();
  };

  const checkConnection = async () => {
    if (typeof window.ethereum === 'undefined') return;

    try {
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      if (accounts.length > 0) {
        await connectWallet();
      }
    } catch (error) {
      console.error('Error checking connection:', error);
    }
  };

  const connectWallet = async () => {
    if (typeof window.ethereum === 'undefined') {
      showMessage('error', 'Please install MetaMask wallet');
      return;
    }

    try {
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      const web3Provider = new ethers.BrowserProvider(window.ethereum);
      const web3Signer = await web3Provider.getSigner();
      const userAddress = await web3Signer.getAddress();

      // Check network
      const network = await web3Provider.getNetwork();
      const correctNetwork = Number(network.chainId) === CONTRACT_CONFIG.CHAIN_ID;
      setIsCorrectNetwork(correctNetwork);

      if (!correctNetwork) {
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: CONTRACT_CONFIG.CHAIN_ID_HEX }],
          });
          setIsCorrectNetwork(true);
        } catch (switchError) {
          console.error('Failed to switch network:', switchError);
          showMessage('error', 'Please switch to Sepolia Testnet');
          return;
        }
      }

      const contractInstance = new ethers.Contract(
        CONTRACT_CONFIG.CONTRACT_ADDRESS,
        CONTRACT_CONFIG.ABI,
        web3Signer
      );

      setProvider(web3Provider);
      setSigner(web3Signer);
      setContract(contractInstance);
      setAccount(userAddress);

      showMessage('success', 'Wallet connected successfully');
    } catch (error: any) {
      console.error('Wallet connection failed:', error);
      showMessage('error', displayError(error));
    }
  };

  const loadData = async () => {
    if (!contract || !account) return;

    try {
      await Promise.all([
        loadResidentStatus(),
        loadCurrentProposal(),
      ]);
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  };

  const loadResidentStatus = async () => {
    if (!contract || !account) return;

    try {
      const [isRegistered, registrationTime, hasVoted] = await contract.getResidentStatus(account);
      setResidentStatus({
        isRegistered,
        registrationTime: Number(registrationTime),
        hasVoted,
      });
    } catch (error) {
      console.error('Failed to load resident status:', error);
    }
  };

  const loadCurrentProposal = async () => {
    if (!contract) return;

    try {
      const [proposalId, title, description, isActive, startTime, endTime, totalVotes] =
        await contract.getCurrentProposalInfo();

      const id = Number(proposalId);

      if (isActive && id > 0) {
        setCurrentProposal({
          id,
          title,
          description,
          isActive,
          startTime: Number(startTime),
          endTime: Number(endTime),
          totalVotes: Number(totalVotes),
        });

        // Load results
        await loadResults(id);
      } else {
        setCurrentProposal(null);
        setVotingResults(null);
      }
    } catch (error) {
      console.error('Failed to load proposal:', error);
    }
  };

  const loadResults = async (proposalId: number) => {
    if (!contract) return;

    try {
      const [resultsRevealed, totalVotes, yesVotes, noVotes, approved] =
        await contract.getProposalResults(proposalId);

      setVotingResults({
        resultsRevealed,
        totalVotes: Number(totalVotes),
        yesVotes: Number(yesVotes),
        noVotes: Number(noVotes),
        approved,
      });
    } catch (error) {
      console.error('Failed to load results:', error);
    }
  };

  const handleRegisterResident = async (encryptedUnitNumber: Uint8Array) => {
    if (!contract || !isCorrectNetwork) {
      throw new Error('Please connect wallet and switch to Sepolia Testnet');
    }

    try {
      showMessage('success', 'Transaction submitted. Waiting for confirmation...');
      const tx = await contract.registerResident(encryptedUnitNumber);
      await tx.wait();
      showMessage('success', 'Resident registration successful!');
      await loadResidentStatus();
    } catch (error: any) {
      console.error('Registration failed:', error);
      throw new Error(error.reason || error.message || 'Registration failed');
    }
  };

  const handleCreateProposal = async (title: string, description: string, duration: number) => {
    if (!contract || !isCorrectNetwork) {
      throw new Error('Please connect wallet and switch to Sepolia Testnet');
    }

    try {
      showMessage('success', 'Transaction submitted. Waiting for confirmation...');
      const tx = await contract.createProposal(title, description, duration);
      await tx.wait();
      showMessage('success', 'Proposal created successfully!');
      await loadCurrentProposal();
    } catch (error: any) {
      console.error('Proposal creation failed:', error);
      throw new Error(error.reason || error.message || 'Proposal creation failed');
    }
  };

  const handleSubmitVote = async (proposalId: number, encryptedVote: Uint8Array) => {
    if (!contract || !account || !isCorrectNetwork) {
      showMessage('error', 'Please connect wallet and switch to Sepolia Testnet');
      return;
    }

    if (!residentStatus?.isRegistered) {
      showMessage('error', 'Please register as a resident first');
      return;
    }

    if (residentStatus.hasVoted) {
      showMessage('error', 'You have already voted on this proposal');
      return;
    }

    try {
      showMessage('success', 'Vote submitted. Waiting for confirmation...');
      const tx = await contract.submitVote(proposalId, encryptedVote);
      await tx.wait();
      showMessage('success', 'Vote submitted successfully!');
      await loadData();
    } catch (error: any) {
      console.error('Vote submission failed:', error);
      showMessage('error', error.reason || error.message || 'Vote submission failed');
    }
  };

  const showMessage = (type: 'error' | 'success', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  return (
    <div className="container">
      <div className="header">
        <h1>Anonymous Property Voting System</h1>
        <p>Privacy-Preserving Community Decision Making Platform powered by Zama FHE Technology</p>
      </div>

      <div className="network-info">
        <strong>Network:</strong> {CONTRACT_CONFIG.CHAIN_NAME} |{' '}
        <strong>Contract:</strong> {CONTRACT_CONFIG.CONTRACT_ADDRESS}
      </div>

      {message && (
        <div className={`${message.type}-message`} style={{ marginBottom: '20px' }}>
          {message.text}
        </div>
      )}

      <div className="main-content">
        <WalletConnection
          isConnected={!!account}
          account={account}
          isCorrectNetwork={isCorrectNetwork}
          onConnect={connectWallet}
        />

        <ResidentRegistration
          isRegistered={residentStatus?.isRegistered || false}
          registrationTime={residentStatus?.registrationTime}
          hasVoted={residentStatus?.hasVoted || false}
          onRegister={handleRegisterResident}
        />

        <AdminPanel onCreateProposal={handleCreateProposal} />

        <VoteSubmission
          proposal={currentProposal}
          onSubmitVote={handleSubmitVote}
        />
      </div>

      <ResultsDisplay
        results={votingResults}
        currentProposalId={currentProposal?.id || 0}
      />
    </div>
  );
};
