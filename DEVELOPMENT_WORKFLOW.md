# Development Workflow Guide

## Complete TypeScript + Security + Performance Pipeline

This document describes the complete development workflow including TypeScript configuration, security checks, and performance testing.

---

## 🚀 Quick Start

```bash
# Install dependencies
npm install --legacy-peer-deps

# Run complete CI pipeline
npm run ci
```

---

## 📁 Project Structure

```
project/
├── contracts/              # Solidity smart contracts
├── scripts/               # Deployment and interaction scripts
├── test/                  # Test suites
│   ├── AnonymousPropertyVoting.test.js  # Main test suite
│   └── performance.test.js              # Performance benchmarks
├── public/                # Frontend application
├── typechain-types/       # Generated TypeScript types
├── .github/workflows/     # CI/CD workflows
│   ├── test.yml          # Main testing workflow
│   ├── security-audit.yml # Security checks
│   └── performance-test.yml # Performance testing
├── tsconfig.json          # TypeScript configuration
├── .slither.config.json   # Slither security analyzer config
├── hardhat.config.js      # Hardhat configuration
└── .env.example           # Environment variables template
```

---

## 🔧 TypeScript Configuration

### Setup

The project uses TypeScript for type-safe development:

```bash
# TypeScript is configured via tsconfig.json
# Type generation happens automatically on compile
npm run compile
```

### Type Generation

TypeChain automatically generates TypeScript types for contracts:

```typescript
// After compilation, use typed contracts
import { AnonymousPropertyVoting } from '../typechain-types';

const contract: AnonymousPropertyVoting = await ethers.getContractAt(
  "AnonymousPropertyVoting",
  contractAddress
);
```

### TypeScript Commands

```bash
# Check TypeScript types (no emit)
npm run typecheck

# Compile contracts and generate types
npm run compile
```

---

## 🔒 Security Workflow

### Security Tools

1. **Solhint** - Solidity code linting
2. **Slither** - Static analysis for vulnerabilities
3. **Mythril** - Symbolic execution for security bugs
4. **npm audit** - Dependency vulnerability scanning
5. **TruffleHog** - Secret scanning

### Running Security Checks

```bash
# Quick security check
npm run test:security

# Run Solhint
npm run lint

# Fix Solhint issues
npm run lint:fix

# Run npm audit
npm run security:audit

# Run Slither (requires Python)
npm run security:slither
```

### Security Audit Workflow

The CI/CD pipeline automatically runs security checks:

```yaml
Security Audit Pipeline:
  1. Dependency Audit (npm audit)
  2. Solidity Linting (Solhint)
  3. Static Analysis (Slither)
  4. Symbolic Execution (Mythril)
  5. Code Quality (Prettier)
  6. Secret Scanning (TruffleHog)
  7. Gas Analysis
  8. Contract Size Verification
```

### Manual Security Audit

```bash
# Install Slither (requires Python 3.6+)
pip install slither-analyzer

# Install Mythril
pip install mythril

# Run complete security audit
npm run lint
npm run security:audit
npm run security:slither

# Check for secrets
git secrets --scan
```

---

## ⚡ Performance Testing

### Performance Test Suites

1. **Gas Efficiency Benchmarks**
   - Deployment gas costs
   - Registration gas costs
   - Proposal creation gas costs
   - Voting gas costs

2. **Scalability Testing**
   - Bulk resident registration
   - Sequential proposal lifecycles
   - Storage optimization

3. **Load Testing**
   - High resident count handling
   - Concurrent query performance
   - Bulk operations efficiency

4. **Network Latency Simulation**
   - Rapid transaction submissions
   - Sequential operation performance

### Running Performance Tests

```bash
# Run all performance tests
npm run test:performance

# Run specific test suites
npm run performance:benchmark  # Gas benchmarks only
npm run performance:load       # Load testing only
npm run performance:all        # All performance tests

# Run with gas reporting
npm run test:gas
```

