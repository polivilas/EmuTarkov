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

		if (spawnChance < settings.bots.pmc.spawnChance) {
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

function generateBotGeneric(botBase, role) {
	botBase.Info.Nickname = botNames.scav[utility.getRandomInt(0, botNames.scav.length)];
	botBase.Customization = setOutfit("scav");
	botBase.Health = setHealth("default");

	let allInventories = [];

	if (role == "marksman") {
		allInventories = json.parse(json.read(filepaths.bots.inventory.marksman));
	} else {
		allInventories = json.parse(json.read(filepaths.bots.inventory.assault));
	}
	
	botBase.Inventory = allInventories[utility.getRandomInt(0, allInventories.length)];
	return botBase;
}

function generateRaider(botBase, role) {
	botBase.Info.Settings.Experience = 500;
}

function generateReshala(botBase, role) {
	botBase.Info.Nickname = "Reshala";
	botBase.Info.Settings.Experience = 800;
}

function generateFollowerReshala(botBase, role) {
	botBase.Info.Settings.Experience = 500;
}

function generateKilla(botBase, role) {
	botBase.Info.Nickname = "Killa";
	botBase.Info.Settings.Experience = 1000;
}

function generateKojaniy(botBase, role) {
	botBase.Info.Nickname = "Shturman";
	botBase.Info.Settings.Experience = 1100;
}

function generateFollowerKojaniy(botBase, role) {
	botBase.Info.Settings.Experience = 500;
}

function generateGluhkar(botBase, role) {
	botBase.Info.Settings.Experience = 1000;
}

function generateFollowerGluharAssault(botBase, role) {
	botBase.Info.Settings.Experience = 500;
}

function generateFollowerGluharSecurity(botBase, role) {
	botBase.Info.Settings.Experience = 500;
}

function generateFollowerGluharScout(botBase, role) {
	botBase.Info.Settings.Experience = 500;
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