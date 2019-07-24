"use strict";

const utility = require('./utility.js');
const profile = require('./profile.js');
const trader = require('./trader.js');

var items = JSON.parse(utility.readJson('data/configs/items.json'));
var stashX = 10; // fix for your stash size
var stashY = 66; // ^ if you edited it ofc
var output = "";

//this sets automaticly a stash size from items.json (its not added anywhere yet cause we still use base stash)
function setPlayerStash(){
	let stashTPL = profile.getStashType();
	let X = (items.data[stashTPL]._props.Grids[0]._props.cellsH != 0) ? items.data[stashTPL]._props.Grids[0]._props.cellsH : 10;
	let Y = (items.data[stashTPL]._props.Grids[0]._props.cellsV != 0) ? items.data[stashTPL]._props.Grids[0]._props.cellsV : 66;
	stashX = X;
	stashY = Y;
}
function GenItemID() {
	return Math.floor(new Date() / 1000) + utility.getRandomInt(0, 999999999).toString();
}

function getItem(template) {
	for (let itm in items.data) {
		if (items.data[itm]._id && items.data[itm]._id == template) {
			let item = items.data[itm];
			return [true, item];
		}
	}

	return [false, {}];
}

function getSize(itemtpl, itemID, location) {
	let toDo = [itemID];
	let tmpItem = getItem(itemtpl)[1];

	let outX = 0, outY = 0, outL = 0, outR = 0, outU = 0, outD = 0, tmpL = 0, tmpR = 0, tmpU = 0, tmpD = 0;
	
	outX = tmpItem._props.Width;
	outY = tmpItem._props.Height;
	
	while (true) {
		if (toDo[0] != undefined) {
			for (let tmpKey in location) {
				if (location[tmpKey].parentId && location[tmpKey].parentId == toDo[0]) {
					toDo.push(location[tmpKey]._id);
					tmpItem = getItem(location[tmpKey]._tpl)[1];

					if (tmpItem._props.ExtraSizeLeft != undefined && tmpItem._props.ExtraSizeLeft > tmpL) {
						tmpL = tmpItem._props.ExtraSizeLeft;
					}
					
					if (tmpItem._props.ExtraSizeRight != undefined && tmpItem._props.ExtraSizeRight > tmpR) {
						tmpR = tmpItem._props.ExtraSizeRight;
					}
					
					if (tmpItem._props.ExtraSizeUp != undefined && tmpItem._props.ExtraSizeUp > tmpU) {
						tmpU = tmpItem._props.ExtraSizeUp;
					}
					
					if (tmpItem._props.ExtraSizeDown != undefined && tmpItem._props.ExtraSizeDown > tmpD) {
						tmpD = tmpItem._props.ExtraSizeDown;
					}
				}
			}

			outL += tmpL; outR += tmpR; outU += tmpU; outD += tmpD;
			tmpL = 0; tmpR = 0; tmpU = 0; tmpD = 0;
			toDo.splice(0, 1);

			continue;
		}

		break;
	}
	
	return [outX, outY, outL, outR, outU, outD];
}

function acceptQuest(tmpList, body) {
	tmpList.data[1].Quests.push({"qid": body.qid.toString(), "startTime": 1337, "status": 2}); // statuses seem as follow - 1 - not accepted | 2 - accepted | 3 - failed | 4 - completed
	profile.setCharacterData(tmpList);
	return "OK";
}

function completeQuest(tmpList, body) {
	for (let quest of tmpList.data[1].Quests) {
		if (quest.qid == body.qid) {
			quest.status = 4;
		}
	}

	//send reward to the profile : if quest_list.id == bodyqid then quest_list.succes

	profile.setCharacterData(tmpList);
	return "OK";
}

function questHandover(tmpList, body) {
	let counter = 0;
	let found = false;

 	for (let itemHandover of body.items) {
		counter += itemHandover.count;
		removeItem(tmpList, {Action: 'Remove', item: itemHandover.id});
	}

 	for (let backendCounter in tmpList.data[1].BackendCounters) {
		if (backendCounter == body.conditionId) {
			tmpList.data[1].BackendCounters[body.conditionId].value += counter;
			found = true;
		}
	}

 	if (!found) {
		tmpList.data[1].BackendCounters[body.conditionId] = {"id" : body.conditionId, "qid" : body.qid, "value" : counter};
	}

 	profile.setCharacterData(tmpList);
	return "OK";
}

