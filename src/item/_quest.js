"use strict";

require('../libs.js');

var AllQuests = quests;

//// ---- FUNCTIONS BELOW ---- ////

function acceptQuest(tmpList, body) { // -> Accept quest
    tmpList.data[1].Quests.push({
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

function completeQuest(tmpList, body) { // -> Complete quest (need rework for giving back quests)
    for (let quest of tmpList.data[1].Quests) {
        if (quest.qid === body.qid) {
            quest.status = 4;
            break;
        }
    }
    // find Quest data and update trader loyalty
    for (let index in AllQuests.data)
    {
		let quest = AllQuests.data[index];
        if (quest._id === body.qid) 
        {
            for (let reward of quest.rewards.Success) 
            {
                let tmpTraderInfo = trader.get(reward.target);
                if (tmpTraderInfo.err === 0) 
                {
                    let traderLoyalty = tmpTraderInfo.data.loyalty;
                    traderLoyalty.currentStanding += parseFloat(reward.value);
                    trader.get(reward.target).data.loyalty = traderLoyalty;
                    let newLvlTraders = trader.lvlUp(tmpList.data[1].Info.Level);

                    for (let lvlUpTrader in newLvlTraders) 
                    {
                        tmpList.data[1].TraderStandings[lvlUpTrader].currentLevel = trader.get(lvlUpTrader).data.loyalty.currentLevel;
                    }

                    tmpList.data[1].TraderStandings[reward.target].currentStanding += parseFloat(reward.value);

                } else if (reward.type === "Experience") 
                { // get Exp reward
                    tmpList.data[1].Info.Experience += parseInt(reward.value);
                }
            }
        }
    }

    //send reward to the profile : if quest_list.id === bodyqid then quest_list.succes

    profile.setCharacterData(tmpList);

    item.resetOutput();
    return item.getOutput();
}

function handoverQuest(tmpList, body) { // -> Quest handover items
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

    for (let backendCounter in tmpList.data[1].BackendCounters) 
    {
        if (backendCounter === body.conditionId) 
        {
            tmpList.data[1].BackendCounters[body.conditionId].value += counter;
            found = true;
        }
    }

    if (!found) {
        tmpList.data[1].BackendCounters[body.conditionId] = {
			"id": body.conditionId, 
			"qid": body.qid, 
			"value": counter
		};
    }

    profile.setCharacterData(tmpList);
    return item.getOutput();
}



//// ---- EXPORT LIST ---- ////

module.exports.acceptQuest = acceptQuest;
module.exports.completeQuest = completeQuest;
module.exports.handoverQuest = handoverQuest;