const { ethers } = require("hardhat");

async function main() {
    console.log("\n=== Deploying Fixed Contract ===\n");

    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with account:", deployer.address);

    const balance = await deployer.getBalance();
    console.log("Account balance:", ethers.utils.formatEther(balance), "ETH");

    if (balance.lt(ethers.utils.parseEther("0.01"))) {
        console.log("\n⚠️  WARNING: Low balance. You might need more SepoliaETH");
        console.log("Get testnet ETH from: https://sepoliafaucet.com/");
    }

    console.log("\n📦 Deploying AnonymousPropertyVotingV2Fixed...");

    const Contract = await ethers.getContractFactory("AnonymousPropertyVotingV2Fixed");
    const gatewayAddress = "0x0000000000000000000000000000000000000000"; // No gateway for now
    const contract = await Contract.deploy(gatewayAddress);

    await contract.deployed();

    console.log("\n✅ Contract deployed successfully!");
    console.log("\n📋 Contract Details:");
    console.log("  Address:", contract.address);
    console.log("  Transaction Hash:", contract.deployTransaction.hash);
    console.log("  Block Number:", contract.deployTransaction.blockNumber);
    console.log("  Deployer (Property Manager):", deployer.address);

    console.log("\n🔗 View on Etherscan:");
    console.log("  https://sepolia.etherscan.io/address/" + contract.address);

    console.log("\n⚙️  Next Steps:");
    console.log("  1. Update public/config.js with new contract address:");
    console.log(`     CONTRACT_ADDRESS: "${contract.address}"`);
    console.log("  2. Refresh your frontend (Ctrl + F5)");
    console.log("  3. Reconnect your wallet");
    console.log("  4. Register as resident again");
    console.log("  5. Test creating proposals (with and without votes)");

    console.log("\n📝 Saving deployment info...");

    const fs = require('fs');
    const deploymentInfo = {
        contractName: "AnonymousPropertyVotingV2Fixed",
        address: contract.address,
        deployer: deployer.address,
        transactionHash: contract.deployTransaction.hash,
        blockNumber: contract.deployTransaction.blockNumber,
        deployedAt: new Date().toISOString(),
        network: "sepolia",
        gateway: gatewayAddress,
        note: "Fixed version with forceCloseProposal emergency function, preserves all FHE functionality"
    };

    fs.writeFileSync(
        'deployment-fixed.json',
        JSON.stringify(deploymentInfo, null, 2)
    );

    console.log("✅ Deployment info saved to deployment-fixed.json");

    console.log("\n🎉 Deployment complete!\n");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("\n❌ Deployment failed:", error);
        process.exit(1);
    });