function addNote(tmpList, body) {
	tmpList.data[1].Notes.Notes.push({"Time": body.note.Time, "Text": body.note.Text});
	profile.setCharacterData(tmpList);
	return "OK";
}

function editNode(tmpList, body) {
	tmpList.data[1].Notes.Notes[body.index] = {"Time": body.note.Time, "Text": body.note.Text};
	profile.setCharacterData(tmpList);
	return "OK";
}

function deleteNote(tmpList, body) {
	tmpList.data[1].Notes.Notes.splice(body.index, 1);
	profile.setCharacterData(tmpList);
	return "OK";
}

function moveItem(tmpList, body) {
	for (let item of tmpList.data[1].Inventory.items) {
		if (item._id && item._id == body.item) {
			item.parentId = body.to.id;
			item.slotId = body.to.container;
			//cartriges handler start
			if (body.to.container == 'cartridges'){
				let count_cartriges = 0;
				for (let item_ammo in tmpList.data[1].Inventory.items) {
					if(body.to.id == item_ammo.parentId){
						count_cartriges = count_cartriges + 1;
					}
				}
				body.to.location = count_cartriges;//wrong location for first cartrige
			}
			//cartriges handler end
			if (body.to.location) {
				item.location = body.to.location;
			} else {
				if (item.location) {
					delete item.location;
				}
			}
			
			profile.setCharacterData(tmpList);
			return "OK";
		}
	}

	return "";
}

function removeItem(tmpList, body) {
	var toDo = [body.item];

	while (true) {
		if (toDo[0] != undefined) {
			// needed else iterator may decide to jump over stuff
			while (true) {
				let tmpEmpty = "yes";

				for (let tmpKey in tmpList.data[1].Inventory.items) {
					if ((tmpList.data[1].Inventory.items[tmpKey].parentId && tmpList.data[1].Inventory.items[tmpKey].parentId == toDo[0])
					|| (tmpList.data[1].Inventory.items[tmpKey]._id && tmpList.data[1].Inventory.items[tmpKey]._id == toDo[0])) {
					
						output.data.items.del.push({"_id": tmpList.data[1].Inventory.items[tmpKey]._id});
						toDo.push(tmpList.data[1].Inventory.items[tmpKey]._id);
						tmpList.data[1].Inventory.items.splice(tmpKey, 1);
						
						tmpEmpty = "no";
					}
				}

				if (tmpEmpty == "yes") {
					break;
				};
			}

			toDo.splice(0, 1);
			continue;
		}

		break;
	}
	
	profile.setCharacterData(tmpList);
	return "OK";
}

function splitItem(tmpList, body) {
	for (let item of tmpList.data[1].Inventory.items) {
		if (item._id && item._id == body.item) {
			item.upd.StackObjectsCount -= body.count;
			
			let newItem = GenItemID();
			let location = body.container.location;
			if(typeof body.container.location == "undefined" && body.container.container === "cartridges"){
				let temp_counter = 0;
				for (let item_ammo in tmpList.data[1].Inventory.items) {
					if(item_ammo.parentId == body.container.id)
						temp_counter++;
				}
				location = temp_counter;//wrong location for first cartrige
			}
				output.data.items.new.push({"_id": newItem, "_tpl": item._tpl, "parentId": body.container.id, "slotId": body.container.container, "location": location, "upd": {"StackObjectsCount": body.count}});
				tmpList.data[1].Inventory.items.push({"_id": newItem, "_tpl": item._tpl, "parentId": body.container.id, "slotId": body.container.container, "location": location, "upd": {"StackObjectsCount": body.count}});
			profile.setCharacterData(tmpList);
			return "OK";
		}
	}

	return "";
}

function mergeItem(tmpList, body) {
	for (let key in tmpList.data[1].Inventory.items) {
		if (tmpList.data[1].Inventory.items[key]._id && tmpList.data[1].Inventory.items[key]._id == body.with) {
			for (let key2 in tmpList.data[1].Inventory.items) {
				if (tmpList.data[1].Inventory.items[key2]._id && tmpList.data[1].Inventory.items[key2]._id == body.item) {
					tmpList.data[1].Inventory.items[key].upd.StackObjectsCount = (tmpList.data[1].Inventory.items[key].upd.StackObjectsCount ? tmpList.data[1].Inventory.items[key].upd.StackObjectsCount : 1) + (tmpList.data[1].Inventory.items[key2].upd.StackObjectsCount ? tmpList.data[1].Inventory.items[key2].upd.StackObjectsCount : 1);
					output.data.items.del.push({"_id": tmpList.data[1].Inventory.items[key2]._id});
					tmpList.data[1].Inventory.items.splice(key2, 1);

					profile.setCharacterData(tmpList);
					return "OK";
				}
			}
		}
	}

	return "";
}

