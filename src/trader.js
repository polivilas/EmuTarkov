"use strict";

require('./libs.js');

function loadAllTraders() {
    let traders = [];

    // load trader files
    for (let file in filepaths.traders) {
        if (filepaths.traders.hasOwnProperty(file) && checkTraders(file)) {
            traders.push(json.parse(json.read(filepaths.traders[file])));
        }
    }

	return {err: 0, errmsg: null, data: traders};
}

function checkTraders(file) {
    return settings.debug.debugMode === true || ((settings.debug.debugMode === false || settings.debug.debugMode === undefined) && file !== "everything");
}

function get(id, flea = false) {
    let selectedTrader = id;

    // find the trader
	if (selectedTrader == "everything" && flea) {
		return {err: 0, errmsg: "", data: json.parse(json.read(filepaths.traders.everything))};
	} else {
		if (filepaths.traders.hasOwnProperty(selectedTrader)) {
            return {err: 0, errmsg: "", data: json.parse(json.read(filepaths.traders[selectedTrader]))};
        }
    }
    
    // trader not found
    console.log("Couldn't find trader of ID " + id, "white", "red");
    return {err: 999, errmsg: "Couldn't find trader of ID " + id, data: null};
}

function getAssort(id, flea = false) {
    let selectedTrader = id;

    // always return everything trader
	if (selectedTrader == "everything" && flea) {
		return json.parse(json.read(filepaths.assort.everything));
	} else {
        if (filepaths.assort.hasOwnProperty(selectedTrader)) {
            return json.parse(json.read(filepaths.assort[selectedTrader]));
        }
    }
    
    // assort not found
    console.log("Couldn't find assort of ID " + trader, "white", "red");
    return {err: 999, errmsg: "Couldn't find assort of ID " + trader, data: null};
}

function setTrader(data) {
    let selectedTrader = data._id;

    return json.write(filepaths.traders[selectedTrader], data);
}

function lvlUp(playerLvl) {
    let lvlUpTraders = [];

    return lvlUpTraders;
}

module.exports.loadAllTraders = loadAllTraders;
module.exports.get = get;
module.exports.getAssort = getAssort;
module.exports.setTrader = setTrader;
module.exports.lvlUp = lvlUp;
