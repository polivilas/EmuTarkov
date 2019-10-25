"use strict";

require('./libs.js');

var templates = JSON.parse(utility.readJson('data/configs/templates.json'));
var AllQuests = quests;
var stashX = 10; // fix for your stash size
var stashY = 66; // ^ if you edited it ofc
var output = "";

// --------------------------------------------------------------------------------------------------------------------- //

// --- REQUEST HANDLING BELOW --- //
function getOutput() { // get output to client
    return output;
}
function setOutput(data) { // get output to client
    output = data;
}

function resetOutput() { // reset client output
    output = JSON.parse('{"err":0, "errmsg":null, "data":{"items":{"new":[], "change":[], "del":[]}, "badRequest":[], "quests":[], "ragFairOffers":[]}}');
}

function handleMoving(body) { // handling Action function
    let tmpList = profile.getCharacterData();

    switch (body.Action) {
        case "QuestAccept":
            return quest_f.acceptQuest(tmpList, body);

        case "QuestComplete":
            return quest_f.completeQuest(tmpList, body);

        case "QuestHandover":
            return quest_f.handoverQuest(tmpList, body);

        case "AddNote":
            return note_f.addNote(tmpList, body);

        case "EditNote":
            return note_f.editNode(tmpList, body);

        case "DeleteNote":
            return note_f.deleteNote(tmpList, body);

        case "Move":
            return move_f.moveItem(tmpList, body);

        case "Remove":
            return move_f.removeItem(tmpList, body);

        case "Split":
            return move_f.splitItem(tmpList, body);

        case "Merge":
            return move_f.mergeItem(tmpList, body);

        case "Fold":
            return status_f.foldItem(tmpList, body);

        case "Toggle":
            return status_f.toggleItem(tmpList, body);

        case "Tag":
            return status_f.tagItem(tmpList, body);

        case "Bind":
            return status_f.bindItem(tmpList, body);

        case "Examine":
            return status_f.examineItem(tmpList, body);

        case "Eat":
            return character_f.eatItem(tmpList, body);

        case "Heal":
            return character_f.healPlayer(tmpList, body);

        case "Transfer":
            return move_f.transferItem(tmpList, body);

        case "Swap":
            return move_f.swapItem(tmpList, body);

        case "AddToWishList":
            return wishList_f.addToWishList(tmpList, body);

        case "RemoveFromWishList":
            return wishList_f.removeFromWishList(tmpList, body);

        case "TradingConfirm":
            return trade_f.confirmTrading(tmpList, body);

        case "RagFairBuyOffer":
            return trade_f.confirmRagfairTrading(tmpList, body);

        default:
            console.log("[UNHANDLED ACTION] " + body.Action, "white", "red");
            return "";
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
module.exports.moveItem = move_f.moveItem;
module.exports.PrepareItemsList = itm_hf.PrepareItemsList;