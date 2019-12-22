"use strict";

function generate(databots) {
	//if (settings.bots.randomized) {
	//	return botRandomized_f.generate(databots);
	//} else {
		return botPresets_f.generate(databots);
	//}
}

function generatePlayerScav() {
	let playerscav = generate({"conditions":[{"Role":"assault","Limit":1,"Difficulty":"normal"}]}).data;

	playerscav[0].Info.Settings = {};
	playerscav[0]._id = "5c71b934354682353958e983";
	return playerscav[0];
}

module.exports.generate = generate;
module.exports.generatePlayerScav = generatePlayerScav;