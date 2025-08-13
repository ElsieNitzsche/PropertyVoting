# Proposal Logic Fix - 已过期提案问题修复

**日期**: 2025年10月19日
**状态**: ✅ 已修复提案状态检查逻辑

---

## 🐛 **问题描述**

用户报告了一个矛盾的问题:

1. **创建新提案时**: 提示"无法创建,因为已有活动提案"
2. **Current Voting 区域**: 显示"投票已到期"且无法投票

**根本原因**:
- `getCurrentProposalInfo()` 返回的 `isActive` 字段可能基于提案是否存在,而不是基于投票期限是否过期
- 系统没有使用 `isVotingActive()` 函数进行实时检查

---

## ✅ **修复内容**

### **1. 修复创建提案检查 (createProposal 函数)**

**之前的代码** (第1142行):
```javascript
const [, , , isActive] = await contract.getCurrentProposalInfo();
if (isActive) {
    // 阻止创建新提案
}
```

**修复后的代码**:
```javascript
// Use isVotingActive to check if voting period is truly active
const isActiveVoting = await contract.isVotingActive(currentProposalId);
console.log('Current Proposal ID:', currentProposalId, 'Is Voting Active:', isActiveVoting);
if (isActiveVoting) {
    showToast('Cannot create proposal: A previous proposal is still active...', 'error');
    return;
}
```

**改进**:
- ✓ 使用 `isVotingActive()` 进行实时检查
- ✓ 只有在投票期限未过期时才阻止创建新提案
- ✓ 添加了详细的控制台日志

---

### **2. 修复显示逻辑 (loadCurrentProposal 函数)**

**之前的代码** (第1192行):
```javascript
if (isActive && currentProposalId > 0) {
    // 显示投票界面
} else {
    // 显示"无活动投票"
}
```

**修复后的代码**:
```javascript
// Double check with isVotingActive for accurate status
let isVotingActive = false;
if (currentProposalId > 0) {
    isVotingActive = await contract.isVotingActive(currentProposalId);
    console.log('Is Voting Active (real-time check):', isVotingActive);
}

if (isVotingActive && currentProposalId > 0) {
    // 显示投票界面 (活动中)
} else if (currentProposalId > 0 && !isVotingActive) {
    // 显示已结束提案 (新增)
} else {
    // 显示"无活动投票"
}
```

**改进**:
- ✓ 添加了 `isVotingActive()` 实时状态检查
- ✓ 新增"已结束提案"显示状态
- ✓ 三种状态清晰区分:
  1. **投票活动中**: 显示投票按钮
  2. **投票已结束**: 显示已结束标志,提示可创建新提案
  3. **无提案**: 显示空状态

---

## 🎨 **新增的"已结束提案"显示**

当提案存在但投票已过期时,显示:

```html
<div class="proposal-info" style="opacity: 0.7;">
    <div style="display: flex; align-items: center; justify-content: space-between;">
        <h3>提案标题</h3>
        <span class="badge badge-error">Voting Ended</span>
    </div>
    <!-- 提案详情 -->
    <div class="timer" style="background: var(--error-soft); color: var(--error);">
        Voting Period Ended
    </div>
    <div style="text-align: center; padding: var(--space-4);">
        This proposal has ended. Admin can create a new proposal now.
    </div>
</div>
```

**特点**:
- ✓ 降低透明度 (opacity: 0.7) 表示已过期
- ✓ 红色 "Voting Ended" 徽章
- ✓ 清晰提示管理员可以创建新提案
- ✓ 显示提案详情和投票时间,供查看历史

---

## 📊 **三种提案状态对比**

| 状态 | 条件 | 显示内容 | Create Proposal | Current Voting |
|------|------|----------|----------------|----------------|
| **活动中** | `isVotingActive = true` | 投票界面 + 计时器 | ❌ 无法创建 | ✅ 可以投票 |
| **已结束** | `proposalId > 0` && `isVotingActive = false` | 已结束提案详情 | ✅ 可以创建 | ❌ 无法投票 |
| **无提案** | `proposalId = 0` | "No active voting currently" | ✅ 可以创建 | ❌ 显示空状态 |

---

## 🔍 **调试日志输出**

修复后,控制台会显示详细的状态信息:

### **加载提案时**:
```
=== Loading Proposal ===
Proposal ID: 1
Is Active (from contract): true
Is Voting Active (real-time check): false  ← 实时检查结果
```

### **创建提案时**:
```
=== Creating Proposal ===
Checking for active proposals...
Current Proposal ID: 1
Is Voting Active: false  ← 如果是 false,可以创建新提案
Submitting createProposal transaction...
```

---

## ✅ **测试步骤**

### **场景 1: 投票活动中**

1. 有一个未过期的提案
2. **Current Voting**: 显示投票界面,可以投票
3. **Create Proposal**: 提示"无法创建,提案仍活动中"
4. **控制台**: `Is Voting Active: true`

### **场景 2: 投票已过期**

1. 有一个已过期的提案
2. **Current Voting**: 显示"Voting Ended"标记,提示可创建新提案
3. **Create Proposal**: 可以成功创建新提案
4. **控制台**: `Is Voting Active: false`

### **场景 3: 无提案**

1. 没有任何提案
2. **Current Voting**: 显示"No active voting currently"
3. **Create Proposal**: 可以创建新提案
4. **控制台**: `Proposal ID: 0`

---

## 🎯 **预期效果**

✅ **修复后的行为**:

1. **投票已过期的提案**:
   - Current Voting 区域显示"Voting Ended"
   - 管理员**可以**创建新提案
   - 不再出现矛盾提示

2. **投票活动中的提案**:
   - Current Voting 区域显示投票按钮
   - 管理员**无法**创建新提案
   - 逻辑一致

3. **无提案时**:
   - Current Voting 区域显示空状态
   - 管理员**可以**创建新提案
   - 符合预期

---

## 📝 **代码改动总结**

### **修改文件**: `index.html`

**修改位置 1**: `createProposal()` 函数 (约第1140-1150行)
- 将 `getCurrentProposalInfo()` 的 `isActive` 检查改为 `isVotingActive()` 调用

**修改位置 2**: `loadCurrentProposal()` 函数 (约第1188-1297行)
- 添加 `isVotingActive()` 实时检查
- 新增"已结束提案"显示分支
- 添加详细的控制台日志

**总代码行数**: +60 行

---

## 🚀 **如何测试**

1. **刷新页面**: 按 `Ctrl + F5` 强制刷新
2. **连接钱包**: 确保已连接 MetaMask
3. **查看控制台**: 打开浏览器控制台 (F12)
4. **测试场景**:
   - 如果有已过期提案,应该看到"Voting Ended"
   - 尝试创建新提案,应该成功
   - 查看控制台日志,确认 `Is Voting Active: false`

---

## 🎉 **修复完成**

**状态**: ✅ **提案状态逻辑已修复!**

*现在投票期限和创建提案的逻辑完全一致,不再出现矛盾!*
