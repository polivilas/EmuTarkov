"use strict";

require('../libs.js');



//// ---- FUNCTIONS BELOW ---- ////

function acceptQuest(tmpList, body) { // -> Accept quest
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

function completeQuest(tmpList, body) 
{ // -> Complete quest (need rework for giving back quests)
    
    item.resetOutput();

    for (let quest of tmpList.data[0].Quests) 
    {
        if (quest.qid === body.qid) 
        {
            quest.status = 4;
            profile.setCharacterData(tmpList);
            tmpList = profile.getCharacterData();
            break;
        }
    }

    // find Quest data and update trader loyalty
    for (let quest of quests.data)
    {
        if (quest._id === body.qid) 
        {
            for (let reward of quest.rewards.Success) 
            {
                switch(reward.type)
                {
                    case "Item":

                        for(let rewardItem of reward.items)
                        {
                            /*
                            if(rewardItem.parentId == "hideout" || rewardItem.parentId === undefined )
                            {
                                let newReq = {};
                                newReq.item_id = rewardItem._tpl;
                                newReq.count = reward.value;
                    
                                profile.addItemToStash(tmpList, newReq);
                            }
                            else
                            {
                                tmpList.Inventory.items.push(rewardItem);
                            }
                            */

                            let newReq = {};
                            newReq.item_id = rewardItem._tpl;
                            newReq.count = reward.value;
                    
                            profile.addItemToStash(tmpList, newReq);
                            tmpList = profile.getCharacterData(); //update it everytime otherwise every given items are deleted

                        }
                        break;

                    case "Experience":
                        tmpList.data[0].Info.Experience += parseInt(reward.value);
                        profile.setCharacterData(tmpList);
                        tmpList = profile.getCharacterData();// update it because it will be overrided otherwise

                        break;

                    case "TraderStanding":
                        break;

                }
                /*
                let tmpTraderInfo = trader.get(reward.target);
                if (tmpTraderInfo.err === 0) 
                {
                    let traderLoyalty = tmpTraderInfo.data.loyalty;
                    traderLoyalty.currentStanding += parseFloat(reward.value);
                    trader.get(reward.target).data.loyalty = traderLoyalty;
                    let newLvlTraders = trader.lvlUp(tmpList.data[0].Info.Level);

                    for (let lvlUpTrader in newLvlTraders) 
                    {
                        tmpList.data[0].TraderStandings[lvlUpTrader].currentLevel = trader.get(lvlUpTrader).data.loyalty.currentLevel;
                    }

                    tmpList.data[0].TraderStandings[reward.target].currentStanding += parseFloat(reward.value);
                    
                } else if (reward.type === "Experience") 
                { // get Exp reward
                    tmpList.data[0].Info.Experience += parseInt(reward.value);
                }
                */
            }
        }
    }

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



//// ---- EXPORT LIST ---- ////

module.exports.acceptQuest = acceptQuest;
module.exports.completeQuest = completeQuest;
module.exports.handoverQuest = handoverQuest;