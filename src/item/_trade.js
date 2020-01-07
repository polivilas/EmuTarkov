"use strict";

require('../libs.js');

function buyItem(tmpList, body) {
    // pay the item	to profile
    if (!itm_hf.payMoney(tmpList, body)) {
        console.log("no money found");
        return "";
    }

    // print debug information
    console.log("Bought item: " + body.item_id, "", "", true);
    return profile.addItemToStash(tmpList, body);
}

// Selling item to trader
function sellItem(tmpList, body) {
    item.resetOutput();

    let money = 0;
    let prices = json.parse(profile.getPurchasesData());
    let output = item.getOutput();

    // find the items to sell
    for (let i in body.items) {
        // print item trying to sell
        console.log("selling item" + json.stringify(body.items[i]), "", "", true);

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
function confirmTrading(tmpList, body) {
    // buying
    if (body.type === "buy_from_trader") {
        return buyItem(tmpList, body);
    }

    // selling
    if (body.type === "sell_to_trader") {
        return sellItem(tmpList, body);
    }

    return "";
}

// Ragfair trading
function confirmRagfairTrading(tmpList, body) {
    item.resetOutput();

    let offers = body.offers;
    let output = item.getOutput()

    for (let offer of offers) {
        tmpList = profile.getCharacterData();
        body = {};
        body.Action = "TradingConfirm";
        body.type = "buy_from_trader";
        body.tid = "ragfair";
        body.item_id = offer.id;
        body.count = offer.count;
        body.scheme_id = 0;
        body.scheme_items = offer.items;

        let tmpOutput = confirmTrading(tmpList, body);

        for (let item of tmpOutput.data.items.new) {
            output.data.items.new.push(item);
        }
    }

    return output;
}

module.exports.buyItem = buyItem;
module.exports.sellItem = sellItem;
module.exports.confirmTrading = confirmTrading;
module.exports.confirmRagfairTrading = confirmRagfairTrading;