### Performance Metrics

Expected performance targets:

| Operation | Target Gas | Max Time |
|-----------|-----------|----------|
| Deployment | < 3,000,000 | - |
| Registration | < 500,000 | 1s |
| Proposal Creation | < 600,000 | 1s |
| Voting | < 700,000 | 1s |
| Proposal Closing | < 300,000 | 500ms |
| View Queries | - | < 50ms |

---

## 🧪 Testing Workflow

### Test Categories

1. **Unit Tests** (`test/AnonymousPropertyVoting.test.js`)
   - 53 comprehensive test cases
   - 10 test categories
   - 20/53 passing on standard Hardhat (without FHE mocking)

2. **Performance Tests** (`test/performance.test.js`)
   - Gas efficiency benchmarks
   - Scalability testing
   - Load testing
   - Network latency simulation

### Running Tests

```bash
# Run all tests
npm test

# Run with gas reporting
npm run test:gas

# Run with coverage
npm run test:coverage

# Run performance tests
npm run test:performance

# Run complete test suite
npm run test:all
```

### CI/CD Testing Pipeline

```yaml
Test Pipeline:
  1. Lint Solidity code
  2. Compile contracts
  3. Run unit tests
  4. Generate coverage report
  5. Run performance tests
  6. Generate gas reports
  7. Upload artifacts
```

---

## 🔄 Complete CI/CD Pipeline

### GitHub Actions Workflows

#### 1. Main Testing (`test.yml`)

```bash
Triggers: Push to main/develop, Pull requests
Jobs:
  - Lint check
  - Contract compilation
  - Test execution (Node 18.x, 20.x)
  - Coverage report generation
  - Codecov upload
```

#### 2. Security Audit (`security-audit.yml`)

```bash
Triggers: Push, Pull requests, Weekly schedule, Manual
Jobs:
  - Dependency audit
  - Solidity security analysis
  - Mythril analysis
  - Slither static analysis
  - Code quality checks
  - Gas analysis
  - Contract size verification
  - Security summary generation
```

#### 3. Performance Testing (`performance-test.yml`)

```bash
Triggers: Push, Pull requests, Daily schedule, Manual
Jobs:
  - Performance benchmarks
  - Gas benchmarks
  - Load testing
  - Scalability testing
  - Performance comparison
  - Trend analysis (main branch only)
```

---

## 📊 Reporting

### Generated Reports

All workflows generate comprehensive reports:

1. **Security Reports**
   - `npm-audit-report.json`
   - `solhint-report.txt`
   - `slither-report.json`
   - `security-report.md`
   - `SECURITY_SUMMARY.md`

2. **Performance Reports**
   - `performance-report.md`
   - `gas-benchmark.md`
   - `load-test-report.md`
   - `scalability-report.md`
   - `PERFORMANCE_SUMMARY.md`

3. **Coverage Reports**
   - `coverage/` directory
   - `coverage.json`
   - Uploaded to Codecov

### Viewing Reports

```bash
# View gas report
cat gas-report.txt

# View coverage report
npx hardhat coverage
open coverage/index.html

# View contract sizes
npm run compile
# Sizes displayed during compilation
```

---

## 🛠️ Development Commands

### Essential Commands

```bash
# Installation
npm install --legacy-peer-deps

# Compilation
npm run compile                 # Compile contracts
npm run clean                   # Clean artifacts
npm run typecheck              # Check TypeScript

# Testing
npm test                        # Unit tests
npm run test:gas               # With gas reporting
npm run test:coverage          # With coverage
npm run test:performance       # Performance tests
npm run test:security          # Security checks
npm run test:all               # All tests

# Code Quality
npm run lint                    # Lint Solidity
npm run lint:fix               # Fix linting issues
npm run format                 # Format code

# Security
npm run security:audit         # Dependency audit
npm run security:slither       # Slither analysis

# Performance
npm run performance:benchmark  # Gas benchmarks
npm run performance:load       # Load testing
npm run performance:all        # All performance tests

# Deployment
npm run deploy                 # Deploy to Sepolia
npm run verify                 # Verify on Etherscan
npm run interact               # Interact with contract
npm run simulate               # Run simulation

# CI/CD
npm run ci                     # Run complete CI pipeline
```

