# Complete Toolchain Setup Guide

**Version**: 2.0.0
**Status**: Production Ready

---

## 🎯 Quick Setup

### One-Command Installation

```bash
# Install all dependencies
npm install --legacy-peer-deps

# Initialize Husky hooks
npm run prepare

# Compile contracts
npm run compile

# Run tests to verify setup
npm test
```

**Setup Time**: ~5 minutes

---

## 📦 Dependency Installation

### Step 1: Install Node.js Dependencies

```bash
# Clean install (recommended)
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps

# Or if you have existing node_modules
npm install --legacy-peer-deps
```

**New Dependencies Added**:

#### ESLint Ecosystem
```json
{
  "eslint": "^8.56.0",
  "@typescript-eslint/eslint-plugin": "^6.15.0",
  "@typescript-eslint/parser": "^6.15.0",
  "eslint-config-prettier": "^9.1.0",
  "eslint-plugin-security": "^2.1.0",
  "eslint-plugin-no-secrets": "^0.8.9"
}
```

#### Build & Optimization
```json
{
  "vite": "^5.0.10",
  "terser": "^5.26.0"
}
```

#### Git Hooks
```json
{
  "husky": "^8.0.3"
}
```

### Step 2: Initialize Husky

```bash
# Initialize husky
npx husky install

# Or use npm script
npm run prepare
```

**Make hooks executable** (Linux/Mac):
```bash
chmod +x .husky/pre-commit
chmod +x .husky/commit-msg
chmod +x .husky/pre-push
```

**Windows**: Git Bash automatically handles permissions

### Step 3: Verify Installation

```bash
# Check ESLint
npx eslint --version

# Check Prettier
npx prettier --version

# Check TypeScript
npx tsc --version

# Check Solhint
npx solhint --version

# Check Hardhat
npx hardhat --version
```

---

## 🔧 Tool Configuration

### 1. ESLint Setup

**Configuration File**: `.eslintrc.json` ✅ Created

**Test ESLint**:
```bash
# Check for issues
npm run lint:js

# Auto-fix issues
npm run lint:js:fix

# Check specific file
npx eslint scripts/deploy.js
```

**IDE Integration**:

**VS Code**:
1. Install "ESLint" extension
2. Add to `.vscode/settings.json`:
```json
{
  "eslint.enable": true,
  "eslint.validate": [
    "javascript",
    "typescript"
  ],
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```

**WebStorm/IntelliJ**:
1. Settings → Languages & Frameworks → JavaScript → Code Quality Tools → ESLint
2. Enable "Automatic ESLint configuration"

### 2. Prettier Setup

**Configuration File**: `.prettierrc` ✅ Already exists

**Test Prettier**:
```bash
# Check formatting
npm run format:check

# Auto-format all files
npm run format

# Format specific file
npx prettier --write scripts/deploy.js
```

**IDE Integration**:

**VS Code**:
1. Install "Prettier - Code formatter" extension
2. Add to settings:
```json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true
}
```

### 3. TypeScript Setup

**Configuration File**: `tsconfig.json` ✅ Created

**Test TypeScript**:
```bash
# Type check
npm run typecheck

# Watch mode
npm run typecheck:watch
```

**IDE Integration**:
- VS Code: Built-in support
- WebStorm: Built-in support

### 4. Solhint Setup

**Configuration File**: `.solhint.json` ✅ Already exists

**Test Solhint**:
```bash
# Check contracts
npm run lint:sol

# Auto-fix issues
npm run lint:fix

# Check specific contract
npx solhint contracts/AnonymousPropertyVoting.sol
```

**IDE Integration**:

**VS Code**:
1. Install "Solidity" extension by Juan Blanco
2. Solhint is automatically used

### 5. Husky Git Hooks

**Hooks Directory**: `.husky/` ✅ Created

**Hooks Configured**:
- `pre-commit` - Linting, formatting, type checking, secret scanning
- `commit-msg` - Commit message format validation
- `pre-push` - Full test suite, security audit

**Test Hooks**:

```bash
# Test pre-commit (will run on actual commit)
git add .
git commit -m "test: verify pre-commit hooks"
# Hooks will run automatically

# Skip hooks if needed (not recommended)
git commit --no-verify -m "skip hooks"
```

### 6. Vite Build System

**Configuration File**: `vite.config.js` ✅ Created

**Test Vite**:
```bash
# Development build
npm run build

# Production build
npm run build:production

# Preview build
npm run preview
```

---

## 🔍 Verification Tests

### Test 1: Linting

```bash
# Test Solidity linting
npm run lint:sol

# Test JavaScript linting
npm run lint:js

# Test both
npm run lint:check
```

**Expected**: No errors (warnings are OK)

### Test 2: Formatting

```bash
# Check formatting
npm run format:check

# If issues found, format
npm run format

# Verify again
npm run format:check
```

**Expected**: All files properly formatted

