"use strict";
require('./libs.js');

const profileName = (profile.getCharacterData()).data[0].Info.Nickname;

// GENERATE BASE BODY
function generateBotBoss(params, fileName) {
    //i think its changable later on so i use let
    let base = JSON.parse(utility.readJson("data/configs/bots/" + fileName + ".json"));
    base['Info'].Settings.Role = params.Role;
    base['Info'].Settings.BotDifficulty = params.Difficulty;
    return base;
}
/**
 * Small function to randomize pistol and make sure its returned an OBJECT
 */

function pushItemWeapon(weapon, Inventory, MagType = -1, Magazines, ammoFilter) {
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
            //this is only adopted - in future made autonomic placement of ammo and mags
            if (weap[item].slotId === "mod_magazine") { // its a magazine
				let len = Magazines.length;
                let random = utility.getRandomInt(0,len -1);
                let selectOneMagazineOnly = Magazines[random]; // select one magazine type and fill everything with it
                if (MagType !== "pistol") {
                    if (MagType === false) { // if its not mozin type weapon // generate main weapon magazine
                        let mag1 = guns_f.getWeaponMagazine(weapon, utility.getRandomIntEx(10000), selectOneMagazineOnly);
                        let mag1Ammo = guns_f.getWeaponMagazineAmmo(mag1, utility.getRandomIntEx(10000), ammoFilter);
                        Inventory.push(mag1);
                        Inventory.push(mag1Ammo);
                    } else if (MagType === true) {
                        let mag1 = weap[item];
                        Inventory.push(guns_f.getMosimAmmo(mag1._tpl, mag1._id, ammoFilter));
                        Inventory.push(mag1);
                    }
                } else { // gun without changable mag
                    let mag1 = weap[item];
                    Inventory.push(guns_f.getMosimAmmo(mag1._tpl, mag1._id, ammoFilter));
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
                        "Status": "Killed by ",
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
                        "Status": "Killed by ",
                        "KillerName": profileName,
                        "WeaponName": "" // cannot set it out cause player can change weapon in raid
                    }
                }
            });
        }
    }
// choose randomly a weapon from preset.json before filling items
    let weapon = guns_f.generateBotWeapon(params);
    // Tactical vest Assignation
    let TacticalVest = itemPattern_f.generateItemByPattern("TacticalVest", bot.Inventory.items);
	let vest = "";
	let tableSizes = [[], [], [], []]; // 1, 2, 3, 2x2
    if (TacticalVest !== {}) {
        bot['Inventory'].items = TacticalVest;
		for (let item in bot['Inventory'].items){
			if(bot['Inventory'].items[item].slotId === "TacticalVest")
			{
				vest = bot['Inventory'].items[item];
				break;
			}
		}
		if(vest !== ""){
		//vest slots splited to small medium and big
			for (let grid in items.data[vest._tpl]._props.Grids) {
				if (items.data[vest._tpl]._props.Grids[grid]._props.cellsV === 1)
					tableSizes[0].push(items.data[vest._tpl]._props.Grids[grid]._name); // 1x1
				else if (items.data[vest._tpl]._props.Grids[grid]._props.cellsV === 2 && items.data[vest._tpl]._props.Grids[grid]._props.cellsH === 2)
					tableSizes[3].push(items.data[vest._tpl]._props.Grids[grid]._name); // 2x2
				else if (items.data[vest._tpl]._props.Grids[grid]._props.cellsV === 2 && items.data[vest._tpl]._props.Grids[grid]._props.cellsH === 1) 
					tableSizes[1].push(items.data[vest._tpl]._props.Grids[grid]._name); // 1x2
				else if (items.data[vest._tpl]._props.Grids[grid]._props.cellsV === 3)
					tableSizes[2].push(items.data[vest._tpl]._props.Grids[grid]._name); // 1x3
			}
		}
	}

