"use strict";

var utility = require('./utility.js');

var stashX = 10; // fix for your stash size
var stashY = 66; // ^ if you edited it ofc
var tmpSize = {};
var tmpItem = {};
var toDo = [];
var output = "";
var items = JSON.parse(utility.readJson('data/items.json'));

function GenItemID() {
	return Math.floor(new Date() / 1000) + utility.getRandomInt(0, 999999999).toString();
}

function getItem(template) {
	for (var itm in items.data) {
		if (items.data[itm]._id && items.data[itm]._id == template) {
			var item = items.data[itm];
			return [true, item];
		}
	}

	return [false, {}];
}

function getSize(itemtpl, itemID, location) {
	toDo = [itemID];
	tmpItem = getItem(itemtpl);
	
	if (!tmpItem[0]) {
		console.log("SHITS FUCKED GETSIZE1", itemID);
		return;
	} else {
		tmpItem = tmpItem[1];
	}

	var outX = 0, outY = 0, outL = 0, outR = 0, outU = 0, outD = 0, tmpL = 0, tmpR = 0, tmpU = 0, tmpD = 0;
	
	outX = tmpItem._props.Width;
	outY = tmpItem._props.Height;
	
	while (true) {
		if (toDo[0] != undefined) {
			for (var tmpKey in location) {
				if (location[tmpKey].parentId && location[tmpKey].parentId == toDo[0]) {
					toDo.push(location[tmpKey]._id);
					tmpItem = getItem(location[tmpKey]._tpl);

					if (!tmpItem[0]) {
						console.log("SHITS FUCKED GETSIZE2", tmpItem, location[tmpKey]._tpl);
						return "SHITS_FUCKED_GETSIZE2";
					} else {
						tmpItem = tmpItem[1];
					}

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
	var tmpList = JSON.parse(utility.readJson('data/list.json'));

	tmpList.data[1].Quests.push({"qid": body.qid.toString(), "startTime": 1337, "status": 2}); // statuses seem as follow - 1 - not accepted | 2 - accepted | 3 - failed | 4 - completed
	
	utility.writeJson('data/list.json', tmpList);
	return "OK";
}

function completeQuest(tmpList, body) {
	var tmpList = JSON.parse(utility.readJson('data/list.json'));

	tmpList.data[1].Quests.forEach(function(quest) {
		if (quest.qid == body.qid) {
			quest.status = 4;
		}
	});

	//send reward to the profile : if quest_list.id == bodyqid then quest_list.succes

	utility.writeJson('data/list.json', tmpList);
	return "OK";
}

function moveItem(tmpList, body) {
	for (var key in tmpList.data[1].Inventory.items) {
		if (tmpList.data[1].Inventory.items[key]._id && tmpList.data[1].Inventory.items[key]._id == body.item) {
			tmpList.data[1].Inventory.items[key].parentId = body.to.id;
			tmpList.data[1].Inventory.items[key].slotId = body.to.container;
			
			if (body.to.location) {
				tmpList.data[1].Inventory.items[key].location = body.to.location;
			} else {
				if (tmpList.data[1].Inventory.items[key].location) {
					delete tmpList.data[1].Inventory.items[key].location;
				}
			}
			
			utility.writeJson('data/list.json', tmpList);
			return "OK";
		}
	}

	return "";
}

function removeItem(tmpList, body) {
	toDo = [body.item];

	while (true) {
		if (toDo[0] != undefined) {
			while (true) { // needed else iterator may decide to jump over stuff
				var tmpEmpty = "yes";

				for (var tmpKey in tmpList.data[1].Inventory.items) {
					if ((tmpList.data[1].Inventory.items[tmpKey].parentId && tmpList.data[1].Inventory.items[tmpKey].parentId == toDo[0]) || (tmpList.data[1].Inventory.items[tmpKey]._id && tmpList.data[1].Inventory.items[tmpKey]._id == toDo[0])) {
						output.data.items.del.push({"_id": tmpList.data[1].Inventory.items[tmpKey]._id});
						toDo.push(tmpList.data[1].Inventory.items[tmpKey]._id);
						tmpList.data[1].Inventory.items.splice(tmpKey, 1);
						tmpEmpty = "no";
					}
				}

				if (tmpEmpty == "yes"){
					break;
				};
			}

			toDo.splice(0, 1);
			continue;
		}

		break;
	}
	
	utility.writeJson('data/list.json', tmpList);
	return "OK";
}

function splitItem(tmpList, body) {
	for (var key in tmpList.data[1].Inventory.items) {
		if (tmpList.data[1].Inventory.items[key]._id && tmpList.data[1].Inventory.items[key]._id == body.item) {
			tmpList.data[1].Inventory.items[key].upd.StackObjectsCount -= body.count;
			
			var newItem = GenItemID();
			
			output.data.items.new.push({"_id": newItem, "_tpl": tmpList.data[1].Inventory.items[key]._tpl, "parentId": body.container.id, "slotId": body.container.container, "location": body.container.location, "upd": {"StackObjectsCount": body.count}});
			tmpList.data[1].Inventory.items.push({"_id": newItem, "_tpl": tmpList.data[1].Inventory.items[key]._tpl, "parentId": body.container.id, "slotId": body.container.container, "location": body.container.location, "upd": {"StackObjectsCount": body.count}});
			
			utility.writeJson('data/list.json', tmpList);
			return "OK";
		}
	}

	return "";
}

function mergeItem(tmpList, body) {
	for (var key in tmpList.data[1].Inventory.items) {
		if (tmpList.data[1].Inventory.items[key]._id && tmpList.data[1].Inventory.items[key]._id == body.with) {
			for (var key2 in tmpList.data[1].Inventory.items) {
				if (tmpList.data[1].Inventory.items[key2]._id && tmpList.data[1].Inventory.items[key2]._id == body.item) {
					tmpList.data[1].Inventory.items[key].upd.StackObjectsCount = (tmpList.data[1].Inventory.items[key].upd.StackObjectsCount ? tmpList.data[1].Inventory.items[key].upd.StackObjectsCount : 1) + (tmpList.data[1].Inventory.items[key2].upd.StackObjectsCount ? tmpList.data[1].Inventory.items[key2].upd.StackObjectsCount : 1);
					output.data.items.del.push({"_id": tmpList.data[1].Inventory.items[key2]._id});
					tmpList.data[1].Inventory.items.splice(key2, 1);

					utility.writeJson('data/list.json', tmpList);
					return "OK";
				}
			}
		}
	}

	return "";
}

function foldItem(tmpList, body) {
	for (var key in tmpList.data[1].Inventory.items) {
		if (tmpList.data[1].Inventory.items[key]._id && tmpList.data[1].Inventory.items[key]._id == body.item) {
			tmpList.data[1].Inventory.items[key].upd.Foldable = {"Folded": body.value};

			utility.writeJson('data/list.json', tmpList);
			return "OK";
		}
	}

	return "";
}

function toggleItem(tmpList, body) {
	for (var key in tmpList.data[1].Inventory.items) {
		if (tmpList.data[1].Inventory.items[key]._id && tmpList.data[1].Inventory.items[key]._id == body.item) {
			tmpList.data[1].Inventory.items[key].upd.Togglable = {"On": body.value};

			utility.writeJson('data/list.json', tmpList);
			return "OK";
		}
	}

	return "";
}

function confirmTrading(tmpList, body) {
	if (body.type == "buy_from_trader") {
		var tmpTrader = JSON.parse(utility.readJson('data/assort/' + body.tid.replace(/[^a-zA-Z0-9]/g, '') + '.json'));
		for (var key in tmpTrader.data.items) {
			if (tmpTrader.data.items[key]._id && tmpTrader.data.items[key]._id == body.item_id) {
				var Stash2D = Array(stashY).fill(0).map(x => Array(stashX).fill(0));
				
				for (var key2 in tmpList.data[1].Inventory.items) {
					if (tmpList.data[1].Inventory.items[key2].parentId == "5c71b934354682353958ea35" && tmpList.data[1].Inventory.items[key2].location != undefined) { // hideout
						tmpItem = getItem(tmpList.data[1].Inventory.items[key2]._tpl);
						
						if (!tmpItem[0]) {
							console.log("SHITS FUCKED");
							return "SHITS_FUCKED";
						} else {
							tmpItem = tmpItem[1];
						}

						tmpSize = getSize(tmpList.data[1].Inventory.items[key2]._tpl,tmpList.data[1].Inventory.items[key2]._id, tmpList.data[1].Inventory.items);
						
						//			x			L				r
						var iW = tmpSize[0] + tmpSize[2] + tmpSize[3];

						//			y			u				d
						var iH = tmpSize[1] + tmpSize[4] + tmpSize[5];
						var fH = (tmpList.data[1].Inventory.items[key2].location.rotation == "Vertical" ? iW : iH);
						var fW = (tmpList.data[1].Inventory.items[key2].location.rotation == "Vertical" ? iH : iW);
						
						for (var x = 0; x < fH; x++) {
							Stash2D[tmpList.data[1].Inventory.items[key2].location.y + x].fill(1, tmpList.data[1].Inventory.items[key2].location.x, tmpList.data[1].Inventory.items[key2].location.x + fW);
						}
					}
				}

				var tmpSizeX = 0; var tmpSizeY = 0;
				
				tmpItem = getItem(tmpTrader.data.items[key]._tpl);
				
				if (!tmpItem[0]) {
					console.log("SHITS FUCKED BUY_FROM_TRADER");
					return "SHITS_FUCKED_BUY_FROM_TRADER";
				} else {
					tmpItem = tmpItem[1];
				}

				tmpSize = getSize(tmpTrader.data.items[key]._tpl,tmpTrader.data.items[key]._id, tmpTrader.data.items);
				
				if (body.count > tmpItem._props.StackMaxSize) {
					body.count = tmpItem._props.StackMaxSize;
				};
				
				tmpSizeX = tmpSize[0] + tmpSize[2] + tmpSize[3];
				tmpSizeY = tmpSize[1] + tmpSize[4] + tmpSize[5];
				console.log(tmpSizeX, tmpSizeY);

				var badSlot = "no";
				
				console.log(Stash2D);

				for (var y = 0; y < stashY; y++) {
					for (var x = 0; x < stashX; x++) {
						badSlot = "no";
						
						for (var itemY = 0; itemY < tmpSizeY; itemY++) {
							for (var itemX = 0; itemX < tmpSizeX; itemX++) {
								if (Stash2D[y + itemY][x + itemX] != 0) {
									badSlot = "yes";
									break;
								}
							}

							if (badSlot == "yes") {
								break;
							}
						}

						if (badSlot == "no") {
							var newItem = GenItemID();

							output.data.items.new.push({"_id": newItem, "_tpl": tmpTrader.data.items[key]._tpl, "parentId": "5c71b934354682353958ea35", "slotId": "hideout", "location": {"x": x, "y": y, "r": 0}, "upd": {"StackObjectsCount": body.count}});
							tmpList.data[1].Inventory.items.push({"_id": newItem, "_tpl": tmpTrader.data.items[key]._tpl, "parentId": "5c71b934354682353958ea35", "slotId": "hideout", "location": {"x": x, "y": y, "r": 0}, "upd": {"StackObjectsCount": body.count}});
							toDo = [[tmpTrader.data.items[key]._id, newItem]];
							
							while (true) {
								if (toDo[0] != undefined) {
									for (var tmpKey in tmpTrader.data.items) {
										if (tmpTrader.data.items[tmpKey].parentId && tmpTrader.data.items[tmpKey].parentId == toDo[0][0]) {
											newItem = GenItemID();
											output.data.items.new.push({"_id": newItem, "_tpl": tmpTrader.data.items[tmpKey]._tpl, "parentId": toDo[0][1], "slotId": tmpTrader.data.items[tmpKey].slotId, "location": {"x": x, "y": y, "r": 0}, "upd": {"StackObjectsCount": body.count}});
											tmpList.data[1].Inventory.items.push({"_id": newItem, "_tpl": tmpTrader.data.items[tmpKey]._tpl, "parentId": toDo[0][1], "slotId": tmpTrader.data.items[tmpKey].slotId, "location": {"x": x, "y": y, "r": 0}, "upd": {"StackObjectsCount": body.count}});
											toDo.push([tmpTrader.data.items[tmpKey]._id, newItem]);
										}
									}

									toDo.splice(0, 1);
									continue;
								}

								break;
							}

							utility.writeJson('data/list.json', tmpList);
							return "OK";
						}
					}
				}

				break;
			}
		}
	}

	return "";
}

function confirmRagfairTrading(tmpList , body)
{
	//confirmTrading copy paste and remove condition doesn't work ... :/
}

function getOutput() {
	return output;
}

function resetOutput() {
	output = JSON.parse('{"err":0, "errmsg":null, "data":{"items":{"new":[], "change":[], "del":[]}, "badRequest":[], "quests":[], "ragFairOffers":[]}}');
}

function handleMoving(body) {
	console.log(body);
	
	var tmpList = JSON.parse(utility.readJson('data/list.json'));

	switch(body.Action) {
		case "QuestAccept":
			return acceptQuest(tmpList, body);

		case "QuestComplete":
			return completeQuest(tmpList, body);

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
            
		case "TradingConfirm":
			return confirmTrading(tmpList, body);

		case "RagFairBuyOffer":
			return confirmRagfairTrading(tmpList, body);

		default:
			console.log("UNHANDLED ACTION");
            return "";
	}
}

module.exports.getOutput = getOutput;
module.exports.resetOutput = resetOutput;
module.exports.handleMoving = handleMoving;