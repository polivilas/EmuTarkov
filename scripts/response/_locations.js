"use strict";

require('../libs.js');

//// ---- FUNCTIONS BELOW ---- ////

function prepareLocations() {
	if (!fs.existsSync("appdata/cache/cache_locations.json")){
		console.log("rebuilding locations cache...");

		let locationsTable = [];
		let locationsDir = "database/configs/maps/";
		let locations_base = fs.readdirSync(locationsDir);
		let locations_maps = JSON.parse(utility.readJson('database/configs/maps/locationsBase.json'));
		let locations = locations_maps.data.locations;

		for (let file in locationsDir) {
			if (locationsDir.hasOwnProperty(file)) {
				if (locations_base[file] !== undefined) {
					if (locations_base.hasOwnProperty(file)) {
						let temp_fileData = JSON.parse(utility.readJson(locationsDir + locations_base[file]));
						let locationId = temp_fileData._Id;

						locationsTable.push(locationId);
						locations[locationId] = temp_fileData;
					}
				}
			}
		}

		locations_maps.data.locations = locations;
		
		for (let location_path in locations_maps.data.paths) {
			if (locationsTable.indexOf(locations_maps.data.paths[location_path].Source) == -1 || locationsTable.indexOf(locations_maps.data.paths[location_path].Destination) == -1) {
				locations_maps.data.paths.splice(location_path, 1);
			}
		}

		utility.writeJson("appdata/cache/cache_locations.json", locations_maps);	
		return locations_maps;
	} else {
		if (locations == "") {
			return JSON.parse(utility.readJson("appdata/cache/cache_locations.json"));
		} else {
			return locations;
		}
	}
}

/* LootGenerator - tool used to generate new loot for api/location
* input: location as object
* output: location as object
* */
function LootGenerator(location)
{
	let itemsKeys_ = Object.keys(items.data);
	
	for (let lootspawn in location.Loot) {
		if (location.Loot[lootspawn].IsStatic == false) {
			// its static place for loot we dont need to change main object _id for that so we just changing _tpl
			location.Loot[lootspawn].Items[0]._tpl = itemsKeys_[utility.getRandomIntEx(itemsKeys_.length)]._id
		}
	}
	
	//utility.writeJson("debug_map_generator.json",location.Loot);
	return location;
}
//// ---- EXPORT LIST ---- ////

module.exports.prepareLocations = prepareLocations;
module.exports.LootGenerator = LootGenerator;