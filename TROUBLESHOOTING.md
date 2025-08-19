# 故障排查指南 - 无法创建提案和投票

 
**问题**: 既不能创建项目，又不能投票已创建的项目

---

## 🔍 **快速诊断步骤**

### **步骤 1: 刷新页面**

```bash
按 Ctrl + F5 强制刷新页面
```

### **步骤 2: 打开浏览器控制台**

```bash
按 F12 打开开发者工具
切换到 Console (控制台) 标签
```

### **步骤 3: 点击调试按钮**

在 "Admin Functions" 卡片中，点击新增的 **🔍 Debug Contract State** 按钮

### **步骤 4: 查看控制台输出**

控制台会显示完整的合约状态信息：

```
=== 🔍 DEBUG CONTRACT STATE ===

📋 Current Proposal Info:
  Proposal ID: 1
  Title: 社区健身设备升级
  Description: 升级小区健身房设备
  Is Active (from contract): true
  Start Time: 2025/10/19 上午10:00:00
  End Time: 2025/10/22 上午10:00:00
  Total Votes: 0

⏰ Real-time Status:
  Is Voting Active: false  ← 关键信息！
  Current Time: 2025/10/20 下午3:00:00
  Time Left (seconds): 0
  Time Left (formatted): 0h 0m 0s

👤 User Status:
  Address: 0xYourAddress...
  Is Registered: true
  Registration Time: 2025/10/19 上午9:00:00
  Has Voted: false

🏘️ Community Stats:
  Total Registered Residents: 5

=== 🔍 DEBUG END ===
```

---

## 📊 **根据调试信息判断问题**

### **情况 1: Is Voting Active = false (投票已结束)**

**症状**:
- ✅ 可以看到提案信息
- ❌ Time Left = 0
- ❌ 无法投票
- ❓ 无法创建新提案

**原因**: 提案存在但已过期

**解决方法**:
1. 管理员需要先调用 `endProposal()` 结束旧提案
2. 或者等待系统自动识别（刷新页面）
3. 然后才能创建新提案

**如果是管理员账户**:
- 需要手动调用合约的 `endProposal(proposalId)` 函数
- 可以使用 Etherscan 或 Hardhat 脚本调用

---

### **情况 2: Is Voting Active = true (投票活动中)**

**症状**:
- ✅ 可以看到提案信息
- ✅ Time Left > 0
- ✅ 应该可以投票
- ❌ 无法创建新提案（符合预期）

**如果仍然无法投票，检查**:
1. **Is Registered**: 必须是 `true`
2. **Has Voted**: 必须是 `false`
3. **Time Left**: 必须 > 0

---

### **情况 3: Proposal ID = 0 (无提案)**

**症状**:
- ❌ 没有提案信息
- ✅ 应该可以创建新提案

**如果无法创建，检查**:
1. 确认是管理员账户（部署合约的账户）
2. 查看控制台是否有错误信息
3. 确认已注册为居民

---

## 🛠️ **常见问题和解决方案**

### **问题 1: "Cannot create proposal: A previous proposal is still active"**

**调试检查点**:
```
Is Voting Active: true  ← 如果是 true
Time Left: > 0         ← 投票期限未到
```

**解决**: 等待投票期限结束，或者换个账户测试

---

### **问题 2: "Voting period has ended for this proposal"**

**调试检查点**:
```
Is Voting Active: false  ← 投票已结束
Time Left: 0
```

**解决**:
1. 管理员调用 `endProposal()` 结束提案
2. 然后创建新提案

---

### **问题 3: "Please register as a resident first"**

**调试检查点**:
```
Is Registered: false  ← 未注册
```

**解决**:
1. 在 "Resident Registration" 卡片中注册
2. 输入单元号 (1-200)
3. 点击 "Register as Resident"
4. 确认 MetaMask 交易

---

### **问题 4: "You have already voted on this proposal"**

**调试检查点**:
```
Has Voted: true  ← 已投票
```

**解决**: 每个提案只能投票一次，无法重复投票

---

## 🔧 **手动结束提案 (管理员)**

如果提案已过期但无法创建新提案，管理员需要手动结束旧提案：

### **方法 1: 使用 Etherscan**

1. 访问合约地址: https://sepolia.etherscan.io/address/0x6Ece9C29F6E47876bC3809BAC99c175273E184aB
2. 点击 "Contract" 标签
3. 点击 "Write Contract"
4. 连接钱包 (Connect to Web3)
5. 找到 `endProposal` 函数
6. 输入 Proposal ID (从调试信息获取)
7. 点击 "Write" 并确认交易

### **方法 2: 使用 Hardhat 控制台**

```javascript
npx hardhat console --network sepolia

const contract = await ethers.getContractAt("AnonymousPropertyVoting", "0x6Ece9C29F6E47876bC3809BAC99c175273E184aB");
await contract.endProposal(1); // 替换 1 为实际的 Proposal ID
```

---

## 📝 **完整诊断清单**

使用 **🔍 Debug Contract State** 按钮后，检查以下信息：

- [ ] **Proposal ID** > 0 (有提案)
- [ ] **Is Voting Active** = true (投票活动中)
- [ ] **Time Left** > 0 (还有剩余时间)
- [ ] **Is Registered** = true (已注册为居民)
- [ ] **Has Voted** = false (未投过票)
- [ ] **当前账户** = 管理员账户 (如需创建提案)

---

## 🎯 **典型场景分析**

### **场景 A: 提案已过期，无法创建新提案**

```
Proposal ID: 1
Is Voting Active: false  ← 已过期
Time Left: 0
```

**问题**: 旧提案阻止创建新提案

**解决**:
1. 管理员调用 `endProposal(1)`
2. 刷新页面
3. 创建新提案

---

### **场景 B: 提案活动中，但无法投票**

```
Proposal ID: 1
Is Voting Active: true
Time Left: 72000  (20小时)
Is Registered: false  ← 问题在这里
```

**问题**: 未注册为居民

**解决**: 先注册，再投票

---

### **场景 C: 已投票，想再次投票**

```
Proposal ID: 1
Is Voting Active: true
Has Voted: true  ← 已投票
```

**问题**: 已投过票

**解决**: 无法重复投票，这是设计行为

---

## ✅ **测试后的下一步**

1. **点击调试按钮**: 🔍 Debug Contract State
2. **复制控制台输出**: 完整复制调试信息
3. **分析状态**: 根据上述场景判断问题
4. **执行解决方案**: 按照对应场景的解决方法操作

---

**如果问题仍未解决，请提供调试按钮的完整输出！** 📋
