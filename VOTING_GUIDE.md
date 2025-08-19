# Anonymous Property Voting System - 使用指南

 
**状态**: ✅ 已修复前端投票和提案功能

---

## 🔧 **最新修复**

### **已修复问题**

1. ✅ **Create Proposal 无法提交** - 已添加详细调试和错误处理
2. ✅ **Current Voting 无法投票** - 已添加状态检查和用户友好提示
3. ✅ **配置文件支持** - 现在可以通过 `public/config.js` 轻松更新配置
4. ✅ **详细日志** - 添加了完整的 console.log 调试信息

### **新增功能**

- 📝 **配置文件**: `public/config.js` - 集中管理合约地址和网络配置
- 🔍 **调试日志**: 所有关键操作都有详细的控制台输出
- 💡 **错误提示**: 更友好的用户错误信息
- ⚙️ **状态检查**: 投票前检查注册状态和提案状态

---

## 📋 **配置更新**

### **更新合约地址**

编辑 `public/config.js` 文件:

```javascript
const CONFIG = {
    // 更新合约地址（部署后）
    CONTRACT_ADDRESS: "0x你的合约地址",

    // 网络配置
    NETWORK: {
        CHAIN_ID: 11155111, // Sepolia
        CHAIN_ID_HEX: "0xaa36a7",
        NAME: "Sepolia Testnet",
        RPC_URL: "https://rpc.sepolia.org", // 可使用不同的 RPC
        EXPLORER_URL: "https://sepolia.etherscan.io"
    }
};
```

### **使用自定义 RPC**

在 `public/config.js` 中更新 `RPC_URL`:

```javascript
RPC_URL: "https://你的RPC地址.com"
```

支持的 RPC 提供商:
- Infura: `https://sepolia.infura.io/v3/YOUR_KEY`
- Alchemy: `https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY`
- QuickNode: `https://YOUR_ENDPOINT.quiknode.pro/`
- 公共 RPC: `https://rpc.sepolia.org`

---

## 🚀 **使用流程**

### **1. 连接钱包**

```
步骤：
1. 点击 "Connect MetaMask Wallet"
2. 在 MetaMask 中批准连接
3. 确认网络切换到 Sepolia Testnet
4. 查看控制台确认连接成功
```

**控制台输出**:
```
=== Configuration Loaded ===
Contract Address: 0x6Ece9C29F6E47876bC3809BAC99c175273E184aB
Network: Sepolia Testnet
Chain ID: 11155111
=== Connecting Wallet ===
Wallet Address: 0xYourAddress...
Current Network: 11155111 sepolia
Contract instance created successfully
```

---

### **2. 注册为居民**

```
步骤：
1. 在 "Resident Registration" 卡片中
2. 输入单元号 (1-200)
3. 点击 "Register as Resident"
4. 在 MetaMask 中确认交易
5. 等待交易确认
```

**要求**:
- ✅ 钱包已连接
- ✅ 在 Sepolia 网络上
- ✅ 有足够的 SepoliaETH 支付 gas
- ✅ 单元号在 1-200 范围内

**Gas 费用**: ~50,000-100,000 gas

---

### **3. 创建提案 (仅管理员)**

```
步骤：
1. 在 "Admin Functions" 卡片中
2. 输入提案标题
3. 输入提案描述
4. 选择投票持续时间（小时）
5. 点击 "Create New Proposal"
6. 查看控制台调试信息
7. 在 MetaMask 中确认交易
```

**控制台输出**:
```
=== Creating Proposal ===
Title: 社区健身设备升级
Description: 升级小区健身房设备
Duration: 72 hours
Checking for active proposals...
Submitting createProposal transaction...
Transaction hash: 0x...
```

**常见错误**:

| 错误 | 原因 | 解决方法 |
|------|------|----------|
| "Cannot create proposal: A previous proposal is still active" | 已有活动提案 | 等待当前提案结束 |
| "Only property manager can create proposals" | 不是管理员账户 | 使用部署合约的账户 |
| "Please connect your wallet first" | 钱包未连接 | 先连接钱包 |

