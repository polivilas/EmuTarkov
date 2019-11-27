"use strict";

require('../libs.js');

//// ---- FUNCTIONS BELOW ---- ////
/////////////////////////////////// TODO: REWRITE TO FULLY USE FILEROUTES.JSON ///////////////////////////////////

function prepareItems() {
	if (!fs.existsSync(fileRoutes.cache.items)) {
		console.log("rebuilding items cache...");

		let itemsDir = ["database/configs/items/", "database/configs/items_modded/"];
		let items_BaseJSON = JSON.parse(utility.readJson(fileRoutes.others.itemsBase));
		let items_data = items_BaseJSON.data;

		for (let i = 0; i< itemsDir.length; i++) {
			let items_List = fs.readdirSync(itemsDir[i]);

			// load trader files
			for (let file in items_List) {
				if (typeof items_List[file] != "undefined") {
					let temp_fileData = JSON.parse(utility.readJson(itemsDir[i] + items_List[file]));

					if(typeof temp_fileData._props != "undefined"){ // incase
						if (settings.debug.ExaminedByDefault === true && typeof temp_fileData._props.ExaminedByDefault != "undefined") {
							temp_fileData._props.ExaminedByDefault = true;
						}
					}
					
					items_data[temp_fileData._id] = temp_fileData;
				}
			}
		}

		items_BaseJSON.data = items_data;
		items = items_BaseJSON;
		utility.writeJson(fileRoutes.cache.items, items_BaseJSON);
		return items_BaseJSON;
	} else {
		if (items == "") {
			return JSON.parse(utility.readJson(fileRoutes.cache.items));
		} else {
			return items;
		}
	}
}

//// ---- EXPORT LIST ---- ////

module.exports.prepareItems = prepareItems;