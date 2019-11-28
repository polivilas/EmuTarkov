"use strict";

require('./libs.js');

/////////////////////////////////// TODO: REWRITE TO FULLY USE FILEROUTES.JSON ///////////////////////////////////

const dynamicTraders = [
    "54cb50c76803fa8b248b4571", // prapor
    "54cb57776803fa99248b456e", // therapist
    "579dc571d53a0658a154fbec", // fence
    "58330581ace78e27b8b10cee", // skier
    "5935c25fb3acc3127c3d8cd9", // peacekeeper
    "5a7c2eca46aef81a7ca2145d", // mechanic
    "5ac3b934156ae10c4430e83c", // ragman
    "5c0647fdd443bc2504c2d371"  // jaeger
];
const connectedTraders = {
    "54cb50c76803fa8b248b4571": "prapor", 	    // prapor
    "54cb57776803fa99248b456e": "therapist", 	// therapist
    "579dc571d53a0658a154fbec": "fence", 		// fence
    "58330581ace78e27b8b10cee": "skier", 		// skier
    "5935c25fb3acc3127c3d8cd9": "peacekeeper",  // peacekeeper
    "5a7c2eca46aef81a7ca2145d": "mechanic", 	// mechanic
    "5ac3b934156ae10c4430e83c": "ragman", 	    // ragman
    "5c0647fdd443bc2504c2d371": "jaeger", 	    // jaeger
};

var traders = [];
var assorts = [];

/* loadAllTraders - create getTraderList.json off it and return all response
* input: null
* output: "{err: 0, errmsg: null, data: [traderdata]}"
* */
function loadAllTraders() {
    let traders = [];

    // load trader files
    for (let file in fileRoutes.traders) {
        if (fileRoutes.traders.hasOwnProperty(file) && checkTraders(file)) {
            traders.push(JSON.parse(utility.readJson(fileRoutes.traders[file])));
        }
    }

	return {err: 0, errmsg: null, data: traders};
}

function checkTraders(file) {
    return settings.debug.debugMode === true || ((settings.debug.debugMode === false || settings.debug.debugMode === undefined) && file !== "everything");
}

function getTraderName(id) {
    return ((typeof connectedTraders[id] != "undefined") ? connectedTraders[id] : id);
}

function get(id, flea = false) {
    let selectedTrader = getTraderName(id);

    // find the trader
	if (selectedTrader == "everything" && flea) {
		return {err: 0, errmsg: "", data: JSON.parse(utility.readJson(fileRoutes.traders.everything))};
	} else {
		if (fileRoutes.traders.hasOwnProperty(selectedTrader)) {
            return {err: 0, errmsg: "", data: JSON.parse(utility.readJson(fileRoutes.traders[selectedTrader]))};
        }
    }
    
    // trader not found
    console.log("Couldn't find trader of ID " + id, "white", "red");
    return {err: 999, errmsg: "Couldn't find trader of ID " + id, data: null};
}

function getAssort(id, flea = false) {
    let selectedTrader = getTraderName(id);

    // always return everything trader
	if (selectedTrader == "everything" && flea) {
		return JSON.parse(utility.readJson(fileRoutes.assort.everything));
	} else {
        if (fileRoutes.assort.hasOwnProperty(selectedTrader)) {
            return JSON.parse(utility.readJson(fileRoutes.assort[selectedTrader]));
        }
    }
    
    // assort not found
    console.log("Couldn't find assort of ID " + trader, "white", "red");
    return {err: 999, errmsg: "Couldn't find assort of ID " + trader, data: null};
}

function setTrader(data) {
    let selectedTrader = getTraderName(data._id);

    return utility.writeJson(fileRoutes.traders[selectedTrader], data);
}

function lvlUp(playerLvl) {
    let lvlUpTraders = [];

    for (let dynTrader of dynamicTraders) {
        let traderLoyality = get(dynTrader).data.loyalty;

        // check traders from counting from 0
        if (traderLoyality.currentLevel < (Object.keys(traderLoyality.loyaltyLevels).length - 1)) {
            let newLvl = traderLoyality.currentLevel + 1;

            if ((playerLvl >= traderLoyality.loyaltyLevels[newLvl].minLevel) &&
                (traderLoyality.currentSalesSum >= traderLoyality.loyaltyLevels[newLvl].minSalesSum) &&
                (traderLoyality.currentStanding >= traderLoyality.loyaltyLevels[newLvl].minStanding)) {

                // lvl up trader
                traderLoyality.currentLevel += 1;
                get(dynTrader).data.loyalty = traderLoyality;

                // add to return value
                lvlUpTraders.push(dynTrader);
            }
        }
    }

    return lvlUpTraders;
}

module.exports.loadAllTraders = loadAllTraders;
module.exports.get = get;
module.exports.getAssort = getAssort;
module.exports.setTrader = setTrader;
module.exports.lvlUp = lvlUp;