### Test 3: Type Checking

```bash
# Run TypeScript type check
npm run typecheck
```

**Expected**: No type errors

### Test 4: Security Scanning

```bash
# Scan for secrets
npm run security:secrets

# Run security audit
npm run security:audit
```

**Expected**: No secrets found, no critical vulnerabilities

### Test 5: Contract Compilation

```bash
# Clean and compile
npm run clean
npm run compile
```

**Expected**: All contracts compile successfully

### Test 6: Test Suite

```bash
# Run unit tests
npm test

# Run performance tests
npm run test:performance

# Run all tests
npm run test:all
```

**Expected**:
- 20+ unit tests passing
- 17 performance tests passing

### Test 7: Gas Reporting

```bash
# Generate gas report
npm run test:gas
```

**Expected**: Gas report generated in `gas-report.txt`

### Test 8: Build Production

```bash
# Build frontend
npm run build:production

# Check dist folder
ls -lh dist/
```

**Expected**: Optimized build in `dist/` folder

---

## 🚀 Workflow Integration

### Development Workflow

**1. Start Development**:
```bash
# Create feature branch
git checkout -b feature/my-feature

# Install dependencies (first time)
npm install --legacy-peer-deps

# Compile contracts
npm run compile
```

**2. During Development**:
```bash
# Run tests frequently
npm test

# Check gas costs
npm run test:gas

# Lint and format
npm run lint:check
npm run format
```

**3. Before Committing**:
```bash
# Full CI check locally
npm run ci

# Or individual checks
npm run lint:check
npm run typecheck
npm run test
npm run test:performance
```

**4. Commit Changes**:
```bash
# Add files
git add .

# Commit (hooks run automatically)
git commit -m "feat(feature): add new feature"

# Pre-commit hooks will:
# - Check linting
# - Validate formatting
# - Type check
# - Scan for secrets
# - Validate commit message
```

**5. Push Changes**:
```bash
# Push (pre-push hooks run automatically)
git push origin feature/my-feature

# Pre-push hooks will:
# - Run full test suite
# - Security audit
# - Coverage check
```

### CI/CD Integration

**GitHub Actions Workflow**:

```yaml
# .github/workflows/test.yml (already configured)
# Runs automatically on:
# - Push to main/develop
# - All pull requests
# - Multiple Node.js versions (18.x, 20.x)
```

**Manual Trigger**:
1. Go to GitHub Actions tab
2. Select "CI/CD Pipeline - Tests & Quality Checks"
3. Click "Run workflow"
4. Choose branch
5. Click "Run workflow" button

---

## 📊 Monitoring & Metrics

### Gas Monitoring

**Real-time Tracking**:
```bash
# Enable gas reporter
export REPORT_GAS=true

# Run tests
npm test

# View report
cat gas-report.txt
```

**Set Gas Budgets** (in tests):
```javascript
expect(receipt.gasUsed).to.be.lt(500000); // 500k gas limit
```

### Security Monitoring

**Pre-commit**: Automatic secret scanning

**Weekly Audits**: GitHub Actions (Mondays 9 AM UTC)

**Manual Audit**:
```bash
npm run test:security
```

### Performance Monitoring

**Bundle Size**:
```bash
npm run build
du -sh dist/
```

**Lighthouse Audit**:
```bash
npm run preview
npx lighthouse http://localhost:8080 --view
```

---

## 🔧 IDE Configuration

### VS Code (Recommended)

**Extensions to Install**:
1. ESLint
2. Prettier - Code formatter
3. Solidity (Juan Blanco)
4. GitLens
5. Error Lens

**Settings** (`.vscode/settings.json`):
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "eslint.enable": true,
  "eslint.validate": [
    "javascript",
    "typescript",
    "solidity"
  ],
  "[solidity]": {
    "editor.defaultFormatter": "JuanBlanco.solidity"
  },
  "solidity.linter": "solhint",
  "solidity.compileUsingRemoteVersion": "v0.8.24",
  "files.associations": {
    "*.sol": "solidity"
  }
}
```

### WebStorm / IntelliJ IDEA

**Configuration**:

1. **ESLint**:
   - Settings → Languages & Frameworks → JavaScript → Code Quality Tools → ESLint
   - Enable "Automatic ESLint configuration"
   - Check "Run eslint --fix on save"

2. **Prettier**:
   - Settings → Languages & Frameworks → JavaScript → Prettier
   - Enable "On save"

3. **TypeScript**:
   - Settings → Languages & Frameworks → TypeScript
   - Use tsconfig.json

---

## 🐛 Troubleshooting

### Issue: npm install fails

**Error**: Peer dependency conflicts

**Solution**:
```bash
# Use legacy peer deps
npm install --legacy-peer-deps

# Or force
npm install --force

# Or clean install
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

### Issue: Husky hooks not running

**Error**: Hooks don't execute on commit/push

