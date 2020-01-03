"use strict";

function getRandomValue(node) {
	let keys = Object.keys(node);
	return node[keys[utility.getRandomInt(0, keys.length - 1)]];
}

function getBotNode(role) {
	if (role === "bear") {
		return filepaths.bots.pmc.bear;
	} else if (role === "usec") {
		return filepaths.bots.pmc.usec;
	} else if (role === "assault") {
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
	if (((role === "assault" || role === "marksman" || role === "pmcBot") && settings.gameplay.bots.pmcEnabled)) {
		let spawnChance = utility.getRandomInt(0, 99);
		let sideChance = utility.getRandomInt(0, 99);
		botBase.Info.Level = Math.floor(Math.random()*Math.floor(70));
		
		if (spawnChance < settings.gameplay.bots.pmcChance) {
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

	if (botBase.Info.Side !== 'Savage') {

	if(botBase.Info.Side === 'Usec') {}
		botBase.Inventory.items.push({
			_id: "dogtag_" + 100000000 + utility.getRandomIntEx(899999999),
			_tpl: "59f32c3b86f77472a31742f0",
			parentId: botBase.Inventory.equipment,
			slotId: "Dogtag",
			upd: {
				"Dogtag": {
					"Nickname": botBase.Info.Nickname,
					"Side": botBase.Info.Side,
					"Level": botBase.Info.Level,
					"Time": "2020-01-01T00:00:00",
					"Status": "Killed by JET",
					"KillerName": 'JustEmuTarkov',
					"WeaponName": "JET Reverse Engineering"
				},
				"SpawnedInSession": "true"
			}
		})
	} else{
		botBase.Inventory.items.push({
			_id: "dogtag_" + 100000000 + utility.getRandomIntEx(899999999),
			_tpl: "59f32bb586f774757e1e8442",
			parentId: botBase.Inventory.equipment,
			slotId: "Dogtag",
			upd: {
				"Dogtag": {
					"Nickname": botBase.Info.Nickname,
					"Side": botBase.Info.Side,
					"Level": botBase.Info.Level,
					"Time": "2020-01-01T00:00:00",
					"Status": "Killed by JET",
					"KillerName": 'JustEmuTarkov',
					"WeaponName": "JET Reverse Engineering"
				},
				"SpawnedInSession": "true"
			}
		})
	}
	
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
