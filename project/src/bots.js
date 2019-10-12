"use strict";
require('./libs.js');

const profileName = (profile.getCharacterData()).data[0].Info.Nickname;
const backpackLootTable = JSON.parse(utility.readJson("data/configs/bots/botBackpackLootTable.json")).BackpackLootTable;
const presets = JSON.parse(utility.readJson("data/configs/bots/botPresets.json"));
const weaponPresets = JSON.parse(utility.readJson("data/configs/bots/botWeapons.json"));

// GENERATE BASE BODY
function generateBotBoss(params, fileName) {
    //i think its changable later on so i use let
    let base = JSON.parse(utility.readJson("data/configs/bots/" + fileName + ".json"));
    base['Info'].Settings.Role = params.Role;
    base['Info'].Settings.BotDifficulty = params.Difficulty;
    return base;
}

function generateBotWeapon(params) { // generating presets
    let tier = 0;
    let len = 0;
    let randomize = 0;
    let weapon_preset_main = 0;
    let weapon_preset_pist = 0;
    //randomize Mainweapon and hostler weapon rolling if there should we (main weapon and postol) / (pistol) or (mainweapin only)
    const chanceOfGetting = [settings.bots.weapon.main, settings.bots.weapon.secondary];
    if (params.Role === "")
        chanceOfGetting[0] = 100;
    if (params.Role === "marksman") { // if bot is marksman sniper get item from fdiffrent table
        len = presets.Weapons_Marksman.length;
        randomize = utility.getRandomIntEx(len) - 1;
        weapon_preset_main = presets.Weapons_Marksman[randomize]; // it should not have any pistols
    } else {
        if (utility.getRandomIntEx(100) < chanceOfGetting[0]) { // try to roll weapon
            tier = bots_mf.calculateItemChance(presets.Weapons, params.Role);
            len = presets.Weapons[tier].length;
            randomize = utility.getRandomIntEx(len);
            weapon_preset_main = presets.Weapons[tier][randomize]; // it should not have any pistols
        }
    }
    if (weapon_preset_main !== 0) { // if weapon is rolled then try to roll pistol also
        if (utility.getRandomIntEx(100) < chanceOfGetting[1]) {
            tier = bots_mf.calculateItemChance(presets.Pistol);
            len = presets.Pistol[tier].length;
            randomize = utility.getRandomIntEx(len);
            weapon_preset_pist = presets.Pistol[tier][randomize]; // only pistol tiers here
        }
    } else { // if no main weapon
        tier = bots_mf.calculateItemChance(presets.Pistol);
        len = presets.Pistol[tier].length;
        randomize = utility.getRandomIntEx(len);
        weapon_preset_pist = presets.Pistol[tier][randomize];
    }
    // weapon_preset_pist / weapon_preset_main - it contains preset name aka WeaponPresetXXX
    let item_main = 0;
    for (let i = 0; i < weaponPresets.data.length; i++) { // should return true or false
        if (weaponPresets.data[i]._id === weapon_preset_main) {
            item_main = weaponPresets.data[i];
            break;
        }
    }
    let item_pist = 0;
    for (let i = 0; i < weaponPresets.data.length; i++) { // should return true or false
        if (weaponPresets.data[i]._id === weapon_preset_pist) {
            item_pist = weaponPresets.data[i];
            break;
        }
    }
    let isSingleLoaded = false;
    for (let i = 0; i < presets.Single_Loading.length; i++) { // should return true or false
        if (presets.Single_Loading[i] === weapon_preset_main) {
            isSingleLoaded = true;
            break;
        }
    }
     // zero if no item
    return [[item_main, isSingleLoaded], item_pist];
}

/* Gets Compatible magazines and sort them based on slots usage 1,2,3 to 0,1,2 place in table
* input: weaponData, Grids of Rig
* output: table[Mags1Slot, Mags2Slot, Mags3Slot]
**/
function getCompatibleMagazines(weapon, grids) {
    let compatiblesmagazines = {};
	let mags = [[],[],[]];
    for (let slot of items.data[weapon._items[0]._tpl]._props.Slots) {
        if (slot._name === "mod_magazine") {
            compatiblesmagazines = slot._props.filters[0].Filter;
            break;
        }
    }
	for (let magazine of compatiblesmagazines){
		switch(items.data[magazine]._props.Height){
			case 2:
				mags[1].push(magazine);
			break;
			case 3:
				mags[2].push(magazine);
			break;
			default:
				mags[0].push(magazine);
			break;
		}
	}
    return mags;
}

