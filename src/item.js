"use strict";

require('./libs.js');

var templates = json.parse(json.read(filepaths.user.cache.templates));
var AllQuests = quests;
var stashX = 10; // fix for your stash size
var stashY = 66; // ^ if you edited it ofc
var output = "";

const staticRoutes = {
    "SaveBuild":                        weaponBuilds_f.saveBuild,
    "RemoveBuild":                      weaponBuilds_f.removeBuild,
    "HideoutUpgrade":                   hideout_f.hideoutUpgrade,
    "HideoutUpgradeComplete":           hideout_f.hideoutUpgradeComplete,
    "HideoutContinuousProductionStart": hideout_f.hideoutContinuousProductionStart,
    "HideoutSingleProductionStart":     hideout_f.hideoutSingleProductionStart,
    "HideoutScavCaseProductionStart":   hideout_f.hideoutScavCaseProductionStart,
    "HideoutTakeProduction":            hideout_f.hideoutTakeProduction,
    "HideoutPutItemsInAreaSlots":       hideout_f.hideoutPutItemsInAreaSlots,
    "HideoutTakeItemsFromAreaSlots":    hideout_f.hideoutTakeItemsFromAreaSlots,
    "HideoutToggleArea":                hideout_f.hideoutToggleArea,
    "QuestAccept":                      quest_f.acceptQuest,
    "QuestComplete":                    quest_f.completeQuest,
    "QuestHandover":                    quest_f.handoverQuest,
    "AddNote":                          note_f.addNote,
    "EditNote":                         note_f.editNode,
    "DeleteNote":                       note_f.deleteNote,
    "Move":                             move_f.moveItem,
    "Remove":                           move_f.removeItem,
    "Split":                            move_f.splitItem,
    "Merge":                            move_f.mergeItem,
    "Fold":                             status_f.foldItem,
    "Toggle":                           status_f.toggleItem,
    "Tag":                              status_f.tagItem,
    "Bind":                             status_f.bindItem,
    "Examine":                          status_f.examineItem,
    "ReadEncyclopedia":                 status_f.readEncyclopedia,
    "Eat":                              character_f.eatItem,
    "Heal":                             character_f.healPlayer,
    "Transfer":                         move_f.transferItem,
    "Swap":                             move_f.swapItem,
    "AddToWishList":                    wishList_f.addToWishList,
    "RemoveFromWishList":               wishList_f.removeFromWishList,
    "TradingConfirm":                   trade_f.confirmTrading,
    "RagFairBuyOffer":                  trade_f.confirmRagfairTrading,
    "CustomizationWear":                customization_f.wearClothing,
    "CustomizationBuy":                 customization_f.buyClothing,
}

function getOutput() {
    return output;
}

function setOutput(data) {
    output = data;
}

function resetOutput() {
    output = JSON.parse('{"err":0, "errmsg":null, "data":{"items":{"new":[], "change":[], "del":[]}, "badRequest":[], "quests":[], "ragFairOffers":[], "builds":[]}}');
}

function handleMoving(body) {
    let tmpList = profile.getCharacterData();

    if (typeof staticRoutes[body.Action] !== "undefined") {
        return staticRoutes[body.Action](tmpList, body);
    } else {
        console.log("[UNHANDLED ACTION] " + body.Action, "white", "red");
    }
}

function moving(info) {
    let output = "";

    // handle all items
    for (let i = 0; i < info.data.length; i++) {
        output = handleMoving(info.data[i]);
    }

    // return items
    if (output === "OK") {
        return JSON.stringify(getOutput());
    }

    if (output !== "") {
        return JSON.stringify(output);
    }

    return output;
}

module.exports.getOutput = getOutput;
module.exports.setOutput = setOutput;
module.exports.resetOutput = resetOutput;
module.exports.moving = moving;