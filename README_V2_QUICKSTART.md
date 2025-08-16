# 🚀 AnonymousPropertyVotingV2 快速开始

## 30 秒快速部署

**最简单的部署方式 - 独立模式（推荐新手）**

```bash
# 1. 安装依赖
npm install

# 2. 配置环境变量
cp .env.example .env
# 编辑 .env，填入你的私钥：
# PRIVATE_KEY=your_private_key_here

# 3. 部署合约
npx hardhat run scripts/deployVotingV2.js --network sepolia

# 完成！记录输出的合约地址
```

---

## 📦 已准备就绪的文件

```
✅ contracts/AnonymousPropertyVotingV2.sol    - V2 合约（已复制）
✅ scripts/deployVotingV2.js                  - 部署脚本（已复制）
✅ .env.example                               - 环境变量模板（已复制）
✅ MIGRATION_GUIDE.md                         - 完整迁移指南（已复制）
✅ DEPLOYMENT_V2.md                           - 详细部署指南（已创建）
```

---

## 🎯 两种部署模式

### 模式 1: 独立模式（推荐 ⭐）

**特点**:
- ✨ 最简单，一键部署
- ✨ 所有 FHE 功能完整保留
- ✨ 自动输入重新随机化
- ✨ sIND-CPAD 安全性

**步骤**:
```bash
# 确保 .env 中 GATEWAY_CONTRACT_ADDRESS 为空或不设置
npx hardhat run scripts/deployVotingV2.js --network sepolia
```

---

### 模式 2: 网关集成模式（高级）

**特点**:
- ✨ 所有独立模式的特性
- ✨ 额外的网关验证保护
- ✨ PauserSet 多暂停器支持

**步骤**:
```bash
# 1. 部署 PauserSet
npx hardhat run scripts/deployPauserSet.js --network sepolia

# 2. 部署 Gateway
npx hardhat run scripts/deployGateway.js --network sepolia

# 3. 部署 VotingV2（设置 GATEWAY_CONTRACT_ADDRESS）
npx hardhat run scripts/deployVotingV2.js --network sepolia
```

---

## 🔒 核心保证

### ✅ FHE 功能 100% 保留

| 功能 | 状态 |
|------|------|
| `euint8` 加密 | ✅ 完全相同 |
| 居民注册加密 | ✅ 完全相同 |
| 投票加密 | ✅ 完全相同 |
| 批量解密 | ✅ 完全相同 |
| 签名验证 | ✅ 完全相同 |
| 权限管理 | ✅ 完全相同 |

### ✨ v0.6.0 新特性（自动）

- 自动输入重新随机化
- sIND-CPAD 安全性
- 防密文分析攻击

---

## 📝 .env 配置示例

### 独立模式

```bash
# 必需
PRIVATE_KEY=your_private_key_here
RPC_URL=https://rpc.sepolia.org

# 可选（留空即可）
GATEWAY_CONTRACT_ADDRESS=
```

### 网关模式

```bash
# 必需
PRIVATE_KEY=your_private_key_here
RPC_URL=https://rpc.sepolia.org

# 暂停器配置
NUM_PAUSERS=4
PAUSER_ADDRESS_0=0x...
PAUSER_ADDRESS_1=0x...
PAUSER_ADDRESS_2=0x...
PAUSER_ADDRESS_3=0x...

# 网关地址（部署后填入）
PAUSER_SET_ADDRESS=0x...
GATEWAY_CONTRACT_ADDRESS=0x...
```

---

## 💡 部署后验证

部署脚本会自动验证：

```
✅ 合约部署地址
✅ 财产管理员地址
✅ 初始提案 ID (应为 1)
✅ 网关配置
✅ 版本信息 (2.0.0-fhEVM-v0.6.0)
✅ 所有核心函数
```

---

## 📊 合约使用示例

```javascript
// 连接合约
const voting = await ethers.getContractAt(
    "AnonymousPropertyVotingV2",
    "YOUR_CONTRACT_ADDRESS"
);

// 1. 注册居民
await voting.registerResident(101);

// 2. 创建提案（管理员）
await voting.createProposal(
    "Install Security Cameras",
    "Proposal to add 10 HD cameras",
    72  // 72 小时
);

// 3. 投票 (1=赞成, 0=反对)
await voting.submitVote(1, 1);

// 4. 查询结果
const results = await voting.getProposalResults(1);
console.log("Results:", results);
```

---

## 🆚 与原版对比

| 对比项 | 原版 | V2 版本 |
|--------|------|---------|
| FHE 加密 | ✅ | ✅ 相同 |
| 投票隐私 | ✅ | ✅ 相同 |
| 业务逻辑 | ✅ | ✅ 相同 |
| 查询函数 | ✅ | ✅ 相同 |
| 自动重新随机化 | ❌ | ✨ 新增 |
| sIND-CPAD 安全 | ❌ | ✨ 新增 |
| 网关验证 | ❌ | ✨ 可选 |

---

## 📚 更多文档

- **[DEPLOYMENT_V2.md](./DEPLOYMENT_V2.md)** - 详细部署指南
- **[MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md)** - 完整迁移指南
- **[contracts/AnonymousPropertyVoting_V2_Comparison.md](./contracts/AnonymousPropertyVoting_V2_Comparison.md)** - 逐行对比

---

## ⚡ 常见问题

**Q: V2 和原版有什么区别？**
A: 所有功能完全相同，增加了 fhEVM v0.6.0 的安全增强（自动重新随机化、sIND-CPAD 安全性）

**Q: 需要修改前端代码吗？**
A: 如果使用独立模式，完全不需要！合约接口与原版 100% 相同。

**Q: 已经部署了原版，可以升级吗？**
A: 可以！部署新的 V2 合约，前端只需更新合约地址即可。

**Q: 推荐哪种模式？**
A:
- 测试/学习 → 独立模式
- 生产环境 → 网关模式（更安全）

---

## 🎉 立即开始

```bash
# 克隆或进入项目目录
cd D:\AnonymousPropertyVoting-main\AnonymousPropertyVoting-main

# 安装依赖
npm install

# 配置环境
cp .env.example .env
# 编辑 .env 填入你的 PRIVATE_KEY

# 部署！
npx hardhat run scripts/deployVotingV2.js --network sepolia
```

---

**版本**: 2.0.0-fhEVM-v0.6.0
**更新**: 2025-10-16
**状态**: ✅ 生产就绪
