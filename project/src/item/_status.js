"use strict";

const profile = require('../profile.js');

//// ---- FUNCTIONS BELOW ---- ////

function foldItem(tmpList, body) { // -> Fold item / generally weapon
    for (let item of tmpList.data[1].Inventory.items) {
        if (item._id && item._id === body.item) {
            item.upd.Foldable = {"Folded": body.value};
            profile.setCharacterData(tmpList);
            return "OK";
        }
    }
    return "";
}

function toggleItem(tmpList, body) { // -> Toggle item / flashlight, laser etc.
    for (let item of tmpList.data[1].Inventory.items) {
        if (item._id && item._id === body.item) {
            item.upd.Togglable = {"On": body.value};
            profile.setCharacterData(tmpList);
            return "OK";
        }
    }
    return "";
}

function tagItem(tmpList, body) { // -> Tag item / Taggs item with given name and color
    for (let item of tmpList.data[1].Inventory.items) {
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
            profile.setCharacterData(tmpList);
            return "OK";
        }
    }

    return "";
}

function bindItem(tmpList, body) { // -> Binds item to quick bar
    for (let index in tmpList.data[1].Inventory.fastPanel) {
        // if binded items is already in fastPanel
        if (tmpList.data[1].Inventory.fastPanel[index] === body.item) {
            // we need to remove index before re-adding somewhere else
            tmpList.data[1].Inventory.fastPanel[index] = "";
        }
    }

    tmpList.data[1].Inventory.fastPanel[body.index] = body.item;
    profile.setCharacterData(tmpList);
    return "OK";
}

function examineItem(tmpList, body) { // examine item and adds it to examined list
    let returned = "BAD";

    // trader inventory
    if (typeof tmpTrader !== "undefined") {
        if (tmpTrader) {
            for (let item of tmpTrader.data) {
                if (item._id === body.item) {
                    console.log("Found trader with examined item: " + item._id, "", "", true);
                    returned = item._tpl;
                    break;
                }
            }
        }
    }
    // player inventory
    if (returned === "BAD") {
        for (let item of tmpList.data[1].Inventory.items) {
            if (item._id === body.item) {
                console.log("Found equipment examing item: " + item._id, "", "", true);
                returned = item._tpl;
                break;
            }
        }
    }

    // item not found
    if (returned === "BAD") {
        console.log("Cannot find proper item. Stopped.", "white", "red");
        return "BAD";
    }

    // item found
    console.log("EXAMINED: " + returned, "white", "green", true);
    tmpList.data[1].Encyclopedia[returned] = true;
    profile.setCharacterData(tmpList);

    return "OK";
}

//// ---- EXPORT LIST ---- ////

module.exports.foldItem = foldItem;
module.exports.toggleItem = toggleItem;
module.exports.tagItem = tagItem;
module.exports.bindItem = bindItem;
module.exports.examineItem = examineItem;
//module.exports.funcname = funcname; // preset
