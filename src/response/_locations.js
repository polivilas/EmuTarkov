"use strict";

require('../libs.js');

//// ---- FUNCTIONS BELOW ---- ////

function prepareLocations() {

	if(!fs.existsSync('data/configs/cache_locations.json')){
		console.log("rebuilding locations cache...");
		let locationsTable = [];
		let locationsDir = "data/configs/database/maps/";
		let locations_base = fs.readdirSync(locationsDir);
		let locations_maps = JSON.parse(utility.readJson('data/configs/database/locationsBase.json'));
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
		utility.writeJson('data/configs/cache_locations.json', locations_maps);	
		return locations_maps;
	} else {
		if(locations == "")
			return JSON.parse(utility.readJson('data/configs/cache_locations.json'));
		else
			return locations;
	}
}

//// ---- EXPORT LIST ---- ////

module.exports.prepareLocations = prepareLocations;
