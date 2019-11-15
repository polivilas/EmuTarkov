"use strict";

require('./libs.js');
const handbook = JSON.parse(utility.readJson('data/configs/templates.json'));

function prepareCatItems(categ) 
{
    return [true,1];
}

function getOffers(request) {
    let response = JSON.parse(utility.readJson("data/configs/ragfair/search.json"));

    // request an item or a category of items
    if (request.handbookId !== "") {
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
                    let prep_it = prepareCatItems(item);
                    if (prep_it[0] === true) 
                    {
                        if (item.ParentId === categ.Id && skipThisId.indexOf(item.Id) === -1) 
                        {
                            response.data.offers.push(createOffer(item.Id, (item.Price * prep_it[1])));
                        }
                    }
                }

                // recursive loops for sub categories
                for (let categ2 of handbook.data.Categories) 
                {
                    if (categ2.ParentId === categ.Id) 
                    {
                        for (let item of handbook.data.Items) 
                        {
                            let prep_it = prepareCatItems(item);
                            if (prep_it[0] === true) 
                            {
                                if (item.ParentId === categ2.Id && skipThisId.indexOf(item.Id) === -1) 
                                {
                                    response.data.offers.push(createOffer(item.Id, (item.Price * prep_it[1])));
                                }
                            }
                        }
                    }
                }
            }
        }
        // its a specific item searched then
        if (isCateg === false) {
            for (let curItem in items.data) {
                if (curItem === request.handbookId) {
                    for (let someitem of handbook.data.Items) {
                        let prep_it = prepareCatItems(someitem);
                        if (prep_it[0] === true) {
                            if (someitem.Id === request.handbookId && skipThisId.indexOf(someitem.Id) === -1) {
                                response.data.offers.push(createOffer(curItem, (someitem.Price * prep_it[1])));
                            }
                        }
                    }

                    break;
                }
            }
        }
    }
    // linked search
    if (request.linkedSearchId !== "") {
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
                            let prep_it = prepareCatItems(someitem);
                            if (prep_it[0] === true) 
                            {
                                if (someitem.Id === mod && skipThisId.indexOf(someitem.Id) === -1) 
                                {
                                    response.data.offers.push(createOffer(mod, (someitem.Price * prep_it[1])));
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    return JSON.stringify(response);
}

function createOffer(template, price) {
    let offerBase = JSON.parse(utility.readJson("data/configs/ragfair/offerBase.json"));
    offerBase._id = template;
    offerBase.items[0]._tpl = template;
    offerBase.requirements[0].count = price;
	//offerBase.startTime = utility.getTimestamp() - 1000;
	//offerBase.endTime = utility.getTimestamp() + 43200;
    return offerBase;
}

module.exports.getOffers = getOffers;