function foldItem(tmpList, body) {
	for (let item of tmpList.data[1].Inventory.items) {
		if (item._id && item._id == body.item) {
			item.upd.Foldable = {"Folded": body.value};

			profile.setCharacterData(tmpList);
			return "OK";
		}
	}

	return "";
}

function toggleItem(tmpList, body) {
	for (let item of tmpList.data[1].Inventory.items) {
		if (item._id && item._id == body.item) {
			item.upd.Togglable = {"On": body.value};

			profile.setCharacterData(tmpList);
			return "OK";
		}
	}

	return "";
}

function tagItem(tmpList, body) {
	for (let item of tmpList.data[1].Inventory.items) {
		if (item._id && item._id == body.item) {
			item.upd.Tag = {"Color": body.TagColor, "Name": body.TagName};

			profile.setCharacterData(tmpList);
			return "OK";
		}
	}

	return "";
}

function bindItem(tmpList, body) {
	for (let index in tmpList.data[1].Inventory.fastPanel) { 
		// if binded items is already in fastPanel 
		if (tmpList.data[1].Inventory.fastPanel[index] == body.item) { 
			// we need to remove index before re-adding somewhere else  
			tmpList.data[1].Inventory.fastPanel[index] = ""; 
		} 
	} 
 
	tmpList.data[1].Inventory.fastPanel[body.index] = body.item; 
	profile.setCharacterData(tmpList); 
	return "OK"; 
}

function eatItem(tmpList, body) {
	for (let item of tmpList.data[1].Inventory.items) {
		if (item._id == body.item) {
			let effects = getItem(item._tpl)[1]._props.effects_health;
		}
	}

	let hydration = tmpList.data[1].Health.Hydration;
	let energy = tmpList.data[1].Health.Energy;

 	hydration.Current += effects.hydration.value;
	energy.Current += effects.energy.value;

 	if (hydration.Current > hydration.Maximum) {
		hydration.Current = hydration.Maximum;
	}
	
	if (energy.Current > energy.Maximum) {
		energy.Current = energy.Maximum;
	}

 	profile.setCharacterData(tmpList);
 	removeItem(tmpList, {Action: 'Remove', item: body.item});
 	return "OK";
}

function healPlayer(tmpList, body) {
	// healing body part
	for (let bdpart in tmpList.data[1].Health.BodyParts) {
		if (bdpart == body.part) {
			tmpList.data[1].Health.BodyParts[bdpart].Health.Current += body.count;
		}
	}

	// update medkit used (hpresource)
	for (let item of tmpList.data[1].Inventory.items) {
		// find the medkit in the inventory
		if (item._id == body.item) {
			if (typeof item.upd.MedKit === "undefined") {
				let maxhp = getItem(item._tpl)[1]._props.MaxHpResource;
				
				item.upd.MedKit = {"HpResource": maxhp - body.count};
			} else {
				item.upd.MedKit.HpResource -= body.count;
			}

			profile.setCharacterData(tmpList);

			// remove medkit if its empty
			if (item.upd.MedKit.HpResource == 0 ) {
				removeItem(tmpList, {Action: 'Remove', item: body.item});
			}
		}
	}
	
	return "OK";
}

function addToWishList(tmpList, body) {
	// check if the item is already in wishlist
	for (let item in tmpList.data[1].Wishlist) {
		console.log(item);

		// don't add the item
		if (tmpList.data[1].WishList[item].tid == body.templateId) {
			return "OK";
		}
	}

	// add the item to the wishlist
	tmpList.data[1].WishList.push({"tid": body.templateId});
	profile.setCharacterData(tmpList);
	return "OK";
}

function removeFromWishList(tmpList, body) {
	// remove the item if it exists
	for (let item in tmpList.data[1].Wishlist) {
		console.log(item);

		if (tmpList.data[1].WishList[item].tid == body.templateId) {
			tmpList.data[1].WishList.splice(item, 1);
		}
	}

	profile.setCharacterData(tmpList);
	return "OK";
}

