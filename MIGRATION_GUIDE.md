# fhEVM v0.6.0 迁移指南

## 概述

本文档提供了从旧版本 fhEVM 迁移到 v0.6.0 的完整指南，包括所有重大变更和实施步骤。

---

## 🔄 主要更新内容

### 1. PauserSet 不可变合约

#### 变更说明
主机和网关合约现在可以通过合约中添加的**任何地址**暂停，而不是单一暂停器地址。

#### 新环境变量

**对于网关合约：**

```bash
# 暂停器地址数量
# 应设置为 n_kms + n_copro
# n_kms = 已注册的 KMS 节点数量
# n_copro = 已注册的协处理器数量
NUM_PAUSERS=4

# 暂停器地址 (索引从 0 到 N)
PAUSER_ADDRESS_0=0x1234567890123456789012345678901234567890
PAUSER_ADDRESS_1=0x2345678901234567890123456789012345678901
PAUSER_ADDRESS_2=0x3456789012345678901234567890123456789012
PAUSER_ADDRESS_3=0x4567890123456789012345678901234567890123
```

**对于主合约：**

```bash
# 主合约暂停器数量
HOST_NUM_PAUSERS=4

# 主合约暂停器地址
HOST_PAUSER_ADDRESS_0=0x...
HOST_PAUSER_ADDRESS_1=0x...
HOST_PAUSER_ADDRESS_2=0x...
HOST_PAUSER_ADDRESS_3=0x...
```

#### 过时的环境变量

以下环境变量**不再使用**：

❌ `PAUSER_ADDRESS` (单一暂停器地址)

#### 迁移步骤

**步骤 1: 部署 PauserSet 合约**

```javascript
// scripts/deployPauserSet.js
const { ethers } = require("hardhat");
require("dotenv").config();

async function main() {
    const numPausers = parseInt(process.env.NUM_PAUSERS);
    const pauserAddresses = [];

    // 从环境变量中读取所有暂停器地址
    for (let i = 0; i < numPausers; i++) {
        const address = process.env[`PAUSER_ADDRESS_${i}`];
        if (!address) {
            throw new Error(`Missing PAUSER_ADDRESS_${i}`);
        }
        pauserAddresses.push(address);
    }

    console.log(`Deploying PauserSet with ${numPausers} pausers...`);
    console.log("Pauser addresses:", pauserAddresses);

    const PauserSet = await ethers.getContractFactory("PauserSet");
    const pauserSet = await PauserSet.deploy(pauserAddresses);
    await pauserSet.deployed();

    console.log(`PauserSet deployed to: ${pauserSet.address}`);

    // 验证部署
    const totalPausers = await pauserSet.getPauserCount();
    console.log(`Total pausers registered: ${totalPausers}`);

    return pauserSet.address;
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
```

**步骤 2: 更新网关合约部署**

```javascript
// scripts/deployGateway.js
const { ethers } = require("hardhat");
require("dotenv").config();

async function main() {
    // 先部署或获取 PauserSet 地址
    const pauserSetAddress = process.env.PAUSER_SET_ADDRESS;

    if (!pauserSetAddress) {
        throw new Error("PAUSER_SET_ADDRESS not set in environment");
    }

    console.log(`Deploying Gateway with PauserSet at: ${pauserSetAddress}`);

    const Gateway = await ethers.getContractFactory("GatewayWithPauserSet");
    const gateway = await Gateway.deploy(pauserSetAddress);
    await gateway.deployed();

    console.log(`Gateway deployed to: ${gateway.address}`);

    // 验证 PauserSet 集成
    const [totalPausers, pausers] = await gateway.getPauserSetInfo();
    console.log(`Gateway configured with ${totalPausers} pausers:`, pausers);

    return gateway.address;
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
```

---

### 2. KMS 连接器配置更新

#### 变更说明

加密共享和签名管理从 KMS Management 迁移到 KMS Generation。

#### 环境变量重命名

```bash
# 旧变量 (已弃用)
❌ KMS_MANAGEMENT_CONTRACT_ADDRESS

# 新变量
✅ KMS_CONNECTOR_KMS_GENERATION_CONTRACT_ADDRESS
```

#### Helm Chart 配置更新

在 `values.yaml` 文件中：

```yaml
# 旧配置 (已弃用)
# kmsManagement:
#   address: "0x..."

# 新配置
kmsGeneration:
  address: "0xYourKMSGenerationContractAddress"
```

#### 迁移步骤

**步骤 1: 更新环境变量**

```bash
# .env 文件
# 删除旧变量
# KMS_MANAGEMENT_CONTRACT_ADDRESS=0x...

# 添加新变量
KMS_CONNECTOR_KMS_GENERATION_CONTRACT_ADDRESS=0xYourNewAddress
```

**步骤 2: 更新 Helm 配置**

