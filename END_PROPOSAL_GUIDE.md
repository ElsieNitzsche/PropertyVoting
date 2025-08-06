# 结束已过期提案 - 使用指南


**状态**: ✅ 已添加 "End Expired Proposal" 功能

---

## 🎯 **您的问题**

根据调试信息:

```
Proposal ID: 1
Title: Install Solar
End Time: 2025/10/18 15:48:24
Current Time: 2025/10/20 17:29:02

Is Voting Active: false  ← 投票已过期
Is Active (from contract): true  ← 但合约仍认为活动

错误: "Previous proposal still active"
```

**问题**: 提案已过期2天，但合约未正式结束，阻止创建新提案。

---

## ✅ **解决方案**

### **步骤 1: 刷新页面**

```bash
按 Ctrl + F5 强制刷新
```

### **步骤 2: 点击 "🛑 End Expired Proposal" 按钮**

在 "Admin Functions" 卡片中，找到红色的 **"🛑 End Expired Proposal"** 按钮。

位置:
```
Admin Functions
├── Create New Proposal (黄色)
├── 🛑 End Expired Proposal (红色) ← 点击这个
└── 🔍 Debug Contract State (蓝色)
```

### **步骤 3: 确认操作**

会弹出确认对话框:

```
End expired proposal "Install Solar"?

Proposal ID: 1
This will reveal the voting results and allow creating new proposals.

[取消] [确定]
```

点击 **[确定]**

### **步骤 4: 在 MetaMask 中确认交易**

- MetaMask 会弹出交易确认窗口
- 检查交易详情
- 点击 **"确认"**

### **步骤 5: 等待交易确认**

页面会显示:
```
Transaction submitted. Waiting for confirmation...
```

等待几秒到几十秒（取决于网络拥堵情况）

### **步骤 6: 成功！**

看到成功提示:
```
✅ Proposal ended successfully! You can now create a new proposal.
```

现在可以创建新提案了！

---

## 🔍 **功能说明**

### **什么是 "End Expired Proposal"？**

当提案投票期限结束后，需要管理员手动调用 `endProposal()` 函数来:

1. **正式结束提案**: 更新合约状态
2. **揭示投票结果**: 显示最终的投票统计
3. **允许创建新提案**: 清除阻塞状态

### **谁可以使用这个功能？**

- ✅ **管理员账户** (部署合约的账户)
- ❌ 普通居民账户

**您的管理员账户**: `0x9b97D523dc876Cc79bF255E531508A0293De9158`

### **何时使用？**

使用场景:

| 情况 | Is Voting Active | 提示 | 是否可用 |
|------|------------------|------|----------|
| 投票期限未到 | `true` | 提案仍在活动中 | ⚠️ 可用但需确认 |
| 投票已过期 | `false` | 已过期，需结束 | ✅ 推荐使用 |
| 无提案 | N/A | 无提案可结束 | ❌ 不可用 |

---

## 📊 **执行后的变化**

### **执行前**:
```
Current Voting: 显示 "Voting Ended"
Create Proposal: ❌ 错误 "Previous proposal still active"
Results: 未揭示
```

### **执行后**:
```
Current Voting: 显示完整的投票结果
Create Proposal: ✅ 可以创建新提案
Results: ✅ 显示 YES/NO 投票统计
```

---

## ⚠️ **常见问题**

### **Q1: 点击按钮后没反应？**

**检查**:
1. 打开控制台 (F12) 查看错误
2. 确认已连接钱包
3. 确认是管理员账户
4. 确认在 Sepolia 网络上

### **Q2: 提示 "Only property manager can end proposals"**

**原因**: 不是管理员账户

**解决**: 切换到部署合约的账户 (`0x9b97D523dc876Cc79bF255E531508A0293De9158`)

### **Q3: 提示 "No active proposal to end"**

**原因**: 没有提案，或提案已经结束

**解决**: 使用调试按钮检查提案状态

### **Q4: Gas 费用是多少？**

**预估**: 约 100,000 - 200,000 gas

**Sepolia 测试网**: Gas 费用很低（几乎可以忽略）

---

## 🎯 **您的具体操作步骤**

根据您的调试信息，按以下步骤操作:

### **1. 刷新页面**
```
Ctrl + F5
```

### **2. 确认连接的账户**
```
应该是: 0x9b97D523dc876Cc79bF255E531508A0293De9158
```

### **3. 点击红色按钮**
```
🛑 End Expired Proposal
```

### **4. 确认操作**
```
确认结束 "Install Solar" 提案
```

### **5. MetaMask 确认**
```
检查交易，点击"确认"
```

### **6. 等待成功**
```
看到 "Proposal ended successfully!"
```

### **7. 创建新提案**
```
现在可以点击 "Create New Proposal" 了
```

---

## 📝 **控制台日志**

执行 "End Proposal" 时，控制台会显示:

```
=== Ending Expired Proposal ===
Current Proposal ID: 1
Is Active (from contract): true
Is Voting Active: false
Calling endProposal() for Proposal ID: 1
Transaction hash: 0x...
Proposal ended successfully
```

---

## ✅ **下一步**

结束提案后:

1. **查看投票结果**: 在 "Voting Results" 区域查看
2. **创建新提案**: 在 "Admin Functions" 区域创建
3. **通知居民投票**: 让居民知道新提案已创建

---

## 🚀 **立即测试**

1. **刷新**: `Ctrl + F5`
2. **点击**: 🛑 End Expired Proposal
3. **确认**: 在弹窗和 MetaMask 中确认
4. **等待**: 几秒到几十秒
5. **成功**: 看到成功提示后，尝试创建新提案

---

**现在请刷新页面并点击 "🛑 End Expired Proposal" 按钮！** 🎯
