"use strict";

require("../libs.js");

function markFoundItems(pmcData, offraidProfile, isPlayerScav) {
    // mark items found in raid
    for (let offraidItem of offraidProfile.Inventory.items) {
        let found = false;

        // mark new items for PMC, mark all items for scavs
        if (!isPlayerScav) {
            for (let item of pmcData.Inventory.items) {
                if (offraidItem._id === item._id) {
                    found = true;
                }
            }

            if (found) {
                continue;
            }
        }

        // mark item found in raid
        if (offraidItem.hasOwnProperty("upd")) {
            offraidItem.upd["SpawnedInSession"] = true;
        } else {
            offraidItem["upd"] = {"SpawnedInSession": true};
        }
    }

    return offraidProfile;
}

function setInventory(pmcData, offraidProfile) {
    move_f.removeItemFromProfile(pmcData, pmcData.Inventory.equipment);
    move_f.removeItemFromProfile(pmcData, pmcData.Inventory.questRaidItems);
    move_f.removeItemFromProfile(pmcData, pmcData.Inventory.questStashItems);

    for (let item of offraidProfile.Inventory.items) {
        pmcData.Inventory.items.push(item);
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
            move_f.removeItemFromProfile(pmcData, items_to_delete[item_to_delete]);
        }
    }

    return pmcData;
}

function saveProgress(offraidData, sessionID) {
    let offraidExit = offraidData.exit;
    let offraidProfile = offraidData.profile;
    let pmcData = profile_f.getPmcData(sessionID);
    let scavData = profile_f.getScavData(sessionID);

    // replace data
    // if isPlayerScav is true, then offraidProfile points to a scav profile
    const isPlayerScav = offraidData.isPlayerScav;
    
    if (!isPlayerScav) {
        pmcData.Info.Level = offraidProfile.Info.Level;
        pmcData.Skills = offraidProfile.Skills;
        pmcData.Stats = offraidProfile.Stats;
        pmcData.Encyclopedia = offraidProfile.Encyclopedia;
        pmcData.ConditionCounters = offraidProfile.ConditionCounters;
        pmcData.Quests = offraidProfile.Quests;

        // level 69 cap to prevent visual bug occuring at level 70
        if (pmcData.Info.Experience > 13129881) {
            pmcData.Info.Experience = 13129881;
        }
    }

    // mark found items
    offraidProfile = markFoundItems(pmcData, offraidProfile, isPlayerScav);

    // replace item ID's
    offraidProfile.Inventory.items = itm_hf.replaceIDs(offraidProfile, offraidProfile.Inventory.items);

    // set profile equipment to the raid equipment
    if (!isPlayerScav) {
        pmcData = setInventory(pmcData, offraidProfile);
    } else {
        scavData = setInventory(scavData, offraidProfile);
    }

    // terminate early for player scavs because we don't care about whether they died.
    if (isPlayerScav) {
        profile_f.setScavData(scavData, sessionID);
        return;
    }

    // remove inventory if player died
    if (offraidExit !== "survived" && offraidExit !== "runner") {
        pmcData = deleteInventory(pmcData, sessionID);
    }

    profile_f.setPmcData(pmcData, sessionID);
}

module.exports.saveProgress = saveProgress;