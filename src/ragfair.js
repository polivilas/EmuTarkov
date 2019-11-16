"use strict";

require('./libs.js');
const handbook = JSON.parse(utility.readJson('data/configs/templates.json'));

function getOffers(request) {
    let response = JSON.parse(utility.readJson("data/configs/ragfair/search.json"));

    if( Object.entries(request.buildItems).length != 0 )
    {
        createOfferFromBuild(request.buildItems,response);
    }
    else if (request.handbookId !== "") // request an item or a category of items
    {
        let isCateg = false;

        for (let categ of handbook.data.Categories) 
        {
            // find the category in the handbook
            if (categ.Id === request.handbookId) 
            {
                isCateg = true;

                // list all item of the category
                for (let item of handbook.data.Items) 
                {
                    if (item.ParentId === categ.Id) 
                    {
                        response.data.offers.push(createOffer(item.Id, (item.Price)));
                    }
                }

                // recursive loops for sub categories
                for (let categ2 of handbook.data.Categories) 
                {
                    if (categ2.ParentId === categ.Id) 
                    {
                        for (let item of handbook.data.Items) 
                        {

                            if (item.ParentId === categ2.Id) 
                            {
                                response.data.offers.push(createOffer(item.Id, (item.Price)));
                            }
                            
                        }
                    }
                }
            }
        }
        // its a specific item searched then
        if (isCateg === false) 
        {
            for (let curItem in items.data) {
                if (curItem === request.handbookId) {
                    for (let someitem of handbook.data.Items) 
                    {                       
                        if (someitem.Id === request.handbookId) 
                        {
                            response.data.offers.push(createOffer(curItem, (someitem.Price)));
                        }
                        
                    }

                    break;
                }
            }
        }
    }
    else if (request.linkedSearchId !== "") 
    {
        let itemLink = items.data[request.linkedSearchId];
        if (typeof itemLink._props.Slots !== "undefined") 
        {
            for (let itemSlot of itemLink._props.Slots) 
            {
                for (let itemSlotFilter of itemSlot._props.filters) 
                {
                    for (let mod of itemSlotFilter.Filter) 
                    {
                        for (let someitem of handbook.data.Items) 
                        {
                            if (someitem.Id === mod) 
                            {
                                response.data.offers.push(createOffer(mod, (someitem.Price)));
                            }
                            
                        }
                    }
                }
            }
        }
    }
    return JSON.stringify(response);
}


function createOfferFromBuild(buildItems,response)
{
    for(var itemFromBuild in buildItems)
    {
        for (let curItem in items.data) 
        {
            if (curItem === itemFromBuild) 
            {
                for (let someitem of handbook.data.Items) 
                {                       
                    if (someitem.Id === itemFromBuild) 
                    {
                        response.data.offers.push(createOffer(curItem, (someitem.Price)));
                        break;
                    }
                    
                }

                break;
            }
        }
    }
    return response
}

function createOffer(template, price) 
{
    let offerBase = JSON.parse(utility.readJson("data/configs/ragfair/offerBase.json"));
    offerBase._id = template;
    offerBase.items[0]._tpl = template;
    offerBase.requirements[0].count = price;
	//offerBase.startTime = utility.getTimestamp() - 1000;
	//offerBase.endTime = utility.getTimestamp() + 43200;
    return offerBase;
}

module.exports.getOffers = getOffers;