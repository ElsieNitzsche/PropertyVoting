# Contributing Guidelines

Thank you for your interest in contributing to the Anonymous Property Voting System! This document provides guidelines and instructions for contributing to the project.

---

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [How to Contribute](#how-to-contribute)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Security Guidelines](#security-guidelines)
- [Pull Request Process](#pull-request-process)
- [License](#license)

---

## Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inclusive environment for all contributors. We expect all participants to:

- Be respectful and considerate
- Welcome diverse perspectives and experiences
- Accept constructive criticism gracefully
- Focus on what is best for the community
- Show empathy towards other community members

### Unacceptable Behavior

- Harassment, discrimination, or offensive comments
- Personal attacks or trolling
- Publishing others' private information
- Any conduct that could be considered inappropriate in a professional setting

---

## Getting Started

### Prerequisites

Before contributing, ensure you have:

- Node.js 18.x or 20.x installed
- Git for version control
- Basic understanding of:
  - Solidity smart contracts
  - JavaScript/TypeScript
  - Hardhat development framework
  - Fully Homomorphic Encryption (FHE) concepts

### Setting Up Development Environment

1. **Fork the repository**
   ```bash
   # Click "Fork" on GitHub
   ```

2. **Clone your fork**
   ```bash
   git clone https://github.com/YOUR_USERNAME/anonymous-voting-system.git
   cd anonymous-voting-system
   ```

3. **Install dependencies**
   ```bash
   npm install --legacy-peer-deps
   ```

4. **Set up environment**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

5. **Compile contracts**
   ```bash
   npm run compile
   ```

6. **Run tests**
   ```bash
   npm test
   ```

---

## How to Contribute

### Types of Contributions

We welcome various types of contributions:

1. **Bug Reports**
   - Report bugs via GitHub Issues
   - Include steps to reproduce
   - Provide expected vs actual behavior
   - Include error messages and logs

2. **Feature Requests**
   - Describe the feature and its benefits
   - Explain use cases
   - Consider implementation complexity

3. **Code Contributions**
   - Bug fixes
   - New features
   - Performance improvements
   - Documentation updates

4. **Documentation**
   - Fix typos or errors
   - Improve clarity
   - Add examples
   - Translate documentation

5. **Testing**
   - Add new test cases
   - Improve test coverage
   - Performance benchmarks

---

## Development Workflow

### Branch Strategy

- `main` - Production-ready code
- `develop` - Integration branch for features
- `feature/*` - New features
- `bugfix/*` - Bug fixes
- `hotfix/*` - Urgent fixes for production

### Creating a Branch

```bash
# For a new feature
git checkout -b feature/add-voting-delegation

# For a bug fix
git checkout -b bugfix/fix-registration-error

# For documentation
git checkout -b docs/update-readme
```

### Making Changes

1. **Write clean, documented code**
2. **Follow coding standards** (see below)
3. **Add tests** for new functionality
4. **Update documentation** as needed
5. **Run linters and formatters**

```bash
# Format code
npm run format

# Lint code
npm run lint

# Run tests
npm test

# Run security checks
npm run test:security

# Run performance tests
npm run test:performance
```

---

## Coding Standards

### Solidity Standards

**Style Guide:**
- Follow [Solidity Style Guide](https://docs.soliditylang.org/en/latest/style-guide.html)
- Use descriptive variable and function names
- Add NatSpec comments for all public functions

**Example:**
```solidity
/**
 * @notice Registers a resident with their unit number
 * @param unitNumber The residential unit number (1-200)
 * @dev Unit number must be unique and within valid range
 */
function registerResident(uint256 unitNumber) external {
    require(unitNumber > 0 && unitNumber <= 200, "Invalid unit number");
    require(!residents[msg.sender].isRegistered, "Already registered");

    // Implementation
}
```

**Best Practices:**
- Minimize gas costs
- Use events for important state changes
- Implement proper access controls
- Validate all inputs
- Handle edge cases

### JavaScript/TypeScript Standards

**Style:**
- Use ES6+ syntax
- Prefer `const` over `let`, avoid `var`
- Use async/await over callbacks
- Add JSDoc comments for functions

**Example:**
```javascript
/**
 * Deploy voting contract to network
 * @param {string} gatewayAddress - Gateway contract address
 * @returns {Promise<Contract>} Deployed contract instance
 */
async function deployVotingContract(gatewayAddress) {
    const VotingContract = await ethers.getContractFactory("AnonymousPropertyVoting");
    const contract = await VotingContract.deploy(gatewayAddress);
    await contract.deployed();
    return contract;
}
```

### Formatting

**Automated formatting:**
```bash
# Format all files
npm run format

# Check formatting
npx prettier --check 'contracts/**/*.sol' 'scripts/**/*.js' 'test/**/*.js'
```

**Manual guidelines:**
- Indentation: 2 spaces for JS, 4 spaces for Solidity
- Line length: Max 120 characters
- Trailing commas: Yes (where valid)
- Semicolons: Required in JS
- Quotes: Double quotes for Solidity, single for JS

---

## Testing Guidelines

### Test Coverage Requirements

All contributions must include tests:

- **New features**: 100% test coverage
- **Bug fixes**: Test demonstrating the bug + fix
- **Refactoring**: Maintain existing coverage

### Writing Tests

**Structure:**
```javascript
describe("Feature Name", function () {
    beforeEach(async function () {
        // Setup
    });

    it("Should perform specific action", async function () {
        // Arrange
        const expectedValue = 123;

        // Act
        const actualValue = await contract.someFunction();

        // Assert
        expect(actualValue).to.equal(expectedValue);
    });
});
```

**Best Practices:**
- Use descriptive test names starting with "Should..."
- Test both success and failure cases
- Test edge cases and boundaries
- Use fixtures for complex setups
- Keep tests independent

### Running Tests

```bash
# All tests
npm test

# Specific test file
npx hardhat test test/AnonymousPropertyVoting.test.js

# With coverage
npm run test:coverage

# With gas reporting
npm run test:gas

# Performance tests
npm run test:performance
```

---

## Security Guidelines

### Security Review Checklist

Before submitting code:

- [ ] No hardcoded private keys or secrets
- [ ] Input validation on all external functions
- [ ] Proper access controls implemented
- [ ] Re-entrancy protection where needed
- [ ] Integer overflow/underflow prevention
- [ ] Events emitted for state changes
- [ ] Gas optimization considered
- [ ] Security audit tools run

### Running Security Tools

```bash
# Solhint linting
npm run lint

# npm audit
npm run security:audit

# Slither analysis (requires Python)
npm run security:slither
```

### Reporting Security Issues

**DO NOT** report security vulnerabilities in public issues.

Instead:
1. Email security contact (see SECURITY.md)
2. Provide detailed description
3. Include steps to reproduce
4. Suggest potential fixes if possible

We will respond within 48 hours.

---

## Pull Request Process

### Before Submitting

1. **Update your fork**
   ```bash
   git fetch upstream
   git rebase upstream/develop
   ```

2. **Run all checks**
   ```bash
   npm run ci
   ```

3. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add voting delegation feature"
   ```

   **Commit message format:**
   - `feat:` New feature
   - `fix:` Bug fix
   - `docs:` Documentation changes
   - `style:` Code formatting
   - `refactor:` Code refactoring
   - `test:` Adding tests
   - `chore:` Maintenance tasks

4. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

### Creating Pull Request

1. **Go to GitHub** and create PR from your fork
2. **Fill in PR template** with:
   - Description of changes
   - Related issues (if any)
   - Testing performed
   - Screenshots (if UI changes)
3. **Request review** from maintainers
4. **Address feedback** promptly

### PR Review Process

1. **Automated checks** must pass:
   - All tests passing
   - Code coverage maintained
   - Linting successful
   - Security checks passed

2. **Manual review** by maintainers:
   - Code quality
   - Design decisions
   - Documentation completeness
   - Security implications

3. **Approval and merge**:
   - At least 1 maintainer approval required
   - All comments addressed
   - Squash and merge to keep history clean

### After Merge

- Your contribution will be included in the next release
- You'll be added to the contributors list
- Thank you for your contribution! 🎉

---

## Performance Considerations

When contributing code:

- **Optimize gas usage** in smart contracts
- **Minimize storage operations** (SSTORE is expensive)
- **Use events** instead of storage when possible
- **Batch operations** where feasible
- **Profile performance** with benchmarks

```bash
# Run performance benchmarks
npm run performance:benchmark

# Run load tests
npm run performance:load
```

---

## Documentation

### Documentation Standards

When updating documentation:

- **Clear and concise** writing
- **Code examples** for complex features
- **Screenshots** for UI changes
- **Update all relevant docs**:
  - README.md
  - DEPLOYMENT.md
  - API documentation
  - Inline code comments

### Documentation Structure

```
docs/
├── README.md              # Main documentation
├── DEPLOYMENT.md          # Deployment guide
├── TESTING.md            # Testing guide
├── DEVELOPMENT_WORKFLOW.md  # Development workflow
├── QUICK_START.md        # Quick start guide
└── PROJECT_SUMMARY.md    # Project overview
```

---

## Communication

### Where to Ask Questions

- **GitHub Discussions**: General questions and ideas
- **GitHub Issues**: Bug reports and feature requests
- **Pull Requests**: Code-specific discussions

### Response Times

- **Issues**: Within 48 hours
- **Pull Requests**: Within 72 hours
- **Security Issues**: Within 24 hours

---

## Recognition

Contributors are recognized in:

- Project README.md
- Release notes
- Contributors list on GitHub
- Special mentions for significant contributions

---

## License

By contributing to this project, you agree that your contributions will be licensed under the MIT License. See [LICENSE](./LICENSE) file for details.

You grant the project maintainers a perpetual, worldwide, non-exclusive, royalty-free, irrevocable license to use, modify, and distribute your contributions.

---

## Additional Resources

- [Hardhat Documentation](https://hardhat.org/docs)
- [Solidity Documentation](https://docs.soliditylang.org/)
- [fhEVM Documentation](https://docs.zama.ai/fhevm)
- [Ethereum Development Best Practices](https://consensys.github.io/smart-contract-best-practices/)
- [OpenZeppelin Security Guidelines](https://docs.openzeppelin.com/contracts/)

---

## Getting Help

If you need help:

1. Check existing documentation
2. Search GitHub issues
3. Ask in GitHub Discussions
4. Contact maintainers (for complex issues)

---

**Thank you for contributing to the Anonymous Property Voting System!**

We appreciate your time and effort in making this project better for everyone.

---

*Version: 1.0*
*Last Updated: October 18, 2025*
