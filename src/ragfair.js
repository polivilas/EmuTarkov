"use strict";

var utility = require('./utility.js');

var items = JSON.parse(utility.readJson("data/items.json"));

function getOffers(request) 
{
	var response = JSON.parse(utility.readJson("data/ragfair/search.json"));

	if(request.handbookId != "")
	{	
		var isCateg = false;
		var handbook = JSON.parse( utility.readJson('data/templates.json') );
		handbook.data.Categories.forEach(function(categ)
		{
			if(categ.Id == request.handbookId)
			{	
				//console.log(categ);
				var sustain = categ.Id;
				isCateg = true;
				handbook.data.Items.forEach(function(item)
				{
					if(item.ParentId == sustain )
					{
						response.data.offers.push( CreateOffer(item.Id) );
					}
				});

				handbook.data.Categories.forEach(function(categ2)
				{
					if(categ2.ParentId == sustain )
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

		if (isCateg == false)
		{
			var tmpId = "54009119af1c881c07000029";
	
			for (var curItem in items.data) 
			{
				if (curItem == request.handbookId) 
				{
					tmpId = curItem;
					console.log("found item");
					break;
				};
			};

			response.data.offers.push( CreateOffer(tmpId) );
		}	
	}

	if( request.linkedSearchId != "" )
	{	
		var itemLink = items.data[request.linkedSearchId];
		itemLink._props.Slots.forEach(function(ItemSlot)
		{   
			ItemSlot._props.filters.forEach(function(itemSlotFilter)
			{   
				itemSlotFilter.Filter.forEach(function(mod)
				{
					var offer = CreateOffer(mod);
					response.data.offers.push(offer);
				})	
			});
			
		});
		
		
	}

	return JSON.stringify(response);
	// this is really not okay. TODO: handle ragfair buying event - maybe connect to trader buy event?
}

function CreateOffer(template)
{
	var offerBase = JSON.parse(utility.readJson("data/ragfair/offerBase.json"));

	offerBase._id = template;
	offerBase.items[0]._tpl = template;

	return offerBase;
}

module.exports.getOffers = getOffers;