function examineItem(tmpList, body) {
	let returned = "BAD";

	// trader inventory
	if (tmpTrader) {
		for (let item of tmpTrader.data) {
			if (item._id == body.item) {
				console.log("Found trader with examined item: " + item._id);
				returned = item._tpl;
				break;
			}
		}
	}

	// player inventory
	if (returned == "BAD") {
		for (let item of tmpList.data[1].Inventory.items) {
			if (item._id == body.item) {
				console.log("Found equipment examing item: " + item._id);
				returned = item._tpl;
				break;
			}
		}
	}

	// item not found
	if (returned == "BAD") {
		console.log("Cannot find proper item. Stopped.", "white", "red");
		return "BAD";
	}

	// item found
	console.log("EXAMINED: " + returned, "white", "green");
	tmpList.data[1].Encyclopedia[returned] = true;
	profile.setCharacterData(tmpList);

	return "OK";
}
function transferItem(tmpList, body) {
	for (let item of tmpList.data[1].Inventory.items) {
			if (item._id == body.item) {
				if(item.upd.StackObjectsCount > body.count)
					item.upd.StackObjectsCount -= body.count;
				else 
					item.splice(item, 1);
			}
			if(item._id == body.with){
				item.upd.StackObjectsCount += body.count;
			}
	}
	profile.setCharacterData(tmpList);
	return "OK";
}

function recheckInventoryFreeSpace(tmpList) {
	let Stash2D = Array(stashY).fill(0).map(x => Array(stashX).fill(0));

	for (let item of tmpList.data[1].Inventory.items) {
		// hideout
		if (item.parentId == "5c71b934354682353958ea35" && item.location != undefined) {
			let tmpItem = getItem(item._tpl)[1];
			let tmpSize = getSize(item._tpl, item._id, tmpList.data[1].Inventory.items);
			
			//			x			L				r
			let iW = tmpSize[0] + tmpSize[2] + tmpSize[3];
			
			//			y			u				d
			let iH = tmpSize[1] + tmpSize[4] + tmpSize[5];
			let fH = (item.location.rotation == "Vertical" ? iW : iH);
			let fW = (item.location.rotation == "Vertical" ? iH : iW);
			
			for (let x = 0; x < fH; x++) {
				Stash2D[item.location.y + x].fill(1, item.location.x, item.location.x + fW);
			}
		}
	}

	return Stash2D;
}

function getCurrency(currency) {
	// get currency
	switch (currency) {
		case "RUB":
			return "5449016a4bdc2d6f028b456f";

		case "EUR":
			return "5696686a4bdc2da3298b456a";

		case "USD":
			return "569668774bdc2da2298b4568";
	}

	// currency not found
	console.log("Currency not found, fallback to RUB", "white", "yellow");
	return "5449016a4bdc2d6f028b456f";
}

function payMoney(tmpList, amount, body) {
	let tmpTraderInfo = trader.get(body.tid.replace(/[^a-zA-Z0-9]/g, ''));
	let currency = getCurrency(tmpTraderInfo.data.currency);

	console.log(tmpTraderInfo);

	for (let item of tmpList.data[1].Inventory.items) {
		if (item._tpl == currency && item.upd.StackObjectsCount >= amount) {
			item.upd.StackObjectsCount -= amount;
			profile.setCharacterData(tmpList);
			console.log("Money received: " + amount + " " + tmpTraderInfo.data.currency, "white", "green");

            return true;
		}
	}

	console.log("No money found", "white", "red");
	return false;
}

function getMoney(tmpList, amount, body) {
	let tmpTraderInfo = trader.get(body.tid.replace(/[^a-zA-Z0-9]/g, ''));
	let currency = getCurrency(tmpTraderInfo.data.currency);

	console.log(tmpTraderInfo);

	for (let item of tmpList.data[1].Inventory.items) {
		if (item._tpl == currency) {
			item.upd.StackObjectsCount += amount;
			profile.setCharacterData(tmpList);
			console.log("Money received: " + amount + " " + tmpTraderInfo.data.currency, "white", "green");

			return true;
		}
	}

	console.log("No money found", "white", "red");
	return false;
}

