const { ethers } = require("hardhat");
require("dotenv").config();

async function main() {
    console.log("========================================");
    console.log("PauserSet 合约部署脚本");
    console.log("========================================\n");

    // 读取暂停器数量
    const numPausers = parseInt(process.env.NUM_PAUSERS || "0");

    if (numPausers === 0) {
        throw new Error("NUM_PAUSERS 未设置或为 0。请在 .env 文件中设置 NUM_PAUSERS");
    }

    console.log(`配置的暂停器数量: ${numPausers}`);

    // 从环境变量中读取所有暂停器地址
    const pauserAddresses = [];
    for (let i = 0; i < numPausers; i++) {
        const envKey = `PAUSER_ADDRESS_${i}`;
        const address = process.env[envKey];

        if (!address) {
            throw new Error(`缺少环境变量: ${envKey}`);
        }

        // 验证地址格式
        if (!ethers.utils.isAddress(address)) {
            throw new Error(`无效的地址格式: ${envKey} = ${address}`);
        }

        pauserAddresses.push(address);
        console.log(`  Pauser ${i}: ${address}`);
    }

    // 检查重复地址
    const uniqueAddresses = new Set(pauserAddresses);
    if (uniqueAddresses.size !== pauserAddresses.length) {
        throw new Error("检测到重复的暂停器地址，请检查配置");
    }

    console.log("\n开始部署 PauserSet 合约...");

    // 获取部署账户
    const [deployer] = await ethers.getSigners();
    console.log(`部署账户: ${deployer.address}`);

    const balance = await deployer.getBalance();
    console.log(`账户余额: ${ethers.utils.formatEther(balance)} ETH`);

    if (balance.eq(0)) {
        throw new Error("部署账户余额不足");
    }

    // 部署合约
    const PauserSet = await ethers.getContractFactory("PauserSet");
    console.log("\n正在部署合约...");

    const pauserSet = await PauserSet.deploy(pauserAddresses);
    console.log(`交易已提交: ${pauserSet.deployTransaction.hash}`);

    await pauserSet.deployed();
    console.log(`✅ PauserSet 已部署到: ${pauserSet.address}`);

    // 验证部署
    console.log("\n验证合约部署...");
    const totalPausers = await pauserSet.getPauserCount();
    console.log(`已注册的暂停器总数: ${totalPausers}`);

    // 验证每个暂停器
    console.log("\n验证暂停器地址:");
    for (let i = 0; i < numPausers; i++) {
        const addressFromContract = await pauserSet.getPauserAtIndex(i);
        const isPauser = await pauserSet.checkIsPauser(addressFromContract);

        const match = addressFromContract.toLowerCase() === pauserAddresses[i].toLowerCase();
        const status = match && isPauser ? "✅" : "❌";

        console.log(`  ${status} Pauser ${i}: ${addressFromContract} (isPauser: ${isPauser})`);

        if (!match || !isPauser) {
            throw new Error(`暂停器 ${i} 验证失败`);
        }
    }

    // 获取所有暂停器
    const allPausers = await pauserSet.getAllPausers();
    console.log("\n所有暂停器列表:");
    allPausers.forEach((addr, idx) => {
        console.log(`  ${idx}: ${addr}`);
    });

    // 保存部署信息
    const deploymentInfo = {
        network: (await ethers.provider.getNetwork()).name,
        chainId: (await ethers.provider.getNetwork()).chainId,
        contract: "PauserSet",
        address: pauserSet.address,
        deployer: deployer.address,
        deploymentHash: pauserSet.deployTransaction.hash,
        blockNumber: pauserSet.deployTransaction.blockNumber,
        timestamp: new Date().toISOString(),
        pausers: pauserAddresses,
        pauserCount: numPausers
    };

    const fs = require("fs");
    const deploymentPath = "./deployment-pauserset.json";
    fs.writeFileSync(
        deploymentPath,
        JSON.stringify(deploymentInfo, null, 2)
    );

    console.log(`\n部署信息已保存到: ${deploymentPath}`);

    // 输出环境变量建议
    console.log("\n========================================");
    console.log("请将以下地址添加到 .env 文件:");
    console.log("========================================");
    console.log(`PAUSER_SET_ADDRESS=${pauserSet.address}`);
    console.log("========================================\n");

    return pauserSet.address;
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("\n❌ 部署失败:");
        console.error(error);
        process.exit(1);
    });
