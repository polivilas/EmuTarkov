"use strict";

const utility = require('../utility.js');
const profile = require('../profile.js');

function examineItem(tmpList, body) {
	tmpList.data[0].Encyclopedia[body.item] = true;
	profile.setCharacterData(tmpList);
	return "OK";
}

module.exports.examineItem = examineItem;
