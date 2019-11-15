"use strict";

const botnames = JSON.parse(utility.readJson("data/configs/bots/botNames.json") );
function generate(databots) 
{
	var generatedBots = [];
	databots = JSON.parse(databots);
	
	for(var condition of databots.conditions)
	{	
		for (var i = 0; i < condition.Limit; i++) 
		{ 

			var botBase = JSON.parse(utility.readJson("data/configs/bots/botBase.json") );
			botBase._id = "" + utility.getRandomIntEx(99999999);
			botBase.Info.Settings.Role = condition.Role;
			botBase.Info.Settings.BotDifficulty = condition.Difficulty;
			botBase.Info.Voice = "Scav_" + utility.getRandomIntEx(6);

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



function generateBotGeneric(botBase,role) 
{
	botBase.Info.Nickname = botnames.scav.name[utility.getRandomInt(0,botnames.scav.name.length)] + " " + botnames.scav.surname[utility.getRandomInt(0,botnames.scav.surname.length)];
	/*
	var outfits_bot = JSON.parse(utility.readJson("data/configs/bots/assault_marksman_customization.json") );

	botBase.Customization.Head = outfits_bot.Head[utility.getRandomInt(0,4)];
	botBase.Customization.Body = outfits_bot.Body[utility.getRandomInt(0,4)];
	botBase.Customization.Feet = outfits_bot.Feet[utility.getRandomInt(0,3)];
	botBase.Customization.Hands = outfits_bot.Hands[utility.getRandomInt(0,4)];
	*/

	var allInventorys = [];

	if(role == "marksman")
	{
		allInventorys = JSON.parse(utility.readJson("data/configs/bots/inventory_marksman.json") );
	}
	else
	{
		allInventorys = JSON.parse(utility.readJson("data/configs/bots/inventory_assault.json") );
	}
	
	botBase.Inventory = allInventorys[utility.getRandomInt(0,allInventorys.length)];

	return botBase;

}

function generateRaider(botBase) 
{
	botBase.Info.Nickname = botnames.pmc[utility.getRandomInt(0,botnames.pmc.length)];
	botBase.Info.Settings.Experience = 500; 
	botBase.Info.Voice = "Bear_1";

	botBase.Health.BodyParts.Head.Health.Current = 35;
	botBase.Health.BodyParts.Head.Health.Maximum = 35;

	botBase.Health.BodyParts.Chest.Health.Current = 150;
	botBase.Health.BodyParts.Chest.Health.Maximum = 150;

	botBase.Health.BodyParts.Stomach.Health.Current = 120;
	botBase.Health.BodyParts.Stomach.Health.Maximum = 120;

	botBase.Health.BodyParts.LeftArm.Health.Current = 100;
	botBase.Health.BodyParts.LeftArm.Health.Maximum = 100;

	botBase.Health.BodyParts.RightArm.Health.Current = 100;
	botBase.Health.BodyParts.RightArm.Health.Maximum = 100;

	botBase.Health.BodyParts.LeftLeg.Health.Current = 110;
	botBase.Health.BodyParts.LeftLeg.Health.Maximum = 110;

	botBase.Health.BodyParts.RightLeg.Health.Current = 110;
	botBase.Health.BodyParts.RightLeg.Health.Maximum = 110;

	//looks like the game randomize itself appearance
	botBase.Customization.Head = "5cc084dd14c02e000b0550a3"
	botBase.Customization.Body = "5d28ae4986f7742926686187"
	botBase.Customization.Feet = "5d28af7886f77429275dba25"
	botBase.Customization.Hands = "5cc0876314c02e000c6bea6b"
	
	var allInventorys = JSON.parse(utility.readJson("data/configs/bots/inventory_pmcBot.json") );
	botBase.Inventory = allInventorys[utility.getRandomInt(0,allInventorys.length)];

	return botBase;

}

function generateReshala(botBase) 
{
	botBase.Info.Nickname = "Reshala";
	botBase.Info.Settings.Experience = 800; 

	botBase.Health.BodyParts.Head.Health.Current = 62;
	botBase.Health.BodyParts.Head.Health.Maximum = 62;

	botBase.Health.BodyParts.Chest.Health.Current = 138;
	botBase.Health.BodyParts.Chest.Health.Maximum = 138;

	botBase.Health.BodyParts.Stomach.Health.Current = 120;
	botBase.Health.BodyParts.Stomach.Health.Maximum = 120;

	botBase.Health.BodyParts.LeftArm.Health.Current = 100;
	botBase.Health.BodyParts.LeftArm.Health.Maximum = 100;

	botBase.Health.BodyParts.RightArm.Health.Current = 100;
	botBase.Health.BodyParts.RightArm.Health.Maximum = 100;

	botBase.Health.BodyParts.LeftLeg.Health.Current = 110;
	botBase.Health.BodyParts.LeftLeg.Health.Maximum = 110;

	botBase.Health.BodyParts.RightLeg.Health.Current = 110;
	botBase.Health.BodyParts.RightLeg.Health.Maximum = 110;

	//looks like the game randomize itself appearance
	botBase.Customization.Head = "5d28b01486f77429242fc898"
	botBase.Customization.Body = "5d28adcb86f77429242fc893"
	botBase.Customization.Feet = "5d28b3a186f7747f7e69ab8c"
	botBase.Customization.Hands = "5cc2e68f14c02e28b47de290"
	
	var allInventorys = JSON.parse(utility.readJson("data/configs/bots/inventory_bossBully.json") );
	botBase.Inventory = allInventorys[utility.getRandomInt(0,allInventorys.length)];

	return botBase;

}

function generateFollowerReshala(botBase) 
{
	botBase.Info.Nickname = botnames.followerBully[utility.getRandomInt(0,botnames.followerBully.length)] + " Zavodskoy";
	botBase.Info.Settings.Experience = 500; 

	botBase.Health.BodyParts.Head.Health.Current = 50;
	botBase.Health.BodyParts.Head.Health.Maximum = 50;

	botBase.Health.BodyParts.Chest.Health.Current = 110;
	botBase.Health.BodyParts.Chest.Health.Maximum = 110;

	botBase.Health.BodyParts.Stomach.Health.Current = 100;
	botBase.Health.BodyParts.Stomach.Health.Maximum = 100;

	botBase.Health.BodyParts.LeftArm.Health.Current = 80;
	botBase.Health.BodyParts.LeftArm.Health.Maximum = 80;

	botBase.Health.BodyParts.RightArm.Health.Current = 80;
	botBase.Health.BodyParts.RightArm.Health.Maximum = 80;

	botBase.Health.BodyParts.LeftLeg.Health.Current = 85;
	botBase.Health.BodyParts.LeftLeg.Health.Maximum = 85;

	botBase.Health.BodyParts.RightLeg.Health.Current = 85;
	botBase.Health.BodyParts.RightLeg.Health.Maximum = 85;

	//looks like the game randomize itself appearance
	botBase.Customization.Head = "5d28afe786f774292668618d"
	botBase.Customization.Body = "5d28adfd86f774292364a6e5"
	botBase.Customization.Feet = "5d28af5386f774292364a6e8"
	botBase.Customization.Hands = "5cc2e68f14c02e28b47de290"
	
	var allInventorys = JSON.parse(utility.readJson("data/configs/bots/inventory_followerBully.json") );
	botBase.Inventory = allInventorys[utility.getRandomInt(0,allInventorys.length)];

	return botBase;

}

function generateKilla(botBase) 
{
	botBase.Info.Nickname = "Killa";
	botBase.Info.Settings.Experience = 1000; 

	botBase.Health.BodyParts.Head.Health.Current = 70;
	botBase.Health.BodyParts.Head.Health.Maximum = 70;

	botBase.Health.BodyParts.Chest.Health.Current = 170;
	botBase.Health.BodyParts.Chest.Health.Maximum = 170;

	botBase.Health.BodyParts.Stomach.Health.Current = 150;
	botBase.Health.BodyParts.Stomach.Health.Maximum = 150;

	botBase.Health.BodyParts.LeftArm.Health.Current = 100;
	botBase.Health.BodyParts.LeftArm.Health.Maximum = 100;

	botBase.Health.BodyParts.RightArm.Health.Current = 100;
	botBase.Health.BodyParts.RightArm.Health.Maximum = 100;

	botBase.Health.BodyParts.LeftLeg.Health.Current = 120;
	botBase.Health.BodyParts.LeftLeg.Health.Maximum = 120;

	botBase.Health.BodyParts.RightLeg.Health.Current = 120;
	botBase.Health.BodyParts.RightLeg.Health.Maximum = 120;

	//looks like the game randomize itself appearance
	botBase.Customization.Head = "5d28b03e86f7747f7e69ab8a"
	botBase.Customization.Body = "5cdea33e7d6c8b0474535dac"
	botBase.Customization.Feet = "5cdea3c47d6c8b0475341734"
	botBase.Customization.Hands = "5cc2e68f14c02e28b47de290"
	
	var allInventorys = JSON.parse(utility.readJson("data/configs/bots/inventory_bossKilla.json") );
	botBase.Inventory = allInventorys[utility.getRandomInt(0,allInventorys.length)];

	return botBase;

}

function generateKojaniy(botBase) 
{
	botBase.Info.Nickname = "Shturman";
	botBase.Info.Settings.Experience = 1100; 

	botBase.Health.BodyParts.Head.Health.Current = 62;
	botBase.Health.BodyParts.Head.Health.Maximum = 62;

	botBase.Health.BodyParts.Chest.Health.Current = 160;
	botBase.Health.BodyParts.Chest.Health.Maximum = 160;

	botBase.Health.BodyParts.Stomach.Health.Current = 150;
	botBase.Health.BodyParts.Stomach.Health.Maximum = 150;

	botBase.Health.BodyParts.LeftArm.Health.Current = 120;
	botBase.Health.BodyParts.LeftArm.Health.Maximum = 120;

	botBase.Health.BodyParts.RightArm.Health.Current = 120;
	botBase.Health.BodyParts.RightArm.Health.Maximum = 120;

	botBase.Health.BodyParts.LeftLeg.Health.Current = 110;
	botBase.Health.BodyParts.LeftLeg.Health.Maximum = 110;

	botBase.Health.BodyParts.RightLeg.Health.Current = 110;
	botBase.Health.BodyParts.RightLeg.Health.Maximum = 110;

	//looks like the game randomize itself appearance
	botBase.Customization.Head = "5d5f8ba486f77431254e7fd2";
	botBase.Customization.Body = "5d5e7c9186f774393602d6f9";
	botBase.Customization.Feet = "5d5e7f3c86f7742797262063";
	botBase.Customization.Hands = "5cc2e68f14c02e28b47de290";
	
	var allInventorys = JSON.parse(utility.readJson("data/configs/bots/inventory_followerKojaniy.json") );	
	botBase.Inventory = allInventorys[utility.getRandomInt(0,allInventorys.length)];

	return botBase;

}

function generateFollowerKojaniy(botBase) 
{
	botBase.Info.Nickname = botnames.followerKojaniy[utility.getRandomInt(0,botnames.followerKojaniy.length)] + " Svetloozerskiy" ;
	botBase.Info.Settings.Experience = 500; 

	botBase.Health.BodyParts.Head.Health.Current = 62;
	botBase.Health.BodyParts.Head.Health.Maximum = 62;

	botBase.Health.BodyParts.Chest.Health.Current = 138;
	botBase.Health.BodyParts.Chest.Health.Maximum = 138;

	botBase.Health.BodyParts.Stomach.Health.Current = 120;
	botBase.Health.BodyParts.Stomach.Health.Maximum = 120;

	botBase.Health.BodyParts.LeftArm.Health.Current = 100;
	botBase.Health.BodyParts.LeftArm.Health.Maximum = 100;

	botBase.Health.BodyParts.RightArm.Health.Current = 100;
	botBase.Health.BodyParts.RightArm.Health.Maximum = 100;

	botBase.Health.BodyParts.LeftLeg.Health.Current =  110;
	botBase.Health.BodyParts.LeftLeg.Health.Maximum =  110;

	botBase.Health.BodyParts.RightLeg.Health.Current = 110;
	botBase.Health.BodyParts.RightLeg.Health.Maximum = 110;

	//looks like the game randomize itself appearance
	botBase.Customization.Head = "5d28afe786f774292668618d";
	botBase.Customization.Body = "5d5e7e4a86f774279a21cc0d";
	botBase.Customization.Feet = "5d5e7f8986f7742798716582";
	botBase.Customization.Hands = "5cc2e68f14c02e28b47de290";
	
	var allInventorys = JSON.parse(utility.readJson("data/configs/bots/inventory_bossKojaniy.json") );	
	botBase.Inventory = allInventorys[utility.getRandomInt(0,allInventorys.length)];

	return botBase;

}

function generateGluhkar(botBase) 
{
	botBase.Info.Nickname = "Gluhkar";
	botBase.Info.Settings.Experience = 1000; 

	botBase.Health.BodyParts.Head.Health.Current = 70;
	botBase.Health.BodyParts.Head.Health.Maximum = 70;

	botBase.Health.BodyParts.Chest.Health.Current = 200;
	botBase.Health.BodyParts.Chest.Health.Maximum = 200;

	botBase.Health.BodyParts.Stomach.Health.Current = 140;
	botBase.Health.BodyParts.Stomach.Health.Maximum = 140;

	botBase.Health.BodyParts.LeftArm.Health.Current = 145;
	botBase.Health.BodyParts.LeftArm.Health.Maximum = 145;

	botBase.Health.BodyParts.RightArm.Health.Current = 145;
	botBase.Health.BodyParts.RightArm.Health.Maximum = 145;

	botBase.Health.BodyParts.LeftLeg.Health.Current = 145;
	botBase.Health.BodyParts.LeftLeg.Health.Maximum = 145;

	botBase.Health.BodyParts.RightLeg.Health.Current = 145;
	botBase.Health.BodyParts.RightLeg.Health.Maximum = 145;

	//looks like the game randomize itself appearance
	botBase.Customization.Head = "5d5e805d86f77439eb4c2d0e";
	botBase.Customization.Body = "5d5e7dd786f7744a7a274322";
	botBase.Customization.Feet = "5d5e7f2a86f77427997cfb80";
	botBase.Customization.Hands = "5cc2e68f14c02e28b47de290";
	
	var allInventorys = JSON.parse(utility.readJson("data/configs/bots/inventory_bossGluhar.json") );	
	botBase.Inventory = allInventorys[utility.getRandomInt(0,allInventorys.length)];

	return botBase;

}

function generateFollowerGluharAssault(botBase) 
{
	botBase.Info.Nickname = botnames.followerGukhar[utility.getRandomInt(0,botnames.followerGukhar.length)] ;
	botBase.Info.Settings.Experience = 500; 

	botBase.Health.BodyParts.Head.Health.Current = 45;
	botBase.Health.BodyParts.Head.Health.Maximum = 45;

	botBase.Health.BodyParts.Chest.Health.Current = 150;
	botBase.Health.BodyParts.Chest.Health.Maximum = 150;

	botBase.Health.BodyParts.Stomach.Health.Current = 125;
	botBase.Health.BodyParts.Stomach.Health.Maximum = 125;

	botBase.Health.BodyParts.LeftArm.Health.Current = 100;
	botBase.Health.BodyParts.LeftArm.Health.Maximum = 100;

	botBase.Health.BodyParts.RightArm.Health.Current = 100;
	botBase.Health.BodyParts.RightArm.Health.Maximum = 100;

	botBase.Health.BodyParts.LeftLeg.Health.Current =  120;
	botBase.Health.BodyParts.LeftLeg.Health.Maximum =  120;

	botBase.Health.BodyParts.RightLeg.Health.Current = 120;
	botBase.Health.BodyParts.RightLeg.Health.Maximum = 120;

	//looks like the game randomize itself appearance
	botBase.Customization.Head = "5cde9ff17d6c8b0474535daa";
	botBase.Customization.Body = "5d5e7e4a86f774279a21cc0d";
	botBase.Customization.Feet = "5d28af5386f774292364a6e8";
	botBase.Customization.Hands = "5cc2e68f14c02e28b47de290";
	
	var allInventorys = JSON.parse(utility.readJson("data/configs/bots/inventory_followerGluharAssault.json") );	
	botBase.Inventory = allInventorys[utility.getRandomInt(0,allInventorys.length)];

	return botBase;

}

function generateFollowerGluharSecurity(botBase) 
{
	botBase.Info.Nickname = botnames.followerGukhar[utility.getRandomInt(0,botnames.followerGukhar.length)];
	botBase.Info.Settings.Experience = 500; 

	botBase.Health.BodyParts.Head.Health.Current = 40;
	botBase.Health.BodyParts.Head.Health.Maximum = 40;

	botBase.Health.BodyParts.Chest.Health.Current = 145;
	botBase.Health.BodyParts.Chest.Health.Maximum = 145;

	botBase.Health.BodyParts.Stomach.Health.Current = 100;
	botBase.Health.BodyParts.Stomach.Health.Maximum = 100;

	botBase.Health.BodyParts.LeftArm.Health.Current = 100;
	botBase.Health.BodyParts.LeftArm.Health.Maximum = 100;

	botBase.Health.BodyParts.RightArm.Health.Current = 100;
	botBase.Health.BodyParts.RightArm.Health.Maximum = 100;

	botBase.Health.BodyParts.LeftLeg.Health.Current =  100;
	botBase.Health.BodyParts.LeftLeg.Health.Maximum =  100;

	botBase.Health.BodyParts.RightLeg.Health.Current = 100;
	botBase.Health.BodyParts.RightLeg.Health.Maximum = 100;

	//looks like the game randomize itself appearance
	botBase.Customization.Head = "5cde9ff17d6c8b0474535daa";
	botBase.Customization.Body = "5d28ae2986f7742926686185";
	botBase.Customization.Feet = "5d28af5386f774292364a6e8";
	botBase.Customization.Hands = "5cc2e68f14c02e28b47de290";
	
	var allInventorys = JSON.parse(utility.readJson("data/configs/bots/inventory_followerGluharSecurity.json") );	
	botBase.Inventory = allInventorys[utility.getRandomInt(0,allInventorys.length)];

	return botBase;

}

function generateFollowerGluharScout(botBase) 
{
	botBase.Info.Nickname = botnames.followerGukhar[utility.getRandomInt(0,botnames.followerGukhar.length)] ;
	botBase.Info.Settings.Experience = 500; 

	//looks like the game randomize itself appearance
	botBase.Customization.Head = "5cde9ff17d6c8b0474535daa";
	botBase.Customization.Body = "5d28ae2986f7742926686185";
	botBase.Customization.Feet = "5d28af5386f774292364a6e8";
	botBase.Customization.Hands = "5cc2e68f14c02e28b47de290";
	
	var allInventorys = JSON.parse(utility.readJson("data/configs/bots/inventory_followerGluharScout.json") );	
	botBase.Inventory = allInventorys[utility.getRandomInt(0,allInventorys.length)];

	return botBase;

}

function generatePlayerScav() 
{

	let character = profile.getCharacterData();
	let playerscav = generate({"conditions":[{"Role":"assault","Limit":1,"Difficulty":"normal"}]});
	
	playerscav[0].Info.Settings = {};
	playerscav[0]._id = "5c71b934354682353958e983";
	character.data[0] = playerscav[0];
	
	profile.setCharacterData(character);
}

module.exports.generate = generate;
module.exports.generatePlayerScav = generatePlayerScav;
