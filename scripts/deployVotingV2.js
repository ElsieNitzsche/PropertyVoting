const { ethers } = require("hardhat");
require("dotenv").config();

async function main() {
    console.log("========================================");
    console.log("AnonymousPropertyVotingV2 部署脚本");
    console.log("========================================\n");

    // 获取部署账户
    const [deployer] = await ethers.getSigners();
    console.log(`部署账户: ${deployer.address}`);

    const balance = await deployer.getBalance();
    console.log(`账户余额: ${ethers.utils.formatEther(balance)} ETH\n`);

    if (balance.eq(0)) {
        throw new Error("部署账户余额不足");
    }

    // 读取可选的网关地址
    const gatewayAddress = process.env.GATEWAY_CONTRACT_ADDRESS || ethers.constants.AddressZero;

    if (gatewayAddress === ethers.constants.AddressZero) {
        console.log("⚠️  未配置网关地址");
        console.log("部署模式: 无网关模式（与原版行为完全相同）\n");
    } else {
        console.log(`✅ 网关地址: ${gatewayAddress}`);
        console.log("部署模式: 网关集成模式（额外安全保护）\n");

        // 验证网关合约
        const gatewayCode = await ethers.provider.getCode(gatewayAddress);
        if (gatewayCode === "0x" || gatewayCode === "0x0") {
            throw new Error("网关地址上没有合约代码，请检查地址是否正确");
        }
        console.log("✅ 网关合约验证成功\n");
    }

    // 部署投票合约
    console.log("开始部署 AnonymousPropertyVotingV2...");
    const VotingV2 = await ethers.getContractFactory("AnonymousPropertyVotingV2");

    const voting = await VotingV2.deploy(gatewayAddress);
    console.log(`交易已提交: ${voting.deployTransaction.hash}`);

    await voting.deployed();
    console.log(`✅ AnonymousPropertyVotingV2 已部署到: ${voting.address}\n`);

    // 验证部署
    console.log("验证合约部署...");

    // 验证管理员
    const propertyManager = await voting.propertyManager();
    console.log(`✅ 财产管理员: ${propertyManager}`);

    if (propertyManager.toLowerCase() !== deployer.address.toLowerCase()) {
        throw new Error("财产管理员地址不匹配");
    }

    // 验证当前提案 ID
    const currentProposal = await voting.currentProposal();
    console.log(`✅ 当前提案 ID: ${currentProposal}`);

    if (Number(currentProposal) !== 1) {
        throw new Error("初始提案 ID 应该为 1");
    }

    // 验证网关配置
    const configuredGateway = await voting.gateway();
    console.log(`✅ 配置的网关: ${configuredGateway}`);

    if (configuredGateway.toLowerCase() !== gatewayAddress.toLowerCase()) {
        throw new Error("网关地址不匹配");
    }

    // 获取版本信息
    const [version, features] = await voting.getVersionInfo();
    console.log(`✅ 版本: ${version}`);
    console.log(`✅ 特性: ${features}\n`);

    // 测试解密权限检查（如果配置了网关）
    if (gatewayAddress !== ethers.constants.AddressZero) {
        try {
            const isAllowed = await voting.isDecryptionAllowed();
            console.log(`✅ 解密权限检查: ${isAllowed ? "允许" : "不允许"}\n`);
        } catch (error) {
            console.log(`⚠️  解密权限检查失败: ${error.message}\n`);
        }
    }

    // 验证 FHE 功能
    console.log("验证核心功能接口...");

    const functionsToCheck = [
        "registerResident",
        "createProposal",
        "submitVote",
        "endProposal",
        "processVoteResults",
        "getCurrentProposalInfo",
        "getResidentStatus",
        "getProposalResults",
        "getTotalResidents",
        "getVotingTimeLeft",
        "isVotingActive"
    ];

    for (const func of functionsToCheck) {
        const exists = typeof voting[func] === "function";
        const status = exists ? "✅" : "❌";
        console.log(`  ${status} ${func}`);

        if (!exists) {
            throw new Error(`缺少必要函数: ${func}`);
        }
    }

    console.log("\n所有核心功能验证通过！\n");

    // 保存部署信息
    const deploymentInfo = {
        network: (await ethers.provider.getNetwork()).name,
        chainId: (await ethers.provider.getNetwork()).chainId,
        contract: "AnonymousPropertyVotingV2",
        address: voting.address,
        deployer: deployer.address,
        propertyManager: propertyManager,
        gatewayAddress: configuredGateway,
        deploymentMode: gatewayAddress === ethers.constants.AddressZero ? "standalone" : "gateway-integrated",
        deploymentHash: voting.deployTransaction.hash,
        blockNumber: voting.deployTransaction.blockNumber,
        timestamp: new Date().toISOString(),
        version: version,
        features: features,
        fheFunctions: {
            registerResident: "FHE.asEuint8 with auto re-randomization",
            submitVote: "FHE.asEuint8 with auto re-randomization",
            endProposal: "FHE.requestDecryption with gateway validation",
            processVoteResults: "FHE.checkSignatures"
        }
    };

    const fs = require("fs");
    const deploymentPath = "./deployment-voting-v2.json";
    fs.writeFileSync(
        deploymentPath,
        JSON.stringify(deploymentInfo, null, 2)
    );

    console.log(`部署信息已保存到: ${deploymentPath}\n`);

    // 输出环境变量建议
    console.log("========================================");
    console.log("请将以下地址添加到 .env 文件:");
    console.log("========================================");
    console.log(`VOTING_CONTRACT_ADDRESS=${voting.address}`);
    console.log("========================================\n");

    // 输出合约验证命令
    const networkName = (await ethers.provider.getNetwork()).name;
    console.log("合约验证命令 (Etherscan):");
    console.log("========================================");
    console.log(`npx hardhat verify --network ${networkName} ${voting.address} ${gatewayAddress}`);
    console.log("========================================\n");

    // 输出使用说明
    console.log("📋 使用说明:");
    console.log("========================================");
    console.log("1. 居民注册:");
    console.log(`   voting.registerResident(unitNumber)`);
    console.log("");
    console.log("2. 创建提案 (仅管理员):");
    console.log(`   voting.createProposal(title, description, votingDurationHours)`);
    console.log("");
    console.log("3. 提交投票:");
    console.log(`   voting.submitVote(proposalId, voteChoice) // 0=反对, 1=赞成`);
    console.log("");
    console.log("4. 结束提案 (仅管理员):");
    console.log(`   voting.endProposal(proposalId)`);
    console.log("");
    console.log("5. 查询结果:");
    console.log(`   voting.getProposalResults(proposalId)`);
    console.log("========================================\n");

    // 输出安全特性说明
    console.log("🔒 安全特性 (fhEVM v0.6.0):");
    console.log("========================================");
    console.log("✨ 自动输入重新随机化");
    console.log("   - 所有 FHE 操作前自动执行");
    console.log("   - 对用户完全透明");
    console.log("");
    console.log("✨ sIND-CPAD 安全性");
    console.log("   - 防止密文分析攻击");
    console.log("   - 自动提供保护");
    console.log("");
    if (gatewayAddress !== ethers.constants.AddressZero) {
        console.log("✨ 网关验证保护");
        console.log("   - 解密请求需网关批准");
        console.log("   - 使用新的 is... 验证模式");
        console.log("");
    }
    console.log("✅ 所有原有 FHE 功能保持不变");
    console.log("========================================\n");

    console.log("🎉 部署成功！\n");

    return voting.address;
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("\n❌ 部署失败:");
        console.error(error);
        process.exit(1);
    });
