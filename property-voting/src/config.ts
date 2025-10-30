export const CONTRACT_CONFIG = {
  CONTRACT_ADDRESS: "0xD30412C56d2E50dE333512Bd91664d98475E8eFf",
  CHAIN_ID: 11155111,
  CHAIN_ID_HEX: "0xaa36a7",
  CHAIN_NAME: "Sepolia Testnet",
  RPC_URL: "https://rpc.sepolia.org",
  EXPLORER_URL: "https://sepolia.etherscan.io",
  ABI: [
    "function registerResident(uint8 unitNumber) external",
    "function createProposal(string memory title, string memory description, uint256 votingDurationHours) external",
    "function submitVote(uint16 proposalId, uint8 voteChoice) external",
    "function endProposal(uint16 proposalId) external",
    "function getCurrentProposalInfo() external view returns (uint16, string, string, bool, uint256, uint256, uint16)",
    "function getResidentStatus(address resident) external view returns (bool, uint256, bool)",
    "function getProposalResults(uint16 proposalId) external view returns (bool, uint16, uint16, uint16, bool)",
    "function getTotalResidents() external view returns (uint256)",
    "function getVotingTimeLeft(uint16 proposalId) external view returns (uint256)",
    "function isVotingActive(uint16 proposalId) external view returns (bool)",
    "event ResidentRegistered(address indexed resident)",
    "event ProposalCreated(uint16 indexed proposalId, string title, uint256 endTime)",
    "event VoteSubmitted(address indexed voter, uint16 indexed proposalId)",
    "event ProposalEnded(uint16 indexed proposalId, uint16 yesVotes, uint16 noVotes)",
    "event ResultsRevealed(uint16 indexed proposalId, bool approved)"
  ]
};
