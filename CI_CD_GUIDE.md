# CI/CD Pipeline Guide

## Complete Continuous Integration and Deployment

This guide explains the automated CI/CD pipeline for the Anonymous Property Voting System project.

---

## Table of Contents

- [Overview](#overview)
- [Pipeline Architecture](#pipeline-architecture)
- [Workflow Jobs](#workflow-jobs)
- [Code Quality Checks](#code-quality-checks)
- [Testing Strategy](#testing-strategy)
- [Coverage Reports](#coverage-reports)
- [Security Scanning](#security-scanning)
- [Artifacts & Reports](#artifacts--reports)
- [Triggers & Events](#triggers--events)
- [Configuration](#configuration)
- [Troubleshooting](#troubleshooting)

---

## Overview

### CI/CD Goals

The CI/CD pipeline ensures:
- ✅ Code quality and consistency
- ✅ Automated testing on multiple Node.js versions
- ✅ Comprehensive coverage analysis
- ✅ Security vulnerability detection
- ✅ Performance benchmarking
- ✅ Gas usage optimization
- ✅ Automated artifact generation

### Pipeline Files

```
.github/workflows/
├── test.yml                 # Main CI/CD pipeline
├── security-audit.yml       # Security analysis (weekly)
├── performance-test.yml     # Performance benchmarks (daily)
└── deploy.yml              # GitHub Pages deployment
```

---

## Pipeline Architecture

### Workflow Diagram

```
Trigger (Push/PR)
    │
    ├──> Job 1: Code Quality & Linting
    │       ├── Solhint (Solidity)
    │       ├── Prettier (formatting)
    │       ├── TypeScript checks
    │       └── TODO/FIXME scan
    │
    ├──> Job 2: Contract Compilation
    │       ├── Compile contracts
    │       ├── Check sizes (24KB limit)
    │       ├── Generate TypeChain types
    │       └── Cache artifacts
    │
    ├──> Job 3: Unit Tests (Matrix)
    │       ├── Node 18.x tests
    │       └── Node 20.x tests
    │
    ├──> Job 4: Coverage Analysis
    │       ├── Generate coverage
    │       ├── Upload to Codecov
    │       └── Save artifacts
    │
    ├──> Job 5: Gas Report
    │       ├── Gas usage analysis
    │       └── Cost estimation
    │
    ├──> Job 6: Performance Tests
    │       ├── Gas benchmarks
    │       ├── Load testing
    │       └── Scalability tests
    │
    ├──> Job 7: Security Checks
    │       ├── npm audit
    │       ├── Secret scanning
    │       └── Dependency checks
    │
    └──> Job 8: Build Summary
            ├── Generate summary
            └── PR comment
```

---

## Workflow Jobs

### Job 1: Code Quality & Linting

**Purpose:** Ensure code quality and consistency

**Steps:**
1. **Solhint** - Lint Solidity contracts
   ```bash
   npx solhint 'contracts/**/*.sol' -f table
   ```

2. **Prettier** - Check code formatting
   ```bash
   npx prettier --check 'contracts/**/*.sol'
   npx prettier --check 'scripts/**/*.js' 'test/**/*.js'
   ```

3. **TypeScript** - Type checking
   ```bash
   npm run typecheck
   ```

4. **TODO/FIXME Scanner** - Find pending tasks
   ```bash
   grep -r "TODO\|FIXME" contracts/ scripts/ test/
   ```

**Artifacts:** Linting reports

---

### Job 2: Contract Compilation

**Purpose:** Compile smart contracts and generate TypeChain types

**Steps:**
1. Compile contracts with Hardhat
2. Check contract sizes (24KB limit)
3. Generate TypeChain TypeScript types
4. Cache compilation artifacts

**Cache Strategy:**
- Key: `contracts-${{ runner.os }}-${{ hashFiles('contracts/**/*.sol') }}`
- Cached: `cache/`, `artifacts/`, `typechain-types/`

**Artifacts:**
- Contract artifacts
- TypeChain types

---

### Job 3: Unit Tests (Multi-version)

**Purpose:** Run tests on multiple Node.js versions

**Matrix Strategy:**
```yaml
matrix:
  node-version: [18.x, 20.x]
```

**Steps:**
1. Restore compilation cache
2. Run unit tests
3. Generate test summary

**Features:**
- Parallel execution
- Independent results
- Memory optimization (4GB heap)

**Artifacts:** Test results per Node version

---

### Job 4: Coverage Analysis

**Purpose:** Generate and track code coverage

**Steps:**
1. Generate coverage report
2. Upload to Codecov
3. Save coverage artifacts

**Codecov Configuration:**
- **Target:** 90% coverage
- **Threshold:** 2% decrease allowed
- **Files:** `coverage-final.json`, `lcov.info`

**Coverage Targets:**
- Project: 90%
- Patch: 85%
- Changes: Must improve

**Artifacts:**
- Coverage reports
- HTML coverage viewer

---

### Job 5: Gas Report

**Purpose:** Track and optimize gas usage

**Steps:**
1. Run tests with gas reporter enabled
2. Generate cost estimates
3. Display in PR summary

**Metrics Tracked:**
- Deployment costs
- Function call costs
- Transaction costs
- USD estimates (via CoinMarketCap API)

**Artifacts:** Gas usage reports

---

### Job 6: Performance Tests

**Purpose:** Benchmark contract performance

**Test Categories:**
- Gas efficiency benchmarks
- Scalability testing
- Load testing
- Network latency simulation

**Metrics:**
- Average gas per operation
- Time per operation
- Throughput under load
- Concurrent operation handling

**Artifacts:** Performance reports

---

### Job 7: Security Checks

**Purpose:** Identify security vulnerabilities

**Steps:**
1. **npm audit** - Dependency vulnerabilities
   ```bash
   npm audit --audit-level=moderate
   ```

2. **TruffleHog** - Secret scanning
   - Scans for leaked credentials
   - Checks commit history
   - Identifies sensitive data

**Security Levels:**
- Critical: Pipeline fails
- High: Warning issued
- Medium: Logged only
- Low: Informational

**Artifacts:** Security scan results

---

### Job 8: Build Summary

**Purpose:** Aggregate and report results

**Outputs:**
1. **GitHub Summary** - Markdown summary in Actions UI
2. **PR Comment** - Automated comment on pull requests

**Summary Includes:**
- ✅ Jobs completed
- 📊 Test results
- 📈 Coverage metrics
- ⛽ Gas usage
- 🔒 Security status
- 📦 Artifacts available

---

## Code Quality Checks

### Solhint Rules

Configured in `.solhint.json`:

**Error Level:**
- Compiler version (^0.8.0)
- Max line length (120 chars)
- Naming conventions
  - Contract names: CamelCase
  - Functions: mixedCase
  - Events: CamelCase
  - Variables: mixedCase

**Warning Level:**
- Function visibility
- Empty blocks
- Reason strings (max 64 chars)
- Code complexity (max 10)
- Function length (max 100 lines)
- State count (max 20)
- Unused variables
- Private variable naming (_leading)

### Prettier Configuration

Configured in `.prettierrc`:

```json
{
  "overrides": [
    {
      "files": "*.sol",
      "options": {
        "printWidth": 120,
        "tabWidth": 4
      }
    }
  ]
}
```

### TypeScript Checks

Configured in `tsconfig.json`:

- Strict mode enabled
- No implicit any
- Strict null checks
- No unused locals/parameters
- No implicit returns

---

## Testing Strategy

### Test Execution Matrix

| Node Version | OS      | Status |
|--------------|---------|--------|
| 18.x         | Ubuntu  | ✅     |
| 20.x         | Ubuntu  | ✅     |

### Test Categories

1. **Unit Tests** (53 tests)
   - Deployment & initialization
   - Registration logic
   - Proposal management
   - Voting operations
   - Results revelation
   - View functions
   - Edge cases

2. **Performance Tests** (17 benchmarks)
   - Gas efficiency
   - Scalability
   - Load testing
   - Latency simulation

3. **Integration Tests**
   - Full workflows
   - Multi-user scenarios
   - Time-based operations

### Test Artifacts

- Test results (JSON)
- Coverage reports (HTML, JSON, LCOV)
- Gas reports (TXT)
- Performance benchmarks (MD)

---

## Coverage Reports

### Codecov Integration

**Configuration:** `codecov.yml`

```yaml
coverage:
  precision: 2
  range: "70...100"
  status:
    project:
      target: 90%
      threshold: 2%
```

### Coverage Targets

| Component | Target | Current |
|-----------|--------|---------|
| Overall   | 90%    | 92%+    |
| Contracts | 90%    | 92%+    |
| Scripts   | N/A    | N/A     |

### Viewing Coverage

1. **In PR:** Codecov bot comments with coverage diff
2. **Codecov Dashboard:** https://codecov.io/gh/YOUR_ORG/YOUR_REPO
3. **Local:** Open `coverage/index.html`

---

## Security Scanning

### Tools Used

1. **npm audit**
   - Checks dependencies
   - Reports vulnerabilities
   - Suggests fixes

2. **TruffleHog**
   - Scans for secrets
   - Checks git history
   - Identifies leaked keys

3. **Solhint**
   - Security-focused rules
   - Best practice enforcement
   - Vulnerability patterns

### Security Workflow

**Weekly Schedule:**
- Dependency audit
- Slither static analysis
- Mythril symbolic execution
- Contract size verification

**On Every PR:**
- npm audit
- Secret scanning
- Code quality checks

---

## Artifacts & Reports

### Available Artifacts

All artifacts retained for 30 days:

1. **Linting Report**
   - Solhint results
   - Prettier issues
   - TypeScript errors

2. **Coverage Report**
   - HTML viewer
   - JSON data
   - LCOV info

3. **Gas Report**
   - Operation costs
   - USD estimates
   - Comparison data

4. **Performance Report**
   - Benchmark results
   - Load test data
   - Scalability metrics

5. **Contract Artifacts**
   - Compiled contracts
   - TypeChain types
   - ABI files

### Downloading Artifacts

```bash
# Via GitHub CLI
gh run download <run-id>

# Via GitHub UI
Actions > Select Run > Artifacts section
```

---

## Triggers & Events

### Automatic Triggers

**Push to branches:**
```yaml
on:
  push:
    branches: [ main, develop ]
```

**Pull requests:**
```yaml
on:
  pull_request:
    branches: [ main, develop ]
```

**Scheduled:**
- Security audit: Weekly (Mondays 9 AM UTC)
- Performance tests: Daily (2 AM UTC)

### Manual Trigger

```yaml
on:
  workflow_dispatch:
```

**Usage:**
1. Go to Actions tab
2. Select workflow
3. Click "Run workflow"
4. Choose branch
5. Click "Run workflow" button

---

## Configuration

### Required Secrets

Configure in GitHub Settings > Secrets:

```
CODECOV_TOKEN           # Codecov upload token
COINMARKETCAP_API_KEY  # For gas cost USD estimation (optional)
```

### Optional Secrets

```
ETHERSCAN_API_KEY      # For contract verification
PRIVATE_KEY            # For deployment (separate workflow)
SEPOLIA_RPC_URL        # For deployment (separate workflow)
```

### Environment Variables

Set in workflow file:

```yaml
env:
  NODE_ENV: test
  FORCE_COLOR: 1
  NODE_OPTIONS: --max_old_space_size=4096
```

---

## Troubleshooting

### Common Issues

**Issue: Tests failing on Node 18.x but not 20.x**
```
Solution: Check for Node.js version-specific dependencies
- Review package.json engines field
- Check for deprecated APIs
- Update dependencies
```

**Issue: Coverage upload fails**
```
Solution: Verify Codecov token
- Check CODECOV_TOKEN secret is set
- Ensure token hasn't expired
- Verify repository access
```

**Issue: Out of memory errors**
```
Solution: Increase heap size
env:
  NODE_OPTIONS: --max_old_space_size=8192
```

**Issue: Cache not working**
```
Solution: Clear cache or update cache key
- Delete old caches in Settings
- Update cache key pattern
- Verify file paths in cache config
```

**Issue: Solhint failures**
```
Solution: Fix linting issues or update rules
npm run lint:fix
# or update .solhint.json
```

### Debug Mode

Enable debug logging:

```yaml
steps:
  - name: Debug info
    run: |
      echo "Node version: $(node --version)"
      echo "NPM version: $(npm --version)"
      echo "Working directory: $(pwd)"
      ls -la
      env | sort
```

### Workflow Status Badge

Add to README.md:

```markdown
[![CI/CD](https://github.com/YOUR_ORG/YOUR_REPO/actions/workflows/test.yml/badge.svg)](https://github.com/YOUR_ORG/YOUR_REPO/actions/workflows/test.yml)
```

---

## Best Practices

### For Contributors

1. **Run tests locally before pushing**
   ```bash
   npm run ci
   ```

2. **Fix linting issues**
   ```bash
   npm run lint:fix
   npm run format
   ```

3. **Check coverage**
   ```bash
   npm run test:coverage
   ```

4. **Review gas costs**
   ```bash
   npm run test:gas
   ```

### For Maintainers

1. **Monitor workflow runs**
   - Check Actions tab daily
   - Review failed runs promptly
   - Update dependencies regularly

2. **Review coverage trends**
   - Ensure coverage doesn't decrease
   - Add tests for uncovered code
   - Update coverage targets as needed

3. **Optimize pipeline**
   - Use caching effectively
   - Parallelize independent jobs
   - Keep dependencies up to date

4. **Security hygiene**
   - Rotate secrets regularly
   - Review security scan results
   - Update dependencies promptly

---

## Performance Optimization

### Pipeline Speed

**Current Performance:**
- Full pipeline: ~10-15 minutes
- Parallel jobs: 8 concurrent
- Cache hit rate: ~80%

**Optimization Tips:**
1. Use artifact caching
2. Parallelize independent jobs
3. Skip unnecessary steps
4. Use matrix strategy wisely

### Cost Optimization

**GitHub Actions Minutes:**
- Public repos: Unlimited
- Private repos: 2,000 minutes/month free

**Tips to save minutes:**
1. Use `if` conditions to skip jobs
2. Set appropriate `timeout-minutes`
3. Cancel redundant runs
4. Use efficient caching

---

## Monitoring & Alerts

### GitHub Notifications

Configure in Settings > Notifications:
- Workflow run failures
- Deployment status
- Security alerts

### Status Checks

Required status checks for PR merging:
- ✅ Code Quality & Linting
- ✅ Contract Compilation
- ✅ Unit Tests (both versions)
- ✅ Coverage Analysis

---

## Resources

### Documentation

- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Codecov Documentation](https://docs.codecov.com/)
- [Solhint Rules](https://github.com/protofire/solhint/blob/master/docs/rules.md)
- [Hardhat Testing](https://hardhat.org/tutorial/testing-contracts)

### Support

- **GitHub Issues:** Bug reports and feature requests
- **GitHub Discussions:** Questions and community support
- **Documentation:** Check project docs folder

---

## Changelog

### Version 2.0.0 (2025-10-18)

**Added:**
- Complete CI/CD pipeline
- Code quality checks
- Multi-version testing
- Codecov integration
- Security scanning
- Performance benchmarking
- Automated PR comments
- Comprehensive artifacts

**Enhanced:**
- Solhint configuration
- Test coverage tracking
- Gas reporting
- Build summaries

---

*Last Updated: October 18, 2025*
*Pipeline Version: 2.0.0*
*Maintained by: Development Team*
