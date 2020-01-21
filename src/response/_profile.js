"use strict";

require("../libs.js");

function getPmcPath(sessionID) {
    let path = filepaths.user.profiles.character;
    return path.replace("__REPLACEME__", sessionID);
}

function getScavPath(sessionID) {
    let path = filepaths.user.profiles.scav;
    return path.replace("__REPLACEME__", sessionID);
}

function create(info, sessionID) {
    let account = account_f.find(sessionID);
    let folder = account_f.getPath(account.id);
    let pmcData = json.parse(json.read(filepaths.profile.character[account.edition + "_" + info.side.toLowerCase()]));
    let storage = json.parse(json.read(filepaths.profile.storage));
    let userbuilds = json.parse(json.read(filepaths.profile.userbuilds));

    pmcData._id = "pmc" + account.id;
    pmcData.aid = account.id;
    pmcData.savage = "scav" + account.id;
    pmcData.Info.Nickname = info.nickname;
    pmcData.Info.LowerNickname = info.nickname.toLowerCase();
    pmcData.Info.RegistrationDate = Math.floor(new Date() / 1000);
    storage.data._id = "pmc" + account.id;

    switch (info.side) {
        case "Bear":
            storage.data.suites = ["5cd946231388ce000d572fe3", "5cd945d71388ce000a659dfb"];
            break;

        case "Usec":
            storage.data.suites = ["5cde9ec17d6c8b04723cf479", "5cde9e957d6c8b0474535da7"];
            break;
    }

    // create profile
    json.write(folder + "character.json", pmcData);
    json.write(folder + "storage.json", storage);
    json.write(folder + "userbuilds.json", userbuilds);
    json.write(folder + "scav.json", generateScav(sessionID));
    json.write(folder + "dialogue.json", {});

    // create traders
    let inputFiles = filepaths.traders;
    let inputNames = Object.keys(inputFiles);
    let i = 0;

    for (let file in inputFiles) {
        let filePath = inputFiles[file];
        let fileData = json.parse(json.read(filePath));
        let fileName = inputNames[i++];

        // generate trader
        json.write(folder + "traders/" + fileName + ".json", fileData);

        // generate assort
        if (fileName === "579dc571d53a0658a154fbec") {
            continue;
        }

        assort_f.generate(fileName, account.id);
    }

    // don't wipe profile again
    account_f.setWipe(account.id, false);
}

function setPmcData(data, sessionID) {
    json.write(getPmcPath(sessionID), data);
}

function setScavData(data, sessionID) {
    json.write(getScavPath(sessionID), data);   
}

function generateScav(sessionID) {
    let pmcData = getPmcData(sessionID);
    let scavData = bots.generatePlayerScav();

    scavData._id = pmcData.savage;
    scavData.aid = sessionID;
    setScavData(scavData, sessionID);

    return scavData;
}

function getPmcData(sessionID) {
    let pmcData = json.parse(json.read(getPmcPath(sessionID)));

    if (pmcData.Stats.TotalSessionExperience > 0) {
        const sessionExp = pmcData.Stats.TotalSessionExperience;

        pmcData.Info.Experience += sessionExp;
        pmcData.Stats.TotalSessionExperience = 0;
        setPmcData(pmcData, sessionID);
        pmcData.Info.Experience -= sessionExp;
    }
    
    return pmcData;
}

function getScavData(sessionID) {
    if (!fs.existsSync(getScavPath(sessionID))) {
        generateScav(sessionID);
    }

    return json.parse(json.read(getScavPath(sessionID)));
}

function getDialoguePath(sessionID) {
    let dialoguePath = filepaths.user.profiles.dialogue;
    return dialoguePath.replace("__REPLACEME__", sessionID);
}

function getDialogue(sessionID) {
    return json.parse(json.read(getDialoguePath(sessionID)));
}

function setDialogue(data, sessionID) {
    json.write(getDialoguePath(sessionID), data);
}