function buyItem(tmpList, tmpUserTrader, prices, body) {
	let tmpTrader = trader.getAssort(body.tid.replace(/[^a-zA-Z0-9]/g, ''));
	let money = tmpTrader.data.barter_scheme[body.item_id][0][0].count * body.count;

	// print debug information
	console.log("Item:");
	console.log(body.scheme_items);

	// pay the item	
	if (!payMoney(tmpList, money, body)) {
		console.log("no money found");
		return "";
	}
		
	for (let item of tmpTrader.data.items) {
		if (item._id && item._id == body.item_id) {
			let MaxStacks = 1;
			let StacksValue = [];

			let tmpItem = getItem(item._tpl)[1];

			// split stacks if the size is higher than allowed
			if (body.count > tmpItem._props.StackMaxSize) {
				let count = body.count;
					
				//maxstacks if not divided by then +1
				let calc = body.count - (Math.floor(body.count / tmpItem._props.StackMaxSize) * tmpItem._props.StackMaxSize);
				MaxStacks = (calc > 0)? MaxStacks + Math.floor(count / tmpItem._props.StackMaxSize):Math.floor(count / tmpItem._props.StackMaxSize);

				for (let sv = 0; sv < MaxStacks; sv++){
					if (count > 0) {
						if (count > tmpItem._props.StackMaxSize) {
							count = count - tmpItem._props.StackMaxSize;
							StacksValue[sv] = tmpItem._props.StackMaxSize;
						} else {
							StacksValue[sv] = count;
						}
					}
				}
			} else {
				StacksValue[0] = body.count;
			}

			// for each stack
			for (let stacks = 0; stacks < MaxStacks; stacks++){
				let tmpSizeX = 0;
				let tmpSizeY = 0;
				let badSlot = "no";
				let addedProperly = false;
				let tmpSize = getSize(item._tpl, item._id, tmpTrader.data.item);
				let StashFS_2D = recheckInventoryFreeSpace(tmpList);					
				
				tmpSizeX = tmpSize[0] + tmpSize[2] + tmpSize[3];
				tmpSizeY = tmpSize[1] + tmpSize[4] + tmpSize[5];
					
				for (let y = 0; y < stashY; y++) {
					for (let x = 0; x < stashX; x++) {
						badSlot = "no";

						for (let itemY = 0; itemY < tmpSizeY; itemY++) {
							for (let itemX = 0; itemX < tmpSizeX; itemX++) {
								if (StashFS_2D[y + itemY][x + itemX] != 0) {
									badSlot = "yes";
									break;
								}
							}

							if (badSlot == "yes") {
								break;
							}
						}

						if (badSlot == "no") {
							let newItem = GenItemID();
							let toDo = [[item._id, newItem]];

							output.data.items.new.push({"_id": newItem, "_tpl": item._tpl, "parentId": "5c71b934354682353958ea35", "slotId": "hideout", "location": {"x": x, "y": y, "r": 0}, "upd": {"StackObjectsCount": StacksValue[stacks]}});
							tmpList.data[1].Inventory.items.push({"_id": newItem, "_tpl": item._tpl, "parentId": "5c71b934354682353958ea35", "slotId": "hideout", "location": {"x": x, "y": y, "r": 0}, "upd": {"StackObjectsCount": StacksValue[stacks]}});
							tmpUserTrader.data[newItem] = [[{"_tpl": item._tpl, "count": prices.data.barter_scheme[item._tpl][0][0].count}]];
							
							while (true) {
								if (toDo[0] != undefined) {
									for (let tmpKey in tmpTrader.data.items) {
										if (tmpTrader.data.items[tmpKey].parentId && tmpTrader.data.items[tmpKey].parentId == toDo[0][0]) {
											newItem = GenItemID();

											let SlotID = tmpTrader.data.items[tmpKey].slotId
                                            
											if (SlotID == "hideout"){
                                                output.data.items.new.push({"_id": newItem, "_tpl": tmpTrader.data.items[tmpKey]._tpl, "parentId": toDo[0][1], "slotId": SlotID, "location": {"x": x, "y": y, "r": 0}, "upd": {"StackObjectsCount": StacksValue[stacks]}});
                                                tmpList.data[1].Inventory.items.push({"_id": newItem, "_tpl": tmpTrader.data.items[tmpKey]._tpl, "parentId": toDo[0][1], "slotId": tmpTrader.data.items[tmpKey].slotId, "location": {"x": x, "y": y, "r": 0}, "upd": {"StackObjectsCount": StacksValue[stacks]}});
                                            } else {
                                                output.data.items.new.push({"_id": newItem, "_tpl": tmpTrader.data.items[tmpKey]._tpl, "parentId": toDo[0][1], "slotId": SlotID, "upd": {"StackObjectsCount": StacksValue[stacks]}});
                                                tmpList.data[1].Inventory.items.push({"_id": newItem, "_tpl": tmpTrader.data.items[tmpKey]._tpl, "parentId": toDo[0][1], "slotId": tmpTrader.data.items[tmpKey].slotId, "upd": {"StackObjectsCount": StacksValue[stacks]}});
                                            }

                                            toDo.push([tmpTrader.data.items[tmpKey]._id, newItem]);
										}
									}

									toDo.splice(0, 1);
									continue;
								}

								break;
							}

							addedProperly = true;
							break;
						}
					}
						
					if (addedProperly) {
						break;
					}
				}
			}	
			
			// assumes addedProperly is always true
			profile.setPurchasesData(tmpUserTrader);
			profile.setCharacterData(tmpList);
			return "OK";
		}
	}

	return "";
}