function getCompatibleAmmo(weapon) {
    return items.data[weapon._items[0]._tpl]._props.Chambers[0]._props.filters[0].Filter;
}

function testRandomItems(){}
// helping functions /

function generatePocketItem(pocketNum = 1, botType) { // determine which item will be added medicament or granade

    if (utility.getRandomInt() < settings.bots.pocket.med_to_gra) {
        if (utility.getRandomInt() <= settings.bots.pocket.meds || botType === "followerBully") { // meds
            let item = {};
            const tier = bots_mf.calculateItemChance(presets.Medicaments);
            const len = presets.Medicaments[tier].length;
            const randomize = utility.getRandomInt(0,len-1);
            const itemTpl = presets.Medicaments[tier][randomize];
            let item_data = items.data[itemTpl];
            item._id = "Pocket_" + utility.getRandomIntEx(999999);
            item._tpl = itemTpl;
            item.parentId = "5c6687d65e9d882c8841f121";
            item.slotId = "pocket" + pocketNum;
            item.location = {x: 0, y: 0, r: "Horizontal"};
            item.upd = bots_mf.updCreator(item_data.parentId, item_data);
            return item;
        }
    } else {
        if (utility.getRandomInt() <= settings.bots.pocket.granade || botType === "followerBully") { // granades
            let item = {};
            const len = presets.Grenades.length;
            const randomize = utility.getRandomInt(0,len-1);
            const itemTpl = presets.Grenades[randomize];
            item._id = "Pocket_" + utility.getRandomIntEx(999999);
            item._tpl = itemTpl;
            item.parentId = "5c6687d65e9d882c8841f121";
            item.slotId = "pocket" + pocketNum;
            item.location = {x: 0, y: 0, r: "Horizontal"};
            item.upd = {StackObjectsCount: 1};
            return item;
        }
    }
    return false;
}

function getWeaponMagazine(weapon, internalId, compatiblesmags) {
    let item = {};
    item._id = "MagazineWeaponScav" + internalId;
    item._tpl = compatiblesmags;
    item.parentId = weapon._items[0]._id;
    item.slotId = "mod_magazine";

    return item;
}

function getWeaponMagazineAmmo(mag, internalId, ammoFilter) {
    let item = {};
    let max_ammo = items.data[mag._tpl]._props.Cartridges[0]._max_count;
    item._id = "AmmoMag1" + internalId;
    item._tpl = ammoFilter[utility.getRandomInt(0,ammoFilter.length-1)];
    item.parentId = mag._id;
    item.slotId = "cartridges";
    item.upd = {"StackObjectsCount": max_ammo};

    return item;
}

function getMosimAmmo(selectedmag, selectedmagid, ammoFilter) {
    let item = {};

    item._id = "AmmoMag1" + utility.getRandomIntEx(99999);
    item._tpl = ammoFilter[utility.getRandomInt(0,ammoFilter.length-1)];
    item.parentId = selectedmagid;
    item.slotId = "cartridges";
    item.upd = {"StackObjectsCount": items.data[selectedmag]._props.Cartridges[0]._max_count};

    return item;
}

function getVestMagazine(id, itemslot, Vest, Mag_tpl, loc = [0,0]) {
    let item = {};
    item._id = id;
    item._tpl = Mag_tpl;
    item.parentId = Vest;
    item.slotId = itemslot.toString();
    item.location = {"x": loc[0], "y": loc[1], "r": "Horizontal", "isSearched": true};
    return item;
}

function getVestMagazineAmmo(id, magazineid, selectedmag, ammoFilter) {
    let item = {};
    item._id = id;
    item._tpl = ammoFilter[utility.getRandomInt(0,ammoFilter.length-1)];
    item.parentId = magazineid;
    item.slotId = "cartridges";
    item.upd = {"StackObjectsCount": items.data[selectedmag]._props.Cartridges[0]._max_count};

    return item;
}

function getVestStackAmmo(id, itemslot, internalId, ammoFilter) {
    let item = {};
    let Item_tpl = ammoFilter[utility.getRandomInt(0,ammoFilter.length-1)];
    item._id = id + utility.getRandomIntEx(99999);
    item._tpl = Item_tpl;
    item.parentId = internalId;
    item.slotId = itemslot.toString();
    item.upd = {"StackObjectsCount": utility.getRandomInt(5, items.data[Item_tpl]._props.StackMaxSize - 1)}; // from 5 ammo to max avaliable in 1 stack

    return item;
}

