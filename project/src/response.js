"use strict";

const utility = require('./utility.js');
const profile = require('./profile.js');
const server = require('./server.js');
const item = require('./item.js');
const ragfair = require('./ragfair.js');
const bots = require('./bots.js');
const locale = require('./locale.js');
const trader = require('./trader.js');

var settings = JSON.parse(utility.readJson("server.config.json"));
var backendUrl = settings.server.backendUrl;
var ip = settings.server.ip;
var port = settings.server.port;
var assort = "/client/trading/api/getTraderAssort/";
var prices = "/client/trading/api/getUserAssortPrice/trader/";
var getTrader = "/client/trading/api/getTrader/";
var localeGlobal = "/client/locale/";
var localeMenu = "/client/menu/locale/";
var gameVer = "";

function joinMatch(info) {
	let shortid = "";
	
	// check if the player is a scav
	if (info.savage == true) {
		shortid = "3XR5";
	} else {
		shortid = "3SRC";
	}

	return JSON.stringify({"err": 0,"errmsg": null,"data":[{"profileid": "5c71b934354682353958e983", "status": "busy", "ip": "", "port": 0, "location": info.location, "sid": "", "gamemode": "deathmatch", "shortid": shortid} ] });
}

function getWeather() {
	let time = utility.getTime().replace("-", ":").replace("-", ":");
	let date = utility.getDate();
	let dateTime = date + " " + time;

	return '{"err":0, "errmsg":null, "data":{"weather":{"timestamp":' + Math.floor(new Date() / 1000) + ', "cloud":-0.475, "wind_speed":2, "wind_direction":3, "wind_gustiness":0.081, "rain":1, "rain_intensity":0, "fog":0.002, "temp":14, "pressure":763, "date":"' + date + '", "time":"' + dateTime + '"}, "date":"' + date + '", "time":"' + time + '", "acceleration":1}}';			
}

function loadTraderStandings(trader, profile) {
	// get profile Data
	let profileData = profile.getCharacterData();
	let profileCharData = profileData.data[1]
	// get trader data and update by profile info
	let dynTrader;
	// Check if trader standing data exists
	if (profileCharData.hasOwnProperty("TraderStandings")) {
		for (dynTrader of trader.getDynamicTraders()) {
			let profileStanding = profileCharData.TraderStandings[dynTrader]
			let traderLoyality = trader.get(dynTrader).data.loyalty;

			traderLoyality.currentLevel = profileStanding.currentLevel;
			traderLoyality.currentStanding = profileStanding.currentStanding;
			traderLoyality.currentSalesSum = profileStanding.currentSalesSum;

			// set Loyalty in trader
			trader.get(dynTrader).data.loyalty = traderLoyality;
		}
	} else {
		profileCharData.TraderStandings = {};
		// add with default data
		for (dynTrader of trader.getDynamicTraders()) {
			let traderLoyality = trader.get(dynTrader).data.loyalty;
			profileCharData.TraderStandings[dynTrader] =
				{
					"currentSalesSum": traderLoyality.currentSalesSum,
					"currentLevel": traderLoyality.currentLevel,
					"currentStanding": traderLoyality.currentStanding
				};
		}
		// save profile
		profileData.data[1] = profileCharData;
		profile.setCharacterData(profileData);
	}
}

