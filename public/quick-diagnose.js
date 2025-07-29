// 快速诊断脚本 - 复制到浏览器控制台运行

async function quickDiagnose() {
    console.log('=== 🔍 快速诊断 ===\n');

    try {
        // 获取所有信息
        const manager = await contract.propertyManager();
        const [proposalId, title, description, isActive, startTime, endTime, totalVotes] =
            await contract.getCurrentProposalInfo();
        const propId = Number(proposalId.toString());
        const [resultsRevealed] = await contract.getProposalResults(propId);

        const currentTime = Math.floor(Date.now() / 1000);
        const endTimeNum = Number(endTime.toString());

        console.log('Owner:', manager);
        console.log('当前用户:', userAddress);
        console.log('匹配:', manager.toLowerCase() === userAddress.toLowerCase());
        console.log('');

        console.log('Proposal ID:', propId);
        console.log('Title:', title);
        console.log('isActive:', isActive);
        console.log('');

        console.log('结束时间:', new Date(endTimeNum * 1000).toLocaleString());
        console.log('当前时间:', new Date(currentTime * 1000).toLocaleString());
        console.log('时间已过:', currentTime > endTimeNum);
        console.log('时间差(秒):', currentTime - endTimeNum);
        console.log('');

        console.log('resultsRevealed:', resultsRevealed);
        console.log('');

        // 关键检查
        console.log('=== 检查结果 ===');
        if (manager.toLowerCase() !== userAddress.toLowerCase()) {
            console.log('❌ 不是 owner');
        } else {
            console.log('✅ 是 owner');
        }

        if (currentTime <= endTimeNum) {
            console.log('❌ 投票期未结束，还剩', Math.floor((endTimeNum - currentTime) / 60), '分钟');
        } else {
            console.log('✅ 投票期已结束');
        }

        if (resultsRevealed) {
            console.log('❌ 结果已公布');
        } else {
            console.log('✅ 结果未公布');
        }

        if (!isActive) {
            console.log('❌ Proposal 未激活');
        } else {
            console.log('✅ Proposal 激活');
        }

    } catch (error) {
        console.error('诊断失败:', error);
    }
}

quickDiagnose();
