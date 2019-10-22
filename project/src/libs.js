//"use strict";
global.fs = require('fs');
global.path = require('path');
global.util = require('util');
global.http = require('http');
global.zlib = require('zlib');
global.adler32 = require('adler32');
global.os = require('os');

global.settings = JSON.parse((fs.readFileSync("server.config.json", 'utf8'))
																	.replace(/[\r\n\t]/g, '')
																	.replace(/\s\s+/g, '')
							);
global.backendUrl = settings.server.backendUrl;
global.ip = settings.server.ip;
global.port = settings.server.port;
global.assort = "/client/trading/api/getTraderAssort/";
global.prices = "/client/trading/api/getUserAssortPrice/trader/";
global.getTrader = "/client/trading/api/getTrader/";
global.localeGlobal = "/client/locale/";
global.localeMenu = "/client/menu/locale/";
global.items = "";
global.quests = "";
global.locations = "";
global.utility = require('./utility.js');				// utility // no other files required for it
global.items = utility.prepareItemsFile();				// prepare items only once

global.logger = require('./logger.js');					// logger
global.locale = require('./locale.js');					// locale
global.index_f = require('./response/_homeCredits.js');		// response/_homeCredits
global.weather_f = require('./response/_weather.js');		// response/_weather
global.repair_f = require('./response/_repair.js');			// response/_repair
global.keepAlive_f = require('./response/_keepAlive.js');	// response/_keepAlive
global.locations_f = require('./response/_locations.js');	// response/_locations
global.quests_f = require('./response/_quests.js');			// response/_locations
global.response = require('./response.js');				// response
global.server = require('./server/_start.js');				// server/_start
global.constants = require('./server/_constants.js');		// server/_constants
global.header_f = require('./server/_sendHeader.js');		// server/_sendHeader
global.profile = require('./profile.js');				// profile
global.bots_mf = require('./bots/_mainFunctions.js');		// bots/_mainFunctions
global.appeariance_f = require('./bots/_appeariance.js');	// bots/_appeariance
global.stats_f = require('./bots/_stats.js');				// bots/_stats
global.names_f = require('./bots/_names.js');				// bots/_names
global.itemPattern_f = require('./bots/_itemPattern.js');	// bots/_itemPattern
global.guns_f = require('./bots/_guns.js');	// bots/_guns

global.pocket_f = require('./bots/_pocket.js');	// bots/_itemPattern
global.bots = require('./bots.js');						// bots
//global.bots = require('./bots.js');						// bots
global.itm_hf = require('./item/helpFunctions.js');			// item/helpFunctions
global.quest_f = require('./item/_quest.js'); 				// item/_quest
global.note_f = require('./item/_notes.js'); 				// item/_notes
global.move_f = require('./item/_move.js'); 				// item/_move
global.status_f = require('./item/_status.js'); 			// item/_status
global.wishList_f = require('./item/_wishList.js'); 		// item/_wishList
global.character_f = require('./item/_character.js');		// item/_character
global.trade_f = require('./item/_trade.js'); 				// item/_trade
global.item = require('./item.js');						// items
global.trader = require('./trader.js');					// trader
global.ragfair = require('./ragfair.js');				// ragfair
// load data
global.locations = locations_f.prepareLocations();
global.quests = quests_f.prepareQuests();


global.backpackLootTable = JSON.parse(utility.readJson("data/configs/bots/botBackpackLootTable.json")).BackpackLootTable;
global.presets = JSON.parse(utility.readJson("data/configs/bots/botPresets.json"));
global.weaponPresets = JSON.parse(utility.readJson("data/configs/bots/botWeapons.json"));
global.presets_PMC = JSON.parse(utility.readJson("data/configs/bots/pmcPresets.json"));
global.weaponPresets_PMC = JSON.parse(utility.readJson("data/configs/bots/pmcWeapons.json"));


/* Made by TheMaoci - Load only once */
