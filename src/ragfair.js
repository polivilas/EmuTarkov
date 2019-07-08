"use strict";

const utility = require('./utility.js');

var items = JSON.parse(utility.readJson("data/configs/items.json"));
var handbook = JSON.parse(utility.readJson('data/configs/templates.json'));

function getOffers(request) {
	let response = JSON.parse(utility.readJson("data/configs/ragfair/search.json"));

	// request an item or a category of items
	if (request.handbookId != "") {
		let isCateg = false;

		for (let categ of handbook.data.Categories) {
			// find the category in the handbook
			if (categ.Id == request.handbookId) {
				isCateg = true;
				
				// list all item of the category
				for (let item of handbook.data.Items) {
					if (item.ParentId == categ.Id) {
						response.data.offers.push(createOffer(item.Id,item.Price));
					}
				}

				// recursive loops for sub categories
				for (let categ2 of handbook.data.Categories) {
					if (categ2.ParentId == categ.Id) {
						for (let item of handbook.data.Items) {
							if (item.ParentId == categ2.Id) {
								response.data.offers.push(createOffer(item.Id,item.Price));
							}
						}
					}
				}
			}
		}

		// its a specific item searched then
		if (isCateg == false) {
			for (let curItem in items.data) {
				if (curItem == request.handbookId) {
					for (let someitem of handbook.data.Items) {
						if (someitem.Id == request.handbookId) {
							response.data.offers.push(createOffer(curItem,someitem.Price)); 
						} 
					}

					break;
				}
			}
		}	
	}

	// linked search
	if (request.linkedSearchId != "") {	
		let itemLink = items.data[request.linkedSearchId];

		if (itemLink._props.Slots != undefined) {
			for (let itemSlot of itemLink._props.Slots) {
				for (let itemSlotFilter of itemSlot._props.filters) {
					for (let mod of itemSlotFilter.Filter) {
						for (let someitem of handbook.data.Items) {
							if (someitem.Id == mod) { 
								response.data.offers.push(createOffer(mod,someitem.Price)); 
							} 
						}
					}
				}
			}
		}
	}

	return JSON.stringify(response);
}

function createOffer(template,price) {
	let offerBase = JSON.parse(utility.readJson("data/configs/ragfair/offerBase.json"));

	offerBase._id = template;
	offerBase.items[0]._tpl = template;
	offerBase.requirements[0].count = price;

	return offerBase;
}

module.exports.getOffers = getOffers;