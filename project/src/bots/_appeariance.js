"use strict";
const utility = require('../utility.js');
const presets = JSON.parse(utility.readJson("data/configs/bots/botPresets.json"));
function generateAppearance(bot, type = "") {
    let head,body,feet,rng_voice = 0,botName = "";
    switch (type) {
        case "guard":
            head = "wild_head_1";
            body = "wild_security_body_1";
            feet = "wild_security_feet_1";
            rng_voice = utility.getRandomInt(1, 6);
            botName = "Scav";
            break;
        case "sniper":
            head = presets.Head.savage[utility.getRandomInt(0, presets.Head.savage.length-1)];
            body = presets.Body.savage[utility.getRandomInt(0, presets.Body.savage.length-1)];
            feet = presets.Feet.savage[utility.getRandomInt(0, presets.Feet.savage.length-1)];
            rng_voice = utility.getRandomInt(1, 3);
            botName = "Scav";
            break;
        case "raider":
            head = presets.Head.pmc[utility.getRandomInt(0, presets.Head.pmc.length-1)];
            body = presets.Body.pmc[utility.getRandomInt(0, presets.Body.pmc.length-1)];
            feet = presets.Feet.pmc[utility.getRandomInt(0, presets.Feet.pmc.length-1)];
            break;
        case "usec":
            head = "usec_head_1";
            body = "usec_body";
            feet = "usec_feet";
            rng_voice = utility.getRandomInt(1, 3);
            botName = "Usec";
            break;
        case "bear":
            head = "bear_head";
            body = "bear_body";
            feet = "bear_feet";
            rng_voice = utility.getRandomInt(1, 2);
            botName = "Bear";
            break;
        default:
            head = presets.Head.savage[utility.getRandomInt(0, presets.Head.savage.length-1)];
            body = presets.Body.savage[utility.getRandomInt(0, presets.Body.savage.length-1)];
            feet = presets.Feet.savage[utility.getRandomInt(0, presets.Feet.savage.length-1)];
            rng_voice = utility.getRandomInt(1, 6);
            type = "scav";
            botName = "Scav";
            break;
    }
    const rng_id = 1000 + utility.getRandomIntEx(8999);
    bot._id = type + "_" + rng_id;
    bot['Info'].LowerNickname = type + rng_id;
    bot['Info'].Voice = ((type === "raider") ? presets.pmcBotVoices[utility.getRandomIntEx(presets.pmcBotVoices.length-1)] : botName + "_" + rng_voice);
	bot['Customization']['Hands'].path = "assets/content/hands/wild/wild_body_firsthands.bundle";
    bot['Customization']['Head'].path = "assets/content/characters/character/prefabs/" + head + ".bundle";
    bot['Customization']['Body'].path = "assets/content/characters/character/prefabs/" + body + ".bundle";
    bot['Customization']['Feet'].path = "assets/content/characters/character/prefabs/" + feet + ".bundle";

    return bot;
}

module.exports.generateAppearance = generateAppearance;