```bash
# 更新 values.yaml
sed -i 's/kmsManagement/kmsGeneration/g' values.yaml

# 或手动编辑 values.yaml
```

**步骤 3: 重新部署 KMS 连接器**

```bash
helm upgrade kms-connector ./kms-connector-chart \
  --set kmsGeneration.address=$KMS_CONNECTOR_KMS_GENERATION_CONTRACT_ADDRESS
```

---

### 3. 网关检查函数被取代

#### 变更说明

所有外部 `check...` 视图函数已从网关合约中删除，替换为返回布尔值的 `is...` 函数。

#### API 变更对照表

| 旧函数 (已删除) | 新函数 | 返回类型变更 |
|----------------|--------|------------|
| `checkPublicDecryptAllowed()` | `isPublicDecryptAllowed()` | `void → bool` |
| `checkRequestDecryptAllowed()` | `isRequestDecryptAllowed()` | `void → bool` |
| 其他 `check...` 函数 | 对应 `is...` 函数 | `void → bool` |

#### 旧模式 (已弃用)

```solidity
// ❌ 旧模式 - 通过 revert 来指示失败
function checkPublicDecryptAllowed(address requester) external view {
    if (paused) revert PublicDecryptNotAllowed("Gateway paused");
    if (requester == address(0)) revert PublicDecryptNotAllowed("Invalid requester");
}

// 使用方式
try gateway.checkPublicDecryptAllowed(msg.sender) {
    // 允许解密
} catch {
    // 不允许解密
}
```

#### 新模式 (推荐)

```solidity
// ✅ 新模式 - 返回布尔值
function isPublicDecryptAllowed(address requester) external view returns (bool) {
    if (paused) {
        return false;
    }
    if (requester == address(0)) {
        return false;
    }
    return true;
}

// 使用方式
if (gateway.isPublicDecryptAllowed(msg.sender)) {
    // 允许解密
} else {
    // 不允许解密
}
```

#### 迁移步骤

**步骤 1: 更新合约代码**

```solidity
// 旧代码
contract OldContract {
    IGateway gateway;

    function requestData() external {
        // ❌ 旧方式
        gateway.checkPublicDecryptAllowed(msg.sender);
        // 继续处理...
    }
}

// 新代码
contract NewContract {
    IGateway gateway;

    function requestData() external {
        // ✅ 新方式
        require(
            gateway.isPublicDecryptAllowed(msg.sender),
            "Decryption not allowed"
        );
        // 继续处理...
    }
}
```

**步骤 2: 更新前端代码**

```javascript
// 旧代码
async function checkDecryptionAllowed() {
    try {
        // ❌ 旧方式
        await gateway.checkPublicDecryptAllowed(userAddress);
        return true;
    } catch (error) {
        return false;
    }
}

// 新代码
async function checkDecryptionAllowed() {
    // ✅ 新方式
    const allowed = await gateway.isPublicDecryptAllowed(userAddress);
    return allowed;
}
```

#### 错误处理迁移

相关错误已移至不同的合约或被删除：

```solidity
// 旧位置 (Gateway 合约)
❌ error PublicDecryptNotAllowed(string reason);

// 新位置 (Decryption 合约)
✅ error DecryptionNotAllowed(string reason);
```

---

### 4. 交易输入的重新随机化

#### 变更说明

在评估 FHE 操作之前，所有交易输入（包括来自状态的输入）都会自动重新加密，提供 **sIND-CPAD 安全性**。

#### 特性

✅ **透明实现** - 对用户完全透明，无需修改代码
✅ **自动重加密** - 在 FHE 操作前自动执行
✅ **增强安全性** - 提供 sIND-CPAD 安全保证
✅ **无性能损失** - 优化实现，最小化性能影响

#### 示例

```solidity
contract SecureVoting {
    using FHE for euint8;

    mapping(address => euint8) private votes;

    function submitVote(uint8 voteChoice) external {
        // 输入自动重新随机化
        euint8 encryptedVote = FHE.asEuint8(voteChoice);

        // 所有 FHE 操作前，输入已被重新加密
        votes[msg.sender] = encryptedVote;

        // sIND-CPAD 安全性自动保证
    }

    function processVotes(address voter1, address voter2) external view returns (euint8) {
        // 从状态读取的输入也会被重新随机化
        euint8 vote1 = votes[voter1]; // 自动重新随机化
        euint8 vote2 = votes[voter2]; // 自动重新随机化

        // 安全执行 FHE 操作
        return vote1.add(vote2);
    }
}
```

#### 无需代码更改

此功能完全透明，**现有代码无需任何修改**即可获得安全增强。

---

## 📋 完整迁移检查清单

### 环境配置

