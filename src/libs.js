module.exports = function(isFirstLaunch = "no", time = 0) {
	let StartingTimeTemporalVariable = time;
	
	global.fs = require('fs');
	global.path = require('path');
	global.util = require('util');
	global.http = require('http');
	global.https = require('https');
	global.zlib = require('zlib');
	global.adler32 = require('adler32');
	global.os = require('os');
	
	if (isFirstLaunch == "first") {
		console.log("Main require() files loaded... [%dms]", new Date() - StartingTimeTemporalVariable);
	}
	
	// no other files required for it
	global.json = require('./json.js');
	global.utility = require('./utility.js');

	// setup server
	global.settings = json.parse(json.read("user/server.config.json"));
	global.ended_at = 0;
	global.ip = settings.server.ip;
	global.port = 443;
	global.items = "";
	global.quests = "";
	global.locations = "";
	global.weathers = '{}';

	if (isFirstLaunch == "first") {
		console.log("Main variables setted properly... [%dms]", new Date() - StartingTimeTemporalVariable);
	}

	// setup routes
	global.filepaths = json.parse(json.read("db/cache/filepaths.json"));
	global.mods = require('./caching/_mods.js');
	global.route = require('./caching/_route.js');
	route.all();

	if (isFirstLaunch == "first") {
		console.log("Files routed... [%dms]", new Date() - StartingTimeTemporalVariable);
	}

	// setup cache
	global.cache = require('./caching/_cache.js');
	cache.all();

	if (isFirstLaunch == "first") {
		console.log("Files cached... [%dms]", new Date() - StartingTimeTemporalVariable);
	}

	// Items
	global.items_f = require('./response/_items.js');				// response/_locations
	global.items = items_f.prepareItems();							// prepare items only once
	// Locations
	global.locations_f = require('./response/_locations.js');		// response/_locations
	global.locations = locations_f.prepareLocations();				// prepare locations only once
	// Weather
	global.weather_f = require('./response/_weather.js');			// repsonse/_weather
	global.weathers = weather_f.prepareWeather();					// prepare weather only once
	// Quests
	global.quests_f = require('./response/_quests.js');				// response/_locations
	global.quests = quests_f.prepareQuests();						// prepare quests only once
	// Other
	global.printf = console.log;
	global.logger = require('./logger.js');							// logger
	global.locale = require('./locale.js');							// locale changer function
	global.index_f = require('./response/_homeCredits.js');			// response/_homeCredits
	global.repair_f = require('./response/_repair.js');				// response/_repair
	global.keepAlive_f = require('./response/_keepAlive.js');		// response/_keepAlive
	global.server = require('./server/_start.js');					// server/_start
	global.constants = require('./server/_constants.js');			// server/_constants
	global.header_f = require('./server/_sendHeader.js');			// server/_sendHeader
	global.profile = require('./profile.js');						// profile
	//global.botRandomized_f = require('./bots/_randomized.js');		// bots/_randomized
	global.botPresets_f = require('./bots/_preset.js');				// bots/_presets
	global.bots = require('./bots.js');								// bots
	global.itm_hf = require('./item/helpFunctions.js');				// item/helpFunctions
	global.quest_f = require('./item/_quest.js'); 					// item/_quest
	global.note_f = require('./item/_notes.js'); 					// item/_notes
	global.move_f = require('./item/_move.js'); 					// item/_move
	global.status_f = require('./item/_status.js'); 				// item/_status
	global.wishList_f = require('./item/_wishList.js'); 			// item/_wishList
	global.character_f = require('./item/_character.js');			// item/_character
	global.trade_f = require('./item/_trade.js'); 					// item/_trade
	global.customization_f = require('./item/_customization.js');	// item/_customization
	global.hideout_f = require('./item/_hideout.js'); 				// item/_hideout
	global.weaponBuilds_f = require('./item/_weaponBuilds.js'); 	// item/_weaponBuilds
	global.item = require('./item.js');								// items
	global.trader = require('./trader.js');							// trader
	global.ragfair = require('./ragfair.js');						// ragfair
	global.response = require('./response.js');						// response
	
	if (isFirstLaunch == "first") {
		printf("Finished loading game server functions... [%dms]", new Date() - StartingTimeTemporalVariable);
	}

	// yea this is tough but loads only once
	global.names = json.parse(json.read(filepaths.bots.names));
	global.botBase = json.parse(json.read(filepaths.bots.base));

	global.globalSettings = json.parse(json.read(filepaths.globals));
	global.customization_m = json.parse(json.read(filepaths.user.cache.customization_outfits));
	
	if (isFirstLaunch == "first") {
		printf("Finished loading json files into library... [%dms]", new Date() - StartingTimeTemporalVariable);
	}
}

/* Made by TheMaoci - Load only once */
