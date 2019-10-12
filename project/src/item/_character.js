"use strict";

const utility = require('../utility.js');
const profile = require('../profile.js');
const itm_hf = require('./helpFunctions.js');	// additional functions
const move_f = require('./_move.js'); 			// move item 	handling functions

//// ---- FUNCTIONS BELOW ---- ////

function eatItem(tmpList, body) { // -> Eat item and get benefits // maybe for future features
    /*for (let item of tmpList.data[1].Inventory.items) {
        if (item._id === body.item) {
            let effects = getItem(item._tpl)[1]._props.effects_health; // TODO: Its used to remove Fracture effect etc. on body part / its not implemented so its not used
        }
    }*/

    let hydration = tmpList.data[1].Health.Hydration;
    let energy = tmpList.data[1].Health.Energy;

    hydration.Current += effects.hydration.value;
    energy.Current += effects.energy.value;

    if (hydration.Current > hydration.Maximum) {
        hydration.Current = hydration.Maximum;
    }

    if (energy.Current > energy.Maximum) {
        energy.Current = energy.Maximum;
    }

    profile.setCharacterData(tmpList);
    move_f.removeItem(tmpList, {Action: 'Remove', item: body.item});
    return "OK";
}

function healPlayer(tmpList, body) { // -> Healing
    // healing body part
    for (let bdpart in tmpList.data[1].Health.BodyParts) {
        if (bdpart === body.part) {
            tmpList.data[1].Health.BodyParts[bdpart].Health.Current += body.count;
        }
    }
    // update medkit used (hpresource)
    for (let item of tmpList.data[1].Inventory.items) {
        // find the medkit in the inventory
        if (item._id === body.item) {
            if (typeof item.upd.MedKit === "undefined") {
                let maxhp = itm_hf.getItem(item._tpl)[1]._props.MaxHpResource;

                item.upd.MedKit = {"HpResource": maxhp - body.count};
            } else {
                item.upd.MedKit.HpResource -= body.count;
            }

            // remove medkit if its empty
            if (item.upd.MedKit.HpResource === 0) {
                move_f.removeItem(tmpList, {Action: 'Remove', item: body.item});
            }

            profile.setCharacterData(tmpList);
        }
    }
    return "OK";
}

//// ---- EXPORT LIST ---- ////

module.exports.eatItem = eatItem;
module.exports.healPlayer = healPlayer;
//module.exports.moveItem = moveItem;