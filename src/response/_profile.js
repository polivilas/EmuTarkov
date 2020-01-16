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
    let character = json.parse(json.read(filepaths.profile.character[account.edition + "_" + info.side.toLowerCase()]));
    let storage = json.parse(json.read(filepaths.profile.storage));
    let userbuilds = json.parse(json.read(filepaths.profile.userbuilds));

    character._id = "pmc" + account.id;
    character.aid = account.id;
    character.savage = "scav" + account.id;
    character.Info.Nickname = info.nickname;
    character.Info.LowerNickname = info.nickname.toLowerCase();
    storage.data._id = "pmc" + account.id;

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
    json.write(folder + "character.json", character);
    json.write(folder + "storage.json", storage);
    json.write(folder + "userbuilds.json", userbuilds);

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

        assort_f.generate(fileName);
    }

    // don't wipe profile again
    account_f.setWipe(account.id, false);
}

function getPmc(sessionID) {
    return json.parse(json.read(getPmcPath(sessionID)));
}

function getScav(sessionID) {
    return json.parse(json.read(getScavPath(sessionID)));
}

function setPmc(data, sessionID) {
    if (typeof data.data !== "undefined") {
        data = data.data[0];
    }

    json.write(getPmcPath(sessionID), data);
}

function setScav(data, sessionID) {
    if (typeof data.data !== "undefined") {
        data = data.data[1];
    }

    json.write(getScavPath(sessionID), data);   
}

function generateScav(sessionID) {
    let playerData = json.parse(json.read(getPmcPath(sessionID)));
    let scavData = bots.generatePlayerScav();

    scavData._id = playerData.savage;
    scavData.aid = sessionID;
    setScav(scavData, sessionID);

    return scavData;
}

function get(sessionID) {
    let output = {err: 0, errmsg: null, data: []};

    if (account_f.isWiped(sessionID)) {
        return output
    }

    if (!fs.existsSync(getScavPath(sessionID))) {
        generateScav(sessionID);
    }

    output.data.push(getPmc(sessionID));
    output.data.push(getScav(sessionID));
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
    let temp = json.parse(json.read(getPmcPath(sessionID)));

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
    let data = json.parse(json.read(getPmcPath(sessionID)));
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
            let currency = trader.get(tmpTraderInfo).data.currency;
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
    let tmpList = get();

    // check if the nickname exists
    if (account_f.nicknameTaken(info)) {
        return '{"err":225, "errmsg":"this nickname is already in use", "data":null}';
    }

    // change nickname
    tmpList.data[0].Info.Nickname = info.nickname;
    tmpList.data[0].Info.LowerNickname = info.nickname.toLowerCase();
    setPmc(tmpList, sessionID);
    return ('{"err":0, "errmsg":null, "data":{"status":0, "nicknamechangedate":' + Math.floor(new Date() / 1000) + "}}");
}

function changeVoice(info, sessionID) {
    let tmpList = get();

    tmpList.data[0].Info.Voice = info.voice;
    setPmc(tmpList, sessionID);
}

module.exports.create = create;
module.exports.get = get;
module.exports.setPmc = setPmc;
module.exports.setScav = setScav;
module.exports.getPmc = getPmc;
module.exports.getScav = getScav;
module.exports.generateScavProfile = generateScavProfile;
module.exports.getStashType = getStashType;
module.exports.getPurchasesData = getPurchasesData;
module.exports.changeNickname = changeNickname;
module.exports.changeVoice = changeVoice;