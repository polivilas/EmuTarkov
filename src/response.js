"use strict";

var utility = require('./utility.js');
var settings = require('./settings.js');
var profile = require('./profile.js');
var item = require('./item.js');
var ragfair = require('./ragfair.js');
var bots = require('./bots.js');

var assort = "/client/trading/api/getTraderAssort/";
var prices = "/client/trading/api/getUserAssortPrice/trader/";
var getTrader = "/client/trading/api/getTrader/";
var serverSettings = settings.getServerSettings();
var backendUrl = serverSettings.backendUrl;
var ip = serverSettings.ip;
var port = serverSettings.port;

function getTraders() {
	return '{"err": 0,"errmsg": null,"data": ['
			+ utility.readJson("data/configs/traders/54cb50c76803fa8b248b4571.json") + ', '	// Prapor
			+ utility.readJson("data/configs/traders/54cb57776803fa99248b456e.json") + ', '	// Therapist
			+ utility.readJson("data/configs/traders/579dc571d53a0658a154fbec.json") + ', '	// Fence 
			+ utility.readJson("data/configs/traders/58330581ace78e27b8b10cee.json") + ', '	// Skier
			+ utility.readJson("data/configs/traders/5935c25fb3acc3127c3d8cd9.json") + ', '	// Peacekeeper
			+ utility.readJson("data/configs/traders/5a7c2eca46aef81a7ca2145d.json") + ', '	// Mechanic
			+ utility.readJson("data/configs/traders/5ac3b934156ae10c4430e83c.json") + ', '	// Ragman
			+ utility.readJson("data/configs/traders/everythingTrader.json") + ', ' 		// Polivilas
			+ utility.readJson("data/configs/traders/PresetTrader.json") + ', ' 			// Jaeger
			+ utility.readJson("data/configs/traders/SecretTrader.json") + ']}';			// TheMaoci
}

function joinMatch(info) {
	var shortid = "";
	
	// check if the player is a scav
	if (info.savage == true) {
		shortid = "3XR5";
	} else {
		shortid = "3SRC";
	}

	return JSON.stringify({"err": 0,"errmsg": null,"data":[{"profileid": "5c71b934354682353958e983", "status": "busy", "ip": "", "port": 0, "location": info.location, "sid": "", "gamemode": "deathmatch", "shortid": shortid} ] });
}

function getWeather() {
	var today = new Date();
	var day = ("0" + today.getDate()).substr(-2);
	var month = ("0" + (today.getMonth() + 1)).substr(-2);
	var year = ("000" + (today.getYear() + 1)).substr(-4);
	var hours = ("0" + today.getHours()).substr(-2);
	var minutes = ("0" + today.getMinutes()).substr(-2);
	var seconds = ("0" + today.getSeconds()).substr(-2);
	var date = today.getFullYear() + "-" + month + "-" + day;
	var time = hours + ":" + minutes + ":" + seconds;
	var dateTime = date + " " + time;

	return '{"err":0, "errmsg":null, "data":{"weather":{"timestamp":' + Math.floor(today / 1000) + ', "cloud":-0.475, "wind_speed":2, "wind_direction":3, "wind_gustiness":0.081, "rain":1, "rain_intensity":0, "fog":0.002, "temp":14, "pressure":763, "date":"' + date + '", "time":"' + dateTime + '"}, "date":"' + date + '", "time":"' + time + '", "acceleration":1}}';			
}

