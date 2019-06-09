"use strict";

var utility = require('./utility.js');
var settings = require('./settings.js');

var botSettings = settings.getBotSettings();
var items = JSON.parse(utility.readJson('data/items.json'));

function generateBotBossKilla(params) {
	var boss = JSON.parse(utility.readJson("data/bots/botBossKilla.json"));

	boss.Info.Settings.Role = params.Role;
	boss.Info.Settings.BotDifficulty = params.Difficulty;
	
	return boss;
}

function generateBotBossBully(params) {
	var boss = JSON.parse(utility.readJson("data/bots/botBossBully.json"));

	boss.Info.Settings.Role = params.Role;
	boss.Info.Settings.BotDifficulty = params.Difficulty;

	return boss;
}

function generateRandomPmcBot(bot, params) {
	if (utility.getRandomIntEx(100) >= botSettings.spawn.usec) { 
		bot = generateUsecAppearance(bot, params);
		bot.Info.Side = "Usec";
	} else {
		bot = generateBearAppearance(bot, params);
		bot.Info.Side = "Bear";
	}

	return bot;
}

function generateUsecAppearance(bot, internalId) {
	bot._id = "Usec" + internalId;
	bot.Info.Nickname = "Usec " + internalId;
	bot.Info.LowerNickname = "usec" + internalId;
	bot.Info.Voice = "Usec_"+utility.getRandomInt(1,3);
	bot.Customization.Head.path = "assets/content/characters/character/prefabs/usec_head_1.bundle";
	bot.Customization.Body.path = "assets/content/characters/character/prefabs/usec_body.bundle";
	bot.Customization.Feet.path = "assets/content/characters/character/prefabs/usec_feet.bundle";

	return bot;
}

function generateBearAppearance(bot, internalId) {
	bot._id = "Bear" + internalId;
	bot.Info.Nickname = "Bear " + internalId;
	bot.Info.LowerNickname = "Bear" + internalId;
	bot.Info.Voice = "Bear_"+utility.getRandomInt(1,2);
	bot.Customization.Head.path = "assets/content/characters/character/prefabs/bear_head.bundle";
	bot.Customization.Body.path = "assets/content/characters/character/prefabs/bear_body.bundle";
	bot.Customization.Feet.path = "assets/content/characters/character/prefabs/bear_feet.bundle";

	return bot;
}

function generateScavAppearance(bot, internalId, presets) {
	bot._id = "scav_" + internalId;
	bot.Info.Nickname = "Scav " + internalId;
	bot.Info.LowerNickname = "scav" + internalId;
	bot.Info.Voice = "Scav_" + utility.getRandomInt(1,6);
	bot.Customization.Head.path = "assets/content/characters/character/prefabs/" + presets.Head[utility.getRandomIntEx(presets.Head.length)] + ".bundle";
	bot.Customization.Body.path = "assets/content/characters/character/prefabs/" + presets.Body[utility.getRandomIntEx(presets.Body.length)] + ".bundle";
	bot.Customization.Feet.path = "assets/content/characters/character/prefabs/" + presets.Feet[utility.getRandomIntEx(presets.Feet.length)] + ".bundle";

	return bot;
}

function generateBullyFollowerAppearance(bot, internalId) {
	bot._id = "guard_" + internalId;
	bot.Info.Nickname = "Guard " + internalId;
	bot.Info.LowerNickname = "guard" + internalId;
	bot.Info.Voice = "Scav_" + utility.getRandomInt(1,6);
	bot.Customization.Head.path = "assets/content/characters/character/prefabs/wild_head_1.bundle";
	bot.Customization.Body.path = "assets/content/characters/character/prefabs/wild_security_body_1.bundle";
	bot.Customization.Feet.path = "assets/content/characters/character/prefabs/wild_security_feet_1.bundle";

	return bot;
}

