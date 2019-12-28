"use strict";

require('../libs.js');

function main(tmplist, body) {
    let output = repairItem.getOutput();
    let tmpTraderInfo = trader.get(body.tid);
    let repairCurrency = tmpTraderInfo.data.repair.currency;
    let repairRate = (tmpTraderInfo.data.repair.price_rate === 0) ? 1 : (tmpTraderInfo.data.repair.price_rate / 100 + 1);
    let RequestData = body.repairItems;

    console.log(body.items, "", "", true);

    for (let item of tmplist.data[0].Inventory.items) {
        for (let repairItem of RequestData) {
            if (tmplist.data[0].Inventory.items[item]._id !== repairItem._id) {
                continue;
            }

            let itemRepairCost = items.data[tmplist.data[0].Inventory.items[item]._tpl]._props.RepairCost;

            itemRepairCost = itemRepairCost * repairItem.count * repairRate;

            // need to check and compare it ingame
            for (let curency of tmplist.data[0].Inventory.items) {
                if (curency._tpl !== repairCurrency) {
                    continue;
                }

                // checking if StackObjectsCount is OK
                if (curency.upd.StackObjectsCount < itemRepairCost) {
                    continue;
                }

                // ok we can now repair it
                if (curency.upd.StackObjectsCount < itemRepairCost) {
                    continue;
                }

                curency.upd.StackObjectsCount -= Math.floor(itemRepairCost);

                if (curency.upd.StackObjectsCount === itemRepairCost) {
                    output.data.items.del.push({"_id": curency._id});
                } else {
                    output.data.items.change.push(curency);
                }

                // change item durability
                let calculateDurability = item.upd.Repairable.Durability + repairItem.count;

                if (item.upd.Repairable.MaxDurability < calculateDurability) {
                    calculateDurability = item.upd.Repairable.MaxDurability;
                }

                item.upd.Repairable.Durability = calculateDurability;
                item.upd.Repairable.MaxDurability = calculateDurability;
                output.data.items.change.push(item);

                // set trader standing
                output.data.currentSalesSums[body.tid] = tmpTraderInfo.loyalty.currentSalesSum + Math.floor(itemRepairCost);

                console.log(JSON.stringify(output.data.items.change[1].upd));
            }
        }
    }

    profile.setCharacterData(data);
    return output;
}

module.exports.main = main;