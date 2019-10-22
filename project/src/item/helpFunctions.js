"use strict";

require('../libs.js');

const templates = JSON.parse(utility.readJson('data/configs/templates.json'));
const AllQuests = quests;
var output = "";

function returnOutput(){
	return output;
}
function setInternalOutput(data){
    output = data;
}

/* Made a 2d array table with 0 - free slot and 1 - used slot
* input: PlayerData
* output: table[y][x]
* */
function recheckInventoryFreeSpace(tmpList) { // recalculate stach taken place
	let PlayerStash = getPlayerStash();
    let Stash2D = Array(PlayerStash[1]).fill(0).map(x => Array(PlayerStash[0]).fill(0));
    for (let item of tmpList.data[1].Inventory.items) {
        // hideout  // added proper stash ID older was "5c71b934354682353958ea35"
        if (item.parentId === tmpList.data[1].Inventory.stash && typeof item.location != "undefined") {
            // let tmpItem = getItem(item._tpl)[1];
            let tmpSize = getSize(item._tpl, item._id, tmpList.data[1].Inventory.items);
            //			x
            let iW = tmpSize[0];
            //			y
            let iH = tmpSize[1];
			if(typeof item.upd != "undefined")
				if(typeof item.upd.Foldable != "undefined")
					if(item.upd.Foldable.Folded){
						iW -= 1;
					}
			
            let fH = ((item.location.r === "Vertical" || item.location.rotation === "Vertical") ? iW : iH);
            let fW = ((item.location.r === "Vertical" || item.location.rotation === "Vertical") ? iH : iW);
			

            for (let y = 0; y < fH; y++) {
				if (item.location.y + y <= PlayerStash[1] && item.location.x + fW <= PlayerStash[0]) { // fixed filling out of bound
                    let FillTo = ((item.location.x + fW >= PlayerStash[0]) ? PlayerStash[0] : item.location.x + fW);
					try
					{
						Stash2D[item.location.y + y].fill(1, item.location.x, FillTo);
					} catch(e)
					{ 
						console.log("[OOB] for item " + item._id + " [" + item._id + "] with error message: " + e);
					}
                }
            }
        }
    }
    return Stash2D;
}
/* Gets currency TPL from TAG
* input: currency(tag)
* output: template ID
* */
function getCurrency(currency) {
    switch (currency) {
        case "EUR":
            return "5696686a4bdc2da3298b456a";
        case "USD":
            return "569668774bdc2da2298b4568";
        default:
            return "5449016a4bdc2d6f028b456f"; // RUB set by default
    }
}
/* Gets Currency to Ruble conversion Value
* input:  value, currency tpl
* output: value after conversion
*/
function inRUB(value, currency) {
    for (let temp in templates.data) {
        if (templates.data.hasOwnProperty(temp)) {
            if (templates.data[temp].Id === currency) {
                return value * templates.data[temp].Price;
            }
        }
    }
    return value;
}
/* Gets Ruble to Currency conversion Value
* input: value, currency tpl
* output: value after conversion
* */
function fromRUB(value, currency) {
    for (let temp in templates.data) {
        if (templates.data.hasOwnProperty(temp)) {
            if (templates.data[temp].Id === currency) {
                return value / templates.data[temp].Price;
            }
        }
    }
    return value;
}
/* take money and insert items into return to server request
* input:
* output:
* */
function payMoney(tmpList, moneyObject, body, trad = "") {
	output = item.getOutput();
    let value = 0;
    for (let i = 0; i < moneyObject.length; i++) {
		for (let index in tmpList.data[1].Inventory.items) {
			let itm = tmpList.data[1].Inventory.items[index];
            if (typeof itm.upd !== "undefined")
                if (itm._id === moneyObject[i]._id && itm.upd.StackObjectsCount > body.scheme_items[i].count) {
                    value += body.scheme_items[i].count;
                    itm.upd.StackObjectsCount -= body.scheme_items[i].count;
                    output.data.items.change.push({
                        "_id": itm._id,
                        "_tpl": itm._tpl,
                        "parentId": itm.parentId,
                        "slotId": itm.slotId,
                        "location": itm.location,
                        "upd": {"StackObjectsCount": itm.upd.StackObjectsCount}
                    });
                } else if (itm._id === moneyObject[i]._id && itm.upd.StackObjectsCount === body.scheme_items[i].count) {
                    value += body.scheme_items[i].count;
                    tmpList.data[1].Inventory.items.splice(index, 1);// just slice item from )
                    output.data.items.del.push({"_id": itm._id});
                } else if (itm._id === moneyObject[i].id && itm.upd.StackObjectsCount < body.scheme_items[i].count)
                    return false;
        }
    }
    // this script will not override data if something goes wrong aka return false;
    // keep track of trader changing
    if (body.tid !== "91_everythingTrader" && body.tid !== "92_SecretTrader")
        if (trad === "") {
            let tmpTrader = trader.get(body.tid);
            let traderCurrency = tmpTrader.data.currency;
            let traderLoyalty = tmpTrader.data.loyalty;
            value = inRUB(value, traderCurrency);
            traderLoyalty.currentSalesSum += value;
            trader.get(body.tid).data.loyalty = traderLoyalty;
            let newLvlTraders = trader.lvlUp(tmpList.data[1].Info.Level);
            for (let lvlUpTrader in newLvlTraders) {
                if (tmpList.data[1].TraderStandings.hasOwnProperty(lvlUpTrader)) {
                    tmpList.data[1].TraderStandings[lvlUpTrader].currentLevel = trader.get(lvlUpTrader).data.loyalty.currentLevel;
                }
            }
            // if everything goes OK save profile
            // update trader data also in profile

            tmpList.data[1].TraderStandings[body.tid].currentSalesSum = traderLoyalty.currentSalesSum;
        }
    profile.setCharacterData(tmpList);
    console.log("Items taken. Status OK.", "white", "green", true);
	item.setOutput(output);
    return true;
}
/* Find Barter item in the inventory
* input: player data, BarteredItem ID
* output: data of Item from inventory
* */
function findMoney(tmpList, barter_itemID) { // find required items to take after buying (handles multiple items)
    let prepareReturn = [];
    for (let item of tmpList.data[1].Inventory.items)
        for (let i = 0; i < barter_itemID.length; i++)
            if (item._id === barter_itemID[i])
                prepareReturn[i] = item;
    return prepareReturn; // if none return []
}
/* receive money back after selling
* input: playerData, numberToReturn, request.body,
* output: none (output is sended to item.js, and profile is saved to file)
* */
function getMoney(tmpList, amount, body, output_temp) {
    let tmpTraderInfo = trader.get(body.tid);
    let currency = getCurrency(tmpTraderInfo.data.currency);
    let value = inRUB(amount, currency);
    let calcAmount = fromRUB(amount, currency);
    let skip = false;
    for (let item of tmpList.data[1].Inventory.items) {
        if (item._tpl === currency) {
            item.upd.StackObjectsCount += calcAmount;
            output_temp.data.items.change.push(item);
            console.log("Money received: " + calcAmount + " " + tmpTraderInfo.data.currency, "white", "green", true);
            skip = true;
        }
        if (skip)
            break;
    }
    if (!skip) {
        let StashFS_2D = recheckInventoryFreeSpace(tmpList);
        //creating item tho
        let stashSize = getPlayerStash();
        addedMoney:
        for (let My = 0; My <= stashSize[1]; My++) {
            for (let Mx = 0; Mx <= stashSize[0]; Mx++) {
                let skip0 = false;
                if (StashFS_2D[My][Mx] !== 0) {
                    skip0 = true;
                }
                if (!skip0) {
                    let MoneyItem =
                        {
                            "_id": utility.generateNewItemId(),
                            "_tpl": currency,
                            "parentId": tmpList.data[1].Inventory.stash,
                            "slotId": "hideout",
                            "location": {x: Mx, y: My, r: "Horizontal"},
                            "upd": {"StackObjectsCount": calcAmount}
                        };
                    tmpList.data[1].Inventory.items.push(MoneyItem);
                    output_temp.data.items.new.push(MoneyItem);
                    console.log("Money created: " + calcAmount + " " + tmpTraderInfo.data.currency, "white", "green", true);
                    break addedMoney;
                }

            }
        }
    }
    let traderLoyalty = tmpTraderInfo.data.loyalty;
    traderLoyalty.currentSalesSum += value;
    trader.get(body.tid).data.loyalty = traderLoyalty;
    let newLvlTraders = trader.lvlUp(tmpList.data[1].Info.Level);
    for (let lvlUpTrader in newLvlTraders) {
        if (tmpList.data[1].TraderStandings.hasOwnProperty(lvlUpTrader)) {
            tmpList.data[1].TraderStandings[lvlUpTrader].currentLevel = trader.get(lvlUpTrader).data.loyalty.currentLevel;
        }
    }
    if (body.tid !== "91_everythingTrader" && body.tid !== "92_SecretTrader")
        tmpList.data[1].TraderStandings[body.tid].currentSalesSum = traderLoyalty.currentSalesSum;
    profile.setCharacterData(tmpList);
    return output_temp;
}
/* Get Player Stash Proper Size
* input: null
* output: [stashSizeWidth, stashSizeHeight]
* */
function getPlayerStash() { //this sets automaticly a stash size from items.json (its not added anywhere yet cause we still use base stash)
    let stashTPL = profile.getStashType();
    let stashX = (items.data[stashTPL]._props.Grids[0]._props.cellsH !== 0) ? items.data[stashTPL]._props.Grids[0]._props.cellsH : 10;
    let stashY = (items.data[stashTPL]._props.Grids[0]._props.cellsV !== 0) ? items.data[stashTPL]._props.Grids[0]._props.cellsV : 66;
	return [stashX, stashY];
}
/* Gets item data from items.json
* input: Item Template ID
* output: [ItemFound?(true,false), itemData]
* */
function getItem(template) { // -> Gets item from <input: _tpl>
    for (let itm in items.data) {
        if (items.data.hasOwnProperty(itm)) {
            if (items.data[itm]._id && items.data[itm]._id === template) {
                let item = items.data[itm];
                return [true, item];
            }
        }
    }
    return [false, {}];
}
/* Calculate Size of item inputed
* inputs Item template ID, Item Id, InventoryItem (item from inventory having _id and _tpl)
* outputs [width, height]
* */
function getSize(itemtpl, itemID, InventoryItem) { // -> Prepares item Width and height returns [sizeX, sizeY]
    let toDo = [itemID],
		rootItem = itemID,
		tmpItem = getItem(itemtpl)[1],
		isFolded = false,
		isMagazine = false, 
		isGrip = false,
		isMainBaseHasis = false,
		isBarrel = false,
		BxH_diffrence_stock = 0,
		BxH_diffrence_barrel = 0;
			
			
			
		   
    let outX = tmpItem._props.Width;
    let outY = tmpItem._props.Height;
	let skipThisItems = ["5448e53e4bdc2d60728b4567", "566168634bdc2d144c8b456c", "5795f317245977243854e041"];
	
	if(skipThisItems.indexOf(tmpItem._parent) === -1){ // containers big no no
		while (true) {
			if (typeof toDo[0] === "undefined") {
				break;
			}
			for (let tmpKey in InventoryItem) {
				if (InventoryItem.hasOwnProperty(tmpKey)) {
					if(InventoryItem[tmpKey]._id == toDo[0]){
						if(typeof InventoryItem[tmpKey].upd != "undefined")
							if(typeof InventoryItem[tmpKey].upd.Foldable != "undefined")
								if(InventoryItem[tmpKey].upd.Foldable.Folded === true)
									isFolded = true;
					}
					if (InventoryItem[tmpKey].parentId === toDo[0]) {
						let itm = getItem(InventoryItem[tmpKey]._tpl)[1];
						//if(rootItem === InventoryItem[tmpKey].parentId || itm._props.ExtraSizeForceAdd == true) {
						if(InventoryItem[tmpKey].slotId != "mod_handguard"){
							if(InventoryItem[tmpKey].slotId == "mod_magazine"){ 
								if (typeof itm._props.ExtraSizeDown !== "undefined" && itm._props.ExtraSizeDown > 0) {
									isMagazine = true;
								}
							}
							if(InventoryItem[tmpKey].slotId == "mod_pistol_grip" || InventoryItem[tmpKey].slotId == "mod_pistolgrip"){
																							  
								isGrip = true;
							}
							if(InventoryItem[tmpKey].slotId == "mod_stock"){
								if (typeof itm._props.ExtraSizeDown !== "undefined" && itm._props.ExtraSizeDown > 0) {
									isGrip = true;
								}
							}
							if(InventoryItem[tmpKey].slotId == "mod_stock"){
								if (typeof itm._props.ExtraSizeLeft !== "undefined" && itm._props.ExtraSizeLeft > 0) {
									BxH_diffrence_stock = itm._props.ExtraSizeLeft;
									isMainBaseHasis = true;
								}
							}
							if(InventoryItem[tmpKey].slotId == "mod_barrel"){
								if (typeof itm._props.ExtraSizeLeft !== "undefined" && itm._props.ExtraSizeLeft > 0) {
									BxH_diffrence_barrel = itm._props.ExtraSizeLeft;
									isBarrel = true;
								}
							}
							if (typeof itm._props.ExtraSizeLeft !== "undefined" && itm._props.ExtraSizeLeft > 0) {
								if (InventoryItem[tmpKey].slotId == "mod_barrel" && itm._props.ExtraSizeLeft > 1 || InventoryItem[tmpKey].slotId != "mod_barrel")
								outX += itm._props.ExtraSizeLeft;
							}

							if (typeof itm._props.ExtraSizeRight !== "undefined" && itm._props.ExtraSizeRight > 0) {
								outX += itm._props.ExtraSizeRight;
							}

							if (typeof itm._props.ExtraSizeUp !== "undefined" && itm._props.ExtraSizeUp > 0) {
								outY += itm._props.ExtraSizeUp;
							}

							if (typeof itm._props.ExtraSizeDown !== "undefined" && itm._props.ExtraSizeDown > 0) {
								outY += itm._props.ExtraSizeDown;
							}
						}
						//console.log(InventoryItem[tmpKey]._id + " - " + outX + " - " + outY );
						toDo.push(InventoryItem[tmpKey]._id);
					}
				}
			}
			toDo.splice(0, 1);
		}
	}
	if(isBarrel && isMainBaseHasis){
		let calculate = Math.abs(BxH_diffrence_stock - BxH_diffrence_barrel);
		calculate = ((BxH_diffrence_stock > BxH_diffrence_barrel)?BxH_diffrence_stock:BxH_diffrence_barrel) - calculate;
		outX -= calculate;
	}
	if(isMagazine && isGrip)
		outY -= 1;
	if(isFolded)
		outX -= 1;
	//console.log("-EndSize= "+rootItem+" >" + outX + " - " + outY);
    return [outX, outY];
}
/* Find And Return Children (TRegular)
* input: PlayerData, InitialItem._id
* output: list of item._id
* List is backward first item is the furthest child and last item is main item
* returns all child items ids in array, includes itself and children
* */
function findAndReturnChildren(tmpList, itemid) {
    let list = [];
    for (let childitem of tmpList.data[1].Inventory.items) {
        if (childitem.parentId === itemid) {
            list.push.apply(list, findAndReturnChildren(tmpList, childitem._id));
        }
    }
    list.push(itemid);// it's required
    return list;
}

//// ---- EXPORT LIST ---- ////

module.exports.recheckInventoryFreeSpace = recheckInventoryFreeSpace;
module.exports.getCurrency = getCurrency;
module.exports.inRUB = inRUB;
module.exports.fromRUB = fromRUB;
module.exports.payMoney = payMoney;
module.exports.findMoney = findMoney;
module.exports.getMoney = getMoney;
module.exports.getPlayerStash = getPlayerStash;
module.exports.getItem = getItem;
module.exports.getSize = getSize;
module.exports.findAndReturnChildren = findAndReturnChildren;
module.exports.returnOutput = returnOutput;
module.exports.setInternalOutput = setInternalOutput;
//module.exports.getSize = getSize;
