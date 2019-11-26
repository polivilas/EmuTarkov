"use strict";

require('./libs.js');

var templates = JSON.parse(utility.readJson('database/configs/templates.json'));
var AllQuests = quests;
var stashX = 10; // fix for your stash size
var stashY = 66; // ^ if you edited it ofc
var output = "";

let staticRoutes = {};

function addStaticRoute(url, worker) {
	staticRoutes[url] = worker;
}

function setupRoutes() {
    addStaticRoute("SaveBuild", weaponBuilds_f.saveBuild);
    addStaticRoute("RemoveBuild", weaponBuilds_f.removeBuild);
    addStaticRoute("HideoutUpgrade", hideout_f.hideoutUpgrade);
    addStaticRoute("HideoutUpgradeComplete", hideout_f.hideoutUpgradeComplete);
    addStaticRoute("HideoutContinuousProductionStart", hideout_f.hideoutContinuousProductionStart);
    addStaticRoute("HideoutSingleProductionStart", hideout_f.hideoutSingleProductionStart);
    addStaticRoute("HideoutScavCaseProductionStart", hideout_f.hideoutScavCaseProductionStart);
    addStaticRoute("HideoutTakeProduction", hideout_f.hideoutTakeProduction);
    addStaticRoute("HideoutPutItemsInAreaSlots", hideout_f.hideoutPutItemsInAreaSlots);
    addStaticRoute("HideoutTakeItemsFromAreaSlots", hideout_f.hideoutTakeItemsFromAreaSlots);
    addStaticRoute("HideoutToggleArea", hideout_f.hideoutToggleArea);
    addStaticRoute("QuestAccept", quest_f.acceptQuest);
    addStaticRoute("QuestComplete", quest_f.completeQuest);
    addStaticRoute("QuestHandover", quest_f.handoverQuest);
    addStaticRoute("AddNote", note_f.addNote);
    addStaticRoute("EditNote", note_f.editNode);
    addStaticRoute("DeleteNote", note_f.deleteNote);
    addStaticRoute("Move", move_f.moveItem);
    addStaticRoute("Remove", move_f.removeItem);
    addStaticRoute("Split", move_f.splitItem);
    addStaticRoute("Merge", move_f.mergeItem);
    addStaticRoute("Fold", status_f.foldItem);
    addStaticRoute("Toggle", status_f.toggleItem);
    addStaticRoute("Tag", status_f.tagItem);
    addStaticRoute("Bind", status_f.bindItem);
    addStaticRoute("Examine", status_f.examineItem);
    addStaticRoute("Eat", character_f.eatItem);
    addStaticRoute("Heal", character_f.healPlayer);
    addStaticRoute("Transfer", move_f.transferItem);
    addStaticRoute("Swap", move_f.swapItem);
    addStaticRoute("AddToWishList", wishList_f.addToWishList);
    addStaticRoute("RemoveFromWishList", wishList_f.removeFromWishList);
    addStaticRoute("TradingConfirm", trade_f.confirmTrading);
    addStaticRoute("RagFairBuyOffer", trade_f.confirmRagfairTrading);
    addStaticRoute("CustomizationWear", customization_f.wearClothing);
    addStaticRoute("CustomizationBuy", customization_f.buyClothing);
}

// --------------------------------------------------------------------------------------------------------------------- //

// --- REQUEST HANDLING BELOW --- //
function getOutput() { // get output to client
    return output;
}
function setOutput(data) { // get output to client
    output = data;
}

function resetOutput() { // reset client output
    output = JSON.parse('{"err":0, "errmsg":null, "data":{"items":{"new":[], "change":[], "del":[]}, "badRequest":[], "quests":[], "ragFairOffers":[], "builds":[]}}');
}

function handleMoving(body) { // handling Action function
    let tmpList = profile.getCharacterData();

    if (typeof staticRoutes[body.Action] !== "undefined") {
        return staticRoutes[body.Action](tmpList, body);
    } else {
        console.log("[UNHANDLED ACTION] " + body.Action, "white", "red");
    }
}

function moving(info) { // main move handling function
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
module.exports.setupRoutes = setupRoutes;
module.exports.moveItem = move_f.moveItem;
module.exports.PrepareItemsList = itm_hf.PrepareItemsList;