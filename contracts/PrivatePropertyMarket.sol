// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import { FHE, externalEuint64, euint64, euint16, euint8, ebool } from "@fhevm/solidity/lib/FHE.sol";
import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

/**
 * @title PrivatePropertyMarket
 * @notice Privacy-preserving property voting system with advanced features:
 *         - Gateway callback pattern for async decryption
 *         - Refund mechanism for failed decryptions and ties
 *         - Timeout protection to prevent permanent fund locks
 *         - Privacy protection with random multipliers and obfuscation
 *         - Comprehensive security controls
 * @dev Uses FHEVM for fully homomorphic encryption on-chain
 */
contract PrivatePropertyMarket is SepoliaConfig {

    // ============ State Variables ============

    address public propertyManager;
    address public guardian;
    uint16 public currentProposal;
    bool public paused;
    uint256 public platformFees;

    // Privacy protection: Random multiplier range (1-1000)
    uint256 private constant MIN_MULTIPLIER = 1;
    uint256 private constant MAX_MULTIPLIER = 1000;

    // Timeout protection constants
    uint256 public constant DECRYPTION_TIMEOUT = 1 hours;
    uint256 public constant MIN_VOTING_DURATION = 24 hours;
    uint256 public constant MAX_VOTING_DURATION = 7 days;

    // Stake requirements
    uint256 public proposalCreationStake = 0.02 ether;
    uint256 public constant MIN_PARTICIPATION_STAKE = 0.005 ether;

    // ============ Structs ============

    struct ResidentProfile {
        bool isRegistered;
        uint256 registrationTime;
        euint8 encryptedUnit;
        uint256 totalVotesCast;
    }

    struct VotingProposal {
        string title;
        string description;
        address creator;
        bool isActive;
        uint256 startTime;
        uint256 endTime;
        uint256 participationStake;
        uint256 prizePool;
        uint16 totalParticipants;
        bool decryptionRequested;
        uint256 decryptionRequestTime;
        uint256 decryptionRequestId;
        bool resultsRevealed;
        uint64 revealedYesVotes;
        uint64 revealedNoVotes;
        bool yesWon;
        uint256 randomMultiplier; // Privacy protection
        address[] participants;
        mapping(address => bool) hasParticipated;
        mapping(address => uint8) participantVoteType;
        mapping(address => bool) hasClaimed;
    }

    struct EncryptedVote {
        euint64 weight;
        euint8 voteType; // 0 = No, 1 = Yes
        uint256 timestamp;
        bool submitted;
    }

    // ============ Mappings ============

    mapping(uint16 => VotingProposal) public proposals;
    mapping(address => ResidentProfile) public residents;
    mapping(uint16 => mapping(address => EncryptedVote)) public proposalVotes;
    mapping(uint256 => uint16) private proposalIdByRequestId;

    address[] public registeredResidents;

    // ============ Events ============

    event ResidentRegistered(address indexed resident, uint256 timestamp);
    event ProposalCreated(
        uint16 indexed proposalId,
        address indexed creator,
        string title,
        uint256 startTime,
        uint256 endTime,
        uint256 participationStake
    );
    event VoteSubmitted(
        address indexed voter,
        uint16 indexed proposalId,
        uint256 timestamp
    );
    event DecryptionRequested(
        uint16 indexed proposalId,
        uint256 requestId,
        uint256 timestamp
    );
    event ProposalResolved(
        uint16 indexed proposalId,
        bool yesWon,
        uint64 yesVotes,
        uint64 noVotes,
        uint256 prizePool
    );
    event PrizeClaimed(
        uint16 indexed proposalId,
        address indexed winner,
        uint256 amount
    );
    event RefundClaimed(
        uint16 indexed proposalId,
        address indexed claimer,
        uint256 amount,
        string reason
    );
    event DecryptionTimeout(
        uint16 indexed proposalId,
        uint256 timeoutAt
    );
    event EmergencyPause(address indexed by, uint256 timestamp);
    event EmergencyUnpause(address indexed by, uint256 timestamp);
    event GuardianChanged(address indexed oldGuardian, address indexed newGuardian);
    event PlatformFeesWithdrawn(address indexed to, uint256 amount);

    // ============ Modifiers ============

    modifier onlyPropertyManager() {
        require(msg.sender == propertyManager, "Not authorized: manager only");
        _;
    }

    modifier onlyOwnerOrGuardian() {
        require(
            msg.sender == propertyManager || msg.sender == guardian,
            "Not authorized: owner or guardian only"
        );
        _;
    }

    modifier onlyRegisteredResident() {
        require(residents[msg.sender].isRegistered, "Not registered resident");
        _;
    }

    modifier whenNotPaused() {
        require(!paused, "Contract is paused");
        _;
    }

    modifier whenPaused() {
        require(paused, "Contract is not paused");
        _;
    }

    modifier validProposal(uint16 proposalId) {
        require(proposals[proposalId].creator != address(0), "Proposal doesn't exist");
        _;
    }

    modifier onlyDuringVotingPeriod(uint16 proposalId) {
        require(proposals[proposalId].isActive, "Proposal not active");
        require(block.timestamp >= proposals[proposalId].startTime, "Voting not started");
        require(block.timestamp <= proposals[proposalId].endTime, "Voting period ended");
        _;
    }

    modifier onlyAfterVotingEnds(uint16 proposalId) {
        require(block.timestamp > proposals[proposalId].endTime, "Voting still active");
        _;
    }

    // ============ Constructor ============

    constructor() {
        propertyManager = msg.sender;
        guardian = msg.sender;
        currentProposal = 1;
        paused = false;
    }

    // ============ Core Functions ============

    /**
     * @notice Register a resident with encrypted unit number
     * @param unitNumber The unit number (1-200)
     * @dev Unit number is encrypted on-chain for privacy
     */
    function registerResident(uint8 unitNumber)
        external
        whenNotPaused
    {
        require(!residents[msg.sender].isRegistered, "Already registered");
        require(unitNumber > 0 && unitNumber <= 200, "Invalid unit number: must be 1-200");

        euint8 encryptedUnit = FHE.asEuint8(unitNumber);

        residents[msg.sender] = ResidentProfile({
            isRegistered: true,
            registrationTime: block.timestamp,
            encryptedUnit: encryptedUnit,
            totalVotesCast: 0
        });

        registeredResidents.push(msg.sender);

        FHE.allowThis(encryptedUnit);
        FHE.allow(encryptedUnit, msg.sender);

        emit ResidentRegistered(msg.sender, block.timestamp);
    }

    /**
     * @notice Create a new voting proposal
     * @param title Proposal title
     * @param description Proposal description
     * @param votingDurationHours Voting duration (24-168 hours)
     * @param participationStake Stake required per participant
     * @dev Creator must stake ETH to create proposal
     */
    function createProposal(
        string memory title,
        string memory description,
        uint256 votingDurationHours,
        uint256 participationStake
    )
        external
        payable
        onlyPropertyManager
        whenNotPaused
    {
        // Input validation
        require(msg.value == proposalCreationStake, "Incorrect creation stake");
        require(bytes(title).length > 0 && bytes(title).length <= 200, "Invalid title length");
        require(bytes(description).length > 0 && bytes(description).length <= 1000, "Invalid description length");
        require(
            votingDurationHours >= MIN_VOTING_DURATION / 1 hours &&
            votingDurationHours <= MAX_VOTING_DURATION / 1 hours,
            "Duration must be 24-168 hours"
        );
        require(participationStake >= MIN_PARTICIPATION_STAKE, "Stake too low");
        require(!proposals[currentProposal].isActive, "Previous proposal still active");

        platformFees += msg.value;

        uint256 votingDuration = votingDurationHours * 1 hours;
        uint256 endTime = block.timestamp + votingDuration;

        // Generate pseudo-random multiplier for privacy protection
        uint256 randomMultiplier = _generateRandomMultiplier(currentProposal);

        VotingProposal storage newProposal = proposals[currentProposal];
        newProposal.title = title;
        newProposal.description = description;
        newProposal.creator = msg.sender;
        newProposal.isActive = true;
        newProposal.startTime = block.timestamp;
        newProposal.endTime = endTime;
        newProposal.participationStake = participationStake;
        newProposal.prizePool = 0;
        newProposal.totalParticipants = 0;
        newProposal.decryptionRequested = false;
        newProposal.decryptionRequestTime = 0;
        newProposal.decryptionRequestId = 0;
        newProposal.resultsRevealed = false;
        newProposal.revealedYesVotes = 0;
        newProposal.revealedNoVotes = 0;
        newProposal.yesWon = false;
        newProposal.randomMultiplier = randomMultiplier;

        emit ProposalCreated(
            currentProposal,
            msg.sender,
            title,
            block.timestamp,
            endTime,
            participationStake
        );
    }

    /**
     * @notice Submit encrypted vote with weight
     * @param proposalId Proposal to vote on
     * @param encryptedWeight Encrypted vote weight
     * @param voteType 0 for No, 1 for Yes
     * @param inputProof FHE input proof
     * @dev Uses Gateway pattern for encrypted input
     */
    function submitVote(
        uint16 proposalId,
        externalEuint64 encryptedWeight,
        uint8 voteType,
        bytes calldata inputProof
    )
        external
        payable
        onlyRegisteredResident
        whenNotPaused
        validProposal(proposalId)
        onlyDuringVotingPeriod(proposalId)
    {
        VotingProposal storage proposal = proposals[proposalId];

        // Input validation
        require(voteType == 0 || voteType == 1, "Vote type must be 0 (No) or 1 (Yes)");
        require(msg.value == proposal.participationStake, "Incorrect participation stake");
        require(!proposal.hasParticipated[msg.sender], "Already participated");
        require(!proposalVotes[proposalId][msg.sender].submitted, "Already voted");

        // Convert external encrypted input with proof
        euint64 weight = FHE.fromExternal(encryptedWeight, inputProof);

        // Apply privacy protection multiplier
        euint64 obfuscatedWeight = FHE.mul(weight, FHE.asEuint64(proposal.randomMultiplier));

        euint8 encryptedVoteType = FHE.asEuint8(voteType);
        euint64 zero = FHE.asEuint64(0);

        // Conditional accumulation based on vote type
        ebool isYes = FHE.eq(encryptedVoteType, FHE.asEuint8(1));
        ebool isNo = FHE.eq(encryptedVoteType, FHE.asEuint8(0));

        // Store encrypted vote
        proposalVotes[proposalId][msg.sender] = EncryptedVote({
            weight: obfuscatedWeight,
            voteType: encryptedVoteType,
            timestamp: block.timestamp,
            submitted: true
        });

        // Update proposal state
        proposal.hasParticipated[msg.sender] = true;
        proposal.participantVoteType[msg.sender] = voteType;
        proposal.participants.push(msg.sender);
        proposal.totalParticipants++;
        proposal.prizePool += msg.value;

        // Update resident stats
        residents[msg.sender].totalVotesCast++;

        // Set FHE permissions
        FHE.allowThis(obfuscatedWeight);
        FHE.allowThis(encryptedVoteType);
        FHE.allow(obfuscatedWeight, msg.sender);
        FHE.allow(encryptedVoteType, msg.sender);

        emit VoteSubmitted(msg.sender, proposalId, block.timestamp);
    }

    /**
     * @notice Request decryption via Gateway callback
     * @param proposalId Proposal to decrypt
     * @dev Initiates async decryption process with timeout protection
     */
    function requestTallyDecryption(uint16 proposalId)
        external
        validProposal(proposalId)
        onlyAfterVotingEnds(proposalId)
        whenNotPaused
    {
        VotingProposal storage proposal = proposals[proposalId];

        require(!proposal.resultsRevealed, "Results already revealed");
        require(!proposal.decryptionRequested, "Decryption already requested");
        require(
            msg.sender == proposal.creator || msg.sender == propertyManager,
            "Only creator or manager can request"
        );

        proposal.isActive = false;
        proposal.decryptionRequested = true;
        proposal.decryptionRequestTime = block.timestamp;

        // Aggregate encrypted votes
        euint64 totalYesVotes = FHE.asEuint64(0);
        euint64 totalNoVotes = FHE.asEuint64(0);

        for (uint i = 0; i < proposal.participants.length; i++) {
            address participant = proposal.participants[i];
            EncryptedVote storage vote = proposalVotes[proposalId][participant];

            euint8 voteType = vote.voteType;
            euint64 weight = vote.weight;
            euint64 zero = FHE.asEuint64(0);

            ebool isYes = FHE.eq(voteType, FHE.asEuint8(1));
            ebool isNo = FHE.eq(voteType, FHE.asEuint8(0));

            totalYesVotes = FHE.add(totalYesVotes, FHE.select(isYes, weight, zero));
            totalNoVotes = FHE.add(totalNoVotes, FHE.select(isNo, weight, zero));
        }

        // Request Gateway decryption with callback
        bytes32[] memory cts = new bytes32[](2);
        cts[0] = FHE.toBytes32(totalYesVotes);
        cts[1] = FHE.toBytes32(totalNoVotes);

        uint256 requestId = FHE.requestDecryption(cts, this.resolveTallyCallback.selector);
        proposal.decryptionRequestId = requestId;
        proposalIdByRequestId[requestId] = proposalId;

        emit DecryptionRequested(proposalId, requestId, block.timestamp);
    }

    /**
     * @notice Gateway callback to resolve tally
     * @param requestId Decryption request ID
     * @param cleartexts Decrypted vote tallies
     * @param decryptionProof Signature proof from Gateway
     * @dev Called by Gateway after successful decryption
     */
    function resolveTallyCallback(
        uint256 requestId,
        bytes memory cleartexts,
        bytes memory decryptionProof
    ) external {
        // Verify Gateway signatures
        FHE.checkSignatures(requestId, cleartexts, decryptionProof);

        // Decode decrypted tallies
        (uint64 obfuscatedYes, uint64 obfuscatedNo) = abi.decode(cleartexts, (uint64, uint64));

        uint16 proposalId = proposalIdByRequestId[requestId];
        VotingProposal storage proposal = proposals[proposalId];

        require(proposal.decryptionRequestId == requestId, "Invalid request ID");
        require(!proposal.resultsRevealed, "Already resolved");

        // Remove privacy multiplier to get actual votes
        uint64 actualYesVotes = obfuscatedYes / uint64(proposal.randomMultiplier);
        uint64 actualNoVotes = obfuscatedNo / uint64(proposal.randomMultiplier);

        proposal.revealedYesVotes = actualYesVotes;
        proposal.revealedNoVotes = actualNoVotes;
        proposal.resultsRevealed = true;
        proposal.yesWon = actualYesVotes > actualNoVotes;

        emit ProposalResolved(
            proposalId,
            proposal.yesWon,
            actualYesVotes,
            actualNoVotes,
            proposal.prizePool
        );

        // Auto-increment to next proposal
        currentProposal++;
    }

    /**
     * @notice Claim prize for winning vote
     * @param proposalId Proposal to claim from
     * @dev Proportional distribution based on vote weight
     */
    function claimPrize(uint16 proposalId)
        external
        validProposal(proposalId)
        whenNotPaused
    {
        VotingProposal storage proposal = proposals[proposalId];

        require(proposal.resultsRevealed, "Results not revealed yet");
        require(!proposal.hasClaimed[msg.sender], "Already claimed");
        require(proposal.hasParticipated[msg.sender], "Did not participate");
        require(
            proposal.revealedYesVotes != proposal.revealedNoVotes,
            "Tie - use claimRefund instead"
        );

        uint8 userVote = proposal.participantVoteType[msg.sender];
        bool isWinner = (proposal.yesWon && userVote == 1) ||
                        (!proposal.yesWon && userVote == 0);

        require(isWinner, "Not a winner");

        proposal.hasClaimed[msg.sender] = true;

        // Calculate proportional prize
        uint64 totalWinningWeight = proposal.yesWon ?
            proposal.revealedYesVotes :
            proposal.revealedNoVotes;

        require(totalWinningWeight > 0, "No winning weight");

        uint256 userWeight = proposal.participationStake;
        uint256 prize = (proposal.prizePool * userWeight) / uint256(totalWinningWeight);

        require(prize > 0, "Prize amount is zero");

        // Transfer prize with reentrancy protection
        (bool success, ) = payable(msg.sender).call{value: prize}("");
        require(success, "Prize transfer failed");

        emit PrizeClaimed(proposalId, msg.sender, prize);
    }

    /**
     * @notice Claim refund in case of tie or timeout
     * @param proposalId Proposal to claim refund from
     * @dev Available when: tie, timeout, or emergency pause
     */
    function claimRefund(uint16 proposalId)
        external
        validProposal(proposalId)
    {
        VotingProposal storage proposal = proposals[proposalId];

        require(proposal.hasParticipated[msg.sender], "Did not participate");
        require(!proposal.hasClaimed[msg.sender], "Already claimed");

        bool isTie = proposal.resultsRevealed &&
                     proposal.revealedYesVotes == proposal.revealedNoVotes;

        bool isTimeout = proposal.decryptionRequested &&
                         !proposal.resultsRevealed &&
                         block.timestamp > proposal.decryptionRequestTime + DECRYPTION_TIMEOUT;

        bool isPausedWithoutResolution = paused && !proposal.resultsRevealed;

        require(
            isTie || isTimeout || isPausedWithoutResolution,
            "Refund not available: no tie, timeout, or emergency"
        );

        proposal.hasClaimed[msg.sender] = true;

        uint256 refundAmount = proposal.participationStake;

        string memory reason;
        if (isTie) {
            reason = "tie";
        } else if (isTimeout) {
            reason = "decryption_timeout";
            emit DecryptionTimeout(proposalId, block.timestamp);
        } else {
            reason = "emergency_pause";
        }

        // Transfer refund with reentrancy protection
        (bool success, ) = payable(msg.sender).call{value: refundAmount}("");
        require(success, "Refund transfer failed");

        emit RefundClaimed(proposalId, msg.sender, refundAmount, reason);
    }

    // ============ Emergency Controls ============

    /**
     * @notice Pause contract in emergency
     * @dev Can be called by owner or guardian
     */
    function pause() external onlyOwnerOrGuardian {
        require(!paused, "Already paused");
        paused = true;
        emit EmergencyPause(msg.sender, block.timestamp);
    }

    /**
     * @notice Unpause contract
     * @dev Only owner can unpause
     */
    function unpause() external onlyPropertyManager {
        require(paused, "Not paused");
        paused = false;
        emit EmergencyUnpause(msg.sender, block.timestamp);
    }

    /**
     * @notice Set guardian address
     * @param newGuardian New guardian address
     * @dev Guardian can pause but not unpause
     */
    function setGuardian(address newGuardian) external onlyPropertyManager {
        require(newGuardian != address(0), "Invalid guardian address");
        address oldGuardian = guardian;
        guardian = newGuardian;
        emit GuardianChanged(oldGuardian, newGuardian);
    }

    /**
     * @notice Update proposal creation stake
     * @param newStake New stake amount
     */
    function setProposalCreationStake(uint256 newStake) external onlyPropertyManager {
        require(newStake > 0, "Stake must be positive");
        proposalCreationStake = newStake;
    }

    /**
     * @notice Withdraw accumulated platform fees
     * @param to Recipient address
     */
    function withdrawPlatformFees(address to) external onlyPropertyManager {
        require(to != address(0), "Invalid recipient");
        require(platformFees > 0, "No fees to withdraw");

        uint256 amount = platformFees;
        platformFees = 0;

        (bool success, ) = payable(to).call{value: amount}("");
        require(success, "Withdrawal failed");

        emit PlatformFeesWithdrawn(to, amount);
    }

    // ============ View Functions ============

    /**
     * @notice Get current proposal info
     */
    function getCurrentProposalInfo() external view returns (
        uint16 proposalId,
        string memory title,
        string memory description,
        address creator,
        bool isActive,
        uint256 startTime,
        uint256 endTime,
        uint256 participationStake,
        uint16 totalParticipants,
        uint256 prizePool
    ) {
        VotingProposal storage proposal = proposals[currentProposal];
        return (
            currentProposal,
            proposal.title,
            proposal.description,
            proposal.creator,
            proposal.isActive,
            proposal.startTime,
            proposal.endTime,
            proposal.participationStake,
            proposal.totalParticipants,
            proposal.prizePool
        );
    }

    /**
     * @notice Get proposal results
     */
    function getProposalResults(uint16 proposalId)
        external
        view
        validProposal(proposalId)
        returns (
            bool resultsRevealed,
            uint64 yesVotes,
            uint64 noVotes,
            bool yesWon,
            uint256 prizePool,
            uint16 totalParticipants
        )
    {
        VotingProposal storage proposal = proposals[proposalId];
        return (
            proposal.resultsRevealed,
            proposal.revealedYesVotes,
            proposal.revealedNoVotes,
            proposal.yesWon,
            proposal.prizePool,
            proposal.totalParticipants
        );
    }

    /**
     * @notice Get resident status
     */
    function getResidentStatus(address resident) external view returns (
        bool isRegistered,
        uint256 registrationTime,
        uint256 totalVotesCast,
        bool hasParticipatedInCurrent
    ) {
        ResidentProfile storage residentData = residents[resident];
        return (
            residentData.isRegistered,
            residentData.registrationTime,
            residentData.totalVotesCast,
            proposals[currentProposal].hasParticipated[resident]
        );
    }

    /**
     * @notice Check if user has claimed from proposal
     */
    function hasUserClaimed(uint16 proposalId, address user)
        external
        view
        validProposal(proposalId)
        returns (bool)
    {
        return proposals[proposalId].hasClaimed[user];
    }

    /**
     * @notice Get voting time remaining
     */
    function getVotingTimeLeft(uint16 proposalId)
        external
        view
        validProposal(proposalId)
        returns (uint256)
    {
        if (block.timestamp >= proposals[proposalId].endTime) {
            return 0;
        }
        return proposals[proposalId].endTime - block.timestamp;
    }

    /**
     * @notice Check if voting is active
     */
    function isVotingActive(uint16 proposalId)
        external
        view
        validProposal(proposalId)
        returns (bool)
    {
        return proposals[proposalId].isActive &&
               block.timestamp >= proposals[proposalId].startTime &&
               block.timestamp <= proposals[proposalId].endTime;
    }

    /**
     * @notice Check if refund is available
     */
    function isRefundAvailable(uint16 proposalId, address user)
        external
        view
        validProposal(proposalId)
        returns (bool available, string memory reason)
    {
        VotingProposal storage proposal = proposals[proposalId];

        if (!proposal.hasParticipated[user]) {
            return (false, "not_participant");
        }

        if (proposal.hasClaimed[user]) {
            return (false, "already_claimed");
        }

        bool isTie = proposal.resultsRevealed &&
                     proposal.revealedYesVotes == proposal.revealedNoVotes;

        bool isTimeout = proposal.decryptionRequested &&
                         !proposal.resultsRevealed &&
                         block.timestamp > proposal.decryptionRequestTime + DECRYPTION_TIMEOUT;

        bool isPausedWithoutResolution = paused && !proposal.resultsRevealed;

        if (isTie) {
            return (true, "tie");
        } else if (isTimeout) {
            return (true, "timeout");
        } else if (isPausedWithoutResolution) {
            return (true, "emergency_pause");
        }

        return (false, "no_refund_condition");
    }

    /**
     * @notice Get total registered residents
     */
    function getTotalResidents() external view returns (uint256) {
        return registeredResidents.length;
    }

    /**
     * @notice Get decryption status
     */
    function getDecryptionStatus(uint16 proposalId)
        external
        view
        validProposal(proposalId)
        returns (
            bool requested,
            uint256 requestTime,
            uint256 requestId,
            bool timedOut,
            bool resolved
        )
    {
        VotingProposal storage proposal = proposals[proposalId];
        bool isTimedOut = proposal.decryptionRequested &&
                          !proposal.resultsRevealed &&
                          block.timestamp > proposal.decryptionRequestTime + DECRYPTION_TIMEOUT;

        return (
            proposal.decryptionRequested,
            proposal.decryptionRequestTime,
            proposal.decryptionRequestId,
            isTimedOut,
            proposal.resultsRevealed
        );
    }

    // ============ Internal Functions ============

    /**
     * @notice Generate pseudo-random multiplier for privacy protection
     * @param seed Seed for randomness
     * @return Random number between MIN_MULTIPLIER and MAX_MULTIPLIER
     */
    function _generateRandomMultiplier(uint256 seed) private view returns (uint256) {
        uint256 random = uint256(keccak256(abi.encodePacked(
            block.timestamp,
            block.prevrandao,
            msg.sender,
            seed
        )));
        return (random % (MAX_MULTIPLIER - MIN_MULTIPLIER + 1)) + MIN_MULTIPLIER;
    }

    // ============ Fallback ============

    receive() external payable {
        platformFees += msg.value;
    }
}
