"use strict";

require("./libs.js");

function getProfiles() {
    return json.parse(json.read(filepaths.user.profiles.list));
}

function findProfile(profileId) {
    let profiles = getProfiles();

    for (let profile of profiles) {
        if (profile.id === profileId) {
            return profile;
        }
    }

    return undefined;
}

function isProfileWiped() {
    let profile = findProfile(constants.getActiveID());

    if (profile !== typeof "undefined") {
        return profile.wipe;
    }

    return true;
}

function setProfileWipe(profileId, state) {
    let profiles = getProfiles();

    for (let profile in profiles) {
        if (profiles[profile].id === profileId) {
            profiles[profile].wipe = state;
        }
    }

    json.write(filepaths.user.profiles.list, profiles);
}

function getProfilePath() {
    let profilePath = filepaths.user.profiles.character;
    return profilePath.replace("__REPLACEME__", constants.getActiveID());
}

function create(info) {
    let accountFolder = "user/profiles/" + constants.getActiveID() + "/";
    let character = json.parse(json.read(filepaths.profile.character));
    let storage = json.parse(json.read(filepaths.profile.storage));
    let userbuilds = json.parse(json.read(filepaths.profile.userbuilds));

    character._id = "user" + constants.getActiveID() + "pmc";
    character.aid = constants.getActiveID();
    character.savage = "user" + constants.getActiveID() + "scav";
    character.Info.Nickname = info.nickname;
    character.Info.LowerNickname = info.nickname.toLowerCase();
    storage.data._id = "user" + constants.getActiveID() + "pmc";

    switch (info.side) {
        case "Bear":
            character.Info.Side = "Bear";
            character.Info.Voice = "Bear_1";
            character.Customization.Head = "5cc084dd14c02e000b0550a3";
            character.Customization.Body = "5cc0858d14c02e000c6bea66";
            character.Customization.Feet = "5cc085bb14c02e000e67a5c5";
            character.Customization.Hands = "5cc0876314c02e000c6bea6b";
            storage.data.suites = ["5cd946231388ce000d572fe3", "5cd945d71388ce000a659dfb"];
            break;

        case "Usec":
            character.Info.Side = "Usec";
            character.Info.Voice = "Usec_1";
            character.Customization.Head = "5cde96047d6c8b20b577f016";
            character.Customization.Body = "5cde95d97d6c8b647a3769b0";
            character.Customization.Feet = "5cde95ef7d6c8b04713c4f2d";
            character.Customization.Hands = "5cde95fa7d6c8b04737c2d13";
            storage.data.suites = ["5cde9ec17d6c8b04723cf479", "5cde9e957d6c8b0474535da7"];
            break;
    }

    // create profile
    json.write(accountFolder + "character.json", character);
    json.write(accountFolder + "storage.json", storage);
    json.write(accountFolder + "userBuilds.json", userbuilds);

    // create traders
    let inputFiles = filepaths.traders;
    let inputNames = Object.keys(inputFiles);
    let i = 0;

    for (let file in inputFiles) {
        let filePath = inputFiles[file];
        let fileData = json.parse(json.read(filePath));
        let fileName = inputNames[i++];

        json.write(accountFolder + "traders/" + fileName + ".json", fileData);
    }

    // don't wipe profile again
    setProfileWipe(constants.getActiveID(), false);
}

