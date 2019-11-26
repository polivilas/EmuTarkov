"use strict";

const botNames = JSON.parse(utility.readJson("database/configs/bots/botNames.json"));
const botOutfits = JSON.parse(utility.readJson("database/configs/bots/bot_outfits.json"));
const pmcbotVoices = ["Bear_1", "Bear_1", "Usec_1", "Usec_2", "Usec_3"];

const healthController = {		// controller storage health of each bot
	"default": 					[35, 80, 70, 60, 60, 65, 65],
	"bossBully": 				[62, 138, 120, 100, 100, 110, 110],
	"followerBully": 			[50, 110, 100, 80, 80, 85, 85],
	"bossGluhar": 				[70, 200, 140, 145, 145, 145, 145],
	"bossKilla": 				[70, 210, 170, 100, 100, 120, 120],
	"bossKojaniy": 				[62, 160, 150, 100, 100, 110, 110],
	"followerKojaniy": 			[62, 138, 120, 100, 100, 110, 110],
	"followerGluharAssault": 	[45, 150, 125, 100, 100, 120, 120],
	"followerGluharSecurity": 	[40, 145, 100, 100, 100, 100, 100],
	"pmcBot": 					[35, 150, 120, 100, 100, 110, 110]
};

const bossOutfit = {
	"bossBully": ["5d28b01486f77429242fc898", "5d28adcb86f77429242fc893", "5d28b3a186f7747f7e69ab8c", "5cc2e68f14c02e28b47de290"],
	"bossKilla": ["5d28b03e86f7747f7e69ab8a", "5cdea33e7d6c8b0474535dac", "5cdea3c47d6c8b0475341734", "5cc2e68f14c02e28b47de290"],
	"bossKojaniy": ["5d5f8ba486f77431254e7fd2", "5d5e7c9186f774393602d6f9", "5d5e7f3c86f7742797262063", "5cc2e68f14c02e28b47de290"],
	"bossGluhar": ["5d5e805d86f77439eb4c2d0e", "5d5e7dd786f7744a7a274322", "5d5e7f2a86f77427997cfb80", "5cc2e68f14c02e28b47de290"]
};

let staticRoutes = {};

function addStaticRoute(role, worker) {
	staticRoutes[role] = worker;
}

function setHealth(role) {
	let hc = healthController[role];

	return {"Hydration": {"Current": 100,"Maximum": 100},"Energy": {"Current": 100,"Maximum": 100},"BodyParts": {"Head": {"Health": {"Current": hc[0],"Maximum": hc[0]}},"Chest": {"Health": {"Current": hc[1],"Maximum": hc[1]}},"Stomach": {"Health": {"Current": hc[2],"Maximum": hc[2]}},"LeftArm": {"Health": {"Current": hc[3],"Maximum": hc[3]}},"RightArm": {"Health": {"Current": hc[4],"Maximum": hc[4]}},"LeftLeg": {"Health": {"Current": hc[5],"Maximum": hc[5]}},"RightLeg": {"Health": {"Current": hc[6],"Maximum": hc[6]}}}};
}

function setBossOutfit(role) {
	let cc = bossOutfit[role];

	return {"Head": cc[0], "Body": cc[1], "Feet": cc[2], "Hands": cc[3]};
}

function setOutfit(role) {
	let outfits =  botOutfits[role];
	return {
		"Head" : outfits.Head[utility.getRandomInt(0, outfits.Head.length - 1)],
		"Body" : outfits.Body[utility.getRandomInt(0, outfits.Body.length - 1)],
		"Feet" : outfits.Feet[utility.getRandomInt(0, outfits.Feet.length - 1)],
		"Hands" : outfits.Hands[utility.getRandomInt(0,outfits.Hands.length - 1)]
	}
}

function generateBotGeneric(botBase, role) {
	botBase.Info.Nickname = botNames.scav[utility.getRandomInt(0, botNames.scav.length)];
	botBase.Customization = setOutfit("scav");
	botBase.Health = setHealth("default");

	let allInventories = [];

	if (role == "marksman") {
		allInventories = JSON.parse(utility.readJson("database/configs/bots/inventory/marksman.json"));
	} else {
		allInventories = JSON.parse(utility.readJson("database/configs/bots/inventory/assault.json"));
	}
	
	botBase.Inventory = allInventories[utility.getRandomInt(0, allInventories.length)];
	return botBase;
}

function generateRaider(botBase, role) {
	botBase.Info.Nickname = botNames.pmcBot[utility.getRandomInt(0, botNames.pmcBot.length)];
	botBase.Info.Settings.Experience = 500;
	botBase.Info.Voice = pmcbotVoices[utility.getRandomInt(0, pmcbotVoices.length)];
	botBase.Health = setHealth(role);
	botBase.Customization = setOutfit(role);
	
	let allInventories = JSON.parse(utility.readJson("database/configs/bots/inventory/pmcBot.json"));

	botBase.Inventory = allInventories[utility.getRandomInt(0, allInventories.length)];
	return botBase;
}

function generateReshala(botBase, role) {
	botBase.Info.Nickname = "Reshala";
	botBase.Info.Settings.Experience = 800;
	botBase.Health = setHealth(role);
	botBase.Customization = setBossOutfit(role);
	
	let allInventories = JSON.parse(utility.readJson("database/configs/bots/inventory/bossBully.json"));

	botBase.Inventory = allInventories[utility.getRandomInt(0, allInventories.length)];
	return botBase;
}

function generateFollowerReshala(botBase, role) {
	botBase.Info.Nickname = botNames.followerBully[utility.getRandomInt(0, botNames.followerBully.length)] + " Zavodskoy";
	botBase.Info.Settings.Experience = 500;
	botBase.Health = setHealth(role);
	botBase.Customization = setOutfit(role);
	
	let allInventories = JSON.parse(utility.readJson("database/configs/bots/inventory/followerBully.json"));

	botBase.Inventory = allInventories[utility.getRandomInt(0, allInventories.length)];
	return botBase;
}

