"use strict";

require('../libs.js');

function main(profilesData, body) {
    item.resetOutput();
    let output = item.getOutput();
    let traderProfile = trader.get(body.tid).data;
    let traderRepair = trader.get(body.tid).data.repair;
    let repairItems = body.repairItems;

    for (const itemForRepair of repairItems) {
        const repairItem = profilesData.data[0].Inventory.items.find(item => itemForRepair._id === item._id);

        if (repairItem !== undefined) {
            const pointsToRepair = itemForRepair.count;
            const repairItemTpl = items.data[repairItem._tpl];
            const itemRepairCost = repairItemTpl._props.RepairCost;
            const repairCost = Math.floor((itemRepairCost + itemRepairCost * traderRepair.price_rate / 100) * pointsToRepair * traderRepair.currency_coefficient);

            const currencyItem = profilesData.data[0].Inventory.items.find(item => {
                if (traderRepair.currency === item._tpl) {
                    return item.upd.StackObjectsCount >= repairCost;
                }
            });

            if (currencyItem !== undefined) {
                currencyItem.upd.StackObjectsCount -= repairCost;

                if (Math.floor(currencyItem.upd.StackObjectsCount) === 0) {
                    output.data.items.del.push({"_id": currencyItem._id});
                } else {
                    output.data.items.change.push(currencyItem);
                }

                // anti cheat :D
                if (repairItem.upd.Repairable.Durability < repairItemTpl._props.MaxDurability) {
                    repairItem.upd.Repairable.Durability += pointsToRepair;
                    repairItem.upd.Repairable.MaxDurability = repairItem.upd.Repairable.Durability;
                } else {
                    repairItem.upd.Repairable.Durability = 0.5;
                    repairItem.upd.Repairable.MaxDurability = 0.5;
                }
                output.data.items.change.push(repairItem);

                // set trader standing
                output.data.currentSalesSums[body.tid] = traderProfile.loyalty.currentSalesSum + Math.floor(repairCost);
                trader.lvlUp(body.tid);
            }
        }
    }

    profile.setCharacterData(profilesData);
    return output;
}

module.exports.main = main;