module.exports = function(isFirstLaunch = false, time = 0) {	
	global.fs = require('fs');
	global.path = require('path');
	global.util = require('util');
	global.http = require('http');
	global.https = require('https');
	global.zlib = require('zlib');
	global.adler32 = require('adler32');
	global.os = require('os');

	global.json = require('./json.js');
	global.utility = require('./utility.js');
	global.logger = require('./logger.js');

	if (isFirstLaunch) {
		logger.start();
		logger.logSuccess("Main require() files loaded... [" + String(new Date() - time) + "]");
	}	

	// setup server
	global.settings = json.parse(json.read("user/server.config.json"));
	global.ended_at = 0;
	global.ip = settings.server.ip;
	global.items = "";
	global.quests = "";
	global.locations = "";
	global.weathers = '{}';

	if (isFirstLaunch) {
		logger.logSuccess("Main variables setted properly... [" + String(new Date() - time) + "]");
	}

	// setup routes
	global.filepaths = json.parse(json.read("db/cache/filepaths.json"));
	global.mods = require('./caching/_mods.js');
	global.route = require('./caching/_route.js');
	route.all();

	if (isFirstLaunch) {
		logger.logSuccess("Files routed... [" + String(new Date() - time) + "]");
	}

	// setup cache
	global.cache = require('./caching/_cache.js');
	cache.all();

	if (isFirstLaunch) {
		logger.logSuccess("Files cached... [" + String(new Date() - time) + "]");
	}

	// global data
	global.items = json.parse(json.read(filepaths.user.cache.items));
	global.locations = json.parse(json.read(filepaths.user.cache.locations));
	global.weather = json.parse(json.read(filepaths.user.cache.weather));
	global.quests = json.parse(json.read(filepaths.user.cache.quests));
	global.globalSettings = json.parse(json.read(filepaths.user.cache.globals));
	global.customization_m = json.parse(json.read(filepaths.user.cache.customization_outfits));
	global.templates = json.parse(json.read(filepaths.user.cache.templates));

	if (isFirstLaunch) {
		logger.logSuccess("Finished loading json files into library... [" + String(new Date() - time) + "]");
	}

	// Other
	global.locale = require('./locale.js');							// locale changer function
	global.index_f = require('./response/_homeCredits.js');			// response/_homeCredits
	global.repair_f = require('./item/_repair.js');					// response/_repair
	global.insure_f = require('./item/_insure.js');					// response/_insure
	global.keepAlive_f = require('./response/_keepAlive.js');		// response/_keepAlive
	global.server = require('./server/_start.js');					// server/_start
	global.constants = require('./server/_constants.js');			// server/_constants
	global.header_f = require('./server/_sendHeader.js');			// server/_sendHeader
	global.profile = require('./profile.js');						// profile
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
	
	if (isFirstLaunch) {
		logger.logSuccess("Finished loading game server functions... [" + String(new Date() - time) + "]");
	}

	if (isFirstLaunch) {
		logger.logSuccess("[Library Loaded] " + String(new Date() - time));
	}
}