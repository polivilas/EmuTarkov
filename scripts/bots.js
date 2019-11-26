"use strict";

const botnames = JSON.parse(utility.readJson("database/configs/bots/botNames.json") );
const bot_outfits = JSON.parse(utility.readJson("database/configs/bots/bot_outfits.json") );

let health_controller = { // controller storage health of each bot
	"assault": 					[35,80,70,60,60,65,65],
	"bossBully": 				[62,138,120,100,100,110,110],
	"bossGluhar": 				[70,200,140,145,145,145,145],
	"bossKilla": 				[70,210,170,100,100,120,120],
	"bossKojaniy": 				[62,160,150,100,100,110,110],
	"followerBully": 			[50,110,100,80,80,85,85],
	"followerGluharAssault": 	[45,150,125,100,100,120,120],
	"followerGluharScout": 		[35,80,70,60,60,65,65],
	"followerGluharSecurity": 	[40,145,100,100,100,100,100],
	"followerKojaniy": 			[62,138,120,100,100,110,110],
	"marksman": 				[35,80,70,60,60,65,65],
	"pmcBot": 					[35,150,120,100,100,110,110],
};

let pmcbot_voices = ["Bear_1","Bear_1","Usec_1","Usec_2","Usec_3"];

function generate(databots) 
{
	var generatedBots = []; //make it persistant otherwise its fucked up

	
	for(let condition of databots.conditions)
	{	
		for (let i = 0; i < condition.Limit; i++) 
		{ 

			var botBase = JSON.parse(utility.readJson("database/configs/bots/botBase.json") ); //var is intended here
			botBase._id = "" + utility.getRandomIntEx(99999999);
			botBase.Info.Settings.Role = condition.Role;
			botBase.Info.Settings.BotDifficulty = condition.Difficulty;
			botBase.Info.Voice = "Scav_" + utility.getRandomIntEx(6);

			botBase.Health = SetHealth(condition.Role)

			switch(condition.Role)
			{
				case "cursedAssault":
					generatedBots.push( generateBotGeneric(botBase,"cursedAssault") );
					break;

				case "assault":
					generatedBots.push( generateBotGeneric(botBase,"assault") );
					break;

				case "marksman":
					generatedBots.push( generateBotGeneric(botBase,"marksman") );
					break;

				case "pmcBot":
					generatedBots.push( generateRaider(botBase) );
					break;

				case "bossBully":
					generatedBots.push( generateReshala(botBase) );
					break;

				case "followerBully":
					generatedBots.push( generateFollowerReshala(botBase) );
					break;

				case "bossKilla":
					generatedBots.push( generateKilla(botBase) );
					break;

				case "bossKojaniy":
					generatedBots.push( generateKojaniy(botBase) );
					break;

				case "followerKojaniy":
					generatedBots.push( generateFollowerKojaniy(botBase) );
					break;

				case "bossGluhar":
					generatedBots.push( generateGluhkar(botBase) );
					break;

				case "followerGluharAssault":
					generatedBots.push( generateFollowerGluharAssault(botBase) );
					break;

				case "followerGluharSecurity":
					generatedBots.push( generateFollowerGluharSecurity(botBase) );
					break;

				case "followerGluharScout":
					generatedBots.push( generateFollowerGluharScout(botBase) );
					break;
			}
			
		} 
	}
	//utility.writeJson("debug_bots.json",generatedBots);
	return { "err": 0,"errmsg": null, "data": generatedBots };
}

function SetHealth(role){
	let hc = health_controller[role];
	return {"Hydration": {"Current": 100,"Maximum": 100},"Energy": {"Current": 100,"Maximum": 100},"BodyParts": {"Head": {"Health": {"Current": hc[0],"Maximum": hc[0]}},"Chest": {"Health": {"Current": hc[1],"Maximum": hc[1]}},"Stomach": {"Health": {"Current": hc[2],"Maximum": hc[2]}},"LeftArm": {"Health": {"Current": hc[3],"Maximum": hc[3]}},"RightArm": {"Health": {"Current": hc[4],"Maximum": hc[4]}},"LeftLeg": {"Health": {"Current": hc[5],"Maximum": hc[5]}},"RightLeg": {"Health": {"Current": hc[6],"Maximum": hc[6]}}}};
	
}

