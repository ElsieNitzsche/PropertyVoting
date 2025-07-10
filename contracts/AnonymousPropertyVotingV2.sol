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
 * @title AnonymousPropertyVotingV2
 * @notice 迁移到 fhEVM v0.6.0 - 完全保留原有功能，增加新的安全特性
 * @dev 主要更新:
 * 1. 集成可选的 Gateway 接口（使用新的 is... 函数）
 * 2. 自动交易输入重新随机化（透明实现，无需代码更改）
 * 3. 保留所有原有 FHE 功能不变
 */
contract AnonymousPropertyVotingV2 is SepoliaConfig {

    // ========================================
    // 状态变量（与原合约完全相同）
    // ========================================

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

    // ========================================
    // 新增: v0.6.0 可选网关集成
    // ========================================

    // 可选的网关地址（如果设置，将使用网关验证）
    address public gateway;

    // ========================================
    // 事件（与原合约完全相同）
    // ========================================

    event ResidentRegistered(address indexed resident);
    event ProposalCreated(uint16 indexed proposalId, string title, uint256 endTime);
    event VoteSubmitted(address indexed voter, uint16 indexed proposalId);
    event ProposalEnded(uint16 indexed proposalId, uint16 yesVotes, uint16 noVotes);
    event ResultsRevealed(uint16 indexed proposalId, bool approved);

    // 新增事件
    event GatewayUpdated(address indexed oldGateway, address indexed newGateway);

    // ========================================
    // 修饰符（与原合约完全相同）
    // ========================================

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

    // ========================================
    // 构造函数
    // ========================================

    /**
     * @notice 构造函数 - 支持可选的网关地址
     * @param _gateway 网关地址（可选，传入 address(0) 则不使用网关）
     */
    constructor(address _gateway) {
        propertyManager = msg.sender;
        currentProposal = 1;
        proposalCreationTime = block.timestamp;
        gateway = _gateway;

        if (_gateway != address(0)) {
            emit GatewayUpdated(address(0), _gateway);
        }
    }

    // ========================================
    // 核心功能（与原合约完全相同 + 自动重新随机化）
    // ========================================

    /**
     * @notice 注册居民
     * @param unitNumber 单元号（1-200）
     * @dev 🔒 FHE 功能保持不变
     * @dev ✨ v0.6.0: 输入自动重新随机化，提供 sIND-CPAD 安全性
     */
    function registerResident(uint8 unitNumber) external {
        require(!residents[msg.sender].isRegistered, "Already registered");
        require(unitNumber > 0 && unitNumber <= 200, "Invalid unit number");

        // ✨ v0.6.0: FHE.asEuint8 内部自动进行输入重新随机化
        // 这提供了 sIND-CPAD 安全性，对用户完全透明
        euint8 encryptedUnit = FHE.asEuint8(unitNumber);

        residents[msg.sender] = ResidentProfile({
            isRegistered: true,
            hasVoted: false,
            registrationTime: block.timestamp,
            encryptedUnit: encryptedUnit
        });

        registeredResidents.push(msg.sender);

        // FHE 权限设置保持不变
        FHE.allowThis(encryptedUnit);
        FHE.allow(encryptedUnit, msg.sender);

        emit ResidentRegistered(msg.sender);
    }

    /**
     * @notice 创建提案
     * @param title 提案标题
     * @param description 提案描述
     * @param votingDurationHours 投票持续时间（小时）
     * @dev 功能与原合约完全相同
     */
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

    /**
     * @notice 提交投票
     * @param proposalId 提案 ID
     * @param voteChoice 投票选择（0=反对，1=赞成）
     * @dev 🔒 FHE 功能保持不变
     * @dev ✨ v0.6.0: 投票数据自动重新随机化
     */
    function submitVote(uint16 proposalId, uint8 voteChoice)
        external
        onlyRegisteredResident
        onlyDuringVotingPeriod(proposalId)
    {
        require(voteChoice == 0 || voteChoice == 1, "Vote must be 0 (No) or 1 (Yes)");
        require(!proposalVotes[proposalId][msg.sender].submitted, "Already voted on this proposal");
        require(!proposals[proposalId].hasVoted[msg.sender], "Already voted on this proposal");

        // ✨ v0.6.0: 投票加密时自动重新随机化
        // 这确保了即使多次投相同的票，密文也不同
        euint8 encryptedVote = FHE.asEuint8(voteChoice);

        proposalVotes[proposalId][msg.sender] = EncryptedVote({
            vote: encryptedVote,
            timestamp: block.timestamp,
            submitted: true
        });

        proposals[proposalId].hasVoted[msg.sender] = true;
        proposals[proposalId].voters.push(msg.sender);
        proposals[proposalId].totalVotes++;

        // FHE 权限设置保持不变
        FHE.allowThis(encryptedVote);
        FHE.allow(encryptedVote, msg.sender);

        emit VoteSubmitted(msg.sender, proposalId);
    }

    /**
     * @notice 结束提案并请求解密
     * @param proposalId 提案 ID
     * @dev ✨ v0.6.0: 如果设置了网关，使用新的 isRequestDecryptAllowed 验证
     */
    function endProposal(uint16 proposalId)
        external
        onlyPropertyManager
        onlyAfterVotingEnds(proposalId)
    {
        require(proposals[proposalId].isActive, "Proposal not active");

        // ✨ v0.6.0: 使用新的网关验证模式（如果配置了网关）
        if (gateway != address(0)) {
            require(
                IGatewayV2(gateway).isRequestDecryptAllowed(address(this)),
                "Gateway: Decryption request not allowed"
            );
        }

        VotingProposal storage proposal = proposals[proposalId];
        proposal.isActive = false;

        // 收集所有加密的投票
        bytes32[] memory cts = new bytes32[](proposal.voters.length);

        for (uint i = 0; i < proposal.voters.length; i++) {
            address voter = proposal.voters[i];
            // ✨ v0.6.0: 从状态读取的密文也会被自动重新随机化
            cts[i] = FHE.toBytes32(proposalVotes[proposalId][voter].vote);
        }

        // 请求解密（FHE 功能保持不变）
        FHE.requestDecryption(cts, this.processVoteResults.selector);
    }

    /**
     * @notice 处理解密后的投票结果
     * @param requestId 请求 ID
     * @param decryptedVotes 解密后的投票数组
     * @param signatures 签名数组
     * @dev 🔒 FHE 功能保持不变
     * @dev ✨ v0.6.0: checkSignatures 内部验证已更新，但接口保持不变
     */
    function processVoteResults(
        uint256 requestId,
        uint8[] memory decryptedVotes,
        bytes[] memory signatures
    ) external {
        // 验证签名（内部实现已更新，但接口不变）
        bytes memory decryptedData = abi.encodePacked(decryptedVotes);
        bytes memory signaturesData = abi.encode(signatures);
        FHE.checkSignatures(requestId, decryptedData, signaturesData);

        VotingProposal storage proposal = proposals[currentProposal];

        // 统计投票结果
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

    // ========================================
    // 查询函数（与原合约完全相同）
    // ========================================

    /**
     * @notice 获取当前提案信息
     * @return proposalId 提案 ID
     * @return title 标题
     * @return description 描述
     * @return isActive 是否激活
     * @return startTime 开始时间
     * @return endTime 结束时间
     * @return totalVotes 总票数
     */
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

    /**
     * @notice 获取居民状态
     * @param resident 居民地址
     * @return isRegistered 是否已注册
     * @return registrationTime 注册时间
     * @return hasVotedCurrentProposal 是否已对当前提案投票
     */
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

    /**
     * @notice 获取提案结果
     * @param proposalId 提案 ID
     * @return resultsRevealed 结果是否已公布
     * @return totalVotes 总票数
     * @return yesVotes 赞成票数
     * @return noVotes 反对票数
     * @return approved 是否通过
     */
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

    /**
     * @notice 获取总居民数
     * @return 注册居民总数
     */
    function getTotalResidents() external view returns (uint256) {
        return registeredResidents.length;
    }

    /**
     * @notice 获取剩余投票时间
     * @param proposalId 提案 ID
     * @return 剩余秒数
     */
    function getVotingTimeLeft(uint16 proposalId) external view returns (uint256) {
        if (block.timestamp >= proposals[proposalId].endTime) {
            return 0;
        }
        return proposals[proposalId].endTime - block.timestamp;
    }

    /**
     * @notice 检查投票是否激活
     * @param proposalId 提案 ID
     * @return 是否激活
     */
    function isVotingActive(uint16 proposalId) external view returns (bool) {
        return proposals[proposalId].isActive &&
               block.timestamp <= proposals[proposalId].endTime;
    }

    // ========================================
    // 新增: v0.6.0 管理功能
    // ========================================

    /**
     * @notice 更新网关地址（仅管理员）
     * @param _newGateway 新网关地址（传入 address(0) 禁用网关）
     * @dev ✨ v0.6.0: 允许管理员配置或更新网关
     */
    function setGateway(address _newGateway) external onlyPropertyManager {
        address oldGateway = gateway;
        gateway = _newGateway;
        emit GatewayUpdated(oldGateway, _newGateway);
    }

    /**
     * @notice 检查是否允许解密（使用新的网关模式）
     * @return 是否允许
     * @dev ✨ v0.6.0: 演示新的 is... 模式而非 check... 模式
     */
    function isDecryptionAllowed() external view returns (bool) {
        if (gateway == address(0)) {
            return true; // 未配置网关，默认允许
        }

        return IGatewayV2(gateway).isPublicDecryptAllowed(address(this));
    }

    /**
     * @notice 获取版本信息
     * @return version 版本号
     * @return features 特性列表
     */
    function getVersionInfo() external pure returns (
        string memory version,
        string memory features
    ) {
        return (
            "2.0.0-fhEVM-v0.6.0",
            "Auto Re-randomization | Gateway Integration | sIND-CPAD Security"
        );
    }
}
