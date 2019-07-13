"use strict";

const fs = require('fs');
const utility = require('./utility.js');

var tradersDir = "data/configs/traders/";
var assortDir = "data/configs/assort/";
var traders = [];
var assorts = [];

function loadAllTraders() {
	let traderFiles = fs.readdirSync(tradersDir);

	// load trader files
	for (let file in tradersDir) {
		if (traderFiles[file] !== undefined) {
			traders.push(JSON.parse(utility.readJson(tradersDir + traderFiles[file])));
		}
	}
}

function loadAllAssorts() {
	let assortFiles = fs.readdirSync(assortDir);

	// load assort files
	for (let file in assortDir) {
		if (assortFiles[file] !== undefined) {
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
	return { err: 0, errmsg: null, data: null };
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
	return { err: 0, errmsg: null, data: null };
}

function load() {
	loadAllTraders();
	loadAllAssorts();
}

module.exports.getList = getList;
module.exports.get = get;
module.exports.getAssort = getAssort;
module.exports.load = load;