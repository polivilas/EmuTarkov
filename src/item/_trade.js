"use strict";

require('../libs.js');

var output = "";

function buyItem(tmpList, body, traderName = "") {
    // pay the item	to profile
    if (!itm_hf.payMoney(tmpList, body)) {
        console.log("no money found");
        return "";
    }

    // print debug information
    console.log("Bought item: " + body.item_id, "", "", true);
    return profile.addItemToStash(tmpList, body, traderName);
}

// Selling item to trader
function sellItem(tmpList, body) {
    let money = 0;
    let prices = JSON.parse(profile.getPurchasesData());

    item.resetOutput();
    output = item.getOutput();

    // find the items to sell
    for (let i in body.items) {
        // print item trying to sell
        console.log("selling item" + JSON.stringify(body.items[i]), "", "", true);

        // profile inventory, look into it if item exist
        for (let item of tmpList.data[0].Inventory.items) {
            let isThereSpace = body.items[i].id.search(" ");
            let checkID = body.items[i].id;

            if (isThereSpace !== -1) {
                checkID = checkID.substr(0, isThereSpace);
            }

            // item found
            if (item._id === checkID) {
                console.log("Selling: " + checkID, "", "", true);

                // remove item
                output = move_f.removeItem(tmpList, {Action: 'Remove', item: checkID}, output);
                move_f.removeInsurance(tmpList, checkID);

                // add money to return to the player
                let price_money = prices.data[item._id][0][0].count;

                if (output !== "BAD") {
                    money += price_money;
                } else {
                    return "";
                }
            }
        }
    }

    // get money the item
    output = itm_hf.getMoney(tmpList, money, body, output);
    return output;
}

// separate is that selling or buying
function confirmTrading(tmpList, body, traderName = "") {
    // buying
    if (body.type === "buy_from_trader") {
        return buyItem(tmpList, body, traderName);
    }

    // selling
    if (body.type === "sell_to_trader") {
        return sellItem(tmpList, body);
    }

    return "";
}

// Ragfair trading
function confirmRagfairTrading(tmpList, body) {
    /*
    { Action: 'RagFairBuyOffer',  offerId: '56d59d3ad2720bdb418b4577',  count: 1,  items: [ { id: '1566757577968610909', count: 42 } ] }
    */

    item.resetOutput();

    let ragfairOffers = body.offers;
    let allOutput = item.getOutput()

    for (let oneOffer of ragfairOffers) {
        tmpList = profile.getCharacterData();
        body = {};
        body.Action = "TradingConfirm";
        body.type = "buy_from_trader";
        body.tid = "everything";
        body.item_id = oneOffer.id;
        body.count = oneOffer.count;
        body.scheme_id = 0;
        body.scheme_items = oneOffer.items;

        let tempOutput = confirmTrading(tmpList, body, "ragfair");

        if (tempOutput === "") {
            break;
        }

        for (let newItem of tempOutput.data.items.new) {
            allOutput.data.items.new.push(newItem);
        }
    }

    return allOutput;
}

module.exports.buyItem = buyItem;
module.exports.sellItem = sellItem;
module.exports.confirmTrading = confirmTrading;
module.exports.confirmRagfairTrading = confirmRagfairTrading;