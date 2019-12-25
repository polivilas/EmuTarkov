"use strict";

require("./libs.js");

function getProfiles() {
    return json.parse(json.read(filepaths.user.profiles.list));
}

function isProfileWiped() {
    let profiles = getProfiles();
    return !profiles[constants.getActiveID()].wipe;
}

function getProfile() {
    let profilePath = filepaths.user.profiles.character;
    return profilePath.replace("__REPLACEME__", constants.getActiveID());
}

function getProfileById(profileID) {
    let profilePath = filepaths.user.profiles.character;
    return json.parse(json.read(profilePath.replace("__REPLACEME__", profileID)));
}

function create(info) {
    let profiles = getProfiles();
    let accountFolder = "user/profiles/" + constants.getActiveID() + "/";
    let character = json.parse(json.read("db/profile/character.json"));
    let storage = json.parse(json.read("db/profile/storage.json"));
    let userBuilds = json.parse(json.read("db/profile/userBuilds.json"));

    character._id = "user" + constants.getActiveID() + "pmc";
    character.aid = "user" + constants.getActiveID();
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
    json.write(accountFolder + "userBuilds.json", userBuilds);

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
    profiles[constants.getActiveID()].wipe = false;
    json.write(filepaths.user.profiles.list, profiles);
}

function loadTraderStandings(playerData = "") {
    // get profile Data
    let profileData = playerData;

    if (playerData == "") {
        profileData = getCharacterData();
    }

    let profileCharData = profileData.data[1];

    // get trader data and update by profile info
    let dynTrader;

    // Check if trader standing data exists
    /*if (profileCharData.hasOwnProperty("TraderStandings")) {
        for (dynTrader of trader.getDynamicTraders()) {
            let profileStanding = profileCharData.TraderStandings[dynTrader];
            let traderLoyality = trader.get(dynTrader).data.loyalty;

            traderLoyality.currentLevel = profileStanding.currentLevel;
            traderLoyality.currentStanding = profileStanding.currentStanding;
            traderLoyality.currentSalesSum = profileStanding.currentSalesSum;

            // set Loyalty in trader
            trader.get(dynTrader).data.loyalty = traderLoyality;
        }
    } else {
        profileCharData.TraderStandings = {};
        // add with default data
        for (dynTrader of trader.getDynamicTraders()) {
            let traderLoyality = trader.get(dynTrader).data.loyalty;
            profileCharData.TraderStandings[dynTrader] =
                {
                    "currentSalesSum": traderLoyality.currentSalesSum,
                    "currentLevel": traderLoyality.currentLevel,
                    "currentStanding": traderLoyality.currentStanding
                };
        }
        // save profile
        profileData.data[1] = profileCharData;
        setCharacterData(profileData);
    }*/

    if (playerData != "") {
        return profileData;
    }
}

