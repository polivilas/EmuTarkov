"use strict";

require('./libs.js');

// List of traders with dynamic standing (maybe move in some config file)
const dynamicTraders = ["1_prapor", "2_therapist", "3_fence", "4_skier",
    "5_peacekeeper", "6_mechanic", "7_ragman"];

var tradersDir = "data/configs/traders/";
var assortDir = "data/configs/assort/";
var traders = [];
var assorts = [];

function loadAllTraders() {
    let traderFiles = fs.readdirSync(tradersDir);
    traders = [];
    // load trader files
    for (let file in tradersDir) {
        if (tradersDir.hasOwnProperty(file)) {
            if (traderFiles[file] !== undefined) {
                if (traderFiles.hasOwnProperty(file)) {
                    if (checkTraders(traderFiles, file)) {
                        traders.push(JSON.parse(utility.readJson(tradersDir + traderFiles[file])));
                    }
                }
            }
        }
    }
}

function checkTraders(traderFiles, file) {
    return settings.debug.debugMode === true || ((settings.debug.debugMode === false || settings.debug.debugMode === undefined) && traderFiles[file] !== "91_everythingTrader.json" && traderFiles[file] !== "92_SecretTrader.json");
}

function loadAllAssorts() {
    let assortFiles = fs.readdirSync(assortDir);
    // load assort files
    for (let file in assortDir) {
        if (assortDir.hasOwnProperty(file)) {
            if (assortFiles[file] !== undefined) {
                if (assortFiles.hasOwnProperty(file)) {
                    assorts.push(JSON.parse(utility.readJson(assortDir + assortFiles[file])));
                }
            }
        }
    }
}

function getList() {
    return {err: 0, errmsg: null, data: traders};
}

function get(id, flea = false) {
    // find the trader
	if(id == "91_everythingTrader" && flea) { // always return everything trader
		return JSON.parse(utility.readJson(tradersDir + id + ".json"));
	} else {
		for (let i = 0; i < traders.length; i++) {
			if (traders[i]._id === id) {
				return {err: 0, errmsg: null, data: traders[i]};
			}
		}
	}
    // trader not found
    console.log("Couldn't find trader of ID " + id, "white", "red");
    return {err: 999, errmsg: "Couldn't find trader of ID " + id, data: null};
}

function getAssort(id, flea = false) {
	if(id == "91_everythingTrader" && flea) { // always return everything trader
		return JSON.parse(utility.readJson(assortDir + id + ".json"));
	} else {
		// find the assort
		for (let i = 0; i < traders.length; i++) {
			if (traders[i]._id === id) {
				return assorts[i];
			}
		}
	}
    // assort not found
    console.log("Couldn't find assort of ID " + id, "white", "red");
    return {err: 999, errmsg: "Couldn't find assort of ID " + id, data: null};
}

function load() {
    loadAllTraders();
    loadAllAssorts();
}

function getDynamicTraders() {
    return dynamicTraders;
}

function setTrader(data) {
    return utility.writeJson(tradersDir + data._id + ".json", data);
}

function lvlUp(playerLvl) {
    let lvlUpTraders = [];
    for (let dynTrader of dynamicTraders) {
        let traderLoyality = get(dynTrader).data.loyalty;
        if (traderLoyality.currentLevel < (Object.keys(traderLoyality.loyaltyLevels).length - 1)) { //check traders from counting from 0

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
module.exports.getList = getList;
module.exports.get = get;
module.exports.getAssort = getAssort;
module.exports.setTrader = setTrader;
module.exports.load = load;
module.exports.getDynamicTraders = getDynamicTraders;
module.exports.lvlUp = lvlUp;