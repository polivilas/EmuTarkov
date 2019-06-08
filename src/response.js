"use strict";

var utility = require('./utility.js');
var settings = require('./settings.js');
var item = require('./item.js');
var ragfair = require('./ragfair.js');
var bots = require('./bots.js');

var assort = new RegExp('/client/trading/api/getTraderAssort/([a-z0-9])+', 'i');
var prices = new RegExp('/client/trading/api/getUserAssortPrice/([a-z0-9])+', 'i');
var getTrader = new RegExp('/client/trading/api/getTrader/', 'i');
var traderImg = new RegExp('/files/([a-z0-9/\.jpng])+', 'i');
var content = new RegExp('/uploads/([a-z0-9/\.jpng_])+', 'i');
var pushNotifier = new RegExp('/push/notifier/get/', 'i');
var serverSettings = settings.getServerSettings();
var backendUrl = serverSettings.backendUrl;
var ip = serverSettings.ip;
var port = serverSettings.port;

function moveItem(info) {
    var output = "";
		
	// handle all items
    for (var a = 0; a < info.data.length; a++) {
        output = item.handleMoving(info.data[a]);
    }

	// return items
    if (output == "OK") {
        return JSON.stringify(item.getOutput());
    }

    return output;    
}

function joinMatch(body) {
    var clientrequest = JSON.parse(body);
	var shortid = "";
	
	// check if the player is a scav
	if (clientrequest.savage == true) {
		shortid = "3XR5";
	} else {
		shortid = "3SRC";
	}

	return JSON.stringify( {"err": 0,"errmsg": null,"data": [ {"profileid": "5c71b934354682353958e983", "status": "busy", "ip": "", "port": 0, "location": clientrequest.location, "sid": "", "gamemode": "deathmatch", "shortid": shortid} ] });
}

function changeNickname(body) {
    var clientrequest = JSON.parse(body);
	var tmpList = JSON.parse(utility.readJson("data/list.json"));

	// apply nickname
	tmpList.data[0].Info.Nickname = clientrequest.nickname;
	tmpList.data[0].Info.LowerNickname = clientrequest.nickname.toLowerCase();
	tmpList.data[1].Info.Nickname = clientrequest.nickname;
	tmpList.data[1].Info.LowerNickname = clientrequest.nickname.toLowerCase();
	
    utility.writeJson('data/list.json', tmpList);
    return '{"err":0, "errmsg":null, "data":{"status":0, "nicknamechangedate":' + Math.floor(new Date() / 1000) + '}}';	
}

