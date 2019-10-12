"use strict";


const fs = require('fs');
const utility = require('../utility.js');

//// ---- FUNCTIONS BELOW ---- ////

function prepareItems() {
	let itemsTable = [];
	let itemsDir = "data/configs/items/";
    let items_base = fs.readdirSync(itemsDir);
    let items_mods = JSON.parse(utility.readJson('data/configs/items.json'));
	let items = items_mods.data;
    // load trader files
    for (let file in itemsDir) {
        if (itemsDir.hasOwnProperty(file)) {
            if (items_base[file] !== undefined) {
                if (items_base.hasOwnProperty(file)) {
					let temp_fileData = JSON.parse(utility.readJson(itemsDir + items_base[file]));
					let itm_Id = temp_fileData._id;
					itemsTable.push(itm_Id);
                    items[itm_Id] = temp_fileData;
                }
            }
        }
    }
	items_mods.data = items;
	return items_mods;
}

//// ---- EXPORT LIST ---- ////

module.exports.prepareItems = prepareItems;
