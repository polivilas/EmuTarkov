//"use strict";
const express = require('express');
global.fs = require('fs');
global.path = require('path');
global.util = require('util');
global.http = require('http');
global.https = require('https');
global.zlib = require('zlib');
global.adler32 = require('adler32');
global.os = require('os');
global.app = express();

global.settings = JSON.parse( (fs.readFileSync("server.config.json", 'utf8')).replace(/[\r\n\t]/g, '').replace(/\s\s+/g, '') );
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
global.utility = require('./utility.js');					// utility // no other files required for it
// Temp Items
global.items_f = require('./response/_items.js');			// response/_locations
global.items = items_f.prepareItems();						// prepare items only once
// Temp Locations
global.locations_f = require('./response/_locations.js');	// response/_locations
global.locations = locations_f.prepareLocations();			// prepare locations only once
// Temp Quests
global.quests_f = require('./response/_quests.js');			// response/_locations
global.quests = quests_f.prepareQuests();					// prepare quests only once

global.logger = require('./logger.js');						// logger
global.locale = require('./locale.js');						// locale changer function
global.index_f = require('./response/_homeCredits.js');			// response/_homeCredits
global.weather_f = require('./response/_weather.js');			// response/_weather
global.repair_f = require('./response/_repair.js');				// response/_repair
global.keepAlive_f = require('./response/_keepAlive.js');		// response/_keepAlive
global.response = require('./response.js');					// response
global.server = require('./server/_start.js');					// server/_start
global.constants = require('./server/_constants.js');			// server/_constants
global.header_f = require('./server/_sendHeader.js');			// server/_sendHeader
global.profile = require('./profile.js');					// profile
global.bots = require('./bots.js');							// bots
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
global.item = require('./item.js');							// items
global.trader = require('./trader.js');						// trader
global.ragfair = require('./ragfair.js');					// ragfair
// load data

global.globalSettings = JSON.parse(utility.readJson("data/configs/globals.json"));
global.customization_m = JSON.parse(utility.readJson("data/configs/customization/customization.json"));

/* NOT USED ANYMORE */
//global.backpackLootTable = JSON.parse(utility.readJson("data/configs/bots/botBackpackLootTable.json")).BackpackLootTable;
//global.presets = JSON.parse(utility.readJson("data/configs/bots/botPresets.json"));
//global.weaponPresets = JSON.parse(utility.readJson("data/configs/bots/botWeapons.json"));
//global.presets_PMC = JSON.parse(utility.readJson("data/configs/bots/pmcPresets.json"));
//global.weaponPresets_PMC = JSON.parse(utility.readJson("data/configs/bots/pmcWeapons.json"));


/* Made by TheMaoci - Load only once */
