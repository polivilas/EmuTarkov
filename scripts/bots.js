"use strict";

/** ~ Generate Bot Main loop function
 * ~~input: body json
 * ~~output: Bots list response
 * @return {string}
 */
function generate(databots) {
	let generatedBots = [];
	console.log(databots)
	for (let condition of databots.conditions) {
		for (let i = 0; i < condition.Limit; i++) {
			let tempBot = botBase;

			tempBot._id = "bot" + i + "x" + utility.getRandomIntEx(99999);
			tempBot.Info.Settings.Role = condition.Role;
			tempBot.Info.Settings.BotDifficulty = condition.Difficulty;
			tempBot.Info.Voice = "Scav_" + utility.getRandomIntEx(6);
			generatedBots.push(generateBotGeneric(tempBot, condition.Role));
		}
	}

	return { "err": 0,"errmsg": null, "data": generatedBots };
}

/** ~ Generate Bot Full Name
 * ~~input: typeOfName
 * ~~output: FullName
 * @return {string}
 */
function RandomName(role) {
    return names[role][utility.getRandomInt(0,names[role].length-1)];
}

/** ~ Generate Bot Full Name
 * ~~input: tempBaseBotBody, Role
 * ~~output: Single Bot
 * @return {string}
 */
function generateBotGeneric(botBase, role) {

	botBase.Info.Nickname = RandomName(role);

	// replacer here to load shitters from proper file
	if (role == "cursedAssault") {
		role = "assault";
	}
	
	botBase.Customization.Head = bots_outfits_db[role].Head[utility.getRandomInt(0,bots_outfits_db[role].Head.length - 1)];
	botBase.Customization.Body = bots_outfits_db[role].Body[utility.getRandomInt(0,bots_outfits_db[role].Body.length - 1)];
	botBase.Customization.Feet = bots_outfits_db[role].Feet[utility.getRandomInt(0,bots_outfits_db[role].Feet.length - 1)];
	botBase.Customization.Hands = bots_outfits_db[role].Hands[utility.getRandomInt(0,bots_outfits_db[role].Hands.length - 1)];
	
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
