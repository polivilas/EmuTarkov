"use strict";

const utility = require('../utility.js');
const profile = require('../profile.js');

function examineItem(tmpList, body) {
	for (let item of tmpList.data[0].Inventory.items) {
		if (item._id == body.id && tmpList.data[0].Encyclopedia[item._tpl] == undefined) {
			tmpList.data[0].Encyclopedia[item._tpl] = true;
			// tmpList.data[0].Info.Experience += json.parse(json.read("db/items/" + item._tpl + ".json"))._props.ExaminedExperience;
			break;
		}
	}
	
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