function generateScavSniperAppearance(bot, internalId, presets) {
	bot._id = "sniper_" + internalId;
	bot.Info.Nickname = "Sniper " + internalId;
	bot.Info.LowerNickname = "sniper" + internalId;
	bot.Info.Voice = "Scav_" + utility.getRandomInt(1,6);
	bot.Customization.Head.path = "assets/content/characters/character/prefabs/" + presets.Head[utility.getRandomIntEx(presets.Head.length)] + ".bundle";
	bot.Customization.Body.path = "assets/content/characters/character/prefabs/" + presets.Body[utility.getRandomIntEx(presets.Body.length)] + ".bundle";
	bot.Customization.Feet.path = "assets/content/characters/character/prefabs/" + presets.Feet[utility.getRandomIntEx(presets.Feet.length)] + ".bundle";

	return bot;
}

function generateRaiderAppearance(bot, internalId, presets) {
	bot._id = "raider_" + internalId;
	bot.Info.Nickname = "Raider " + internalId;
	bot.Info.LowerNickname = "raider" + internalId;
	bot.Info.Voice = presets.pmcBotVoices[utility.getRandomIntEx(presets.pmcBotVoices.length)];
	bot.Customization.Head.path = "assets/content/characters/character/prefabs/" + presets.Head[utility.getRandomIntEx(presets.Head.length)] + ".bundle";
	bot.Customization.Body.path = "assets/content/characters/character/prefabs/" + presets.Body[utility.getRandomIntEx(presets.Body.length)] + ".bundle";
	bot.Customization.Feet.path = "assets/content/characters/character/prefabs/" + presets.Feet[utility.getRandomIntEx(presets.Feet.length)] + ".bundle";

	return bot;
}

function generateBotSkill(bot, params) {
	// ai settings
	bot.Info.Settings.Role = params.Role;
	bot.Info.Settings.BotDifficulty = params.Difficulty;

	// randomize skills
	bot.Skills.Common.forEach(function(skill) {
		skill.Progress = utility.getRandomIntEx(5000);
		skill.MaxAchieved = skill.Progress;
	});

	// randomize experience
	bot.Info.Experience = utility.getRandomIntEx(25000000); //level 70 max

	return bot;
}

function generateBotWeapon(item, params, presets, weaponPresets) {
	item = weaponPresets.data[utility.getRandomIntEx(weaponPresets.data.length)];
	
	// get marksman weapon
	if (params.Role == "marksman") {
		var found = false;
		
		while (found == false) {
			item = weaponPresets.data[utility.getRandomIntEx(weaponPresets.data.length)];

			presets.filter_marksman.forEach(function(filter) {
				if (item._items[0]._tpl == filter) {
					found = true;
				}
			});
		}
	}

	// check if its a pistol or primary weapon
	item.isPistol = false;

	presets.pistols.forEach(function(pistoltpl) {
		if (pistoltpl == item._items[0]._tpl) {
			item.isPistol = true;
		}
	});

	return item;
}

function generateBotVestRigItem(internalId, presets) {
	var item = {};

	item._id = "TacticalVestScav" + internalId;
	item._tpl = presets.Rigs[utility.getRandomIntEx(presets.Rigs.length)];
	item.parentId = "5c6687d65e9d882c8841f0fd";
	item.slotId = "TacticalVest";

	return item;
}

function generateBotKnife(internalId, presets) {
	var item = {};

	item._id = "ScabbardScav" + internalId;
	item._tpl= presets.knives[utility.getRandomIntEx(presets.knives.length)];
	item.parentId = "5c6687d65e9d882c8841f0fd";
	item.slotId = "Scabbard";

	return item;
}

function generateBotGlasses(internalId, presets) {
	var item = {};
	
	item._id = "EyeWearScav" + internalId;
	item._tpl= presets.Eyewear[utility.getRandomIntEx(presets.Eyewear.length)];
	item.parentId = "5c6687d65e9d882c8841f0fd";
	item.slotId = "Eyewear";

	return item;
}

function generateBotFaceCover(internalId, presets) {
	var item = {};

	item._id = "FaceCoverScav" + internalId;
	item._tpl= presets.Facecovers[utility.getRandomIntEx(presets.Facecovers.length)];
	item.parentId = "5c6687d65e9d882c8841f0fd";
	item.slotId = "FaceCover";

	return item;
}

function generateBotHeadwear(internalId, presets) {
	var item = {};

	item._id = "HeadWearScav" + internalId;
	item._tpl= presets.Headwear[utility.getRandomIntEx(presets.Headwear.length)];
	item.parentId = "5c6687d65e9d882c8841f0fd";
	item.slotId = "Headwear";

	return item;
}