function pushItemWeapon(weapon, Inventory, MagType = -1, TacticalVest) {
    let weap = weapon._items;
    for (let item in weap) {
        let itm = "";
        if (weap[item]._id === weapon._parent) {
            itm = {};
            // add weapon to weapon slot
            itm._id = weap[item]._id;
            itm._tpl = weap[item]._tpl;
            itm.parentId = "5c6687d65e9d882c8841f0fd";
            itm.slotId = "FirstPrimaryWeapon";
            if (MagType === "pistol") { // its secondary - main part
                itm.slotId = "Holster";
            }

            Inventory.push(itm);
        } else {
				let vest = "";
				for (let item in Inventory){
					if(Inventory[item].slotId === "TacticalVest")
					{
						vest = Inventory[item];
						break;
					}
				}
            //this is only adopted - in future made autonomic placement of ammo and mags
            if (weap[item].slotId === "mod_magazine") { // its a magazine
                let tableSizes = [[], [], []];

                if (vest._tpl !== "") {
                    for (let grid in items.data[vest._tpl]._props.Grids) {
                        let calcSize = items.data[vest._tpl]._props.Grids[grid]._props.cellsH * items.data[vest._tpl]._props.Grids[grid]._props.cellsV;
                        if (calcSize === 1)
                            tableSizes[0].push(items.data[vest._tpl]._props.Grids[grid]._name); // 1x1
                        else if (calcSize === 2 && items.data[vest._tpl]._props.Grids[grid]._props.cellsH === 1)
                            tableSizes[1].push(items.data[vest._tpl]._props.Grids[grid]._name); // 1x2 only magazines
                        else
                            tableSizes[2].push(items.data[vest._tpl]._props.Grids[grid]._name); // 2x2 no more are there -)
                    }
                }
                let compatiblesmagazines = getCompatibleMagazines(weapon, items.data[vest._tpl]._props.Grids);
                // now check where we can put magazines
				let magTypeNum = 0;
				if(compatiblesmagazines[0].length > 0) {
					compatiblesmagazines = compatiblesmagazines[0];
				} else if(compatiblesmagazines[1].length > 0) {
					compatiblesmagazines = compatiblesmagazines[1];
					magTypeNum = 1;
				} else if(compatiblesmagazines[2].length > 0) {
					compatiblesmagazines = compatiblesmagazines[2];
					magTypeNum = 2;
				}
				let len = compatiblesmagazines;
				// --- filling up vest with mags and ammo
                let random = utility.getRandomInt(0,len -1);
                let selectOneMagazineOnly = compatiblesmagazines[random]; // select one magazine type and fill everything with it
                let ammoFilter = getCompatibleAmmo(weapon); // make ammo table
                if (MagType !== "pistol") {

                    if (MagType === false) { // if its not mozin type weapon // generate main weapon magazine
                        let mag1 = getWeaponMagazine(weapon, utility.getRandomIntEx(10000), selectOneMagazineOnly);
                        let mag1Ammo = getWeaponMagazineAmmo(mag1, utility.getRandomIntEx(10000), ammoFilter);
                        Inventory.push(mag1);
                        Inventory.push(mag1Ammo);
                        // and now generate magazines for vest with ammo
                        if (vest !== "") {
							for (let slotY = 0; slotY < magTypeNum + 1; slotY++) {
								for (let i = 0; i < tableSizes[1].length; i++) {	// creating magazines for all 1x2 slots with change 80% to apearing
									if (utility.getRandomInt() <= settings.bots.vest.magChance) {
										//substring place in vest so we will have view which slots are still empty
										let mag = getVestMagazine("mag" + i + "Vest" + utility.getRandomIntEx(99999), tableSizes[1][i], vest._id, selectOneMagazineOnly, [0,slotY]);
										let ammo = getVestMagazineAmmo("AmmoMag" + utility.getRandomIntEx(999999), mag._id, mag._tpl, ammoFilter);
										Inventory.push(mag);
										Inventory.push(ammo);
									}
								}
							}
                        }
                    } else if (MagType === true) {
                        let mag1 = weap[item];
                        Inventory.push(getMosimAmmo(mag1._tpl, mag1._id, ammoFilter));
                        Inventory.push(mag1);

                    }
                    if (vest !== "") {
                        for (let i = 0; i < tableSizes[0].length; i++) {	// creating ammo stacks for all 1x1 slots
                            if (utility.getRandomInt() <= settings.bots.vest.stacksChance) {
                                let stackammo = getVestStackAmmo("StackAmmo" + utility.getRandomIntEx(99999), tableSizes[0][i], vest._id, ammoFilter);
                                Inventory.push(stackammo);
                            }
                        }
                    }
                } else {
                    let mag1 = weap[item];
                    Inventory.push(getMosimAmmo(mag1._tpl, mag1._id, ammoFilter));
                    Inventory.push(mag1);
                }
// --- filling up vest with mags and ammo
            } else {
                // add mods and vital parts
                Inventory.push(weap[item]);
            }
        }
    }
    return Inventory;
}