function saveProfileProgress(offRaidData) {
    let offRaidExit = offRaidData.exit;
    let offRaidProfile = offRaidData.profile;
    let tmpList = getCharacterData();

    // replace data
    tmpList.data[0].Info.Level = offRaidProfile.Info.Level;
    tmpList.data[0].Skills = offRaidProfile.Skills;
    tmpList.data[0].Stats = offRaidProfile.Stats;
    tmpList.data[0].Encyclopedia = offRaidProfile.Encyclopedia;
    tmpList.data[0].ConditionCounters = offRaidProfile.ConditionCounters;
    tmpList.data[0].Quests = offRaidProfile.Quests;

    // level 69 cap to prevent visual bug occuring at level 70
    if (tmpList.data[0].Info.Experience > 13129881) {
        tmpList.data[0].Info.Experience = 13129881;
    }

    // mark items found in raid
    for (let offRaidItem in offRaidProfile.Inventory.items) {
        let found = false;

        // check if item exists already
        for (let item of tmpList.data[0].Inventory.items) {
            if (offRaidProfile.Inventory.items[offRaidItem]._id === item._id) {
                found = true;
            }            
        }

        if (found) {
            continue;
        }

        // mark item found in raid when unfound
        let currentItem = offRaidProfile.Inventory.items[offRaidItem];

        if (currentItem.hasOwnProperty("upd")) {
            // property already exists, so we can skip it
            if (currentItem.upd.hasOwnProperty("SpawnedInSession")) {
                continue;
            }

            currentItem.upd["SpawnedInSession"] = true;
        } else {
            currentItem["upd"] = {"SpawnedInSession": true};
        }

        offRaidProfile.Inventory.items[offRaidItem] = currentItem;
    }

    // replace bsg shit long ID with proper one
    let string_inventory = json.stringify(offRaidProfile.Inventory.items);

    for (let item in offRaidProfile.Inventory.items) {
        let insuredItem = false;

        // insured items shouldn't be renamed
        for (let insurance in tmpList.data[0].InsuredItems) {
            if (tmpList.data[0].InsuredItems[insurance].itemId === offRaidProfile.Inventory.items[item]._id) {
                insuredItem = true;
            }
        }

        // do not replace important ID's
        if (insuredItem) {
            continue;
        }

        if (offRaidProfile.Inventory.items[item]._id === offRaidProfile.Inventory.equipment) {
            continue;
        }

        if (offRaidProfile.Inventory.items[item]._id === offRaidProfile.Inventory.questRaidItems) {
            continue;
        }

        if (offRaidProfile.Inventory.items[item]._id === offRaidProfile.Inventory.questStashItems) {
            continue;
        }

        // replace id
        let old_id = offRaidProfile.Inventory.items[item]._id;
        let new_id = utility.generateNewItemId();

        string_inventory = string_inventory.replace(new RegExp(old_id, 'g'), new_id);
    }

    offRaidProfile.Inventory.items = JSON.parse(string_inventory);

    // set profile equipment to the raid equipment
    move_f.removeItem(tmpList, tmpList.data[0].Inventory.equipment);
    move_f.removeItem(tmpList, tmpList.data[0].Inventory.questRaidItems);
    move_f.removeItem(tmpList, tmpList.data[0].Inventory.questStashItems);

    for (let item in offRaidProfile.Inventory.items) {
        tmpList.data[0].Inventory.items.push(offRaidProfile.Inventory.items[item]);
    }

    // remove inventory if player died
    if (offRaidExit !== "survived" && offRaidExit !== "runner") {
        let items_to_delete = [];

        for (let item of tmpList.data[0].Inventory.items) {
            if (inventoryitem.parentId === currentProfile.data[0].Inventory.equipment
                && inventoryitem.slotId !== "SecuredContainer"
                && inventoryitem.slotId !== "Scabbard"
                && inventoryitem.slotId !== "Pockets") {
                items_to_delete.push(inventoryitem._id);
            }

            // pockets works differently
            if (item.slotId === "Pockets") {
                for (let pocket of tmpList.data[0].Inventory.items) {
                    if (pocket.parentId === item._id) {
                        items_to_delete.push(pocket._id);
                    }
                }
            }
        }

        // check for insurance
        for (let item_to_delete in items_to_delete) {
            for (let insurance in tmpList.data[0].InsuredItems) {
                if (items_to_delete[item_to_delete] !== tmpList.data[0].InsuredItems[insurance].itemId) {
                    continue;
                }

                let insureReturnChance = utility.getRandomInt(0, 99);
		
                if (insureReturnChance < settings.gameplay.trading.insureReturnChance) {
                    move_f.removeInsurance(tmpList, items_to_delete[item_to_delete]);
                    items_to_delete[item_to_delete] = "insured";
                    break;
                }
            }
        }

        // finally delete them
        for (let item_to_delete in items_to_delete) {
            if (items_to_delete[item_to_delete] !== "insured") {
                move_f.removeItem(tmpList, items_to_delete[item_to_delete]);
            }
        }
    }

    setCharacterData(tmpList);
}