**Solution**:
```bash
# Reinstall husky
npm run prepare

# Make hooks executable (Linux/Mac)
chmod +x .husky/*

# Verify hooks
ls -la .husky/
```

### Issue: ESLint errors in node_modules

**Error**: ESLint checking node_modules folder

**Solution**: Verify `.eslintignore` exists and contains:
```
node_modules/
dist/
build/
```

### Issue: Pre-commit hooks too slow

**Solution**: Disable some checks temporarily
```bash
# Edit .husky/pre-commit
# Comment out slow checks

# Or skip hooks
git commit --no-verify
```

### Issue: TypeScript errors

**Error**: Cannot find module errors

**Solution**:
```bash
# Regenerate types
npm run compile

# Check TypeScript config
npm run typecheck
```

### Issue: Gas reporter not showing

**Error**: No gas report generated

**Solution**:
```bash
# Enable explicitly
REPORT_GAS=true npm test

# Check hardhat.config.js
# gasReporter.enabled should read REPORT_GAS env var
```

---

## 📚 Command Reference

### Essential Commands

```bash
# Installation
npm install --legacy-peer-deps      # Install dependencies
npm run prepare                     # Setup Husky

# Development
npm run compile                     # Compile contracts
npm test                            # Run tests
npm run test:gas                    # Gas report
npm run test:coverage              # Coverage report

# Linting & Formatting
npm run lint:check                  # Check all linting
npm run lint:fix                    # Fix Solidity linting
npm run lint:js:fix                 # Fix JS linting
npm run format                      # Format all files
npm run format:check               # Check formatting

# Type Checking
npm run typecheck                   # Type check once
npm run typecheck:watch            # Type check (watch)

# Security
npm run security:audit              # Dependency audit
npm run security:secrets           # Secret scanning
npm run test:security              # All security checks

# Performance
npm run performance:benchmark       # Gas benchmarks
npm run performance:load           # Load testing
npm run performance:all            # All performance tests

# Build
npm run build                       # Dev build
npm run build:production           # Production build
npm run preview                    # Preview build

# CI/CD
npm run ci                          # Local CI pipeline
```

### Git Commands

```bash
# Standard workflow
git add .
git commit -m "type(scope): message"
git push

# Skip hooks (not recommended)
git commit --no-verify
git push --no-verify
```

---

## 🎯 Success Checklist

After setup, verify:

- [ ] Dependencies installed: `npm list --depth=0`
- [ ] Husky initialized: `ls -la .husky/`
- [ ] ESLint working: `npm run lint:js`
- [ ] Prettier working: `npm run format:check`
- [ ] TypeScript working: `npm run typecheck`
- [ ] Solhint working: `npm run lint:sol`
- [ ] Contracts compile: `npm run compile`
- [ ] Tests pass: `npm test`
- [ ] Gas report works: `npm run test:gas`
- [ ] Build works: `npm run build`
- [ ] Hooks working: Try a test commit
- [ ] CI pipeline ready: `npm run ci`

---

## 🌟 What's Included

### Complete Toolchain

```
Backend:
✅ Hardhat (Smart contract framework)
✅ Solhint (Solidity linting)
✅ TypeChain (Type generation)
✅ Gas Reporter (Gas monitoring)
✅ Contract Sizer (24KB check)
✅ Coverage (solidity-coverage)

Frontend:
✅ Vite (Build system)
✅ ESLint (JS/TS linting)
✅ TypeScript (Type safety)
✅ Terser (Minification)

Security:
✅ eslint-plugin-security
✅ eslint-plugin-no-secrets
✅ npm audit integration
✅ Slither configuration
✅ TruffleHog (CI/CD)

Quality:
✅ Prettier (Formatting)
✅ Husky (Git hooks)
✅ Conventional Commits
✅ TypeScript strict mode

CI/CD:
✅ GitHub Actions (8 jobs)
✅ Multi-version testing
✅ Codecov integration
✅ Security audits
✅ Performance benchmarks
```

---

## 📞 Support

### Getting Help

**Documentation**:
- [SECURITY_AUDIT_OPTIMIZATION.md](./SECURITY_AUDIT_OPTIMIZATION.md)
- [CI_CD_GUIDE.md](./CI_CD_GUIDE.md)
- [DEVELOPMENT_WORKFLOW.md](./DEVELOPMENT_WORKFLOW.md)
- [TESTING.md](./TESTING.md)

**Common Issues**: Check troubleshooting section above

**GitHub Issues**: Report bugs and issues

---

## 🎉 Ready to Go!

Your complete security & performance toolchain is now set up!

**Next Steps**:
1. Run `npm run ci` to verify everything works
2. Make a test commit to verify hooks
3. Start coding with confidence!

---

**Status**: ✅ **TOOLCHAIN READY**

*Complete Integration: Security + Performance + Quality*
*Last Updated: October 18, 2025*
*Maintained by: Development Team*
