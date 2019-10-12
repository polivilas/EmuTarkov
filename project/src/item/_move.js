"use strict";

require('../libs.js');

const AllQuests = quests;

//// ---- FUNCTIONS BELOW ---- ////
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
        for (let item_ammo in tmpList.data[1].Inventory.items) {
            if (body.to.id === tmpList.data[1].Inventory.items[item_ammo].parentId) {
                tmp_counter++;
            }
        }
        body.to.location = tmp_counter;//wrong location for first cartrige
    }
    //cartriges handler end

    for (let item of tmpList.data[1].Inventory.items) {
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
	if(output == ""){
		item.resetOutput();
		output = item.getOutput()
	}
    //output = item.resetOutput();
    var toDo = [body.item];
    //Find the item and all of it's relates
    if (toDo[0] !== undefined && toDo[0] !== null && toDo[0] !== "undefined") {
        let ids_toremove = itm_hf.findAndReturnChildren(tmpList, toDo[0]); //get all ids related to this item, +including this item itself
        for (let i in ids_toremove) { //remove one by one all related items and itself
            output.data.items.del.push({"_id": ids_toremove[i]}); // Tell client to remove this from live game
            for (let a in tmpList.data[1].Inventory.items) {	//find correct item by id and delete it
                if (tmpList.data[1].Inventory.items[a]._id === ids_toremove[i]) {
                    tmpList.data[1].Inventory.items.splice(a, 1);  //remove item from tmplist
                }
            }
        }
        profile.setCharacterData(tmpList); //save tmplist to profile
        return output;
    } else {
        console.log("item id is not vaild");
        return "BAD"
        //maybe return something because body.item id wasn't valid.
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
        for (let item_ammo in tmpList.data[1].Inventory.items) {
            if (tmpList.data[1].Inventory.items[item_ammo].parentId === body.container.id)
                tmp_counter++;
        }
        location = tmp_counter;//wrong location for first cartrige
    }
    for (let item of tmpList.data[1].Inventory.items) {
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
            tmpList.data[1].Inventory.items.push({
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
    for (let key in tmpList.data[1].Inventory.items) {
        if (tmpList.data[1].Inventory.items.hasOwnProperty(key)) {
            if (tmpList.data[1].Inventory.items[key]._id && tmpList.data[1].Inventory.items[key]._id === body.with) {
                for (let key2 in tmpList.data[1].Inventory.items) {
                    if (tmpList.data[1].Inventory.items[key2]._id && tmpList.data[1].Inventory.items[key2]._id === body.item) {
                        let stackItem0 = 1;
                        let stackItem1 = 1;
                        if (typeof tmpList.data[1].Inventory.items[key].upd !== "undefined")
                            stackItem0 = tmpList.data[1].Inventory.items[key].upd.StackObjectsCount;
                        if (typeof tmpList.data[1].Inventory.items[key2].upd !== "undefined")
                            stackItem1 = tmpList.data[1].Inventory.items[key2].upd.StackObjectsCount;

                        if (stackItem0 === 1)
                            Object.assign(tmpList.data[1].Inventory.items[key], {"upd": {"StackObjectsCount": 1}});

                        tmpList.data[1].Inventory.items[key].upd.StackObjectsCount = stackItem0 + stackItem1;

                        output.data.items.del.push({"_id": tmpList.data[1].Inventory.items[key2]._id});
                        tmpList.data[1].Inventory.items.splice(key2, 1);

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
    for (let item of tmpList.data[1].Inventory.items) {
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
    for (let item of tmpList.data[1].Inventory.items) {
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

//// ---- EXPORT LIST ---- ////
module.exports.moveItem = moveItem;
module.exports.removeItem = removeItem;
module.exports.splitItem = splitItem;
module.exports.mergeItem = mergeItem;
module.exports.transferItem = transferItem;
module.exports.swapItem = swapItem;
//module.exports.moveItem = moveItem;