function generateKilla(botBase, role) {
	botBase.Info.Nickname = "Killa";
	botBase.Info.Settings.Experience = 1000;
	botBase.Health = setHealth(role);
	botBase.Customization = setBossOutfit(role);
	
	let allInventories = JSON.parse(utility.readJson("database/configs/bots/inventory/bossKilla.json"));

	botBase.Inventory = allInventories[utility.getRandomInt(0, allInventories.length)];
	return botBase;
}

function generateKojaniy(botBase, role) {
	botBase.Info.Nickname = "Shturman";
	botBase.Info.Settings.Experience = 1100;
	botBase.Health = setHealth(role);
	botBase.Customization = setBossOutfit(role);
	
	let allInventories = JSON.parse(utility.readJson("database/configs/bots/inventory/bossKojaniy.json"));

	botBase.Inventory = allInventories[utility.getRandomInt(0, allInventories.length)];
	return botBase;
}

function generateFollowerKojaniy(botBase, role) {
	botBase.Info.Nickname = botNames.followerKojaniy[utility.getRandomInt(0, botNames.followerKojaniy.length)] + " Svetloozerskiy";
	botBase.Info.Settings.Experience = 500;
	botBase.Health = setHealth(role);
	botBase.Customization = setOutfit(role);
	
	let allInventories = JSON.parse(utility.readJson("database/configs/bots/inventory/followerKojaniy.json"));

	botBase.Inventory = allInventories[utility.getRandomInt(0, allInventories.length)];
	return botBase;
}

function generateGluhkar(botBase, role) {
	botBase.Info.Nickname = "Gluhkar";
	botBase.Info.Settings.Experience = 1000;
	botBase.Health = setHealth(role);

	// looks like the game randomize itself appearance
	botBase.Customization = setBossOutfit(role);
	
	let allInventories = JSON.parse(utility.readJson("database/configs/bots/inventory/bossGluhar.json"));

	botBase.Inventory = allInventories[utility.getRandomInt(0, allInventories.length)];
	return botBase;
}

function generateFollowerGluharAssault(botBase, role) {
	botBase.Info.Nickname = botNames.followerGluharAssault[utility.getRandomInt(0, botNames.followerGluharAssault.length)];
	botBase.Info.Settings.Experience = 500;
	botBase.Health = setHealth(role);
	botBase.Customization = setOutfit(role);
	
	let allInventories = JSON.parse(utility.readJson("database/configs/bots/inventory/followerGluharAssault.json"));

	botBase.Inventory = allInventories[utility.getRandomInt(0, allInventories.length)];
	return botBase;
}

function generateFollowerGluharSecurity(botBase, role) {
	botBase.Info.Nickname = botNames.followerGluharSecurity[utility.getRandomInt(0, botNames.followerGluharSecurity.length)];
	botBase.Info.Settings.Experience = 500;
	botBase.Health = setHealth(role);
	botBase.Customization = setOutfit(role);
	
	let allInventories = JSON.parse(utility.readJson("database/configs/bots/inventory/followerGluharSecurity.json"));

	botBase.Inventory = allInventories[utility.getRandomInt(0, allInventories.length)];
	return botBase;
}

function generateFollowerGluharScout(botBase, role) {
	botBase.Info.Nickname = botNames.followerGluharScout[utility.getRandomInt(0, botNames.followerGluharScout.length)];
	botBase.Info.Settings.Experience = 500;
	botBase.Health = setHealth("default");
	botBase.Customization = setOutfit(role);

	
	let allInventories = JSON.parse(utility.readJson("database/configs/bots/inventory/followerGluharScout.json"));

	botBase.Inventory = allInventories[utility.getRandomInt(0, allInventories.length)];
	return botBase;
}

function setupRoutes() {
	addStaticRoute("cursedAssault", generateBotGeneric);
	addStaticRoute("assault", generateBotGeneric);
	addStaticRoute("marksman", generateBotGeneric);
	addStaticRoute("pmcBot", generateRaider);
	addStaticRoute("bossBully", generateReshala);
	addStaticRoute("followerBully", generateFollowerReshala);
	addStaticRoute("bossKilla", generateKilla);
	addStaticRoute("bossKojaniy", generateKojaniy);
	addStaticRoute("followerKojaniy", generateFollowerKojaniy);
	addStaticRoute("bossGluhar", generateGluhkar);
	addStaticRoute("followerGluharAssault", generateFollowerGluharAssault);
	addStaticRoute("followerGluharSecurity", generateFollowerGluharSecurity);
	addStaticRoute("followerGluharScout", generateFollowerGluharScout);
}

function generate(databots) {

	let generatedBots = []; 
	let i = 0;
	for (let condition of databots.conditions) 
	{
		for (i = 0; i < condition.Limit; i++) 
		{
			var bot = JSON.parse(utility.readJson("database/configs/bots/botBase.json"));// DONT MOVE THIS, there was a scope problem

			bot._id = "bot" + utility.getRandomIntEx(99999999);
			bot.Info.Settings.Role = condition.Role;
			bot.Info.Settings.BotDifficulty = condition.Difficulty;
			bot.Info.Voice = "Scav_" + utility.getRandomIntEx(6);

			if (typeof staticRoutes[condition.Role] !== "undefined") 
			{	
				bot = staticRoutes[condition.Role](bot, condition.Role);
				generatedBots.unshift(bot);
			}
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

module.exports.setupRoutes = setupRoutes;
module.exports.generate = generate;
module.exports.generatePlayerScav = generatePlayerScav;