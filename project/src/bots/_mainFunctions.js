"use strict";


//// ---- FUNCTIONS BELOW ---- ////

/* Internal function only for this file calculates random float number
* input: minimum value, maximum value
* output: Float number from min to max 0,000000
*/
function getRandomFloat(min = 0, max = 100) {
    return Math.random() * (max - min + 1) + min;
}
/* Calculates Item table chances to drop
* input: presetTable, Role_ofBot
* output: Random tier from 0 to Object.keys(presetTable)
*/
function calculateItemChance(preset, Role = "") { // calculate tiers chance

// pmcBot / followerBully
    let chance = 100;
    let chanceTable = [];
	//check if someone is fucking up with preset tiers amounts
	if(Object.keys(preset).length == 1)
		return 0; // because its only 1 preset tier set it to 0 and pass other calculations [performance]
	
    for (let i = 0; i < Object.keys(preset).length; i++) {
        chance /= 2;
        let lastChance = ((i !== 0) ? chanceTable[i - 1] : 0);
        chanceTable[i] = lastChance + chance;
    }
    let rng = getRandomFloat();
	
    if ((Role === "pmcBot" || Role === "followerBully") && rng <= 50) { // if pmcBot and bullyfollower then check if chance is to select tier 0 if yes reroll to higher tier of weapon
        rng = 50 + getRandomFloat(50);
    }

    for (let j = 0; j < chanceTable.length; j++) {
        if (j === 0) {
            if (rng < chanceTable[j]) {
                return j;
            }
        } else {
            if (rng < chanceTable[j] && rng > chanceTable[j - 1]) {
                return j;
            }
        }
    }
    return 0;
}

// helping functions \/\/\/
function updCreator(itemParent, item) {
    if (item._tpl === "59f32c3b86f77472a31742f0") {
        console.log("DOGTAG", "", "", true);
    }
    switch (itemParent) {
        case "590c745b86f7743cc433c5f2": // DogTags
            return {
                "Dogtag": {
                    "Nickname": "Nikita Buyanov",
                    "Side": "Bear",
                    "Level": 50,
                    "Time": "2020-04-16T13:37:00",
                    "Status": "Destroyed by ",
                    "KillerName": "JustEmuTarkov",
                    "WeaponName": "Choco bar"
                }
            };
        case "5448f3a14bdc2d27728b4569": // "Drugs",
        case "5448f39d4bdc2d0a728b4568": // "Medkits" (ok)
            return {MedKit: {HpResource: item._props.MaxHpResource}};
        case "5b47574386f77428ca22b335": // "Drinks",
        case "5448e8d64bdc2dce718b4568": // "FoodDrinks" (ok)
            return {FoodDrink: {HpPercent: item._props.MaxResource}};
        case "5485a8684bdc2da71d8b4567": // "Rounds",
            return {StackObjectsCount: utility.getRandomInt(1, item._props.StackMaxSize)};
        case "543be5cb4bdc2deb348b4568": // "Ammo",
            return {StackObjectsCount: 1};
        case "543be5dd4bdc2deb348b4569": // "Money",
            return {StackObjectsCount: utility.getRandomInt(1, (item._props.StackMaxSize / 100))};
        case "5c164d2286f774194c5e69fa": // "Keycard",
            return {Keycard: {NumberOfUsages: item._props.MaximumNumberOfUsage}};
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
            return {StackObjectsCount: 1};
    }
}

module.exports.calculateItemChance = calculateItemChance;
module.exports.updCreator = updCreator;
//module.exports.moveItem = moveItem;