---

## 🌐 Environment Configuration

### Required Variables (`.env`)

```env
# Network Configuration
RPC_URL=https://rpc.sepolia.org
PRIVATE_KEY=your_private_key_here
CHAIN_ID=11155111

# Gateway & PauserSet Configuration
NUM_PAUSERS=4
PAUSER_ADDRESS_0=0x...
PAUSER_ADDRESS_1=0x...
PAUSER_ADDRESS_2=0x...
PAUSER_ADDRESS_3=0x...
GATEWAY_CONTRACT_ADDRESS=0x...

# KMS Configuration
KMS_CONNECTOR_KMS_GENERATION_CONTRACT_ADDRESS=0x...

# Verification
ETHERSCAN_API_KEY=your_api_key

# Optional
COINMARKETCAP_API_KEY=your_api_key  # For gas price in USD
```

See `.env.example` for complete configuration template.

---

## 📈 Performance Optimization

### Gas Optimization Tips

1. **Use `calldata` instead of `memory` for external functions**
2. **Minimize storage operations** (SSTORE is expensive)
3. **Use events instead of storage** when possible
4. **Batch operations** to reduce transaction count
5. **Cache storage reads** in memory variables
6. **Use smaller uint types** when possible (uint8, uint16, etc.)

### Monitoring Performance

```bash
# Run gas reporter
REPORT_GAS=true npm test

# Check contract sizes
npm run compile

# Run performance benchmarks
npm run performance:benchmark

# Generate full performance report
npm run performance:all
```

---

## 🔐 Security Best Practices

### Pre-Deployment Checklist

- [ ] All tests passing
- [ ] Security audit completed (no high/critical issues)
- [ ] Gas costs optimized
- [ ] Contract sizes within limits (< 24KB)
- [ ] Code formatted and linted
- [ ] No hardcoded secrets or private keys
- [ ] `.env` file not committed
- [ ] Dependencies audited (no high severity vulnerabilities)
- [ ] Slither analysis reviewed
- [ ] Documentation updated
- [ ] Deployment tested on testnet

### Continuous Security

```bash
# Run before every commit
npm run lint
npm run test
npm run security:audit

# Run before deployment
npm run test:all
npm run security:slither
npm run performance:all
```

---

## 🚨 Troubleshooting

### Common Issues

**Issue**: TypeScript errors after compilation
```bash
# Solution
npm run clean
npm run compile
npm run typecheck
```

**Issue**: Security tools not found
```bash
# Solution: Install Python tools
pip install slither-analyzer mythril
```

**Issue**: Performance tests timeout
```bash
# Solution: Increase timeout in test file
this.timeout(120000); // 2 minutes
```

**Issue**: Gas reporter not showing costs
```bash
# Solution: Enable gas reporter
REPORT_GAS=true npm test
```

---

## 📚 Additional Resources

- [Hardhat Documentation](https://hardhat.org/docs)
- [TypeChain Documentation](https://github.com/dethcrypto/TypeChain)
- [Slither Documentation](https://github.com/crytic/slither)
- [Solhint Rules](https://github.com/protofire/solhint/blob/master/docs/rules.md)
- [fhEVM Documentation](https://docs.zama.ai/fhevm)

---

## 📝 Version History

- **v2.0.0** - Complete TypeScript + Security + Performance pipeline
  - TypeScript configuration
  - Security audit workflows
  - Performance testing suite
  - Comprehensive CI/CD integration

---

*Last Updated: 2025-10-18*
*Maintained by: Development Team*