function saveProfileProgress(offRaidData) {
    let offRaidExit = offRaidData.exit;
    let offRaidProfile = offRaidData.profile;
    let currentProfile = getCharacterData();

    // replace data
    currentProfile.data[0].Info.Experience = offRaidProfile.Info.Experience;
    currentProfile.data[0].Info.Level = offRaidProfile.Info.Level;
    currentProfile.data[0].Health = offRaidProfile.Health;
    currentProfile.data[0].Skills = offRaidProfile.Skills;
    currentProfile.data[0].Stats.SessionCounters = offRaidProfile.Stats.SessionCounters;
    currentProfile.data[0].Stats.OverallCounters = offRaidProfile.Stats.OverallCounters;
    currentProfile.data[0].Stats.LastSessionDate = offRaidProfile.Stats.LastSessionDate;
    currentProfile.data[0].Encyclopedia = offRaidProfile.Encyclopedia;
    currentProfile.data[0].ConditionCounters = offRaidProfile.ConditionCounters;
    currentProfile.data[0].Quests = offRaidProfile.Quests;

    // replace bsg shit long ID with proper one
    let string_inventory = JSON.stringify(offRaidProfile.Inventory.items);

    for (let recalID in offRaidProfile.Inventory.items) {
        if (offRaidProfile.Inventory.items.hasOwnProperty(recalID)) {
            //do not replace important ID's
            if (
                offRaidProfile.Inventory.items[recalID]._id !== offRaidProfile.Inventory.equipment &&
                offRaidProfile.Inventory.items[recalID]._id !== offRaidProfile.Inventory.questRaidItems &&
                offRaidProfile.Inventory.items[recalID]._id !== offRaidProfile.Inventory.questStashItems
            ) {
                let old_id = offRaidProfile.Inventory.items[recalID]._id;
                let new_id = utility.generateNewItemId();

                string_inventory = string_inventory.replace(new RegExp(old_id, 'g'), new_id);
            }
        }
    }

    offRaidProfile.Inventory.items = JSON.parse(string_inventory);

    // set profile equipment to the raid equipment
    move_f.removeItem(currentProfile, {Action: 'Remove', item: currentProfile.data[0].Inventory.equipment});
    move_f.removeItem(currentProfile, {Action: 'Remove', item: currentProfile.data[0].Inventory.questRaidItems});
    move_f.removeItem(currentProfile, {Action: 'Remove', item: currentProfile.data[0].Inventory.questStashItems});

    for (let inventoryitem in offRaidProfile.Inventory.items) {
        if (offRaidProfile.Inventory.items.hasOwnProperty(inventoryitem)) {
            currentProfile.data[0].Inventory.items.push(offRaidProfile.Inventory.items[inventoryitem]);
        }
    }

    // remove inventory if player died
    if (offRaidExit !== "survived" && offRaidExit !== "runner") {
        let pocketid = "";
        let items_to_delete = [];

        for (let inventoryitem in currentProfile.data[0].Inventory.items) {
            if (currentProfile.data[0].Inventory.items[inventoryitem].parentId === currentProfile.data[0].Inventory.equipment
                && currentProfile.data[0].Inventory.items[inventoryitem].slotId !== "SecuredContainer"
                && currentProfile.data[0].Inventory.items[inventoryitem].slotId !== "Scabbard"
                && currentProfile.data[0].Inventory.items[inventoryitem].slotId !== "Pockets") {

                //store it and delete later because i dont know its not working otherwiswe
                items_to_delete.push(currentProfile.data[0].Inventory.items[inventoryitem]._id);
            }

            // we need pocket id for later, its working differently
            if (currentProfile.data[0].Inventory.items[inventoryitem].slotId === "Pockets") {
                pocketid = currentProfile.data[0].Inventory.items[inventoryitem]._id;
            }
        }

        // and then delete inside pockets
        for (let inventoryitem in currentProfile.data[0].Inventory.items) {
            if (currentProfile.data[0].Inventory.items[inventoryitem].parentId === pocketid) {
                // store it and delete later because i dont know its not working otherwiswe
                items_to_delete.push(currentProfile.data[0].Inventory.items[inventoryitem]._id);
            }
        }

        // finally delete them
        for (let item_to_delete in items_to_delete) {
            move_f.removeItem(currentProfile, {Action: 'Remove', item: items_to_delete[item_to_delete]});
        }
    }

    setCharacterData(currentProfile);
}

function getCharacterData() {
    let ret = {err: 0, errmsg: null, data: []};

    // creating profile for first time
    if (!isProfileWiped()) {
        return ret;
    }

    // create full profile data from simplified character data
    let playerData = json.parse(json.read(getProfile()));
    let scavData = bots.generatePlayerScav();

    scavData._id = playerData.savage;
    scavData.aid = constants.getActiveID();
    ret.data.push(playerData);
    ret.data.push(scavData);
    ret = loadTraderStandings(ret);

    return ret;
}