function get(req, body) {
	let output = "";
	let url = req.url;
	let info = JSON.parse("{}");
	// parse body
	if (body != "") {
		info = JSON.parse(body);
	}
	
	// remove retry from URL
	if (url.includes("?retry=")) {
		url = url.split("?retry=")[0];
	}


	// player bought items
	if (url.includes(prices)) {
		return profile.getPurchasesData();
	}

	// trader profile
	if (url.includes(getTrader)) {
		return JSON.stringify(trader.get(url.replace(getTrader, '')));
	}

	// trader assortiment
	if (url.includes(assort)) {
		return JSON.stringify(trader.getAssort(url.replace(assort, '')));
	}

	// game images
	if (url.includes("/data/images/") || url.includes("/files/quest") || url.includes("/files/handbook")) {
		return "IMAGE";
	}
	if (url.includes("/notifierBase") || url.includes("/notifierServer")) 
	{ // notifier custom link
		return '{"err":0, "errmsg":null, "data":[]}';
	}
	if (url.includes("/?last_id"))
	{ // notifier custom link
		return 'NULLGET';
	}

	// raid banners
	if (url.includes("/uploads/")) {
		return "CONTENT";
    }

	// menu localisation
    if (url.includes(localeMenu)) {
        return locale.getMenu(url.replace(localeMenu, ''));
    }

	// global localisation
    if (url.includes(localeGlobal)) {
        return locale.getGlobal(url.replace(localeGlobal, ''));
    }

	// push notifier
	if (url.includes("/push/notifier/get/")) {
		return '{"err":0, "errmsg":null, "data":[]}';
	}

	switch (url) {
		case "/":
			output = 	'<style>a{color:#a00} a:hover{color:#f11} h1{font-size:22px;font-family:"Consolas"} a,p,li{font-size:14px;font-family:"Consolas"}</style>'+
						'<body style="background:black;color:red;text-align:center;padding:20px;">' +
						'<h1>JustEmuTarkov ' + server.version() + '</a></h1><br>' + ((gameVer != "")?'You are playing game on client version: ' + gameVer + '<br>':'') +
						'<a href="https://discord.gg/JnJEev4">> Official Discord <</a><br><br>' +
						'<a href="https://github.com/justemutarkov/">> Official Github <</a><br><br>' +
						'<a href="https://justemutarkov.github.io">> Github Website <</a><br><br>' +
						'<a href="https://maoci.eu/eft/">> Client mirrors <</a><br><br><br>' +
						'<p>Credits to:</p><ul><li>Polivilas</li><li>TheMaoci</li><li>InNoHurryToCode</li><li>BALIST0N</li><li>Mr RUSS</li><li>Windel</li><li>magMAR</li><li>Algorithm</li><li>TRegular</li><li>SBalaci</li><li>Macmillanic</li><li>Juraszka</li></ul>' +
						'</body>';
			break;

		case "/client/friend/list":
			output = '{"err":0, "errmsg":null, "data":{"Friends":[], "Ignore":[], "InIgnoreList":[]}}';
			break;

		case "/client/game/profile/items/moving":
			output = item.moving(info);
			break;

		case "/client/languages":
            output = locale.getLanguages();
            break;

		case "/client/game/login":
			output = profile.find(info, backendUrl);
			break;

		case "/client/queue/status":
			output = '{"err":0, "errmsg":null, "data":{"status": 0, "position": 0}}';
			break;

		case "/client/items":
			// custom items handling
			let base = item.PrepareItemsList();
			output = JSON.stringify(base);
			break;

		case "/client/globals":
			output = utility.readJson('data/configs/globals.json');
			break;

		case "/client/game/profile/list":
			output = JSON.stringify(profile.getCharacterData());
			loadTraderStandings(trader, profile);
			break;

		case "/client/game/profile/select":
			output = '{"err":0, "errmsg":null, "data":{"status":"ok", "notifier":{"server":"' + backendUrl + '", "channel_id":"f194bcedc0890f22db37a00dbd7414d2afba981eef61008159a74a29d5fee1cf"}}}';
			break;

		case "/client/profile/status":
			output = '{"err":0, "errmsg":null, "data":[{"profileid":"5c71b934354682353958e983", "status":"Free", "sid":"", "ip":"", "port":0}, {"profileid":"5c71b934354682353958e984", "status":"Free", "sid":"", "ip":"", "port":0}]}';
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
			output = utility.readJson('data/configs/questList.json');
			break;

		case "/client/getMetricsConfig":
			output = utility.readJson('data/configs/metricsConfig.json');
			break;

		case "/client/game/bot/generate":
			//MAKE SURE TO REMOVE THIS LATER - THEMAOCI
			if(body == "{}")
				
				body = "{\"conditions\":[{\"Role\":\"pmcBot\",\"Limit\":30,\"Difficulty\":\"normal\"}]}";
			output = JSON.stringify( {"err": 0,"errmsg": null,"data": bots.generate(JSON.parse(body)) } );
			break;

		case "/client/trading/api/getTradersList":
			output = JSON.stringify(trader.getList());
			break;

		case "/client/server/list":
			output = '{"err":0, "errmsg":null, "data":[{"ip":"'+ ip +'", "port":"' + port + '"}]}';
			break;

		case "/client/ragfair/search":
			output = ragfair.getOffers(info);
			break;

		case "/client/match/available":
			output = '{"err":999, "errmsg":"Online isnt working in JustEmuTarkov\nAfter pressing ok, your profile will be refreshed", "data":false}';
			break;

		case "/client/match/join":
			output = joinMatch(info);
			break;

		case "/client/chatServer/list":
			output = '{"err":0, "errmsg":null, "data":[{"_id":"5ae20a0dcb1c13123084756f", "RegistrationId":20, "DateTime":' + Math.floor(new Date() / 1000) + ', "IsDeveloper":true, "Regions":["EUR"], "VersionId":"bgkidft87ddd", "Ip":"", "Port":0, "Chats":[{"_id":"0", "Members":0}]}]}';
			break;

		case "/client/game/profile/nickname/change":
			output = profile.changeNickname(info);
			break;

		case "/client/game/profile/voice/change":
			profile.changeVoice(info);
			output = '{"err":0, "errmsg":null, "data":null}';
			break;
			
		case "/launcher/profile/create":
			profile.create(info);
			output = "DONE";
			break;

		case "/launcher/profile/delete":
			profile.delete(info);			
			output = "DONE";
			break;

		case "/launcher/profile/change/email":
			profile.changeEmail(info);			
			output = "DONE";
			break;

		case "/launcher/profile/change/password":
			profile.changeEmail(info);			
			output = "DONE";
			break;

		case "/client/match/group/status":
			output = '{ "err": 0, "errmsg": null, "data": { "players": [], "invite": [], "group": [] } }';
			break;
		
		case "/client/repair/exec":
		/*	{
			  "err": 0,
			  "errmsg": null,
			  "data": {
				"items": {
				  "change": [
					{
					  "_id": "5d0778e48ed2394283654566",
					  "_tpl": "5449016a4bdc2d6f028b456f",
					  "parentId": "5cacd049f0dd3508b7593561",
					  "slotId": "hideout",
					  "location": {
						"x": 6,
						"y": 1,
						"r": 0,
						"isSearched": true
					  },
					  "upd": {
						"StackObjectsCount": 493176
					  }
					},
					{
					  "_id": "5d5abef28ed2392c3f3df930",
					  "_tpl": "5648a7494bdc2d9d488b4583",
					  "parentId": "5cacd049f0dd3508b7593561",
					  "slotId": "hideout",
					  "location": {
						"x": 7,
						"y": 6,
						"r": 0
					  },
					  "upd": {
						"Repairable": {
						  "MaxDurability": 46.9,
						  "Durability": 46.9
						},
						"StackObjectsCount": 1
					  }
					}
				  ]
				},
				"badRequest": [],
				"currentSalesSums": {
				  "54cb50c76803fa8b248b4571": 49222779
				}
			  }
			}*/
			//repair this :) by TheMaoci
			output = JSON.parse('{"err":0, "errmsg":null, "data":{"items":{"change":[]}, "badRequest":[], "currentSalesSums": { "54cb50c76803fa8b248b4571": 49222779 }}}')
			let data = profile.getCharacterData();
			let count = info.items.length;
			console.log(info.items,"","",true);
			console.log("---------------","","",true);
			let RequestData = info.items;
			let cnt = 0;
			for(let inventory in data.data[1].Inventory.items){
				for(let item in RequestData){
					if(cnt == count)
						break;
					if(data.data[1].Inventory.items[inventory]._id == RequestData[item]._id){
						if(typeof data.data[1].Inventory.items[inventory].upd.Repairable != "undefined"){
						let calculateDurability = data.data[1].Inventory.items[inventory].upd.Repairable.Durability + RequestData[item].count;
						data.data[1].Inventory.items[inventory].upd.Repairable.Durability = calculateDurability;
						data.data[1].Inventory.items[inventory].upd.Repairable.MaxDurability = calculateDurability;
						output.data.items.change.push(data.data[1].Inventory.items[inventory]);
						cnt++;
						}
					}
				}
			if(cnt == count)
				break;
			}
			console.log(output.data.items.change,"","",true);
			profile.setCharacterData(data)
			break;

		case "/client/mail/dialog/list":
		case "/client/friend/request/list/outbox":
		case "/client/friend/request/list/inbox":
			output = '{"err":0, "errmsg":null, "data":[]}';
			break;

		case "":
			// TODO: actually generate the response properly
			output = `{ "err": 0, "errmsg": null, "data": [{ "_id": "5c71b934354682353958e983", "Info": { "Nickname": "TEST", "Side": "Usec", "Level": 1 } }] }`;
			break;

		case "/client/game/keepalive":
			output = '{"err":0,"errmsg":null,"data":{"msg":"OK"}}';
			break;
		case "/client/game/version/validate":
			gameVer = info.version.major; // its for future changes multiversion compatibility
			output = '{"err":0,"errmsg":null,"data":null}';
			break;
		case "/client/notifier/channel/create":
			output = '{"err":0,"errmsg":null,"data":{"notifier":{"server":"' + backendUrl + '","channel_id":"testChannel","url":"' + backendUrl + 'notifierBase"},"notifierServer":"' + backendUrl + 'notifierServer"}}';
			break;
		case "/favicon.ico":
		case "/client/game/logout":
		case "/client/putMetrics":
		case "/client/match/group/looking/stop":
		case "/client/match/group/exit_from_menu":
		case "/client/match/exit":
		case "/client/match/updatePing":
		case "/client/game/profile/savage/regenerate":
			output = '{"err":0, "errmsg":null, "data":null}';
			break;

		default:
			console.log("[UNHANDLED][" + req.url + "]", "white", "red");
			break;
	}

	return output;
}
function GameVersion()
{ // its for future changes multiversion compatibility
	return gameVer;
}
module.exports.GameVersion = GameVersion;
module.exports.get = get;