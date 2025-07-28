const { ethers } = require("hardhat");
require("dotenv").config();

async function main() {
    console.log("========================================");
    console.log("Property Voting System Deployment");
    console.log("========================================\n");

    // Get deployment account
    const [deployer] = await ethers.getSigners();
    console.log(`Deployer Account: ${deployer.address}`);

    const balance = await deployer.getBalance();
    console.log(`Account Balance: ${ethers.utils.formatEther(balance)} ETH\n`);

    if (balance.eq(0)) {
        throw new Error("Insufficient balance for deployment");
    }

    // Read optional gateway address
    const gatewayAddress = process.env.GATEWAY_CONTRACT_ADDRESS || ethers.constants.AddressZero;

    if (gatewayAddress === ethers.constants.AddressZero) {
        console.log("⚠️  No gateway address configured");
        console.log("Deployment Mode: Standalone (identical to original behavior)\n");
    } else {
        console.log(`✅ Gateway Address: ${gatewayAddress}`);
        console.log("Deployment Mode: Gateway-integrated (enhanced security)\n");

        // Verify gateway contract
        const gatewayCode = await ethers.provider.getCode(gatewayAddress);
        if (gatewayCode === "0x" || gatewayCode === "0x0") {
            throw new Error("No contract code at gateway address, please verify the address");
        }
        console.log("✅ Gateway contract verified\n");
    }

    // Deploy voting contract
    console.log("Deploying AnonymousPropertyVotingV2...");
    const VotingV2 = await ethers.getContractFactory("AnonymousPropertyVotingV2");

    const voting = await VotingV2.deploy(gatewayAddress);
    console.log(`Transaction submitted: ${voting.deployTransaction.hash}`);

    await voting.deployed();
    console.log(`✅ AnonymousPropertyVotingV2 deployed to: ${voting.address}\n`);

    // Verify deployment
    console.log("Verifying contract deployment...");

    // Verify admin
    const propertyManager = await voting.propertyManager();
    console.log(`✅ Property Manager: ${propertyManager}`);

    if (propertyManager.toLowerCase() !== deployer.address.toLowerCase()) {
        throw new Error("Property manager address mismatch");
    }

    // Verify current proposal ID
    const currentProposal = await voting.currentProposal();
    console.log(`✅ Current Proposal ID: ${currentProposal}`);

    if (Number(currentProposal) !== 1) {
        throw new Error("Initial proposal ID should be 1");
    }

    // Verify gateway configuration
    const configuredGateway = await voting.gateway();
    console.log(`✅ Configured Gateway: ${configuredGateway}`);

    if (configuredGateway.toLowerCase() !== gatewayAddress.toLowerCase()) {
        throw new Error("Gateway address mismatch");
    }

    // Get version info
    const [version, features] = await voting.getVersionInfo();
    console.log(`✅ Version: ${version}`);
    console.log(`✅ Features: ${features}\n`);

    // Test decryption permission (if gateway configured)
    if (gatewayAddress !== ethers.constants.AddressZero) {
        try {
            const isAllowed = await voting.isDecryptionAllowed();
            console.log(`✅ Decryption Permission: ${isAllowed ? "Allowed" : "Not Allowed"}\n`);
        } catch (error) {
            console.log(`⚠️  Decryption permission check failed: ${error.message}\n`);
        }
    }

    // Verify FHE functions
    console.log("Verifying core function interfaces...");

    const functionsToCheck = [
        "registerResident",
        "createProposal",
        "submitVote",
        "endProposal",
        "processVoteResults",
        "getCurrentProposalInfo",
        "getResidentStatus",
        "getProposalResults",
        "getTotalResidents",
        "getVotingTimeLeft",
        "isVotingActive"
    ];

    for (const func of functionsToCheck) {
        const exists = typeof voting[func] === "function";
        const status = exists ? "✅" : "❌";
        console.log(`  ${status} ${func}`);

        if (!exists) {
            throw new Error(`Missing required function: ${func}`);
        }
    }

    console.log("\nAll core functions verified!\n");

    // Save deployment info
    const deploymentInfo = {
        network: (await ethers.provider.getNetwork()).name,
        chainId: (await ethers.provider.getNetwork()).chainId,
        contract: "AnonymousPropertyVotingV2",
        address: voting.address,
        deployer: deployer.address,
        propertyManager: propertyManager,
        gatewayAddress: configuredGateway,
        deploymentMode: gatewayAddress === ethers.constants.AddressZero ? "standalone" : "gateway-integrated",
        deploymentHash: voting.deployTransaction.hash,
        blockNumber: voting.deployTransaction.blockNumber,
        timestamp: new Date().toISOString(),
        version: version,
        features: features,
        fheFunctions: {
            registerResident: "FHE.asEuint8 with auto re-randomization",
            submitVote: "FHE.asEuint8 with auto re-randomization",
            endProposal: "FHE.requestDecryption with gateway validation",
            processVoteResults: "FHE.checkSignatures"
        }
    };

    const fs = require("fs");
    const deploymentPath = "./deployment-info.json";
    fs.writeFileSync(
        deploymentPath,
        JSON.stringify(deploymentInfo, null, 2)
    );

    console.log(`Deployment info saved to: ${deploymentPath}\n`);

    // Output environment variable suggestion
    console.log("========================================");
    console.log("Add the following to your .env file:");
    console.log("========================================");
    console.log(`VOTING_CONTRACT_ADDRESS=${voting.address}`);
    console.log("========================================\n");

    // Output verification command
    const networkName = (await ethers.provider.getNetwork()).name;
    console.log("Contract Verification Command (Etherscan):");
    console.log("========================================");
    console.log(`npx hardhat verify --network ${networkName} ${voting.address} ${gatewayAddress}`);
    console.log("========================================\n");

    // Output usage instructions
    console.log("📋 Usage Instructions:");
    console.log("========================================");
    console.log("1. Register Resident:");
    console.log(`   voting.registerResident(unitNumber)`);
    console.log("");
    console.log("2. Create Proposal (Admin only):");
    console.log(`   voting.createProposal(title, description, votingDurationHours)`);
    console.log("");
    console.log("3. Submit Vote:");
    console.log(`   voting.submitVote(proposalId, voteChoice) // 0=Against, 1=For`);
    console.log("");
    console.log("4. End Proposal (Admin only):");
    console.log(`   voting.endProposal(proposalId)`);
    console.log("");
    console.log("5. Query Results:");
    console.log(`   voting.getProposalResults(proposalId)`);
    console.log("========================================\n");

    // Output security features
    console.log("🔒 Security Features (fhEVM v0.6.0):");
    console.log("========================================");
    console.log("✨ Automatic Input Re-randomization");
    console.log("   - Executed automatically before all FHE operations");
    console.log("   - Fully transparent to users");
    console.log("");
    console.log("✨ sIND-CPAD Security");
    console.log("   - Prevents ciphertext analysis attacks");
    console.log("   - Automatic protection");
    console.log("");
    if (gatewayAddress !== ethers.constants.AddressZero) {
        console.log("✨ Gateway Validation Protection");
        console.log("   - Decryption requests require gateway approval");
        console.log("   - Uses new is... validation pattern");
        console.log("");
    }
    console.log("✅ All original FHE functionality preserved");
    console.log("========================================\n");

    console.log("🎉 Deployment Successful!\n");

    return voting.address;
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("\n❌ Deployment Failed:");
        console.error(error);
        process.exit(1);
    });
