"use strict";

require('../libs.js');

function buyItem(pmcData, body, sessionID) {
    if (!itm_hf.payMoney(pmcData, body, sessionID)) {
        logger.logError("no money found");
        return "";
    }

    logger.logSuccess("Bought item: " + body.item_id);

    if (body.tid === "579dc571d53a0658a154fbec") {
        body.tid = "ragfair";
    }
    
    return move_f.addItem(pmcData, body, item.getOutput(), sessionID);
}

// Selling item to trader
function sellItem(pmcData, body, sessionID) {
    item.resetOutput();

    let money = 0;
    let prices = json.parse(profile_f.getPurchasesData(body.tid));
    let output = item.getOutput();

    // find the items to sell
    for (let i in body.items) {
        // print item trying to sell
        logger.logInfo("selling item" + json.stringify(body.items[i]));

        // profile inventory, look into it if item exist
        for (let item of pmcData.Inventory.items) {
            let isThereSpace = body.items[i].id.search(" ");
            let checkID = body.items[i].id;

            if (isThereSpace !== -1) {
                checkID = checkID.substr(0, isThereSpace);
            }

            // item found
            if (item._id === checkID) {
                logger.logInfo("Selling: " + checkID);

                // remove item
                output = move_f.removeItem(pmcData, checkID, output, sessionID);
                move_f.removeInsurance(pmcData, checkID);

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
    output = itm_hf.getMoney(pmcData, money, body, output, sessionID);
    return output;
}

// separate is that selling or buying
function confirmTrading(pmcData, body, sessionID) {
    // buying
    if (body.type === "buy_from_trader") {
        return buyItem(pmcData, body, sessionID);
    }

    // selling
    if (body.type === "sell_to_trader") {
        return sellItem(pmcData, body, sessionID);
    }

    return "";
}

// Ragfair trading
function confirmRagfairTrading(pmcData, body, sessionID) {
    item.resetOutput();

    let offers = body.offers;
    let output = item.getOutput()

    for (let offer of offers) {
        pmcData = profile_f.getPmcData(sessionID);
        body = {};
        body.Action = "TradingConfirm";
        body.type = "buy_from_trader";
        body.tid = "ragfair";
        body.item_id = offer.id;
        body.count = offer.count;
        body.scheme_id = 0;
        body.scheme_items = offer.items;

        let tmpOutput = confirmTrading(pmcData, body, sessionID);

        for (let item of tmpOutput.data.items.new) {
            output.data.items.new.push(item);
        }

        for (let item of tmpOutput.data.items.change) {
            output.data.items.change.push(item);
        }

        for (let item of tmpOutput.data.items.del) {
            output.data.items.del.push(item);
        }
    }
    return output;
}

module.exports.buyItem = buyItem;
module.exports.sellItem = sellItem;
module.exports.confirmTrading = confirmTrading;
module.exports.confirmRagfairTrading = confirmRagfairTrading;