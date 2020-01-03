"use strict";

require('../libs.js');

function cost(info) {
    let output = {"err": 0, "errmsg": null, "data": {}};
    let tmpList = profile.getCharacterData();

    for (let trader of info.traders) {
        let items = {};

        for (let key of info.items) {
            for (let item of tmpList.data[0].Inventory.items) {
                if (item._id === key) {
                    let template = json.parse(json.read(filepaths.templates.items[item._tpl]));

                    items[template.Id] = Math.round(template.Price * 0.65);
                    break;
                }
            }
        }

        output.data[trader] = items;
    }

    return json.stringify(output);
}

function insure(tmpList, body) {
    item.resetOutput();

    let itemsToPay = [];

    // get the price of all items
    for (let key of body.items) {
        for (let item of tmpList.data[0].Inventory.items) {
            if (item._id === key) {
                let template = json.parse(json.read(filepaths.templates.items[item._tpl]));

                itemsToPay.push({
                    "id": item._id,
                    "count": Math.round(template.Price * settings.gameplay.trading.insureMultiplier)
                });
                break;
            }
        }
    }

    // pay the item	to profile
    if (!itm_hf.payMoney(tmpList, {scheme_items: itemsToPay, tid: body.tid})) {
        console.log("no money found");
        return "";
    }

    // add items to InsuredItems list once money has been paid
    for (let key of body.items) {
        for (let item of tmpList.data[0].Inventory.items) {
            if (item._id === key) {
                tmpList.data[0].InsuredItems.push({"tid": body.tid, "itemId": item._id});
                break;
            }
        }
    }

    profile.setCharacterData(tmpList);
    return item.getOutput();
}

module.exports.cost = cost;
module.exports.insure = insure;
