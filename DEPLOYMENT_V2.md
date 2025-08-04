# AnonymousPropertyVotingV2 部署指南

## 🚀 快速部署

本指南帮助您快速部署 `AnonymousPropertyVotingV2.sol` 到 Sepolia 测试网。

---

## 📋 前置准备

### 1. 安装依赖

```bash
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox
npm install dotenv
npm install @fhevm/solidity
```

### 2. 配置环境变量

复制环境变量模板：

```bash
cp .env.example .env
```

编辑 `.env` 文件：

```bash
# 必需配置
PRIVATE_KEY=your_private_key_here
RPC_URL=https://rpc.sepolia.org

# 可选配置（如果不使用网关，留空即可）
GATEWAY_CONTRACT_ADDRESS=
```

---

## 🎯 部署选项

### 选项 1: 独立模式部署（推荐新手）

**特点**:
- 无需部署网关
- 部署最简单
- 功能与原版完全相同 + v0.6.0 安全增强

**部署步骤**:

```bash
# 1. 确保 .env 中没有设置 GATEWAY_CONTRACT_ADDRESS 或设置为空

# 2. 运行部署脚本
npx hardhat run scripts/deployVotingV2.js --network sepolia

# 3. 等待部署完成，记录合约地址
```

**部署参数**:
```javascript
// 合约将使用 address(0) 作为网关参数
new AnonymousPropertyVotingV2(address(0))
```

---

### 选项 2: 网关集成模式（推荐生产）

**特点**:
- 额外的网关验证保护
- 支持 PauserSet 多暂停器
- 最高安全级别

**部署步骤**:

#### 步骤 1: 部署 PauserSet

```bash
# 在 .env 中配置暂停器
NUM_PAUSERS=4
PAUSER_ADDRESS_0=0x1234567890123456789012345678901234567890
PAUSER_ADDRESS_1=0x2345678901234567890123456789012345678901
PAUSER_ADDRESS_2=0x3456789012345678901234567890123456789012
PAUSER_ADDRESS_3=0x4567890123456789012345678901234567890123

# 部署 PauserSet
npx hardhat run scripts/deployPauserSet.js --network sepolia

# 记录输出的 PAUSER_SET_ADDRESS
```

#### 步骤 2: 部署 Gateway

```bash
# 在 .env 中添加
PAUSER_SET_ADDRESS=0x... (上一步的输出)

# 部署 Gateway
npx hardhat run scripts/deployGateway.js --network sepolia

# 记录输出的 GATEWAY_CONTRACT_ADDRESS
```

#### 步骤 3: 部署 VotingV2

```bash
# 在 .env 中添加
GATEWAY_CONTRACT_ADDRESS=0x... (上一步的输出)

# 部署投票合约
npx hardhat run scripts/deployVotingV2.js --network sepolia

# 完成！
```

---

## 📝 Hardhat 配置

确保您的 `hardhat.config.js` 包含以下配置：

```javascript
require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    sepolia: {
      url: process.env.RPC_URL || "https://rpc.sepolia.org",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 11155111
    }
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY
  }
};
```

---

## ✅ 部署验证

部署成功后，脚本会自动验证：

- ✅ 合约部署地址
- ✅ 财产管理员地址
- ✅ 初始提案 ID
- ✅ 网关配置
- ✅ 版本信息
- ✅ 所有核心函数

查看输出确认所有检查都通过。

---

## 🔍 Etherscan 验证

部署后验证合约源码：

### 独立模式

```bash
npx hardhat verify --network sepolia <VOTING_CONTRACT_ADDRESS> "0x0000000000000000000000000000000000000000"
```

### 网关模式

```bash
npx hardhat verify --network sepolia <VOTING_CONTRACT_ADDRESS> <GATEWAY_ADDRESS>
```

---

## 📊 合约交互示例

### 1. 注册居民

```javascript
const voting = await ethers.getContractAt(
    "AnonymousPropertyVotingV2",
    "YOUR_CONTRACT_ADDRESS"
);

// 注册单元号为 101 的居民
await voting.registerResident(101);
```

### 2. 创建提案（管理员）

```javascript
await voting.createProposal(
    "Install new security cameras",
    "Proposal to install 10 new HD security cameras in common areas",
    72  // 72 小时投票期
);
```

### 3. 投票

```javascript
// 1 = 赞成, 0 = 反对
await voting.submitVote(1, 1);  // 对提案 1 投赞成票
```

