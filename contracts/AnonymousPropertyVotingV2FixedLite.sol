// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { FHE, euint8, euint16, ebool } from "@fhevm/solidity/lib/FHE.sol";
import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

interface IGatewayV2 {
    function isRequestDecryptAllowed(address requester) external view returns (bool);
}

/**
 * @title AnonymousPropertyVotingV2FixedLite
 * @notice Gas优化版：保留核心FHE功能，添加紧急关闭
 */
contract AnonymousPropertyVotingV2FixedLite is SepoliaConfig {

    address public propertyManager;
    uint16 public currentProposal;
    address public gateway;

    struct ResidentProfile {
        bool isRegistered;
        euint8 encryptedUnit;
    }

    struct VotingProposal {
        string title;
        bool isActive;
        uint256 endTime;
        uint16 totalVotes;
        uint16 yesVotes;
        uint16 noVotes;
        bool resultsRevealed;
        address[] voters;
        mapping(address => bool) hasVoted;
    }

    struct EncryptedVote {
        euint8 vote;
        bool submitted;
    }

    mapping(uint16 => VotingProposal) public proposals;
    mapping(address => ResidentProfile) public residents;
    mapping(uint16 => mapping(address => EncryptedVote)) public proposalVotes;

    event ResidentRegistered(address indexed resident);
    event ProposalCreated(uint16 indexed proposalId, uint256 endTime);
    event VoteSubmitted(address indexed voter, uint16 indexed proposalId);
    event ProposalEnded(uint16 indexed proposalId, uint16 yesVotes, uint16 noVotes);
    event ProposalForceClosed(uint16 indexed proposalId);

    modifier onlyPropertyManager() {
        require(msg.sender == propertyManager, "Not mgr");
        _;
    }

    modifier onlyRegisteredResident() {
        require(residents[msg.sender].isRegistered, "Not resident");
        _;
    }

    constructor(address _gateway) {
        propertyManager = msg.sender;
        currentProposal = 1;
        gateway = _gateway;
    }

    function registerResident(uint8 unitNumber) external {
        require(!residents[msg.sender].isRegistered, "Registered");
        require(unitNumber > 0 && unitNumber <= 200, "Invalid unit");

        euint8 encryptedUnit = FHE.asEuint8(unitNumber);

        residents[msg.sender] = ResidentProfile({
            isRegistered: true,
            encryptedUnit: encryptedUnit
        });

        FHE.allowThis(encryptedUnit);
        FHE.allow(encryptedUnit, msg.sender);

        emit ResidentRegistered(msg.sender);
    }

    function createProposal(
        string memory title,
        uint256 votingDurationHours
    ) external onlyPropertyManager {
        require(votingDurationHours >= 24 && votingDurationHours <= 168, "Duration 1-7d");
        require(!proposals[currentProposal].isActive, "Active proposal");

        uint256 endTime = block.timestamp + (votingDurationHours * 3600);

        VotingProposal storage newProposal = proposals[currentProposal];
        newProposal.title = title;
        newProposal.isActive = true;
        newProposal.endTime = endTime;
        newProposal.totalVotes = 0;
        newProposal.yesVotes = 0;
        newProposal.noVotes = 0;
        newProposal.resultsRevealed = false;

        emit ProposalCreated(currentProposal, endTime);
    }

    function submitVote(uint16 proposalId, uint8 voteChoice)
        external
        onlyRegisteredResident
    {
        require(proposals[proposalId].isActive, "Not active");
        require(block.timestamp <= proposals[proposalId].endTime, "Ended");
        require(voteChoice <= 1, "Invalid vote");
        require(!proposalVotes[proposalId][msg.sender].submitted, "Voted");

        euint8 encryptedVote = FHE.asEuint8(voteChoice);

        proposalVotes[proposalId][msg.sender] = EncryptedVote({
            vote: encryptedVote,
            submitted: true
        });

        proposals[proposalId].hasVoted[msg.sender] = true;
        proposals[proposalId].voters.push(msg.sender);
        proposals[proposalId].totalVotes++;

        FHE.allowThis(encryptedVote);
        FHE.allow(encryptedVote, msg.sender);

        emit VoteSubmitted(msg.sender, proposalId);
    }

    /**
     * @notice 强制关闭提案（紧急使用）
     */
    function forceCloseProposal(uint16 proposalId)
        external
        onlyPropertyManager
    {
        require(proposals[proposalId].isActive, "Not active");

        VotingProposal storage proposal = proposals[proposalId];
        proposal.isActive = false;
        proposal.resultsRevealed = true;

        emit ProposalForceClosed(proposalId);
        emit ProposalEnded(proposalId, 0, 0);

        currentProposal++;
    }

    function endProposal(uint16 proposalId)
        external
        onlyPropertyManager
    {
        require(block.timestamp > proposals[proposalId].endTime, "Active");
        require(!proposals[proposalId].resultsRevealed, "Revealed");
        require(proposals[proposalId].isActive, "Not active");
        require(proposals[proposalId].totalVotes > 0, "No votes");

        if (gateway != address(0)) {
            require(
                IGatewayV2(gateway).isRequestDecryptAllowed(address(this)),
                "Gateway denied"
            );
        }

        VotingProposal storage proposal = proposals[proposalId];
        proposal.isActive = false;

        bytes32[] memory cts = new bytes32[](proposal.voters.length);

        for (uint i = 0; i < proposal.voters.length; i++) {
            address voter = proposal.voters[i];
            cts[i] = FHE.toBytes32(proposalVotes[proposalId][voter].vote);
        }

        FHE.requestDecryption(cts, this.processVoteResults.selector);
    }

    function processVoteResults(
        uint256 requestId,
        uint8[] memory decryptedVotes,
        bytes[] memory signatures
    ) external {
        bytes memory decryptedData = abi.encodePacked(decryptedVotes);
        bytes memory signaturesData = abi.encode(signatures);
        FHE.checkSignatures(requestId, decryptedData, signaturesData);

        VotingProposal storage proposal = proposals[currentProposal];

        uint16 yesCount = 0;
        uint16 noCount = 0;

        for (uint i = 0; i < decryptedVotes.length; i++) {
            if (decryptedVotes[i] == 1) {
                yesCount++;
            } else if (decryptedVotes[i] == 0) {
                noCount++;
            }
        }

        proposal.yesVotes = yesCount;
        proposal.noVotes = noCount;
        proposal.resultsRevealed = true;

        emit ProposalEnded(currentProposal, yesCount, noCount);

        currentProposal++;
    }

    // === 查询函数 ===

    function getCurrentProposalInfo() external view returns (
        uint16 proposalId,
        string memory title,
        string memory description,
        bool isActive,
        uint256 startTime,
        uint256 endTime,
        uint16 totalVotes
    ) {
        VotingProposal storage proposal = proposals[currentProposal];
        return (
            currentProposal,
            proposal.title,
            "", // 移除description以节省gas
            proposal.isActive,
            0, // 移除startTime以节省gas
            proposal.endTime,
            proposal.totalVotes
        );
    }

    function getResidentStatus(address resident) external view returns (
        bool isRegistered,
        uint256 registrationTime,
        bool hasVotedCurrentProposal
    ) {
        return (
            residents[resident].isRegistered,
            0, // 移除registrationTime以节省gas
            proposals[currentProposal].hasVoted[resident]
        );
    }

    function getProposalResults(uint16 proposalId) external view returns (
        bool resultsRevealed,
        uint16 totalVotes,
        uint16 yesVotes,
        uint16 noVotes,
        bool approved
    ) {
        VotingProposal storage proposal = proposals[proposalId];
        bool isApproved = proposal.yesVotes > proposal.noVotes;

        return (
            proposal.resultsRevealed,
            proposal.totalVotes,
            proposal.yesVotes,
            proposal.noVotes,
            isApproved
        );
    }

    function getVotingTimeLeft(uint16 proposalId) external view returns (uint256) {
        if (block.timestamp >= proposals[proposalId].endTime) {
            return 0;
        }
        return proposals[proposalId].endTime - block.timestamp;
    }

    function isVotingActive(uint16 proposalId) external view returns (bool) {
        return proposals[proposalId].isActive &&
               block.timestamp <= proposals[proposalId].endTime;
    }

    function setGateway(address _newGateway) external onlyPropertyManager {
        gateway = _newGateway;
    }

    function getVersionInfo() external pure returns (
        string memory version,
        string memory features
    ) {
        return (
            "2.0.2-LITE",
            "FHE | Force Close | Gas Optimized"
        );
    }
}