function SetOutfit(role)
{
	let outfits =  bot_outfits[role];
	return {
		"Head" : outfits.Head[utility.getRandomInt(0, outfits.Head.length - 1)],
		"Body" : outfits.Body[utility.getRandomInt(0, outfits.Body.length - 1)],
		"Feet" : outfits.Feet[utility.getRandomInt(0, outfits.Feet.length - 1)],
		"Hands" : outfits.Hands[utility.getRandomInt(0,outfits.Hands.length - 1)]
	}

}


function generateBotGeneric(botBase,role) 
{
	botBase.Info.Nickname = botnames.scav[utility.getRandomInt(0,botnames.scav.length)] ;

	botBase.Customization = SetOutfit("scav");

	let allInventorys = [];
	if(role == "marksman")
	{
		allInventorys = JSON.parse(utility.readJson("database/configs/bots/inventory/marksman.json") );
	}
	else
	{
		allInventorys = JSON.parse(utility.readJson("database/configs/bots/inventory/assault.json") );
	}
	
	botBase.Inventory = allInventorys[utility.getRandomInt(0,allInventorys.length)];

	return botBase;

}

function generateRaider(botBase) 
{
	botBase.Info.Nickname = botnames.pmcBot[utility.getRandomInt(0,botnames.pmcBot.length)];
	botBase.Info.Settings.Experience = 500;
	botBase.Info.Voice = pmcbot_voices[utility.getRandomInt(0,pmcbot_voices.length)];

	botBase.Health = SetHealth("pmcBot");
	botBase.Customization = SetOutfit("pmcBot");
	
	let allInventorys = JSON.parse(utility.readJson("database/configs/bots/inventory/pmcBot.json") );
	botBase.Inventory = allInventorys[utility.getRandomInt(0,allInventorys.length)];

	return botBase;

}

function generateReshala(botBase) 
{
	botBase.Info.Nickname = "Reshala";
	botBase.Info.Settings.Experience = 800; 

	botBase.Health = SetHealth("bossBully");

	botBase.Customization.Head = "5d28b01486f77429242fc898";
	botBase.Customization.Body = "5d28adcb86f77429242fc893";
	botBase.Customization.Feet = "5d28b3a186f7747f7e69ab8c";
	botBase.Customization.Hands = "5cc2e68f14c02e28b47de290";
	
	let allInventorys = JSON.parse(utility.readJson("database/configs/bots/inventory/bossBully.json") );
	botBase.Inventory = allInventorys[utility.getRandomInt(0,allInventorys.length)];

	return botBase;

}

function generateFollowerReshala(botBase) 
{
	botBase.Info.Nickname = botnames.followerBully[utility.getRandomInt(0,botnames.followerBully.length)] + " Zavodskoy";
	botBase.Info.Settings.Experience = 500; 

	botBase.Health = SetHealth("followerBully");
	botBase.Customization = SetOutfit("followerBully");
	
	let allInventorys = JSON.parse(utility.readJson("database/configs/bots/inventory/followerBully.json") );
	botBase.Inventory = allInventorys[utility.getRandomInt(0,allInventorys.length)];

	return botBase;

}

function generateKilla(botBase) 
{
	botBase.Info.Nickname = "Killa";
	botBase.Info.Settings.Experience = 1000; 

	botBase.Health = SetHealth("bossKilla");

	botBase.Customization.Head = "5d28b03e86f7747f7e69ab8a"
	botBase.Customization.Body = "5cdea33e7d6c8b0474535dac"
	botBase.Customization.Feet = "5cdea3c47d6c8b0475341734"
	botBase.Customization.Hands = "5cc2e68f14c02e28b47de290"
	
	let allInventorys = JSON.parse(utility.readJson("database/configs/bots/inventory/bossKilla.json") );
	botBase.Inventory = allInventorys[utility.getRandomInt(0,allInventorys.length)];

	return botBase;

}

