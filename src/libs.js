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
	global.customizationOutfits = json.parse(json.read(filepaths.user.cache.customization_outfits));
	global.customizationOffers = json.parse(json.read(filepaths.user.cache.customization_offers));
	global.templates = json.parse(json.read(filepaths.user.cache.templates));

	if (isFirstLaunch) {
		logger.logSuccess("Finished loading json files... [" + String(new Date() - time) + "]");
	}

	// Other
	global.locale = require('./response/_locale.js');
	global.index_f = require('./response/_homeCredits.js');
	global.assort_f = require('./response/_assort.js');
	global.keepAlive_f = require('./response/_keepAlive.js');
	global.offraid_f = require('./response/_offraid.js');
	global.server = require('./server/_start.js');
	global.constants = require('./server/_constants.js');
	global.header_f = require('./server/_sendHeader.js');
	global.account_f = require('./response/_account.js');
	account_f.init();
	global.profile_f = require('./response/_profile.js');
	global.bots = require('./response/_bots.js');
	global.itm_hf = require('./item/helpFunctions.js');
	global.quest_f = require('./item/_quest.js');
	global.note_f = require('./item/_notes.js');
	global.move_f = require('./item/_move.js');
	global.status_f = require('./item/_status.js');
	global.wishList_f = require('./item/_wishList.js');
	global.character_f = require('./item/_character.js');
	global.trade_f = require('./item/_trade.js');
	global.customization_f = require('./item/_customization.js');
	global.hideout_f = require('./item/_hideout.js');
	global.weaponBuilds_f = require('./item/_weaponBuilds.js');
	global.repair_f = require('./item/_repair.js');
	global.insure_f = require('./item/_insure.js');
	global.item = require('./response/_item.js');
	global.trader = require('./response/_trader.js');
	global.ragfair = require('./response/_ragfair.js');
	global.response = require('./response.js');
	
	if (isFirstLaunch) {
		logger.logSuccess("Finished loading game server functions... [" + String(new Date() - time) + "]");
		logger.logSuccess("[Library Loaded]");
	}
}