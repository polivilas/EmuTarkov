"use strict";

require('../libs.js');

function getCustomizationStoragePath() {
	let filepath = filepaths.user.profiles.storage;
	return filepath.replace("__REPLACEME__", constants.getActiveID());
}

function wearClothing(tmpList, body) {
	// in case there is more suites to be wear
	for (let i = 0; i < body.suites.length; i++) {
		let costume_data = customization_m.data[body.suites[i]];

		// this parent reffers to Lower Node
		if (costume_data._parent == "5cd944d01388ce000a659df9") {
			// do only feet
			tmpList.data[0].Customization.Feet = costume_data._props.Feet;
		}

		// this parent reffers to Upper Node
		if (costume_data._parent == "5cd944ca1388ce03a44dc2a4") {
			// do only body and hands
			tmpList.data[0].Customization.Body = costume_data._props.Body;
			tmpList.data[0].Customization.Hands = costume_data._props.Hands;
		}
	}

	profile.setCharacterData(tmpList);
    item.resetOutput();
	return item.getOutput();
}

function buyClothing(tmpList, body) {
	item.resetOutput();

	let output = item.getOutput();
	let item_toPay = body.items;
	let customization_storage = json.parse(json.read(getCustomizationStoragePath()));

	for (let i = 0; i < item_toPay.length; i++) {
		for (let item in tmpList.data[0].Inventory.items) {
			if (tmpList.data[0].Inventory.items[item]._id == item_toPay[i].id) {
				if (tmpList.data[0].Inventory.items[item].upd.StackObjectsCount > item_toPay[i].count) {
					// now change cash
					tmpList.data[0].Inventory.items[item].upd.StackObjectsCount = tmpList.data[0].Inventory.items[item].upd.StackObjectsCount - item_toPay[i].count;
					output.data.items.change.push({
                        "_id": tmpList.data[0].Inventory.items[item]._id,
                        "_tpl": tmpList.data[0].Inventory.items[item]._tpl,
                        "parentId": tmpList.data[0].Inventory.items[item].parentId,
                        "slotId": tmpList.data[0].Inventory.items[item].slotId,
                        "location": tmpList.data[0].Inventory.items[item].location,
                        "upd": {"StackObjectsCount": tmpList.data[0].Inventory.items[item].upd.StackObjectsCount}
                    });
					break;
				} else if (tmpList.data[0].Inventory.items[item].upd.StackObjectsCount == item_toPay[i].count && item_toPay[i].del == true) {
					output.data.items.del.push({"_id": item_toPay[i].id});
                    tmpList.data[0].Inventory.items.splice(item, 1);					
				}
			}
		}
	}

	let customizationOffers = json.parse(json.read(filepaths.user.cache.customization_offers));

	for (let offer of customizationOffers.data) {
		if (body.offer == offer._id) {
			customization_storage.data.suites.push(offer.suiteId);
		}
	}

	json.write(getCustomizationStoragePath(), customization_storage);
	profile.setCharacterData(tmpList);
	return output;
}

module.exports.getCustomizationStoragePath = getCustomizationStoragePath;
module.exports.wearClothing = wearClothing;
module.exports.buyClothing = buyClothing;