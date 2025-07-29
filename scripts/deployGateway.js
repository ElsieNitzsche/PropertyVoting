const { ethers } = require("hardhat");
require("dotenv").config();

async function main() {
    console.log("========================================");
    console.log("Gateway 合约部署脚本");
    console.log("========================================\n");

    // 读取 PauserSet 地址
    const pauserSetAddress = process.env.PAUSER_SET_ADDRESS;

    if (!pauserSetAddress) {
        throw new Error("PAUSER_SET_ADDRESS 未设置。请先部署 PauserSet 合约并设置环境变量");
    }

    // 验证地址格式
    if (!ethers.utils.isAddress(pauserSetAddress)) {
        throw new Error(`无效的 PauserSet 地址: ${pauserSetAddress}`);
    }

    console.log(`PauserSet 合约地址: ${pauserSetAddress}`);

    // 获取部署账户
    const [deployer] = await ethers.getSigners();
    console.log(`部署账户: ${deployer.address}`);

    const balance = await deployer.getBalance();
    console.log(`账户余额: ${ethers.utils.formatEther(balance)} ETH`);

    if (balance.eq(0)) {
        throw new Error("部署账户余额不足");
    }

    // 验证 PauserSet 合约
    console.log("\n验证 PauserSet 合约...");
    const pauserSetCode = await ethers.provider.getCode(pauserSetAddress);
    if (pauserSetCode === "0x" || pauserSetCode === "0x0") {
        throw new Error("PauserSet 地址上没有合约代码，请检查地址是否正确");
    }

    // 连接到 PauserSet 合约验证
    const PauserSet = await ethers.getContractFactory("PauserSet");
    const pauserSet = PauserSet.attach(pauserSetAddress);

    try {
        const pauserCount = await pauserSet.getPauserCount();
        console.log(`✅ PauserSet 验证成功，暂停器数量: ${pauserCount}`);

        const allPausers = await pauserSet.getAllPausers();
        console.log("暂停器列表:");
        allPausers.forEach((addr, idx) => {
            console.log(`  ${idx}: ${addr}`);
        });
    } catch (error) {
        throw new Error(`无法连接到 PauserSet 合约: ${error.message}`);
    }

    // 部署 Gateway 合约
    console.log("\n开始部署 Gateway 合约...");
    const Gateway = await ethers.getContractFactory("GatewayWithPauserSet");

    console.log("正在部署合约...");
    const gateway = await Gateway.deploy(pauserSetAddress);
    console.log(`交易已提交: ${gateway.deployTransaction.hash}`);

    await gateway.deployed();
    console.log(`✅ Gateway 已部署到: ${gateway.address}`);

    // 验证部署
    console.log("\n验证 Gateway 部署...");

    // 验证 PauserSet 引用
    const gatewayPauserSet = await gateway.pauserSet();
    if (gatewayPauserSet.toLowerCase() !== pauserSetAddress.toLowerCase()) {
        throw new Error("Gateway 的 PauserSet 地址不匹配");
    }
    console.log(`✅ PauserSet 引用验证成功: ${gatewayPauserSet}`);

    // 获取 PauserSet 信息
    const [totalPausers, pausers] = await gateway.getPauserSetInfo();
    console.log(`\n网关配置的暂停器数量: ${totalPausers}`);
    console.log("网关暂停器列表:");
    pausers.forEach((addr, idx) => {
        console.log(`  ${idx}: ${addr}`);
    });

    // 验证暂停器权限
    console.log("\n验证暂停器权限:");
    for (let i = 0; i < pausers.length; i++) {
        const isPauser = await gateway.isPauserAddress(pausers[i]);
        const status = isPauser ? "✅" : "❌";
        console.log(`  ${status} ${pausers[i]} - isPauser: ${isPauser}`);
    }

    // 获取网关状态
    const [isPaused, pauserCount] = await gateway.getGatewayStatus();
    console.log("\n网关当前状态:");
    console.log(`  暂停状态: ${isPaused ? "已暂停" : "运行中"}`);
    console.log(`  暂停器数量: ${pauserCount}`);

    // 保存部署信息
    const deploymentInfo = {
        network: (await ethers.provider.getNetwork()).name,
        chainId: (await ethers.provider.getNetwork()).chainId,
        contract: "GatewayWithPauserSet",
        address: gateway.address,
        pauserSetAddress: pauserSetAddress,
        deployer: deployer.address,
        deploymentHash: gateway.deployTransaction.hash,
        blockNumber: gateway.deployTransaction.blockNumber,
        timestamp: new Date().toISOString(),
        pauserCount: totalPausers.toNumber(),
        pausers: pausers,
        initialState: {
            isPaused: isPaused
        }
    };

    const fs = require("fs");
    const deploymentPath = "./deployment-gateway.json";
    fs.writeFileSync(
        deploymentPath,
        JSON.stringify(deploymentInfo, null, 2)
    );

    console.log(`\n部署信息已保存到: ${deploymentPath}`);

    // 输出环境变量建议
    console.log("\n========================================");
    console.log("请将以下地址添加到 .env 文件:");
    console.log("========================================");
    console.log(`GATEWAY_CONTRACT_ADDRESS=${gateway.address}`);
    console.log("========================================");

    // 输出合约验证命令
    console.log("\n合约验证命令 (Etherscan):");
    console.log("========================================");
    console.log(`npx hardhat verify --network ${(await ethers.provider.getNetwork()).name} ${gateway.address} ${pauserSetAddress}`);
    console.log("========================================\n");

    return gateway.address;
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("\n❌ 部署失败:");
        console.error(error);
        process.exit(1);
    });