function getStashType() {
    let temp = json.parse(json.read(getProfile()));

    for (let key in temp.Inventory.items) {
        if (temp.Inventory.items.hasOwnProperty(key) && temp.Inventory.items[key]._id === temp.Inventory.stash) {
            return temp.Inventory.items[key]._tpl;
        }
    }

    console.log("Not found Stash: error check character.json", "red");
    return "NotFound Error";
}

function setCharacterData(data) {
    if (typeof data.data !== "undefined") {
        data = data.data[0];
    }

    json.write(getProfile(), data);
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
    let data = json.parse(json.read(getProfile()));

    items = items_f.prepareItems();

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
        if (info.email === profile.email && info.pass === profile.password) {
            return profile.id;
        } else {
            return -3;
        }
    }

    return -1;
}

function getReservedNickname() {
    let profiles = getProfiles();
    return profiles[constants.getActiveID()].nickname;
}

function nicknameExist(info) {
    let profiles = getProfiles();

    for (let i = 0; i < profiles.length; i++) {
        let profile = json.parse(json.read(getProfile()));

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

function find() {
    settings = json.parse(json.read(filepaths.user.config));
    constants.setActiveID(settings.debug.activeId);

    let backendUrl = "https://" + ip;
    return '{"err":0,"errmsg":null,"data":{"queued": false, "banTime": 0, "hash": "BAN0", "lang": "en", "aid": "user' + constants.getActiveID() + '", "token": "token_' + constants.getActiveID() + '", "taxonomy": "341", "activeProfileId": "user' + constants.getActiveID() + 'pmc", "nickname": "user", "backend": {"Trading":"' + backendUrl + '", "Messaging":"' + backendUrl + '", "Main":"' + backendUrl + '", "RagFair":"' + backendUrl + '"}, "totalInGame": 0}}';
}

function addItemToStash(tmpList, body, trad = "")// Buying item from trader
{
    let PlayerStash = itm_hf.getPlayerStash();
    let stashY = PlayerStash[1];
    let stashX = PlayerStash[0];
    item.resetOutput();
    let output = item.getOutput();
    let tmpTrader = json.parse(json.read(filepaths.user.cache.assort_everything));

    for (let item of tmpTrader.data.items) {
        if (item._id === body.item_id) {
            let MaxStacks = 1;
            let StacksValue = [];
            let tmpItem = itm_hf.getItem(item._tpl)[1];

            // split stacks if the size is higher than allowed by StackMaxSize
            if (body.count > tmpItem._props.StackMaxSize) {
                let count = body.count;
                //maxstacks if not divided by then +1
                let calc = body.count - (Math.floor(body.count / tmpItem._props.StackMaxSize) * tmpItem._props.StackMaxSize);
                MaxStacks = (calc > 0) ? MaxStacks + Math.floor(count / tmpItem._props.StackMaxSize) : Math.floor(count / tmpItem._props.StackMaxSize);
                for (let sv = 0; sv < MaxStacks; sv++) {
                    if (count > 0) {
                        if (count > tmpItem._props.StackMaxSize) {
                            count = count - tmpItem._props.StackMaxSize;
                            StacksValue[sv] = tmpItem._props.StackMaxSize;
                        } else {
                            StacksValue[sv] = count;
                        }
                    }
                }
            } else {
                StacksValue[0] = body.count;
            }
            // stacks prepared

            for (let stacks = 0; stacks < MaxStacks; stacks++) {
                tmpList = profile.getCharacterData();//update profile on each stack so stash recalculate will have new items
                let StashFS_2D = itm_hf.recheckInventoryFreeSpace(tmpList);
                let ItemSize = itm_hf.getSize(item._tpl, item._id, tmpTrader.data.items);
                let tmpSizeX = ItemSize[0];
                let tmpSizeY = ItemSize[1];
                //let badSlot = "no";
                addedProperly:
                    for (let y = 0; y <= stashY - tmpSizeY; y++) {
                        for (let x = 0; x <= stashX - tmpSizeX; x++) {
                            let badSlot = "no";
                            break_BadSlot:
                                for (let itemY = 0; itemY < tmpSizeY; itemY++) {
                                    for (let itemX = 0; itemX < tmpSizeX; itemX++) {
                                        if (StashFS_2D[y + itemY][x + itemX] !== 0) {
                                            badSlot = "yes";
                                            break break_BadSlot;
                                        }
                                    }
                                }
                            if (badSlot === "yes") {
                                continue;
                            }

                            console.log("Item placed at position [" + x + "," + y + "]", "", "", true);
                            let newItem = utility.generateNewItemId();
                            let toDo = [[item._id, newItem]];

                            output.data.items.new.push({
                                "_id": newItem,
                                "_tpl": item._tpl,
                                "parentId": tmpList.data[0].Inventory.stash,
                                "slotId": "hideout",
                                "location": {"x": x, "y": y, "r": 0},
                                "upd": {"StackObjectsCount": StacksValue[stacks]}
                            });

                            tmpList.data[0].Inventory.items.push({
                                "_id": newItem,
                                "_tpl": item._tpl,
                                "parentId": tmpList.data[0].Inventory.stash,
                                "slotId": "hideout",
                                "location": {"x": x, "y": y, "r": 0},
                                "upd": {"StackObjectsCount": StacksValue[stacks]}
                            });
                            //tmpUserTrader.data[newItem] = [[{"_tpl": item._tpl, "count": prices.data.barter_scheme[item._tpl][0][0].count}]];

                            while (true) {
                                if (typeof toDo[0] === "undefined") {
                                    break;
                                }

                                for (let tmpKey in tmpTrader.data.items) {
                                    if (tmpTrader.data.items[tmpKey].parentId && tmpTrader.data.items[tmpKey].parentId === toDo[0][0]) {
                                        newItem = utility.generateNewItemId();
                                        let SlotID = tmpTrader.data.items[tmpKey].slotId;
                                        if (SlotID === "hideout") {
                                            output.data.items.new.push({
                                                "_id": newItem,
                                                "_tpl": tmpTrader.data.items[tmpKey]._tpl,
                                                "parentId": toDo[0][1],
                                                "slotId": SlotID,
                                                "location": {"x": x, "y": y, "r": "Horizontal"},
                                                "upd": {"StackObjectsCount": StacksValue[stacks]}
                                            });
                                            tmpList.data[0].Inventory.items.push({
                                                "_id": newItem,
                                                "_tpl": tmpTrader.data.items[tmpKey]._tpl,
                                                "parentId": toDo[0][1],
                                                "slotId": tmpTrader.data.items[tmpKey].slotId,
                                                "location": {"x": x, "y": y, "r": "Horizontal"},
                                                "upd": {"StackObjectsCount": StacksValue[stacks]}
                                            });
                                        } else {
                                            output.data.items.new.push({
                                                "_id": newItem,
                                                "_tpl": tmpTrader.data.items[tmpKey]._tpl,
                                                "parentId": toDo[0][1],
                                                "slotId": SlotID,
                                                "upd": {"StackObjectsCount": StacksValue[stacks]}
                                            });
                                            tmpList.data[0].Inventory.items.push({
                                                "_id": newItem,
                                                "_tpl": tmpTrader.data.items[tmpKey]._tpl,
                                                "parentId": toDo[0][1],
                                                "slotId": tmpTrader.data.items[tmpKey].slotId,
                                                "upd": {"StackObjectsCount": StacksValue[stacks]}
                                            });
                                        }
                                        toDo.push([tmpTrader.data.items[tmpKey]._id, newItem]);
                                    }
                                }
                                toDo.splice(0, 1);
                            }
                            break addedProperly;
                        }
                    }
                profile.setCharacterData(tmpList); // save after each added item
            }
            return output;
        }
    }

    return "";
}

module.exports.isProfileWiped = isProfileWiped;
module.exports.getProfileById = getProfileById;
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
module.exports.addItemToStash = addItemToStash;