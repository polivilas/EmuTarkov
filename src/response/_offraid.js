"use strict";

require("../libs.js");

function saveProgress(offRaidData, sessionID) {
    if (!settings.gameplay.features.lootSavingEnabled) {
        return;
    }

    let offRaidExit = offRaidData.exit;
    let offRaidProfile = offRaidData.profile;

    let pmcData = profile_f.getPmcData(sessionID);

    // replace data
    // if isPlayerScav is true, then offRaidProfile points to a scav profile
    const isPlayerScav = offRaidData.isPlayerScav;
    let profileIndex = isPlayerScav ? 1 : 0;
    
    pmcData.data[profileIndex].Info.Level = offRaidProfile.Info.Level;
    pmcData.data[profileIndex].Skills = offRaidProfile.Skills;
    pmcData.data[profileIndex].Stats = offRaidProfile.Stats;
    pmcData.data[profileIndex].Encyclopedia = offRaidProfile.Encyclopedia;
    pmcData.data[profileIndex].ConditionCounters = offRaidProfile.ConditionCounters;
    pmcData.data[profileIndex].Quests = offRaidProfile.Quests;

    // level 69 cap to prevent visual bug occuring at level 70
    if (pmcData.data[profileIndex].Info.Experience > 13129881) {
        pmcData.data[profileIndex].Info.Experience = 13129881;
    }

    // mark items found in raid
    for (let offRaidItem in offRaidProfile.Inventory.items) {
        let found = false;

        // check if item exists already
        // only applies to pmcs, as all items found in scavs are considered found in raid.
        if (!isPlayerScav) {
            for (let item of pmcData.Inventory.items) {
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

    // replace item ID's
    offRaidProfile.Inventory.items = itm_hf.replaceIDs(offRaidProfile, offRaidProfile.Inventory.items);

    // set profile equipment to the raid equipment
    move_f.removeItem(pmcData, pmcData.data[profileIndex].Inventory.equipment, item.getOutput(), profileIndex);
    move_f.removeItem(pmcData, pmcData.data[profileIndex].Inventory.questRaidItems, item.getOutput(), profileIndex);
    move_f.removeItem(pmcData, pmcData.data[profileIndex].Inventory.questStashItems, item.getOutput(), profileIndex);

    for (let item in offRaidProfile.Inventory.items) {
        pmcData.data[profileIndex].Inventory.items.push(offRaidProfile.Inventory.items[item]);
    }

    // terminate early for player scavs because we don't care about whether they died.
    if (isPlayerScav) {
        profile_f.setScavData(pmcData.data[1]);
        return;
    }

    // remove inventory if player died
    if (offRaidExit !== "survived" && offRaidExit !== "runner") {
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
    }

    profile_f.setPmcData(pmcData, sessionID);
}

module.exports.saveProgress = saveProgress;