function generateBotBackpack(internalId, presets) {
	var item = {};

	item._id = "BackpackScav" + internalId;
	item._tpl= presets.Backpacks[utility.getRandomIntEx(presets.Backpacks.length)];
	item.parentId = "5c6687d65e9d882c8841f0fd";
	item.slotId = "Backpack";

	// todo: add items inside backpack

	return item;
}

function generateBotArmorVest(internalId, presets) {
	var item = {};
	var durabl = utility.getRandomIntEx(45);

	item._id = "ArmorVestScav" + internalId;
	item._tpl= presets.Armors[utility.getRandomIntEx(presets.Armors.length)];
	item.parentId = "5c6687d65e9d882c8841f0fd";
	item.slotId = "ArmorVest";
	item.upd = {"Repairable": {"Durability": durabl}};

	return item;
}

function generateBotMedPocket(internalId, presets) {
	var item = {};

	item._id = "PocketMedScav" + internalId;
	item._tpl= presets.meds[utility.getRandomIntEx(presets.meds.length)];
	item.parentId = "5c6687d65e9d882c8841f121";
	item.slotId = "pocket2";
	item.location = {"x": 0,"y": 0,"r": 0};

	return item;
}

function generateBotItemPocket(internalId, presets) {
	var item = {};

	item._id = "PocketItemScav" + internalId;
	item._tpl= presets.Grenades[utility.getRandomIntEx(presets.Grenades.length)];
	item.parentId = "5c6687d65e9d882c8841f121";
	item.slotId = "pocket1";
	item.location = {"x": 0,"y": 0,"r": 0};

	return item;
}

function assignWeaponToPrimary(weapon) {
	var item = {};
				
	item._id = weapon._id;
	item._tpl = weapon._tpl;
	item.parentId = "5c6687d65e9d882c8841f0fd";
	item.slotId = "FirstPrimaryWeapon";

	return item;
}

function assignWeaponToHolster(weapon) {
	var item = {};
	
	item._id = weapon._id;
	item._tpl = weapon._tpl;
	item.parentId = "5c6687d65e9d882c8841f0fd";
	item.slotId = "Holster";

	return item;
}

function getCompatibleMagazines() {
	var compatiblesmagazines = {};

	for (var slot of items.data[weapon._items[0]._tpl]._props.Slots) {
		if (slot._name == "mod_magazine") {
			// array of compatible mags for this weapon
			compatiblesmagazines = slot._props.filters[0].Filter;
			break;
		}
	}

	return compatiblesmagazines;
}

function getRandomMagazine(weapon, internalId, compatiblesmags) {
	var item = {};

	item._id = "MagazineWeaponScav" + internalId;
	item._tpl = compatiblesmags[utility.getRandomIntEx(compatiblesmags.length)];
	item.parentId = weapon._items[0]._id;
	item.slotId = "mod_magazine";
	bot.Inventory.items.push(item);	

	return item;
}

function getMagazineAmmo(selectedmag, internalId, ammoFilter) {
	var item = {};
	
	item._id = "AmmoMagazine1Scav" + internalId;
	item._tpl = ammoFilter[utility.getRandomIntEx(ammoFilter.length)];
	item.parentId = "MagazineWeaponScav" + internalId;
	item.slotId = "cartridges";
	item.upd = {"StackObjectsCount": items.data[selectedmag]._props.Cartridges[0]._max_count};

	return item;
}

function getMosimAmmo(internalId, ammoFilter) {
	var item = {};
					
	item._id = "AmmoMagazine1Scav" + internalId;
	item._tpl = ammoFilter[utility.getRandomIntEx(ammoFilter.length)];
	item.parentId = item._id ;
	item.slotId = "cartridges";
	item.upd = {"StackObjectsCount": items.data[item._tpl]._props.Cartridges[0]._max_count};

	return item;
}

