"use strict";

require('../libs.js');

function main(pmcData, body, sessionID) {
    item.resetOutput();

    let output = item.getOutput();
    let tmpTraderInfo = trader.get(body.tid, sessionID);
    let repairRate = (tmpTraderInfo.data.repair.price_rate === 0) ? 1 : (tmpTraderInfo.data.repair.price_rate / 100 + 1);
    let RequestData = body.repairItems;

    for (let repairItem of RequestData) {
        const itemToRepair = pmcData.Inventory.items.find(item => repairItem._id === item._id);

        if (itemToRepair === undefined) {
            continue;
        }

        let itemRepairCost = items.data[itemToRepair._tpl]._props.RepairCost;

        itemRepairCost = Math.round((itemRepairCost * repairItem.count * repairRate) * settings.gameplay.trading.repairMultiplier);

        // pay the item	to profile
        if (!itm_hf.payMoney(pmcData, {scheme_items: [{id: repairItem._id, count: Math.round(itemRepairCost)}], tid: body.tid}, sessionID)) {
            logger.logError("no money found");
            return "";
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

    profile_f.setPmcData(pmcData, sessionID);
    return output;
}

module.exports.main = main;
