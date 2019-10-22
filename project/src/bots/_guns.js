"use strict";

require('../libs.js');

/** ~ Guns generation
 * ~~input: 
 * ~~output: 
 */
function randomizePistolData(){
    let item_pist = 0;
    while (typeof item_pist != "object") { // make sure no pistol found
        let tier = bots_mf.calculateItemChance(presets['Pistol']);
        let len = presets['Pistol'][tier].length;
        let randomize = utility.getRandomInt(0,len-1);
        let weapon_preset_pist = presets['Pistol'][tier][randomize];
        for (let i = 0; i < weaponPresets.data.length; i++) {
            if (weaponPresets.data[i]._id === weapon_preset_pist) {
                item_pist = weaponPresets.data[i];
                break;
            }
        }
        if (typeof item_pist === "object")
            break;
    }
    return item_pist;
}
function randomizeMainWPData(){
    let item = 0;
    while (typeof item != "object") { // make sure no pistol found
        let tier = bots_mf.calculateItemChance(presets['Weapons']);
        let len = presets['Weapons'][tier].length;
        let randomize = utility.getRandomInt(0,len-1);
        let weapon_preset_id = presets['Weapons'][tier][randomize];
        for (let i = 0; i < weaponPresets.data.length; i++) {
            if (weaponPresets.data[i]._id === weapon_preset_id) {
                item = weaponPresets.data[i];
                break;
            }
        }
        if (typeof item === "object")
            break;
    }
    return item;
}
function generateBotWeapon(params) { // generating presets
    let len = 0;
    let randomize = 0;
    let weapon_preset_main = 0;
    let weapon_preset_pist = 0;
    let item_main = 0;
    let item_pist = 0;
    //randomize Mainweapon and hostler weapon rolling if there should we (main weapon and postol) / (pistol) or (mainweapin only)
    const chanceOfGetting = [settings.bots.weapon.main, settings.bots.weapon.secondary];
    if (params.Role === "pmcBot")
        chanceOfGetting[0] = 100;

    // MAIN WEAPON ROLLING
    if (params.Role === "marksman") { // if bot is marksman sniper get item from fdiffrent table
        len = presets['Weapons_Marksman'].length;
        randomize = utility.getRandomInt(0,len-1);
        weapon_preset_main = presets['Weapons_Marksman'][randomize]; // it should not have any pistols
    } else {
        if (utility.getRandomIntEx(100) < chanceOfGetting[0]) { // try to roll weapon
            item_main = randomizeMainWPData();
        }
    }
    // weapon_preset_pist / weapon_preset_main - it contains preset name aka WeaponPresetXXX
    //PISTOL ROLLING IF MAIN EXISTS
    if(typeof item_main === "object") {
        if (utility.getRandomIntEx(100) < chanceOfGetting[1]) {
            item_pist = randomizePistolData();
        }
    } else {
        item_pist = randomizePistolData();
    }
    let isSingleLoaded = false;
    for (let i = 0; i < presets.Single_Loading.length; i++) {
        if (presets.Single_Loading[i] === weapon_preset_main) {
            isSingleLoaded = true;
            break;
        }
    }
     // zero if no item
	 if(item_main === 0)
		 if(item_pist === 0)
			console.log("[ERROR] still no weapon: " + item_pist._id + " " + item_main._id);
    return [[item_main, isSingleLoaded], item_pist];
}

/* Gets Compatible magazines and sort them based on slots usage 1,2,3 to 0,1,2 place in table
* input: weaponData, Grids of Rig
* output: table[Mags1Slot, Mags2Slot, Mags3Slot]
**/
function getCompatibleMagazines(weapon) {
    let compatiblesmagazines = {};
	/*magazines:
		1 slot
		2 slots
		3 slots
	*/	
	let mags = [[],[],[],[]];
    for (let slot of items.data[weapon._items[0]._tpl]._props.Slots) {
        if (slot._name === "mod_magazine") {
            compatiblesmagazines = slot._props.filters[0].Filter;
            break;
        }
    }
	for (let magazine of compatiblesmagazines){
		switch(items.data[magazine]._props.Height){
			case 2:
				if(items.data[magazine]._props.Width == 2)
					mags[3].push(magazine);
				else
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
    item.location = {"x": loc[0], "y": loc[1], "r": "Horizontal"};
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

//module.exports.randomizePistolData = randomizePistolData; // its propably not needed but who cares
//module.exports.randomizeMainWPData = randomizeMainWPData; // its propably not needed but who cares
module.exports.generateBotWeapon = generateBotWeapon;
module.exports.getCompatibleMagazines = getCompatibleMagazines;
module.exports.getCompatibleAmmo = getCompatibleAmmo;
module.exports.getWeaponMagazine = getWeaponMagazine;
module.exports.getWeaponMagazineAmmo = getWeaponMagazineAmmo;
module.exports.getMosimAmmo = getMosimAmmo;
module.exports.getVestMagazine = getVestMagazine;
module.exports.getVestMagazineAmmo = getVestMagazineAmmo;
module.exports.getVestStackAmmo = getVestStackAmmo;
