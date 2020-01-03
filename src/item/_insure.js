"use strict";

require('../libs.js');

function cost(info) {
    let output = {"err":0,"errmsg":null,"data":{}};
    let tmpList = profile.getCharacterData();

    for (let trader of info.traders) {
        let items = {};

        for (let key of info.items) {
            for (let item of tmpList.data[0].Inventory.items) {
                if (item._id === key) {
                    let template = json.parse(json.read(filepaths.templates.items[item._tpl]));

                    items[template.Id] = round(template.Price * 0.65);
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
    
    let output = item.getOutput();

    // get the price of all items

    // pay the money

    // add items to InsuredItems list

    return output;
}

module.exports.cost = cost;
module.exports.insure = insure;
