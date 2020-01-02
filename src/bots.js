"use strict";

function getRandomValue(node) {
	let keys = Object.keys(node);
	return node[keys[utility.getRandomInt(0, keys.length - 1)]];
}

function getBotNode(role) {
	if (role === "bear") {
		return filepaths.bots.bear;
	} else if (role === "usec") {
		return filepaths.bots.usec;
	} else if (role === "assault") {
		console.log(role);
		return filepaths.bots.scav.assault;
	} else if (role === "bossBully") {
		return filepaths.bots.scav.bossbully;
	} else if (role === "bossGluhar") {
		return filepaths.bots.scav.bossgluhar;
	} else if (role === "bossKilla") {
		return filepaths.bots.scav.bosskilla;
	}  else if (role === "bossKojaniy") {
		return filepaths.bots.scav.bosskojaniy;
	} else if (role === "followerBully") {
		return filepaths.bots.scav.followerbully;
	} else if (role === "followerGluharAssault") {
		return filepaths.bots.scav.followergluharassault;
	} else if (role === "followerGluharScout") {
		return filepaths.bots.scav.followergluharscout;
	} else if (role === "followerGluharSecurity") {
		return filepaths.bots.scav.followergluharsecurity;
	} else if (role === "followerKojaniy") {
		return filepaths.bots.scav.followerkojaniy;
	} else if (role === "marksman") {
		return filepaths.bots.scav.marksman;
	} else if (role === "pmcBot") {
		return filepaths.bots.scav.pmcbot;
	}

	return {};
}

function generateBot(botBase, role) {
	let type = role;

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
				type = "bear";
			} else {
				botBase.Info.Side = "Usec";
				type = "usec";
			}
		}
	}

	let botNode = getBotNode(type);

	botBase.Info.Settings.Role = role;
	botBase.Info.Nickname = json.parse(json.read(getRandomValue(botNode.names)));
	botBase.Info.Settings.Experience = json.parse(json.read(getRandomValue(botNode.experience)));
	botBase.Info.Voice = json.parse(json.read(getRandomValue(botNode.appearance.voice)));
	botBase.Health = json.parse(json.read(getRandomValue(botNode.health)));
	botBase.Customization.Head = json.parse(json.read(getRandomValue(botNode.appearance.head)));
	botBase.Customization.Body = json.parse(json.read(getRandomValue(botNode.appearance.body)));
	botBase.Customization.Feet = json.parse(json.read(getRandomValue(botNode.appearance.feet)));
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