function generateKojaniy(botBase) 
{
	botBase.Info.Nickname = "Shturman";
	botBase.Info.Settings.Experience = 1100; 

	botBase.Health = SetHealth("bossKojaniy");

	botBase.Customization.Head = "5d5f8ba486f77431254e7fd2";
	botBase.Customization.Body = "5d5e7c9186f774393602d6f9";
	botBase.Customization.Feet = "5d5e7f3c86f7742797262063";
	botBase.Customization.Hands = "5cc2e68f14c02e28b47de290";
	
	let allInventorys = JSON.parse(utility.readJson("database/configs/bots/inventory/bossKojaniy.json") );	
	botBase.Inventory = allInventorys[utility.getRandomInt(0,allInventorys.length)];

	return botBase;

}

function generateFollowerKojaniy(botBase) 
{
	botBase.Info.Nickname = botnames.followerKojaniy[utility.getRandomInt(0,botnames.followerKojaniy.length)] + " Svetloozerskiy" ;
	botBase.Info.Settings.Experience = 500; 

	botBase.Health = SetHealth("followerKojaniy");
	botBase.Customization = SetOutfit("followerKojaniy");
	
	let allInventorys = JSON.parse(utility.readJson("database/configs/bots/inventory/followerKojaniy.json") );	
	botBase.Inventory = allInventorys[utility.getRandomInt(0,allInventorys.length)];

	return botBase;

}

function generateGluhkar(botBase) 
{
	botBase.Info.Nickname = "Gluhkar";
	botBase.Info.Settings.Experience = 1000; 

	botBase.Health = SetHealth("bossGluhar");

	//looks like the game randomize itself appearance
	botBase.Customization.Head = "5d5e805d86f77439eb4c2d0e";
	botBase.Customization.Body = "5d5e7dd786f7744a7a274322";
	botBase.Customization.Feet = "5d5e7f2a86f77427997cfb80";
	botBase.Customization.Hands = "5cc2e68f14c02e28b47de290";
	
	let allInventorys = JSON.parse(utility.readJson("database/configs/bots/inventory/bossGluhar.json") );	
	botBase.Inventory = allInventorys[utility.getRandomInt(0,allInventorys.length)];

	return botBase;

}

function generateFollowerGluharAssault(botBase) 
{
	botBase.Info.Nickname = botnames.followerGluharAssault[utility.getRandomInt(0,botnames.followerGluharAssault.length)] ;
	botBase.Info.Settings.Experience = 500; 

	botBase.Health = SetHealth("followerGluharAssault");
	botBase.Customization = SetOutfit("followerGluharAssault");
	
	let allInventorys = JSON.parse(utility.readJson("database/configs/bots/inventory/followerGluharAssault.json") );	
	botBase.Inventory = allInventorys[utility.getRandomInt(0,allInventorys.length)];

	return botBase;

}

function generateFollowerGluharSecurity(botBase) 
{
	botBase.Info.Nickname = botnames.followerGluharSecurity[utility.getRandomInt(0,botnames.followerGluharSecurity.length)];
	botBase.Info.Settings.Experience = 500; 

	botBase.Health = SetHealth("followerGluharSecurity");
	botBase.Customization = SetOutfit("followerGluharSecurity");
	
	let allInventorys = JSON.parse(utility.readJson("database/configs/bots/inventory/followerGluharSecurity.json") );	
	botBase.Inventory = allInventorys[utility.getRandomInt(0,allInventorys.length)];

	return botBase;

}

function generateFollowerGluharScout(botBase) 
{
	botBase.Info.Nickname = botnames.followerGluharScout[utility.getRandomInt(0,botnames.followerGluharScout.length)] ;
	botBase.Info.Settings.Experience = 500; 

	botBase.Health = SetHealth("followerGluharScout");
	botBase.Customization = SetOutfit("followerGluharScout");
	
	let allInventorys = JSON.parse(utility.readJson("database/configs/bots/inventory/followerGluharScout.json") );	
	botBase.Inventory = allInventorys[utility.getRandomInt(0,allInventorys.length)];

	return botBase;

}

function generatePlayerScav() 
{
	let playerscav = generate({"conditions":[{"Role":"assault","Limit":1,"Difficulty":"normal"}]}).data;	
	playerscav[0].Info.Settings = {};
	playerscav[0]._id = "5c71b934354682353958e983";
	return playerscav[0];
}

module.exports.generate = generate;
module.exports.generatePlayerScav = generatePlayerScav;