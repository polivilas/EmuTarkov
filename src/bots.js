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
	bot.Customization.Head.path = "assets/content/characters/character/prefabs/"+presets.Head[utility.getRandomIntEx(presets.Head.length)] +".bundle";
	bot.Customization.Body.path = "assets/content/characters/character/prefabs/"+presets.Body[utility.getRandomIntEx(presets.Body.length)] +".bundle";
	bot.Customization.Feet.path = "assets/content/characters/character/prefabs/"+presets.Feet[utility.getRandomIntEx(presets.Feet.length)] +".bundle";

	return bot;
}

function generateBullyFollowerAppearance(bot, internalId) {
	bot._id = "guard_" + internalId;
	bot.Info.Nickname = "Guard " + i;
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
	bot.Customization.Head.path = "assets/content/characters/character/prefabs/"+presets.Head[utility.getRandomIntEx(presets.Head.length)] +".bundle";
	bot.Customization.Body.path = "assets/content/characters/character/prefabs/"+presets.Body[utility.getRandomIntEx(presets.Body.length)] +".bundle";
	bot.Customization.Feet.path = "assets/content/characters/character/prefabs/"+presets.Feet[utility.getRandomIntEx(presets.Feet.length)] +".bundle";

	return bot;
}

function generateRaiderAppearance(bot, internalId, presets) {
	bot._id = "raider_" + internalId;
	bot.Info.Nickname = "Raider " + internalId;
	bot.Info.LowerNickname = "raider" + internalId;
	bot.Info.Voice = presets.pmcBotVoices[utility.getRandomIntEx(presets.pmcBotVoices.length)];
	bot.Customization.Head.path = "assets/content/characters/character/prefabs/"+presets.Head[utility.getRandomIntEx(presets.Head.length)] +".bundle";
	bot.Customization.Body.path = "assets/content/characters/character/prefabs/"+presets.Body[utility.getRandomIntEx(presets.Body.length)] +".bundle";
	bot.Customization.Feet.path = "assets/content/characters/character/prefabs/"+presets.Feet[utility.getRandomIntEx(presets.Feet.length)] +".bundle";

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

	item._id = "TacticalVestScav"+ internalId;
	item._tpl = presets.Rigs[utility.getRandomIntEx(presets.Rigs.length)];
	item.parentId = "5c6687d65e9d882c8841f0fd";
	item.slotId = "TacticalVest";

	return item;
}

function generateBotKnife(internalId, presets) {
	var item = {};

	item._id = "ScabbardScav"+ internalId;
	item._tpl= presets.knives[utility.getRandomIntEx(presets.knives.length)];
	item.parentId = "5c6687d65e9d882c8841f0fd";
	item.slotId = "Scabbard";

	return item;
}

function generateBotGlasses(internalId, presets) {
	var item = {};
	
	item._id = "EyeWearScav"+ internalId;
	item._tpl= presets.Eyewear[utility.getRandomIntEx(presets.Eyewear.length)];
	item.parentId = "5c6687d65e9d882c8841f0fd";
	item.slotId = "Eyewear";

	return item;
}

function generateBotFaceCover(internalId, presets) {
	var item = {};

	item._id = "FaceCoverScav"+ internalId;
	item._tpl= presets.Facecovers[utility.getRandomIntEx(presets.Facecovers.length)];
	item.parentId = "5c6687d65e9d882c8841f0fd";
	item.slotId = "FaceCover";

	return item;
}

function generateBotHeadwear(internalId, presets) {
	var item = {};

	item._id = "HeadWearScav"+ internalId;
	item._tpl= presets.Headwear[utility.getRandomIntEx(presets.Headwear.length)];
	item.parentId = "5c6687d65e9d882c8841f0fd";
	item.slotId = "Headwear";

	return item;
}

function generateBotBackpack(internalId, presets) {
	var item = {};

	item._id = "BackpackScav"+ internalId;
	item._tpl= presets.Backpacks[utility.getRandomIntEx(presets.Backpacks.length)];
	item.parentId = "5c6687d65e9d882c8841f0fd";
	item.slotId = "Backpack";

	// todo: add items inside backpack

	return item;
}

