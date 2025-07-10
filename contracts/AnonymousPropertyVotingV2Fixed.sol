// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { FHE, euint8, euint16, ebool } from "@fhevm/solidity/lib/FHE.sol";
import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

/**
 * @title IGatewayV2
 * @notice 网关接口（使用新的 is... 模式）
 */
interface IGatewayV2 {
    function isPublicDecryptAllowed(address requester) external view returns (bool);
    function isRequestDecryptAllowed(address requester) external view returns (bool);
}

/**
 * @title AnonymousPropertyVotingV2Fixed
 * @notice 修复版：添加紧急关闭功能，允许在 FHE 失败时手动关闭提案
 */
contract AnonymousPropertyVotingV2Fixed is SepoliaConfig {

    address public propertyManager;
    uint16 public currentProposal;
    uint256 public proposalCreationTime;

    struct ResidentProfile {
        bool isRegistered;
        bool hasVoted;
        uint256 registrationTime;
        euint8 encryptedUnit;
    }

    struct VotingProposal {
        string title;
        string description;
        bool isActive;
        uint256 startTime;
        uint256 endTime;
        uint256 votingPeriod;
        uint16 totalVotes;
        uint16 yesVotes;
        uint16 noVotes;
        bool resultsRevealed;
        address[] voters;
        mapping(address => bool) hasVoted;
    }

    struct EncryptedVote {
        euint8 vote;
        uint256 timestamp;
        bool submitted;
    }

    mapping(uint16 => VotingProposal) public proposals;
    mapping(address => ResidentProfile) public residents;
    mapping(uint16 => mapping(address => EncryptedVote)) public proposalVotes;

    address[] public registeredResidents;
    address public gateway;

    event ResidentRegistered(address indexed resident);
    event ProposalCreated(uint16 indexed proposalId, string title, uint256 endTime);
    event VoteSubmitted(address indexed voter, uint16 indexed proposalId);
    event ProposalEnded(uint16 indexed proposalId, uint16 yesVotes, uint16 noVotes);
    event ResultsRevealed(uint16 indexed proposalId, bool approved);
    event GatewayUpdated(address indexed oldGateway, address indexed newGateway);
    event ProposalForceClosed(uint16 indexed proposalId, string reason); // 新增事件

    modifier onlyPropertyManager() {
        require(msg.sender == propertyManager, "Not authorized manager");
        _;
    }

    modifier onlyRegisteredResident() {
        require(residents[msg.sender].isRegistered, "Not a registered resident");
        _;
    }

    modifier onlyDuringVotingPeriod(uint16 proposalId) {
        require(proposals[proposalId].isActive, "Proposal not active");
        require(block.timestamp <= proposals[proposalId].endTime, "Voting period ended");
        _;
    }

    modifier onlyAfterVotingEnds(uint16 proposalId) {
        require(block.timestamp > proposals[proposalId].endTime, "Voting still active");
        require(!proposals[proposalId].resultsRevealed, "Results already revealed");
        _;
    }

    constructor(address _gateway) {
        propertyManager = msg.sender;
        currentProposal = 1;
        proposalCreationTime = block.timestamp;
        gateway = _gateway;

        if (_gateway != address(0)) {
            emit GatewayUpdated(address(0), _gateway);
        }
    }

    function registerResident(uint8 unitNumber) external {
        require(!residents[msg.sender].isRegistered, "Already registered");
        require(unitNumber > 0 && unitNumber <= 200, "Invalid unit number");

        euint8 encryptedUnit = FHE.asEuint8(unitNumber);

        residents[msg.sender] = ResidentProfile({
            isRegistered: true,
            hasVoted: false,
            registrationTime: block.timestamp,
            encryptedUnit: encryptedUnit
        });

        registeredResidents.push(msg.sender);

        FHE.allowThis(encryptedUnit);
        FHE.allow(encryptedUnit, msg.sender);

        emit ResidentRegistered(msg.sender);
    }

    function createProposal(
        string memory title,
        string memory description,
        uint256 votingDurationHours
    ) external onlyPropertyManager {
        require(votingDurationHours >= 24 && votingDurationHours <= 168, "Duration must be 1-7 days");
        require(!proposals[currentProposal].isActive, "Previous proposal still active");

        uint256 votingPeriod = votingDurationHours * 3600;
        uint256 endTime = block.timestamp + votingPeriod;

        VotingProposal storage newProposal = proposals[currentProposal];
        newProposal.title = title;
        newProposal.description = description;
        newProposal.isActive = true;
        newProposal.startTime = block.timestamp;
        newProposal.endTime = endTime;
        newProposal.votingPeriod = votingPeriod;
        newProposal.totalVotes = 0;
        newProposal.yesVotes = 0;
        newProposal.noVotes = 0;
        newProposal.resultsRevealed = false;

        emit ProposalCreated(currentProposal, title, endTime);
    }

    function submitVote(uint16 proposalId, uint8 voteChoice)
        external
        onlyRegisteredResident
        onlyDuringVotingPeriod(proposalId)
    {
        require(voteChoice == 0 || voteChoice == 1, "Vote must be 0 (No) or 1 (Yes)");
        require(!proposalVotes[proposalId][msg.sender].submitted, "Already voted on this proposal");
        require(!proposals[proposalId].hasVoted[msg.sender], "Already voted on this proposal");

        euint8 encryptedVote = FHE.asEuint8(voteChoice);

        proposalVotes[proposalId][msg.sender] = EncryptedVote({
            vote: encryptedVote,
            timestamp: block.timestamp,
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
     * @notice 🔧 新增：强制关闭提案（紧急使用）
     * @dev 当 FHE 解密失败或没有投票时使用
     */
    function forceCloseProposal(uint16 proposalId, string memory reason)
        external
        onlyPropertyManager
    {
        require(proposals[proposalId].isActive, "Proposal not active");

        VotingProposal storage proposal = proposals[proposalId];
        proposal.isActive = false;
        proposal.resultsRevealed = true;

        emit ProposalForceClosed(proposalId, reason);
        emit ProposalEnded(proposalId, 0, 0);

        // 递增提案计数器，允许创建新提案
        currentProposal++;
    }

    /**
     * @notice 原始的 endProposal 函数（需要 FHE 解密）
     */
    function endProposal(uint16 proposalId)
        external
        onlyPropertyManager
        onlyAfterVotingEnds(proposalId)
    {
        require(proposals[proposalId].isActive, "Proposal not active");
        require(proposals[proposalId].totalVotes > 0, "No votes to decrypt"); // 新增检查

        if (gateway != address(0)) {
            require(
                IGatewayV2(gateway).isRequestDecryptAllowed(address(this)),
                "Gateway: Decryption request not allowed"
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

        bool approved = yesCount > noCount;

        emit ProposalEnded(currentProposal, yesCount, noCount);
        emit ResultsRevealed(currentProposal, approved);

        currentProposal++;
    }

    // === 查询函数（保持不变）===

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
            proposal.description,
            proposal.isActive,
            proposal.startTime,
            proposal.endTime,
            proposal.totalVotes
        );
    }

    function getResidentStatus(address resident) external view returns (
        bool isRegistered,
        uint256 registrationTime,
        bool hasVotedCurrentProposal
    ) {
        ResidentProfile storage residentData = residents[resident];
        return (
            residentData.isRegistered,
            residentData.registrationTime,
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

    function getTotalResidents() external view returns (uint256) {
        return registeredResidents.length;
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
        address oldGateway = gateway;
        gateway = _newGateway;
        emit GatewayUpdated(oldGateway, _newGateway);
    }

    function isDecryptionAllowed() external view returns (bool) {
        if (gateway == address(0)) {
            return true;
        }
        return IGatewayV2(gateway).isPublicDecryptAllowed(address(this));
    }

    function getVersionInfo() external pure returns (
        string memory version,
        string memory features
    ) {
        return (
            "2.0.1-fhEVM-v0.6.0-FIXED",
            "Auto Re-randomization | Gateway Integration | Force Close Emergency Function"
        );
    }
}
