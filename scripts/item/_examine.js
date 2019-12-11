"use strict";

const utility = require('../utility.js');
const profile = require('../profile.js');

function examineItem(tmpList, body) {
	tmpList.data[0].Encyclopedia[body.item] = false;
	profile.setCharacterData(tmpList);
	return "OK";
}

function readEncyclopedia(tmpList, body) {
	tmpList.data[0].Encyclopedia[body.ids[0]] = true;
	profile.setCharacterData(tmpList);
	return "OK";
}

module.exports.examineItem = examineItem;
module.exports.readEncyclopedia = readEncyclopedia;