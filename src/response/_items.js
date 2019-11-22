"use strict";

require('../libs.js');

let itemsCatched = settings.server.itemsCached; // its only flag to recreate items

//// ---- FUNCTIONS BELOW ---- ////

function prepareItems() {
	if(!itemsCatched || !fs.existsSync('data/configs/cache_items.json')){
		console.log("rebuilding items cache...");
		let itemsDir = ["data/configs/database/items_stock/", "data/configs/database/items_modded/"];
		let items_BaseJSON = JSON.parse(utility.readJson('data/configs/database/itemsBase.json'));
		let items_data = items_BaseJSON.data;
		for(let i = 0; i< itemsDir.length; i++){
			let items_List = fs.readdirSync(itemsDir[i]);
			// load trader files
			for (let file in items_List) {
				if (typeof items_List[file] != "undefined") {
							let temp_fileData = JSON.parse(utility.readJson(itemsDir[i] + items_List[file]));
							if(settings.debug.ExaminedByDefault === true)
								temp_fileData._props.ExaminedByDefault = true;
							items_data[temp_fileData._id] = temp_fileData;
				}
			}
		}
		items_BaseJSON.data = items_data;
		items = items_BaseJSON;
		utility.writeJson('data/configs/cache_items.json', items_BaseJSON);
		if(settings.server.itemsCached == false){
			settings.server.itemsCached = true;
			utility.writeJson("server.config.json", settings);
		}
		return items_BaseJSON;
	} else {
		if(items == "")
			return JSON.parse(utility.readJson('data/configs/cache_items.json'));
		else
			return items;
	}
}

//// ---- EXPORT LIST ---- ////

module.exports.prepareItems = prepareItems;
