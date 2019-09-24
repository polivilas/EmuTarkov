"use strict";

const item = require('./item.js');
const utility = require('./utility.js');
const profile = require('./profile.js');

var items = item.PrepareItemsList();
var presets = JSON.parse(utility.readJson("data/configs/bots/botPresets.json"));
var weaponPresets = JSON.parse(utility.readJson("data/configs/bots/botWeapons.json"));
var names = JSON.parse(utility.readJson("data/configs/bots/botNames.json"));
var settings = JSON.parse(utility.readJson("server.config.json"));
var handbook = JSON.parse(utility.readJson('data/configs/templates.json'));

function getRandomFloat(min = 0, max = 100) {
	return Math.random() * (max - min + 1) + min;
}
function calculateItemChance(preset, Role = "")
{ // calculate tiers chance

// pmcBot / followerBully
	let chance = 100;
	let chanceTable = [];
	for(let i = 0; i < Object.keys(preset).length; i++)
	{
		chance /= 2
		let lastChance = ( (i != 0) ? chanceTable[i-1] : 0 );
		chanceTable[i] = lastChance + chance;
	}
	let rng = getRandomFloat();
	if((Role === "pmcBot" || Role === "followerBully") && rng <= 50)
	{ // if pmcBot and bullyfollower then check if chance is to select tier 0 if yes reroll to higher tier of weapon
		rng = getRandomFloat(50);
	}
	
	for (let j = 0; j < chanceTable.length; j++){
		if(j == 0)
		{
			if(rng < chanceTable[j])
			{
				return j;
			}
		}
		else 
		{
			if(rng < chanceTable[j] && rng > chanceTable[j-1])
			{
				return j;
			}
		}
	}
	return 0;
}
// GENERATE BASE BODY
function generateBotBoss(params, fileName)
{
	//i think its changable later on so i use let
	let base = JSON.parse(utility.readJson("data/configs/bots/" + fileName + ".json"));
	base.Info.Settings.Role = params.Role;
	base.Info.Settings.BotDifficulty = params.Difficulty;
	return base;
}
function generateAppearance(bot, type = "")
{
	let head; let body; let feet;
	let rng_voice = 0; let botName = "";
	
	switch(type)
	{

	case "guard":
		head = "wild_head_1";
		body = "wild_security_body_1";
		feet = "wild_security_feet_1";
		rng_voice = utility.getRandomInt(1, 6);
		botName = "Scav";
		break;
	case "sniper":
		head = presets.Head.savage[utility.getRandomIntEx(presets.Head.savage.length) - 1];
		body = presets.Body.savage[utility.getRandomIntEx(presets.Body.savage.length) - 1];
		feet = presets.Feet.savage[utility.getRandomIntEx(presets.Feet.savage.length) - 1];
		rng_voice = utility.getRandomInt(1, 3);
		botName = "Scav";
		break;
	case "raider":
		head = presets.Head.pmc[utility.getRandomIntEx(presets.Head.pmc.length) - 1];
		body = presets.Body.pmc[utility.getRandomIntEx(presets.Body.pmc.length) - 1];
		feet = presets.Feet.pmc[utility.getRandomIntEx(presets.Feet.pmc.length) - 1];
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
		head = presets.Head.savage[utility.getRandomIntEx(presets.Head.savage.length)];
		body = presets.Body.savage[utility.getRandomIntEx(presets.Body.savage.length)];
		feet = presets.Feet.savage[utility.getRandomIntEx(presets.Feet.savage.length)];
		rng_voice = utility.getRandomInt(1, 6);
		type = "scav";
		botName = "Scav";
		break;
	}
	const rng_id = 1000 + utility.getRandomIntEx(8999);
	bot._id = type + "_" + rng_id;
	bot.Info.LowerNickname = type + rng_id;
	bot.Info.Voice = ( (type === "raider") ? presets.pmcBotVoices[utility.getRandomIntEx(presets.pmcBotVoices.length)] : botName + "_" + rng_voice );
	bot.Customization.Head.path = "assets/content/characters/character/prefabs/" + head + ".bundle";
	bot.Customization.Body.path = "assets/content/characters/character/prefabs/" + body + ".bundle";
	bot.Customization.Feet.path = "assets/content/characters/character/prefabs/" + feet + ".bundle";	
	
	return bot;
}
function generateBotSkill(bot, params) 
{ // Generating skills (i dont know if its needed ...)
	// ai settings
	bot.Info.Settings.Role = params.Role;
	bot.Info.Settings.BotDifficulty = params.Difficulty;

	// randomize skills
	for (let skill of bot.Skills.Common) {
		skill.Progress = utility.getRandomIntEx(5000);
		skill.MaxAchieved = skill.Progress;
	}

	// randomize experience
	bot.Info.Experience = utility.getRandomIntEx(100000); //level 54 max

	return bot;
}

