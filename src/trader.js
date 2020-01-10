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
        generateFenceAssort();
    }

	if (filepaths.user.cache.hasOwnProperty("assort_" + id)) {
        return json.parse(json.read(filepaths.user.cache["assort_" + id]));
    }
    
    // assort not found
    logger.logError("Couldn't find assort of ID " + trader);
    return {err: 999, errmsg: "Couldn't find assort of ID " + trader, data: null};
}

function generateFenceAssort() {
    let base = json.parse(json.read("db/cache/assort.json"));
    let names = Object.keys(filepaths.assort.ragfair.level);
    let added = [];

    for (let i = 0; i < settings.ganeplay.trading.fenceAssortSize; i++) {
        let id = names[utility.getRandomInt(0, names.length - 1)];

        if (added.includes(id)) {
            i--;
            continue;
        }

        added.push(id);
        base.data.items.push(json.parse(json.read(filepaths.assort.ragfair.items[id])));
        base.data.barter[id] = json.parse(json.read(filepaths.assort.ragfair.barter[id]));
        base.data.level[id] = json.parse(json.read(filepaths.assort.ragfair.level[id]));
    }

    return json.write(filepaths.user.cache["assort_579dc571d53a0658a154fbec"], base);
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
        break;
    }
}

module.exports.getPath = getPath;
module.exports.loadAllTraders = loadAllTraders;
module.exports.get = get;
module.exports.getAssort = getAssort;
module.exports.setTrader = setTrader;
module.exports.lvlUp = lvlUp;
