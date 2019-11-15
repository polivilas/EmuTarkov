"use strict";

require('../libs.js');

//// ---- FUNCTIONS BELOW ---- ////
/*
/client/game/profile/items/moving
{"data":[{"Action":"CustomizationWear","suites":["5cdea3f87d6c8b647a3769b2"]}],"tm":1}
/client/game/profile/items/moving
{"data":[{"Action":"CustomizationBuy","offer":"5d1f661686f7744bcb0adfb5","items":[{"id":"5dc46753a815f81bc7014370","count":25000,"del":false}]}],"tm":1}
*/

function wearClothing(tmpList, body){
	let suits_to_set = body.suites; // just to shorten future names and simplyfied them

	//in case there is more suites to be wear
	for(let i = 0; i < suits_to_set.length; i++){
		let costume_data = customization_m.data[suits_to_set[i]];
		//this parent reffers to Lower Node
		if(costume_data._parent == "5cd944d01388ce000a659df9"){
			tmpList.data[1].Customization.Feet = costume_data._props.Feet;//do only feet
		}
		//this parent reffers to Upper Node
		if(costume_data._parent == "5cd944ca1388ce03a44dc2a4"){	//do only body and hands
			tmpList.data[1].Customization.Body = costume_data._props.Body;
			tmpList.data[1].Customization.Hands = costume_data._props.Hands;
			
		}
	}
	profile.setCharacterData(tmpList); // save profile after change

    item.resetOutput();
	return item.getOutput();
}
function buyClothing(tmpList, body){
	let output = ""
		item.resetOutput();
		output = item.getOutput();

	//let ragmanOffer = body.offer; <- no 

	let item_toPay = body.items;
	let customization_storage = JSON.parse( utility.readJson("data/configs/customization/storage.json") );
	for(let i = 0; i < item_toPay.length; i++){
		for(let item in tmpList.data[1].Inventory.items){
			if(tmpList.data[1].Inventory.items[item]._id == item_toPay[i].id){
				if(tmpList.data[1].Inventory.items[item].upd.StackObjectsCount > item_toPay[i].count){
					//now change cash
					tmpList.data[1].Inventory.items[item].upd.StackObjectsCount = tmpList.data[1].Inventory.items[item].upd.StackObjectsCount - item_toPay[i].count;
					output.data.items.change.push({
                        "_id": tmpList.data[1].Inventory.items[item]._id,
                        "_tpl": tmpList.data[1].Inventory.items[item]._tpl,
                        "parentId": tmpList.data[1].Inventory.items[item].parentId,
                        "slotId": tmpList.data[1].Inventory.items[item].slotId,
                        "location": tmpList.data[1].Inventory.items[item].location,
                        "upd": {"StackObjectsCount": tmpList.data[1].Inventory.items[item].upd.StackObjectsCount}
                    });
					break; // break from inventory loop
				} else if(tmpList.data[1].Inventory.items[item].upd.StackObjectsCount == item_toPay[i].count && item_toPay[i].del == true){
					output.data.items.del.push({"_id": item_toPay[i].id}); // Tell client to remove this from live game
                    tmpList.data[1].Inventory.items.splice(item, 1);  //remove item from tmplist					
				}
			}
		}
	}

	var customization_offers = JSON.parse( utility.readJson("data/configs/customization/offers.json") );
	for(var offer of customization_offers.data)
	{
		if(body.offer == offer._id)
		{
			customization_storage.data.suites.push(offer.suiteId);
		}
	}
	utility.writeJson("data/configs/customization/storage.json", customization_storage);
	profile.setCharacterData(tmpList); // save profile after change
	return output;
}

//// ---- EXPORT LIST ---- ////
module.exports.wearClothing = wearClothing;
module.exports.buyClothing = buyClothing;