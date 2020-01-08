"use strict";

require('../libs.js');

/* Move Item
* change location of item with parentId and slotId
* */
function moveItem(tmpList, body) {
    item.resetOutput();
    let output = item.getOutput();
    // -> Move item to diffrent place - counts with equiping filling magazine etc
    //cartriges handler start
    if (body.to.container === 'cartridges') {
        let tmp_counter = 0;
        for (let item_ammo in tmpList.data[0].Inventory.items) {
            if (body.to.id === tmpList.data[0].Inventory.items[item_ammo].parentId) {
                tmp_counter++;
            }
        }
        body.to.location = tmp_counter;//wrong location for first cartrige
    }
    //cartriges handler end

    for (let item of tmpList.data[0].Inventory.items) {
        if (item._id && item._id === body.item) {
            item.parentId = body.to.id;
            item.slotId = body.to.container;
            if (typeof body.to.location !== "undefined") {
                item.location = body.to.location;
            } else {
                if (item.location) {
                    delete item.location;
                }
            }

            profile.setCharacterData(tmpList);
            return output;
        }
    }

    return "";
}

/* Remove Item
* Deep tree item deletion / Delets main item and all sub items with sub items ... and so on.
* */
function removeItem(tmpList, body, output = item.getOutput()) {
    // -> Deletes item and its all child completly - now works
	if (output == ""){
		item.resetOutput();
		output = item.getOutput()
    }
    

    var toDo = [body];

    //Find the item and all of it's relates
    if (toDo[0] !== undefined && toDo[0] !== null && toDo[0] !== "undefined") {
        let ids_toremove = itm_hf.findAndReturnChildren(tmpList, toDo[0]); //get all ids related to this item, +including this item itself

        for (let i in ids_toremove) { //remove one by one all related items and itself
            output.data.items.del.push({"_id": ids_toremove[i]}); // Tell client to remove this from live game

            for (let a in tmpList.data[0].Inventory.items) {	//find correct item by id and delete it
                if (tmpList.data[0].Inventory.items[a]._id === ids_toremove[i]) {
                    tmpList.data[0].Inventory.items.splice(a, 1);  //remove item from tmplist
                }
            }
        }

        profile.setCharacterData(tmpList); //save tmplist to profile
        return output;
    } else {
        logger.logError("item id is not vaild");
        return "BAD"
        //maybe return something because body.item id wasn't valid.
    }
}

function removeInsurance(tmpList, body) {
    var toDo = [body];
    
    //Find the item and all of it's relates
    if (toDo[0] !== undefined && toDo[0] !== null && toDo[0] !== "undefined") {
        let ids_toremove = itm_hf.findAndReturnChildren(tmpList, toDo[0]); //get all ids related to this item, +including this item itself

        for (let i in ids_toremove) { //remove one by one all related items and itself
            for (let a in tmpList.data[0].Inventory.items) {	//find correct item by id and delete it
                if (tmpList.data[0].Inventory.items[a]._id === ids_toremove[i]) {
                    for (let insurance in tmpList.data[0].InsuredItems) {
                        if (tmpList.data[0].InsuredItems[insurance].itemId == ids_toremove[i]) {
                            tmpList.data[0].InsuredItems.splice(insurance, 1);
                        }
                    }
                }
            }
        }

        profile.setCharacterData(tmpList);
    } else {
        logger.logError("item id is not vaild");
    }
}

/* Split Item
* spliting 1 item into 2 separate items ...
* */
function splitItem(tmpList, body) { // -> Spliting item / Create new item with splited amount and removing that amount from older one
    item.resetOutput();
    let output = item.getOutput();
    let location = body.container.location;
    if (typeof body.container.location === "undefined" && body.container.container === "cartridges") {
        let tmp_counter = 0;
        for (let item_ammo in tmpList.data[0].Inventory.items) {
            if (tmpList.data[0].Inventory.items[item_ammo].parentId === body.container.id)
                tmp_counter++;
        }
        location = tmp_counter;//wrong location for first cartrige
    }
    for (let item of tmpList.data[0].Inventory.items) {
        if (item._id && item._id === body.item) {
            item.upd.StackObjectsCount -= body.count;
            let newItem = utility.generateNewItemId();
            output.data.items.new.push({
                "_id": newItem,
                "_tpl": item._tpl,
                "parentId": body.container.id,
                "slotId": body.container.container,
                "location": location,
                "upd": {"StackObjectsCount": body.count}
            });
            tmpList.data[0].Inventory.items.push({
                "_id": newItem,
                "_tpl": item._tpl,
                "parentId": body.container.id,
                "slotId": body.container.container,
                "location": location,
                "upd": {"StackObjectsCount": body.count}
            });
            profile.setCharacterData(tmpList);
            return output;
        }
    }

    return "";
}

