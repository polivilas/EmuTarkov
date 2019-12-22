"use strict";

require('../libs.js');

let items = json.parse(json.read(filepaths.user.cache.items));
let presets = json.parse(json.read("data/configs/bots/botPresets.json"));
let weaponPresets = json.parse(json.read("data/configs/bots/botWeapons.json"));
let names = json.parse(json.read("data/configs/bots/botNames.json"));
let settings = json.parse(json.read(filepaths.user.config));
let handbook = json.parse(json.read(filepaths.user.cache.templates));

function generateBotBossKilla(params) {
	let boss = json.parse(json.read("data/configs/bots/botBossKilla.json"));

	boss.Info.Settings.Role = params.Role;
	boss.Info.Settings.BotDifficulty = params.Difficulty;
	
	return boss;
}

function generateBotBossBully(params) {
	let boss = json.parse(json.read("data/configs/bots/botBossBully.json"));

	boss.Info.Settings.Role = params.Role;
	boss.Info.Settings.BotDifficulty = params.Difficulty;

	return boss;
}

function generateUsecAppearance(bot, internalId) {
	bot._id = "Usec" + internalId;
	bot.Info.Nickname = "Usec " + internalId;
	bot.Info.LowerNickname = "usec" + internalId;
	bot.Info.Voice = "Usec_" + utility.getRandomInt(1, 3);
	bot.Customization.Head.path = "assets/content/characters/character/prefabs/usec_head_1.bundle";
	bot.Customization.Body.path = "assets/content/characters/character/prefabs/usec_body.bundle";
	bot.Customization.Feet.path = "assets/content/characters/character/prefabs/usec_feet.bundle";

	return bot;
}

function generateBearAppearance(bot, internalId) {
	bot._id = "Bear" + internalId;
	bot.Info.Nickname = "Bear " + internalId;
	bot.Info.LowerNickname = "Bear" + internalId;
	bot.Info.Voice = "Bear_" + utility.getRandomInt(1, 2);
	bot.Customization.Head.path = "assets/content/characters/character/prefabs/bear_head.bundle";
	bot.Customization.Body.path = "assets/content/characters/character/prefabs/bear_body.bundle";
	bot.Customization.Feet.path = "assets/content/characters/character/prefabs/bear_feet.bundle";

	return bot;
}

function generateScavAppearance(bot, internalId, presets) {
	bot._id = "scav_" + internalId;
	bot.Info.LowerNickname = "scav" + internalId;
	bot.Info.Voice = "Scav_" + utility.getRandomInt(1, 6);
	bot.Customization.Head.path = "assets/content/characters/character/prefabs/" + presets.Head[utility.getRandomIntEx(presets.Head.length)] + ".bundle";
	bot.Customization.Body.path = "assets/content/characters/character/prefabs/" + presets.Body[utility.getRandomIntEx(presets.Body.length)] + ".bundle";
	bot.Customization.Feet.path = "assets/content/characters/character/prefabs/" + presets.Feet[utility.getRandomIntEx(presets.Feet.length)] + ".bundle";

	return bot;
}

function generateBullyFollowerAppearance(bot, internalId) {
	bot._id = "guard_" + internalId;
	bot.Info.Nickname = "Guard " + internalId;
	bot.Info.LowerNickname = "guard" + internalId;
	bot.Info.Voice = "Scav_" + utility.getRandomInt(1, 6);
	bot.Customization.Head.path = "assets/content/characters/character/prefabs/wild_head_1.bundle";
	bot.Customization.Body.path = "assets/content/characters/character/prefabs/wild_security_body_1.bundle";
	bot.Customization.Feet.path = "assets/content/characters/character/prefabs/wild_security_feet_1.bundle";

	return bot;
}

function generateScavSniperAppearance(bot, internalId) {
	bot._id = "sniper_" + internalId;
	bot.Info.Nickname = "Sniper " + internalId;
	bot.Info.LowerNickname = "sniper" + internalId;
	bot.Info.Voice = "Scav_" + utility.getRandomInt(1, 6);
	bot.Customization.Head.path = "assets/content/characters/character/prefabs/" + presets.Head[utility.getRandomIntEx(presets.Head.length)] + ".bundle";
	bot.Customization.Body.path = "assets/content/characters/character/prefabs/" + presets.Body[utility.getRandomIntEx(presets.Body.length)] + ".bundle";
	bot.Customization.Feet.path = "assets/content/characters/character/prefabs/" + presets.Feet[utility.getRandomIntEx(presets.Feet.length)] + ".bundle";

	return bot;
}

