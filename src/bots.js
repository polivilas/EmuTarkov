"use strict";

const bossOutfit = {
	// "botType": [head, body, feet, hands]
	"bossBully": ["5d28b01486f77429242fc898", "5d28adcb86f77429242fc893", "5d28b3a186f7747f7e69ab8c", "5cc2e68f14c02e28b47de290"],
	"bossKilla": ["5d28b03e86f7747f7e69ab8a", "5cdea33e7d6c8b0474535dac", "5cdea3c47d6c8b0475341734", "5cc2e68f14c02e28b47de290"],
	"bossKojaniy": ["5d5f8ba486f77431254e7fd2", "5d5e7c9186f774393602d6f9", "5d5e7f3c86f7742797262063", "5cc2e68f14c02e28b47de290"],
	"bossGluhar": ["5d5e805d86f77439eb4c2d0e", "5d5e7dd786f7744a7a274322", "5d5e7f2a86f77427997cfb80", "5cc2e68f14c02e28b47de290"]
};

function getRandomValue(node) {
	let keys = Object.keys(node);
	return node[keys[utility.getRandomInt(0, keys.length)]];
}

function getBotNode(role) {
	if (role === "bear") {
		return filepaths.bots.bear;
	} else if (role === "usec") {
		filepaths.bots.usec;
	}

	/*
	else if (role === "assault") {
		return filepaths.bots.scav.assault;
	} else if (role === 3) {
		return filepaths.bots.scav.bossbully;
	} else if (role === 4) {
		return filepaths.bots.scav.bossgluhar;
	} else if (role === 5) {
		return filepaths.bots.scav.bosskilla;
	}  else if (role === 6) {
		return filepaths.bots.scav.bosskojaniy;
	} else if (role === 7) {
		return filepaths.bots.scav.followerbully;
	} else if (role === 8) {
		return filepaths.bots.scav.followergluharassault;
	} else if (role === 9) {
		return filepaths.bots.scav.followergluharscout;
	} else if (role === 10) {
		return filepaths.bots.scav.followergluharsecurity;
	} else if (role === 11) {
		return filepaths.bots.scav.followerkojaniy;
	} else if (role === "marksman") {
		return filepaths.bots.scav.marksman;
	} else if (role === "pmcBot") {
		return filepaths.bots.scav.pmcbot;
	}
	*/

	return {};
}

function generateBot(botBase, role) {
	let side = role.toLowerCase();

	if (role === "cursedAssault") {
		role = "assault"
	}

	// chance to spawn simulated PMC players
	if (((role === "assault" || role === "marksman" || role === "pmcBot") && settings.bots.pmc.enabled)) {
		let spawnChance = utility.getRandomInt(0, 99);
		let sideChance = utility.getRandomInt(0, 99);

		if (spawnChance < settings.bots.pmc.chance) {
			if (sideChance < 50) {
				botBase.Info.Side = "Bear";
				side = "bear";
			} else {
				botBase.Info.Side = "Usec";
				side = "usec";
			}
		}
	}

	let botNode = getBotNode(side);

	botBase.Info.Settings.Role = role;
	botBase.Info.Nickname = json.parse(json.read(getRandomValue(botNode.names)));
	botBase.Info.Settings.Experience = json.parse(json.read(getRandomValue(botNode.experience)));
	botBase.Info.Voice = json.parse(json.read(getRandomValue(botNode.appearance.voice)));
	botBase.Health = json.parse(json.read(getRandomValue(botNode.health)));
	botBase.Customization.Head = json.parse(json.read(getRandomValue(botNode.appearance.head)));
	botBase.Customization.Body = json.parse(json.read(getRandomValue(botNode.appearance.body)));
	botBase.Customization.Feets = json.parse(json.read(getRandomValue(botNode.appearance.feets)));
	botBase.Customization.Hands = json.parse(json.read(getRandomValue(botNode.appearance.hands)));
	botBase.Inventory = json.parse(json.read(getRandomValue(botNode.inventory)));

	return botBase;
}

function generate(databots) {
	let generatedBots = []; 
	let i = 0;

	for (let condition of databots.conditions) {
		for (i = 0; i < condition.Limit; i++)  {
			var bot = json.parse(json.read(filepaths.bots.base));

			bot._id = "bot" + utility.getRandomIntEx(99999999);
			bot.Info.Settings.BotDifficulty = condition.Difficulty;
			bot = generateBot(bot, condition.Role);
			generatedBots.unshift(bot);
		}
	}

	return { "err": 0,"errmsg": null, "data": generatedBots };
}

function generatePlayerScav() {
	let playerscav = generate({"conditions":[{"Role":"assault","Limit":1,"Difficulty":"normal"}]}).data;

	playerscav[0].Info.Settings = {};
	playerscav[0]._id = "5c71b934354682353958e983";
	return playerscav[0];
}

module.exports.generate = generate;
module.exports.generatePlayerScav = generatePlayerScav;