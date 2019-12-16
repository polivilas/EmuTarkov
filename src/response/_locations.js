"use strict";

require('../libs.js');

function prepareLocations() {
	if (locations == "") {
		return json.parse(json.read(filepaths.user.cache.locations));
	} else {
		return locations;
	}
}

/* LootGenerator - tool used to generate new loot for api/location
* input: location as object
* output: location as object
* */
function LootGenerator(location) {
	let itemsKeys_ = Object.keys(items.data);
	
	for (let lootspawn in location.Loot) {
		if (location.Loot[lootspawn].IsStatic == false) {
			// its static place for loot we dont need to change main object _id for that so we just changing _tpl
			location.Loot[lootspawn].Items[0]._tpl = itemsKeys_[utility.getRandomIntEx(itemsKeys_.length)]._id
		}
	}
	
	return location;
}

module.exports.prepareLocations = prepareLocations;
module.exports.LootGenerator = LootGenerator;