"use strict";

require('../libs.js');

/* ~ Generate Pocket items
 * ~~input: pocket number, BotType
 * ~~output: pocketItems
 */
function generatePocketItem(pocketNum = 1, botType) { // determine which item will be added medicament or granade

    if (utility.getRandomInt() < settings.bots.pocket.med_to_gra) {
        if (utility.getRandomInt() <= settings.bots.pocket.meds || botType === "followerBully") { // meds
            let item = {};
            const tier = bots_mf.calculateItemChance(presets.Medicaments);
            const len = presets.Medicaments[tier].length;
            const randomize = utility.getRandomInt(0,len-1);
            const itemTpl = presets.Medicaments[tier][randomize];
            let item_data = items.data[itemTpl];
            item._id = "Pocket_" + utility.getRandomIntEx(999999);
            item._tpl = itemTpl;
            item.parentId = "5c6687d65e9d882c8841f121";
            item.slotId = "pocket" + pocketNum;
            item.location = {x: 0, y: 0, r: "Horizontal"};
            item.upd = bots_mf.updCreator(item_data.parentId, item_data);
            return item;
        }
    } else {
        if (utility.getRandomInt() <= settings.bots.pocket.granade || botType === "followerBully") { // granades
            let item = {};
            const len = presets.Grenades.length;
            const randomize = utility.getRandomInt(0,len-1);
            const itemTpl = presets.Grenades[randomize];
            item._id = "Pocket_" + utility.getRandomIntEx(999999);
            item._tpl = itemTpl;
            item.parentId = "5c6687d65e9d882c8841f121";
            item.slotId = "pocket" + pocketNum;
            item.location = {x: 0, y: 0, r: "Horizontal"};
            item.upd = {StackObjectsCount: 1};
            return item;
        }
    }
    return false;
}


module.exports.generatePocketItem = generatePocketItem;
