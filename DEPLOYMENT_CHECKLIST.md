# ✅ AnonymousPropertyVotingV2 部署检查清单

## 📋 部署前检查

### 环境准备
- [ ] 已安装 Node.js (v16+)
- [ ] 已安装 npm 或 yarn
- [ ] 已安装 Git（可选）
- [ ] 拥有 Sepolia 测试网 ETH（至少 0.1 ETH）

### 文件确认
- [ ] ✅ `contracts/AnonymousPropertyVotingV2.sol` - V2 合约
- [ ] ✅ `scripts/deployVotingV2.js` - 部署脚本
- [ ] ✅ `.env.example` - 环境变量模板
- [ ] ✅ `DEPLOYMENT_V2.md` - 详细部署指南
- [ ] ✅ `README_V2_QUICKSTART.md` - 快速开始指南

---

## 🚀 独立模式部署清单（推荐新手）

### 步骤 1: 安装依赖
```bash
npm install
```
- [ ] 运行成功，无错误

### 步骤 2: 配置环境
```bash
cp .env.example .env
```
- [ ] 已创建 `.env` 文件
- [ ] 已填入 `PRIVATE_KEY`
- [ ] 已确认 `GATEWAY_CONTRACT_ADDRESS` 为空或未设置

### 步骤 3: 部署合约
```bash
npx hardhat run scripts/deployVotingV2.js --network sepolia
```
- [ ] 部署交易已提交
- [ ] 收到合约地址
- [ ] 验证通过（所有 ✅）

### 步骤 4: 记录信息
- [ ] 已记录合约地址: `___________________________`
- [ ] 已记录部署交易哈希: `___________________________`
- [ ] 已保存 `deployment-voting-v2.json` 文件

### 步骤 5: Etherscan 验证
```bash
npx hardhat verify --network sepolia <合约地址> "0x0000000000000000000000000000000000000000"
```
- [ ] 合约已在 Etherscan 上验证

---

## 🔐 网关模式部署清单（高级用户）

### 步骤 1: 配置暂停器

编辑 `.env`:
```bash
NUM_PAUSERS=4
PAUSER_ADDRESS_0=0x...
PAUSER_ADDRESS_1=0x...
PAUSER_ADDRESS_2=0x...
PAUSER_ADDRESS_3=0x...
```
- [ ] 已配置所有暂停器地址
- [ ] 已验证地址格式正确
- [ ] 已确认无重复地址

### 步骤 2: 部署 PauserSet
```bash
npx hardhat run scripts/deployPauserSet.js --network sepolia
```
- [ ] 部署成功
- [ ] 已记录 PauserSet 地址: `___________________________`
- [ ] 验证通过（暂停器数量正确）

### 步骤 3: 配置 PauserSet 地址

在 `.env` 中添加:
```bash
PAUSER_SET_ADDRESS=0x...
```
- [ ] 已添加 PauserSet 地址

### 步骤 4: 部署 Gateway
```bash
npx hardhat run scripts/deployGateway.js --network sepolia
```
- [ ] 部署成功
- [ ] 已记录 Gateway 地址: `___________________________`
- [ ] 验证通过（PauserSet 集成正确）

### 步骤 5: 配置 Gateway 地址

在 `.env` 中添加:
```bash
GATEWAY_CONTRACT_ADDRESS=0x...
```
- [ ] 已添加 Gateway 地址

### 步骤 6: 部署 VotingV2
```bash
npx hardhat run scripts/deployVotingV2.js --network sepolia
```
- [ ] 部署成功
- [ ] 已记录 Voting 合约地址: `___________________________`
- [ ] 验证通过（网关集成正确）
- [ ] 解密权限检查通过

### 步骤 7: Etherscan 验证
```bash
npx hardhat verify --network sepolia <PauserSet地址> '["0x...","0x...","0x...","0x..."]'
npx hardhat verify --network sepolia <Gateway地址> <PauserSet地址>
npx hardhat verify --network sepolia <Voting地址> <Gateway地址>
```
- [ ] PauserSet 已验证
- [ ] Gateway 已验证
- [ ] Voting 已验证

---

## 🧪 部署后测试清单

### 基础功能测试

#### 测试 1: 查询版本信息
```javascript
const [version, features] = await voting.getVersionInfo();
```
- [ ] 版本号: `2.0.0-fhEVM-v0.6.0`
- [ ] 特性显示正确

#### 测试 2: 查询初始状态
```javascript
const currentProposal = await voting.currentProposal();
const manager = await voting.propertyManager();
```
- [ ] 当前提案 ID = 1
- [ ] 管理员地址正确

#### 测试 3: 居民注册
```javascript
await voting.registerResident(101);
const [isRegistered] = await voting.getResidentStatus(userAddress);
```
- [ ] 注册交易成功
- [ ] 状态显示已注册
- [ ] ResidentRegistered 事件触发