function get(req, body, url) {
	var output = "";
	var info = JSON.parse("{}");

	// parse body
	if (body != "") {
		try {
			info = JSON.parse(body);
		} catch(err) {
			console.error(err);
		}
	}

	console.log(url + " with data " + body);

	// handle special cases
	if (url.match(assort)) {
		return utility.readJson("data/assort/" + url.substring(36).replace(/[^a-zA-Z0-9_]/g, '') + ".json");
	}
	
	if (url.match(prices)) {
		return utility.readJson("data/prices/" + url.substring(46).replace(/[^a-zA-Z0-9_]/g, '') + ".json"); // thats some budget ass shit
	}
	
	if (url.match(getTrader)) {
		console.log(url.substring(30));
		return '{"err":0, "errmsg":null, "data":{"_id":"' + url.substring(30) + '", "working":true, "name":"ez", "surname":"ez", "nickname":"ez", "location":"", "avatar":"/files/trader/avatar/59b91ca086f77469a81232e4.jpg", "balance_rub":80000000, "balance_dol":80000000, "balance_eur":80000000, "display":true, "discount":1337, "discount_end":0, "buyer_up":false, "currency":"RUB", "supply_next_time":1551040000, "repair":{"availability":true, "quality":"1.2", "excluded_id_list":[], "excluded_category":[], "currency":"5449016a4bdc2d6f028b456f", "currency_coefficient":1, "price_rate":0}, "insurance":{"availability":true, "min_payment":0, "min_return_hour":24, "max_return_hour":36, "max_storage_time":72, "excluded_category":[]}, "gridHeight":1000, "loyalty":{"currentLevel":1337, "currentStanding":1337, "currentSalesSum":1337, "loyaltyLevels":{"0":{"minLevel":1, "minSalesSum":0, "minStanding":0}, "1":{"minLevel":1, "minSalesSum":1, "minStanding":1}, "2":{"minLevel":1, "minSalesSum":1, "minStanding":1}, "3":{"minLevel":1, "minSalesSum":1, "minStanding":1}}}, "sell_category":[]}}';
	}
	
	if (url.match(traderImg) || url.match(content)) {
		return "DEAD";
	}
	
	if (url.match(pushNotifier)) {
		return '{"err":0, "errmsg":null, "data":[]}';
	}

	switch(url) {
		case "/":
			output = 'EFT backend emulator for Escape From Tarkov version 0.11.7.3287 by polivilas @ UnKnoWnCheaTs.me';
			break;

		case "/client/friend/list":
			output = '{"err":0, "errmsg":null, "data":{"Friends":[], "Ignore":[], "InIgnoreList":[]}}';
			break;

		case "/client/game/profile/items/moving":
			output = moveItem(info);
			break;
			
		case "/client/mail/dialog/list":
			output = '{"err":0, "errmsg":null, "data":[]}';
			break;

		case "/client/friend/request/list/outbox":
		case "/client/friend/request/list/inbox":
			output = '{"err":0, "errmsg":null, "data":[]}';
			break;

		case "/client/languages":
			output = '{"err":0, "errmsg":null, "data":[{"ShortName":"en", "Name":"English"}, {"ShortName":"ru", "Name":"Русский"}], "crc":0}';

		case "/client/menu/locale/en":
		case "/client/menu/locale/ru":
			output = '{"err":0, "errmsg":null, "data":{"menu":{"NEXT":"NEXT", "Escape from Tarkov":"ESCAPE FROM TARKOV", "Servers are currently at full capacity":"Servers are currently at full capacity", "EXIT":"EXIT", "REMEMBER ACCOUNT":"REMEMBER ACCOUNT", "AUTHORIZATION":"AUTHORIZATION", "Profile data loading...":"Profile data loading...", "{0} Beta version":"{0} Beta version | EmuTarkov", "DOWN: ":"DOWN: ", "LEFT: ":"LEFT: ", "RIGHT: ":"RIGHT: "}}, "crc":0}';
			break;

		case "/client/game/version/validate":
			output = '{"err":0, "errmsg":null, "data":null}';
			break;

		case "/client/game/login":
			output = '{"err":0, "errmsg":null, "data":{"token":"token_1337", "aid":1337, "lang":"en", "languages":{"en":"English"}, "ndaFree":true, "queued":false, "taxonomy":341, "activeProfileId":"5c71b934354682353958e984", "backend":{"Trading":"' + backendUrl + '", "Messaging":"' + backendUrl + '", "Main":"' + backendUrl + '", "RagFair":"' + backendUrl + '"}, "utc_time":1337, "totalInGame":0, "twitchEventMember":false}}';
			break;

		case "/client/game/logout":
			output = '{"err":0, "errmsg":null, "data":null}';
			break;

		case "/client/queue/status":
			output = '{"err":0, "errmsg":null, "data":{"status": 0, "position": 0}}';
			break;

		case "/client/items":
			output = utility.readJson('data/items.json');
			break;

		case "/client/globals":
			output = utility.readJson('data/globals.json');
			break;

		case "/client/game/profile/list":
			output = utility.readJson('data/list.json');
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
			output = '{"err":0, "errmsg":null, "data":{"weather":{"timestamp":' + Math.floor(new Date() / 1000) + ', "cloud":-0.475, "wind_speed":2, "wind_direction":3, "wind_gustiness":0.081, "rain":1, "rain_intensity":0, "fog":0.002, "temp":14, "pressure":763, "date":"2019-02-24", "time":"2019-02-24 19:15:02"}, "date":"2019-02-24", "time":"21:02:30", "acceleration":7}}';
			break;

		case "/client/locale/en":
		case "/client/locale/En":
		case "/client/locale/ru":
		case "/client/locale/Ru":
			output = utility.readJson('data/locale_en.json');
			break;

		case "/client/locations":
			output = utility.readJson('data/locations.json');
			break;

		case "/client/handbook/templates":
			output = utility.readJson('data/templates.json');
			break;

		case "/client/quest/list":
			output = utility.readJson('data/questList.json');
			break;

		case "/client/getMetricsConfig":
			output = utility.readJson('data/metricsConfig.json');
			break;

		case "/client/putMetrics":
			output = '{"err":0, "errmsg":null, "data":null}';
			break;

		case "/client/game/bot/generate":
			output = JSON.stringify( {"err": 0,"errmsg": null,"data": bots.generate(JSON.parse(body)) } );
			break;

		case "/client/trading/api/getTradersList":
			output = utility.readJson('data/traderList.json');
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
			output = joinMatch(body);
			break;

		case "/client/match/exit":
			output = '{"err":0, "errmsg":null, "data":null}';
			break;

		case "/client/chatServer/list":
			output = '{"err":0, "errmsg":null, "data":[{"_id":"5ae20a0dcb1c13123084756f", "RegistrationId":20, "DateTime":' + Math.floor(new Date() / 1000) + ', "IsDeveloper":true, "Regions":["EUR"], "VersionId":"bgkidft87ddd", "Ip":"", "Port":0, "Chats":[{"_id":"0", "Members":0}]}]}';
			break;

		case "/client/game/profile/nickname/change":
            output = changeNickname(body);
			break;

		default:
			console.log('\x1b[31m',"UNHANDLED REQUEST " + req.url,'\x1b[0m');
			break;
	}

	return output;
}

module.exports.get = get;