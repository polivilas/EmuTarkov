"use strict";

const utility = require('./utility.js');
const profile = require('./profile.js');
const trader = require('./trader.js');

var items = PrepareItemsList();
var templates = JSON.parse(utility.readJson('data/configs/templates.json'));
var AllQuests = JSON.parse(utility.readJson('data/configs/questList.json'));
var stashX = 10; // fix for your stash size
var stashY = 66; // ^ if you edited it ofc
var output = "";
// --------------------------------------------------------------------------------------------------------------------- \\

function PrepareItemsList(){
	let base = JSON.parse(utility.readJson('data/configs/items.json'));
	let newI = JSON.parse(utility.readJson('data/configs/items_custom.json'));
	for(let i of newI){
		base.data[i._id] = i;
	}
	return base;
}
function recheckInventoryFreeSpace(tmpList) 
{ // recalculate stach taken place
	let Stash2D = Array(stashY).fill(0).map(x => Array(stashX).fill(0));
	for (let item of tmpList.data[1].Inventory.items) {
		// hideout  // added proper stash ID older was "5c71b934354682353958ea35"
		if (item.parentId == tmpList.data[1].Inventory.stash && item.location != undefined) {
			let tmpItem = getItem(item._tpl)[1];
			let tmpSize = getSize(item._tpl, item._id, tmpList.data[1].Inventory.items);
			//			x	
			let iW = tmpSize[0];
			//			y	
			let iH = tmpSize[1];
			let fH = (item.location.rotation == "Vertical" ? iW : iH);
			let fW = (item.location.rotation == "Vertical" ? iH : iW);
			
			for (let y = 0; y < fH; y++) {
				if(item.location.y + y <= stashY && item.location.x + fW <= stashX){ // fixed filling out of bound
					let FillTo = ((item.location.x + fW >= stashX)?stashX:item.location.x + fW);
					Stash2D[item.location.y + y].fill(1, item.location.x, FillTo);
				}
			}
		}
	}
	console.log(Stash2D);
	return Stash2D;
}
function getCurrency(currency) 
{ // Translate currency_name to _tpl
	// get currency
	switch (currency) {
		case "EUR":
			return "5696686a4bdc2da3298b456a";

		case "USD":
			return "569668774bdc2da2298b4568";
			
		default:
			return "5449016a4bdc2d6f028b456f"; // RUB is here // set by default
	}
}
function inRUB(value, currency) 
{ // convert price to RUB
	for(let temp in templates.data)
	{
		if(templates.data[temp].Id == currency)
		{
			return value * templates.data[temp].Price;
		}
	}
	return value;
}
function fromRUB(value, currency) 
{ // convert price from RUB
	for(let temp in templates.data)
	{
		if(templates.data[temp].Id == currency)
		{
			return value / templates.data[temp].Price;
		}
	}
	return value;
}
function payMoney(tmpList, moneyObject, body, trad = "") 
{ // take money and insert items into return to server request
	let value = 0;
	for (let item of tmpList.data[1].Inventory.items) {
		for (let i = 0; i < moneyObject.length; i++){
			if(typeof item.upd != "undefined")
				if (item._id == moneyObject[i]._id && item.upd.StackObjectsCount > body.scheme_items[i].count) {
					value += body.scheme_items[i].count;
					item.upd.StackObjectsCount -= body.scheme_items[i].count;
					output.data.items.change.push({"_id": item._id, "_tpl": item._tpl, "parentId": item.parentId, "slotId": item.slotId, "location": item.location, "upd": {"StackObjectsCount": item.upd.StackObjectsCount}});
				} else if (item._id == moneyObject[i]._id && item.upd.StackObjectsCount == body.scheme_items[i].count) {
					value += body.scheme_items[i].count;
					delete tmpList.data[1].Inventory.items[item];
					output.data.items.del.push({ "_id": item._id });
				} else if (item._id == moneyObject[i].id && item.upd.StackObjectsCount < body.scheme_items[i].count)
					return false;
		}
	}
	// this script will not override data if something goes wrong aka return false;
	// keep track of trader changing
	if(body.tid != "91_everythingTrader" && body.tid != "92_SecretTrader")
		if(trad == ""){
			let tmpTrader = trader.get(body.tid);
			let traderCurrency = tmpTrader.data.currency;
			let traderLoyalty = tmpTrader.data.loyalty;
			value = inRUB(value, traderCurrency);
			traderLoyalty.currentSalesSum += value;
			trader.get(body.tid).data.loyalty = traderLoyalty;
			let newLvlTraders = trader.lvlUp(tmpList.data[1].Info.Level);
			for (let lvlUpTrader in newLvlTraders) {
				tmpList.data[1].TraderStandings[lvlUpTrader].currentLevel = trader.get(lvlUpTrader).data.loyalty.currentLevel;
			}
			// if everything goes OK save profile
			// update trader data also in profile
			
				tmpList.data[1].TraderStandings[body.tid].currentSalesSum = traderLoyalty.currentSalesSum;
		}
	profile.setCharacterData(tmpList);
	console.log("Items taken. Status OK.", "white", "green",true);
	return true;
}
function findMoney(tmpList, barter_itemID) 
{ // find required items to take after buying (handles multiple items)
	let prepareReturn = [];
		for (let item of tmpList.data[1].Inventory.items)
			for (let i = 0; i < barter_itemID.length; i++)
				if (item._id == barter_itemID[i])
					prepareReturn[i] = item;
	return prepareReturn; // if none return []
}
function getMoney(tmpList, amount, body, output) 
{ // receive money back after selling
	let tmpTraderInfo = trader.get(body.tid);
	let currency = getCurrency(tmpTraderInfo.data.currency);
	let value = inRUB(amount, currency);
	let calcAmount = fromRUB(amount, currency);
	let skip = false;
	for (let item of tmpList.data[1].Inventory.items) {
		if (item._tpl == currency) {
			item.upd.StackObjectsCount += calcAmount;
			output.data.items.change.push(item);
			console.log("Money received: " + calcAmount + " " + tmpTraderInfo.data.currency, "white", "green",true);
			skip = true;
		}
		if(skip)
			break;
	}
	if(!skip)
	{
		let StashFS_2D = recheckInventoryFreeSpace(tmpList);					
		//creating item tho
		addedMoney:
		for (let My = 0; My <= stashY; My++) 
		{
			for (let Mx = 0; Mx <= stashX; Mx++) 
			{
				let skip0 = false
				if (StashFS_2D[My][Mx] != 0) 
				{
					skip0 = true;
				}
				if(!skip0)
				{
					let MoneyItem = 
					{
						"_id": GenItemID(), 
						"_tpl": currency, 
						"parentId": tmpList.data[1].Inventory.stash, 
						"slotId": "hideout", 
						"location": {x: Mx,y: My,r: "Horizontal"}, 
						"upd": {"StackObjectsCount": calcAmount}
					};
					tmpList.data[1].Inventory.items.push(MoneyItem);
					output.data.items.new.push(MoneyItem);
					console.log("Money created: " + calcAmount + " " + tmpTraderInfo.data.currency, "white", "green",true);
					break addedMoney;
				}
				
			}
		}
	}
	let traderLoyalty = tmpTraderInfo.data.loyalty;
	traderLoyalty.currentSalesSum += value;
	trader.get(body.tid).data.loyalty = traderLoyalty;
	let newLvlTraders =  trader.lvlUp(tmpList.data[1].Info.Level);
	for (let lvlUpTrader in newLvlTraders) {
		tmpList.data[1].TraderStandings[lvlUpTrader].currentLevel = trader.get(lvlUpTrader).data.loyalty.currentLevel;
	}
	if(body.tid != "91_everythingTrader" && body.tid != "92_SecretTrader")
		tmpList.data[1].TraderStandings[body.tid].currentSalesSum = traderLoyalty.currentSalesSum;
	profile.setCharacterData(tmpList);
	
	return true;
}
function setPlayerStash()
{ //this sets automaticly a stash size from items.json (its not added anywhere yet cause we still use base stash)
	let stashTPL = profile.getStashType();
	stashX = (items.data[stashTPL]._props.Grids[0]._props.cellsH != 0) ? items.data[stashTPL]._props.Grids[0]._props.cellsH : 10;
	stashY = (items.data[stashTPL]._props.Grids[0]._props.cellsV != 0) ? items.data[stashTPL]._props.Grids[0]._props.cellsV : 66;
}
function GenItemID() 
{ // --> Generate ID not repeatable for item
	return Math.floor(new Date() / 1000) + utility.getRandomInt(0, 999999999).toString();
}
function getItem(template) 
{ // -> Gets item from <input: _tpl>
	for (let itm in items.data) {
		if (items.data[itm]._id && items.data[itm]._id == template) {
			let item = items.data[itm];
			return [true, item];
		}
	}
	return [false, {}];
}
function getSize(itemtpl, itemID, location) 
{ // -> Prepares item Width and height returns [sizeX, sizeY]
	let toDo = [itemID];
	let tmpItem = getItem(itemtpl)[1];

	var outX = 0, outY = 0, outL = 0, outR = 0, outU = 0, outD = 0, tmpL = 0, tmpR = 0, tmpU = 0, tmpD = 0;
	
	outX = tmpItem._props.Width;
	outY = tmpItem._props.Height;
	
	while (true) {
		if (typeof toDo[0] === "undefined") {
			break;
		}
			for (let tmpKey in location) {
				if (location[tmpKey].parentId == toDo[0]) {
					toDo.push(location[tmpKey]._id);
					let itm = getItem(location[tmpKey]._tpl)[1];

					if (typeof itm._props.ExtraSizeLeft != "undefined" && itm._props.ExtraSizeLeft > 0) {
						tmpL += itm._props.ExtraSizeLeft;
					}
					
					if (typeof itm._props.ExtraSizeRight != "undefined" && itm._props.ExtraSizeRight > 0) {
						tmpR += itm._props.ExtraSizeRight;
					}
					
					if (typeof itm._props.ExtraSizeUp != "undefined" && itm._props.ExtraSizeUp > 0) {
						tmpU += itm._props.ExtraSizeUp;
					}
					
					if (typeof itm._props.ExtraSizeDown != "undefined" && itm._props.ExtraSizeDown > 0) {
						if(typeof itm._props.ReloadMagType == "string")
							tmpD = tmpD;
						else
							tmpD += itm._props.ExtraSizeDown;
					}
				}
			}
			outL = outL + tmpL; 
			outR = outR + tmpR; 
			outU = outU + tmpU; 
			outD = outD + tmpD;
			tmpL = 0; tmpR = 0; tmpU = 0; tmpD = 0;
			toDo.splice(0, 1);		
	}
	let return_value = [(outX + outL + outR), (outY + outU + outD)];
	return return_value;
}
function acceptQuest(tmpList, body) 
{ // -> Accept quest
	tmpList.data[1].Quests.push({"qid": body.qid.toString(), "startTime": utility.getTimestamp(), "status": 2}); // statuses seem as follow - 1 - not accepted | 2 - accepted | 3 - failed | 4 - completed
	profile.setCharacterData(tmpList);
	return "OK";
}
function completeQuest(tmpList, body) 
{ // -> Complete quest (need rework for giving back quests)
	for (let quest of tmpList.data[1].Quests) {
		if (quest.qid == body.qid) {
			quest.status = 4;
			break;
		}
	}
	// find Quest data and update trader loyalty
	for (let quest of AllQuests.data) {
		if (quest._id == body.qid) {
			for (let reward of quest.rewards.Success) {
				let tmpTraderInfo = trader.get(reward.target);
				if (tmpTraderInfo.err == 0) {
					let traderLoyalty = tmpTraderInfo.data.loyalty;
					traderLoyalty.currentStanding += parseFloat(reward.value);
					trader.get(reward.target).data.loyalty = traderLoyalty;
					let newLvlTraders =  trader.lvlUp(tmpList.data[1].Info.Level);
					for (let lvlUpTrader in newLvlTraders) {
						tmpList.data[1].TraderStandings[lvlUpTrader].currentLevel = trader.get(lvlUpTrader).data.loyalty.currentLevel;
					}
					tmpList.data[1].TraderStandings[reward.target].currentStanding += parseFloat(reward.value);
				} else if (reward.type == "Experience") { // get Exp reward
					tmpList.data[1].Info.Experience += parseInt(reward.value);
				}
			}
		}
  }

	//send reward to the profile : if quest_list.id == bodyqid then quest_list.succes

	profile.setCharacterData(tmpList);
	return "OK";
}
function questHandover(tmpList, body) 
{ // -> Quest handover items
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
function addNote(tmpList, body) 
{ // -> Note ADD
	tmpList.data[1].Notes.Notes.push({"Time": body.note.Time, "Text": body.note.Text});
	profile.setCharacterData(tmpList);
	return "OK";
}
function editNode(tmpList, body) 
{ // -> Note Edit
	tmpList.data[1].Notes.Notes[body.index] = {"Time": body.note.Time, "Text": body.note.Text};
	profile.setCharacterData(tmpList);
	return "OK";
}
function deleteNote(tmpList, body) 
{ // -> Note Delete
	tmpList.data[1].Notes.Notes.splice(body.index, 1);
	profile.setCharacterData(tmpList);
	return "OK";
}
function moveItem(tmpList, body) 
{ // -> Move item to diffrent place - counts with equiping filling magazine etc
	//cartriges handler start
	if (body.to.container == 'cartridges'){
		let tmp_counter = 0;
		for (let item_ammo in tmpList.data[1].Inventory.items) {
			if(body.to.id == tmpList.data[1].Inventory.items[item_ammo].parentId){
				tmp_counter++;
			}
		}
		body.to.location = tmp_counter;//wrong location for first cartrige
	}
	//cartriges handler end
	
	for (let item of tmpList.data[1].Inventory.items) {
		if (item._id && item._id == body.item) {
			item.parentId = body.to.id;
			item.slotId = body.to.container;
			if (typeof body.to.location != "undefined") {
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
function findandreturnchildren(tmpList,itemid ) 
{ // Find And Return Children /// fixed by TRegular
//returns all child items ids in array, includes itself and children 
//List is backward first item is the furthest child and last item is main item 
	let list = [];
	for (let childitem of tmpList.data[1].Inventory.items){
		if (childitem.parentId == itemid){
			list.push.apply(list,findandreturnchildren(tmpList,childitem._id));
		}
	}
	list.push(itemid);// our item don't remove this to find all child of child of child... it's required
	return list;
}
function removeItem(tmpList, body) 
{ // -> Deletes item and its all child completly - now works
	var toDo = [body.item];
	//Find the item and all of it's relates
	if (toDo[0] != undefined && toDo[0] != null && toDo[0] != "undefined"){
		let ids_toremove = findandreturnchildren(tmpList,toDo[0]); //get all ids related to this item, +including this item itself
		for(let i in ids_toremove){ //remove one by one all related items and itself
			output.data.items.del.push({"_id": ids_toremove[i]}); // Tell client to remove this from live game
			for(let a in tmpList.data[1].Inventory.items){	//find correct item by id and delete it 
				if(tmpList.data[1].Inventory.items[a]._id==ids_toremove[i]){
					tmpList.data[1].Inventory.items.splice(a, 1);  //remove item from tmplist
				}
			}
		}
		profile.setCharacterData(tmpList); //save tmplist to profile
		return "OK";
	}
	else{
		console.log("item id is not vaild");
		//maybe return something because body.item id wasn't valid.
	}
}
function splitItem(tmpList, body) 
{ // -> Spliting item / Create new item with splited amount and removing that amount from older one
	let location = body.container.location;
	if(typeof body.container.location == "undefined" && body.container.container === "cartridges"){
		let tmp_counter = 0;
		for (let item_ammo in tmpList.data[1].Inventory.items) {
			if(tmpList.data[1].Inventory.items[item_ammo].parentId == body.container.id)
				tmp_counter++;
		}
		location = tmp_counter;//wrong location for first cartrige
	}
	for (let item of tmpList.data[1].Inventory.items) {
		if (item._id && item._id == body.item) {
			item.upd.StackObjectsCount -= body.count;
			let newItem = GenItemID();
				output.data.items.new.push({"_id": newItem, "_tpl": item._tpl, "parentId": body.container.id, "slotId": body.container.container, "location": location, "upd": {"StackObjectsCount": body.count}});
				tmpList.data[1].Inventory.items.push({"_id": newItem, "_tpl": item._tpl, "parentId": body.container.id, "slotId": body.container.container, "location": location, "upd": {"StackObjectsCount": body.count}});
			profile.setCharacterData(tmpList);
			return "OK";
		}
	}

	return "";
}
function mergeItem(tmpList, body) 
{ // -> Merging to one item / deletes one item and adding its value to second one
    for (let key in tmpList.data[1].Inventory.items) {
        if (tmpList.data[1].Inventory.items[key]._id && tmpList.data[1].Inventory.items[key]._id == body.with) {
            for (let key2 in tmpList.data[1].Inventory.items) {
                if (tmpList.data[1].Inventory.items[key2]._id && tmpList.data[1].Inventory.items[key2]._id == body.item) {
                    // we ending with item key after merge but we checking both of the items and deleting key2
					let stackItem0 = 1;
					let stackItem1 = 1;
					if(typeof tmpList.data[1].Inventory.items[key].upd != "undefined")
						stackItem0 = tmpList.data[1].Inventory.items[key].upd.StackObjectsCount;
					if(typeof tmpList.data[1].Inventory.items[key2].upd != "undefined")
						stackItem1 = tmpList.data[1].Inventory.items[key2].upd.StackObjectsCount;

					if (stackItem0 == 1)
						Object.assign(tmpList.data[1].Inventory.items[key],{"upd": {"StackObjectsCount": 1}});
				
                    tmpList.data[1].Inventory.items[key].upd.StackObjectsCount = stackItem0 + stackItem1;
					
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
function foldItem(tmpList, body) 
{ // -> Fold item / generally weapon
	for (let item of tmpList.data[1].Inventory.items) {
		if (item._id && item._id == body.item) {
			item.upd.Foldable = {"Folded": body.value};
			profile.setCharacterData(tmpList);
			return "OK";
		}
	}
	return "";
}
function toggleItem(tmpList, body) 
{ // -> Toggle item / flashlight, laser etc.
	for (let item of tmpList.data[1].Inventory.items) {
		if (item._id && item._id == body.item) {
			item.upd.Togglable = {"On": body.value};
			profile.setCharacterData(tmpList);
			return "OK";
		}
	}
	return "";
}
function tagItem(tmpList, body) 
{ // -> Tag item / Taggs item with given name and color
    for (let item of tmpList.data[1].Inventory.items) {
        if (item._id === body.item) {
            if( item.upd !== null &&
                item.upd !== undefined &&
                item.upd !== "undefined" )
			{
            	item.upd.Tag = {"Color": body.TagColor, "Name": body.TagName};
			}
            else
			{ //if object doesn't have upd create and add it
            let myobject = {"_id": item._id,"_tpl": item._tpl,"parentId":item.parentId,"slotId": item.slotId,"location": item.location,"upd": {"Tag": {"Color": body.TagColor,"Name": body.TagName}}};
            Object.assign(item,myobject); // merge myobject into item -- overwrite same properties and add missings
            }
            profile.setCharacterData(tmpList);
            return "OK";
        }
    }

    return "";
}
function bindItem(tmpList, body) 
{ // -> Binds item to quick bar
	for (let index in tmpList.data[1].Inventory.fastPanel) { 
		// if binded items is already in fastPanel 
		if (tmpList.data[1].Inventory.fastPanel[index] === body.item) {
			// we need to remove index before re-adding somewhere else  
			tmpList.data[1].Inventory.fastPanel[index] = ""; 
		} 
	} 
 
	tmpList.data[1].Inventory.fastPanel[body.index] = body.item; 
	profile.setCharacterData(tmpList); 
	return "OK"; 
}
function eatItem(tmpList, body) 
{ // -> Eat item and get benefits // maybe for future features
	for (let item of tmpList.data[1].Inventory.items) {
		if (item._id === body.item) {
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
function healPlayer(tmpList, body) 
{ // -> Healing
	// healing body part
	for (let bdpart in tmpList.data[1].Health.BodyParts) {
		if (bdpart === body.part) {
			tmpList.data[1].Health.BodyParts[bdpart].Health.Current += body.count;
		}
	}

	// update medkit used (hpresource)
	for (let item of tmpList.data[1].Inventory.items) {
		// find the medkit in the inventory
		if (item._id === body.item) {
			if (typeof item.upd.MedKit === "undefined") {
				let maxhp = getItem(item._tpl)[1]._props.MaxHpResource;
				
				item.upd.MedKit = {"HpResource": maxhp - body.count};
			} else {
				item.upd.MedKit.HpResource -= body.count;
			}

			// remove medkit if its empty
			if (item.upd.MedKit.HpResource === 0 ) {
				removeItem(tmpList, {Action: 'Remove', item: body.item});
			}

			profile.setCharacterData(tmpList);
		}
	}
	
	return "OK";
}
function addToWishList(tmpList, body) 
{ // add to Wish list - really dont know what it is ...
	// check if the item is already in wishlist
	for (let item in tmpList.data[1].Wishlist) {
		// don't add the item
		if (tmpList.data[1].WishList[item].tid === body.templateId) {
			return "OK";
		}
	}

	// add the item to the wishlist
	tmpList.data[1].WishList.push({"tid": body.templateId});
	profile.setCharacterData(tmpList);
	return "OK";
}
function removeFromWishList(tmpList, body) 
{ // remove to Wish list - really dont know what it is ...
	// remove the item if it exists
	for (let item in tmpList.data[1].Wishlist) {
		if (tmpList.data[1].WishList[item].tid === body.templateId) {
			tmpList.data[1].WishList.splice(item, 1);
		}
	}
	profile.setCharacterData(tmpList);
	return "OK";
}
function examineItem(tmpList, body) 
{ // examine item and adds it to examined list
	let returned = "BAD";

	// trader inventory
	if(typeof tmpTrader !== "undefined"){
		if (tmpTrader) {
			for (let item of tmpTrader.data) {
				if (item._id === body.item) {
					console.log("Found trader with examined item: " + item._id, "","",true);
					returned = item._tpl;
					break;
				}
			}
		}
	}
	// player inventory
	if (returned === "BAD") {
		for (let item of tmpList.data[1].Inventory.items) {
			if (item._id === body.item) {
				console.log("Found equipment examing item: " + item._id,"","",true);
				returned = item._tpl;
				break;
			}
		}
	}

	// item not found
	if (returned === "BAD") {
		console.log("Cannot find proper item. Stopped.", "white", "red");
		return "BAD";
	}

	// item found
	console.log("EXAMINED: " + returned, "white", "green",true);
	tmpList.data[1].Encyclopedia[returned] = true;
	profile.setCharacterData(tmpList);

	return "OK";
}
function transferItem(tmpList, body) 
{ // transfer item // mainly drag drop item from scav inventory to stash and reloading weapon by clicking "Reload"
	for (let item of tmpList.data[1].Inventory.items) {
			if (item._id === body.item) {
				if(item.upd.StackObjectsCount > body.count)
					item.upd.StackObjectsCount -= body.count;
				else 
					item.splice(item, 1);
			}
			if(item._id === body.with){
				item.upd.StackObjectsCount += body.count;
			}
	}
	profile.setCharacterData(tmpList);
	return "OK";
}
function swapItem(tmpList, body) 
{ // Swap Item // dont know for what it is ... maybe replace one item with another
	for (let item of tmpList.data[1].Inventory.items) {
			if (item._id === body.item) {
				item.parentId = body.to.id // parentId
				item.slotId = body.to.container // slotId
				item.location = body.to.location // location
			}
			if(item._id === body.item2){
				item.parentId = body.to2.id
				item.slotId = body.to2.container
				delete item.location;
			}
	}
	profile.setCharacterData(tmpList);
	return "OK";
}
function buyItem(tmpList, body, trad = "") 
{ // Buying item from trader
	let tmpTrader = 0;
	if(trad === "")
		tmpTrader = trader.getAssort(body.tid);
	else
		tmpTrader = JSON.parse(utility.readJson("data/configs/assort/91_everythingTrader.json"));// its for fleamarket only
	//no exceptions possible here
	 let moneyID = [];
	//prepare barter items as money (roubles are counted there as well)
	 for(let i = 0; i < body.scheme_items.length; i++){
		moneyID[i] = body.scheme_items[i].id;
	 }
	//check if money exists if not throw an exception (this step must be fullfill no matter what - by client side - if not user cheats)
	let moneyObject = findMoney(tmpList, moneyID);
	if(typeof moneyObject[0] == "undefined"){
		console.log("Error something goes wrong (not found Money) - stop cheating :)");
		return "";
	}
	
	// pay the item	to profile
	if (!payMoney(tmpList, moneyObject, body, trad)) {
		console.log("no money found");
		return "";
	}
		
	// print debug information
	console.log("Bought item: " + body.item_id,"","",true);
	for (let item of tmpTrader.data.items) {
		if (item._id === body.item_id) {
			let MaxStacks = 1;
			let StacksValue = [];
			let tmpItem = getItem(item._tpl)[1];

			// split stacks if the size is higher than allowed by StackMaxSize
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
			// stacks prepared
			
			for (let stacks = 0; stacks < MaxStacks; stacks++){
				tmpList = profile.getCharacterData();//update profile on each stack so stash recalculate will have new items
				let StashFS_2D = recheckInventoryFreeSpace(tmpList);					
				let ItemSize = getSize(item._tpl, item._id, tmpTrader.data.items);
				let tmpSizeX = ItemSize[0];
				let tmpSizeY = ItemSize[1];
				//let badSlot = "no";
				addedProperly:
				for (let y = 0; y <= stashY - tmpSizeY; y++) {
					for (let x = 0; x <= stashX - tmpSizeX; x++) {
						let badSlot = "no";
						break_BadSlot:
						for (let itemY = 0; itemY < tmpSizeY; itemY++) {
							for (let itemX = 0; itemX < tmpSizeX; itemX++) {
								if (StashFS_2D[y + itemY][x + itemX] != 0) {
									badSlot = "yes";
									break break_BadSlot;
								}
							}
						}
						if (badSlot == "yes") {
							continue;
						}
						
							console.log("Item placed at position [" +x + "," +y + "]","","",true);
							let newItem = GenItemID();
							let toDo = [[item._id, newItem]];

							output.data.items.new.push({"_id": newItem, "_tpl": item._tpl, "parentId": tmpList.data[1].Inventory.stash, "slotId": "hideout", "location": {"x": x, "y": y, "r": 0}, "upd": {"StackObjectsCount": StacksValue[stacks]}});
							
							tmpList.data[1].Inventory.items.push({"_id": newItem, "_tpl": item._tpl, "parentId": tmpList.data[1].Inventory.stash, "slotId": "hideout", "location": {"x": x, "y": y, "r": 0}, "upd": {"StackObjectsCount": StacksValue[stacks]}});
							//tmpUserTrader.data[newItem] = [[{"_tpl": item._tpl, "count": prices.data.barter_scheme[item._tpl][0][0].count}]];
							
							while (true) {
								if (typeof toDo[0] == "undefined") {
									break;
								}
								
									for (let tmpKey in tmpTrader.data.items) {
										if (tmpTrader.data.items[tmpKey].parentId && tmpTrader.data.items[tmpKey].parentId == toDo[0][0]) {
											newItem = GenItemID();
											let SlotID = tmpTrader.data.items[tmpKey].slotId
											if (SlotID == "hideout"){
                                                output.data.items.new.push({"_id": newItem, "_tpl": tmpTrader.data.items[tmpKey]._tpl, "parentId": toDo[0][1], "slotId": SlotID, "location": {"x": x, "y": y, "r": "Horizontal"}, "upd": {"StackObjectsCount": StacksValue[stacks]}});
                                                tmpList.data[1].Inventory.items.push({"_id": newItem, "_tpl": tmpTrader.data.items[tmpKey]._tpl, "parentId": toDo[0][1], "slotId": tmpTrader.data.items[tmpKey].slotId, "location": {"x": x, "y": y, "r": "Horizontal"}, "upd": {"StackObjectsCount": StacksValue[stacks]}});
                                            } else {
                                                output.data.items.new.push({"_id": newItem, "_tpl": tmpTrader.data.items[tmpKey]._tpl, "parentId": toDo[0][1], "slotId": SlotID, "upd": {"StackObjectsCount": StacksValue[stacks]}});
                                                tmpList.data[1].Inventory.items.push({"_id": newItem, "_tpl": tmpTrader.data.items[tmpKey]._tpl, "parentId": toDo[0][1], "slotId": tmpTrader.data.items[tmpKey].slotId, "upd": {"StackObjectsCount": StacksValue[stacks]}});
                                            }
                                            toDo.push([tmpTrader.data.items[tmpKey]._id, newItem]);
										}
									}
									toDo.splice(0, 1);
							}
							break addedProperly;
					}
				}
				profile.setCharacterData(tmpList); // save after each added item
			}	
			return "OK";
		}
	}

	return "";
}
// Selling item to trader
function sellItem(tmpList, body) {
	let money = 0;

	// print debug information
	let prices = JSON.parse(profile.getPurchasesData());
	// find the items
	for (let i in body.items) { // items to sell
		console.log("selling item"+ JSON.stringify(body.items[i]),"","",true); // print item trying to sell
	for (let item of tmpList.data[1].Inventory.items) { // profile inventory, look into it if item exist
			let isThereSpace = body.items[i].id.search(" ");
			let checkID = body.items[i].id;
			if(isThereSpace != -1)
				checkID = checkID.substr(0, isThereSpace);
			
			// item found
			if (item._id == checkID) {
				console.log("Selling: " + checkID,"","",true);
				// add money to return to the player
				let price_money = prices.data[item._id][0][0].count;
				if (removeItem(tmpList, {Action: 'Remove', item: checkID}) == "OK") {
					money += price_money;
				}
			}

		}
	}
	// get money the item
	if (!getMoney(tmpList, money, body, output)) {
		return "";
	}
	return "OK";
}
// separate is that selling or buying
function confirmTrading(tmpList, body, trader = "")  {

	// buying
	if (body.type == "buy_from_trader")  {
		setPlayerStash();
		return buyItem(tmpList, body, trader);
	}

	// selling
	if (body.type == "sell_to_trader") {				
		return sellItem(tmpList, body);
	}

	return "";
}
// Ragfair trading
function confirmRagfairTrading(tmpList, body) {
	console.log(body,"","",true);
	/*
	{ Action: 'RagFairBuyOffer',  offerId: '56d59d3ad2720bdb418b4577',  count: 1,  items: [ { id: '1566757577968610909', count: 42 } ] }
	*/
	body.Action = "TradingConfirm";
	body.type = "buy_from_trader";
	body.tid = "91_everythingTrader";
	body.item_id = body.offerId;
	body.scheme_id = 0;
	body.scheme_items = body.items;

	if (confirmTrading(tmpList, body, "ragfair") == "OK" ) {
		return "OK";
	} else {
		return "error";
	}
}
// --- REQUEST HANDLING BELOW --- //
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

		case "Swap":
			return swapItem(tmpList, body);

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

module.exports.GenItemID = GenItemID;
module.exports.getOutput = getOutput;
module.exports.resetOutput = resetOutput;
module.exports.moving = moving;
module.exports.removeItem = removeItem;
module.exports.PrepareItemsList = PrepareItemsList;