function generateBotWeapon(params)
{ // generating presets
	let tier = 0; let len = 0; let randomize = 0; let weapon_preset_main = 0; let weapon_preset_pist = 0;
	//randomize Mainweapon and hostler weapon rolling if there should we (main weapon and postol) / (pistol) or (mainweapin only)
	const chanceOfGetting = [settings.bots.weapon.main, settings.bots.weapon.secondary];
	if(params.Role == "")
		chanceOfGetting[0] = 100;
	if (params.Role === "marksman")
	{ // if bot is marksman sniper get item from fdiffrent table
		len = presets.Weapons_Marksman.length;
		randomize = utility.getRandomIntEx(len) - 1;
		weapon_preset_main = presets.Weapons_Marksman[randomize]; // it should not have any pistols
	}
	else
	{
		if(utility.getRandomIntEx(100) < chanceOfGetting[0])
		{ // try to roll weapon
			tier = calculateItemChance(presets.Weapons, params.Role);
			len = presets.Weapons[tier].length;
			randomize = utility.getRandomIntEx(len);
			weapon_preset_main = presets.Weapons[tier][randomize]; // it should not have any pistols
		}
	}
	if(weapon_preset_main !== 0)
	{ // if weapon is rolled then try to roll pistol also
		if(utility.getRandomIntEx(100) < chanceOfGetting[1])
		{
			tier = calculateItemChance(presets.Pistol);
			len = presets.Pistol[tier].length;
			randomize = utility.getRandomIntEx(len);
			weapon_preset_pist = presets.Pistol[tier][randomize]; // only pistol tiers here
		}
	}
	else
	{ // if no main weapon 
		tier = calculateItemChance(presets.Pistol);
		len = presets.Pistol[tier].length;
		randomize = utility.getRandomIntEx(len);
		weapon_preset_pist = presets.Pistol[tier][randomize];
	}
	// weapon_preset_pist / weapon_preset_main - it contains preset name aka WeaponPresetXXX
	let item_main = 0;
	for(let i = 0; i < weaponPresets.data.length; i++)
	{ // should return true or false
		if(weaponPresets.data[i]._id == weapon_preset_main)
		{
			item_main = weaponPresets.data[i];
			break;
		}
	}	
	let item_pist = 0;
	for(let i = 0; i < weaponPresets.data.length; i++)
	{ // should return true or false
		if(weaponPresets.data[i]._id == weapon_preset_pist)
		{
			item_pist = weaponPresets.data[i];
			break;
		}
	}
	let isSingleLoaded = false;
	for(let i = 0; i < presets.Single_Loading.length; i++)
	{ // should return true or false
		if(presets.Single_Loading[i] == weapon_preset_main)
		{
			isSingleLoaded = true;
			break;
		}
	}
	let item = [[item_main, isSingleLoaded], item_pist]; // zero if no item
	return item;
}
// tier dependent loots
function generateItemByPattern(itemType, Inventory, Role = "")
{
	let tier = calculateItemChance(presets[itemType], Role);
	let len = presets[itemType][tier].length;
	let randomize = ((len === 0)?0:utility.getRandomIntEx(len) - 1);
	let item = {
		_id: itemType + utility.getRandomIntEx(1000000), 
		_tpl: presets[itemType][tier][randomize], 
		parentId: "5c6687d65e9d882c8841f0fd", 
		slotId: itemType
	};
	if(item._tpl === "59f32c3b86f77472a31742f0"){
		console.log("DOGTAG","","",true);
	}
	if(itemType === "ArmorVest")
	{
		item.upd = {
			"Repairable": {
				"MaxDurability": items.data[item._tpl]._props.MaxDurability,
				"Durability": items.data[item._tpl]._props.MaxDurability
			}
		};
	}
	Inventory.push(item);
	// ADDITIONAL SECTION BELOW //
	if(itemType === "Backpack")
	{
		// generate inventory items randomly
		Inventory = generateBotBackpackItem(Inventory,item);
	}
	if(itemType === "Headwear")
	{
		let headwearItem = items.data[item._tpl]._props;
		if (headwearItem.Slots.length > 0 && utility.getRandomIntEx(100) <= settings.bots.headwear.faceshield) {
			for (let itemSlot of headwearItem.Slots) {
				if (itemSlot._name === "mod_equipment" || itemSlot._name == "mod_equipment_000" ) {
					let itemslotname = itemSlot._name;
					if (itemSlot._props.filters[0].Filter.length > 0) {
						let compat = itemSlot._props.filters[0].Filter;
						let faceShield = {};
						faceShield._id = itemType + "_cover_" + utility.getRandomIntEx(10000);
						faceShield._tpl = compat[utility.getRandomIntEx(compat.length) - 1];
						faceShield.parentId = item._id;
						faceShield.slotId = itemslotname;
						faceShield.upd = {
							"Togglable": {
								"On": true
							}
						};
						
						Inventory.push(faceShield);
					}
				}
			}		
		}
	}	
	return Inventory;
}
// helping functions \/\/\/
function updCreator(itemParent, item)
{
	if(item._tpl === "59f32c3b86f77472a31742f0"){
		console.log("DOGTAG","","",true);
	}
	switch(itemParent)
	{
		case "590c745b86f7743cc433c5f2": // DogTags
			return { "Dogtag": {"Nickname": "Nikita Buyanov","Side": "Bear","Level": 50,"Time": "2020-04-16T13:37:00","Status": "Destroyed by ","KillerName": "JustEmuTarkov","WeaponName": "Choco bar"} };
		case "5448f3a14bdc2d27728b4569": // "Drugs",
		case "5448f39d4bdc2d0a728b4568": // "Medkits" (ok)
			return { MedKit: {HpResource: item._props.MaxHpResource} };
		case "5b47574386f77428ca22b335": // "Drinks",
		case "5448e8d64bdc2dce718b4568": // "FoodDrinks" (ok)
			return { FoodDrink: { HpPercent: item._props.MaxResource }};
		case "5485a8684bdc2da71d8b4567": // "Rounds",
			return { StackObjectsCount: utility.getRandomInt(1, item._props.StackMaxSize)};
		case "543be5cb4bdc2deb348b4568": // "Ammo",
			return { StackObjectsCount: 1 };
		case "543be5dd4bdc2deb348b4569": // "Money",
			return { StackObjectsCount: utility.getRandomInt(1, (item._props.StackMaxSize / 100))};
		case "5c164d2286f774194c5e69fa": // "Keycard",
			return { Keycard: { NumberOfUsages: item._props.MaximumNumberOfUsage }}
		case "5448f3a64bdc2d60728b456a": // "Stimulator",
		case "5c99f98d86f7745c314214b3": // "KeyMechanical",

		/*
		case "5c518ed586f774119a772aee": // "Electronic keys"
		case "5b47574386f77428ca22b2ed": // "Energy elements",
		case "5c518ec986f7743b68682ce2": // "Mechanical keys",
		case "5b47574386f77428ca22b330": // "Headwear & helmets",
		case "5b47574386f77428ca22b2f2": // "Flammable materials",
		case "5b47574386f77428ca22b33c": // "Ammo boxes",
		case "5b47574386f77428ca22b2f1": // "Valuables",
		case "5b47574386f77428ca22b337": // "Pills",
		case "5b47574386f77428ca22b2f6": // "Tools",
		case "5b47574386f77428ca22b2f0": // "Household materials",
		case "5b47574386f77428ca22b2f4": // "Others",
		case "5b47574386f77428ca22b2ef": // "Electronics",
		case "5b47574386f77428ca22b32f": // "Facecovers",
		case "5b47574386f77428ca22b2f3": // "Medical supplies",
		case "5b47574386f77428ca22b2ee": // "Building materials",
		case "5b47574386f77428ca22b340": // "Provisions",
		case "5b47574386f77428ca22b331": // "Visors",
		case "5b47574386f77428ca22b33e": // "Barter items",
		case "5b47574386f77428ca22b343": // "Maps",
		case "5b47574386f77428ca22b341": // "Info items",
		case "5b47574386f77428ca22b342": // "Keys",
		case "5b47574386f77428ca22b345": // "Special equipment",
		case "5b5f71a686f77447ed5636ab": // "Weapon parts & mods",
		case "5b5f6fd286f774093f2ecf0d": // "Secured containers",
		case "5b47574386f77428ca22b344": // "Medical treatment",
		case "5b47574386f77428ca22b33f": // "Gear",
		case "5b5f701386f774093f2ecf0f": // "Armor vests",
		case "5b5f6fa186f77409407a7eb7": // "Containers & cases",
		case "5b5f6f3c86f774094242ef87": // "Headsets",
		case "5b5f6f8786f77447ed563642": // "Tactical rigs",
		case "5b5f704686f77447ec5d76d7": // "Gear components",
		case "5b5f71de86f774093f2ecf13": // "Fore grips",
		case "5b5f736886f774094242f193": // "Light & laser devices",
		case "5b5f73c486f77447ec5d7704": // "Laser target pointers",
		case "5b5f724c86f774093f2ecf15": // "Flashhiders & brakes",
		case "5b5f71c186f77409407a7ec0": // "Bipods",
		case "5b5f71b386f774093f2ecf11": // "Functional mods",
		case "5b5f72f786f77447ec5d7702": // "Muzzle adapters",
		case "5b5f6f6c86f774093f2ecf0b": // "Backpacks",
		case "5b5f724186f77447ed5636ad": // "Muzzle devices",
		case "5b5f742686f774093e6cb4ff": // "Collimators",
		case "5b5f744786f774094242f197": // "Compact collimators",
		case "5b5f731a86f774093e6cb4f9": // "Suppressors",
		case "5b5f737886f774093e6cb4fb": // "Tactical combo devices",
		case "5b5f749986f774094242f199": // "Special sights",
		case "5b5f74cc86f77447ec5d770a": // "Auxiliary parts",
		case "5b5f748386f774093e6cb501": // "Optics",
		case "5b5f73ab86f774094242f195": // "Flashlights",
		case "5b5f73ec86f774093e6cb4fd": // "Sights",
		case "5b5f757486f774093e6cb507": // "Stocks & chassis",
		case "5b5f759686f774094242f19d": // "Magwells",
		case "5b5f75b986f77447ec5d7710": // "Vital parts",
		case "5b5f75e486f77447ec5d7712": // "Handguards",
		case "5b5f750686f774093e6cb503": // "Gear mods",
		case "5b5f746686f77447ec5d7708": // "Iron sights",
		case "5b5f740a86f77447ec5d7706": // "Assault scopes",
		case "5b5f752e86f774093e6cb505": // "Launchers",
		case "5b5f755f86f77447ec5d770e": // "Mounts",
		case "5b5f75c686f774094242f19f": // "Barrels",
		case "5b5f794b86f77409407a7f92": // "Shotguns",
		case "5b5f78e986f77447ed5636b1": // "Assault carbines",
		case "5b5f761f86f774094242f1a1": // "Pistol grips",
		case "5b5f760586f774093e6cb509": // "Gas blocks",
		case "5b5f751486f77447ec5d770c": // "Charging handles",
		case "5b5f78fc86f77409407a7f90": // "Assault rifles",
		case "5b5f796a86f774093f2ed3c0": // "SMGs",
		case "5b5f764186f77447ec5d7714": // "Recievers & slides",
		case "5b5f791486f774093f2ed3be": // "Marksman rifles",
		case "5b5f79eb86f77447ed5636b7": // "Special weapons",
		case "5b5f7a2386f774093f2ed3c4": // "Throwables",
		case "5b5f792486f77447ed5636b3": // "Pistols",
		case "5b5f754a86f774094242f19b": // "Magazines",
		case "5b5f78dc86f77409407a7f8e": // "Weapons",
		case "5b5f79a486f77409407a7f94": // "Machine guns",
		case "5b5f7a0886f77409407a7f96": // "Melee weapons",
		case "5b5f79d186f774093f2ed3c2": // "Grenade launchers",
		case "5b5f798886f77447ed5636b5": // "Bolt-action rifles",
		case "5b619f1a86f77450a702a6f3": // "Quest items",*/
		default:
			return { StackObjectsCount: 1 };
	}
}
function getCompatibleMagazines(weapon) 
{
	let compatiblesmagazines = {};

	for (let slot of items.data[weapon._items[0]._tpl]._props.Slots) {
		if (slot._name === "mod_magazine") {
			compatiblesmagazines = slot._props.filters[0].Filter;
			break;
		}
	}

	return compatiblesmagazines;
}
function getCompatibleAmmo(weapon) 
{
	return items.data[weapon._items[0]._tpl]._props.Chambers[0]._props.filters[0].Filter;
}
// helping functions /
function generateBotBackpackItem(botInventory,backpack) 
{
	// its work need to find out upd dependencies and adds them;
	const backpackData = items.data[backpack._tpl]._props.Grids[0]._props;
	let backpack2D = new Array(backpackData.cellsV);
	for(let i = 0; i < backpack2D.length; i++) {
		backpack2D[i] = new Array(backpackData.cellsH).fill(0); 
	}
																											
	const backpackSize = (backpackData.cellsV * backpackData.cellsH);// how much slots we have 
	var RollItems = new Array(backpackSize);
	for (var i = 0; i < RollItems.length; i++) {
	  RollItems[i] = utility.getRandomIntEx(handbook.data.Items.length) - 1;
	}
	for(let i = 0; i < backpackSize; i++){
		let item = handbook.data.Items[RollItems[i]];
		let found = false;
		for (let expt of presets.items_allowed_in_backpack) {	
			if (expt === item.ParentId) {
				found = true;
			}
		}
		if(!found)
			continue;
		
		//if item is OK get item sizing and put it in free slot
			const tmpSizeX = items.data[items.data[item.Id]._id]._props.Width; // X + Left + Right
			const tmpSizeY = items.data[items.data[item.Id]._id]._props.Height; // Y + Up + Down
			ImDoneWithThisOne:
			for (let x = 0; x <= backpackData.cellsH - tmpSizeX; x++) {
				for (let y = 0; y <= backpackData.cellsV - tmpSizeY; y++) {
					let badSlot = "no";

					leaveThat:
					for (let itemY = 0; itemY < tmpSizeY; itemY++) {
						for (let itemX = 0; itemX < tmpSizeX; itemX++) {
							if (backpack2D[y + itemY][x + itemX] !== 0) {
								badSlot = "yes";
								break leaveThat;
							}
						}
					}
					if (badSlot === "yes") {
						continue;
					}
					const ItemTemplate = items.data[item.Id];
					for (let itemY = 0; itemY < tmpSizeY; itemY++) {
						for (let itemX = 0; itemX < tmpSizeX; itemX++) {
							backpack2D[itemY + y][itemX + x] = 1;
						}
					}
					let rightUPD = updCreator(ItemTemplate._parent, ItemTemplate);
					botInventory.push({
						_id: "BP_" + backpack._id + "_" + utility.getRandomInt(100000, 999999),
						_tpl:	ItemTemplate._id,
						parentId: backpack._id,
						slotId: "main",
						location: {
							x: x, 
							y: y, 
							r: 'Horizontal',
							isSearched: true
						},
						upd: rightUPD
					});
					break ImDoneWithThisOne;
					//if 543be5cb4bdc2deb348b4568 insert ammo inside
				}
			}
		
	}
return botInventory;
}
function generatePocketItem(pocketNum = 1, botType)
{ // determine which item will be added medicament or granade
	
	if(utility.getRandomIntEx(100) < settings.bots.pocket.med_to_gra){ 
		if(utility.getRandomIntEx(100) <= settings.bots.pocket.meds || botType === "followerBully")
		{ // meds
			let item = {};
			const tier = calculateItemChance(presets.Medicaments);
			const len = presets.Medicaments[tier].length;
			const randomize = utility.getRandomIntEx(len) - 1;
			const itemTpl = presets.Medicaments[tier][randomize];
			let item_data = items.data[itemTpl];
			item._id = "Pocket_" + utility.getRandomIntEx(999999);
			item._tpl = itemTpl;
			item.parentId = "5c6687d65e9d882c8841f121";
			item.slotId = "pocket" + pocketNum;
			item.location = { x: 0,y: 0,r: "Horizontal" };
			item.upd = updCreator(item_data.parentId, item_data);
		}
	} else {
		if(utility.getRandomIntEx(100) <= settings.bots.pocket.granade || botType == "followerBully")
		{ // granades
			let item = {};
			const len = presets.Grenades.length;
			const randomize = utility.getRandomIntEx(len) - 1;
			const itemTpl = presets.Grenades[randomize];
			item._id = "Pocket_" + utility.getRandomIntEx(999999);
			item._tpl = itemTpl;
			item.parentId = "5c6687d65e9d882c8841f121";
			item.slotId = "pocket" + pocketNum;
			item.location = {x: 0,y: 0,r: "Horizontal"};
			item.upd = { StackObjectsCount: 1 }
		}
	}
	if (typeof(item) !== 'undefined') {
		return item;
	} else {
		return false;
	}
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
	item._tpl = ammoFilter[utility.getRandomIntEx(ammoFilter.length) - 1];
	item.parentId = mag._id;
	item.slotId = "cartridges";
	item.upd = {"StackObjectsCount": max_ammo};

	return item;
}
function getMosimAmmo(selectedmag, selectedmagid, ammoFilter) {
	let item = {};

	item._id = "AmmoMag1" + utility.getRandomIntEx(99999);
	item._tpl = ammoFilter[utility.getRandomIntEx(ammoFilter.length) - 1];
	item.parentId = selectedmagid;
	item.slotId = "cartridges";
	item.upd = {"StackObjectsCount": items.data[selectedmag]._props.Cartridges[0]._max_count};

	return item;
}
function getVestMagazine(id, itemslot, Vest, Mag_tpl) 
{
	let item = {};
	item._id = id;
	item._tpl = Mag_tpl;
	item.parentId = Vest;
	item.slotId = itemslot.toString();
	item.location = {"x": 0,"y": 0,"r": "Horizontal", "isSearched": true};
	return item;
}
function getVestMagazineAmmo(id, magazineid, selectedmag, ammoFilter) 
{
	let item = {};
	item._id = id;
	item._tpl = ammoFilter[utility.getRandomIntEx(ammoFilter.length) - 1];
	item.parentId = magazineid;
	item.slotId = "cartridges";
	item.upd = {"StackObjectsCount": items.data[selectedmag]._props.Cartridges[0]._max_count};

	return item;
}
function getVestStackAmmo(id, itemslot, internalId, ammoFilter) 
{
	let item = {};
	let Item_tpl = ammoFilter[utility.getRandomIntEx(ammoFilter.length) - 1];
	item._id = id + utility.getRandomIntEx(99999);
	item._tpl = Item_tpl;
	item.parentId = internalId;
	item.slotId = itemslot.toString();
	item.upd = {"StackObjectsCount": utility.getRandomInt(5, items.data[Item_tpl]._props.StackMaxSize)}; // from 5 ammo to max avaliable in 1 stack

	return item;
}
function pushItemWeapon(weapon, Inventory, MagType = -1)
{
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
			if (MagType == "pistol")
			{ // its secondary - main part
				itm.slotId = "Holster";
			}

			Inventory.push(itm);
		} 
		else 
		{
			//this is only adopted - in future made autonomic placement of ammo and mags
			if (weap[item].slotId === "mod_magazine")
			{ // its a magazine
				let vest = "";
				for (let item in Inventory){
					if(Inventory[item].slotId === "TacticalVest")
					{
						vest = Inventory[item];
						break;
					}
				}
				let tableSizes = [[],[],[]];
				if(vest != ""){
					for (let grid in items.data[vest._tpl]._props.Grids)
					{
						let calcSize = items.data[vest._tpl]._props.Grids[grid]._props.cellsH * items.data[vest._tpl]._props.Grids[grid]._props.cellsV
						if (calcSize == 1)
							tableSizes[0].push(items.data[vest._tpl]._props.Grids[grid]._name); // 1x1
						else if (calcSize == 2 && items.data[vest._tpl]._props.Grids[grid]._props.cellsH == 1)
							tableSizes[1].push(items.data[vest._tpl]._props.Grids[grid]._name); // 1x2 only magazines
						else 
							tableSizes[2].push(items.data[vest._tpl]._props.Grids[grid]._name); // 2x2 no more are there -)
					}
				}
				let compatiblesmagazines = getCompatibleMagazines(weapon);
					let len = compatiblesmagazines.length;
					let random = utility.getRandomIntEx(len) - 1;
				let selectOneMagazineOnly = compatiblesmagazines[random]; // select one magazine type and fill everything with it
				let ammoFilter = getCompatibleAmmo(weapon); // make ammo table
				if(MagType != "pistol"){
					
					if(MagType == false)
					{ // if its not mozin type weapon
						//generate main weapon magazine
						let mag1 = getWeaponMagazine(weapon, utility.getRandomIntEx(10000), selectOneMagazineOnly);
						let mag1Ammo = getWeaponMagazineAmmo(mag1, utility.getRandomIntEx(10000), ammoFilter)
						Inventory.push(mag1);
						Inventory.push(mag1Ammo);
						// and now generate magazines for vest with ammo
						if(vest != ""){
							for (let i = 0; i < tableSizes[1].length; i++)
							{	// creating magazines for all 1x2 slots with change 80% to apearing
								if(utility.getRandomIntEx(100) <= settings.bots.vest.magChance)
								{
									let mag = getVestMagazine("mag" + i + "Vest" + utility.getRandomIntEx(99999), tableSizes[1][i], vest._id, selectOneMagazineOnly);
									let ammo = getVestMagazineAmmo("AmmoMag" + utility.getRandomIntEx(999999), mag._id, mag._tpl, ammoFilter);
									Inventory.push(mag);
									Inventory.push(ammo);
								}
							}
						}
					} else if (MagType == true) {
						let mag1 = weap[item];
						Inventory.push(getMosimAmmo(mag1._tpl, mag1._id, ammoFilter));
						Inventory.push(mag1);
						
					}
					if(vest != ""){
						for (let i = 0; i < tableSizes[0].length; i++)
						{	// creating ammo stacks for all 1x1 slots
							if(utility.getRandomIntEx(100) <= settings.bots.vest.stacksChance)
							{
								let stackammo = getVestStackAmmo("StackAmmo" + utility.getRandomIntEx(99999), tableSizes[0][i], vest._id, ammoFilter)
								Inventory.push(stackammo);
							}
						}
					}
				} else {
					let mag1 = weap[item];
					Inventory.push(getMosimAmmo(mag1._tpl, mag1._id, ammoFilter));
					Inventory.push(mag1);
				}
			} else {
				// add mods and vital parts
				Inventory.push(weap[item]);
			}
		}
	}
	return Inventory;
}
//
function getRandomName(nationality, nameType = '', gender = '') 
{ 
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
		case "pmc":
			tmpNames = names.pmc;
			break;
		case "follower":
			tmpNames = names.follower
			break;
		default: 
			break; 
	} 
 
	if (tmpNames.length > 0) { 
		name = tmpNames[utility.getRandomInt(0, tmpNames.length-1)]; 
	}  
 
	return name; 
} 
function getRandomFullName() 
{ 
	return getRandomName("russian", "firstName", "male") + " " + getRandomName("russian", "lastName", "male"); 
} 
function generateBaseBot(params) 
{
	let bot = JSON.parse(utility.readJson("data/configs/bots/botBase.json"));
	let internalId = utility.getRandomIntEx(10000);
	// set nickname
	// generate bot appearance
	switch (params.Role) 
	{
		case "followerBully":
			bot.Info.Nickname = getRandomName("follower");
			bot = generateAppearance(bot, "guard");
			break;

		case "marksman":
			bot.Info.Nickname = getRandomFullName() + "(M)";
			bot = generateAppearance(bot, "sniper");
			break;

		case "pmcBot":
			bot.Info.Nickname = getRandomName("pmc");
			bot = generateAppearance(bot, "raider");
			break;
		
		default:
			bot.Info.Nickname = getRandomFullName();
			bot = generateAppearance(bot);
			break;
	}

	//BOTS CONSTANTS DEPENDING ON Role
	if(Role === "pmcBot") 
	{
		settings.bots.equipment.backpack = 20; // force 20% backpack chance
	}
	if(Role === "followerBully")
	{
		settings.bots.equipment.backpack = 100;
	}
	
	// generate bot skill
	bot = generateBotSkill(bot, params);

	//{"_id":"5d5ee20446b16820305c188e","_tpl":"59f32bb586f774757e1e8442","parentId":"5cb0dd1946b16858856ddff0","slotId":"Dogtag","upd":{"Dogtag":{"Nickname":"","Side":"Bear","Level":1,"Time":"0001-01-01T00:00:00","Status":"","KillerName":"","WeaponName":""}}}
	if (params.Role != "followerBully" && settings.bots.pmcWar.enabled == true) 
	{ // generate PMC bot instead
		if (utility.getRandomIntEx(100) <= settings.bots.pmcWar.sideUsec) 
		{ 
			bot = generateAppearance(bot, "usec");
			bot.Info.Side = "Usec";
			bot.Inventory.items.push({
				_id:  "dogtag_" + 100000000 + utility.getRandomIntEx(899999999),
				_tpl: "59f32bb586f774757e1e8442",
				parentId: bot.Inventory.equipment,
				slotId: "Dogtag",
				upd: {"Dogtag":{"Nickname": bot.Info.Nickname,"Side":"Usec","Level": bot.Info.Level,"Time":"0001-01-01T00:00:00","Status":"","KillerName":"","WeaponName":""}}
			});
			
			//add dogtag here
		} 
		else 
		{
			bot = generateAppearance(bot, "bear");
			bot.Info.Side = "Bear";
			bot.Inventory.items.push({
				_id:  "dogtag_" + 100000000 + utility.getRandomIntEx(899999999),
				_tpl: "59f32bb586f774757e1e8442",
				parentId: bot.Inventory.equipment,
				slotId: "Dogtag",
				upd: {"Dogtag":{"Nickname": bot.Info.Nickname,"Side":"Bear","Level": bot.Info.Level,"Time":"0001-01-01T00:00:00","Status":"","KillerName":"","WeaponName":""}}
			});
		}
	}


	// choose randomly a weapon from preset.json before filling items
	var weapon = generateBotWeapon(params);
	
	// Tactical vest Assignation
	let TacticalVest = generateItemByPattern("TacticalVest", bot.Inventory.items);
	if(TacticalVest != {})
	{
		bot.Inventory.items = TacticalVest;
	}

	// set weapons
	if(weapon[0][0] != 0)
		bot.Inventory.items = pushItemWeapon(weapon[0][0], bot.Inventory.items, weapon[0][1]);
	if(weapon[1] != 0)
		bot.Inventory.items = pushItemWeapon(weapon[1], bot.Inventory.items, "pistol");
	
	
	for (let bodyPart in bot.Health.BodyParts) 
	{ // randomize bot health <base-10 to base>
		bot.Health.BodyParts[bodyPart].Health.Current -= utility.getRandomInt(0, 10);
		bot.Health.BodyParts[bodyPart].Health.Maximum = bot.Health.BodyParts[bodyPart].Health.Current;
	}

	// add a knife (its always added)
	bot.Inventory.items = generateItemByPattern("Scabbard", bot.Inventory.items)
	
	if (utility.getRandomIntEx(100) <= settings.bots.equipment.eyewear) 
	{ // chance to add glasses
		bot.Inventory.items = generateItemByPattern("Eyewear", bot.Inventory.items, params.Role);
	}
	
	if (utility.getRandomIntEx(100) <= settings.bots.equipment.facecover) 
	{ // chance to add face cover
		bot.Inventory.items = generateItemByPattern("FaceCover", bot.Inventory.items, params.Role);
	}

	
	if (utility.getRandomIntEx(100) <= settings.bots.equipment.headwear) 
	{ // chance to add headwear
		bot.Inventory.items = generateItemByPattern("Headwear", bot.Inventory.items, params.Role);
	}

	if (utility.getRandomIntEx(100) <= settings.bots.equipment.backpack) 
	{ // chance to add a backpack
		bot.Inventory.items = generateItemByPattern("Backpack", bot.Inventory.items, params.Role);
	}
	
	if (utility.getRandomIntEx(100) <= settings.bots.equipment.armorvest) 
	{ // chance to add an armor vest
		bot.Inventory.items = generateItemByPattern("ArmorVest", bot.Inventory.items, params.Role);
	}
	
	// chance to add a med pocket, bully followers have 100% chance
	for(let i = 1; i <= 4; i++)
	{// pockets fill up section
		let pocketItem_tmp = generatePocketItem(i,params.Role);
		if(pocketItem_tmp != false)
		{ // fill up if item was choosed
			bot.Inventory.items.push(pocketItem_tmp);
		}
	}

	return bot;
}
function generate(databots) {
	//console.log(databots);
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

		if (limit > -1 && settings.bots.limit.override == true) {
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

	console.log("[INFO][Finished Generating " + botPossibilities + " bots]","","",true);
	return generatedBots;
}
function generatePlayerScav() {
	let character = profile.getCharacterData();
	let playerscav = generate({"conditions":[{"Role":"assault","Limit":1,"Difficulty":"normal"}]});
	
	playerscav[0].Info.Settings = {};
	playerscav[0]._id = "5c71b934354682353958e983";
	character.data[0] = playerscav[0];
	
	profile.setCharacterData(character);
}

//module.exports.calculateChance = calculateChance;
module.exports.generate = generate;
module.exports.generatePlayerScav = generatePlayerScav;