import contractAbi from './abi.json';

export const CONTRACT_ADDRESS = '0x6Ece9C29F6E47876bC3809BAC99c175273E184aB' as const;

export const CONTRACT_ABI = contractAbi as const;

export interface Proposal {
  title: string;
  description: string;
  startTime: bigint;
  endTime: bigint;
  isActive: boolean;
  resultsRevealed: boolean;
  creator: string;
}

export interface ProposalResults {
  resultsRevealed: boolean;
  totalVotes: number;
  yesVotes: number;
  noVotes: number;
  approved: boolean;
}