**Gas 费用**: ~150,000-250,000 gas

---

### **4. 投票**

```
步骤：
1. 在 "Current Voting" 卡片中查看活动提案
2. 阅读提案详情
3. 点击 "YES" (赞成) 或 "NO" (反对)
4. 在确认对话框中确认投票
5. 查看控制台调试信息
6. 在 MetaMask 中确认交易
```

**控制台输出**:
```
=== Submitting Vote ===
Vote Choice: YES
Proposal ID: 1
Checking registration status...
Is Registered: true
Has Voted: false
Submitting vote transaction...
Transaction hash: 0x...
```

**投票要求**:
- ✅ 已注册为居民
- ✅ 有活动提案
- ✅ 未投过票
- ✅ 投票期限内

**常见错误**:

| 错误 | 原因 | 解决方法 |
|------|------|----------|
| "Please register as a resident first" | 未注册 | 先注册为居民 |
| "You have already voted on this proposal" | 已投票 | 每个提案只能投一次票 |
| "No active proposal to vote on" | 无活动提案 | 等待管理员创建提案 |
| "Voting Period Ended" | 投票已结束 | 无法对已结束的提案投票 |

**Gas 费用**: ~100,000-200,000 gas (使用加密投票)

---

## 🔍 **调试指南**

### **打开浏览器控制台**

**Chrome/Edge**:
- Windows: `F12` 或 `Ctrl + Shift + I`
- Mac: `Cmd + Option + I`

**Firefox**:
- Windows: `F12` 或 `Ctrl + Shift + K`
- Mac: `Cmd + Option + K`

### **查看调试信息**

控制台会显示:
1. ✅ 配置加载信息
2. ✅ 钱包连接状态
3. ✅ 网络信息
4. ✅ 合约地址
5. ✅ 交易哈希
6. ✅ 所有操作状态

---

## ⚠️ **常见问题排查**

### **问题 1: Create Proposal 按钮点击无反应**

**检查清单**:
1. 打开控制台查看错误
2. 确认钱包已连接
3. 确认是管理员账户（部署合约的账户）
4. 确认没有活动提案
5. 确认在 Sepolia 网络上

**调试步骤**:
```javascript
// 控制台输入以下命令检查
console.log('Contract:', contract);
console.log('User Address:', userAddress);
console.log('Is Correct Network:', isCorrectNetwork);
console.log('Current Proposal ID:', currentProposalId);
```

---

### **问题 2: 无法投票**

**检查清单**:
1. 确认已注册为居民
2. 确认有活动提案
3. 确认未投过票
4. 确认投票期限内
5. 打开控制台查看详细错误

**调试步骤**:
```javascript
// 控制台输入
console.log('Current Proposal ID:', currentProposalId);
// 检查居民状态
contract.getResidentStatus(userAddress).then(console.log);
// 检查提案信息
contract.getCurrentProposalInfo().then(console.log);
```

---

### **问题 3: 钱包连接失败**

**检查清单**:
1. 确认已安装 MetaMask 扩展程序
2. 确认 MetaMask 已解锁
3. 打开控制台查看详细错误信息
4. 检查是否有弹窗请求连接（可能被浏览器拦截）


**常见错误代码**:

| 错误代码 | 含义 | 解决方法 |
|---------|------|---------|
| 4001 | 用户拒绝连接 | 点击 MetaMask 中的"连接"按钮 |
| -32002 | 请求已挂起 | 检查 MetaMask 是否有待处理的连接请求 |
| undefined ethereum | MetaMask 未安装 | 安装 MetaMask 扩展程序 |

**控制台调试信息**:
```
=== Connect Wallet Function Called ===
✓ MetaMask detected
✓ CONFIG object loaded
✓ Ethers.js library loaded
Requesting wallet accounts...
✓ Wallet accounts received: 1 account(s)
✓ Provider created
✓ Signer obtained
✓ Wallet Address: 0x...
✓ Current Network: 11155111 sepolia
```

