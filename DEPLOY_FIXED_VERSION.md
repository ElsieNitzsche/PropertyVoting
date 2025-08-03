# 部署修复版合约 - 快速指南

## 🎯 问题总结

当前问题：
- ✅ 已注册为居民
- ❌ 无法投票（投票期可能已结束）
- ❌ 无法结束提案（可能没有投票或 FHE 失败）
- ❌ 无法创建新提案（旧提案仍激活）

## 💡 解决方案

重新部署一个**修复版合约**，添加了 `forceCloseProposal()` 紧急关闭功能。

---

## 📦 部署步骤

### 步骤 1: 编译合约

```bash
cd D:\
npm run compile
```

### 步骤 2: 部署修复版合约

```bash
npx hardhat run scripts/deployFixed.js --network sepolia
```

**注意:** 修改 scripts/deployFixed.js 的第19行，改为：
```javascript
const Contract = await ethers.getContractFactory("AnonymousPropertyVotingV2Fixed");
```

并在第20行前添加：
```javascript
const gatewayAddress = "0x0000000000000000000000000000000000000000";
const contract = await Contract.deploy(gatewayAddress);
```

### 步骤 3: 更新前端配置

部署成功后，会显示新的合约地址，例如：
```
Contract deployed: 0xNEW_ADDRESS_HERE
```

更新 `public/config.js`：
```javascript
CONTRACT_ADDRESS: "0xNEW_ADDRESS_HERE",  // 替换为新地址
```

并添加新的 ABI 函数：
```javascript
"function forceCloseProposal(uint16 proposalId, string memory reason) external",
```

### 步骤 4: 更新前端界面

在 `public/index.html` 的 Admin Functions 卡片添加新按钮：

找到 "🛑 End Expired Proposal" 按钮后面，添加：

```html
<button id="forceCloseProposal" class="btn" style="margin-top: var(--space-3); background: linear-gradient(135deg, #f59e0b, #d97706);">🔨 Force Close Proposal</button>
```

然后在 JavaScript 部分添加函数：

```javascript
// Force close proposal function
async function forceCloseProposal() {
    if (!contract || !userAddress) {
        showToast('Please connect your wallet first', 'error');
        return;
    }

    try {
        const [proposalId, title] = await contract.getCurrentProposalInfo();
        const propId = Number(proposalId.toString());

        if (propId === 0) {
            showToast('No proposal to close', 'warning');
            return;
        }

        const reason = prompt('请输入关闭原因（可选）：', 'Emergency closure - FHE unavailable or no votes');
        if (reason === null) return; // 用户取消

        if (confirm(`确认强制关闭 Proposal ${propId}: "${title}"？\n\n原因: ${reason}`)) {
            const btn = document.getElementById('forceCloseProposal');
            btn.disabled = true;
            btn.innerHTML = 'Closing... <div class="loading"></div>';

            const tx = await contract.forceCloseProposal(propId, reason);
            showToast('Transaction submitted. Waiting for confirmation...', 'info');

            await tx.wait();
            showToast('Proposal force closed successfully!', 'success');

            await loadCurrentProposal();
        }
    } catch (error) {
        console.error('Force close failed:', error);
        showToast('Failed to force close: ' + (error.reason || error.message), 'error');
    } finally {
        const btn = document.getElementById('forceCloseProposal');
        btn.disabled = false;
        btn.innerHTML = '🔨 Force Close Proposal';
    }
}

// 添加事件监听
document.getElementById('forceCloseProposal').addEventListener('click', forceCloseProposal);
```

---

## 🚀 快速部署命令（一键）

创建一个快速部署脚本：

```bash
# 编译
npm run compile

# 部署（确保你的 .env 有正确的 PRIVATE_KEY 和 RPC_URL）
npx hardhat run scripts/deployFixed.js --network sepolia

# 等待输出新的合约地址
```

---

## 🔧 新功能说明

### forceCloseProposal()

**用途:** 紧急关闭无法正常结束的提案

**何时使用:**
- 没有投票的提案
- FHE 解密失败的提案
- Gateway 不可用的情况

**调用方法:**
```javascript
await contract.forceCloseProposal(proposalId, "原因说明");
```

**效果:**
- 将 `isActive` 设为 false
- 将 `resultsRevealed` 设为 true
- 递增 `currentProposal`
- 允许创建新提案

**限制:**
- 只有 propertyManager 可以调用
- 不会解密投票结果（直接标记为已处理）

---

## 📝 完整工作流程

###1. 部署新合约

```bash
cd D:\
npm run compile
npx hardhat run scripts/deployFixed.js --network sepolia
```

记下输出的合约地址。

### 2. 更新配置

编辑 `public/config.js`，更新合约地址。

### 3. 添加按钮（可选）

如果想要前端按钮，按上面的步骤添加。

### 4. 测试

1. 刷新浏览器 (Ctrl + F5)
2. 连接钱包
3. 检查版本：点击 Debug Contract State，应该看到版本 "2.0.1-fhEVM-v0.6.0-FIXED"
4. 使用 Force Close 关闭旧提案
5. 创建新提案

---

## 🆘 或者最简单的方法

如果你不想重新部署，我可以直接给你调用命令：

在浏览器控制台运行：

```javascript
// 先添加新的 ABI
const newABI = [...CONFIG.ABI, "function forceCloseProposal(uint16 proposalId, string memory reason) external"];
const newContract = new ethers.Contract(CONFIG.CONTRACT_ADDRESS, newABI, signer);

// 调用 force close
const tx = await newContract.forceCloseProposal(1, "Emergency closure");
await tx.wait();
```

**但这需要合约已经部署了修复版本。**

---

## 🎯 你的选择

**选项 A: 重新部署（推荐）**
- 运行部署命令
- 我帮你更新配置
- 10分钟搞定

**选项 B: 手动修复（复杂）**
- 需要手动调用合约函数
- 可能遇到其他问题

**选项 C: 放弃旧提案，手动修改前端（临时）**
- 修改前端允许创建新提案
- 但合约层面仍会阻止

**你想要哪个？我来帮你执行！**
