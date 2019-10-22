"use strict";

require('../libs.js');

const presets = JSON.parse(utility.readJson("data/configs/bots/botPresets.json"));
const backpackLootTable = JSON.parse(utility.readJson("data/configs/bots/botBackpackLootTable.json")).BackpackLootTable;

/** ~ Generate Pattern item Generator
 * ~~input: typeOfName
 * ~~output: FullName
 */
function generateItemByPattern(itemType, Inventory, Role = "") {
    let tier = bots_mf.calculateItemChance(presets[itemType], Role);
    let len = presets[itemType][tier].length;
	
    let randomize = ((len <= 1) ? 0 : utility.getRandomInt(0, len-1));
	let templateGen = presets[itemType][tier][randomize];
    let item = {
        _id: itemType + utility.getRandomIntEx(1000000),
        _tpl: templateGen,
        parentId: "5c6687d65e9d882c8841f0fd",
        slotId: itemType
    };
    if (item._tpl === "59f32c3b86f77472a31742f0") { console.log("DOGTAG - Not Used ????", "", "", true); }

    if (itemType === "ArmorVest") {
        item.upd = {
            "Repairable": {
                "MaxDurability": items.data[item._tpl]._props.MaxDurability,
                "Durability": items.data[item._tpl]._props.MaxDurability
            }
        };
    }
    Inventory.push(item);
    // ADDITIONAL SECTION BELOW //
    if (itemType === "Backpack") {
        // generate inventory items randomly
        Inventory = generateBotBackpackItem(Inventory, item);
    }
    if (itemType === "Headwear") {
        let headwearItem = items.data[item._tpl]._props;
        if (headwearItem.Slots.length > 0 && utility.getRandomInt() <= settings.bots.headwear.faceshield) {
            for (let itemSlot of headwearItem.Slots) {
                if (itemSlot._name === "mod_equipment" || itemSlot._name === "mod_equipment_000") {
                    let itemslotname = itemSlot._name;
                    if (itemSlot._props.filters[0].Filter.length > 0) {
                        let compat = itemSlot._props.filters[0].Filter;
                        let faceShield = {};
                        faceShield._id = itemType + "_cover_" + utility.getRandomIntEx(10000);
                        faceShield._tpl = compat[utility.getRandomIntEx(compat.length) - 1];
                        faceShield.parentId = item._id;
                        faceShield.slotId = itemslotname;
                        faceShield.upd = {
                            "Togglable": {
                                "On": true
                            }
                        };

                        Inventory.push(faceShield);
                    }
                }
            }
        }
    }
    return Inventory;
}

function generateBotBackpackItem(botInventory, backpack) {
	let Inventory = botInventory;
    // its work need to find out upd dependencies and adds them;
    const backpackData = items.data[backpack._tpl]._props.Grids[0]._props;
    let backpack2D = new Array(backpackData.cellsV);
    for (let i = 0; i < backpack2D.length; i++) {
        backpack2D[i] = new Array(backpackData.cellsH).fill(0);
    }

    const backpackSize = utility.getRandomInt(0,Math.floor((backpackData.cellsV * backpackData.cellsH) / 2));// how much slots we will fill up later
    var RollItems = new Array(backpackSize);
    for (var i = 0; i < RollItems.length; i++) {
        let tier = bots_mf.calculateItemChance(backpackLootTable, "");
        RollItems[i] = backpackLootTable[tier][utility.getRandomInt(0,backpackLootTable[tier].length - 1)];
    }
    for (let i = 0; i < backpackSize; i++) {
        let item = items.data[RollItems[i]]; // fixed
        if(typeof item == "undefined"){
            console.log(RollItems[i])
        }
        //if item is OK get item sizing and put it in free slot
        const tmpSizeX = items.data[item._id]._props.Width; // X + Left + Right
        const tmpSizeY = items.data[item._id]._props.Height; // Y + Up + Down
        ImDoneWithThisOne:
            for (let x = 0; x <= backpackData.cellsH - tmpSizeX; x++) {
                for (let y = 0; y <= backpackData.cellsV - tmpSizeY; y++) {
                    let badSlot = "no";

                    leaveThat:
                        for (let itemY = 0; itemY < tmpSizeY; itemY++) {
                            for (let itemX = 0; itemX < tmpSizeX; itemX++) {
                                if (backpack2D[y + itemY][x + itemX] !== 0) {
                                    badSlot = "yes";
                                    break leaveThat;
                                }
                            }
                        }
                    if (badSlot === "yes") {
                        continue;
                    }
                    const ItemTemplate = items.data[item._id];
                    for (let itemY = 0; itemY < tmpSizeY; itemY++) {
                        for (let itemX = 0; itemX < tmpSizeX; itemX++) {
                            backpack2D[itemY + y][itemX + x] = 1;
                        }
                    }
                    let rightUPD = bots_mf.updCreator(ItemTemplate._parent, ItemTemplate);
                    Inventory.push({
                        _id: "BP_" + backpack._id + "_" + utility.getRandomInt(100000, 999999),
                        _tpl: ItemTemplate._id,
                        parentId: backpack._id,
                        slotId: "main",
                        location: {
                            x: x,
                            y: y,
                            r: 'Horizontal',
                            isSearched: true
                        },
                        upd: rightUPD
                    });
                    break ImDoneWithThisOne;
                    //if 543be5cb4bdc2deb348b4568 insert ammo inside
                }
            }

    }
    return Inventory;
}


module.exports.generateItemByPattern = generateItemByPattern;