**如果看不到上述信息**:
1. 刷新页面重试
2. 清除浏览器缓存
3. 尝试使用无痕模式
4. 重启浏览器
5. 重新安装 MetaMask

---

### **问题 4: 网络切换失败**

**症状**: 提示"Please switch to Sepolia Testnet"

**解决方法**:
1. 自动切换失败时，手动在 MetaMask 中切换到 Sepolia
2. 如果没有 Sepolia 网络，系统会尝试自动添加
3. 如果自动添加失败，手动添加 Sepolia 网络:
   - Network Name: Sepolia Testnet
   - RPC URL: https://rpc.sepolia.org
   - Chain ID: 11155111
   - Currency Symbol: SepoliaETH
   - Block Explorer: https://sepolia.etherscan.io

---

### **问题 5: 交易失败**

**可能原因**:
1. Gas 费用不足
2. Gas limit 太低
3. 合约 require 检查失败
4. 网络拥堵

**解决方法**:
1. 增加 gas limit (在 MetaMask 中设置)
2. 增加 gas price
3. 查看错误信息找出失败原因
4. 等待网络不拥堵时重试

---

## 📊 **功能测试清单**

### **测试 Checklist**

- [ ] 连接钱包成功
- [ ] 控制台显示配置信息
- [ ] 注册为居民成功
- [ ] 查看居民状态正确
- [ ] 创建提案成功（使用管理员账户）
- [ ] 提案显示在 "Current Voting" 中
- [ ] 计时器正确显示
- [ ] 投票 YES 成功
- [ ] 投票状态更新
- [ ] 无法重复投票
- [ ] 提案结束后显示结果

---

## 💡 **最佳实践**

### **开发测试**

1. **使用测试账户**: 创建多个 MetaMask 账户测试不同角色
2. **保留控制台打开**: 随时查看调试信息
3. **小金额测试**: 使用 Sepolia 测试网，不用真实ETH
4. **逐步测试**: 先测试注册，再测试创建提案，最后测试投票

### **生产部署**

1. **更新配置**: 在 `public/config.js` 中更新合约地址
2. **测试所有功能**: 部署后完整测试所有功能
3. **文档化**: 记录合约地址和部署信息
4. **监控**: 使用 Etherscan 监控合约交互

---

## 📝 **合约函数说明**

### **View Functions (免费调用)**

```javascript
// 获取当前提案信息
await contract.getCurrentProposalInfo();
// 返回: [proposalId, title, description, isActive, startTime, endTime, totalVotes]

// 获取居民状态
await contract.getResidentStatus(address);
// 返回: [isRegistered, registrationTime, hasVoted]

// 获取提案结果
await contract.getProposalResults(proposalId);
// 返回: [resultsRevealed, totalVotes, yesVotes, noVotes, approved]

// 获取总居民数
await contract.getTotalResidents();
// 返回: BigNumber

// 获取投票剩余时间
await contract.getVotingTimeLeft(proposalId);
// 返回: 秒数 (BigNumber)

// 检查投票是否活动
await contract.isVotingActive(proposalId);
// 返回: boolean
```

### **State-Changing Functions (需要 gas)**

```javascript
// 注册居民
await contract.registerResident(unitNumber); // unitNumber: 1-200

// 创建提案
await contract.createProposal(title, description, durationHours);

// 提交投票
await contract.submitVote(proposalId, voteChoice); // voteChoice: 0=NO, 1=YES

// 结束提案
await contract.endProposal(proposalId);
```

---

## 🎯 **下一步**

1. ✅ **测试所有功能** - 使用测试账户完整测试
2. ✅ **查看控制台日志** - 确认所有操作正常
3. ✅ **报告问题** - 如有问题，提供控制台日志
4. ✅ **更新配置** - 部署到主网前更新 config.js

---

**状态**: ✅ **前端已修复并增强 - 包含完整调试支持！**

*所有投票和提案功能现在都有详细的日志和错误处理*
