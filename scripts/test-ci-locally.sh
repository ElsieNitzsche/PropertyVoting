#!/bin/bash

# Local CI/CD Pipeline Testing Script
# This script simulates the GitHub Actions CI/CD pipeline locally

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
print_header() {
    echo -e "\n${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}\n"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Main pipeline execution
main() {
    print_header "Starting Local CI/CD Pipeline Test"

    # Job 1: Code Quality & Linting
    print_header "Job 1: Code Quality & Linting"

    print_info "Running Solidity linting..."
    if npx solhint 'contracts/**/*.sol' -f table; then
        print_success "Solidity linting passed"
    else
        print_error "Solidity linting failed"
        exit 1
    fi

    print_info "Checking Solidity formatting..."
    if npx prettier --check 'contracts/**/*.sol'; then
        print_success "Solidity formatting check passed"
    else
        print_warning "Solidity formatting issues found (run: npm run format)"
    fi

    print_info "Checking JavaScript/TypeScript formatting..."
    if npx prettier --check 'scripts/**/*.js' 'test/**/*.js'; then
        print_success "JS/TS formatting check passed"
    else
        print_warning "JS/TS formatting issues found (run: npm run format)"
    fi

    print_info "Running TypeScript type checks..."
    if npm run typecheck; then
        print_success "TypeScript checks passed"
    else
        print_warning "TypeScript type check issues found"
    fi

    # Job 2: Contract Compilation
    print_header "Job 2: Contract Compilation"

    print_info "Compiling smart contracts..."
    if npm run compile; then
        print_success "Contract compilation successful"
    else
        print_error "Contract compilation failed"
        exit 1
    fi

    print_info "Checking contract sizes..."
    npx hardhat size-contracts || print_warning "Contract size check completed with warnings"

    # Job 3: Unit Tests
    print_header "Job 3: Unit Tests"

    print_info "Running unit tests..."
    if npm test; then
        print_success "Unit tests passed"
    else
        print_error "Unit tests failed"
        exit 1
    fi

    # Job 4: Coverage Analysis
    print_header "Job 4: Coverage Analysis"

    print_info "Generating coverage report..."
    if npm run test:coverage; then
        print_success "Coverage report generated"
        print_info "Open coverage/index.html to view report"
    else
        print_warning "Coverage generation had issues"
    fi

    # Job 5: Gas Report
    print_header "Job 5: Gas Usage Analysis"

    print_info "Generating gas report..."
    if REPORT_GAS=true npm test > gas-report-local.txt 2>&1; then
        print_success "Gas report generated"
        print_info "Report saved to gas-report-local.txt"
    else
        print_warning "Gas report generation had issues"
    fi

    # Job 6: Performance Tests
    print_header "Job 6: Performance Benchmarks"

    print_info "Running performance tests..."
    if npm run test:performance; then
        print_success "Performance tests passed"
    else
        print_warning "Performance tests had issues"
    fi

    # Job 7: Security Checks
    print_header "Job 7: Security Analysis"

    print_info "Running npm security audit..."
    if npm audit --audit-level=moderate; then
        print_success "No security vulnerabilities found"
    else
        print_warning "Security audit found issues (check output above)"
    fi

    # Summary
    print_header "Pipeline Summary"

    echo -e "${GREEN}✅ All CI/CD pipeline checks completed!${NC}"
    echo ""
    echo -e "Generated artifacts:"
    echo -e "  📊 Coverage report: ${BLUE}coverage/index.html${NC}"
    echo -e "  ⛽ Gas report: ${BLUE}gas-report-local.txt${NC}"
    echo -e "  📦 Contract artifacts: ${BLUE}artifacts/${NC}"
    echo -e "  🔧 TypeChain types: ${BLUE}typechain-types/${NC}"
    echo ""
    echo -e "${GREEN}Ready to push to GitHub!${NC}"
}

# Run main function
main

exit 0