// TODO: check what vest have spaces and put mags there
	let ammoFilter_main = "";
	let compatiblesmagazines_mainWeapon = "";
	let ammoFilter_secondary = "";
	let compatiblesmagazines_secondWeapon = "";
	let len = 0;
	let random = 0;
	let selectOneMagazineOnly_main = "";
	let selectOneMagazineOnly_sub = "";
	let magSize = [0,0];
	if(weapon[0][0] !== 0){
		ammoFilter_main = guns_f.getCompatibleAmmo(weapon[0][0]); // make ammo table
		compatiblesmagazines_mainWeapon = guns_f.getCompatibleMagazines(weapon[0][0]);
		let random_magIndex = utility.getRandomInt(0,1);// randomize first table and second table which holds 1x1, 1x2 magazines
		let magsizeSelector = ((tableSizes[random_magIndex].length > 0)?random_magIndex:((random_magIndex == 1)?0:1)); // select one table from mags 1 slot or 1x2 slot size magazines
		if(compatiblesmagazines_mainWeapon[magsizeSelector].length == 0)
		{
			magsizeSelector = ((magsizeSelector == 0)?1:0); // switch from actual to reverse one if no magazines found
		}
		compatiblesmagazines_mainWeapon = compatiblesmagazines_mainWeapon[magsizeSelector];
		len = compatiblesmagazines_mainWeapon.length - 1;
		random = utility.getRandomInt(0, len);
		selectOneMagazineOnly_main = compatiblesmagazines_mainWeapon[random];
		bot['Inventory'].items = pushItemWeapon(weapon[0][0], bot['Inventory'].items, weapon[0][1], compatiblesmagazines_mainWeapon, ammoFilter_main);
	}
	// make same for secondary if exist
	if(weapon[1] !== 0){
		ammoFilter_secondary = guns_f.getCompatibleAmmo(weapon[1]);
		compatiblesmagazines_secondWeapon = guns_f.getCompatibleMagazines(weapon[1]);
		let random_magIndex = utility.getRandomInt(0,1);
		let magsizeSelector = ((tableSizes[random_magIndex].length > 0)?random_magIndex:((random_magIndex == 1)?0:1));
		if(compatiblesmagazines_secondWeapon[magsizeSelector].length == 0)
		{
			magsizeSelector = ((magsizeSelector == 0)?1:0);
		}
		compatiblesmagazines_secondWeapon = compatiblesmagazines_secondWeapon[magsizeSelector];
		len = compatiblesmagazines_secondWeapon.length - 1;
		random = utility.getRandomInt(0, len);
		selectOneMagazineOnly_sub = compatiblesmagazines_secondWeapon[random];
		bot['Inventory'].items = pushItemWeapon(weapon[1], bot['Inventory'].items, "pistol", compatiblesmagazines_secondWeapon, ammoFilter_secondary);
	}