function sellItem(tmpList, tmpUserTrader, prices, body) {
	let money = 0;

	// print debug information
	console.log("Items:");
	console.log(body.items);

	// find the items
	for (let item of tmpList.data[1].Inventory.items) {
		for (let i in body.items) {
			let checkID = body.items[i].id.replace(' clone', '').replace(' clon', '');

			// item found
			if (item && item._id == checkID) {
				// add money to return to the player
				money += prices.data.barter_scheme[item._tpl][0][0].count * body.items[i].count;
				
				if (removeItem(tmpList, {Action: 'Remove', item: checkID}) == "OK") {
					delete tmpUserTrader.data[checkID];
				}
			}
		}
	}

	// get money the item
	if (!getMoney(tmpList, money, body)) {
		return "";
	}
				
	profile.setPurchasesData(tmpUserTrader);
	return "OK";
}

function confirmTrading(tmpList, body)  {
	let tmpUserTrader = profile.getPurchasesData();
	let prices = trader.getAssort("everythingTrader");

	// buying
	if (body.type == "buy_from_trader")  {
		return buyItem(tmpList, tmpUserTrader, prices, body);
	}

	// selling
	if (body.type == "sell_to_trader") {				
		return sellItem(tmpList, tmpUserTrader, prices, body);
	}

	return "";
}

function confirmRagfairTrading(tmpList, body) {
	body.Action = "TradingConfirm";
	body.type = "buy_from_trader";
	body.tid = "everythingTrader";
	body.item_id = body.offerId;
	body.scheme_id = 0;
	body.scheme_items = body.items;

	if (confirmTrading(tmpList, body) == "OK" ) {
		return "OK";
	} else {
		return "error";
	}
}

function getOutput() {
	return output;
}

function resetOutput() {
	output = JSON.parse('{"err":0, "errmsg":null, "data":{"items":{"new":[], "change":[], "del":[]}, "badRequest":[], "quests":[], "ragFairOffers":[]}}');
}

function handleMoving(body) {	
	let tmpList = profile.getCharacterData();

	switch(body.Action) {
		case "QuestAccept":
			return acceptQuest(tmpList, body);

		case "QuestComplete":
			return completeQuest(tmpList, body);

		case "QuestHandover":
			return questHandover(tmpList, body);

		case "AddNote":
			return addNote(tmpList, body);

		case "EditNote":
			return editNode(tmpList, body);

		case "DeleteNote":
			return deleteNote(tmpList, body);

		case "Move":
			return moveItem(tmpList, body);

		case "Remove":
			return removeItem(tmpList, body);

		case "Split":
			return splitItem(tmpList, body);

		case "Merge":
			return mergeItem(tmpList, body);
		
		case "Fold":
			return foldItem(tmpList, body);

		case "Toggle":
			return toggleItem(tmpList, body);
            
		case "Tag":
			return tagItem(tmpList, body);

		case "Bind":
			return bindItem(tmpList, body);

		case "Eat":
			return eatItem(tmpList, body);

		case "Heal":
			return healPlayer(tmpList, body);
		
		case "Examine":
			return examineItem(tmpList, body);

		case "Transfer":
			return transferItem(tmpList, body);

		case "AddToWishList":
			return addToWishList(tmpList, body);

		case "RemoveFromWishList":
			return removeFromWishList(tmpList, body);

		case "TradingConfirm":
			return confirmTrading(tmpList, body);

		case "RagFairBuyOffer":
			return confirmRagfairTrading(tmpList, body);

		default:
			console.log("UNHANDLED ACTION:" + body.Action, "white", "red");
            return "";
	}
}

function moving(info) {
	let output = "";
		
	// handle all items
	for (let i = 0; i < info.data.length; i++) {
		output = handleMoving(info.data[i]);
	}

	// return items
	if (output == "OK") {
		return JSON.stringify(getOutput());
	}

	return output;    
}

module.exports.getOutput = getOutput;
module.exports.resetOutput = resetOutput;
module.exports.moving = moving;
module.exports.removeItem = removeItem;