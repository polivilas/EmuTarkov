"use strict";
const utility = require('../utility.js');
const presets = JSON.parse(utility.readJson("data/configs/bots/botPresets.json"));

/* Generate Bot Skills / Level etc...
* input: bot data object, params from client
* output: bot data object
* */
function generateBotStats(bot, params) {
    // ai settings
    bot['Info'].Settings.Role = params.Role;
    bot['Info'].Settings.BotDifficulty = params.Difficulty;
    let skillProgress = [0, 2500];
    let level = [1,15];
    if(params.Role === "marksman" || params.Role === "follower") {
        skillProgress = [1500,3500];
        level = [10,23];
    } else if(params.Role === "pmcBot" || params.Role === "followerBully") {
        skillProgress = [2000,5000];
        level = [22,58];
    }else if(params.Role === "bossBully" || params.Role === "bossKilla") {
        skillProgress = [4800,5000];
        level = [45,60];
    }
    // randomize skills
    for (let skill of bot.Skills['Common']) {
        skill.Progress = utility.getRandomInt(skillProgress[0],skillProgress[1]);
        skill.MaxAchieved = skill.Progress;
    }

    // randomize experience
    bot['Info'].Level = utility.getRandomInt(level[0], level[1]); //level depends on role

    return bot;
}

module.exports.generateBotStats = generateBotStats;
