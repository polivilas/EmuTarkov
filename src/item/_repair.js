"use strict";

require('../libs.js');

function main(tmpList, body) {
    let output = item.getOutput();
    let tmpTraderInfo = trader.get(body.tid);
    let repairCurrency = tmpTraderInfo.data.repair.currency;
    let repairRate = (tmpTraderInfo.data.repair.price_rate === 0) ? 1 : (tmpTraderInfo.data.repair.price_rate / 100 + 1);
    let RequestData = body.repairItems;

    for (let item of tmpList.data[0].Inventory.items) {
        for (let repairItem of RequestData) {
            if (tmpList.data[0].Inventory.items[item]._id !== repairItem._id) {
                continue;
            }

            let itemRepairCost = items.data[tmpList.data[0].Inventory.items[item]._tpl]._props.RepairCost;
            itemRepairCost = itemRepairCost * repairItem.count * repairRate;

            // pay the repair cost
            let moneyObject = itm_hf.findMoney(tmpList, repairCurrency);

            if (typeof moneyObject[0] === "undefined") {
                console.log("Error something goes wrong (not found Money)");
                return "";
            }

            if (!itm_hf.payMoney(tmpList, moneyObject, body)) {
                console.log("no money found");
                return "";
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
            trader.lvlUp(body.tid);

            console.log(JSON.stringify(output.data.items.change[1].upd));
        }
    }

    profile.setCharacterData(data);
    return output;
}

module.exports.main = main;
