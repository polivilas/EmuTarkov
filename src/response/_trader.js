"use strict";

require('../libs.js');

let traders = {};

function getPath(id, sessionID) {
    let path = filepaths.user.profiles.traders[id];
    return path.replace("__REPLACEME__", sessionID);
}

function loadAllTraders(sessionID) {
    let traders = [];

    // load trader files
    for (let file in filepaths.traders) {
        if (file !== "ragfair") {
            traders.push((get(file)).data);
        }
    }

	return {err: 0, errmsg: null, data: traders};
}

function get(id, sessionID) {
    if (typeof traders[id] === "undefined") {
        if (!fs.existsSync(getPath(id, sessionID))) {
            continue;
        }

        traders[id] = json.parse(json.read(getPath(id, sessionID)));
    }

    // find the trader
	if (filepaths.traders.hasOwnProperty(id)) {
        return {err: 0, errmsg: "", data: traders[id]};
    }
    
    // trader not found
    logger.logError("Couldn't find trader of ID " + id);
    return {err: 999, errmsg: "Couldn't find trader of ID " + id, data: null};
}

function setTrader(data, sessionID) {
    traders[data._id] = data;
    return json.write(getPath(data._id, sessionID), data);
}

function lvlUp(id, sessionID) {
    let pmcData = profile_f.getPmcData(sessionID);
    let currentTrader = get(id, sessionID);
    let loyaltyLevels = currentTrader.data.loyalty.loyaltyLevels;

    // level up player
    let checkedExp = 0;

    for (let level in globalSettings.data.config.exp.level.exp_table) {
        if (pmcData.Info.Experience < checkedExp) {
            break;
        }

        pmcData.Info.Level = level;
        checkedExp += globalSettings.data.config.exp.level.exp_table[level].exp;
    }

    // level up traders
    let targetLevel = 0;
    
    for (let level in loyaltyLevels) {
        // level reached
        if ((loyaltyLevels[level].minLevel <= pmcData.Info.Level
            && loyaltyLevels[level].minSalesSum <= currentTrader.data.loyalty.currentSalesSum
            && loyaltyLevels[level].minStanding <= currentTrader.data.loyalty.currentStanding)
            && targetLevel < 4) {
                targetLevel++;
        }

        break;
    }

    currentTrader.data.loyalty.currentLevel = targetLevel;
    setTrader(currentTrader.data, sessionID);

    // set assort
    assort_f.generate(id, sessionID);
}

module.exports.getPath = getPath;
module.exports.loadAllTraders = loadAllTraders;
module.exports.get = get;
module.exports.setTrader = setTrader;
module.exports.lvlUp = lvlUp;