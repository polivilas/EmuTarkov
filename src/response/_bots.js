"use strict";

function getRandomValue(node) {
	let keys = Object.keys(node);
	return json.parse(json.read(node[keys[utility.getRandomInt(0, keys.length - 1)]]));
}

function getBotNode(type) {
	switch (type) {
		case "bear":
			return filepaths.bots.pmc.bear;

		case "usec":
			return filepaths.bots.pmc.usec;

		case "assault":
			return filepaths.bots.scav.assault;

		case "bossBully":
			return filepaths.bots.scav.bossbully;
	
		case "bossGluhar":
			return filepaths.bots.scav.bossgluhar;

		case "bossKilla":
			return filepaths.bots.scav.bosskilla;

		case "bossKojaniy":
			return filepaths.bots.scav.bosskojaniy;
	
		case "followerBully":
			return filepaths.bots.scav.followerbully;

		case "followerGluharAssault":
			return filepaths.bots.scav.followergluharassault

		case "followerGluharScout":
			return filepaths.bots.scav.followergluharscout;
	
		case "followerGluharSecurity":
			return filepaths.bots.scav.followergluharsecurity;

		case "followerKojaniy":
			return filepaths.bots.scav.followerkojaniy;

		case "marksman":
			return filepaths.bots.scav.marksman;
	
		case "pmcBot":
			return filepaths.bots.scav.pmcbot;

		default:
			logger.logError("bots type " + type + " is not handled");
			return {};
	}
}

function addDogtag(botBase) {
	let dogtagItem = {
		_id: "dogtag_" + 100000000 + utility.getRandomIntEx(899999999),
		_tpl: "__REPLACEME__",
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
	}

	if (botBase.Info.Side === 'Usec') {
		dogtagItem._tpl = "59f32c3b86f77472a31742f0";
	} else {
		dogtagItem._tpl = "59f32bb586f774757e1e8442";
	}

	botBase.Inventory.items.push(dogtagItem);
	return botBase;
}

function removeSecureContainer(botBase) {
	let idsToRemove = [];

	for (let item of botBase.Inventory.items) {
        if (item.slotId === "SecuredContainer") {
			idsToRemove = itm_hf.findAndReturnChildren(botBase, item._id);
        }
	}
	
	if (idsToRemove.length > 0) {
		for (let itemId of idsToRemove) {
			for (let index in botBase.Inventory.items) {
				if (botBase.Inventory.items[index]._id === itemId) {
					botBase.Inventory.items.splice(index, 1);
				}
			}
		}
	}

	return botBase;
}

function generateBot(botBase, role) {
	let type = role;

	if (role === "cursedAssault") {
		type = "assault"
	}

	// chance to spawn simulated PMC players
	if (((type === "assault" || type === "marksman" || type === "pmcBot") && settings.gameplay.bots.pmcEnabled)) {
		let spawnChance = utility.getRandomInt(0, 99);
		let sideChance = utility.getRandomInt(0, 99);
		botBase.Info.Level = Math.floor(Math.random()*Math.floor(70));
		
		if (spawnChance < settings.gameplay.bots.pmcSpawnChance) {
			if (sideChance < settings.gameplay.bots.pmcUsecChance) {
				botBase.Info.Side = "Usec";
				type = "usec";
			} else {
				botBase.Info.Side = "Bear";
				type = "bear";
			}
		}
	}

	if (role === "playerScav") {
		type = "assault";
	}

	let botNode = getBotNode(type);

	// generate bot
	botBase.Info.Settings.Role = role;
	botBase.Info.Nickname = getRandomValue(botNode.names);
	botBase.Info.Settings.Experience = getRandomValue(botNode.experience);
	botBase.Info.Voice = getRandomValue(botNode.appearance.voice);
	botBase.Health = getRandomValue(botNode.health);
	botBase.Customization.Head = getRandomValue(botNode.appearance.head);
	botBase.Customization.Body = getRandomValue(botNode.appearance.body);
	botBase.Customization.Feet = getRandomValue(botNode.appearance.feet);
	botBase.Customization.Hands = getRandomValue(botNode.appearance.hands);
	botBase.Inventory = getRandomValue(botNode.inventory);

	// remove secure container
	botBase = removeSecureContainer(botBase);

	// add dogtag to PMC's		
	if (type === "usec" || type === "bear") {
		botBase = addDogtag(botBase);
	}
	
	return botBase;
}

function generate(databots) {
	let generatedBots = []; 

	for (let condition of databots.conditions) {
		for (let i = 0; i < condition.Limit; i++)  {
			let bot = json.parse(json.read(filepaths.bots.base));

			bot._id = "bot" + utility.getRandomIntEx(99999999);
			bot.Info.Settings.BotDifficulty = condition.Difficulty;
			bot = generateBot(bot, condition.Role);
			generatedBots.unshift(bot);
		}
	}

	return {"err": 0,"errmsg": null, "data": generatedBots};
}

function generatePlayerScav() {
	let playerscav = generate({"conditions":[{"Role":"playerScav","Limit":1,"Difficulty":"normal"}]}).data;

	playerscav[0].Info.Settings = {};
	return playerscav[0];
}

module.exports.generate = generate;
module.exports.generatePlayerScav = generatePlayerScav;