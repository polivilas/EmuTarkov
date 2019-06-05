var http = require('http');
var zlib = require('zlib');

var login = require('./src/login.js');
var utility = require('./src/utility.js');
var item = require('./src/item.js');
var ragfair = require('./src/ragfair.js');
var bots = require('./src/bots.js');
var settings = require('./src/settings.js');

var server = http.createServer();
var FinalOutput = "";
var port = settings.getPort();
var assort = new RegExp('/client/trading/api/getTraderAssort/([a-z0-9])+', 'i');
var prices = new RegExp('/client/trading/api/getUserAssortPrice/([a-z0-9])+', 'i');
var getTrader = new RegExp('/client/trading/api/getTrader/', 'i');
var traderImg = new RegExp('/files/([a-z0-9/\.jpng])+', 'i');
var content = new RegExp('/uploads/([a-z0-9/\.jpng_])+', 'i');
var pushNotifier = new RegExp('/push/notifier/get/', 'i');

function handleRequest(req, body, url) {
	var info = JSON.parse("{}");

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
		FinalOutput = utility.readJson("data/assort/" + url.substring(36).replace(/[^a-zA-Z0-9_]/g, '') + ".json");
		return;
	}
	
	if (url.match(prices)) {
		FinalOutput = utility.readJson("data/prices/" + url.substring(46).replace(/[^a-zA-Z0-9_]/g, '') + ".json"); // thats some budget ass shit
		return;
	}
	
	if (url.match(getTrader)) {
		console.log(url.substring(30));
		FinalOutput = '{"err":0, "errmsg":null, "data":{"_id":"' + url.substring(30) + '", "working":true, "name":"ez", "surname":"ez", "nickname":"ez", "location":"", "avatar":"/files/trader/avatar/59b91ca086f77469a81232e4.jpg", "balance_rub":80000000, "balance_dol":80000000, "balance_eur":80000000, "display":true, "discount":1337, "discount_end":0, "buyer_up":false, "currency":"RUB", "supply_next_time":1551040000, "repair":{"availability":true, "quality":"1.2", "excluded_id_list":[], "excluded_category":[], "currency":"5449016a4bdc2d6f028b456f", "currency_coefficient":1, "price_rate":0}, "insurance":{"availability":true, "min_payment":0, "min_return_hour":24, "max_return_hour":36, "max_storage_time":72, "excluded_category":[]}, "gridHeight":1000, "loyalty":{"currentLevel":1337, "currentStanding":1337, "currentSalesSum":1337, "loyaltyLevels":{"0":{"minLevel":1, "minSalesSum":0, "minStanding":0}, "1":{"minLevel":1, "minSalesSum":1, "minStanding":1}, "2":{"minLevel":1, "minSalesSum":1, "minStanding":1}, "3":{"minLevel":1, "minSalesSum":1, "minStanding":1}}}, "sell_category":[]}}';
		return;
	}
	
	if (url.match(traderImg) || url.match(content)) {
		FinalOutput = "DEAD";
		return;
	}
	
	if (url.match(pushNotifier)) {
		FinalOutput = '{"err":0, "errmsg":null, "data":[]}';
		return;
	}

	switch(url) {
		case "/":
			FinalOutput = 'EFT backend emulator for Escape From Tarkov version 0.11.2.2680 by polivilas @ UnKnoWnCheaTs.me';
			break;

		case "/client/friend/list":
			FinalOutput = '{"err":0, "errmsg":null, "data":{"Friends":[], "Ignore":[], "InIgnoreList":[]}}';
			break;

		case "/client/game/profile/items/moving":
			var tmpOutput = "";
		
			for (var a = 0; a < info.data.length; a++) {
				tmpOutput = item.handleMoving(info.data[a]);
			}

			if (tmpOutput == "OK") {
				FinalOutput = JSON.stringify(item.getOutput());
			}
			break;
			
		case "/client/mail/dialog/list":
			FinalOutput = '{"err":0, "errmsg":null, "data":[]}';
			break;

		case "/client/friend/request/list/outbox":
		case "/client/friend/request/list/inbox":
			FinalOutput = '{"err":0, "errmsg":null, "data":[]}';
			break;

		case "/client/languages":
			FinalOutput = '{"err":0, "errmsg":null, "data":[{"ShortName":"en", "Name":"English"}, {"ShortName":"ru", "Name":"Русский"}], "crc":0}';
			break;

		case "/client/menu/locale/en":
		case "/client/menu/locale/ru":
			FinalOutput = '{"err":0, "errmsg":null, "data":{"menu":{"NEXT":"NEXT", "Escape from Tarkov":"ESCAPE FROM TARKOV", "Servers are currently at full capacity":"Servers are currently at full capacity", "EXIT":"EXIT", "REMEMBER ACCOUNT":"REMEMBER ACCOUNT", "AUTHORIZATION":"AUTHORIZATION", "Profile data loading...":"Profile data loading...", "{0} Beta version":"{0} Beta version | EmuTarkov", "DOWN: ":"DOWN: ", "LEFT: ":"LEFT: ", "RIGHT: ":"RIGHT: "}}, "crc":0}';
			break;

		case "/client/game/version/validate":
			FinalOutput = '{"err":0, "errmsg":null, "data":null}';
			break;

		case "/client/game/login":
			FinalOutput = '{"err":0, "errmsg":null, "data":{"token":"token_1337", "aid":1337, "lang":"en", "languages":{"en":"English"}, "ndaFree":true, "queued":false, "taxonomy":341, "activeProfileId":"5c71b934354682353958e984", "backend":{"Trading":"http://localhost:' + port + '", "Messaging":"http://localhost:' + port + '", "Main":"http://localhost:' + port + '", "RagFair":"http://localhost:' + port + '"}, "utc_time":1337, "totalInGame":0, "twitchEventMember":false}}';
			break;

		case "/client/game/logout":
			FinalOutput = '{"err":0, "errmsg":null, "data":null}';
			break;

		case "/client/queue/status":
			FinalOutput = '{"err":0, "errmsg":null, "data":{"status": 0, "position": 0}}';
			break;

		case "/client/items":
			FinalOutput = utility.readJson('data/items.json');
			break;

		case "/client/globals":
			FinalOutput = utility.readJson('data/globals.json');
			break;

		case "/client/game/profile/list":
			FinalOutput = utility.readJson('data/list.json');
			break;

		case "/client/game/profile/select":
			FinalOutput = '{"err":0, "errmsg":null, "data":{"status":"ok", "notifier":{"server":"localhost:' + port + '", "channel_id":"f194bcedc0890f22db37a00dbd7414d2afba981eef61008159a74a29d5fee1cf"}}}';
			break;

		case "/client/profile/status":
			FinalOutput = '{"err":0, "errmsg":null, "data":[{"profileid":"5c71b934354682353958e983", "status":"Free", "sid":"", "ip":"", "port":0}, {"profileid":"5c71b934354682353958e984", "status":"Free", "sid":"", "ip":"", "port":0}]}';
			break;

		case "/client/game/keepalive":
			FinalOutput = '{"err":0, "errmsg":null, "data":null}';
			break;

		case "/client/weather":
			FinalOutput = '{"err":0, "errmsg":null, "data":{"weather":{"timestamp":' + Math.floor(new Date() / 1000) + ', "cloud":-0.475, "wind_speed":2, "wind_direction":3, "wind_gustiness":0.081, "rain":1, "rain_intensity":0, "fog":0.002, "temp":14, "pressure":763, "date":"2019-02-24", "time":"2019-02-24 19:15:02"}, "date":"2019-02-24", "time":"21:02:30", "acceleration":7}}';
			break;

		case "/client/locale/en":
		case "/client/locale/En":
		case "/client/locale/ru":
		case "/client/locale/Ru":
			FinalOutput = utility.readJson('data/locale_en.json');
			break;

		case "/client/locations":
			FinalOutput = utility.readJson('data/locations.json');
			break;

		case "/client/handbook/templates":
			FinalOutput = utility.readJson('data/templates.json');
			break;

		case "/client/quest/list":
			FinalOutput = utility.readJson('data/questList.json');
			break;

		case "/client/getMetricsConfig":
			FinalOutput = utility.readJson('data/metricsConfig.json');
			break;

		case "/client/putMetrics":
			FinalOutput = '{"err":0, "errmsg":null, "data":null}';
			break;

		case "/client/game/bot/generate":
			FinalOutput = JSON.stringify( {"err": 0,"errmsg": null,"data": bots.generate(JSON.parse(body)) } );
			break;

		case "/client/trading/api/getTradersList":
			FinalOutput = utility.readJson('data/traderList.json');
			break;

		case "/client/server/list":
			FinalOutput = '{"err":0, "errmsg":null, "data":[{"ip":"127.0.0.1", "port":' + port + '}]}';
			break;

		case "/client/ragfair/search":
			FinalOutput = ragfair.getOffers(info);
			break;

		case "/client/match/available":
			FinalOutput = '{"err":0, "errmsg":null, "data":true}';
			break;

		case "/client/match/join":
			var clientrequest = JSON.parse(body);
			var shortid = "";
						
			if (clientrequest.savage == true) {
				shortid = "3XR5";
			} else {
				shortid = "3SRC";
			}
			
			FinalOutput = JSON.stringify( {"err": 0,"errmsg": null,"data": [ {"profileid": "5c71b934354682353958e983", "status": "busy", "ip": "", "port": 0, "location": clientrequest.location, "sid": "", "gamemode": "deathmatch", "shortid": shortid} ] });
			break;

		case "/client/match/exit":
			FinalOutput = '{"err":0, "errmsg":null, "data":null}';
			break;

		case "/client/chatServer/list":
			FinalOutput = '{"err":0, "errmsg":null, "data":[{"_id":"5ae20a0dcb1c13123084756f", "RegistrationId":20, "DateTime":' + Math.floor(new Date() / 1000) + ', "IsDeveloper":true, "Regions":["EUR"], "VersionId":"bgkidft87ddd", "Ip":"", "Port":0, "Chats":[{"_id":"0", "Members":0}]}]}';
			break;

		case "/client/game/profile/nickname/change":
			var clientrequest = JSON.parse(body);
			var tmpList = JSON.parse(utility.readJson("data/list.json"));

			tmpList.data[1].Info.Nickname = clientrequest.nickname;
			tmpList.data[1].Info.LowerNickname = clientrequest.nickname.toLowerCase();
			utility.writeJson('data/list.json', tmpList);
			
			FinalOutput = '{"err":0, "errmsg":null, "data":{"status":0, "nicknamechangedate":' + Math.floor(new Date() / 1000) + '}}';	
			break;

		case "/dump":
			break;

		default:
			console.log('\x1b[31m',"UNHANDLED REQUEST " + req.url,'\x1b[0m');
			break;
	}
}

