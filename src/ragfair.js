"use strict";

var utility = require('./utility.js');

var items = JSON.parse(utility.readJson("data/items.json"));
var search = JSON.parse(utility.readJson("data/ragfair/search.json"));
var offerBase = JSON.parse(utility.readJson("data/ragfair/offerBase.json"));

function getOffers(request) {
	var response = search;

	 //request an item or a category of item
	if (request.handbookId != "") {
		var isCateg = false;
		var handbook = JSON.parse(utility.readJson('data/templates.json'));

		for (var categ of handbook.data.Categories) {
			if (categ.Id == request.handbookId) {	
				var sustain = categ.Id;

				isCateg = true;
        
				for (var item of handbook.data.Items) {
					if (item.ParentId == categ.Id) {
						response.data.offers.push(CreateOffer(item.Id));
					}
				}

				for (var categ2 of handbook.data.Categories) {
					if (categ2.ParentId == sustain) {
						for (var item of handbook.data.Items) {
							if (item.ParentId == categ2.Id) {
								response.data.offers.push(CreateOffer(item.Id));
							}
						}
					}
				}
			}
		}

		if (isCateg == false) {
			var tmpId = "54009119af1c881c07000029";
	
			for (var curItem in items.data) {
				if (curItem == request.handbookId) {
					if (items.data[curItem]._name.substring(0,7) == "weapon_") {	
						var weaponPresets = JSON.parse(utility.readJson('data/bots/botWeapons.json'));
            
						for (var weaponPreset of weaponPresets) {
							if (weaponPreset._items[0]._tpl == items.data[curItem]._id ) { 
								response.data.offers.push(CreateOfferPreset(weaponPreset._items[0]._tpl , weaponPreset._items));
							}
						}
					}
          
					tmpId = curItem;
					console.log("found item");
					break;
				}
			}

			response.data.offers.push(CreateOffer(tmpId));
		}	
	}

	if (request.linkedSearchId != "") {	
		var itemLink = items.data[request.linkedSearchId];

		for (var itemSlot of itemLink._props.Slots) {  
			for (var itemSlotFilter of itemSlot._props.filters) {
				for (var mod of itemSlotFilter.Filter) {
					var offer = CreateOffer(mod);

					response.data.offers.push(offer);
				}
			}
		}
	}

	return JSON.stringify(response);
}

function createOffer(template) {
	var offer = offerBase;

	offer._id = template;
	offer.items[0]._tpl = template;

	return offer;
}

function createOfferPreset(template, preset) {
	var offer = offerBase;

	offer._id = template;
	offer.items = preset;
	offer.root = preset[0]._id;
	offer.items[0].upd = {};
	offer.items[0].upd.StackObjectsCount = 99;

	return offer;
}

module.exports.getOffers = getOffers;