function getVestMagazine(id, itemslot, internalId, compatiblesmags) {
	var item = {};

	item._id = id + internalId;
	item._tpl = compatiblesmags[utility.getRandomIntEx(compatiblesmags.length)];
	item.parentId = "TacticalVestScav" + internalId;
	item.slotId = itemslot.toString();
	item.location = {"x": 0,"y": 0,"r": 0};

	return item;
}

function getVestMagazineAmmo(id, magazineid, selectedmag, internalId, ammoFilter) {
	var item = {};
				
	item._id = id + internalId;
	item._tpl = ammoFilter[utility.getRandomIntEx(ammoFilter.length)];
	item.parentId = magazineid + internalId;
	item.slotId = "cartridges";
	item.upd = {"StackObjectsCount": items.data[selectedmag]._props.Cartridges[0]._max_count};

	return item;
}

function getVestStackAmmo(id, itemslot, internalId, ammoFilter) {
	var item = {};
				
	item._id = id + internalId;
	item._tpl = ammoFilter[utility.getRandomIntEx(ammoFilter.length)];
	item.parentId = "TacticalVestScav" + internalId;
	item.slotId = itemslot.toString();
	item.upd = {"StackObjectsCount": utility.getRandomInt(10,30)};

	return item;
}

function generateBaseBot(params, presets, weaponPresets) {
	var bot = JSON.parse(utility.readJson("data/bots/botBase.json"));
	var internalId = utility.getRandomIntEx(10000);

	// generate scav bots
	switch (params.Role) {
		case "followerBully":
			bot = generateBullyFollowerAppearance(bot, params);
			break;

		case "marksman":
			bot = generateScavSniperAppearance(bot, params, presets);
			break;

		case "pmcBot":
			bot = generateRaiderAppearance(bot, params, presets);
			break;
		
		default:
			bot = generateScavAppearance(bot, params, presets);
			break;
	}

	// generate PMC bot instead
	if (params.Role != "followerBully") {
		if (botSettings.pmcWar.enabled == true || utility.getRandomIntEx(100) >= botSettings.spawn.pmc) {
			bot = generateRandomPmcBot(bot, params);
		}
	}

	// generate bot skill
	bot = generateBotSkill(bot, params);

	// choose randomly a weapon from preset.json before filling items
	var weapon = generateBotWeapon(weapon, params, presets, weaponPresets);

	// add a vest or rig on the scav (can be an armored vest)
	bot.Inventory.items.push(generateBotVestRigItem(internalId, presets));

	// fill your dummy bot with the random selected preset weapon and its mods
	weapon._items.forEach(function(item) {
		// add weapon to weapon slot
		if (item._id == weapon._parent) {
			if (weapon.isPistol == false) {
				bot.Inventory.items.push(assignWeaponToPrimary(item));
			} else {
				bot.Inventory.items.push(assignWeaponToHolster(item));
			}
		} else {
			// add mods, vital parts, etc
			if (item.slotId == "mod_magazine" ) {
				// randomize magazine
				var compatiblesmagazines = getCompatibleMagazines();
				var ammoFilter = items.data[weapon._items[0]._tpl]._props.Chambers[0]._props.filters[0].Filter //array of compatible ammos
				var isMosin = false;

				 // check if the weapon is a mosin
				presets.filter_mosin.forEach(function(someMosinId) {
					if (weapon._items[0]._tpl == someMosinId) {
						isMosin = true;
					}
				});

				// give the weapon ammo
				if (isMosin == false) {
					var magazine = getRandomMagazine(weapon, internalId, compatiblesmagazines);
					
					bot.Inventory.items.push(magazine);
					bot.Inventory.items.push(getMagazineAmmo(magazine._tpl, internalId, ammoFilter));
				} else {
					bot.Inventory.items.push(getMosimAmmo(internalId, ammoFilter));
				}

				//add magazines in the vest
				var mag2 = getVestMagazine("magazine2VestScav", 2, internalId, compatiblesmagazines);
				var mag3 = getVestMagazine("magazine3VestScav", 3, internalId, compatiblesmagazines);
				
				bot.Inventory.items.push(mag2);
				bot.Inventory.items.push(mag3);

				// add ammo to the magazines in the vest				
				bot.Inventory.items.push(getVestMagazineAmmo("AmmoMagazine2Scav", "magazine2VestScav", mag2._tpl, internalId, ammoFilter));
				bot.Inventory.items.push(getVestMagazineAmmo("AmmoMagazine3Scav", "magazine3VestScav", mag3._tpl, internalId, ammoFilter));

				//add a stack of ammo (for moslings and sks)
				bot.Inventory.items.push(getVestStackAmmo("AmmoFree2Scav", 1, internalId, ammoFilter));
			} else {
				//add mods and vital parts
				bot.Inventory.items.push(item);
			}
		}
	});

	// randomize bot health
	for (var bdpt in bot.Health.BodyParts) {
		bot.Health.BodyParts[bdpt].Health.Current = bot.Health.BodyParts[bdpt].Health.Current + utility.getRandomInt(-10,10);
		bot.Health.BodyParts[bdpt].Health.Maximum = bot.Health.BodyParts[bdpt].Health.Current;
	}

	// add a knife
	bot.Inventory.items.push(generateBotKnife(internalId, presets));

	// chance to add glasses
	if (utility.getRandomIntEx(100) <= botSettings.spawn.glasses) {
		bot.Inventory.items.push(generateBotGlasses(internalId, presets));
	}

	// chance to add face cover
	if (utility.getRandomIntEx(100) <= botSettings.spawn.faceCover) {
		bot.Inventory.items.push(generateBotFaceCover(internalId, presets));
	}

	// chance to add headwear
	if (utility.getRandomIntEx(100) <= botSettings.spawn.headwear) {
		bot.Inventory.items.push(generateBotHeadwear(internalId, presets));
	}

	// chance to add a backpack
	if (utility.getRandomIntEx(100) <= botSettings.spawn.backpack) {
		bot.Inventory.items.push(generateBotBackpack(internalId, presets));
	}

	// chance to add an armor vest
	if (utility.getRandomIntEx(100) <= botSettings.spawn.armorVest) {
		bot.Inventory.items.push(generateBotArmorVest(internalId, presets));
	}

	// chance to add a med pocket, bully followers have 100% chance
	if (utility.getRandomIntEx(100) <= botSettings.spawn.medPocket || params.Role == "followerBully") {
		bot.Inventory.items.push(generateBotMedPocket(internalId, presets));
	}

	// chance to add a item pocket, bully followers have 100% chance
	if (utility.getRandomIntEx(100) <= botSettings.spawn.itemPocket || params.Role == "followerBully") {
		bot.Inventory.items.push(generateBotItemPocket(internalId, presets));
	}

	return bot;
}

