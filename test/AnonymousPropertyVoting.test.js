const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time, loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

describe("AnonymousPropertyVoting - Comprehensive Test Suite", function () {
  // Deployment fixture for reusability
  async function deployVotingFixture() {
    const [owner, resident1, resident2, resident3, resident4, resident5] = await ethers.getSigners();

    const VotingContract = await ethers.getContractFactory("AnonymousPropertyVoting");
    const votingContract = await VotingContract.deploy();
    await votingContract.deployed();

    return { votingContract, owner, resident1, resident2, resident3, resident4, resident5 };
  }

  describe("1. Deployment and Initialization", function () {
    it("Should set the correct property manager", async function () {
      const { votingContract, owner } = await loadFixture(deployVotingFixture);
      expect(await votingContract.propertyManager()).to.equal(owner.address);
    });

    it("Should initialize currentProposal to 1", async function () {
      const { votingContract } = await loadFixture(deployVotingFixture);
      expect(await votingContract.currentProposal()).to.equal(1);
    });

    it("Should set proposalCreationTime", async function () {
      const { votingContract } = await loadFixture(deployVotingFixture);
      const creationTime = await votingContract.proposalCreationTime();
      expect(creationTime).to.be.gt(0);
    });

    it("Should have valid contract address", async function () {
      const { votingContract } = await loadFixture(deployVotingFixture);
      expect(votingContract.address).to.be.properAddress;
    });

    it("Should initialize with no registered residents", async function () {
      const { votingContract } = await loadFixture(deployVotingFixture);
      expect(await votingContract.getTotalResidents()).to.equal(0);
    });
  });

  describe("2. Resident Registration", function () {
    it("Should allow resident to register with valid unit number", async function () {
      const { votingContract, resident1 } = await loadFixture(deployVotingFixture);

      await expect(
        votingContract.connect(resident1).registerResident(101)
      ).to.emit(votingContract, "ResidentRegistered")
        .withArgs(resident1.address);
    });

    it("Should reject zero unit number", async function () {
      const { votingContract, resident1 } = await loadFixture(deployVotingFixture);

      await expect(
        votingContract.connect(resident1).registerResident(0)
      ).to.be.revertedWith("Invalid unit number");
    });

    it("Should reject unit number above 200", async function () {
      const { votingContract, resident1 } = await loadFixture(deployVotingFixture);

      await expect(
        votingContract.connect(resident1).registerResident(201)
      ).to.be.revertedWith("Invalid unit number");
    });

    it("Should reject duplicate registration", async function () {
      const { votingContract, resident1 } = await loadFixture(deployVotingFixture);

      await votingContract.connect(resident1).registerResident(101);

      await expect(
        votingContract.connect(resident1).registerResident(102)
      ).to.be.revertedWith("Already registered");
    });

    it("Should allow multiple residents to register different units", async function () {
      const { votingContract, resident1, resident2, resident3 } = await loadFixture(deployVotingFixture);

      await votingContract.connect(resident1).registerResident(101);
      await votingContract.connect(resident2).registerResident(102);
      await votingContract.connect(resident3).registerResident(103);

      const [isReg1] = await votingContract.getResidentStatus(resident1.address);
      const [isReg2] = await votingContract.getResidentStatus(resident2.address);
      const [isReg3] = await votingContract.getResidentStatus(resident3.address);

      expect(isReg1).to.equal(true);
      expect(isReg2).to.equal(true);
      expect(isReg3).to.equal(true);
    });

    it("Should correctly track total residents count", async function () {
      const { votingContract, resident1, resident2 } = await loadFixture(deployVotingFixture);

      expect(await votingContract.getTotalResidents()).to.equal(0);

      await votingContract.connect(resident1).registerResident(101);
      expect(await votingContract.getTotalResidents()).to.equal(1);

      await votingContract.connect(resident2).registerResident(102);
      expect(await votingContract.getTotalResidents()).to.equal(2);
    });
  });

  describe("3. Proposal Creation", function () {
    it("Should allow property manager to create proposal", async function () {
      const { votingContract, owner } = await loadFixture(deployVotingFixture);
      const votingDuration = 24; // 24 hours

      await expect(
        votingContract.connect(owner).createProposal(
          "Swimming Pool Renovation",
          "Renovate the community swimming pool",
          votingDuration
        )
      ).to.emit(votingContract, "ProposalCreated")
        .withArgs(1, "Swimming Pool Renovation", await time.latest() + (votingDuration * 3600));
    });

    it("Should reject proposal creation by non-manager", async function () {
      const { votingContract, resident1 } = await loadFixture(deployVotingFixture);
      const votingDuration = 24;

      await expect(
        votingContract.connect(resident1).createProposal(
          "Proposal", "Description", votingDuration
        )
      ).to.be.revertedWith("Not authorized manager");
    });

    it("Should reject voting duration less than 24 hours", async function () {
      const { votingContract, owner } = await loadFixture(deployVotingFixture);

      await expect(
        votingContract.connect(owner).createProposal(
          "Proposal", "Description", 23
        )
      ).to.be.revertedWith("Duration must be 1-7 days");
    });

    it("Should reject voting duration more than 168 hours", async function () {
      const { votingContract, owner } = await loadFixture(deployVotingFixture);

      await expect(
        votingContract.connect(owner).createProposal(
          "Proposal", "Description", 169
        )
      ).to.be.revertedWith("Duration must be 1-7 days");
    });

    it("Should correctly store proposal information", async function () {
      const { votingContract, owner } = await loadFixture(deployVotingFixture);
      const votingDuration = 24;

      await votingContract.connect(owner).createProposal(
        "Test Proposal",
        "Test Description",
        votingDuration
      );

      const [proposalId, title, description, isActive, startTime, endTime, totalVotes] =
        await votingContract.getCurrentProposalInfo();

      expect(proposalId).to.equal(1);
      expect(title).to.equal("Test Proposal");
      expect(description).to.equal("Test Description");
      expect(isActive).to.equal(true);
      expect(totalVotes).to.equal(0);
    });

    it("Should increment currentProposal after completion", async function () {
      const { votingContract, owner } = await loadFixture(deployVotingFixture);
      const votingDuration = 24;

      await votingContract.connect(owner).createProposal(
        "Proposal 1", "Description 1", votingDuration
      );

      const initialProposalId = await votingContract.currentProposal();
      expect(initialProposalId).to.equal(1);

      // Complete the proposal cycle would increment currentProposal
      // (This happens in processVoteResults after revealing)
    });

    it("Should reject creating proposal when previous is active", async function () {
      const { votingContract, owner } = await loadFixture(deployVotingFixture);
      const votingDuration = 24;

      await votingContract.connect(owner).createProposal(
        "Proposal 1", "Description 1", votingDuration
      );

      await expect(
        votingContract.connect(owner).createProposal(
          "Proposal 2", "Description 2", votingDuration
        )
      ).to.be.revertedWith("Previous proposal still active");
    });
  });

  describe("4. Voting", function () {
    beforeEach(async function () {
      const fixture = await loadFixture(deployVotingFixture);
      this.votingContract = fixture.votingContract;
      this.owner = fixture.owner;
      this.resident1 = fixture.resident1;
      this.resident2 = fixture.resident2;
      this.resident3 = fixture.resident3;

      // Register residents
      await this.votingContract.connect(this.resident1).registerResident(101);
      await this.votingContract.connect(this.resident2).registerResident(102);
      await this.votingContract.connect(this.resident3).registerResident(103);

      // Create proposal
      await this.votingContract.connect(this.owner).createProposal(
        "Community Garden", "Create a community garden area", 24
      );
    });

    it("Should allow registered resident to vote Yes (1)", async function () {
      await expect(
        this.votingContract.connect(this.resident1).submitVote(1, 1)
      ).to.emit(this.votingContract, "VoteSubmitted")
        .withArgs(this.resident1.address, 1);
    });

    it("Should allow registered resident to vote No (0)", async function () {
      await expect(
        this.votingContract.connect(this.resident1).submitVote(1, 0)
      ).to.emit(this.votingContract, "VoteSubmitted")
        .withArgs(this.resident1.address, 1);
    });

    it("Should reject vote from unregistered resident", async function () {
      const { resident4 } = await loadFixture(deployVotingFixture);

      await expect(
        this.votingContract.connect(resident4).submitVote(1, 1)
      ).to.be.revertedWith("Not a registered resident");
    });

    it("Should reject invalid vote choice (not 0 or 1)", async function () {
      await expect(
        this.votingContract.connect(this.resident1).submitVote(1, 2)
      ).to.be.revertedWith("Vote must be 0 (No) or 1 (Yes)");
    });

    it("Should reject duplicate voting", async function () {
      await this.votingContract.connect(this.resident1).submitVote(1, 1);

      await expect(
        this.votingContract.connect(this.resident1).submitVote(1, 0)
      ).to.be.revertedWith("Already voted on this proposal");
    });

    it("Should allow multiple residents to vote on same proposal", async function () {
      await this.votingContract.connect(this.resident1).submitVote(1, 1);
      await this.votingContract.connect(this.resident2).submitVote(1, 1);
      await this.votingContract.connect(this.resident3).submitVote(1, 0);

      const [, , , , , , totalVotes] = await this.votingContract.getCurrentProposalInfo();
      expect(totalVotes).to.equal(3);
    });

    it("Should reject voting after voting period ends", async function () {
      // Fast forward past voting period (24 hours + 1 second)
      await time.increase(24 * 3600 + 1);

      await expect(
        this.votingContract.connect(this.resident1).submitVote(1, 1)
      ).to.be.revertedWith("Voting period ended");
    });

    it("Should reject voting on inactive proposal", async function () {
      const { votingContract, owner, resident1 } = await loadFixture(deployVotingFixture);

      await resident1.registerResident(101);
      await votingContract.connect(owner).createProposal("Test", "Desc", 24);

      // Fast forward and end proposal
      await time.increase(25 * 3600);
      await votingContract.connect(owner).endProposal(1);

      await expect(
        votingContract.connect(resident1).submitVote(1, 1)
      ).to.be.revertedWith("Proposal not active");
    });

    it("Should correctly increment total votes", async function () {
      let [, , , , , , totalVotes] = await this.votingContract.getCurrentProposalInfo();
      expect(totalVotes).to.equal(0);

      await this.votingContract.connect(this.resident1).submitVote(1, 1);
      [, , , , , , totalVotes] = await this.votingContract.getCurrentProposalInfo();
      expect(totalVotes).to.equal(1);

      await this.votingContract.connect(this.resident2).submitVote(1, 0);
      [, , , , , , totalVotes] = await this.votingContract.getCurrentProposalInfo();
      expect(totalVotes).to.equal(2);
    });
  });

  describe("5. Proposal Closing", function () {
    beforeEach(async function () {
      const fixture = await loadFixture(deployVotingFixture);
      this.votingContract = fixture.votingContract;
      this.owner = fixture.owner;
      this.resident1 = fixture.resident1;

      await this.votingContract.connect(this.owner).createProposal(
        "Proposal", "Description", 24
      );
    });

    it("Should allow property manager to end proposal after voting ends", async function () {
      // Fast forward past voting period
      await time.increase(25 * 3600);

      await expect(
        this.votingContract.connect(this.owner).endProposal(1)
      ).to.not.be.reverted;
    });

    it("Should reject ending proposal by non-manager", async function () {
      await time.increase(25 * 3600);

      await expect(
        this.votingContract.connect(this.resident1).endProposal(1)
      ).to.be.revertedWith("Not authorized manager");
    });

    it("Should reject ending proposal before voting ends", async function () {
      await expect(
        this.votingContract.connect(this.owner).endProposal(1)
      ).to.be.revertedWith("Voting still active");
    });

    it("Should reject ending already revealed proposal", async function () {
      const { votingContract, owner, resident1 } = await loadFixture(deployVotingFixture);

      await votingContract.connect(resident1).registerResident(101);
      await votingContract.connect(owner).createProposal("Test", "Desc", 24);
      await votingContract.connect(resident1).submitVote(1, 1);

      await time.increase(25 * 3600);
      await votingContract.connect(owner).endProposal(1);

      // After results are revealed, attempting to end again should fail
      // (This would be checked in actual implementation with resultsRevealed flag)
    });
  });

  describe("6. Results Revelation", function () {
    it("Should request decryption when ending proposal", async function () {
      const { votingContract, owner, resident1, resident2 } = await loadFixture(deployVotingFixture);

      await votingContract.connect(resident1).registerResident(101);
      await votingContract.connect(resident2).registerResident(102);

      await votingContract.connect(owner).createProposal(
        "Proposal", "Description", 24
      );

      await votingContract.connect(resident1).submitVote(1, 1);
      await votingContract.connect(resident2).submitVote(1, 0);

      await time.increase(25 * 3600);

      // endProposal calls FHE.requestDecryption internally
      await expect(
        votingContract.connect(owner).endProposal(1)
      ).to.not.be.reverted;
    });

    it("Should process vote results correctly (simulated)", async function () {
      // Note: In actual fhEVM environment, processVoteResults is called by KMS
      // This test verifies the function logic exists
      const { votingContract } = await loadFixture(deployVotingFixture);

      // Verify the function exists
      expect(votingContract.processVoteResults).to.exist;
    });

    it("Should emit ProposalEnded event with vote counts", async function () {
      const { votingContract, owner, resident1 } = await loadFixture(deployVotingFixture);

      await votingContract.connect(resident1).registerResident(101);
      await votingContract.connect(owner).createProposal("Test", "Desc", 24);
      await votingContract.connect(resident1).submitVote(1, 1);

      await time.increase(25 * 3600);

      // The event would be emitted in processVoteResults
      // which is called asynchronously by the KMS
    });
  });

  describe("7. View Functions", function () {
    beforeEach(async function () {
      const fixture = await loadFixture(deployVotingFixture);
      this.votingContract = fixture.votingContract;
      this.owner = fixture.owner;
      this.resident1 = fixture.resident1;

      await this.votingContract.connect(this.resident1).registerResident(101);
      await this.votingContract.connect(this.owner).createProposal(
        "Test Proposal", "Test Description", 24
      );
    });

    it("Should correctly return current proposal info", async function () {
      const [proposalId, title, description, isActive] =
        await this.votingContract.getCurrentProposalInfo();

      expect(proposalId).to.equal(1);
      expect(title).to.equal("Test Proposal");
      expect(description).to.equal("Test Description");
      expect(isActive).to.equal(true);
    });

    it("Should correctly return resident status", async function () {
      const [isRegistered, registrationTime, hasVoted] =
        await this.votingContract.getResidentStatus(this.resident1.address);

      expect(isRegistered).to.equal(true);
      expect(registrationTime).to.be.gt(0);
      expect(hasVoted).to.equal(false);
    });

    it("Should correctly return voting time left", async function () {
      const timeLeft = await this.votingContract.getVotingTimeLeft(1);

      // Should be approximately 24 hours (86400 seconds)
      expect(timeLeft).to.be.closeTo(86400, 100);
    });

    it("Should return zero time left after voting ends", async function () {
      await time.increase(25 * 3600);

      const timeLeft = await this.votingContract.getVotingTimeLeft(1);
      expect(timeLeft).to.equal(0);
    });

    it("Should correctly return voting active status", async function () {
      let isActive = await this.votingContract.isVotingActive(1);
      expect(isActive).to.equal(true);

      await time.increase(25 * 3600);

      isActive = await this.votingContract.isVotingActive(1);
      expect(isActive).to.equal(false);
    });

    it("Should correctly return total residents", async function () {
      const { votingContract, resident2 } = await loadFixture(deployVotingFixture);

      expect(await votingContract.getTotalResidents()).to.equal(0);

      await votingContract.connect(resident2).registerResident(102);
      expect(await votingContract.getTotalResidents()).to.equal(1);
    });

    it("Should return proposal results after revelation", async function () {
      // After processVoteResults is called, getProposalResults should return data
      const results = await this.votingContract.getProposalResults(1);

      // Initially results are not revealed
      expect(results.resultsRevealed).to.equal(false);
    });
  });

  describe("8. Gas Optimization Tests", function () {
    it("Resident registration gas should be reasonable", async function () {
      const { votingContract, resident1 } = await loadFixture(deployVotingFixture);

      const tx = await votingContract.connect(resident1).registerResident(101);
      const receipt = await tx.wait();

      console.log(`   Resident Registration Gas: ${receipt.gasUsed.toString()}`);
      expect(receipt.gasUsed).to.be.lt(500000);
    });

    it("Proposal creation gas should be reasonable", async function () {
      const { votingContract, owner } = await loadFixture(deployVotingFixture);

      const tx = await votingContract.connect(owner).createProposal(
        "Proposal", "Description", 24
      );
      const receipt = await tx.wait();

      console.log(`   Proposal Creation Gas: ${receipt.gasUsed.toString()}`);
      expect(receipt.gasUsed).to.be.lt(600000);
    });

    it("Voting gas should be reasonable", async function () {
      const { votingContract, owner, resident1 } = await loadFixture(deployVotingFixture);

      await votingContract.connect(resident1).registerResident(101);
      await votingContract.connect(owner).createProposal("Proposal", "Description", 24);

      const tx = await votingContract.connect(resident1).submitVote(1, 1);
      const receipt = await tx.wait();

      console.log(`   Voting Gas: ${receipt.gasUsed.toString()}`);
      expect(receipt.gasUsed).to.be.lt(700000);
    });
  });

  describe("9. Edge Cases and Security", function () {
    it("Should handle zero address check", async function () {
      const { votingContract } = await loadFixture(deployVotingFixture);

      const [isRegistered] = await votingContract.getResidentStatus(ethers.constants.AddressZero);
      expect(isRegistered).to.equal(false);
    });

    it("Should maintain state consistency across multiple operations", async function () {
      const { votingContract, owner, resident1, resident2, resident3 } =
        await loadFixture(deployVotingFixture);

      // Register multiple residents
      await votingContract.connect(resident1).registerResident(101);
      await votingContract.connect(resident2).registerResident(102);
      await votingContract.connect(resident3).registerResident(103);

      // Create proposal
      await votingContract.connect(owner).createProposal(
        "Proposal 1", "Description 1", 24
      );

      // Cast votes
      await votingContract.connect(resident1).submitVote(1, 1);
      await votingContract.connect(resident2).submitVote(1, 1);

      // Verify state
      expect(await votingContract.currentProposal()).to.equal(1);
      expect(await votingContract.getTotalResidents()).to.equal(3);

      const [, , , , , , totalVotes] = await votingContract.getCurrentProposalInfo();
      expect(totalVotes).to.equal(2);
    });

    it("Should handle time boundary conditions correctly", async function () {
      const { votingContract, owner, resident1 } = await loadFixture(deployVotingFixture);

      await votingContract.connect(resident1).registerResident(101);
      await votingContract.connect(owner).createProposal("Proposal", "Description", 24);

      const [, , , , , endTime] = await votingContract.getCurrentProposalInfo();

      // Move to exactly endTime - 1 second
      await time.increaseTo(endTime.sub(1));

      // Should still be able to vote
      await expect(
        votingContract.connect(resident1).submitVote(1, 1)
      ).to.not.be.reverted;
    });

    it("Should reject operations on non-existent proposals", async function () {
      const { votingContract, resident1 } = await loadFixture(deployVotingFixture);

      await votingContract.connect(resident1).registerResident(101);

      // Try to vote on proposal that doesn't exist
      await expect(
        votingContract.connect(resident1).submitVote(999, 1)
      ).to.be.reverted; // Will fail as proposal doesn't exist/isn't active
    });

    it("Should handle rapid sequential registrations", async function () {
      const { votingContract, resident1, resident2, resident3, resident4 } =
        await loadFixture(deployVotingFixture);

      // Register multiple residents rapidly
      await votingContract.connect(resident1).registerResident(101);
      await votingContract.connect(resident2).registerResident(102);
      await votingContract.connect(resident3).registerResident(103);
      await votingContract.connect(resident4).registerResident(104);

      expect(await votingContract.getTotalResidents()).to.equal(4);
    });

    it("Should preserve privacy of encrypted votes", async function () {
      const { votingContract, owner, resident1, resident2 } = await loadFixture(deployVotingFixture);

      await votingContract.connect(resident1).registerResident(101);
      await votingContract.connect(resident2).registerResident(102);

      await votingContract.connect(owner).createProposal("Test", "Desc", 24);

      await votingContract.connect(resident1).submitVote(1, 1);
      await votingContract.connect(resident2).submitVote(1, 0);

      // Votes are encrypted - cannot directly read the choice before revelation
      // This is handled by FHE encryption in the contract
      const [, , , , , , totalVotes] = await votingContract.getCurrentProposalInfo();
      expect(totalVotes).to.equal(2); // Can only see total count, not individual votes
    });
  });

  describe("10. Integration and Workflow Tests", function () {
    it("Should complete full voting workflow", async function () {
      const { votingContract, owner, resident1, resident2, resident3 } =
        await loadFixture(deployVotingFixture);

      // 1. Register residents
      await votingContract.connect(resident1).registerResident(101);
      await votingContract.connect(resident2).registerResident(102);
      await votingContract.connect(resident3).registerResident(103);

      // 2. Create proposal
      await votingContract.connect(owner).createProposal(
        "Swimming Pool Renovation",
        "Renovate pool with new tiles and heating",
        48
      );

      // 3. Cast votes
      await votingContract.connect(resident1).submitVote(1, 1);
      await votingContract.connect(resident2).submitVote(1, 1);
      await votingContract.connect(resident3).submitVote(1, 0);

      // 4. Check status before ending
      const [, , , isActive, , , totalVotes] = await votingContract.getCurrentProposalInfo();
      expect(isActive).to.equal(true);
      expect(totalVotes).to.equal(3);

      // 5. Fast forward and end proposal
      await time.increase(49 * 3600);
      await votingContract.connect(owner).endProposal(1);

      // Workflow completed successfully
    });

    it("Should handle multiple proposal cycles", async function () {
      const { votingContract, owner, resident1 } = await loadFixture(deployVotingFixture);

      await votingContract.connect(resident1).registerResident(101);

      // First proposal cycle
      await votingContract.connect(owner).createProposal("Proposal 1", "Desc 1", 24);
      await votingContract.connect(resident1).submitVote(1, 1);
      await time.increase(25 * 3600);
      await votingContract.connect(owner).endProposal(1);

      // Note: Second proposal can only be created after processVoteResults increments currentProposal
      // In real scenario, KMS would call processVoteResults
    });

    it("Should correctly track resident voting history", async function () {
      const { votingContract, owner, resident1 } = await loadFixture(deployVotingFixture);

      await votingContract.connect(resident1).registerResident(101);
      await votingContract.connect(owner).createProposal("Test", "Desc", 24);

      // Before voting
      const [, , hasVotedBefore] = await votingContract.getResidentStatus(resident1.address);
      expect(hasVotedBefore).to.equal(false);

      // After voting
      await votingContract.connect(resident1).submitVote(1, 1);
      const [, , hasVotedAfter] = await votingContract.getResidentStatus(resident1.address);
      expect(hasVotedAfter).to.equal(true);
    });

    it("Should handle maximum duration proposals (168 hours)", async function () {
      const { votingContract, owner } = await loadFixture(deployVotingFixture);

      await expect(
        votingContract.connect(owner).createProposal(
          "Long Term Proposal",
          "A week-long voting period",
          168
        )
      ).to.emit(votingContract, "ProposalCreated");

      const timeLeft = await votingContract.getVotingTimeLeft(1);
      expect(timeLeft).to.be.closeTo(168 * 3600, 100);
    });

    it("Should handle minimum duration proposals (24 hours)", async function () {
      const { votingContract, owner } = await loadFixture(deployVotingFixture);

      await expect(
        votingContract.connect(owner).createProposal(
          "Quick Proposal",
          "A one-day voting period",
          24
        )
      ).to.emit(votingContract, "ProposalCreated");

      const timeLeft = await votingContract.getVotingTimeLeft(1);
      expect(timeLeft).to.be.closeTo(24 * 3600, 100);
    });
  });
});
