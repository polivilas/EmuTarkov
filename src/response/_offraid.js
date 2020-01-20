"use strict";

require("../libs.js");

function markFoundItems(pmcData, offraidData, isPlayerScav) {
    // mark items found in raid
    for (let offRaidItem of offraidData.Inventory.items) {
        let found = false;

        // mark new items for PMC, mark all items for scavs
        if (!isPlayerScav) {
            for (let item of pmcData.Inventory.items) {
                if (offRaidItem._id === item._id) {
                    found = true;
                }
            }

            if (found) {
                continue;
            }
        }

        // mark item found in raid
        if (offRaidItem.hasOwnProperty("upd")) {
            offRaidItem.upd["SpawnedInSession"] = true;
        } else {
            offRaidItem["upd"] = {"SpawnedInSession": true};
        }
    }

    return offraidData;
}

function setInventory(pmcData, sessionID) {
    move_f.removeItem(pmcData, pmcData.Inventory.equipment, item.getOutput(), sessionID);
    move_f.removeItem(pmcData, pmcData.Inventory.questRaidItems, item.getOutput()), sessionID;
    move_f.removeItem(pmcData, pmcData.Inventory.questStashItems, item.getOutput(), sessionID);

    for (let item in offRaidProfile.Inventory.items) {
        pmcData.Inventory.items.push(offRaidProfile.Inventory.items[item]);
    }

    return pmcData;
}

function deleteInventory(pmcData, sessionID) {
    let items_to_delete = [];

    for (let item of pmcData.Inventory.items) {
        if (item.parentId === pmcData.Inventory.equipment
            && item.slotId !== "SecuredContainer"
            && item.slotId !== "Scabbard"
            && item.slotId !== "Pockets") {
            items_to_delete.push(item._id);
        }

        // remove pocket insides
        if (item.slotId === "Pockets") {
            for (let pocket of pmcData.Inventory.items) {
                if (pocket.parentId === item._id) {
                    items_to_delete.push(pocket._id);
                }
            }
        }
    }

    // check for insurance
    for (let item_to_delete in items_to_delete) {
        for (let insurance in pmcData.InsuredItems) {
            if (items_to_delete[item_to_delete] !== pmcData.InsuredItems[insurance].itemId) {
                continue;
            }

            let insureReturnChance = utility.getRandomInt(0, 99);
    
            if (insureReturnChance < settings.gameplay.trading.insureReturnChance) {
                move_f.removeInsurance(pmcData, items_to_delete[item_to_delete]);
                items_to_delete[item_to_delete] = "insured";
                break;
            }
        }
    }

    // finally delete them
    for (let item_to_delete in items_to_delete) {
        if (items_to_delete[item_to_delete] !== "insured") {
            move_f.removeItem(pmcData, items_to_delete[item_to_delete], sessionID);
        }
    }

    return pmcData;
}

function saveProgress(offRaidData, sessionID) {
    let offRaidExit = offRaidData.exit;
    let offRaidProfile = offRaidData.profile;
    let pmcData = profile_f.getPmcData(sessionID);
    let scavData = profile_f.getScavData(sessionID);

    // replace data
    // if isPlayerScav is true, then offRaidProfile points to a scav profile
    const isPlayerScav = offRaidData.isPlayerScav;
    
    if (!isPlayerScav) {
        pmcData.Info.Level = offRaidProfile.Info.Level;
        pmcData.Skills = offRaidProfile.Skills;
        pmcData.Stats = offRaidProfile.Stats;
        pmcData.Encyclopedia = offRaidProfile.Encyclopedia;
        pmcData.ConditionCounters = offRaidProfile.ConditionCounters;
        pmcData.Quests = offRaidProfile.Quests;

        // level 69 cap to prevent visual bug occuring at level 70
        if (pmcData.Info.Experience > 13129881) {
            pmcData.Info.Experience = 13129881;
        }
    }

    // mark found items
    offRaidProfile = markFoundItems(pmcData, offRaidProfile, isPlayerScav);

    // replace item ID's
    offRaidProfile.Inventory.items = itm_hf.replaceIDs(offRaidProfile, offRaidProfile.Inventory.items);

    // set profile equipment to the raid equipment
    if (!isPlayerScav) {
        pmcData = setInventory(pmcData, sessionID);
    } else {
        scavData = setInventory(scavData, sessionID);
    }

    // terminate early for player scavs because we don't care about whether they died.
    if (isPlayerScav) {
        profile_f.setScavData(scavData, sessionID);
        return;
    }

    // remove inventory if player died
    if (offRaidExit !== "survived" && offRaidExit !== "runner") {
        pmcData = deleteInventory(pmcData, sessionID);
    }

    profile_f.setPmcData(pmcData, sessionID);
}

module.exports.saveProgress = saveProgress;