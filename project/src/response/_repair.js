"use strict";

require('../libs.js');

//// ---- FUNCTIONS BELOW ---- ////

function main(info) {
    let output = JSON.parse('{"err":0, "errmsg":null, "data":{"items":{"change":[],"del":[]}, "badRequest":[], "currentSalesSums": {}}}');
    let data = profile.getCharacterData();
    let count = info.items.length;
    console.log(info.items, "", "", true);
    let trader = trader_m.get(info.tid); // trader informations from Trader table
    let repairCurrency = trader.data.repair.currency;
    let repairRate = (trader.data.repair.price_rate === 0) ? 1 : (trader.data.repair.price_rate / 100 + 1);
    let RequestData = info.items;
    let cnt = 0;
    // let ErrorHappend = false;
    for (let inventory in data.data[1].Inventory.items) {
        for (let item in RequestData) {
            if (cnt === count) break;
            if (data.data[1].Inventory.items.hasOwnProperty(inventory)) {
                if (RequestData.hasOwnProperty(item)) {
                    if (data.data[1].Inventory.items[inventory]._id === RequestData[item]._id) {
                        let itemRepairCost = items.data[data.data[1].Inventory.items[inventory]._tpl]._props.RepairCost;
                        itemRepairCost = itemRepairCost * RequestData[item].count * repairRate; // need to check and compare it ingame
                        for (let curency in data.data[1].Inventory.items) {
                            if (data.data[1].Inventory.items.hasOwnProperty(curency)) {
                                if (data.data[1].Inventory.items[curency]._tpl === repairCurrency) {
                                    if (typeof data.data[1].Inventory.items[curency].upd !== "undefined") {
                                        if (typeof data.data[1].Inventory.items[curency].upd.StackObjectsCount !== "undefined") { // checking if StackObjectsCount is OK
                                            if (data.data[1].Inventory.items[curency].upd.StackObjectsCount >= itemRepairCost) { // ok we can now repair it
                                                if (typeof data.data[1].Inventory.items[inventory].upd.Repairable !== "undefined") { // check if item is repairable for sure
                                                    if (data.data[1].Inventory.items[curency].upd.StackObjectsCount > itemRepairCost)
                                                        data.data[1].Inventory.items[curency].upd.StackObjectsCount -= Math.floor(itemRepairCost);
                                                    if (data.data[1].Inventory.items[curency].upd.StackObjectsCount === itemRepairCost) {
                                                        output.data.items.del.push({"_id": data.data[1].Inventory.items[curency]._id});
                                                    } else {
                                                        output.data.items.change.push(data.data[1].Inventory.items[curency]);
                                                    }
                                                    // currency is handled now is time for item
                                                    let calculateDurability = data.data[1].Inventory.items[inventory].upd.Repairable.Durability + RequestData[item].count;

                                                    if (data.data[1].Inventory.items[inventory].upd.Repairable.MaxDurability < calculateDurability) { // make sure durability will not extends maximum possible durability
                                                        calculateDurability = data.data[1].Inventory.items[inventory].upd.Repairable.MaxDurability;
                                                    }

                                                    data.data[1].Inventory.items[inventory].upd.Repairable.Durability = calculateDurability;
                                                    data.data[1].Inventory.items[inventory].upd.Repairable.MaxDurability = calculateDurability;
                                                    output.data.items.change.push(data.data[1].Inventory.items[inventory]);
                                                    output.data.currentSalesSums[info.tid] = data.data[1].TraderStandings[info.tid].currentSalesSum + Math.floor(itemRepairCost);
													console.log(output.data.items.change[1].upd);
                                                    cnt++;
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        if (cnt === count)
            break;
    }
    profile.setCharacterData(data);
    return output;
}

//// ---- EXPORT LIST ---- ////

module.exports.main = main;

//module.exports.funcname = funcname; // preset
//responses to look at
    /*	{
                  "err": 0,
                  "errmsg": null,
                  "data": {
                    "items": {
                      "change": [
                        {
                          "_id": "5d0778e48ed2394283654566",
                          "_tpl": "5449016a4bdc2d6f028b456f",
                          "parentId": "5cacd049f0dd3508b7593561",
                          "slotId": "hideout",
                          "location": {
                            "x": 6,
                            "y": 1,
                            "r": 0,
                            "isSearched": true
                          },
                          "upd": {
                            "StackObjectsCount": 493176
                          }
                        },
                        {
                          "_id": "5d5abef28ed2392c3f3df930",
                          "_tpl": "5648a7494bdc2d9d488b4583",
                          "parentId": "5cacd049f0dd3508b7593561",
                          "slotId": "hideout",
                          "location": {
                            "x": 7,
                            "y": 6,
                            "r": 0
                          },
                          "upd": {
                            "Repairable": {
                              "MaxDurability": 46.9,
                              "Durability": 46.9
                            },
                            "StackObjectsCount": 1
                          }
                        }
                      ]
                    },
                    "badRequest": [],
                    "currentSalesSums": {
                      "54cb50c76803fa8b248b4571": 49222779
                    }
                  }
                }*/
    //repair this :) by TheMaoci
    /*
                repair request:
    {"tid":"54cb50c76803fa8b248b4571","items":[{"_id":"5d5ed7f76588810e881fde44","count":0.5998993}]}

    repair response:
    {"err":0,"errmsg":null,"data":{"items":{"change":[{"_id":"5d20eb42cdd3c81526533e54","_tpl":"5449016a4bdc2d6f028b456f","parentId":"5d20f0a0cdd3c8aab3072ed9","slotId":"main","location":{"x":2,"y":0,"r":0,"isSearched":true},"upd":{"StackObjectsCount":499965}},{"_id":"5d5ed7f76588810e881fde44","_tpl":"5ac4cd105acfc40016339859","parentId":"5cb0dd1946b16858856de0a3","slotId":"hideout","location":{"x":3,"y":18,"r":0,"isSearched":true},"upd":{"SpawnedInSession":true,"Repairable":{"MaxDurability":99.5,"Durability":99.5},"Foldable":{"Folded":false},"FireMode":{"FireMode":"fullauto"}}}]},"badRequest":[],"currentSalesSums":{"54cb50c76803fa8b248b4571":3564060}}}
    different gun, durability has changed:

    {"err":0,"errmsg":null,"data":{"items":{"change":[{"_id":"5d20eb42cdd3c81526533e54","_tpl":"5449016a4bdc2d6f028b456f","parentId":"5d20f0a0cdd3c8aab3072ed9","slotId":"main","location":{"x":2,"y":0,"r":0,"isSearched":true},"upd":{"StackObjectsCount":494392}},{"_id":"5d32fc115e9d8819040ef960","_tpl":"5b0bbe4e5acfc40dc528a72d","parentId":"5cb0dd1946b16858856de0a3","slotId":"hideout","location":{"x":4,"y":23,"r":1,"isSearched":true},"upd":{"Repairable":{"MaxDurability":99.8,"Durability":99.8},"FireMode":{"FireMode":"fullauto"}}}]},"badRequest":[],"currentSalesSums":{"54cb50c76803fa8b248b4571":3569633}}}*/