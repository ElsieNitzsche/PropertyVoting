# 手动结束提案 - Hardhat 脚本方法

 
**问题**: 前端无法调用 `endProposal`，合约报错 "Previous proposal still active"

---

## 🔧 **使用 Hardhat 脚本手动结束提案**

如果前端的 "End Expired Proposal" 按钮无法工作，使用此方法直接通过 Hardhat 调用合约。

---

## 📋 **前提条件**

1. ✅ 已安装 Node.js 和 npm
2. ✅ 在 `D:\` 目录
3. ✅ 已配置 `.env` 文件（或 `env` 文件）
4. ✅ `.env` 文件包含私钥

---

## 🚀 **执行步骤**

### **步骤 1: 打开命令行**

```bash
按 Win + R
输入: cmd
回车
```

### **步骤 2: 进入项目目录**

```bash
cd D:\
```

### **步骤 3: 检查环境变量文件**

```bash
dir env
# 或
dir .env
```

**如果文件名是 `env`（没有点）**，需要临时重命名：

```bash
# Windows 命令
copy env .env
```

### **步骤 4: 确认 .env 内容**

`.env` 文件应该包含：

```
PRIVATE_KEY=你的私钥（64位十六进制，不要0x前缀）
SEPOLIA_RPC_URL=https://rpc.sepolia.org
ETHERSCAN_API_KEY=你的API密钥（可选）
```

**⚠️ 重要**: 私钥必须是管理员账户的私钥（`0x9b97D523dc876Cc79bF255E531508A0293De9158`）

### **步骤 5: 运行脚本**

```bash
npx hardhat run scripts/endProposal.js --network sepolia
```

---

## 📊 **预期输出**

成功执行时，应该看到：

```
=== Ending Expired Proposal ===

Using account: 0x9b97D523dc876Cc79bF255E531508A0293De9158

📋 Current Proposal Info:
  Proposal ID: 1
  Title: Install Solar
  Description: detail
  Is Active: true
  Is Voting Active: false

📊 Current Results:
  Results Revealed: false
  Total Votes: 0
  Yes Votes: 0
  No Votes: 0

⚠️  About to end proposal: Install Solar
Press Ctrl+C to cancel, or wait 5 seconds to continue...

🛑 Calling endProposal()...
Transaction hash: 0x...
Waiting for confirmation...
✅ Transaction confirmed in block: 12345678

📊 Updated Results:
  Results Revealed: true  ← 现在是 true
  Total Votes: 0
  Yes Votes: 0
  No Votes: 0
  Approved: false

✅ Proposal ended successfully!
You can now create a new proposal.
```

---

## ⚠️ **常见错误及解决**

### **错误 1: "Cannot find module 'hardhat'"**

```bash
npm install
```

### **错误 2: "Private key not found"**

检查 `.env` 文件：
```bash
# Windows
type .env
```

确保有这一行：
```
PRIVATE_KEY=你的64位私钥
```

### **错误 3: "Only property manager can end proposals"**

**原因**: 使用的账户不是管理员

**解决**:
1. 确认 `.env` 中的私钥对应管理员账户
2. 管理员账户应该是: `0x9b97D523dc876Cc79bF255E531508A0293De9158`

### **错误 4: "No active proposal to end"**

**原因**: 提案已经结束或不存在

**解决**: 运行调试脚本检查状态

### **错误 5: "insufficient funds"**

**原因**: 账户没有足够的 SepoliaETH

**解决**: 从水龙头获取测试币
- https://sepoliafaucet.com/
- https://faucet.quicknode.com/ethereum/sepolia

---

## 🔍 **验证是否成功**

### **方法 1: 使用调试脚本**

创建 `scripts/checkProposal.js`:

```javascript
const { ethers } = require("hardhat");

async function main() {
    const contract = await ethers.getContractAt(
        "AnonymousPropertyVoting",
        "0x6Ece9C29F6E47876bC3809BAC99c175273E184aB"
    );

    const [proposalId] = await contract.getCurrentProposalInfo();
    const results = await contract.getProposalResults(proposalId);

    console.log("Proposal ID:", proposalId.toString());
    console.log("Results Revealed:", results[0]);
}

main().catch(console.error);
```

运行：
```bash
npx hardhat run scripts/checkProposal.js --network sepolia
```

### **方法 2: 刷新前端**

1. 刷新浏览器: `Ctrl + F5`
2. 点击 🔍 Debug Contract State
3. 检查 `Results Revealed` 是否为 `true`

---

## 🎯 **成功后的下一步**

1. **刷新前端页面**: `Ctrl + F5`
2. **点击绿色刷新按钮**: 🔄 Refresh Status
3. **尝试创建新提案**: 应该可以成功了
4. **查看投票结果**: 在 "Voting Results" 区域

---

## 📝 **如果脚本也失败**

如果 Hardhat 脚本也报错 "Previous proposal still active"，问题可能出在合约代码本身。

**可能的原因**:

1. **合约逻辑问题**: `endProposal` 函数可能有 bug
2. **状态不一致**: 合约状态可能损坏
3. **权限问题**: 检查是否是正确的管理员账户

**解决方案**:

检查合约源代码中的 `endProposal` 函数，看看它检查了什么条件。

可能需要查看：
```solidity
function endProposal(uint16 proposalId) external {
    require(msg.sender == propertyManager, "Only property manager");
    require(currentProposalId != 0, "No active proposal");
    // 检查这里有什么其他 require 条件
    ...
}
```

---

## 🔗 **查看 Etherscan**

在 Sepolia Etherscan 上查看合约和交易：

**合约地址**:
https://sepolia.etherscan.io/address/0x6Ece9C29F6E47876bC3809BAC99c175273E184aB

**查看最近的交易**:
- 检查是否有 `endProposal` 的交易
- 检查交易是否成功
- 查看失败原因（如果有）

---

## ✅ **执行清单**

- [ ] 打开命令行
- [ ] 进入 `D:\` 目录
- [ ] 确认 `.env` 文件存在且包含私钥
- [ ] 运行 `npx hardhat run scripts/endProposal.js --network sepolia`
- [ ] 等待交易确认
- [ ] 看到 "Proposal ended successfully!"
- [ ] 刷新前端页面
- [ ] 验证可以创建新提案

---

**现在请执行步骤 1-5，然后告诉我输出结果！** 🚀
