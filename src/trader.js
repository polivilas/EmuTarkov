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
        if (filepaths.traders.hasOwnProperty(file) && checkTraders(file)) {
            traders.push(json.parse(json.read(getPath(file))));
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
            return {err: 0, errmsg: "", data: json.parse(json.read(getPath(selectedTrader)))};
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
		return json.parse(json.read(filepaths.user.cache.assort_everything));
	} else {
        if (filepaths.user.cache.hasOwnProperty("assort_" + selectedTrader)) {
            return json.parse(json.read(filepaths.user.cache["assort_" + selectedTrader]));
        }
    }
    
    // assort not found
    console.log("Couldn't find assort of ID " + trader, "white", "red");
    return {err: 999, errmsg: "Couldn't find assort of ID " + trader, data: null};
}

function setTrader(data) {
    return json.write(getPath(data._id), data);
}

function lvlUp(playerLvl) {
    return [];
}

module.exports.getPath = getPath;
module.exports.loadAllTraders = loadAllTraders;
module.exports.get = get;
module.exports.getAssort = getAssort;
module.exports.setTrader = setTrader;
module.exports.lvlUp = lvlUp;
