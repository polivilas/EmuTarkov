"use strict";

const fs = require('fs');
const utility = require('./utility.js');

var tradersDir = "data/configs/traders/";
var assortDir = "data/configs/assort/";
var traders = [];
var assorts = [];
var settings = JSON.parse(utility.readJson("data/server.config.json"));
var settingsDev = (typeof settings.devs != "undefined")?settings.dev:false;

function loadAllTraders() {
	let traderFiles = fs.readdirSync(tradersDir);
	
	// load trader files
	for (let file in tradersDir) {
		//console.log(file);
		if (traderFiles[file] !== undefined && ((!settingsDev && traderFiles[file] != "91_everythingTrader.json" && traderFiles[file] != "92_SecretTrader.json") || settingsDev) ) {
			traders.push(JSON.parse(utility.readJson(tradersDir + traderFiles[file])));
		}
	}
}

function loadAllAssorts() {
	let assortFiles = fs.readdirSync(assortDir);
	// load assort files
	for (let file in assortDir) {
		if (assortFiles[file] !== undefined && ((!settingsDev && assortFiles[file] != "91_everythingTrader.json" && assortFiles[file] != "92_SecretTrader.json") || settingsDev) ) {
			assorts.push(JSON.parse(utility.readJson(assortDir + assortFiles[file])));
		}
	}
}

function getList() {
	return { err: 0, errmsg: null, data: traders };
}

function get(id) {
	// find the trader
	for (let i = 0; i < traders.length; i++) {
		if (traders[i]._id == id) {
			return { err: 0, errmsg: null, data: traders[i] };
		}
	}

	// trader not found
	console.log("Couldn't find trader of ID " + id, "white", "red");
	return { err: 999, errmsg: "Couldn't find trader of ID " + id, data: null };
}

function getAssort(id) {
	
	// find the assort
	for (let i = 0; i < traders.length; i++) {
		if (traders[i]._id == id) {
			return assorts[i];
		}
	}

	// assort not found
	console.log("Couldn't find assort of ID " + id, "white", "red");
	return { err: 999, errmsg: "Couldn't find assort of ID " + id, data: null };
}

function load() {
	loadAllTraders();
	loadAllAssorts();
}

module.exports.getList = getList;
module.exports.get = get;
module.exports.getAssort = getAssort;
module.exports.load = load;