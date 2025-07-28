const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time, loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

describe("Performance Testing Suite", function () {
  // Extended timeout for performance tests
  this.timeout(120000);

  async function deployVotingFixture() {
    const [owner, ...residents] = await ethers.getSigners();
    const VotingContract = await ethers.getContractFactory("AnonymousPropertyVoting");
    const votingContract = await VotingContract.deploy();
    await votingContract.deployed();

    return { votingContract, owner, residents };
  }

  describe("Gas Efficiency Benchmarks", function () {
    it("Should measure deployment gas cost", async function () {
      const VotingContract = await ethers.getContractFactory("AnonymousPropertyVoting");
      const deployTx = await VotingContract.deploy();
      const receipt = await deployTx.deployTransaction.wait();

      console.log(`\n   📊 Deployment Gas: ${receipt.gasUsed.toString()}`);
      console.log(`   💰 Estimated Cost @ 50 Gwei: ${ethers.utils.formatEther(receipt.gasUsed.mul(50e9))} ETH`);

      // Deployment should be under 3M gas
      expect(receipt.gasUsed).to.be.lt(3000000);
    });

    it("Should measure resident registration gas cost", async function () {
      const { votingContract, residents } = await loadFixture(deployVotingFixture);

      const tx = await votingContract.connect(residents[0]).registerResident(101);
      const receipt = await tx.wait();

      console.log(`\n   📊 Registration Gas: ${receipt.gasUsed.toString()}`);
      console.log(`   💰 Estimated Cost @ 50 Gwei: ${ethers.utils.formatEther(receipt.gasUsed.mul(50e9))} ETH`);

      // Registration should be under 500K gas
      expect(receipt.gasUsed).to.be.lt(500000);
    });

    it("Should measure proposal creation gas cost", async function () {
      const { votingContract, owner } = await loadFixture(deployVotingFixture);

      const tx = await votingContract.connect(owner).createProposal(
        "Community Pool Renovation",
        "Renovate the community pool with new tiles and heating system",
        48
      );
      const receipt = await tx.wait();

      console.log(`\n   📊 Proposal Creation Gas: ${receipt.gasUsed.toString()}`);
      console.log(`   💰 Estimated Cost @ 50 Gwei: ${ethers.utils.formatEther(receipt.gasUsed.mul(50e9))} ETH`);

      // Proposal creation should be under 600K gas
      expect(receipt.gasUsed).to.be.lt(600000);
    });

    it("Should measure proposal closing gas cost", async function () {
      const { votingContract, owner } = await loadFixture(deployVotingFixture);

      await votingContract.connect(owner).createProposal("Test", "Description", 24);
      await time.increase(25 * 3600);

      const tx = await votingContract.connect(owner).endProposal(1);
      const receipt = await tx.wait();

      console.log(`\n   📊 Proposal Closing Gas: ${receipt.gasUsed.toString()}`);
      console.log(`   💰 Estimated Cost @ 50 Gwei: ${ethers.utils.formatEther(receipt.gasUsed.mul(50e9))} ETH`);

      // Closing should be under 300K gas
      expect(receipt.gasUsed).to.be.lt(300000);
    });
  });

  describe("Scalability Testing", function () {
    it("Should handle bulk resident registration efficiently", async function () {
      const { votingContract, residents } = await loadFixture(deployVotingFixture);

      const startTime = Date.now();
      const gasUsed = [];

      // Register 10 residents
      for (let i = 0; i < 10; i++) {
        const tx = await votingContract.connect(residents[i]).registerResident(101 + i);
        const receipt = await tx.wait();
        gasUsed.push(receipt.gasUsed);
      }

      const endTime = Date.now();
      const avgGas = gasUsed.reduce((a, b) => a.add(b), ethers.BigNumber.from(0)).div(gasUsed.length);

      console.log(`\n   📊 Bulk Registration (10 residents):`);
      console.log(`   ⏱️  Time Taken: ${endTime - startTime}ms`);
      console.log(`   ⛽ Average Gas per Registration: ${avgGas.toString()}`);
      console.log(`   📈 Gas Range: ${Math.min(...gasUsed.map(g => g.toNumber()))} - ${Math.max(...gasUsed.map(g => g.toNumber()))}`);

      // Average should be consistent and under 500K
      expect(avgGas).to.be.lt(500000);
    });

    it("Should measure query performance for view functions", async function () {
      const { votingContract, owner, residents } = await loadFixture(deployVotingFixture);

      // Setup: Register residents and create proposal
      await votingContract.connect(residents[0]).registerResident(101);
      await votingContract.connect(owner).createProposal("Test", "Description", 24);

      const iterations = 100;
      const startTime = Date.now();

      // Perform 100 consecutive reads
      for (let i = 0; i < iterations; i++) {
        await votingContract.getCurrentProposalInfo();
        await votingContract.getResidentStatus(residents[0].address);
        await votingContract.getTotalResidents();
      }

      const endTime = Date.now();
      const avgTimePerQuery = (endTime - startTime) / (iterations * 3);

      console.log(`\n   📊 View Function Performance (${iterations} iterations):`);
      console.log(`   ⏱️  Total Time: ${endTime - startTime}ms`);
      console.log(`   📈 Average Time per Query: ${avgTimePerQuery.toFixed(2)}ms`);

      // Each query should be under 50ms on average
      expect(avgTimePerQuery).to.be.lt(50);
    });

    it("Should handle sequential proposal lifecycle efficiently", async function () {
      const { votingContract, owner } = await loadFixture(deployVotingFixture);

      const cycleGas = [];
      const startTime = Date.now();

      // Run 3 complete proposal cycles
      for (let i = 0; i < 3; i++) {
        const createTx = await votingContract.connect(owner).createProposal(
          `Proposal ${i + 1}`,
          `Description ${i + 1}`,
          24
        );
        const createReceipt = await createTx.wait();

        await time.increase(25 * 3600);

        const endTx = await votingContract.connect(owner).endProposal(i + 1);
        const endReceipt = await endTx.wait();

        cycleGas.push({
          create: createReceipt.gasUsed,
          end: endReceipt.gasUsed,
          total: createReceipt.gasUsed.add(endReceipt.gasUsed)
        });
      }

      const endTime = Date.now();
      const avgTotal = cycleGas.reduce((sum, g) => sum.add(g.total), ethers.BigNumber.from(0)).div(cycleGas.length);

      console.log(`\n   📊 Proposal Lifecycle Gas (3 cycles):`);
      console.log(`   ⏱️  Total Time: ${endTime - startTime}ms`);
      console.log(`   ⛽ Average Total Gas per Cycle: ${avgTotal.toString()}`);
      console.log(`   📈 Gas Consistency: ${cycleGas[0].total.toString()} → ${cycleGas[2].total.toString()}`);

      // Total cycle gas should be under 900K
      expect(avgTotal).to.be.lt(900000);
    });
  });

  describe("Memory and Storage Optimization", function () {
    it("Should efficiently store resident data", async function () {
      const { votingContract, residents } = await loadFixture(deployVotingFixture);

      const storageSlots = [];

      // Register 5 residents and check storage
      for (let i = 0; i < 5; i++) {
        await votingContract.connect(residents[i]).registerResident(101 + i);

        const residentData = await votingContract.getResidentStatus(residents[i].address);
        storageSlots.push({
          address: residents[i].address,
          isRegistered: residentData[0],
          registrationTime: residentData[1]
        });
      }

      console.log(`\n   📊 Storage Efficiency:`);
      console.log(`   📦 Residents Stored: ${storageSlots.length}`);
      console.log(`   ✅ All Data Retrievable: ${storageSlots.every(s => s.isRegistered)}`);

      expect(storageSlots.length).to.equal(5);
      expect(storageSlots.every(s => s.isRegistered)).to.be.true;
    });

    it("Should efficiently handle proposal data storage", async function () {
      const { votingContract, owner } = await loadFixture(deployVotingFixture);

      const proposals = [];

      // Create and store 3 proposals sequentially
      for (let i = 0; i < 3; i++) {
        await votingContract.connect(owner).createProposal(
          `Proposal ${i + 1}`,
          `Long description text for proposal ${i + 1} to test storage efficiency with varying data sizes`,
          24 + (i * 12)
        );

        await time.increase(25 * 3600);
        await votingContract.connect(owner).endProposal(i + 1);

        const proposalData = await votingContract.getCurrentProposalInfo();
        proposals.push({
          id: proposalData[0],
          title: proposalData[1],
          description: proposalData[2]
        });
      }

      console.log(`\n   📊 Proposal Storage:`);
      console.log(`   📦 Proposals Stored: ${proposals.length}`);
      console.log(`   📝 Average Title Length: ${Math.round(proposals.reduce((sum, p) => sum + p.title.length, 0) / proposals.length)}`);
      console.log(`   📄 Average Description Length: ${Math.round(proposals.reduce((sum, p) => sum + p.description.length, 0) / proposals.length)}`);

      expect(proposals.length).to.equal(3);
    });
  });

  describe("Network Latency Simulation", function () {
    it("Should handle rapid transaction submissions", async function () {
      const { votingContract, residents } = await loadFixture(deployVotingFixture);

      const startTime = Date.now();
      const txPromises = [];

      // Submit 5 registrations in rapid succession
      for (let i = 0; i < 5; i++) {
        txPromises.push(
          votingContract.connect(residents[i]).registerResident(101 + i)
        );
      }

      // Wait for all transactions
      const txs = await Promise.all(txPromises);
      const receipts = await Promise.all(txs.map(tx => tx.wait()));
      const endTime = Date.now();

      const totalGas = receipts.reduce((sum, r) => sum.add(r.gasUsed), ethers.BigNumber.from(0));

      console.log(`\n   📊 Rapid Transaction Performance:`);
      console.log(`   ⏱️  Time for 5 Parallel Txs: ${endTime - startTime}ms`);
      console.log(`   ⛽ Total Gas Used: ${totalGas.toString()}`);
      console.log(`   ✅ All Transactions Successful: ${receipts.every(r => r.status === 1)}`);

      expect(receipts.every(r => r.status === 1)).to.be.true;
    });

    it("Should maintain performance under sequential operations", async function () {
      const { votingContract, owner, residents } = await loadFixture(deployVotingFixture);

      const operationTimes = [];

      // Perform 10 sequential operations
      for (let i = 0; i < 10; i++) {
        const opStart = Date.now();

        if (i % 2 === 0) {
          await votingContract.connect(residents[i]).registerResident(101 + i);
        } else {
          await votingContract.getTotalResidents();
        }

        operationTimes.push(Date.now() - opStart);
      }

      const avgTime = operationTimes.reduce((a, b) => a + b, 0) / operationTimes.length;
      const maxTime = Math.max(...operationTimes);
      const minTime = Math.min(...operationTimes);

      console.log(`\n   📊 Sequential Operation Performance:`);
      console.log(`   ⏱️  Average Time: ${avgTime.toFixed(2)}ms`);
      console.log(`   📈 Time Range: ${minTime}ms - ${maxTime}ms`);
      console.log(`   📉 Variance: ${(maxTime - minTime).toFixed(2)}ms`);

      // Performance should be consistent
      expect(maxTime - minTime).to.be.lt(5000); // Less than 5 seconds variance
    });
  });

  describe("Load Testing", function () {
    it("Should handle high resident count efficiently", async function () {
      const { votingContract, residents } = await loadFixture(deployVotingFixture);

      const batchSize = 20;
      const startTime = Date.now();

      // Register 20 residents
      for (let i = 0; i < batchSize; i++) {
        await votingContract.connect(residents[i]).registerResident(101 + i);
      }

      const endTime = Date.now();
      const totalTime = endTime - startTime;
      const avgTimePerResident = totalTime / batchSize;

      const totalResidents = await votingContract.getTotalResidents();

      console.log(`\n   📊 Load Testing (${batchSize} residents):`);
      console.log(`   ⏱️  Total Time: ${totalTime}ms`);
      console.log(`   📈 Avg Time per Resident: ${avgTimePerResident.toFixed(2)}ms`);
      console.log(`   👥 Total Residents: ${totalResidents.toString()}`);

      expect(totalResidents).to.equal(batchSize);
      expect(avgTimePerResident).to.be.lt(1000); // Under 1 second per resident
    });

    it("Should measure contract state query performance under load", async function () {
      const { votingContract, owner, residents } = await loadFixture(deployVotingFixture);

      // Setup: Register 10 residents
      for (let i = 0; i < 10; i++) {
        await votingContract.connect(residents[i]).registerResident(101 + i);
      }

      await votingContract.connect(owner).createProposal("Load Test Proposal", "Testing under load", 24);

      // Perform 50 concurrent state queries
      const startTime = Date.now();
      const queryPromises = [];

      for (let i = 0; i < 50; i++) {
        queryPromises.push(votingContract.getCurrentProposalInfo());
        queryPromises.push(votingContract.getTotalResidents());
      }

      await Promise.all(queryPromises);
      const endTime = Date.now();

      const avgQueryTime = (endTime - startTime) / queryPromises.length;

      console.log(`\n   📊 Concurrent Query Performance:`);
      console.log(`   🔄 Total Queries: ${queryPromises.length}`);
      console.log(`   ⏱️  Total Time: ${endTime - startTime}ms`);
      console.log(`   📈 Avg Time per Query: ${avgQueryTime.toFixed(2)}ms`);

      expect(avgQueryTime).to.be.lt(100); // Under 100ms per query
    });
  });

  describe("Gas Optimization Verification", function () {
    it("Should verify gas savings from optimizations", async function () {
      const { votingContract, owner, residents } = await loadFixture(deployVotingFixture);

      // Measure gas for optimized operations
      const registrationTx = await votingContract.connect(residents[0]).registerResident(101);
      const registrationReceipt = await registrationTx.wait();

      const proposalTx = await votingContract.connect(owner).createProposal(
        "Optimized Proposal",
        "Testing gas optimization",
        24
      );
      const proposalReceipt = await proposalTx.wait();

      console.log(`\n   📊 Gas Optimization Report:`);
      console.log(`   ⛽ Registration Gas: ${registrationReceipt.gasUsed.toString()}`);
      console.log(`   ⛽ Proposal Creation Gas: ${proposalReceipt.gasUsed.toString()}`);
      console.log(`   ✅ Within Target: ${registrationReceipt.gasUsed.lt(500000) && proposalReceipt.gasUsed.lt(600000)}`);

      expect(registrationReceipt.gasUsed).to.be.lt(500000);
      expect(proposalReceipt.gasUsed).to.be.lt(600000);
    });
  });
});