function generateRaiderAppearance(bot, internalId) {
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
	for (let skill of bot.Skills.Common) {
		skill.Progress = utility.getRandomIntEx(5000);
		skill.MaxAchieved = skill.Progress;
	}

	// randomize experience
	bot.Info.Experience = utility.getRandomIntEx(5000000); //level 54 max

	return bot;
}

function generateBotWeapon(item, params) {
	item = weaponPresets.data[utility.getRandomIntEx(weaponPresets.data.length)];
	
	// get marksman weapon
	if (params.Role == "marksman") {
		let found = false;
		
		while (found == false) {
			item = weaponPresets.data[utility.getRandomIntEx(weaponPresets.data.length)];
			
			for (let filter of presets.filter_marksman) {
				if (item._items[0]._tpl == filter) {
					found = true;
				}
			}
		}
	}

	// check if its a pistol or primary weapon
	item.isPistol = false;

	for (let pistoltpl of presets.pistols) {
		if (pistoltpl == item._items[0]._tpl) {
			item.isPistol = true;
		}
	}

	return item;
}

function generateBotVestRigItem(internalId) {
	let item = {};

	item._id = "TacticalVestScav" + internalId;
	item._tpl = presets.Rigs[utility.getRandomIntEx(presets.Rigs.length)];
	item.parentId = "5c6687d65e9d882c8841f0fd";
	item.slotId = "TacticalVest";

	return item;
}

function generateBotKnife(internalId) {
	let item = {};

	item._id = "ScabbardScav" + internalId;
	item._tpl= presets.knives[utility.getRandomIntEx(presets.knives.length)];
	item.parentId = "5c6687d65e9d882c8841f0fd";
	item.slotId = "Scabbard";

	return item;
}

function generateBotGlasses(internalId) {
	let item = {};
	
	item._id = "EyeWearScav" + internalId;
	item._tpl= presets.Eyewear[utility.getRandomIntEx(presets.Eyewear.length)];
	item.parentId = "5c6687d65e9d882c8841f0fd";
	item.slotId = "Eyewear";

	return item;
}

function generateBotFaceCover(internalId) {
	let item = {};

	item._id = "FaceCoverScav" + internalId;
	item._tpl= presets.Facecovers[utility.getRandomIntEx(presets.Facecovers.length)];
	item.parentId = "5c6687d65e9d882c8841f0fd";
	item.slotId = "FaceCover";

	return item;
}

function generateBotHeadwear(internalId) {
	let item = {};

	item._id = "HeadWearScav" + internalId;
	item._tpl= presets.Headwear[utility.getRandomIntEx(presets.Headwear.length)];
	item.parentId = "5c6687d65e9d882c8841f0fd";
	item.slotId = "Headwear";

	return item;
}

function generateBotFaceShield(headwearTemplate,internalId) {
	let headwearItem = items.data[headwearTemplate]._props;
	
	if (headwearItem.Slots.length > 0 && utility.getRandomIntEx(100) <= 100) {
		for (let itemSlot of headwearItem.Slots) {
			if (itemSlot._name == "mod_equipment" || itemSlot._name == "mod_equipment_000" ) {
				let itemslotname = itemSlot._name;

				if (itemSlot._props.filters[0].Filter.length > 0) {
					let compat = itemSlot._props.filters[0].Filter;
					let item = {};
	
					item._id = "FaceShieldScav" + internalId;
					item._tpl= compat[utility.getRandomIntEx(compat.length)];
					item.parentId = "HeadWearScav" + internalId;
					item.slotId = itemslotname;
					item.upd = {"Togglable": {"On": true}};
					
					return item;
				}
			}
		}		
	}

	return null;
}

function generateBotBackpack(internalId) {
	let item = {};

	item._id = "BackpackScav" + internalId;
	item._tpl= presets.Backpacks[utility.getRandomIntEx(presets.Backpacks.length)];
	item.parentId = "5c6687d65e9d882c8841f0fd";
	item.slotId = "Backpack";

	return item;
}