server.on('request', function(req, resp) {
	// Get the IP address of the client
	FinalOutput = "";
	item.resetOutput();
	
	var remote = req.connection.remoteAddress;
	
	console.log('Got request from: %s for %s', remote, req.url);
	
	if (req.method == "POST") {
		console.log("Posting");
		req.on('data', function(data) {
				zlib.inflate(data, function(error, body) {
					if (error) {
						console.log(error);
					} else {
						handleRequest(req, body.toString(), req.url);
						
						if (FinalOutput == "DEAD") {
							resp.writeHead(301, {Location: 'http://prod.escapefromtarkov.com'+req.url});
							console.log("Redirecting");
							resp.end();

							return;
						}

						resp.writeHead(200, "OK", {'Content-Type': 'text/plain', 'content-encoding' : 'deflate', 'Set-Cookie' : 'PHPSESSID=yolo'});
						
						zlib.deflate(FinalOutput, function(err, buf) {
							resp.end(buf);
						});

						return;
					}
			});
		});
	} else {
		console.log("Getting");
		handleRequest(req, "{}", req.url);
		
		if (FinalOutput == "DEAD") {
			resp.writeHead(301,	{Location: 'http://prod.escapefromtarkov.com'+req.url});
			console.log("Redirecting");
			resp.end();

			return;
		}

		resp.writeHead(200, "OK", {'Content-Type': 'text/plain', 'content-encoding' : 'deflate', 'Set-Cookie' : 'PHPSESSID=yolo'});
		
		zlib.deflate(FinalOutput, function(err, buf) {
			resp.end(buf);
		});
	}
});

//Start the server
server.listen(port, function() {
	console.log('EmuTarkov listening on: %s', port);
});

// create login token
// NOTE: client-side only, split this into a separate application?
var loginData = JSON.parse('{"email":' + settings.getEmail() + ',"password":' + settings.getPassword() + ', "toggle":true, "timestamp":1337}');

setInterval(function() {
	login.createToken(loginData);
}, 1000 * 60);

login.createToken(loginData);