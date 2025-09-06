# Vercel Deployment Guide - Property Voting dApp

## 当前部署状态

✅ **已部署**: https://property-voting.vercel.app/
🔄 **需要更新**: 显示原始的AnonymousPropertyVoting界面

## 问题说明

当前部署显示的可能不是原始的`AnonymousPropertyVoting-main/index.html`，需要确保部署的是正确的版本。

## 解决方案

### 1. 文件已准备好

已将原始文件复制到正确位置：
- ✅ `public/index.html` - 原始的AnonymousPropertyVoting界面
- ✅ `public/config.js` - 合约配置
- ✅ `vercel.json` - Vercel配置（已更新）

### 2. 重新部署步骤

#### 方法A: 通过Vercel Dashboard（推荐）

1. 访问 https://vercel.com/dashboard
2. 找到 `property-voting` 项目
3. 点击 **"Redeploy"** 按钮
4. 选择最新的部署
5. 点击 **"Redeploy"** 确认

#### 方法B: 通过Git推送

```bash
cd D:\

# 添加更改
git add public/index.html vercel.json
git commit -m "fix: Update to original AnonymousPropertyVoting interface"
git push origin main

# Vercel会自动检测并重新部署
```

#### 方法C: 通过Vercel CLI

```bash
# 安装Vercel CLI（如果还没有）
npm install -g vercel

# 进入项目目录
cd D:\

# 部署
vercel --prod
```

### 3. 验证部署

部署完成后，访问 https://property-voting.vercel.app/ 并检查：

✅ **应该看到**:
- 标题: "Anonymous Property Management Voting System"
- 紫色渐变背景
- 连接钱包按钮
- 注册居民表单
- 创建提案表单
- 当前提案显示区域

✅ **合约地址**:
- 应该显示: `0xD30412C56d2E50dE333512Bd91664d98475E8eFf`
- 网络: Sepolia Testnet

### 4. 当前配置

**vercel.json**:
```json
{
  "name": "anonymous-property-voting",
  "version": 2,
  "public": true,
  "cleanUrls": true,
  "trailingSlash": false
}
```

这个配置告诉Vercel：
- 从 `public/` 目录提供静态文件
- 默认提供 `index.html`

### 5. 文件结构

```
D:\/
├── public/
│   ├── index.html          ✅ 原始AnonymousPropertyVoting界面
│   └── config.js           ✅ 合约配置
└── vercel.json             ✅ Vercel配置
```

## 检查清单

在重新部署前，确认：

- [ ] `public/index.html` 包含原始界面（33KB）
- [ ] `public/config.js` 包含正确的合约地址
- [ ] `vercel.json` 配置正确
- [ ] 没有其他冲突的配置文件
- [ ] Git仓库是最新的

## 合约信息

**合约地址**: `0xD30412C56d2E50dE333512Bd91664d98475E8eFf`
**网络**: Sepolia Testnet
**浏览器**: https://sepolia.etherscan.io/address/0xD30412C56d2E50dE333512Bd91664d98475E8eFf

## 功能检查

部署后测试以下功能：

1. **连接钱包**
   - [ ] 点击"Connect MetaMask Wallet"
   - [ ] MetaMask弹出
   - [ ] 显示已连接地址

2. **注册居民**
   - [ ] 输入单元号（1-200）
   - [ ] 点击"Register as Resident"
   - [ ] 交易确认
   - [ ] 显示注册成功

3. **查看提案**
   - [ ] 显示当前活跃提案
   - [ ] 或显示"No active proposal"

4. **投票**（如果有活跃提案）
   - [ ] 选择YES或NO
   - [ ] 点击"Submit Vote"
   - [ ] 交易确认

## 常见问题

### Q: 部署后页面是空白的
**A**: 检查浏览器控制台错误，可能是：
- MetaMask未安装
- 网络连接问题
- JavaScript错误

### Q: 无法连接钱包
**A**: 确保：
- 已安装MetaMask
- MetaMask已解锁
- 切换到Sepolia网络

### Q: 合约地址不对
**A**: 检查`public/config.js`中的`CONTRACT_ADDRESS`

### Q: 显示的不是原始界面
**A**:
1. 清除浏览器缓存（Ctrl+F5）
2. 检查Vercel部署日志
3. 确认`public/index.html`是正确的文件

## 本地测试

在部署前先本地测试：

```bash
# 启动本地服务器
cd D:\
npm run dev
# 或
npx http-server public -p 1251 -c-1 --cors -o

# 访问
http://localhost:1251
```

应该看到完整的AnonymousPropertyVoting界面。

## 支持

如果部署后仍有问题：
1. 检查Vercel部署日志
2. 查看浏览器控制台
3. 验证文件内容
4. 联系Vercel支持

---

**更新时间**: 2025-10-24
**状态**: 文件已准备好，等待重新部署
