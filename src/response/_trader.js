"use strict";

require('../libs.js');

function getPath(id, sessionID) {
    let path = filepaths.user.profiles.traders[id];
    return path.replace("__REPLACEME__", sessionID);
}

function loadAllTraders(sessionID) {
    let traders = [];

    // load trader files
    for (let file in filepaths.traders) {
        if (!fs.existsSync(getPath(file, sessionID))) {
            continue;
        }

        if (filepaths.traders.hasOwnProperty(file) && file !== "ragfair") {
            traders.push(json.parse(json.read(getPath(file, sessionID))));
        }
    }

	return {err: 0, errmsg: null, data: traders};
}

function get(id) {
    // find the trader
	if (filepaths.traders.hasOwnProperty(id)) {
        return {err: 0, errmsg: "", data: json.parse(json.read(getPath(id, sessionID)))};
    }
    
    // trader not found
    logger.logError("Couldn't find trader of ID " + id);
    return {err: 999, errmsg: "Couldn't find trader of ID " + id, data: null};
}

function setTrader(data, sessionID) {
    return json.write(getPath(data._id, sessionID), data);
}

function lvlUp(id, sessionID) {
    let pmcData = profile_f.get(sessionID);
    let currentTrader = get(id);
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
        } else {
            break;
        }
    }

    currentTrader.data.loyalty.currentLevel = targetLevel;
    setTrader(currentTrader.data);

    // set assort
    assort_f.generate(id);
}

module.exports.getPath = getPath;
module.exports.loadAllTraders = loadAllTraders;
module.exports.get = get;
module.exports.setTrader = setTrader;
module.exports.lvlUp = lvlUp;