function get(req, body) {
	var output = "";
	var url = req.url;
	var info = JSON.parse("{}");

	// parse body
	if (body != "") {
		info = JSON.parse(body);
	}
	
	// remove retry from URL
	if (url.includes("?retry=")) {
		url = url.split("?retry=")[0];
	}

	console.log("ProfileID: " + profile.getActiveID());
	console.log("Request: " + url);
	console.log(info);

	// handle special cases
	if (url.includes(assort)) {
		return utility.readJson("data/configs/assort/" + url.replace(assort, '') + ".json");
	}
	
	if (url.includes(prices)) {
		return JSON.stringify(profile.getPurchasesData());
	}
	
	if (url.includes(getTrader)) {
		return '{"err":0, "errmsg":null, "data":' + utility.readJson("data/configs/traders/" + url.replace(getTrader, '') + ".json") + '}';
	}

	if (url.includes("/data/images/")) {
		return "IMAGE";
	}
	
	if (url.includes("/push/notifier/get/")) {
		return '{"err":0, "errmsg":null, "data":[]}';
	}

	switch (url) {
		case "/":
			output = '0.11.7.3333 | EmuTarkov';
			break;

		case "/client/friend/list":
			output = '{"err":0, "errmsg":null, "data":{"Friends":[], "Ignore":[], "InIgnoreList":[]}}';
			break;

		case "/client/game/profile/items/moving":
			output = item.moving(info);
			break;
			
		case "/client/mail/dialog/list":
			output = '{"err":0, "errmsg":null, "data":[]}';
			break;

		case "/client/friend/request/list/outbox":
		case "/client/friend/request/list/inbox":
			output = '{"err":0, "errmsg":null, "data":[]}';
			break;

		case "/client/languages":
			output = utility.readJson('data/configs/locale/languages.json');
            break;

		case "/client/menu/locale/en":
			output = utility.readJson('data/configs/locale/en/menu.json');
			break;

        case "/client/menu/locale/ru":
		    output = utility.readJson('data/configs/locale/ru/menu.json');
			break;

		case "/client/locale/en":
		case "/client/locale/En":
			output = utility.readJson('data/configs/locale/en/global.json');
			break;

		case "/client/locale/ru":
		case "/client/locale/Ru":
		    output = utility.readJson('data/configs/locale/ru/global.json');
			break;

		case "/client/game/version/validate":
			output = '{"err":0, "errmsg":null, "data":null}';
			break;

		case "/client/game/login":
			output = profile.findID(info, backendUrl);
			break;

		case "/client/game/logout":
			output = '{"err":0, "errmsg":null, "data":null}';
			break;

		case "/client/queue/status":
			output = '{"err":0, "errmsg":null, "data":{"status": 0, "position": 0}}';
			break;

		case "/client/items":
			output = utility.readJson('data/configs/items.json');
			break;

		case "/client/globals":
			output = utility.readJson('data/configs/globals.json');
			break;

		case "/client/game/profile/list":
			output = JSON.stringify(profile.getCharacterData());
			break;

		case "/client/game/profile/select":
			output = '{"err":0, "errmsg":null, "data":{"status":"ok", "notifier":{"server":"' + backendUrl + '", "channel_id":"f194bcedc0890f22db37a00dbd7414d2afba981eef61008159a74a29d5fee1cf"}}}';
			break;

		case "/client/profile/status":
			output = '{"err":0, "errmsg":null, "data":[{"profileid":"5c71b934354682353958e983", "status":"Free", "sid":"", "ip":"", "port":0}, {"profileid":"5c71b934354682353958e984", "status":"Free", "sid":"", "ip":"", "port":0}]}';
			break;

		case "/client/game/keepalive":
			output = '{"err":0, "errmsg":null, "data":null}';
			break;

		case "/client/weather":
			output = getWeather();
			break;

		case "/client/locations":
			output = utility.readJson('data/configs/locations.json');
			break;

		case "/client/handbook/templates":
			output = utility.readJson('data/configs/templates.json');
			break;

		case "/client/quest/list":
			bots.generatePlayerScav();
			output = utility.readJson('data/configs/questList.json');
			break;

		case "/client/getMetricsConfig":
			output = utility.readJson('data/configs/metricsConfig.json');
			break;

		case "/client/putMetrics":
			output = '{"err":0, "errmsg":null, "data":null}';
			break;

		case "/client/game/bot/generate":
			output = JSON.stringify( {"err": 0,"errmsg": null,"data": bots.generate(JSON.parse(body)) } );
			break;

		case "/client/trading/api/getTradersList":
			output = getTraders();
			break;

		case "/client/server/list":
			output = '{"err":0, "errmsg":null, "data":[{"ip":"'+ ip +'", "port":"' + port + '"}]}';
			break;

		case "/client/ragfair/search":
			output = ragfair.getOffers(info);
			break;

		case "/client/match/available":
			output = '{"err":0, "errmsg":null, "data":true}';
			break;

		case "/client/match/join":
			output = joinMatch(info);
			break;

		case "/client/match/exit":
			output = '{"err":0, "errmsg":null, "data":null}';
			break;

		case "/client/chatServer/list":
			output = '{"err":0, "errmsg":null, "data":[{"_id":"5ae20a0dcb1c13123084756f", "RegistrationId":20, "DateTime":' + Math.floor(new Date() / 1000) + ', "IsDeveloper":true, "Regions":["EUR"], "VersionId":"bgkidft87ddd", "Ip":"", "Port":0, "Chats":[{"_id":"0", "Members":0}]}]}';
			break;

		case "/client/game/profile/nickname/change":
			output = profile.changeNickname(info);
			break;
			
		case "/favicon.ico":
		case "/client/notifier/channel/create":
		case "/client/game/profile/search":
		case "/client/match/group/status":
		case "/client/match/group/looking/stop":
		case "/client/match/group/exit_from_menu":
			break;

		default:
			console.log('\x1b[31m',"UNHANDLED REQUEST " + req.url,'\x1b[0m');
			break;
	}

	return output;
}

module.exports.get = get;