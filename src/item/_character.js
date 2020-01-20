"use strict";

require('../libs.js');

function eatItem(pmcData, body, sessionID) {
    item.resetOutput();
    
    let output = item.getOutput()
    let todelete = false;
    let maxResource = undefined;
    let effects = undefined;

    for (let item in pmcData.Inventory.items) {
        if (pmcData.Inventory.items[item]._id === body.item) {
            maxResource = itm_hf.getItem(pmcData.Inventory.items[item]._tpl)[1]._props.MaxResource;
            effects = itm_hf.getItem(pmcData.Inventory.items[item]._tpl)[1]._props.effects_health; 

            if (maxResource > 1) {   
                if (typeof pmcData.Inventory.items[item].upd.FoodDrink === 'undefined') {
                    pmcData.Inventory.items[item].upd.FoodDrink = {"HpPercent" : maxResource - body.count}; 
                } else {
                    pmcData.Inventory.items[item].upd.FoodDrink.HpPercent -= body.count; 
                    
                    if (pmcData.Inventory.items[item].upd.FoodDrink.HpPercent < 1) {
                        todelete = true;
                    }
                }  
            }
        }
    }

    let hydration = pmcData.Health.Hydration;
    let energy = pmcData.Health.Energy;

    hydration.Current += effects.hydration.value;
    energy.Current += effects.energy.value;

    if (hydration.Current > hydration.Maximum) {
        hydration.Current = hydration.Maximum;
    }

    if (energy.Current > energy.Maximum) {
        energy.Current = energy.Maximum;
    }

    profile_f.setPmcData(pmcData, sessionID);

    if (maxResource === 1 || todelete === true) {
        output = move_f.removeItem(body.item, output, sessionID);
    }

    return output;
}

function healPlayer(pmcData, body, sessionID) {
    // healing body part
    for (let bdpart in pmcData.Health.BodyParts) {
        if (bdpart === body.part) {
            pmcData.Health.BodyParts[bdpart].Health.Current += body.count;
        }
    }

    // update medkit used (hpresource)
    for (let item of pmcData.Inventory.items) {
        if (item._id === body.item) {
            if (typeof item.upd.MedKit === "undefined") {
                let maxhp = itm_hf.getItem(item._tpl)[0]._props.MaxHpResource;

                item.upd.MedKit = {"HpResource": maxhp - body.count};
            } else {
                item.upd.MedKit.HpResource -= body.count;
            }

            if (item.upd.MedKit.HpResource === 0) {
                move_f.removeItem(body.item, item.getOutput(), sessionID);
            }

            profile_f.setPmcData(pmcData, sessionID);
        }
    }

    return "OK";
}

module.exports.eatItem = eatItem;
module.exports.healPlayer = healPlayer;