/* Merge Item
* merges 2 items into one, deletes item from body.item and adding number of stacks into body.with
* */
function mergeItem(tmpList, body) {
    item.resetOutput();
    let output = item.getOutput();
    for (let key in tmpList.data[0].Inventory.items) {
        if (tmpList.data[0].Inventory.items.hasOwnProperty(key)) {
            if (tmpList.data[0].Inventory.items[key]._id && tmpList.data[0].Inventory.items[key]._id === body.with) {
                for (let key2 in tmpList.data[0].Inventory.items) {
                    if (tmpList.data[0].Inventory.items[key2]._id && tmpList.data[0].Inventory.items[key2]._id === body.item) {
                        let stackItem0 = 1;
                        let stackItem1 = 1;
                        if (typeof tmpList.data[0].Inventory.items[key].upd !== "undefined")
                            stackItem0 = tmpList.data[0].Inventory.items[key].upd.StackObjectsCount;
                        if (typeof tmpList.data[0].Inventory.items[key2].upd !== "undefined")
                            stackItem1 = tmpList.data[0].Inventory.items[key2].upd.StackObjectsCount;

                        if (stackItem0 === 1)
                            Object.assign(tmpList.data[0].Inventory.items[key], {"upd": {"StackObjectsCount": 1}});

                        tmpList.data[0].Inventory.items[key].upd.StackObjectsCount = stackItem0 + stackItem1;

                        output.data.items.del.push({"_id": tmpList.data[0].Inventory.items[key2]._id});
                        tmpList.data[0].Inventory.items.splice(key2, 1);

                        profile.setCharacterData(tmpList);
                        return output;
                    }
                }
            }
        }
    }

    return "";
}

/* Transfer item
* Used to take items from scav inventory into stash or to insert ammo into mags (shotgun ones) and reloading weapon by clicking "Reload"
* */
function transferItem(tmpList, body) {
    item.resetOutput();
    let output = item.getOutput();
    for (let item of tmpList.data[0].Inventory.items) {
        // From item
        if (item._id === body.item) {
            let stackItem = 1;
            if (typeof item.upd !== "undefined")
                stackItem = item.upd.StackObjectsCount;
            // fixed undefined stackobjectscount
            if (stackItem === 1)
                Object.assign(item, {"upd": {"StackObjectsCount": 1}});
            if (stackItem > body.count)
                item.upd.StackObjectsCount = stackItem - body.count;
            else
                item.splice(item, 1);
        }
        // To item
        if (item._id === body.with) {
            let stackItemWith = 1;
            if (typeof item.upd !== "undefined")
                stackItemWith = item.upd.StackObjectsCount;
            if (stackItemWith === 1)
                Object.assign(item, {"upd": {"StackObjectsCount": 1}});
            item.upd.StackObjectsCount = stackItemWith + body.count;
        }
    }
    profile.setCharacterData(tmpList);
    return output;
}

/* Swap Item
* its used for "reload" if you have weapon in hands and magazine is somewhere else in rig or backpack in equipment
* */
function swapItem(tmpList, body) {
    item.resetOutput();
    let output = item.getOutput();
    for (let item of tmpList.data[0].Inventory.items) {
        if (item._id === body.item) {
            item.parentId = body.to.id;         // parentId
            item.slotId = body.to.container;    // slotId
            item.location = body.to.location    // location
        }
        if (item._id === body.item2) {
            item.parentId = body.to2.id;
            item.slotId = body.to2.container;
            delete item.location;
        }
    }
    profile.setCharacterData(tmpList);
    return output;
}

