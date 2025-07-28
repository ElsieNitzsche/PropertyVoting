const { run } = require("hardhat");
require("dotenv").config();

async function main() {
    console.log("========================================");
    console.log("Contract Verification Script");
    console.log("========================================\n");

    // Read contract address from environment or deployment file
    let contractAddress = process.env.VOTING_CONTRACT_ADDRESS;
    let gatewayAddress = process.env.GATEWAY_CONTRACT_ADDRESS || "0x0000000000000000000000000000000000000000";

    // Try to read from deployment file if not in env
    if (!contractAddress) {
        try {
            const fs = require("fs");
            const deploymentInfo = JSON.parse(fs.readFileSync("./deployment-info.json", "utf8"));
            contractAddress = deploymentInfo.address;
            gatewayAddress = deploymentInfo.gatewayAddress;
            console.log("📄 Loaded deployment info from deployment-info.json\n");
        } catch (error) {
            console.error("❌ Error: Contract address not found");
            console.error("Please set VOTING_CONTRACT_ADDRESS in .env or ensure deployment-info.json exists");
            process.exit(1);
        }
    }

    console.log(`Contract Address: ${contractAddress}`);
    console.log(`Gateway Address: ${gatewayAddress}\n`);

    console.log("Starting verification on Etherscan...\n");

    try {
        await run("verify:verify", {
            address: contractAddress,
            constructorArguments: [gatewayAddress],
        });

        console.log("\n========================================");
        console.log("✅ Verification Successful!");
        console.log("========================================\n");
        console.log(`View on Etherscan: https://sepolia.etherscan.io/address/${contractAddress}#code\n`);

    } catch (error) {
        if (error.message.includes("Already Verified")) {
            console.log("\n========================================");
            console.log("✅ Contract Already Verified!");
            console.log("========================================\n");
            console.log(`View on Etherscan: https://sepolia.etherscan.io/address/${contractAddress}#code\n`);
        } else {
            console.error("\n❌ Verification Failed:");
            console.error(error.message);
            console.error("\nTroubleshooting:");
            console.error("1. Ensure ETHERSCAN_API_KEY is set in .env");
            console.error("2. Wait a few seconds after deployment before verifying");
            console.error("3. Verify the contract address and constructor arguments are correct");
            process.exit(1);
        }
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