function generateBotBackpackItem(internalId,backpackId) {
	let item = {};
		
	// be very carefull with this ... 
	while (true) {
		let found = true;
		let itemHandbook = handbook.data.Items[utility.getRandomIntEx(handbook.data.Items.length)];

		for (let expt of presets.item_backpack_exceptions) {	
			if (expt == itemHandbook.ParentId) {
				found = false;
			}
		}

		if (found == true) {
			item._id = "BackpackItemScav" + internalId;
			item._tpl = itemHandbook.Id;
			item.parentId = backpackId;
			item.slotId = "main";
			item.location = {x:0, y:0, r:"Horizontal"};

			return item;
		}
	}
}

function generateBotArmorVest(internalId) {
	let item = {};
	let armor = presets.Armors[utility.getRandomIntEx(presets.Armors.length)];
	let durabl = items.data[armor]._props.MaxDurability;
	let des = items.data[armor]._props.MaxDurability;
	
	item._id = "ArmorVestScav" + internalId;
	item._tpl= armor;
	item.parentId = "5c6687d65e9d882c8841f0fd";
	item.slotId = "ArmorVest";
	item.upd = {"Repairable": {"MaxDurability":durabl,"Durability": des}};

	return item;
}

function generateBotMedPocket(internalId) {
	let item = {};

	item._id = "PocketMedScav" + internalId;
	item._tpl= presets.meds[utility.getRandomIntEx(presets.meds.length)];
	item.parentId = "5c6687d65e9d882c8841f121";
	item.slotId = "pocket2";
	item.location = {"x": 0,"y": 0,"r": 0};

	return item;
}

function generateBotItemPocket(internalId) {
	let item = {};

	item._id = "PocketItemScav" + internalId;
	item._tpl= presets.Grenades[utility.getRandomIntEx(presets.Grenades.length)];
	item.parentId = "5c6687d65e9d882c8841f121";
	item.slotId = "pocket1";
	item.location = {"x": 0,"y": 0,"r": 0};

	return item;
}

function assignWeaponToPrimary(weapon) {
	let item = {};
				
	item._id = weapon._id;
	item._tpl = weapon._tpl;
	item.parentId = "5c6687d65e9d882c8841f0fd";
	item.slotId = "FirstPrimaryWeapon";

	return item;
}

function assignWeaponToHolster(weapon) {
	let item = {};
	
	item._id = weapon._id;
	item._tpl = weapon._tpl;
	item.parentId = "5c6687d65e9d882c8841f0fd";
	item.slotId = "Holster";

	return item;
}

function getCompatibleMagazines(weapon) {
	let compatiblesmagazines = {};

	for (let slot of items.data[weapon._items[0]._tpl]._props.Slots) {
		if (slot._name == "mod_magazine") {
			compatiblesmagazines = slot._props.filters[0].Filter;
			break;
		}
	}

	return compatiblesmagazines;
}

function getCompatibleAmmo(weapon) {
	return items.data[weapon._items[0]._tpl]._props.Chambers[0]._props.filters[0].Filter;
}

function getWeaponMagazine(weapon, internalId, compatiblesmags) {
	let item = {};

	item._id = "MagazineWeaponScav" + internalId;
	item._tpl = compatiblesmags[utility.getRandomIntEx(compatiblesmags.length)];
	item.parentId = weapon._items[0]._id;
	item.slotId = "mod_magazine";

	return item;
}

function getWeaponMagazineAmmo(selectedmag, internalId, ammoFilter) {
	let item = {};
	
	item._id = "AmmoMagazine1Scav" + internalId;
	item._tpl = ammoFilter[utility.getRandomIntEx(ammoFilter.length)];
	item.parentId = "MagazineWeaponScav" + internalId;
	item.slotId = "cartridges";
	item.upd = {"StackObjectsCount": items.data[selectedmag]._props.Cartridges[0]._max_count};

	return item;
}

function getMosimAmmo(selectedmag, selectedmagid, internalId, ammoFilter) {
	let item = {};

	item._id = "AmmoMagazine1Scav"+ internalId;
	item._tpl = ammoFilter[utility.getRandomIntEx(ammoFilter.length)];
	item.parentId = selectedmagid;
	item.slotId = "cartridges";
	item.upd = {"StackObjectsCount": items.data[selectedmag]._props.Cartridges[0]._max_count};

	return item;
}