/* Give Item
* its used for "add" item like gifts etc.
* */
function addItem(tmpList, body, output = item.getOutput()) {
    let PlayerStash = itm_hf.getPlayerStash();
    let stashY = PlayerStash[1];
    let stashX = PlayerStash[0];
    let tmpTraderAssort = trader.getAssort(body.tid);

    for (let item of tmpTraderAssort.data.items) {
        if (item._id === body.item_id) {
            let MaxStacks = 1;
            let StacksValue = [];
            let tmpItem = itm_hf.getItem(item._tpl)[1];

            // split stacks if the size is higher than allowed by StackMaxSize
            if (body.count > tmpItem._props.StackMaxSize) {
                let count = body.count;
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
                //update profile on each stack so stash recalculate will have new items
                tmpList = profile.getCharacterData();

                let StashFS_2D = itm_hf.recheckInventoryFreeSpace(tmpList);
                let ItemSize = itm_hf.getSize(item._tpl, item._id, tmpTraderAssort.data.items);
                let tmpSizeX = ItemSize[0];
                let tmpSizeY = ItemSize[1];

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

                            logger.logInfo("Item placed at position [" + x + "," + y + "]", "", "", true);
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

                            while (true) {
                                if (typeof toDo[0] === "undefined") {
                                    break;
                                }

                                for (let tmpKey in tmpTraderAssort.data.items) {
                                    if (tmpTraderAssort.data.items[tmpKey].parentId && tmpTraderAssort.data.items[tmpKey].parentId === toDo[0][0]) {
                                        newItem = utility.generateNewItemId();
                                        let SlotID = tmpTraderAssort.data.items[tmpKey].slotId;
                                        if (SlotID === "hideout") {
                                            output.data.items.new.push({
                                                "_id": newItem,
                                                "_tpl": tmpTraderAssort.data.items[tmpKey]._tpl,
                                                "parentId": toDo[0][1],
                                                "slotId": SlotID,
                                                "location": {"x": x, "y": y, "r": "Horizontal"},
                                                "upd": {"StackObjectsCount": StacksValue[stacks]}
                                            });

                                            tmpList.data[0].Inventory.items.push({
                                                "_id": newItem,
                                                "_tpl": tmpTraderAssort.data.items[tmpKey]._tpl,
                                                "parentId": toDo[0][1],
                                                "slotId": tmpTraderAssort.data.items[tmpKey].slotId,
                                                "location": {"x": x, "y": y, "r": "Horizontal"},
                                                "upd": {"StackObjectsCount": StacksValue[stacks]}
                                            });
                                        } else {
                                            output.data.items.new.push({
                                                "_id": newItem,
                                                "_tpl": tmpTraderAssort.data.items[tmpKey]._tpl,
                                                "parentId": toDo[0][1],
                                                "slotId": SlotID,
                                                "upd": {"StackObjectsCount": StacksValue[stacks]}
                                            });

                                            tmpList.data[0].Inventory.items.push({
                                                "_id": newItem,
                                                "_tpl": tmpTraderAssort.data.items[tmpKey]._tpl,
                                                "parentId": toDo[0][1],
                                                "slotId": tmpTraderAssort.data.items[tmpKey].slotId,
                                                "upd": {"StackObjectsCount": StacksValue[stacks]}
                                            });
                                        }

                                        toDo.push([tmpTraderAssort.data.items[tmpKey]._id, newItem]);
                                    }
                                }

                                toDo.splice(0, 1);
                            }

                            break addedProperly;
                        }
                    }

                // save after each added item
                profile.setCharacterData(tmpList);
            }

            return output;
        }
    }

    return "";
}

module.exports.moveItem = moveItem;
module.exports.removeItem = removeItem;
module.exports.splitItem = splitItem;
module.exports.mergeItem = mergeItem;
module.exports.transferItem = transferItem;
module.exports.swapItem = swapItem;
module.exports.removeInsurance = removeInsurance;
module.exports.addItem = addItem;