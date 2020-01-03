"use strict";

require('../libs.js');

function main(profilesData, body) {
    item.resetOutput();
    
    let output = item.getOutput();
    let tmpTraderInfo = trader.get(body.tid);
    let repairCurrency = tmpTraderInfo.data.repair.currency;
    let repairRate = (tmpTraderInfo.data.repair.price_rate === 0) ? 1 : (tmpTraderInfo.data.repair.price_rate / 100 + 1);
    let RequestData = body.repairItems;

    for (let repairItem of RequestData) {
        const itemToRepair = profilesData.data[0].Inventory.items.find(item => repairItem._id === item._id);
        if (itemToRepair === undefined) continue;

        let itemRepairCost = items.data[itemToRepair._tpl]._props.RepairCost;
        itemRepairCost = Math.floor(itemRepairCost * repairItem.count * repairRate);

        // pay the repair cost
        if (!itm_hf.payForRepair(profilesData, repairCurrency, itemRepairCost, body)) {
            console.log("no money found");
            continue;
        }

        // change item durability
        let calculateDurability = itemToRepair.upd.Repairable.Durability + repairItem.count;

        if (itemToRepair.upd.Repairable.MaxDurability <= calculateDurability) {
            calculateDurability = itemToRepair.upd.Repairable.MaxDurability;
        }

        itemToRepair.upd.Repairable.Durability = calculateDurability;
        itemToRepair.upd.Repairable.MaxDurability = calculateDurability;
        output.data.items.change.push(itemToRepair);
    }

    profile.setCharacterData(profilesData);
    return output;
}

module.exports.main = main;
