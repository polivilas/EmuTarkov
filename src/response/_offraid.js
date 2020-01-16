"use strict";

require("./libs.js");

function saveProgress(offRaidData) {
    if (!settings.gameplay.features.lootSavingEnabled) {
        return;
    }

    let offRaidExit = offRaidData.exit;
    let offRaidProfile = offRaidData.profile;

    let tmpList = profile_f.get(sessionID);

    // replace data
    // if isPlayerScav is true, then offRaidProfile points to a scav profile
    const isPlayerScav = offRaidData.isPlayerScav;
    let profileIndex = isPlayerScav ? 1 : 0;
    
    tmpList.data[profileIndex].Info.Level = offRaidProfile.Info.Level;
    tmpList.data[profileIndex].Skills = offRaidProfile.Skills;
    tmpList.data[profileIndex].Stats = offRaidProfile.Stats;
    tmpList.data[profileIndex].Encyclopedia = offRaidProfile.Encyclopedia;
    tmpList.data[profileIndex].ConditionCounters = offRaidProfile.ConditionCounters;
    tmpList.data[profileIndex].Quests = offRaidProfile.Quests;

    // level 69 cap to prevent visual bug occuring at level 70
    if (tmpList.data[profileIndex].Info.Experience > 13129881) {
        tmpList.data[profileIndex].Info.Experience = 13129881;
    }

    // mark items found in raid
    for (let offRaidItem in offRaidProfile.Inventory.items) {
        let found = false;

        // check if item exists already
        // only applies to pmcs, as all items found in scavs are considered found in raid.
        if (!isPlayerScav) {
            for (let item of tmpList.data[0].Inventory.items) {
                if (offRaidProfile.Inventory.items[offRaidItem]._id === item._id) {
                    found = true;
                }            
            }
        }

        if (found) {
            continue;
        }

        // mark item found in raid when unfound
        let currentItem = offRaidProfile.Inventory.items[offRaidItem];

        if (currentItem.hasOwnProperty("upd")) {
            // property already exists, so we can skip it
            if (currentItem.upd.hasOwnProperty("SpawnedInSession")) {
                continue;
            }

            currentItem.upd["SpawnedInSession"] = true;
        } else {
            currentItem["upd"] = {"SpawnedInSession": true};
        }

        offRaidProfile.Inventory.items[offRaidItem] = currentItem;
    }

    // replace bsg shit long ID with proper one
    let string_inventory = json.stringify(offRaidProfile.Inventory.items);

    for (let item in offRaidProfile.Inventory.items) {
        let insuredItem = false;

        // insured items shouldn't be renamed
        // only works for pmcs.
        if (!isPlayerScav) {
            for (let insurance in tmpList.data[0].InsuredItems) {
                if (tmpList.data[0].InsuredItems[insurance].itemId === offRaidProfile.Inventory.items[item]._id) {
                    insuredItem = true;
                }
            }
        }

        // do not replace important ID's
        if (insuredItem) {
            continue;
        }

        if (offRaidProfile.Inventory.items[item]._id === offRaidProfile.Inventory.equipment) {
            continue;
        }

        if (offRaidProfile.Inventory.items[item]._id === offRaidProfile.Inventory.questRaidItems) {
            continue;
        }

        if (offRaidProfile.Inventory.items[item]._id === offRaidProfile.Inventory.questStashItems) {
            continue;
        }

        // replace id
        let old_id = offRaidProfile.Inventory.items[item]._id;
        let new_id = utility.generateNewItemId();

        string_inventory = string_inventory.replace(new RegExp(old_id, 'g'), new_id);
    }

    offRaidProfile.Inventory.items = JSON.parse(string_inventory);

    // set profile equipment to the raid equipment
    move_f.removeItem(tmpList, tmpList.data[profileIndex].Inventory.equipment, item.getOutput(), profileIndex);
    move_f.removeItem(tmpList, tmpList.data[profileIndex].Inventory.questRaidItems, item.getOutput(), profileIndex);
    move_f.removeItem(tmpList, tmpList.data[profileIndex].Inventory.questStashItems, item.getOutput(), profileIndex);

    for (let item in offRaidProfile.Inventory.items) {
        tmpList.data[profileIndex].Inventory.items.push(offRaidProfile.Inventory.items[item]);
    }

    // terminate early for player scavs because we don't care about whether they died.
    if (isPlayerScav) {
        profile_f.setScavData(tmpList.data[1]);
        return;
    }

    // remove inventory if player died
    if (offRaidExit !== "survived" && offRaidExit !== "runner") {
        let items_to_delete = [];

        for (let item of tmpList.data[0].Inventory.items) {
            if (item.parentId === tmpList.data[0].Inventory.equipment
                && item.slotId !== "SecuredContainer"
                && item.slotId !== "Scabbard"
                && item.slotId !== "Pockets") {
                items_to_delete.push(item._id);
            }

            // remove pocket insides
            if (item.slotId === "Pockets") {
                for (let pocket of tmpList.data[0].Inventory.items) {
                    if (pocket.parentId === item._id) {
                        items_to_delete.push(pocket._id);
                    }
                }
            }
        }

        // check for insurance
        for (let item_to_delete in items_to_delete) {
            for (let insurance in tmpList.data[0].InsuredItems) {
                if (items_to_delete[item_to_delete] !== tmpList.data[0].InsuredItems[insurance].itemId) {
                    continue;
                }

                let insureReturnChance = utility.getRandomInt(0, 99);
		
                if (insureReturnChance < settings.gameplay.trading.insureReturnChance) {
                    move_f.removeInsurance(tmpList, items_to_delete[item_to_delete]);
                    items_to_delete[item_to_delete] = "insured";
                    break;
                }
            }
        }

        // finally delete them
        for (let item_to_delete in items_to_delete) {
            if (items_to_delete[item_to_delete] !== "insured") {
                move_f.removeItem(tmpList, items_to_delete[item_to_delete]);
            }
        }
    }

    profile_f.setPmc(tmpList, sessionID);
}

modules.exports.saveProgress = saveProgress;