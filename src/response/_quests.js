"use strict";

require('../libs.js');

let quests = "";

function prepareQuests() {
	if (quests == "") {
		return json.parse(json.read(filepaths.user.cache.quests));
	} else {
		return quests;
	}
}

module.exports.prepareQuests = prepareQuests;