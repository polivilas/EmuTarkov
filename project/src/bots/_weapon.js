"use strict";

require('../libs.js');


const presets = JSON.parse(utility.readJson("data/configs/bots/botPresets.json"));

const backpackLootTable = JSON.parse(utility.readJson("data/configs/bots/botBackpackLootTable.json")).BackpackLootTable;

/** ~ Generate Pattern item Generator
 * ~~input: typeOfName
 * ~~output: FullName
 */
function weapon(){}


module.exports.weapon = weapon;
