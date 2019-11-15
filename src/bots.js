"use strict";
require('./libs.js');

const names = JSON.parse(utility.readJson("data/configs/bots/botNames.json"));
const botBase = JSON.parse(utility.readJson("data/configs/bots/botBase.json"));
/* ROLE: "cursedAssault" "assault" "marksman" "pmcbot" "bossBully" "followerBully" "bossKilla" "bossKojaniy" "followerKojaniy" "bossGluhar" "followerGluharAssault" "followerGluharSecurity" "followerGluharScout" */
/* Generate bot
*
*
*/
function generate(databots) 
{
	var generatedBots = [];
	databots = JSON.parse(databots);
	
	for(var condition of databots.conditions)
	{	
		for (var i = 0; i < condition.Limit; i++) 
		{ 
			let tempBot = botBase;
			tempBot._id = "bot" + i + "x" + utility.getRandomIntEx(99999);
			let smallCaseRole = condition.Role.toLowerCase();
			generatedBots.push(generateBotGeneric(tempBot, smallCaseRole, condition.Difficulty));
		} 
	}
	return { "err": 0,"errmsg": null, "data": generatedBots };
}

function generateBotGeneric(botBase,role,difficulty) 
{
	$nameType = "boss";
	switch(role){
		case "assault":
		case "marksman":
			$nameType = "scav";
			break;
		case "pmcbot":
			$nameType = "pmc";
			break;
		case "followerBully":
		case "followerKojaniy":
		case "followerGluharAssault":
		case "followerGluharSecurity":
		case "followerGluharScout":
			$nameType = "follower";
			break;
	}

	botBase.Info.Nickname = RandomName($nameType, role);
	botBase.Info.Settings.Role = role;
	botBase.Info.Settings.BotDifficulty = difficulty;
	if(role == "cursedAssault")
		role = "assault"; // replacer here to load foles from propaer file
	let outfits_bot = JSON.parse(utility.readJson("data/configs/bots/customization/"+role.toLowerCase()+".json") );

	botBase.Customization.Head = outfits_bot[utility.getRandomInt(0,outfits_bot.length)].Head;
	botBase.Customization.Body = outfits_bot[utility.getRandomInt(0,outfits_bot.length)].Body;
	botBase.Customization.Feet = outfits_bot[utility.getRandomInt(0,outfits_bot.length)].Feet;
	botBase.Customization.Hands = outfits_bot[utility.getRandomInt(0,outfits_bot.length)].Hands;

	let allInventorys = JSON.parse(utility.readJson("data/configs/bots/inventory/" + role.toLowerCase() + ".json") );
	
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


/** ~ Generate Bot Full Name
 * ~~input: typeOfName
 * ~~output: FullName
 * @return {string}
 */
function RandomName(type, role)
{
    let tmpNames = "UNKNOWN";
    switch (type) {
        case "scav":
            tmpNames = names['scav'].name[utility.getRandomInt(0,names['scav'].name.length-1)] + " " + names['scav']['surname'][utility.getRandomInt(0,names['scav']['surname'].length-1)];
            break;
        case "pmc":
            tmpNames = names['pmc'][utility.getRandomInt(0,names['pmc'].length-1)];
            break;
        case "follower":
            tmpNames = names['follower'][utility.getRandomInt(0,names['follower'].length-1)];
            break;
		default:
			tmpNames = role.replace("boss", "");
			break;
    }
    return tmpNames;
}

module.exports.generate = generate;
module.exports.generatePlayerScav = generatePlayerScav;
