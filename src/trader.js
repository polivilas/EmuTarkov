"use strict";

require('./libs.js');

function getPath(id) {
    let traderPath = filepaths.user.profiles.traders[id];
    return traderPath.replace("__REPLACEME__", constants.getActiveID());
}

function loadAllTraders() {
    let traders = [];

    // load trader files
    for (let file in filepaths.traders) {
        if (!fs.existsSync(getPath(file))) {
            continue;
        }

        if (filepaths.traders.hasOwnProperty(file) && file !== "ragfair") {
            traders.push(json.parse(json.read(getPath(file))));
        }
    }

	return {err: 0, errmsg: null, data: traders};
}

function get(id) {
    // find the trader
	if (filepaths.traders.hasOwnProperty(id)) {
        return {err: 0, errmsg: "", data: json.parse(json.read(getPath(id)))};
    }
    
    // trader not found
    logger.logError("Couldn't find trader of ID " + id);
    return {err: 999, errmsg: "Couldn't find trader of ID " + id, data: null};
}

function getAssort(id) {
    // find the assort
    if (id === "579dc571d53a0658a154fbec") {
        assort_f.generateFenceAssort();
    }

	if (filepaths.user.cache.hasOwnProperty("assort_" + id)) {
        return json.parse(json.read(filepaths.user.profiles.assort["assort_" + id]));
    }
    
    // assort not found
    logger.logError("Couldn't find assort of ID " + trader);
    return {err: 999, errmsg: "Couldn't find assort of ID " + trader, data: null};
}

function setTrader(data) {
    return json.write(getPath(data._id), data);
}

function lvlUp(id) {
    let currentProfile = profile.getCharacterData();
    let currentTrader = get(id);
    let loyaltyLevels = currentTrader.data.loyalty.loyaltyLevels;

    // level up player
    let checkedExp = 0;

    for (let level in globalSettings.data.config.exp.level.exp_table) {
        if (currentProfile.data[0].Info.Experience < checkedExp) {
            break;
        }

        currentProfile.data[0].Info.Level = 1 + globalSettings.data.config.exp.level.exp_table[level];
        checkedExp += globalSettings.data.config.exp.level.exp_table[level].exp;
    }

    // level up traders
    for (let level in loyaltyLevels) {
        // level reached
        if (loyaltyLevels[level].minLevel < currentProfile.data[0].Info.Level
            && loyaltyLevels[level].minSalesSum < currentTrader.data.loyalty.currentSalesSum
            && loyaltyLevels[level].minStanding < currentTrader.data.loyalty.currentStanding) {
            continue;
        }

        // set current level found
        currentTrader.data.loyalty.currentLevel = 1 + parseInt(level);
        setTrader(currentTrader.data);
        assort_f.generateAssort(id);
        logger.logWarning(currentTrader.data.loyalty.currentLevel);
        break;
    }
}

module.exports.getPath = getPath;
module.exports.loadAllTraders = loadAllTraders;
module.exports.get = get;
module.exports.getAssort = getAssort;
module.exports.setTrader = setTrader;
module.exports.lvlUp = lvlUp;
