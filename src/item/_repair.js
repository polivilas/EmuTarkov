"use strict";

require('../libs.js');

function main(tmplist, body) {
    let output = item.getOutput();
    let count = body.items.length;
    let tmpTraderInfo = trader.get(body.tid);
    let repairCurrency = tmpTraderInfo.data.repair.currency;
    let repairRate = (tmpTraderInfo.data.repair.price_rate === 0) ? 1 : (tmpTraderInfo.data.repair.price_rate / 100 + 1);
    let RequestData = body.items;
    let cnt = 0;

    console.log(body.items, "", "", true);

    for (let inventory in tmplist.data[0].Inventory.items) {
        for (let item in RequestData) {
            if (cnt === count) {
                break;
            }

            if (tmplist.data[0].Inventory.items.hasOwnProperty(inventory)) {
                continue;
            }

            if (!RequestData.hasOwnProperty(item)) {
                continue;
            }

            if (tmplist.data[0].Inventory.items[inventory]._id !== RequestData[item]._id) {
                continue;
            }

            let itemRepairCost = items.data[tmplist.data[0].Inventory.items[inventory]._tpl]._props.RepairCost;

            itemRepairCost = itemRepairCost * RequestData[item].count * repairRate;

            // need to check and compare it ingame
            for (let curency in tmplist.data[0].Inventory.items) {
                if (!tmplist.data[0].Inventory.items.hasOwnProperty(curency)) {
                    continue;
                }

                if (tmplist.data[0].Inventory.items[curency]._tpl !== repairCurrency) {
                    continue;
                }

                if (typeof tmplist.data[0].Inventory.items[curency].upd === "undefined") {
                    continue;
                }

                if (typeof tmplist.data[0].Inventory.items[curency].upd.StackObjectsCount === "undefined") {
                    continue;
                }

                // checking if StackObjectsCount is OK
                if (tmplist.data[0].Inventory.items[curency].upd.StackObjectsCount < itemRepairCost) {
                    continue;
                }

                // check if item is repairable for sure
                if (typeof tmplist.data[0].Inventory.items[inventory].upd.Repairable === "undefined") {
                    continue;
                }

                // ok we can now repair it
                if (tmplist.data[0].Inventory.items[curency].upd.StackObjectsCount < itemRepairCost) {
                    continue;
                }

                tmplist.data[0].Inventory.items[curency].upd.StackObjectsCount -= Math.floor(itemRepairCost);
                if (tmplist.data[0].Inventory.items[curency].upd.StackObjectsCount === itemRepairCost) {
                    output.data.items.del.push({"_id": tmplist.data[0].Inventory.items[curency]._id});
                } else {
                    output.data.items.change.push(tmplist.data[0].Inventory.items[curency]);
                }

                // currency is handled now is time for item
                let calculateDurability = tmplist.data[0].Inventory.items[inventory].upd.Repairable.Durability + RequestData[item].count;

                // make sure durability will not extends maximum possible durability
                if (tmplist.data[0].Inventory.items[inventory].upd.Repairable.MaxDurability < calculateDurability) {
                    calculateDurability = tmplist.data[0].Inventory.items[inventory].upd.Repairable.MaxDurability;
                }

                tmplist.data[0].Inventory.items[inventory].upd.Repairable.Durability = calculateDurability;
                tmplist.data[0].Inventory.items[inventory].upd.Repairable.MaxDurability = calculateDurability;
                output.data.items.change.push(tmplist.data[0].Inventory.items[inventory]);

                // set trader standing
                output.data.currentSalesSums[body.tid] = tmpTraderInfo.loyalty.currentSalesSum + Math.floor(itemRepairCost);

                console.log(JSON.stringify(output.data.items.change[1].upd));
                cnt++;
            }
        }

        if (cnt === count) {
            break;
        }
    }

    profile.setCharacterData(data);
    return output;
}

module.exports.main = main;