function get(sessionID) {
    let output = {err: 0, errmsg: null, data: []};

    if (account_f.isWiped(sessionID)) {
        return output;
    }

    output.data.push(getPmcData(sessionID));
    output.data.push(getScavData(sessionID));
    return output;
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

function getStashType(sessionID) {
    let temp = getPmcData(sessionID);

    for (let key in temp.Inventory.items) {
        if (temp.Inventory.items.hasOwnProperty(key) && temp.Inventory.items[key]._id === temp.Inventory.stash) {
            return temp.Inventory.items[key]._tpl;
        }
    }

    logger.logError("Not found Stash: error check character.json", "red");
    return "NotFound Error";
}

// added lastTrader so that we can list prices using the correct currency based on the trader
function getPurchasesData(tmpTraderInfo, sessionID) {
    let multiplier = 0.9;
    let data = getPmcData(sessionID);
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
        if (data[invItems]._id !== equipment
        && data[invItems]._id !== stash
        && data[invItems]._id !== questRaidItems
        && data[invItems]._id !== questStashItems
        && notSoldableItems.indexOf(data[invItems]._tpl) === -1) {
            let templateId = data[invItems]._tpl;
            let itemCount = (typeof data[invItems].upd !== "undefined" ? (typeof data[invItems].upd.StackObjectsCount !== "undefined" ? data[invItems].upd.StackObjectsCount : 1) : 1);
            let basePrice = (items.data[templateId]._props.CreditsPrice >= 1 ? items.data[templateId]._props.CreditsPrice : 1);
            
            // multiplyer is used at parent item
            data = addChildPrice(data, data[invItems].parentId, itemCount * basePrice);
        }
    }

    //start output string here
    let purchaseOutput = '{"err": 0,"errmsg":null,"data":{';
    let i = 0;

    for (let invItems in data) {
        if (data[invItems]._id !== equipment
        && data[invItems]._id !== stash
        && data[invItems]._id !== questRaidItems
        && data[invItems]._id !== questStashItems
        && notSoldableItems.indexOf(data[invItems]._tpl) === -1) {
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

            // convert the price using the lastTrader's currency
            let currency = trader.get(tmpTraderInfo, sessionID).data.currency;
            preparePrice = itm_hf.fromRUB(preparePrice, itm_hf.getCurrency(currency));

            // uses profile information to get the level of the dogtag and multiplies
            // the prepare price after conversion with this factor
            if (itm_hf.isDogtag(data[invItems]._tpl)) {
                if (data[invItems].upd.hasOwnProperty("Dogtag")) {
                    preparePrice = preparePrice * data[invItems].upd.Dogtag.Level;
                }
            }

            preparePrice = (preparePrice > 0 && preparePrice !== "NaN" ? preparePrice : 1);
            purchaseOutput += '"' + data[invItems]._id + '":[[{"_tpl": "' + data[invItems]._tpl + '","count": ' + preparePrice.toFixed(0) + "}]]";
        }
    }

    purchaseOutput += "}}"; // end output string here
    return purchaseOutput;
}

function changeNickname(info, sessionID) {
    let pmcData = getPmcData(sessionID);

    // check if the nickname exists
    if (account_f.nicknameTaken(info)) {
        return '{"err":225, "errmsg":"this nickname is already in use", "data":null}';
    }

    // change nickname
    pmcData.Info.Nickname = info.nickname;
    pmcData.Info.LowerNickname = info.nickname.toLowerCase();
    setPmcData(pmcData, sessionID);
    return ('{"err":0, "errmsg":null, "data":{"status":0, "nicknamechangedate":' + Math.floor(new Date() / 1000) + "}}");
}

function changeVoice(info, sessionID) {
    let pmcData = getPmcData(sessionID);

    pmcData.Info.Voice = info.voice;
    setPmcData(pmcData, sessionID);
}

module.exports.create = create;
module.exports.get = get;
module.exports.setPmcData = setPmcData;
module.exports.setScavData = setScavData;
module.exports.getPmcData = getPmcData;
module.exports.getScavData = getScavData;
module.exports.generateScav = generateScav;
module.exports.getStashType = getStashType;
module.exports.getPurchasesData = getPurchasesData;
module.exports.changeNickname = changeNickname;
module.exports.changeVoice = changeVoice;
module.exports.getDialogue = getDialogue;
module.exports.setDialogue = setDialogue;