// adds magazines to vest
	if (vest !== "") {
		if(weapon[0][0] !== 0){
			//check what slots we have accessed
			// magazines for 1x2 slot
			let magazineProperty = items.data[selectOneMagazineOnly_main]._props;
			
			if(magazineProperty.Width == 1 && magazineProperty.Height == 2){
				if(tableSizes[1].length != 0){ // mags 1x2 for 1x2 slots
					for (let i = 0; i < tableSizes[1].length; i++)
					{	// creating magazines for all 1x2 slots with change 80% to apearing
						if(utility.getRandomIntEx(100) <= settings.bots.vest.magChance)
						{
							let mag = guns_f.getVestMagazine("mag" + i + "Vest" + utility.getRandomIntEx(999999), tableSizes[1][i], vest._id, selectOneMagazineOnly_main, [0,0]);
							let ammo = guns_f.getVestMagazineAmmo("AmmoMag" + i + "Vest" + utility.getRandomIntEx(999999), mag._id, mag._tpl, ammoFilter_main);
							bot['Inventory'].items.push(mag);
							bot['Inventory'].items.push(ammo);
							tableSizes[1].splice(i,1);
						}
					}
				}
				if(tableSizes[3].length != 0){ // mags 1x2 for 2x2 slots (set them 2 for slot 0 and 1)
					for (let i = 0; i < tableSizes[3].length; i++)
					{	// creating magazines for all 1x2 slots with change 80% to apearing
						let magAdded = false;
						for(let n = 0; n < 2; n++){
							if(utility.getRandomIntEx(100) <= settings.bots.vest.magChance)
							{
								magAdded = true;
								let mag = guns_f.getVestMagazine("mag" + i + "Vest" + utility.getRandomIntEx(999999), tableSizes[3][i], vest._id, selectOneMagazineOnly_main, [n,0]);
								let ammo = guns_f.getVestMagazineAmmo("AmmoMag" + i + "Vest" + utility.getRandomIntEx(999999), mag._id, mag._tpl, ammoFilter_main);
								bot['Inventory'].items.push(mag);
								bot['Inventory'].items.push(ammo);
								
							}
						}
						if(magAdded)
							tableSizes[3].splice(i,1); // yes yes it will lead to empty slots fuck it!!
					}
				}
			} else if (magazineProperty.Width == 1 && magazineProperty.Height == 1){
				if(tableSizes[1].length != 0){
					for (let i = 0; i < tableSizes[1].length; i++)
					{	// creating magazines for all 1x2 slots with change 80% to apearing
						let magAdded = false;
						for(let n = 0; n < 2; n++){
							if(utility.getRandomIntEx(100) <= settings.bots.vest.magChance)
							{
								magAdded = true;
								let mag = guns_f.getVestMagazine("mag" + i + "Vest" + utility.getRandomIntEx(999999), tableSizes[1][i], vest._id, selectOneMagazineOnly_main, [0,n]);
								let ammo = guns_f.getVestMagazineAmmo("AmmoMag" + i + "Vest" + utility.getRandomIntEx(999999), mag._id, mag._tpl, ammoFilter_main);
								bot['Inventory'].items.push(mag);
								bot['Inventory'].items.push(ammo);
								
							}
						}
						if(magAdded)
							tableSizes[1].splice(i,1);
					}
				}
			} else if(magazineProperty.Width == 1 && magazineProperty.Height == 3){
				if(tableSizes[2].length != 0){
					for (let i = 0; i < tableSizes[2].length; i++)
					{	// creating magazines for all 1x2 slots with change 80% to apearing
						if(utility.getRandomIntEx(100) <= settings.bots.vest.magChance)
						{
							let mag = guns_f.getVestMagazine("mag" + i + "Vest" + utility.getRandomIntEx(999999), tableSizes[2][i], vest._id, selectOneMagazineOnly_main, [0,0]);
							let ammo = guns_f.getVestMagazineAmmo("AmmoMag" + i + "Vest" + utility.getRandomIntEx(999999), mag._id, mag._tpl, ammoFilter_main);
							bot['Inventory'].items.push(mag);
							bot['Inventory'].items.push(ammo);
							tableSizes[2].splice(i,1);
						}
					}
				}
			} else if(magazineProperty.Width == 2 && magazineProperty.Height == 2){
				if(tableSizes[3].length != 0){
					for (let i = 0; i < tableSizes[3].length; i++)
					{	// creating magazines for all 1x2 slots with change 80% to apearing
						if(utility.getRandomIntEx(100) <= settings.bots.vest.magChance)
						{
							let mag = guns_f.getVestMagazine("mag" + i + "Vest" + utility.getRandomIntEx(999999), tableSizes[3][i], vest._id, selectOneMagazineOnly_main, [0,0]);
							let ammo = guns_f.getVestMagazineAmmo("AmmoMag" + i + "Vest" + utility.getRandomIntEx(999999), mag._id, mag._tpl, ammoFilter_main);
							bot['Inventory'].items.push(mag);
							bot['Inventory'].items.push(ammo);
							tableSizes[3].splice(i,1);
						}
					}
				}
			}
			if(tableSizes[0].length != 0){
				// slot 1x1 for ammo stacks only? maybe?
				for (let i = 0; i < tableSizes[0].length; i++)
				{	// ammo stacks
					if(utility.getRandomIntEx(100) <= settings.bots.vest.stacksChance)
					{
						let stackammo = guns_f.getVestStackAmmo("StackAmmo" + utility.getRandomIntEx(999999), tableSizes[0][i], vest._id, ammoFilter_main);
						//console.log(stackammo);
						bot['Inventory'].items.push(stackammo);
						tableSizes[0].splice(i,1);
					}
				}
			}
		}
		if(weapon[1] !== 0){
			let magazineProperty = items.data[selectOneMagazineOnly_sub]._props;

			if(tableSizes[1].length > 0){
				if(magazineProperty.Width == 1 && magazineProperty.Height == 2){
					for (let i = 0; i < tableSizes[1].length; i++)
					{	// pistol mags
						if(utility.getRandomIntEx(100) <= settings.bots.vest.magChance)
						{
							let mag = guns_f.getVestMagazine("magP" + i + "Vest" + utility.getRandomIntEx(99999), tableSizes[1][i], vest._id, selectOneMagazineOnly_sub, [0,0]);
							let ammo = guns_f.getVestMagazineAmmo("AmmoMagPVest" + utility.getRandomIntEx(999999), mag._id, mag._tpl, ammoFilter_secondary);
							bot['Inventory'].items.push(mag);
							bot['Inventory'].items.push(ammo);
							tableSizes[1].splice(i,1);
						}
					}
				}
				if(magazineProperty.Width == 1 && magazineProperty.Height == 1){
					for (let i = 0; i < tableSizes[1].length; i++)
					{	// pistol mags
						let magAdded = false;
						for (let n = 0; n < 2; n++)
						{	// pistol mags
							if(utility.getRandomIntEx(100) <= settings.bots.vest.magChance)
							{
								magAdded = true;
								let mag = guns_f.getVestMagazine("magP" + i + "Vest" + utility.getRandomIntEx(99999), tableSizes[1][i], vest._id, selectOneMagazineOnly_sub, [0,n]);
								let ammo = guns_f.getVestMagazineAmmo("AmmoMagPVest" + utility.getRandomIntEx(999999), mag._id, mag._tpl, ammoFilter_secondary);
								bot['Inventory'].items.push(mag);
								bot['Inventory'].items.push(ammo);
								
							}
						}
						if(magAdded)
							tableSizes[1].splice(i,1);
					}
				}
			}
			if(tableSizes[2].length > 0){
				if(magazineProperty.Width == 1 && magazineProperty.Height == 2){
					for (let i = 0; i < tableSizes[2].length; i++)
					{	// pistol mags
						if(utility.getRandomIntEx(100) <= settings.bots.vest.magChance)
						{
							let mag = guns_f.getVestMagazine("magP" + i + "Vest" + utility.getRandomIntEx(99999), tableSizes[2][i], vest._id, selectOneMagazineOnly_sub, [0,0]);
							let ammo = guns_f.getVestMagazineAmmo("AmmoMagPVest" + utility.getRandomIntEx(999999), mag._id, mag._tpl, ammoFilter_secondary);
							bot['Inventory'].items.push(mag);
							bot['Inventory'].items.push(ammo);
							tableSizes[2].splice(i,1);
						}
					}
				}
				if(magazineProperty.Width == 1 && magazineProperty.Height == 1){
					for (let i = 0; i < tableSizes[2].length; i++)
					{	// pistol mags
						let magAdded = false;
						for (let n = 0; n < 3; n++){
							if(utility.getRandomIntEx(100) <= settings.bots.vest.magChance)
							{
								magAdded = true;
								let mag = guns_f.getVestMagazine("magP" + i + "Vest" + utility.getRandomIntEx(99999), tableSizes[2][i], vest._id, selectOneMagazineOnly_sub, [0,0]);
								let ammo = guns_f.getVestMagazineAmmo("AmmoMagPVest" + utility.getRandomIntEx(999999), mag._id, mag._tpl, ammoFilter_secondary);
								bot['Inventory'].items.push(mag);
								bot['Inventory'].items.push(ammo);
							}
						}
						if(magAdded)							
							tableSizes[2].splice(i,1);
					}
				}
			}
			

		}
	}
