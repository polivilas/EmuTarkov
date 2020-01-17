"use strict";

require('../libs.js');

function foldItem(pmcData, body, sessionID) {
    for (let item of pmcData.Inventory.items) {
        if (item._id && item._id === body.item) {
            item.upd.Foldable = {"Folded": body.value};
            profile_f.setPmcData(pmcData, sessionID);
            return "OK";
        }
    }

    return "";
}

function toggleItem(pmcData, body, sessionID) {
    for (let item of pmcData.Inventory.items) {
        if (item._id && item._id === body.item) {
            item.upd.Togglable = {"On": body.value};
            profile_f.setPmcData(pmcData, sessionID);
            return "OK";
        }
    }

    return "";
}

function tagItem(pmcData, body, sessionID) {
    for (let item of pmcData.Inventory.items) {
        if (item._id === body.item) {
            if (item.upd !== null &&
                item.upd !== undefined &&
                item.upd !== "undefined") {
                item.upd.Tag = {"Color": body.TagColor, "Name": body.TagName};
            } else { //if object doesn't have upd create and add it
                let myobject = {
                    "_id": item._id,
                    "_tpl": item._tpl,
                    "parentId": item.parentId,
                    "slotId": item.slotId,
                    "location": item.location,
                    "upd": {"Tag": {"Color": body.TagColor, "Name": body.TagName}}
                };
                Object.assign(item, myobject); // merge myobject into item -- overwrite same properties and add missings
            }

            profile_f.setPmcData(pmcData, sessionID);
            return "OK";
        }
    }

    return "";
}

function bindItem(pmcData, body, sessionID) {
    for (let index in pmcData.Inventory.fastPanel) {
        if (pmcData.Inventory.fastPanel[index] === body.item) {
            pmcData.Inventory.fastPanel[index] = "";
        }
    }

    pmcData.Inventory.fastPanel[body.index] = body.item;
    profile_f.setPmcData(pmcData, sessionID);
    return "OK";
}

function examineItem(pmcData, body, sessionID) {
    let returned = "BAD";

    // ragfair
    if (typeof body.fromOwner !== "undefined" && body.fromOwner.type === "RagFair") {
        returned = body.fromOwner.id;
    }

    // trader
    if (typeof body.fromOwner !== "undefined" && body.fromOwner.type === "Trader") {
        if (body.fromOwner.id === "579dc571d53a0658a154fbec") {
            body.fromOwner.id = "ragfair";
        }

        let tmpTraderAssort = assort_f.get(body.fromOwner.id, sessionID);

        for (let item of tmpTraderAssort.data.items) {
            if (item._id === body.item) {
                logger.logInfo("Found trader with examined item: " + item._id, "", "", true);
                returned = item._tpl;
                break;
            }
        }
    }

    // player inventory
    if (returned === "BAD") {
        for (let item of pmcData.Inventory.items) {
            if (item._id === body.item) {
                logger.logInfo("Found equipment examing item: " + item._id, "", "", true);
                returned = item._tpl;
                break;
            }
        }
    }

    // item not found
    if (returned === "BAD") {
        logger.logError("Cannot find proper item. Stopped.");
        return "BAD";
    }

    // item found
    let data = json.parse(json.read(filepaths.items[returned]));

    pmcData.Info.Experience += data._props.ExamineExperience;
    pmcData.Encyclopedia[returned] = true;
    profile_f.setPmcData(pmcData, sessionID);
    logger.logSuccess("EXAMINED: " + returned);
    return "OK";
}

function readEncyclopedia(pmcData, body, sessionID) {
    return "OK";
}

module.exports.foldItem = foldItem;
module.exports.toggleItem = toggleItem;
module.exports.tagItem = tagItem;
module.exports.bindItem = bindItem;
module.exports.examineItem = examineItem;
module.exports.readEncyclopedia = readEncyclopedia;