- [ ] 更新 `.env` 文件，添加 `NUM_PAUSERS` 配置
- [ ] 添加所有 `PAUSER_ADDRESS_[0-N]` 变量
- [ ] 删除过时的 `PAUSER_ADDRESS` 变量
- [ ] 更新 `KMS_MANAGEMENT_CONTRACT_ADDRESS` 为 `KMS_CONNECTOR_KMS_GENERATION_CONTRACT_ADDRESS`

### 合约部署

- [ ] 部署 `PauserSet` 合约
- [ ] 验证 PauserSet 中的所有暂停器地址
- [ ] 使用 PauserSet 地址部署新的网关合约
- [ ] 使用 PauserSet 地址部署新的主合约
- [ ] 验证合约集成

### 代码更新

- [ ] 将所有 `check...` 函数调用替换为 `is...` 函数
- [ ] 更新错误处理逻辑 (从 try-catch 改为 if-else)
- [ ] 更新合约接口定义
- [ ] 更新前端代码中的网关调用
- [ ] 更新测试代码

### Helm 配置

- [ ] 更新 `values.yaml` 文件
- [ ] 将 `kmsManagement` 重命名为 `kmsGeneration`
- [ ] 重新部署 Helm chart
- [ ] 验证 KMS 连接器配置

### 测试验证

- [ ] 测试暂停/取消暂停功能
- [ ] 验证所有暂停器都可以暂停合约
- [ ] 测试解密请求流程
- [ ] 验证 `is...` 函数返回正确值
- [ ] 执行完整的端到端测试

---

## 🚀 快速部署脚本

### 完整部署流程

```bash
#!/bin/bash

# 加载环境变量
source .env

# 1. 部署 PauserSet
echo "部署 PauserSet..."
npx hardhat run scripts/deployPauserSet.js --network sepolia
PAUSER_SET_ADDRESS=$(cat deployment-pauserset.json | jq -r '.address')

# 2. 部署网关
echo "部署网关合约..."
PAUSER_SET_ADDRESS=$PAUSER_SET_ADDRESS npx hardhat run scripts/deployGateway.js --network sepolia
GATEWAY_ADDRESS=$(cat deployment-gateway.json | jq -r '.address')

# 3. 更新 Helm 配置
echo "更新 Helm 配置..."
helm upgrade kms-connector ./kms-connector-chart \
  --set kmsGeneration.address=$KMS_CONNECTOR_KMS_GENERATION_CONTRACT_ADDRESS \
  --set gateway.address=$GATEWAY_ADDRESS

# 4. 验证部署
echo "验证部署..."
npx hardhat run scripts/verifyDeployment.js --network sepolia

echo "部署完成!"
```

---

## 📚 参考资源

### 合约文件

- `contracts/PauserSet.sol` - PauserSet 不可变合约实现
- `contracts/GatewayWithPauserSet.sol` - 集成 PauserSet 的网关示例
- `.env.example` - 环境变量配置模板

### 文档链接

- [fhEVM 官方文档](https://docs.zama.ai/fhevm)
- [PauserSet 架构设计](https://docs.zama.ai/fhevm/architecture/pauser-set)
- [安全性指南](https://docs.zama.ai/fhevm/security)

---

## ⚠️ 重要注意事项

### 向后兼容性

❌ **不兼容** - 此更新包含重大变更，旧版本合约无法直接使用

### 推荐升级路径

1. **开发环境** - 先在测试网部署和测试
2. **暂存环境** - 完整端到端测试
3. **生产环境** - 谨慎迁移，准备回滚方案

### 安全建议

- 使用多重签名钱包管理暂停器地址
- 定期审计暂停器列表
- 监控所有暂停/取消暂停事件
- 实施紧急响应流程

---

## 💡 最佳实践

### PauserSet 配置

```solidity
// 建议：使用至少 3 个暂停器以提高去中心化
uint256 constant MIN_PAUSERS = 3;

// 建议：KMS 节点和协处理器分别配置
// NUM_PAUSERS = n_kms_nodes + n_coprocessors
```

### 暂停器管理

- 使用硬件钱包或多重签名
- 定期轮换暂停器地址
- 保持 KMS 节点和协处理器数量平衡
- 记录所有暂停器操作日志

---

## 🆘 故障排除

### 常见问题

**Q: 部署 PauserSet 时出错 "Duplicate pauser address"**

A: 检查环境变量中是否有重复的地址

**Q: 网关调用失败 "Function not found: checkPublicDecryptAllowed"**

A: 更新为新的 `isPublicDecryptAllowed` 函数

**Q: 如何验证 PauserSet 部署正确？**

A: 调用 `getPauserCount()` 和 `getAllPausers()` 验证

---

## 📞 支持

如需帮助，请访问：

- [Zama Discord](https://discord.fhe.org)
- [GitHub Issues](https://github.com/zama-ai/fhevm/issues)
- [开发者论坛](https://community.zama.ai)

---

**更新日期**: 2025-10-15
**版本**: fhEVM v0.6.0
**状态**: 稳定版
