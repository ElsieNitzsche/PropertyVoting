const { ethers } = require("hardhat");

async function main() {
    console.log("\n=== Checking Account Balance ===\n");

    const [deployer] = await ethers.getSigners();
    const balance = await deployer.getBalance();

    console.log("📋 Account Info:");
    console.log("  Address:", deployer.address);
    console.log("  Balance:", ethers.utils.formatEther(balance), "ETH");

    const requiredBalance = ethers.utils.parseEther("0.05");

    if (balance.lt(requiredBalance)) {
        const shortage = requiredBalance.sub(balance);
        console.log("\n⚠️  Insufficient Balance!");
        console.log("  Required: 0.05 ETH");
        console.log("  Current:", ethers.utils.formatEther(balance), "ETH");
        console.log("  Shortage:", ethers.utils.formatEther(shortage), "ETH");
        console.log("\n💡 Get testnet ETH from:");
        console.log("  🔗 https://sepoliafaucet.com/");
        console.log("  🔗 https://faucet.quicknode.com/ethereum/sepolia");
        console.log("  🔗 https://faucets.chain.link/sepolia");
    } else {
        console.log("\n✅ Balance is sufficient for deployment!");
        console.log("  You can proceed with deployment.");
    }

    console.log("\n");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("\n❌ Error:", error);
        process.exit(1);
    });
