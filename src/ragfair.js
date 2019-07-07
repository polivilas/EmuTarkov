"use strict";

var utility = require('./utility.js');

var items = JSON.parse(utility.readJson("data/configs/items.json"));

function getOffers(request) {
	var response = JSON.parse(utility.readJson("data/configs/ragfair/search.json"));
	var handbook = JSON.parse(utility.readJson('data/configs/templates.json'));

	// request an item or a category of items 
	if (request.handbookId != "") {	
		var isCateg = false;

		handbook.data.Categories.forEach(function(categ) {
			// find the category in the handbook
			if (categ.Id == request.handbookId) {	
				isCateg = true;
				
				//list all item of the category
				handbook.data.Items.forEach(function(item) {
					if (item.ParentId == categ.Id) {
						response.data.offers.push(createOffer(item.Id));
					}
				});

				// recursive loops for sub categories
				handbook.data.Categories.forEach(function(categ2) {
					if (categ2.ParentId == categ.Id) {
						handbook.data.Items.forEach(function(item) {
							if (item.ParentId == categ2.Id) {
								response.data.offers.push(createOffer(item.Id));
							}
						});
					}
				});
			}
		});

		// if its a specific item searched
		if (isCateg == false) {
			for (var curItem in items.data) {
				if (curItem == request.handbookId) {	
					for (var someitem in handbook.data.Items) {	
						if (handbook.data.Items[someitem].Id == request.handbookId ) {
							response.data.offers.push(createOffer(curItem));
						}
					}
					
					break;
				};
			};

			response.data.offers.push(createOffer(tmpId));
		}	
	}

	if (request.linkedSearchId != "") {	
		var itemLink = items.data[request.linkedSearchId];

		itemLink._props.Slots.forEach(function(ItemSlot) {   
			ItemSlot._props.filters.forEach(function(itemSlotFilter) {   
				itemSlotFilter.Filter.forEach(function(mod) {
					for (var someitem in handbook.data.Items) {
						if (handbook.data.Items[someitem].Id == mod) {
							response.data.offers.push(createOffer(mod));
						}
					}
				})	
			});
		});
	}

	return JSON.stringify(response);
}

function createOffer(template) {
	var offerBase = JSON.parse(utility.readJson("data/configs/ragfair/offerBase.json"));

	offerBase._id = template;
	offerBase.items[0]._tpl = template;

	return offerBase;
}

module.exports.getOffers = getOffers;