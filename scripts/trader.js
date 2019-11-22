"use strict";

require('./libs.js');

// NO FUCKING TEMPING TRADERS CAUSE ITS FUCKING STUPID !!!!!!
const dynamicTraders = 
[
    "54cb50c76803fa8b248b4571", //prapor
    "54cb57776803fa99248b456e", //therapist
    "579dc571d53a0658a154fbec", //fence
    "58330581ace78e27b8b10cee", //skier
    "5935c25fb3acc3127c3d8cd9", //peacekeeper
    "5a7c2eca46aef81a7ca2145d", //mechanic
    "5ac3b934156ae10c4430e83c", //ragman
    "5c0647fdd443bc2504c2d371"  //jaeger
];
const traders_connected = 
{
    "54cb50c76803fa8b248b4571": "1_prapor", 	//prapor
    "54cb57776803fa99248b456e": "2_therapist", 	//therapist
    "579dc571d53a0658a154fbec": "3_fence", 		//fence
    "58330581ace78e27b8b10cee": "4_skier", 		//skier
    "5935c25fb3acc3127c3d8cd9": "5_peacekeeper",//peacekeeper
    "5a7c2eca46aef81a7ca2145d": "6_mechanic", 	//mechanic
    "5ac3b934156ae10c4430e83c": "7_ragman", 	//ragman
    "5c0647fdd443bc2504c2d371": "8_jaeger", 	//jaeger
    "8_PresetTrader": 			"8_PresetTrader",  		//Holds only weapon presets
    "91_everythingTrader": 		"91_everythingTrader"  	//Holds all items
};
var tradersDir = "database/configs/traders/";
var assortDir = "database/configs/assort/";
var traders = [];
var assorts = [];

/* loadAllTraders - create getTraderList.json off it and return all response
* input: null
* output: "{err: 0, errmsg: null, data: [traderdata]}"
* */
function loadAllTraders() 
{
    let traderFiles = fs.readdirSync(tradersDir);
    let traders = []
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
	return {err: 0, errmsg: null, data: traders};
}

function checkTraders(traderFiles, file) {
    return settings.debug.debugMode === true || ((settings.debug.debugMode === false || settings.debug.debugMode === undefined) && traderFiles[file] !== "91_everythingTrader.json" && traderFiles[file] !== "92_SecretTrader.json");
}

function loadAssort(trader) {
    let assortFiles = fs.readdirSync(assortDir);
	let selectedTrader = ((typeof traders_connected[trader] != "undefined")?traders_connected[trader]:trader);
    // load assort files
    for (let file in assortDir) {
		if(assortFiles[file] == (selectedTrader + ".json")){
			return JSON.parse(utility.readJson(assortDir + assortFiles[file]));
		}
    }
	console.log("Couldn't find assort of ID " + trader, "white", "red");
    return {err: 999, errmsg: "Couldn't find assort of ID " + trader, data: null};
}

function get(id, flea = false) {
    // find the trader
	if(id == "91_everythingTrader" && flea) 
    { // always return everything trader
		return {err: 0, errmsg: "", data: JSON.parse(utility.readJson(tradersDir + id + ".json"))};
	} 
    else 
    {
		if(typeof traders_connected[id] != "undefined")
			return {err: 0, errmsg: "", data: JSON.parse(utility.readJson(tradersDir + traders_connected[id] + ".json")) };
	}
    // trader not found
    console.log("Couldn't find trader of ID " + id, "white", "red");
    return {err: 999, errmsg: "Couldn't find trader of ID " + id, data: null};
}

function getAssort(id, flea = false) {
	if(id == "91_everythingTrader" && flea) { // always return everything trader
		return JSON.parse(utility.readJson(assortDir + id + ".json"));
	} else {
		return loadAssort(id);
	}
}

function load() {
}

function setTrader(data) {
    return utility.writeJson(tradersDir + traders_connected[data._id] + ".json", data);
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
//module.exports.getList = getList;
module.exports.get = get;
module.exports.getAssort = getAssort;
module.exports.setTrader = setTrader;
module.exports.load = load;
//module.exports.getDynamicTraders = getDynamicTraders;
module.exports.lvlUp = lvlUp;