function getVestMagazine(id, itemslot, internalId, compatiblesmags) {
	let item = {};

	item._id = id + internalId;
	item._tpl = compatiblesmags[utility.getRandomIntEx(compatiblesmags.length)];
	item.parentId = "TacticalVestScav" + internalId;
	item.slotId = itemslot.toString();
	item.location = {"x": 0,"y": 0,"r": 0};

	return item;
}

function getVestMagazineAmmo(id, magazineid, selectedmag, internalId, ammoFilter) {
	let item = {};
				
	item._id = id + internalId;
	item._tpl = ammoFilter[utility.getRandomIntEx(ammoFilter.length)];
	item.parentId = magazineid + internalId;
	item.slotId = "cartridges";
	item.upd = {"StackObjectsCount": items.data[selectedmag]._props.Cartridges[0]._max_count};

	return item;
}

function getVestStackAmmo(id, itemslot, internalId, ammoFilter) {
	let item = {};
				
	item._id = id + internalId;
	item._tpl = ammoFilter[utility.getRandomIntEx(ammoFilter.length)];
	item.parentId = "TacticalVestScav" + internalId;
	item.slotId = itemslot.toString();
	item.upd = {"StackObjectsCount": utility.getRandomInt(10, 30)};

	return item;
}

function getRandomName(nationality, nameType, gender) { 
	let name = "UNKNOWN"; 
	let tmpNames = []; 
	 
	switch (nationality) { 
		case "russian": 
			if (nameType == "firstName") { 
				if (gender == "male") { 
					tmpNames = names.russian.first.male; 
				} 
			} 
 
			if (nameType == "lastName") { 
				tmpNames = names.russian.last; 
			} 
			break; 
 
		default: 
			break; 
	} 
 
	if (tmpNames.length > 0) { 
		name = tmpNames[utility.getRandomInt(0, tmpNames.length)]; 
	}  
 
	return name; 
} 
 
function getRandomFullName() { 
	return getRandomName("russian", "firstName", "male") + " " + getRandomName("russian", "lastName", "male"); 
} 