### 4. 查询结果

```javascript
const [resultsRevealed, totalVotes, yesVotes, noVotes, approved]
    = await voting.getProposalResults(1);

console.log("Results revealed:", resultsRevealed);
console.log("Total votes:", totalVotes);
console.log("Yes votes:", yesVotes);
console.log("No votes:", noVotes);
console.log("Approved:", approved);
```

---

## 🔒 安全特性说明

### fhEVM v0.6.0 自动安全增强

#### 1. 自动输入重新随机化

```solidity
// 这行代码看起来和原版一样
euint8 encryptedVote = FHE.asEuint8(voteChoice);

// 但在 v0.6.0 中：
// ✨ 输入被自动重新随机化
// ✨ 即使投相同的票，密文也完全不同
// ✨ 防止密文分析攻击
```

#### 2. sIND-CPAD 安全性

- 自动提供语义安全性
- 对开发者完全透明
- 无需修改任何代码

#### 3. 网关验证（如果启用）

```solidity
// 在请求解密前验证权限
if (gateway != address(0)) {
    require(
        IGatewayV2(gateway).isRequestDecryptAllowed(address(this)),
        "Gateway: Decryption request not allowed"
    );
}
```

---

## 🆚 版本对比

| 特性 | 原版 | V2 独立模式 | V2 网关模式 |
|------|------|------------|------------|
| FHE 加密 | ✅ | ✅ | ✅ |
| 投票隐私 | ✅ | ✅ | ✅ |
| 自动重新随机化 | ❌ | ✅ | ✅ |
| sIND-CPAD 安全 | ❌ | ✅ | ✅ |
| 网关验证 | ❌ | ❌ | ✅ |
| 部署复杂度 | 简单 | 简单 | 中等 |

---

## 📁 部署文件结构

部署后会生成以下文件：

```
AnonymousPropertyVoting-main/
├── contracts/
│   ├── AnonymousPropertyVoting.sol       # 原版
│   └── AnonymousPropertyVotingV2.sol     # ✨ V2 版本
├── scripts/
│   └── deployVotingV2.js                 # ✨ V2 部署脚本
├── .env.example                          # 环境变量模板
├── MIGRATION_GUIDE.md                    # 完整迁移指南
├── DEPLOYMENT_V2.md                      # 本文件
└── deployment-voting-v2.json             # 部署记录（自动生成）
```

---

## 🐛 常见问题

### Q1: 部署时提示 "Invalid gateway address"

**A**: 如果您使用独立模式，确保 `.env` 中没有设置 `GATEWAY_CONTRACT_ADDRESS`，或将其设置为空。

### Q2: 合约验证失败

**A**: 确保构造函数参数正确：
- 独立模式: `0x0000000000000000000000000000000000000000`
- 网关模式: 实际的网关合约地址

### Q3: 如何从独立模式切换到网关模式？

**A**: 部署后，管理员可以调用 `setGateway(gatewayAddress)` 函数启用网关验证。

### Q4: FHE 功能会有变化吗？

**A**: 不会！所有 FHE 功能与原版 100% 相同，只是增加了自动安全增强。

---

## 📞 获取帮助

如需帮助：

1. 查看 [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md) - 完整迁移指南
2. 查看 [AnonymousPropertyVoting_V2_Comparison.md](./contracts/AnonymousPropertyVoting_V2_Comparison.md) - 详细对比
3. 访问 [Zama Discord](https://discord.fhe.org)
4. 提交 [GitHub Issue](https://github.com/zama-ai/fhevm/issues)

---

## ✅ 部署检查清单

### 部署前

- [ ] 安装了所有依赖
- [ ] 配置了 `.env` 文件
- [ ] 账户有足够的 Sepolia ETH
- [ ] 确定部署模式（独立 vs 网关）

### 独立模式部署

- [ ] 运行部署脚本
- [ ] 验证合约地址
- [ ] 记录管理员地址
- [ ] 测试注册功能
- [ ] 测试投票功能

### 网关模式部署

- [ ] 配置暂停器地址
- [ ] 部署 PauserSet
- [ ] 部署 Gateway
- [ ] 部署 VotingV2
- [ ] 验证网关集成
- [ ] 测试完整流程

### 部署后

- [ ] 在 Etherscan 上验证合约
- [ ] 保存部署信息
- [ ] 更新前端配置
- [ ] 进行完整测试

---

**祝部署顺利！** 🎉
