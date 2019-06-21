"use strict";

var utility = require('./utility.js');

var items = JSON.parse(utility.readJson("data/items.json"));

function getOffers(request)  {
	var response = JSON.parse(utility.readJson("data/ragfair/search.json"));

	if (request.handbookId != "") {	
		var isCateg = false;
		var handbook = JSON.parse(utility.readJson('data/templates.json'));

		for (var categ of handbook.data.Categories) {
			if (categ.Id == request.handbookId) {	
				var sustain = categ.Id;
				
				isCateg = true;

				for (var item of handbook.data.Items) {
					if (item.ParentId == sustain) {
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

function CreateOffer(template)
{
	var offerBase = JSON.parse(utility.readJson("data/ragfair/offerBase.json"));

	offerBase._id = template;
	offerBase.items[0]._tpl = template;

	return offerBase;
}

module.exports.getOffers = getOffers;