function generate(databots) {
	var presets = JSON.parse(utility.readJson("data/bots/botSettings.json"));
	var weaponPresets = JSON.parse(utility.readJson("data/bots/botWeapons.json"));
	var generatedBots = [];
	var botPossibilities = 0;

	// loop to generate all scavs
	databots.conditions.forEach(function(params) {
		// limit spawns
		var limit = 0;

		switch (params.Role) {
			case "bossKilla":
				limit = botSettings.limit.bossKilla;
				break;

			case "bossBully":
				limit = botSettings.limit.bossBully;
				break;

			case "followerBully":
				limit = botSettings.limit.bullyFollowers;
				break;

			case "marksman":
				limit = botSettings.limit.marksman;
				break;

			case "pmcBot":
				limit = botSettings.limit.pmcBot;
				break;

			default:
				limit = botSettings.limit.scav;
				break;
		}

		if (limit > -1) {
			params.Limit = limit;
		}

		// generate as many as the game request
		switch (params.Role) {
			case "bossKilla":
				for (var i = 1; i <= params.Limit; i++)  {
					generatedBots.push(generateBotBossKilla(params));
					botPossibilities++;
				}
				break;
			
			case "bossBully":
				for (var i = 1; i <= params.Limit; i++)  {
					generatedBots.push(generateBotBossBully(params));
					botPossibilities++;
				}
				break;

			default:
				for (var i = 1; i <= params.Limit; i++)  {
					generatedBots.push(generateBaseBot(params, presets, weaponPresets));
					botPossibilities++;
				}
				break;
		}
	});

	console.log("generated " + botPossibilities + " scavs possibilities");
	return generatedBots;
}

module.exports.generate = generate;