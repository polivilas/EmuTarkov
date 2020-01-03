"use strict";

require('../libs.js');

function cost(info) {
    let output = {"err":0,"errmsg":null,"data":{}};

    for (let trader of info.traders) {
        let items = {};

        for (let item of info.items) {
            items[item] = 100;
        }

        output.data[trader] = items;
    }

    return output;
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
