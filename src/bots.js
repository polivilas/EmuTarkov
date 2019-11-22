"use strict";

/** ~ Generate Bot Main loop function
 * ~~input: body json
 * ~~output: Bots list response
 * @return {string}
 */
function generate(databots) {
	let generatedBots = [];
	
	for (let condition of databots.conditions) {
		for (let i = 0; i < condition.Limit; i++) {
			let tempBot = botBase;

			tempBot._id = "bot" + i + "x" + utility.getRandomIntEx(99999);
			tempBot.Info.Settings.Role = condition.Role;
			tempBot.Info.Settings.BotDifficulty = condition.Difficulty;
			tempBot.Info.Voice = "Scav_" + utility.getRandomIntEx(6);
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
function RandomName(type, role) {
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
function generateBotGeneric(botBase,role) {
	let nameType = "boss";

	switch (role) {
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

		default:
			// add error message here!
			break;
	}

	botBase.Info.Nickname = RandomName(nameType, role);

	// replacer here to load shitters from proper file
	if (role == "cursedAssault") {
		role = "assault";
	}

	let botsCustomizationLength = bots_outfits_db[role].length - 1;
	
	botBase.Customization.Head = bots_outfits_db[role][utility.getRandomInt(0,botsCustomizationLength)].Head;
	botBase.Customization.Body = bots_outfits_db[role][utility.getRandomInt(0,botsCustomizationLength)].Body;
	botBase.Customization.Feet = bots_outfits_db[role][utility.getRandomInt(0,botsCustomizationLength)].Feet;
	botBase.Customization.Hands = bots_outfits_db[role][utility.getRandomInt(0,botsCustomizationLength)].Hands;
	botBase.Inventory = bots_inventory_db[role][utility.getRandomInt(0,bots_inventory_db[role].length - 1)];

	return botBase;
}

function generatePlayerScav() {
	let character = profile.getCharacterData();	
	let playerscav = generate({"conditions":[{"Role":"assault","Limit":1,"Difficulty":"normal"}]});	

	playerscav[0].Info.Settings = {};	
	playerscav[0]._id = "5c71b934354682353958e983";	
	character.data[1] = playerscav[0];	
	profile.setCharacterData(character);	
}

module.exports.generate = generate;
module.exports.generatePlayerScav = generatePlayerScav;