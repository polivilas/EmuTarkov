"use strict";

require('../libs.js');

function acceptQuest(tmpList, body) {
    tmpList.data[0].Quests.push({
		"qid": body.qid.toString(), 
		"startTime": utility.getTimestamp(), 
		"status": 2
	}); 
	// statuses seem as follow - 
	// 1 - not accepted | 
	// 2 - accepted | 
	// 3 - failed | 
	// 4 - completed
    profile.setCharacterData(tmpList);

    item.resetOutput();
    return item.getOutput();

}

function completeQuest(tmpList, body) { 
    // -> Complete quest (need rework for giving back quests)
    item.resetOutput();

    let output = item.getOutput();

    for (let quest of tmpList.data[0].Quests) {
        if (quest.qid === body.qid) {
            quest.status = 4;
            profile.setCharacterData(tmpList);
            break;
        }
    }

    // find Quest data and update trader loyalty
    for (let quest of quests.data) {
        if (quest._id !== body.qid) {
            continue;
        }

        for (let reward of quest.rewards.Success) {
            switch (reward.type) {
                case "Item":
                    for (let rewardItem of reward.items) {
                        let newReq = {};

                        newReq.item_id = rewardItem._tpl;
                        newReq.count = parseInt(reward.value);
                        newReq.tid = "ragfair";
                
                        tmpList = profile.getCharacterData();
                        output = move_f.addItem(tmpList, newReq, output);
                    }
                    break;

                case "Experience":
                    tmpList = profile.getCharacterData();
                    tmpList.data[0].Info.Experience += parseInt(reward.value);
                    profile.setCharacterData(tmpList);
                    break;

                case "TraderStanding":
                    // improve trader standing
                    let tmpTraderInfo = trader.get(quest.traderId);

                    tmpTraderInfo.data.loyalty.currentStanding
                    tmpTraderInfo.data.loyalty.currentStanding = tmpTraderInfo.data.loyalty.currentStanding + parseFloat(reward.value);
                    trader.setTrader(tmpTraderInfo.data);

                    // level up trader
                    trader.lvlUp(quest.traderId);
                    break;
            }
        }
    }

    return output;
}

function handoverQuest(tmpList, body) {
    let counter = 0;
    let found = false;
    item.resetOutput();
    
    for (let itemHandover of body.items) 
    {
        counter += itemHandover.count;
        move_f.removeItem(tmpList, {
			Action: 'Remove', 
			item: itemHandover.id
		});
    }

    for (let backendCounter in tmpList.data[0].BackendCounters) 
    {
        if (backendCounter === body.conditionId) 
        {
            tmpList.data[0].BackendCounters[body.conditionId].value += counter;
            found = true;
        }
    }

    if (!found) {
        tmpList.data[0].BackendCounters[body.conditionId] = {
			"id": body.conditionId, 
			"qid": body.qid, 
			"value": counter
		};
    }

    profile.setCharacterData(tmpList);
    return item.getOutput();
}

module.exports.acceptQuest = acceptQuest;
module.exports.completeQuest = completeQuest;
module.exports.handoverQuest = handoverQuest;