function getCharacterData() {
    let ret = {err: 0, errmsg: null, data: []};

    // creating profile for first time
    if (isProfileWiped()) {
        return ret;
    }

    // create full profile data from simplified character data
    let playerData = json.parse(json.read(getProfilePath()));
    let scavData = bots.generatePlayerScav();

    scavData._id = playerData.savage;
    scavData.aid = constants.getActiveID();

    ret.data.push(playerData);
    ret.data.push(scavData);
    return ret;
}

function getStashType() {
    let temp = json.parse(json.read(getProfilePath()));

    for (let key in temp.Inventory.items) {
        if (temp.Inventory.items.hasOwnProperty(key) && temp.Inventory.items[key]._id === temp.Inventory.stash) {
            return temp.Inventory.items[key]._tpl;
        }
    }

    logger.logError("Not found Stash: error check character.json", "red");
    return "NotFound Error";
}

function setCharacterData(data) {
    if (typeof data.data !== "undefined") {
        data = data.data[0];
    }

    json.write(getProfilePath(), data);
}

function addChildPrice(data, parentID, childPrice) {
    for (let invItems in data) {
        if (data.hasOwnProperty(invItems) && data[invItems]._id === parentID) {
            if (data[invItems].hasOwnProperty("childPrice")) {
                data[invItems].childPrice += childPrice;
            } else {
                data[invItems].childPrice = childPrice;
                break;
            }
        }
    }

    return data;
}

function getPurchasesData() {
    let multiplier = 0.9;
    let data = json.parse(json.read(getProfilePath()));

    items = json.parse(json.read(filepaths.user.cache.items));

    //prepared vars
    let equipment = data.Inventory.equipment;
    let stash = data.Inventory.stash;
    let questRaidItems = data.Inventory.questRaidItems;
    let questStashItems = data.Inventory.questStashItems;

    data = data.Inventory.items; // make data as .items array

    //do not add this items to the list of soldable
    let notSoldableItems = [
        "544901bf4bdc2ddf018b456d", //wad of rubles
        "5449016a4bdc2d6f028b456f", // rubles
        "569668774bdc2da2298b4568", // euros
        "5696686a4bdc2da3298b456a" // dolars
    ];

    for (let invItems in data) {
        if (data.hasOwnProperty(invItems)) {
            if (
                data[invItems]._id !== equipment &&
                data[invItems]._id !== stash &&
                data[invItems]._id !== questRaidItems &&
                data[invItems]._id !== questStashItems &&
                notSoldableItems.indexOf(data[invItems]._tpl) === -1
            ) {
                if (data[invItems].hasOwnProperty("parentId")) {
                    if (
                        data[invItems].parentId !== equipment &&
                        data[invItems].parentId !== stash &&
                        data[invItems].parentId !== questRaidItems &&
                        data[invItems].parentId !== questStashItems
                    ) {
                        let templateId = data[invItems]._tpl;
                        let itemCount = (typeof data[invItems].upd !== "undefined" ? (typeof data[invItems].upd.StackObjectsCount !== "undefined" ? data[invItems].upd.StackObjectsCount : 1) : 1);
                        let basePrice = (items.data[templateId]._props.CreditsPrice >= 1 ? items.data[templateId]._props.CreditsPrice : 1);
                        data = addChildPrice(
                            data,
                            data[invItems].parentId,
                            itemCount * basePrice
                        ); // multiplyer is used at parent item
                    }
                }
            }
        }
    }

    //start output string here
    let purchaseOutput = '{"err": 0,"errmsg":null,"data":{';
    let i = 0;

    for (let invItems in data) {
        if (data.hasOwnProperty(invItems)) {
            if (
                data[invItems]._id !== equipment &&
                data[invItems]._id !== stash &&
                data[invItems]._id !== questRaidItems &&
                data[invItems]._id !== questStashItems &&
                notSoldableItems.indexOf(data[invItems]._tpl) === -1
            ) {
                if (i !== 0) {
                    purchaseOutput += ",";
                } else {
                    i++;
                }

                let itemCount = (typeof data[invItems].upd !== "undefined" ? (typeof data[invItems].upd.StackObjectsCount !== "undefined" ? data[invItems].upd.StackObjectsCount : 1) : 1);
                let templateId = data[invItems]._tpl;
                let basePrice = (items.data[templateId]._props.CreditsPrice >= 1 ? items.data[templateId]._props.CreditsPrice : 1);

                if (data[invItems].hasOwnProperty("childPrice")) {
                    basePrice += data[invItems].childPrice;
                }

                let preparePrice = basePrice * multiplier * itemCount;

                preparePrice = (preparePrice > 0 && preparePrice !== "NaN" ? preparePrice : 1);
                purchaseOutput += '"' + data[invItems]._id + '":[[{"_tpl": "' + data[invItems]._tpl + '","count": ' + preparePrice.toFixed(0) + "}]]";
            }
        }
    }

    purchaseOutput += "}}"; // end output string here
    return purchaseOutput;
}

