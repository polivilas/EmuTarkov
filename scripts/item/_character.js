"use strict";

const utility = require('../utility.js');
const profile = require('../profile.js');
const itm_hf = require('./helpFunctions.js');	// additional functions
const move_f = require('./_move.js'); 			// move item 	handling functions

//// ---- FUNCTIONS BELOW ---- ////

function eatItem(tmpList, body) { // -> Eat item and get benefits

    for (let item in tmpList.data[0].Inventory.items) 
    {
        if (tmpList.data[0].Inventory.items[item]._id === body.item)
        {
            var maxResource = itm_hf.getItem(tmpList.data[0].Inventory.items[item]._tpl)[1]._props.MaxResource;
            var effects = itm_hf.getItem(tmpList.data[0].Inventory.items[item]._tpl)[1]._props.effects_health; 
            var todelete = false;

            if( maxResource > 1 )
            {   
                if( typeof tmpList.data[0].Inventory.items[item].upd.FoodDrink === 'undefined')
                {
                    tmpList.data[0].Inventory.items[item].upd.FoodDrink = {"HpPercent" : maxResource - body.count}; 

                }else
                {
                    tmpList.data[0].Inventory.items[item].upd.FoodDrink.HpPercent -= body.count; 
                    if( tmpList.data[0].Inventory.items[item].upd.FoodDrink.HpPercent < 1 ){todelete = true;}
                }  
            }
        }
    }

    let hydration = tmpList.data[0].Health.Hydration;
    let energy = tmpList.data[0].Health.Energy;

    hydration.Current += effects.hydration.value;
    energy.Current += effects.energy.value;

    if (hydration.Current > hydration.Maximum) {
        hydration.Current = hydration.Maximum;
    }

    if (energy.Current > energy.Maximum) {
        energy.Current = energy.Maximum;
    }

    profile.setCharacterData(tmpList);

    if(maxResource == 1 || todelete == true)
    {
        move_f.removeItem(tmpList, {Action: 'Remove', item: body.item});
    }
    else
    {
        item.resetOutput();
    }
    return item.getOutput();
}

function healPlayer(tmpList, body) { // -> Healing
    // healing body part
    for (let bdpart in tmpList.data[0].Health.BodyParts) {
        if (bdpart === body.part) {
            tmpList.data[0].Health.BodyParts[bdpart].Health.Current += body.count;
        }
    }
    // update medkit used (hpresource)
    for (let item of tmpList.data[0].Inventory.items) {
        // find the medkit in the inventory
        if (item._id === body.item) {
            if (typeof item.upd.MedKit === "undefined") {
                let maxhp = itm_hf.getItem(item._tpl)[0]._props.MaxHpResource;

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