#### 测试 4: 创建提案（管理员账户）
```javascript
await voting.createProposal("Test Proposal", "Description", 72);
const [, title, , isActive] = await voting.getCurrentProposalInfo();
```
- [ ] 创建交易成功
- [ ] 提案显示激活
- [ ] ProposalCreated 事件触发

#### 测试 5: 提交投票
```javascript
await voting.submitVote(1, 1);  // 投赞成票
const [, , hasVoted] = await voting.getResidentStatus(userAddress);
```
- [ ] 投票交易成功
- [ ] 状态显示已投票
- [ ] VoteSubmitted 事件触发

### 网关集成测试（仅网关模式）

#### 测试 6: 网关状态查询
```javascript
const gatewayAddress = await voting.gateway();
const isAllowed = await voting.isDecryptionAllowed();
```
- [ ] 网关地址正确
- [ ] 解密权限检查成功

#### 测试 7: 暂停器功能（使用暂停器账户）
```javascript
await gateway.pause();
const [isPaused] = await gateway.getGatewayStatus();
```
- [ ] 暂停成功
- [ ] 状态显示已暂停
- [ ] GatewayPaused 事件触发

#### 测试 8: 取消暂停
```javascript
await gateway.unpause();
const [isPaused] = await gateway.getGatewayStatus();
```
- [ ] 取消暂停成功
- [ ] 状态显示运行中
- [ ] GatewayUnpaused 事件触发

---

## 📊 性能基准

记录 Gas 使用情况：

| 操作 | Gas 使用 | 交易哈希 |
|------|----------|----------|
| 部署 VotingV2 | _________ | _________ |
| 注册居民 | _________ | _________ |
| 创建提案 | _________ | _________ |
| 提交投票 | _________ | _________ |
| 结束提案 | _________ | _________ |

---

## 🔒 安全检查

### 权限验证
- [ ] 只有管理员可以创建提案
- [ ] 只有管理员可以结束提案
- [ ] 只有注册居民可以投票
- [ ] 重复投票被阻止

### FHE 验证
- [ ] 投票数据已加密
- [ ] 无法直接读取密文
- [ ] 权限设置正确
- [ ] 解密需要签名验证

### 网关验证（网关模式）
- [ ] 只有暂停器可以暂停
- [ ] 暂停时无法请求解密
- [ ] 网关地址可以更新（管理员）

---

## 📝 部署记录

### 基本信息
- **网络**: Sepolia Testnet
- **部署日期**: ___________________
- **部署模式**: [ ] 独立模式 [ ] 网关模式
- **部署者地址**: ___________________

### 合约地址
- **VotingV2 合约**: ___________________
- **Gateway 合约** (如果适用): ___________________
- **PauserSet 合约** (如果适用): ___________________

### Etherscan 链接
- VotingV2: https://sepolia.etherscan.io/address/___________________
- Gateway: https://sepolia.etherscan.io/address/___________________
- PauserSet: https://sepolia.etherscan.io/address/___________________

### 部署文件
- [ ] `deployment-voting-v2.json` 已保存
- [ ] `deployment-gateway.json` 已保存（网关模式）
- [ ] `deployment-pauserset.json` 已保存（网关模式）

---

## 🚨 故障排查

### 常见错误及解决方案

#### 错误 1: "insufficient funds"
- **原因**: 账户 ETH 不足
- **解决**: 从水龙头获取更多 Sepolia ETH

#### 错误 2: "nonce too low"
- **原因**: 交易 nonce 冲突
- **解决**: 等待几分钟后重试

#### 错误 3: "Invalid PauserSet address"
- **原因**: PauserSet 地址未设置或错误
- **解决**: 检查 `.env` 中的 `PAUSER_SET_ADDRESS`

#### 错误 4: "Gateway verification failed"
- **原因**: 网关合约未正确部署
- **解决**: 重新部署网关并验证

#### 错误 5: "Already registered"
- **原因**: 地址已经注册过
- **解决**: 使用不同的账户测试

---

## ✅ 最终确认

### 部署成功标准
- [ ] 所有合约部署成功
- [ ] Etherscan 验证通过
- [ ] 基础功能测试通过
- [ ] 事件正确触发
- [ ] Gas 使用合理

### 文档完整性
- [ ] 已保存所有合约地址
- [ ] 已保存部署交易哈希
- [ ] 已记录部署配置
- [ ] 已备份 `.env` 文件

### 后续步骤
- [ ] 更新前端配置
- [ ] 通知团队成员
- [ ] 准备用户文档
- [ ] 计划安全审计

---

## 📞 需要帮助？

遇到问题时查看：
1. **[README_V2_QUICKSTART.md](./README_V2_QUICKSTART.md)** - 快速开始
2. **[DEPLOYMENT_V2.md](./DEPLOYMENT_V2.md)** - 详细部署指南
3. **[MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md)** - 完整迁移指南
4. **[Zama Discord](https://discord.fhe.org)** - 社区支持

---

**祝部署顺利！** 🎉

**检查清单完成日期**: ___________________
**检查人**: ___________________
**签名**: ___________________