//now inserts magazines ends
//now inserts magazines ends
//now inserts magazines ends
    for (let bodyPart in bot.Health.BodyParts) { // randomize bot health <base-10 to base>
        bot.Health.BodyParts[bodyPart].Health.Current -= utility.getRandomInt(0, 10);
        bot.Health.BodyParts[bodyPart].Health.Maximum = bot.Health.BodyParts[bodyPart].Health.Current;
    }
    // add a knife (its always added)
    bot['Inventory'].items = itemPattern_f.generateItemByPattern("Scabbard", bot['Inventory'].items);
    if (utility.getRandomInt() <= settings['bots']['equipment']['headwear']) { // chance to add headwear
        bot['Inventory'].items = itemPattern_f.generateItemByPattern("Headwear", bot['Inventory'].items, params.Role);
    }
    if (utility.getRandomInt() <= settings['bots']['equipment']['eyewear']) { // chance to add glasses
        bot['Inventory'].items = itemPattern_f.generateItemByPattern("Eyewear", bot['Inventory'].items, params.Role);
    }
    if (utility.getRandomInt() <= settings['bots']['equipment']['facecover']) { // chance to add face cover
        bot['Inventory'].items = itemPattern_f.generateItemByPattern("FaceCover", bot['Inventory'].items, params.Role);
    }
    if (utility.getRandomInt() <= settings['bots']['equipment']['backpack']) { // chance to add a backpack
        bot['Inventory'].items = itemPattern_f.generateItemByPattern("Backpack", bot['Inventory'].items, params.Role);
    }
    if (utility.getRandomInt() <= settings['bots']['equipment']['armorvest']) { // chance to add an armor vest
        bot['Inventory'].items = itemPattern_f.generateItemByPattern("ArmorVest", bot['Inventory'].items, params.Role);
    }
    // chance to add a med pocket, bully followers have 100% chance
    for (let i = 1; i <= 4; i++) {// pockets fill up section
        let pocketItem_tmp = pocket_f.generatePocketItem(i, params.Role);
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

        if (limit > -1 && settings.bots.limit.override === true) {
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
module.exports.generate = generate;
module.exports.generatePlayerScav = generatePlayerScav;