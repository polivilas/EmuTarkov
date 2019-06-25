"use strict";

var utility = require('./utility.js');

var items = JSON.parse(utility.readJson("data/items.json"));

function getOffers(request)  {
	var response = JSON.parse(utility.readJson("data/ragfair/search.json"));

	if(request.handbookId != "") //request an item or a category of items
	{	
		var isCateg = false;
		var handbook = JSON.parse( utility.readJson('data/templates.json') );//load the handbook

		handbook.data.Categories.forEach(function(categ)
		{
			if(categ.Id == request.handbookId)//find the category in the handbook
			{	
				isCateg = true;
				handbook.data.Items.forEach(function(item)//list all item of the category
				{
					if(item.ParentId == categ.Id )
					{
						/*
						if(categ.Id == "5b5f78dc86f77409407a7f8e" || categ.ParentId == "5b5f78dc86f77409407a7f8e" && categ.Id != "5b5f7a2386f774093f2ed3c4" && categ.Id != "5b5f7a0886f77409407a7f96")
						{
							
							var weaponPresets = JSON.parse( utility.readJson('data/bots/botWeapons.json') );//load presets 
							weaponPresets.data.forEach(function(weapPreset)
							{
								if(weapPreset._items[0]._tpl == item.Id )
								{ 
									response.data.offers.push( CreateOfferPreset(weapPreset._id,weapPreset._items[0]._tpl , weapPreset._items) );//create offer with preset found from category
								}

							});
						}*/
						response.data.offers.push( CreateOffer(item.Id) );
					}
				});

				handbook.data.Categories.forEach(function(categ2) //recursive loops for sub categories
				{
					if(categ2.ParentId == categ.Id )
					{
						handbook.data.Items.forEach(function(item)
						{
							if(item.ParentId == categ2.Id)
							{
								response.data.offers.push( CreateOffer(item.Id) );
							}
						});
					}
				});
			}
		});

		if (isCateg == false) { //if its a specific item searched then 
			var tmpId = "54009119af1c881c07000029";
	
			for (var curItem in items.data) 
			{
				if (curItem == request.handbookId) 
				{	
					/*
					if(items.data[curItem]._name.substring(0,7) == "weapon_")
					{	
							var weaponPresets = JSON.parse( utility.readJson('data/bots/botWeapons.json') );
							weaponPresets.data.forEach(function(weapPreset)
							{
								if(weapPreset._items[0]._tpl == items.data[curItem]._id )
								{ 
									response.data.offers.push( CreateOfferPreset(weapPreset._id,weapPreset._items[0]._tpl , weapPreset._items) );
								}
							});
						
					}*/
					tmpId = curItem;
					console.log("found item");
					
					break;
				};
			};

			response.data.offers.push( CreateOffer(tmpId));
		}	
	}

	if( request.linkedSearchId != "") {	
		var itemLink = items.data[request.linkedSearchId];

		itemLink._props.Slots.forEach(function(ItemSlot) {   
			ItemSlot._props.filters.forEach(function(itemSlotFilter) {   
				itemSlotFilter.Filter.forEach(function(mod) {
					var offer = CreateOffer(mod);

					response.data.offers.push(offer);
				})	
			});
		});
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

function CreateOfferPreset(id,template, preset)
{
	var offerBase = JSON.parse(utility.readJson("data/ragfair/offerBase.json"));

	offerBase._id = id;
	offerBase.items = preset;
	offerBase.root = preset[0]._id;
	offerBase.items[0].upd = {};
	offerBase.items[0].upd.StackObjectsCount = 99;

	//console.log(offerBase);
	return offerBase;

}

module.exports.getOffers = getOffers;