function generateBotArmorVest(internalId, presets) {
	var item = {};
	var durabl = utility.getRandomIntEx(45);

	item._id = "ArmorVestScav"+ internalId;
	item._tpl= presets.Armors[utility.getRandomIntEx(presets.Armors.length)];
	item.parentId = "5c6687d65e9d882c8841f0fd";
	item.slotId = "ArmorVest";
	item.upd = {"Repairable": {"Durability": durabl }};

	return item;
}

function generateBotMedPocket(internalId, presets) {
	var item = {};

	item._id = "PocketMedScav"+ internalId;
	item._tpl= presets.meds[utility.getRandomIntEx(presets.meds.length)];
	item.parentId = "5c6687d65e9d882c8841f121";
	item.slotId = "pocket2";
	item.location = {"x": 0,"y": 0,"r": 0};

	return item;
}

function generateBotItemPocket(internalId, presets) {
	var item = {};

	item._id = "PocketItemScav"+ internalId;
	item._tpl= presets.Grenades[utility.getRandomIntEx(presets.Grenades.length)];
	item.parentId = "5c6687d65e9d882c8841f121";
	item.slotId = "pocket1";
	item.location = {"x": 0,"y": 0,"r": 0};

	return item;
}

function generateBaseBot(params, presets, weaponPresets) {
	var bot = JSON.parse(utility.readJson("data/bots/botBase.json"));
	var internalId = utility.getRandomIntEx(10000);

	if (botSettings.pmcWar.enabled == true) {
		// generate only PMC appearance
		if (utility.getRandomIntEx(100) >= botSettings.spawn.pmcWarUsec) { 
			bot = generateUsecAppearance(bot, params);
			bot.Info.Side = "Usec";
		} else {
			bot = generateBearAppearance(bot, params);
			bot.Info.Side = "Bear";
		}
	} else {
		// generate scav appearance
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
	}

	// generate bot skill
	bot = generateBotSkill(bot, params);

	// choose randomly a weapon from preset.json before filling items
	var Weapon = generateBotWeapon(Weapon, params, presets, weaponPresets);

	// add a vest or rig on the scav (can be an armored vest)
	bot.Inventory.items.push(generateBotVestRigItem(internalId, presets));

	// fill your dummy bot with the random selected preset weapon and its mods
	Weapon._items.forEach(function(item) {
		if (item._id == Weapon._parent) { //if its the weapon itself then add it differently
			if (Weapon.isPistol == false ) {
				var tempw = {};
				
				tempw._id = item._id;
				tempw._tpl = item._tpl;
				tempw.parentId = "5c6687d65e9d882c8841f0fd";
				tempw.slotId = "FirstPrimaryWeapon";
				bot.Inventory.items.push(tempw);
			}

			if (Weapon.isPistol == true) {
				var tempw = {};
				tempw._id = item._id;
				tempw._tpl = item._tpl;
				tempw.parentId = "5c6687d65e9d882c8841f0fd";
				tempw.slotId = "Holster";
				bot.Inventory.items.push(tempw);
			}
		} else { //add mods, vital parts, etcc
			//randomize magazine
			if (item.slotId == "mod_magazine" ) {
				var compatiblesmags = {};

				for (var slot of items.data[Weapon._items[0]._tpl]._props.Slots) {
					if (slot._name == "mod_magazine") {
						compatiblesmags = slot._props.filters[0].Filter; //array of compatible mags for this weapon
						break;
					}
				}

				var ammo_filter = items.data[Weapon._items[0]._tpl]._props.Chambers[0]._props.filters[0].Filter //array of compatible ammos
				var isMosin = false;

				presets.filter_mosin.forEach(function(someMosinId) {
					if (Weapon._items[0]._tpl == someMosinId) {
						isMosin = true;
					} //check if the weapon given is a mosin
				});

				if (isMosin == false) {
					//add a magazine
					var tempw = {};

					tempw._id = "MagazineWeaponScav"+ internalId;
					tempw._tpl = compatiblesmags[utility.getRandomIntEx(compatiblesmags.length)]; //randomize the magazine of the weapon
					
					var selectedmag = tempw._tpl //store this value
					
					tempw.parentId = Weapon._items[0]._id; //put this mag on the weapon
					tempw.slotId = "mod_magazine";
					bot.Inventory.items.push(tempw);

					//then fill ammo of randomized mag
					var tempw = {};
					
					tempw._id = "AmmoMagazine1Scav"+ internalId;
					tempw._tpl = ammo_filter[utility.getRandomIntEx(ammo_filter.length)]; //randomize ammo inside the mag
					tempw.parentId = "MagazineWeaponScav"+ internalId;
					tempw.slotId = "cartridges";
					tempw.upd = {"StackObjectsCount": items.data[selectedmag]._props.Cartridges[0]._max_count }; //fill the magazine
					bot.Inventory.items.push(tempw);
				} else { //don't randomize mosin magazine !
					bot.Inventory.items.push(item);
					
					//add a magazine
					var tempw = {};
					
					tempw._id = "AmmoMagazine1Scav"+ internalId;
					tempw._tpl = ammo_filter[utility.getRandomIntEx(ammo_filter.length)]; //randomize ammo inside the mag
					tempw.parentId = item._id ;
					tempw.slotId = "cartridges";
					tempw.upd = {"StackObjectsCount": items.data[item._tpl]._props.Cartridges[0]._max_count }; //fill the magazine
					bot.Inventory.items.push(tempw);
				}

				//add magazine in the vest
				var tempw = {};
				
				tempw._id = "magazine2VestScav"+ internalId;
				tempw._tpl = compatiblesmags[utility.getRandomIntEx(compatiblesmags.length)]; //randomize this magazine too
				
				var selectedmag = tempw._tpl; //store the selected magazine template for ammo
				
				tempw.parentId = "TacticalVestScav"+ internalId;
				tempw.slotId = "2";
				tempw.location = {"x": 0,"y": 0,"r": 0};
				bot.Inventory.items.push(tempw);

				//add ammo in the magazine INSIDE THE VEST-RIG
				var tempw = {};
				
				tempw._id = "AmmoMagazine2Scav"+ internalId;
				tempw._tpl = ammo_filter[utility.getRandomIntEx(ammo_filter.length)];
				tempw.parentId = "magazine2VestScav"+ internalId;
				tempw.slotId = "cartridges";
				tempw.upd = {"StackObjectsCount": items.data[selectedmag]._props.Cartridges[0]._max_count };
				bot.Inventory.items.push(tempw);

				//add another magazine in the vest
				var tempw = {};
				
				tempw._id = "magazine3VestScav"+ internalId;
				tempw._tpl = compatiblesmags[utility.getRandomIntEx(compatiblesmags.length)]; //randomize this magazine too
				
				var selectedmag = tempw._tpl; //store the selected magazine template for ammo
				
				tempw.parentId = "TacticalVestScav"+ internalId;
				tempw.slotId = "3";
				tempw.location = {"x": 0,"y": 0,"r": 0};
				bot.Inventory.items.push(tempw);

				var tempw = {};
				
				tempw._id = "AmmoMagazine3Scav"+ internalId;
				tempw._tpl = ammo_filter[utility.getRandomIntEx(ammo_filter.length)];
				tempw.parentId = "magazine3VestScav"+ internalId;
				tempw.slotId = "cartridges";
				tempw.upd = {"StackObjectsCount": items.data[selectedmag]._props.Cartridges[0]._max_count };
				bot.Inventory.items.push(tempw);

				//add a stack of ammo for moslings and sks
				var tempw = {};
				
				tempw._id = "AmmoFree2Scav"+ internalId;
				tempw._tpl = ammo_filter[utility.getRandomIntEx(ammo_filter.length)];
				tempw.parentId = "TacticalVestScav"+ internalId;
				tempw.slotId = "1";
				tempw.upd = {"StackObjectsCount": utility.getRandomInt(10,30) };
				bot.Inventory.items.push(tempw);
			} else {
				bot.Inventory.items.push(item); //add mods and vital parts
			}
		}
	});

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
				limit = botSettings.spawner.limit.bossKilla;
				break;

			case "bossBully":
				limit = botSettings.spawner.limit.bossBully;
				break;

			case "followerBully":
				limit = botSettings.spawner.limit.bullyFollowers;
				break;

			case "marksman":
				limit = botSettings.spawner.limit.marksman;
				break;

			case "pmcBot":
				limit = botSettings.spawner.limit.pmcBot;
				break;

			default:
				break;
		}

		if (limit > 0) {
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