function exist(info) {
    let profiles = getProfiles();

    for (let profile of profiles) {
        if (info.email === profile.email && info.password === profile.password) {
            return profile.id;
        }
    }

    return 0;
}

function getReservedNickname() {
    let profile = findProfile(constants.getActiveID());

    if (profile !== typeof "undefined") {
        return profile.nickname;
    }

    return "";
}

function nicknameExist(info) {
    let profiles = getProfiles();

    for (let i = 0; i < profiles.length; i++) {
        let profile = json.parse(json.read(getProfilePath()));

        if (profile.Info.Nickname === info.nickname) {
            return true;
        }
    }

    return false;
}

function changeNickname(info) {
    let tmpList = getCharacterData();

    // check if the nickname exists
    if (nicknameExist(info)) {
        return '{"err":225, "errmsg":"this nickname is already in use", "data":null}';
    }

    // change nickname
    tmpList.data[0].Info.Nickname = info.nickname;
    tmpList.data[0].Info.LowerNickname = info.nickname.toLowerCase();
    setCharacterData(tmpList);
    return ('{"err":0, "errmsg":null, "data":{"status":0, "nicknamechangedate":' + Math.floor(new Date() / 1000) + "}}");
}

function changeVoice(info) {
    let tmpList = getCharacterData();

    tmpList.data[0].Info.Voice = info.voice;
    setCharacterData(tmpList);
}

function find(data) {
    let buff = Buffer.from(data.token, 'base64');
    let text = buff.toString('ascii');
    let info = json.parse(text);
    let profileId = exist(info);

    constants.setActiveID(profileId);
    return json.stringify({profileId: profileId});
}

module.exports.isProfileWiped = isProfileWiped;
module.exports.create = create;
module.exports.getCharacterData = getCharacterData;
module.exports.setCharacterData = setCharacterData;
module.exports.getPurchasesData = getPurchasesData;
module.exports.getStashType = getStashType;
module.exports.getReservedNickname = getReservedNickname;
module.exports.changeNickname = changeNickname;
module.exports.changeVoice = changeVoice;
module.exports.find = find;
module.exports.saveProfileProgress = saveProfileProgress;