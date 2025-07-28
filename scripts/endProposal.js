const { ethers } = require("hardhat");

async function main() {
    console.log("\n=== Ending Expired Proposal ===\n");

    // Contract address
    const contractAddress = "0x6Ece9C29F6E47876bC3809BAC99c175273E184aB";

    // Get signer
    const [signer] = await ethers.getSigners();
    console.log("Using account:", signer.address);

    // Get contract instance
    const contract = await ethers.getContractAt("AnonymousPropertyVoting", contractAddress);

    // Get current proposal info
    console.log("\n📋 Current Proposal Info:");
    const proposalInfo = await contract.getCurrentProposalInfo();
    const proposalId = proposalInfo[0];
    const title = proposalInfo[1];
    const description = proposalInfo[2];
    const isActive = proposalInfo[3];

    console.log("  Proposal ID:", proposalId.toString());
    console.log("  Title:", title);
    console.log("  Description:", description);
    console.log("  Is Active:", isActive);

    if (proposalId.toString() === "0") {
        console.log("\n❌ No proposal to end.");
        return;
    }

    // Check if voting is active
    const isVotingActive = await contract.isVotingActive(proposalId);
    console.log("  Is Voting Active:", isVotingActive);

    // Check current results
    const results = await contract.getProposalResults(proposalId);
    console.log("\n📊 Current Results:");
    console.log("  Results Revealed:", results[0]);
    console.log("  Total Votes:", results[1].toString());
    console.log("  Yes Votes:", results[2].toString());
    console.log("  No Votes:", results[3].toString());

    if (results[0]) {
        console.log("\n✅ Proposal already ended (results revealed)");
        return;
    }

    // Confirm before ending
    console.log("\n⚠️  About to end proposal:", title);
    console.log("Press Ctrl+C to cancel, or wait 5 seconds to continue...\n");

    await new Promise(resolve => setTimeout(resolve, 5000));

    // End proposal
    console.log("🛑 Calling endProposal()...");
    const tx = await contract.endProposal(proposalId, {
        gasLimit: 500000 // Set explicit gas limit
    });

    console.log("Transaction hash:", tx.hash);
    console.log("Waiting for confirmation...");

    const receipt = await tx.wait();
    console.log("✅ Transaction confirmed in block:", receipt.blockNumber);

    // Get updated results
    const updatedResults = await contract.getProposalResults(proposalId);
    console.log("\n📊 Updated Results:");
    console.log("  Results Revealed:", updatedResults[0]);
    console.log("  Total Votes:", updatedResults[1].toString());
    console.log("  Yes Votes:", updatedResults[2].toString());
    console.log("  No Votes:", updatedResults[3].toString());
    console.log("  Approved:", updatedResults[4]);

    console.log("\n✅ Proposal ended successfully!");
    console.log("You can now create a new proposal.\n");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("\n❌ Error:", error);
        process.exit(1);
    });