function generateBaseBot(params) {
	let bot = json.parse(json.read("data/configs/bots/botBase.json"));
	let internalId = utility.getRandomIntEx(10000);

	// set nickname
	bot.Info.Nickname = getRandomFullName();

	// generate bot appearance
	switch (params.Role) {
		case "followerBully":
			bot = generateBullyFollowerAppearance(bot, internalId);
			break;

		case "marksman":
			bot = generateScavSniperAppearance(bot, internalId, presets);
			break;

		case "pmcBot":
			bot = generateRaiderAppearance(bot, internalId, presets);
			break;
		
		default:
			bot = generateScavAppearance(bot, internalId, presets);
			break;
	}

	// generate PMC bot instead
	if (params.Role != "followerBully" && settings.bots.pmcWar.enabled == true) {
		if (utility.getRandomIntEx(100) <= settings.bots.pmcWar.sideUsec) { 
			bot = generateUsecAppearance(bot, internalId);
			bot.Info.Side = "Usec";
		} else {
			bot = generateBearAppearance(bot, internalId);
			bot.Info.Side = "Bear";
		}
	}

	// generate bot skill
	bot = generateBotSkill(bot, params);

	// choose randomly a weapon from preset.json before filling items
	let weapon = generateBotWeapon(weapon, params);

	// add a vest or rig on the scav (can be an armored vest)
	bot.Inventory.items.push(generateBotVestRigItem(internalId));

	// fill your dummy bot with the random selected preset weapon and its mods
	for (let item of weapon._items) {
		if (item._id == weapon._parent) {
			// add weapon to weapon slot
			if (weapon.isPistol == false) {
				bot.Inventory.items.push(assignWeaponToPrimary(item));
			} else {
				bot.Inventory.items.push(assignWeaponToHolster(item));
			}
		} else {
			if (item.slotId == "mod_magazine" ) {
				// randomize magazine
				let compatiblesmagazines = getCompatibleMagazines(weapon);
				let ammoFilter = getCompatibleAmmo(weapon);
				let isMosin = false;

				// check if the weapon is a mosin
				for (let mosinId of presets.filter_mosin) {
					if (weapon._items[0]._tpl == mosinId) {
						isMosin = true;
					}
				}

				// get the magazine
				let mag1 = {};
				let mag2 = getVestMagazine("magazine2VestScav", 2, internalId, compatiblesmagazines);
				let mag3 = getVestMagazine("magazine3VestScav", 3, internalId, compatiblesmagazines);

				// give the weapon ammo
				if (isMosin == false) {
					mag1 = getWeaponMagazine(weapon, internalId, compatiblesmagazines);
					bot.Inventory.items.push(mag1);
					bot.Inventory.items.push(getWeaponMagazineAmmo(mag1._tpl, internalId, ammoFilter));
				} else {
					mag1 = item;
					bot.Inventory.items.push(mag1);
					bot.Inventory.items.push(getMosimAmmo(mag1._tpl, mag1._id, internalId, ammoFilter));
				}

				// add magazines in the vest
				bot.Inventory.items.push(mag2);
				bot.Inventory.items.push(mag3);

				// add ammo to the magazines in the vest				
				bot.Inventory.items.push(getVestMagazineAmmo("AmmoMagazine2Scav", "magazine2VestScav", mag2._tpl, internalId, ammoFilter));
				bot.Inventory.items.push(getVestMagazineAmmo("AmmoMagazine3Scav", "magazine3VestScav", mag3._tpl, internalId, ammoFilter));

				// add a stack of ammo (for moslings and sks)
				bot.Inventory.items.push(getVestStackAmmo("AmmoFree2Scav", 1, internalId, ammoFilter));
			} else {
				// add mods and vital parts
				bot.Inventory.items.push(item);
			}
		}
	}

	// randomize bot health
	for (let bodyPart in bot.Health.BodyParts) {
		bot.Health.BodyParts[bodyPart].Health.Current += utility.getRandomInt(-10, 10);
		bot.Health.BodyParts[bodyPart].Health.Maximum = bot.Health.BodyParts[bodyPart].Health.Current;
	}

	// add a knife
	bot.Inventory.items.push(generateBotKnife(internalId));

	// chance to add glasses
	if (utility.getRandomIntEx(100) <= settings.bots.spawn.glasses) {
		bot.Inventory.items.push(generateBotGlasses(internalId));
	}

	// chance to add face cover
	if (utility.getRandomIntEx(100) <= settings.bots.spawn.faceCover) {
		bot.Inventory.items.push(generateBotFaceCover(internalId));
	}

	// chance to add headwear
	if (utility.getRandomIntEx(100) <= settings.bots.spawn.headwear) {
		let hdwItem = generateBotHeadwear(internalId);
		let fcshItem = generateBotFaceShield(hdwItem._tpl, internalId);

		bot.Inventory.items.push(hdwItem);
		
		if (fcshItem != null) {
			bot.Inventory.items.push(fcshItem);
		} 
	}

	// chance to add a backpack
	if (utility.getRandomIntEx(100) <= settings.bots.spawn.backpack) {
		let backpack = generateBotBackpack(internalId);

		bot.Inventory.items.push(backpack);
		bot.Inventory.items.push(generateBotBackpackItem(internalId,backpack._id));
	}

	// chance to add an armor vest
	if (utility.getRandomIntEx(100) <= settings.bots.spawn.armorVest) {
		bot.Inventory.items.push(generateBotArmorVest(internalId));
	}

	// chance to add a med pocket, bully followers have 100% chance
	if (utility.getRandomIntEx(100) <= settings.bots.spawn.medPocket || params.Role == "followerBully") {
		bot.Inventory.items.push(generateBotMedPocket(internalId));
	}

	// chance to add a item pocket, bully followers have 100% chance
	if (utility.getRandomIntEx(100) <= settings.bots.spawn.itemPocket || params.Role == "followerBully") {
		bot.Inventory.items.push(generateBotItemPocket(internalId));
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

		if (limit > -1) {
			params.Limit = limit;
		}

		// generate as many as the game request
		for (let i = 0; i < params.Limit; i++)  {
			switch (params.Role) {
				case "bossKilla":
					generatedBots.push(generateBotBossKilla(params));
					break;
			
				case "bossBully":
					generatedBots.push(generateBotBossBully(params));
					break;

				default:
					generatedBots.push(generateBaseBot(params));
					break;
			}
			
			botPossibilities++;
		}
	}

	console.log("generated " + botPossibilities + " scavs possibilities");
	return generatedBots;
}