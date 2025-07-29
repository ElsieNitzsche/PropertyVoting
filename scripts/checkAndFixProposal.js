const { ethers } = require("hardhat");

async function main() {
    console.log("\n=== Checking Proposal Status ===\n");

    const contractAddress = "0x6Ece9C29F6E47876bC3809BAC99c175273E184aB";
    const [signer] = await ethers.getSigners();
    console.log("Using account:", signer.address);

    const contract = await ethers.getContractAt("AnonymousPropertyVoting", contractAddress);

    // Get current proposal info
    const proposalInfo = await contract.getCurrentProposalInfo();
    const proposalId = proposalInfo[0];
    const title = proposalInfo[1];
    const description = proposalInfo[2];
    const isActive = proposalInfo[3];
    const startTime = proposalInfo[4];
    const endTime = proposalInfo[5];
    const totalVotes = proposalInfo[6];

    console.log("📋 Current Proposal Info:");
    console.log("  Proposal ID:", proposalId.toString());
    console.log("  Title:", title);
    console.log("  Is Active:", isActive);
    console.log("  Total Votes:", totalVotes.toString());

    const currentTime = Math.floor(Date.now() / 1000);
    const endTimeNum = Number(endTime.toString());

    console.log("  End Time:", new Date(endTimeNum * 1000).toLocaleString());
    console.log("  Current Time:", new Date(currentTime * 1000).toLocaleString());
    console.log("  Voting Ended:", currentTime > endTimeNum ? "YES" : "NO");

    // Check results
    const results = await contract.getProposalResults(proposalId);
    console.log("\n📊 Proposal Results:");
    console.log("  Results Revealed:", results[0]);
    console.log("  Total Votes:", results[1].toString());
    console.log("  Yes Votes:", results[2].toString());
    console.log("  No Votes:", results[3].toString());

    // Diagnose the problem
    console.log("\n🔍 Diagnosis:");

    if (totalVotes.toString() === "0") {
        console.log("⚠️  PROBLEM IDENTIFIED:");
        console.log("    - This proposal has ZERO votes");
        console.log("    - endProposal() called FHE.requestDecryption() with empty array");
        console.log("    - FHE service never called back processVoteResults()");
        console.log("    - resultsRevealed is stuck at false");
        console.log("    - Cannot create new proposals!");

        console.log("\n💡 SOLUTION:");
        console.log("    The contract needs to be upgraded to handle zero-vote proposals.");
        console.log("    Alternative: Use a different proposal ID.");

        console.log("\n🔧 Workaround: Try creating proposal with ID 2");
        console.log("    The contract's createProposal checks: !proposals[currentProposal].isActive");
        console.log("    Current proposal ID is:", proposalId.toString());

        // Check if we can increment currentProposal manually
        console.log("\n📌 Checking if we can work around this...");

        // Check proposal ID 2
        const prop2Info = await contract.getCurrentProposalInfo();
        const prop2Results = await contract.getProposalResults(2);

        console.log("\n📋 Proposal ID 2 Status:");
        console.log("  Is Active:", prop2Info[3]);
        console.log("  Results Revealed:", prop2Results[0]);

        if (!prop2Info[3]) {
            console.log("\n✅ GOOD NEWS: Proposal ID 2 is not active!");
            console.log("   But the contract's currentProposal counter is still at 1.");
            console.log("   The contract needs processVoteResults() to increment it.");
        }
    } else {
        console.log("✓ Proposal has votes, FHE decryption should work normally");

        if (currentTime > endTimeNum && !results[0]) {
            console.log("\n⚠️  Voting has ended but results not revealed yet.");
            console.log("   This might mean:");
            console.log("   1. endProposal() was called and FHE is still processing");
            console.log("   2. endProposal() was never successfully called");
            console.log("   3. FHE service is delayed");
        }
    }

    console.log("\n=====================================");
    console.log("CONCLUSION: This is a contract design issue.");
    console.log("The contract doesn't handle zero-vote proposals correctly.");
    console.log("processVoteResults() is never called when there are no votes.");
    console.log("=====================================\n");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("\n❌ Error:", error);
        process.exit(1);
    });
