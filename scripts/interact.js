const hre = require("hardhat");

async function main() {
  const contractAddress = process.env.CONTRACT_ADDRESS || "0x6Ece9C29F6E47876bC3809BAC99c175273E184aB";

  if (!contractAddress) {
    throw new Error("Please set CONTRACT_ADDRESS in .env file");
  }

  console.log("Interacting with AnonymousPropertyVoting:", contractAddress);
  console.log("=====================================================\n");

  const [signer] = await hre.ethers.getSigners();
  const contract = await hre.ethers.getContractAt("AnonymousPropertyVoting", contractAddress);

  try {
    // Check property manager
    const propertyManager = await contract.propertyManager();
    console.log("Contract Information:");
    console.log("  Property Manager:", propertyManager);
    console.log("  Current Account:", signer.address);
    console.log("  Is Manager:", propertyManager === signer.address);
    console.log();

    // Check current proposal
    const currentProposal = await contract.currentProposal();
    console.log("  Current Proposal ID:", currentProposal.toString());

    // Get total residents
    const totalResidents = await contract.getTotalResidents();
    console.log("  Total Registered Residents:", totalResidents.toString());
    console.log();

    // Check if current account is registered
    const [isRegistered, registrationTime, hasVotedCurrent] =
      await contract.getResidentStatus(signer.address);

    console.log("Current Account Status:");
    console.log("  Is Registered:", isRegistered);
    if (isRegistered) {
      console.log("  Registration Time:", new Date(registrationTime.toNumber() * 1000).toLocaleString());
      console.log("  Has Voted on Current Proposal:", hasVotedCurrent);
    }
    console.log();

    // Get current proposal info if exists
    try {
      const [proposalId, title, description, isActive, startTime, endTime, totalVotes] =
        await contract.getCurrentProposalInfo();

      if (title && title.length > 0) {
        console.log("Current Proposal Information:");
        console.log("  Proposal ID:", proposalId.toString());
        console.log("  Title:", title);
        console.log("  Description:", description);
        console.log("  Is Active:", isActive);
        console.log("  Start Time:", new Date(startTime.toNumber() * 1000).toLocaleString());
        console.log("  End Time:", new Date(endTime.toNumber() * 1000).toLocaleString());
        console.log("  Total Votes:", totalVotes.toString());
        console.log();

        // Check voting time left
        const timeLeft = await contract.getVotingTimeLeft(proposalId);
        const votingActive = await contract.isVotingActive(proposalId);

        console.log("Voting Status:");
        console.log("  Is Voting Active:", votingActive);
        console.log("  Time Left:", formatTimeLeft(timeLeft));
        console.log();

        // Check results if available
        try {
          const [resultsRevealed, totalResultVotes, yesVotes, noVotes, approved] =
            await contract.getProposalResults(proposalId);

          if (resultsRevealed) {
            console.log("Proposal Results:");
            console.log("  Results Revealed:", resultsRevealed);
            console.log("  Total Votes:", totalResultVotes.toString());
            console.log("  Yes Votes:", yesVotes.toString());
            console.log("  No Votes:", noVotes.toString());
            console.log("  Approved:", approved);
            console.log();
          }
        } catch (error) {
          // Results not yet revealed
        }
      }
    } catch (error) {
      console.log("No active proposal found or error retrieving proposal info");
      console.log();
    }

    // Display available actions
    console.log("=====================================================");
    console.log("Available Actions:");
    console.log();

    if (propertyManager === signer.address) {
      console.log("As Property Manager, you can:");
      console.log("  - createProposal(title, description, votingDurationHours)");
      console.log("  - endProposal(proposalId)");
      console.log();
      console.log("Example:");
      console.log("  npx hardhat run scripts/createProposal.js --network sepolia");
    }

    if (!isRegistered) {
      console.log("As an unregistered user, you can:");
      console.log("  - registerResident(unitNumber)");
      console.log();
      console.log("Example:");
      console.log("  npx hardhat run scripts/register.js --network sepolia");
    } else {
      console.log("As a registered resident, you can:");
      console.log("  - submitVote(proposalId, voteChoice)");
      console.log("    Vote choices: 0 = No, 1 = Yes");
      console.log();
      console.log("Example:");
      console.log("  npx hardhat run scripts/vote.js --network sepolia");
    }

    console.log();
    console.log("View functions:");
    console.log("  - getCurrentProposalInfo()");
    console.log("  - getResidentStatus(address)");
    console.log("  - getProposalResults(proposalId)");
    console.log("  - getVotingTimeLeft(proposalId)");
    console.log("  - isVotingActive(proposalId)");
    console.log("  - getTotalResidents()");
    console.log();

    console.log("Interaction completed successfully!");

  } catch (error) {
    console.error("Error during interaction:");
    console.error(error.message);
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
