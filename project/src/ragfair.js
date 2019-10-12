"use strict";

require('./libs.js');
const handbook = JSON.parse(utility.readJson('data/configs/templates.json'));

//cloth
let cat_cloth = ["5b47574386f77428ca22b33f", "5b5f701386f774093f2ecf0f", "5b47574386f77428ca22b32f", "5b5f6fd286f774093f2ecf0d", "5b47574386f77428ca22b331", "5b5f6f6c86f774093f2ecf0b", "5b47574386f77428ca22b330", "5b5f6fa186f77409407a7eb7", "5b5f704686f77447ec5d76d7", "5b5f6f3c86f774094242ef87", "5b5f6f8786f77447ed563642"];
//mods
let cat_mod_gear = ["5b5f750686f774093e6cb503", "5b5f752e86f774093e6cb505", "5b5f757486f774093e6cb507", "5b5f755f86f77447ec5d770e", "5b5f751486f77447ec5d770c", "5b5f759686f774094242f19d", "5b5f754a86f774094242f19b"];
let cat_mod_vital = ["5b5f75b986f77447ec5d7710", "5b5f760586f774093e6cb509", "5b5f75c686f774094242f19f", "5b5f75e486f77447ec5d7712", "5b5f761f86f774094242f1a1", "5b5f764186f77447ec5d7714"];
let cat_mod_func = ["5b5f71b386f774093f2ecf11", "5b5f736886f774094242f193", "5b5f737886f774093e6cb4fb", "5b5f73ab86f774094242f195", "5b5f73c486f77447ec5d7704", "5b5f74cc86f77447ec5d770a", "5b5f71c186f77409407a7ec0", "5b5f71de86f774093f2ecf13", "5b5f724186f77447ed5636ad", "5b5f724c86f774093f2ecf15", "5b5f731a86f774093e6cb4f9", "5b5f72f786f77447ec5d7702", "5b5f73ec86f774093e6cb4fd", "5b5f744786f774094242f197", "5b5f748386f774093e6cb501", "5b5f742686f774093e6cb4ff", "5b5f746686f77447ec5d7708", "5b5f749986f774094242f199", "5b5f740a86f77447ec5d7706"];
//barter
let cat_barter = ["5b47574386f77428ca22b33e", "5b47574386f77428ca22b2ef", "5b47574386f77428ca22b2f0", "5b47574386f77428ca22b2f2", "5b47574386f77428ca22b2f6", "5b47574386f77428ca22b2ee", "5b47574386f77428ca22b2f3", "5b47574386f77428ca22b2f4", "5b47574386f77428ca22b2f1", "5b47574386f77428ca22b2ed"];
//meds
let cat_meds = ["5b47574386f77428ca22b344", "5b47574386f77428ca22b338", "5b47574386f77428ca22b33a", "5b47574386f77428ca22b337", "5b47574386f77428ca22b339"];
//ammo
let cat_ammo = ["5b47574386f77428ca22b346", "5b47574386f77428ca22b33c", "5b47574386f77428ca22b33b"];
// maps
let cat_maps = ["5b47574386f77428ca22b343"];
// money
let cat_money = ["5b5f78b786f77447ed5636af"];
// food
let cat_food = ["5b47574386f77428ca22b340", "5b47574386f77428ca22b336", "5b47574386f77428ca22b335"];
// granades
let cat_granades = ["5b5f7a2386f774093f2ed3c4"];
//skip
let skipThisId = ["56e294cdd2720b603a8b4575", "59e8936686f77467ce798647", "58ac60eb86f77401897560ff", "544901bf4bdc2ddf018b456d"];

function prepareCatItems(categ) {
    let flag_itsOKtoAdd = false;
    let multiplier = 1;
    if (cat_cloth.indexOf(categ.ParentId) !== -1 || cat_maps.indexOf(categ.ParentId) !== -1) {
        multiplier = 1.5;
        flag_itsOKtoAdd = true;
    } else if (cat_mod_gear.indexOf(categ.ParentId) !== -1 || cat_mod_vital.indexOf(categ.ParentId) !== -1 || cat_mod_func.indexOf(categ.ParentId) !== -1) {
        multiplier = 1.5;
        flag_itsOKtoAdd = true;
    } else if (cat_barter.indexOf(categ.ParentId) !== -1) {
        multiplier = 2;
        flag_itsOKtoAdd = true;
    } else if (cat_meds.indexOf(categ.ParentId) !== -1) {
        multiplier = 1.3;
        flag_itsOKtoAdd = true;
    } else if (cat_ammo.indexOf(categ.ParentId) !== -1 || cat_money.indexOf(categ.ParentId) !== -1 || cat_food.indexOf(categ.ParentId) !== -1) {
        multiplier = 1.05;
        flag_itsOKtoAdd = true;
    } else if (cat_granades.indexOf(categ.ParentId) !== -1) {
        multiplier = 1.2;
        flag_itsOKtoAdd = true;
    }
    return [flag_itsOKtoAdd, multiplier]
}

function getOffers(request) {
    let response = JSON.parse(utility.readJson("data/configs/ragfair/search.json"));

    // request an item or a category of items
    if (request.handbookId !== "") {
        let isCateg = false;

        for (let categ of handbook.data.Categories) {
            //if (category allowed add item else continue)
            // find the category in the handbook
            if (categ.Id === request.handbookId) {
                isCateg = true;

                // list all item of the category
                for (let item of handbook.data.Items) {
                    let prep_it = prepareCatItems(item);
                    if (prep_it[0] === true) {
                        if (item.ParentId === categ.Id && skipThisId.indexOf(item.Id) === -1) {
                            response.data.offers.push(createOffer(item.Id, (item.Price * prep_it[1])));
                        }
                    }
                }

                // recursive loops for sub categories
                for (let categ2 of handbook.data.Categories) {
                    if (categ2.ParentId === categ.Id) {
                        for (let item of handbook.data.Items) {
                            let prep_it = prepareCatItems(item);
                            if (prep_it[0] === true) {
                                if (item.ParentId === categ2.Id && skipThisId.indexOf(item.Id) === -1) {
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
        if (typeof itemLink._props.Slots !== "undefined") {
            for (let itemSlot of itemLink._props.Slots) {
                for (let itemSlotFilter of itemSlot._props.filters) {
                    for (let mod of itemSlotFilter.Filter) {
                        for (let someitem of handbook.data.Items) {
                            let prep_it = prepareCatItems(someitem);
                            if (prep_it[0] === true) {
                                if (someitem.Id === mod && skipThisId.indexOf(someitem.Id) === -1) {
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