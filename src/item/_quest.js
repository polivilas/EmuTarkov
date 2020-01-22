"use strict";

require('../libs.js');

// statuses seem as follow
// 1 - not accepted
// 2 - accepted
// 3 - failed 
// 4 - completed

function acceptQuest(pmcData, body, sessionID) {
    pmcData.Quests.push({
		"qid": body.qid.toString(), 
		"startTime": utility.getTimestamp(), 
		"status": 2
	}); 
	
    profile_f.setPmcData(pmcData, sessionID);

    // Create a dialog message for starting the quest.
    let questDb = json.parse(json.read(filepaths.quests[body.qid.toString()]));
    let questLocale = json.parse(json.read(filepaths.locales["en"].quest[body.qid.toString()]));
    // Note that for starting quests, the correct locale field is "description", not "startedMessageText".
    dialogue_f.addDialogueMessage(questDb.traderId,
                                  questLocale.description,
                                  dialogue_f.getMessageTypeValue('questStart'),
                                  sessionID);

    item.resetOutput();
    return item.getOutput();
}

function completeQuest(pmcData, body, sessionID) {
    for (let quest in pmcData.Quests) {
        if (pmcData.Quests[quest].qid === body.qid) {
            pmcData.Quests[quest].status = 4;
            profile_f.setPmcData(pmcData, sessionID);
            break;
        }
    }

    // find Quest data and update trader loyalty
    let questRewards = [];
    for (let quest of quests.data) {
        if (quest._id !== body.qid) {
            continue;
        }

        for (let reward of quest.rewards.Success) {
            switch (reward.type) {
                case "Item":
                    for (let rewardItem of reward.items) {
                        // let newReq = {};

                        // newReq.item_id = rewardItem._tpl;
                        // newReq.count = parseInt(reward.value);
                        // newReq.tid = "ragfair";
                
                        questRewards.push(rewardItem);
                    }
                    break;

                case "Experience":
                    pmcData = profile_f.getPmcData(sessionID);
                    pmcData.Info.Experience += parseInt(reward.value);
                    profile_f.setPmcData(pmcData, sessionID);
                    break;

                case "TraderStanding":
                    // improve trader standing
                    let tmpTraderInfo = trader.get(quest.traderId, sessionID);

                    tmpTraderInfo.data.loyalty.currentStanding
                    tmpTraderInfo.data.loyalty.currentStanding = tmpTraderInfo.data.loyalty.currentStanding + parseFloat(reward.value);
                    trader.setTrader(tmpTraderInfo.data, sessionID);

                    // level up trader
                    trader.lvlUp(quest.traderId, sessionID);
                    break;
            }
        }
    }

    // Create a dialog message for completing the quest.
    let questDb = json.parse(json.read(filepaths.quests[body.qid.toString()]));
    let questLocale = json.parse(json.read(filepaths.locales["en"].quest[body.qid.toString()]));
    dialogue_f.addDialogueMessage(questDb.traderId,
                                  questLocale.successMessageText,
                                  dialogue_f.getMessageTypeValue('questSuccess'),
                                  sessionID,
                                  questRewards);

    item.resetOutput();
    let output = item.getOutput();
    output.data.quests = quests.data;
    return output;
}

// TODO: handle money
function handoverQuest(pmcData, body, sessionID) {
    item.resetOutput();
    
    let output = item.getOutput();
    let counter = 0;
    let found = false;
    
    for (let itemHandover of body.items) {
        counter += itemHandover.count;
        output = move_f.removeItem(itemHandover.id, output, sessionID);
    }

    for (let backendCounter in pmcData.BackendCounters) {
        if (backendCounter === body.conditionId) {
            pmcData.BackendCounters[body.conditionId].value += counter;
            found = true;
        }
    }

    if (!found) {
        pmcData.BackendCounters[body.conditionId] = {"id": body.conditionId, "qid": body.qid, "value": counter};
    }

    profile_f.setPmcData(pmcData, sessionID);
    return output;
}

module.exports.acceptQuest = acceptQuest;
module.exports.completeQuest = completeQuest;
module.exports.handoverQuest = handoverQuest;