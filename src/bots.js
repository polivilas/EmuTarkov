"use strict";

//const botnames = JSON.parse(utility.readJson("data/configs/bots/botNames.json") );

/** ~ Generate Bot Main loop function
 * ~~input: body json
 * ~~output: Bots list response
 * @return {string}
 */
function generate(databots) 
{
	var generatedBots = [];
	
	for(var condition of databots.conditions)
	{	
		for (var i = 0; i < condition.Limit; i++) 
		{ 
			let tempBot = botBase;
			tempBot._id = "bot" + i + "x" + utility.getRandomIntEx(99999);
			tempBot.Info.Settings.Role = condition.Role;
			tempBot.Info.Settings.BotDifficulty = condition.Difficulty;
			tempBot.Info.Voice = "Scav_" + utility.getRandomIntEx(6);
			//let smallCaseRole = condition.Role.toLowerCase();
			generatedBots.push(generateBotGeneric(tempBot, condition.Role, condition.Difficulty));
		} 
	}
	return { "err": 0,"errmsg": null, "data": generatedBots };
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

/** ~ Generate Bot Full Name
 * ~~input: tempBaseBotBody, Role
 * ~~output: Single Bot
 * @return {string}
 */
function generateBotGeneric(botBase,role) 
{
	let nameType = "boss";
	switch(role)
	{
		case "assault":
		case "marksman":
			nameType = "scav";
			break;
		case "pmcbot":
			nameType = "pmc";
			break;
		case "followerBully":
		case "followerKojaniy":
		case "followerGluharAssault":
		case "followerGluharSecurity":
		case "followerGluharScout":
			nameType = "follower";
			break;
	}
	botBase.Info.Nickname = RandomName(nameType, role);
	if(role == "cursedAssault")
		role = "assault"; // replacer here to load shitters from proper file
	let botsCustomizationLength = bots_outfits_db[role].length - 1;
	botBase.Customization.Head = bots_outfits_db[role][utility.getRandomInt(0,botsCustomizationLength)].Head;
	botBase.Customization.Body = bots_outfits_db[role][utility.getRandomInt(0,botsCustomizationLength)].Body;
	botBase.Customization.Feet = bots_outfits_db[role][utility.getRandomInt(0,botsCustomizationLength)].Feet;
	botBase.Customization.Hands = bots_outfits_db[role][utility.getRandomInt(0,botsCustomizationLength)].Hands;

	botBase.Inventory = bots_inventory_db[role][utility.getRandomInt(0,bots_inventory_db[role].length - 1)];

	return botBase;

}

module.exports.generate = generate;
module.exports.generatePlayerScav = generatePlayerScav;