function generateBaseBot(params) {
    let bot = JSON.parse(utility.readJson("data/configs/bots/botBase.json"));
    // generate bot appearance
    switch (params.Role) {
        case "followerBully":
            bot['Info'].Nickname = names_f.RandomName("follower");
            bot = appeariance_f.generateAppearance(bot, "guard");
          break;

        case "marksman":
            bot['Info'].Nickname = names_f.RandomName("scav") + "(M)";
            bot = appeariance_f.generateAppearance(bot, "sniper");
          break;

        case "pmcBot":
            bot['Info'].Nickname = names_f.RandomName("pmc");
            bot = appeariance_f.generateAppearance(bot, "raider");
          break;

        default:
            bot['Info'].Nickname = names_f.RandomName("scav");
            bot = appeariance_f.generateAppearance(bot);
          break;
    }

    //BOTS CONSTANTS DEPENDING ON Role
    if (params.Role === "pmcBot") {
        settings['bots']['equipment'].backpack = 20; // force 20% backpack chance
    }
    if (params.Role === "followerBully") {
        settings['bots']['equipment'].backpack = 100;
    }

    // generate bot skill
    bot = stats_f.generateBotStats(bot, params);

    /*{"_id":"5d5ee20446b16820305c188e","_tpl":"59f32bb586f774757e1e8442","parentId":"5cb0dd1946b16858856ddff0","slotId":"Dogtag","upd":{"Dogtag":{"Nickname":"","Side":"Bear","Level":1,"Time":"0001-01-01T00:00:00","Status":"","KillerName":"","WeaponName":""}}}*/
    if (params.Role !== "followerBully" && settings['bots']['pmcWar'].enabled === true) { // generate PMC bot instead
        if (utility.getRandomInt() <= settings['bots']['pmcWar']['sideUsec']) {
            bot = appeariance_f.generateAppearance(bot, "usec");
            bot['Info'].Side = "Usec";
            bot['Inventory'].items.push({
                _id: "dogtag_" + 100000000 + utility.getRandomIntEx(899999999),
                _tpl: "59f32bb586f774757e1e8442",
                parentId: bot.Inventory.equipment,
                slotId: "Dogtag",
                upd: {
                    "Dogtag": {
                        "Nickname": bot.Info.Nickname,
                        "Side": "Usec",
                        "Level": bot.Info.Level,
                        "Time": "0001-01-01T00:00:00",
                        "Status": "Killed by",
                        "KillerName": profileName,
                        "WeaponName": ""
                    }
                }
            });
        } else {
            bot = appeariance_f.generateAppearance(bot, "bear");
            bot.Info.Side = "Bear";
            bot.Inventory.items.push({
                _id: "dogtag_" + 100000000 + utility.getRandomIntEx(899999999),
                _tpl: "59f32bb586f774757e1e8442",
                parentId: bot.Inventory.equipment,
                slotId: "Dogtag",
                upd: {
                    "Dogtag": {
                        "Nickname": bot.Info.Nickname,
                        "Side": "Bear",
                        "Level": bot.Info.Level,
                        "Time": "0001-01-01T00:00:00",
                        "Status": "Killed by",
                        "KillerName": profileName,
                        "WeaponName": "" // cannot set it out cause player can change weapon in raid
                    }
                }
            });
        }
    }


    // choose randomly a weapon from preset.json before filling items
    var weapon = generateBotWeapon(params);

    // Tactical vest Assignation
    let TacticalVest = itemPattern_f.generateItemByPattern("TacticalVest", bot.Inventory.items);
    if (TacticalVest !== {}) {
        bot['Inventory'].items = TacticalVest;
    }

    // set weapons
    if (weapon[0][0] !== 0)
        bot['Inventory'].items = pushItemWeapon(weapon[0][0], bot['Inventory'].items, weapon[0][1], TacticalVest);
    if (weapon[1] !== 0)
        bot['Inventory'].items = pushItemWeapon(weapon[1], bot['Inventory'].items, "pistol", TacticalVest);


    for (let bodyPart in bot.Health.BodyParts) { // randomize bot health <base-10 to base>
        bot.Health.BodyParts[bodyPart].Health.Current -= utility.getRandomInt(0, 10);
        bot.Health.BodyParts[bodyPart].Health.Maximum = bot.Health.BodyParts[bodyPart].Health.Current;
    }

    // add a knife (its always added)
    bot['Inventory'].items = itemPattern_f.generateItemByPattern("Scabbard", bot['Inventory'].items);

    if (utility.getRandomInt() <= settings['bots']['equipment']['eyewear']) { // chance to add glasses
        bot['Inventory'].items = itemPattern_f.generateItemByPattern("Eyewear", bot['Inventory'].items, params.Role);
    }

    if (utility.getRandomInt() <= settings['bots']['equipment']['facecover']) { // chance to add face cover
        bot['Inventory'].items = itemPattern_f.generateItemByPattern("FaceCover", bot['Inventory'].items, params.Role);
    }


    if (utility.getRandomInt() <= settings['bots']['equipment']['headwear']) { // chance to add headwear
        bot['Inventory'].items = itemPattern_f.generateItemByPattern("Headwear", bot['Inventory'].items, params.Role);
    }

    if (utility.getRandomInt() <= settings['bots']['equipment']['backpack']) { // chance to add a backpack
        bot['Inventory'].items = itemPattern_f.generateItemByPattern("Backpack", bot['Inventory'].items, params.Role);
    }

    if (utility.getRandomInt() <= settings['bots']['equipment']['armorvest']) { // chance to add an armor vest
        bot['Inventory'].items = itemPattern_f.generateItemByPattern("ArmorVest", bot['Inventory'].items, params.Role);
    }

    // chance to add a med pocket, bully followers have 100% chance
    for (let i = 1; i <= 4; i++) {// pockets fill up section
        let pocketItem_tmp = generatePocketItem(i, params.Role);
        if (pocketItem_tmp !== false) { // fill up if item was choosed
            bot['Inventory'].items.push(pocketItem_tmp);
        }
    }

    return bot;
}

