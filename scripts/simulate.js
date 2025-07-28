const hre = require("hardhat");

async function main() {
  console.log("Running Anonymous Property Voting Simulation...\n");
  console.log("=====================================================");

  const contractAddress = process.env.CONTRACT_ADDRESS || "0x6Ece9C29F6E47876bC3809BAC99c175273E184aB";

  if (!contractAddress) {
    throw new Error("Please set CONTRACT_ADDRESS in .env file");
  }

  const [owner, resident1, resident2, resident3, resident4, resident5] = await hre.ethers.getSigners();
  const contract = await hre.ethers.getContractAt("AnonymousPropertyVoting", contractAddress);

  try {
    console.log("\nParticipating Accounts:");
    console.log("  Property Manager:", owner.address);
    console.log("  Resident 1:", resident1.address);
    console.log("  Resident 2:", resident2.address);
    console.log("  Resident 3:", resident3.address);
    console.log("  Resident 4:", resident4.address);
    console.log("  Resident 5:", resident5.address);
    console.log();

    // Check if residents are already registered
    const [isReg1] = await contract.getResidentStatus(resident1.address);
    const [isReg2] = await contract.getResidentStatus(resident2.address);
    const [isReg3] = await contract.getResidentStatus(resident3.address);
    const [isReg4] = await contract.getResidentStatus(resident4.address);
    const [isReg5] = await contract.getResidentStatus(resident5.address);

    // Step 1: Register Residents
    console.log("Step 1: Registering Community Residents...");
    console.log("=====================================================");

    if (!isReg1) {
      let tx = await contract.connect(resident1).registerResident(101);
      await tx.wait();
      console.log("  Resident 1 registered (Unit 101)");
    } else {
      console.log("  Resident 1 already registered");
    }

    if (!isReg2) {
      let tx = await contract.connect(resident2).registerResident(102);
      await tx.wait();
      console.log("  Resident 2 registered (Unit 102)");
    } else {
      console.log("  Resident 2 already registered");
    }

    if (!isReg3) {
      let tx = await contract.connect(resident3).registerResident(103);
      await tx.wait();
      console.log("  Resident 3 registered (Unit 103)");
    } else {
      console.log("  Resident 3 already registered");
    }

    if (!isReg4) {
      let tx = await contract.connect(resident4).registerResident(104);
      await tx.wait();
      console.log("  Resident 4 registered (Unit 104)");
    } else {
      console.log("  Resident 4 already registered");
    }

    if (!isReg5) {
      let tx = await contract.connect(resident5).registerResident(105);
      await tx.wait();
      console.log("  Resident 5 registered (Unit 105)");
    } else {
      console.log("  Resident 5 already registered");
    }

    const totalResidents = await contract.getTotalResidents();
    console.log(`\n  Total Registered Residents: ${totalResidents.toString()}`);
    console.log();

    // Step 2: Create Proposal
    console.log("Step 2: Creating Community Proposal...");
    console.log("=====================================================");

    const votingDuration = 48; // 48 hours (2 days)

    // Check if there's an active proposal
    let [, title, , isActive] = await contract.getCurrentProposalInfo();

    if (!isActive || !title || title.length === 0) {
      let tx = await contract.connect(owner).createProposal(
        "Swimming Pool Renovation",
        "Renovate the community swimming pool with new tiles, modern filtration system, and energy-efficient heating. Estimated cost: $50,000. Expected completion: 3 months.",
        votingDuration
      );
      await tx.wait();
      console.log("  Proposal Created: 'Swimming Pool Renovation'");
      console.log("  Duration: 48 hours (2 days)");
      console.log("  Description: Pool renovation with new tiles and heating");
    } else {
      console.log("  Active proposal already exists:", title);
    }
    console.log();

    // Step 3: Display Proposal Information
    console.log("Step 3: Proposal Details...");
    console.log("=====================================================");

    [proposalId, title, description, isActive, startTime, endTime, totalVotes] =
      await contract.getCurrentProposalInfo();

    console.log("  Proposal ID:", proposalId.toString());
    console.log("  Title:", title);
    console.log("  Description:", description);
    console.log("  Status:", isActive ? "Active" : "Closed");
    console.log("  Start:", new Date(startTime.toNumber() * 1000).toLocaleString());
    console.log("  End:", new Date(endTime.toNumber() * 1000).toLocaleString());
    console.log("  Current Total Votes:", totalVotes.toString());
    console.log();

    // Step 4: Cast Anonymous Votes
    console.log("Step 4: Casting Anonymous Encrypted Votes...");
    console.log("=====================================================");

    const votingActive = await contract.isVotingActive(proposalId);

    if (votingActive) {
      // Check who has already voted
      const [, , hasVoted1] = await contract.getResidentStatus(resident1.address);
      const [, , hasVoted2] = await contract.getResidentStatus(resident2.address);
      const [, , hasVoted3] = await contract.getResidentStatus(resident3.address);
      const [, , hasVoted4] = await contract.getResidentStatus(resident4.address);
      const [, , hasVoted5] = await contract.getResidentStatus(resident5.address);

      // Resident 1: Yes (1)
      if (!hasVoted1) {
        let tx = await contract.connect(resident1).submitVote(proposalId, 1);
        await tx.wait();
        console.log("  Resident 1 voted YES (encrypted)");
      } else {
        console.log("  Resident 1 already voted");
      }

      // Resident 2: Yes (1)
      if (!hasVoted2) {
        let tx = await contract.connect(resident2).submitVote(proposalId, 1);
        await tx.wait();
        console.log("  Resident 2 voted YES (encrypted)");
      } else {
        console.log("  Resident 2 already voted");
      }

      // Resident 3: No (0)
      if (!hasVoted3) {
        let tx = await contract.connect(resident3).submitVote(proposalId, 0);
        await tx.wait();
        console.log("  Resident 3 voted NO (encrypted)");
      } else {
        console.log("  Resident 3 already voted");
      }

      // Resident 4: Yes (1)
      if (!hasVoted4) {
        let tx = await contract.connect(resident4).submitVote(proposalId, 1);
        await tx.wait();
        console.log("  Resident 4 voted YES (encrypted)");
      } else {
        console.log("  Resident 4 already voted");
      }

      // Resident 5: Yes (1)
      if (!hasVoted5) {
        let tx = await contract.connect(resident5).submitVote(proposalId, 1);
        await tx.wait();
        console.log("  Resident 5 voted YES (encrypted)");
      } else {
        console.log("  Resident 5 already voted");
      }

      console.log("\n  All votes are encrypted with FHE!");
      console.log("  Individual vote choices remain private");
    } else {
      console.log("  Voting period has ended");
    }
    console.log();

    // Step 5: View Current Status
    console.log("Step 5: Current Voting Status...");
    console.log("=====================================================");

    [, , , , , , totalVotes] = await contract.getCurrentProposalInfo();
    const timeLeft = await contract.getVotingTimeLeft(proposalId);
    const stillActive = await contract.isVotingActive(proposalId);

    console.log("  Total Votes Cast:", totalVotes.toString());
    console.log("  Voting Still Active:", stillActive);
    console.log("  Time Remaining:", formatTimeLeft(timeLeft));
    console.log();

    // Step 6: Results (if revealed)
    console.log("Step 6: Checking Results...");
    console.log("=====================================================");

    try {
      const [resultsRevealed, totalResultVotes, yesVotes, noVotes, approved] =
        await contract.getProposalResults(proposalId);

      if (resultsRevealed) {
        console.log("  Results Revealed: YES");
        console.log("  Total Votes:", totalResultVotes.toString());
        console.log("  Yes Votes:", yesVotes.toString());
        console.log("  No Votes:", noVotes.toString());
        console.log("  Proposal Status:", approved ? "APPROVED" : "REJECTED");
        console.log();

        const approval_percentage = totalResultVotes > 0
          ? (yesVotes.toNumber() / totalResultVotes.toNumber() * 100).toFixed(1)
          : 0;

        console.log(`  Approval Rate: ${approval_percentage}%`);
      } else {
        console.log("  Results Not Yet Revealed");
        console.log();
        console.log("  To reveal results:");
        console.log("  1. Wait for voting period to end");
        console.log("  2. Property manager calls: endProposal(proposalId)");
        console.log("  3. KMS processes and calls: processVoteResults()");
        console.log("  4. Results become publicly visible");
      }
    } catch (error) {
      console.log("  Results not available or error:", error.message);
    }
    console.log();

    // Step 7: Simulation Summary
    console.log("Step 7: Simulation Summary...");
    console.log("=====================================================");

    console.log("\n  Complete Voting Workflow Demonstrated:");
    console.log("  1. Registered 5 residents with unit numbers");
    console.log("  2. Property manager created proposal");
    console.log("  3. Residents cast encrypted anonymous votes");
    console.log("  4. Vote totals tracked (individual votes private)");
    console.log("  5. Results reveal requires KMS interaction");
    console.log();

    console.log("  Privacy Features:");
    console.log("  - All votes encrypted with FHE (Fully Homomorphic Encryption)");
    console.log("  - Individual vote choices remain private");
    console.log("  - Only aggregate results are revealed");
    console.log("  - No one can determine how any individual voted");
    console.log();

    console.log("  Next Steps for Production:");
    console.log("  - Wait for voting period to end");
    console.log("  - Call endProposal() as property manager");
    console.log("  - KMS will decrypt and reveal results");
    console.log("  - View final results with getProposalResults()");
    console.log();

    console.log("Simulation completed successfully!");
    console.log("=====================================================\n");

  } catch (error) {
    console.error("\nError during simulation:");
    console.error(error.message);
    if (error.reason) console.error("Reason:", error.reason);
    process.exit(1);
  }
}

function formatTimeLeft(seconds) {
  const sec = seconds.toNumber();
  if (sec === 0) return "Voting ended";

  const days = Math.floor(sec / 86400);
  const hours = Math.floor((sec % 86400) / 3600);
  const minutes = Math.floor((sec % 3600) / 60);

  let result = [];
  if (days > 0) result.push(`${days} day${days > 1 ? 's' : ''}`);
  if (hours > 0) result.push(`${hours} hour${hours > 1 ? 's' : ''}`);
  if (minutes > 0) result.push(`${minutes} minute${minutes > 1 ? 's' : ''}`);

  return result.join(', ') || "Less than a minute";
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