function generate(databots) {
    let generatedBots = [];
    let botPossibilities = 0;

    // loop to generate all scavs
    for (let params of databots.conditions) {
        // limit spawns
        let limit = -1;

        switch (params.Role) {
            case "bossKilla":
                limit = settings.bots.limit.bossKilla;
                break;

            case "bossBully":
                limit = settings.bots.limit.bossBully;
                break;

            case "followerBully":
                limit = settings.bots.limit.bullyFollowers;
                break;

            case "marksman":
                limit = settings.bots.limit.marksman;
                break;

            case "pmcBot":
                limit = settings.bots.limit.pmcBot;
                break;

            default:
                limit = settings.bots.limit.scav;
                break;
        }

        if (limit > -1 && settings.bots.limit.overRide === true) {
            params.Limit = limit;
        }

        // generate as many as the game request
        for (let i = 0; i < params.Limit; i++) {
            switch (params.Role) {
                case "bossKilla":
                    generatedBots.push(generateBotBoss(params, "botBossKilla"));
                    break;

                case "bossBully":
                    generatedBots.push(generateBotBoss(params, "botBossBully"));
                    break;

                default:
                    generatedBots.push(generateBaseBot(params));
                    break;
            }
            botPossibilities++;
        }
    }

    console.log("[INFO][Finished Generating " + botPossibilities + " bots]", "", "", true);
    return generatedBots;
}

function generatePlayerScav() {
    let character = profile.getCharacterData();
    let playerscav = generate({"conditions": [{"Role": "assault", "Limit": 1, "Difficulty": "normal"}]});

    playerscav[0].Info.Settings = {};
    playerscav[0]._id = "5c71b934354682353958e983";
    character.data[0] = playerscav[0];

    profile.setCharacterData(character);
}

//module.exports.calculateChance = calculateChance;
module.exports.testRandomItems = testRandomItems;
module.exports.generate = generate;
module.exports.generatePlayerScav = generatePlayerScav;