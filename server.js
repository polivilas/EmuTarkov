var http = require('http');
var fs = require('fs');
var zlib = require('zlib');
var server = http.createServer();
var FinalOutput = "";
var PORT = 1337;
var assort = new RegExp('/client/trading/api/getTraderAssort/([a-z0-9])+', 'i');
var prices = new RegExp('/client/trading/api/getUserAssortPrice/([a-z0-9])+', 'i');
var getTrader = new RegExp('/client/trading/api/getTrader/', 'i');
var traderImg = new RegExp('/files/([a-z0-9/\.jpng])+', 'i');
var content = new RegExp('/uploads/([a-z0-9/\.jpng_])+', 'i');
var pushNotifier = new RegExp('/push/notifier/get/', 'i');
var ItemOutput = "";
var tmpItem = {};
var tmpSize = {};
var toDo = [];
var stashX = 10; // fix for your stash size
var stashY = 66; // ^ if you edited it ofc
function ReadJson(file) {
	return (fs.readFileSync(file, 'utf8')).replace(/[\r\n\t]/g, '');
}

var itemJSON = JSON.parse(ReadJson('items.json'));
itemJSON = itemJSON.data;
function getRandomInt(min, max) {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min + 1)) + min;
} // stolen off StackOverflow

function GenItemID(){
	return Math.floor(new Date() / 1000) + getRandomInt(0, 999999999).toString(); 
}


function getItem(template)
{
	for(var itm in itemJSON) {
		if (itemJSON[itm]._id && itemJSON[itm]._id == template) {
			var item = itemJSON[itm];
			return [true, item];
		}
	}
	return [false, {}];
}
function getSize(itemtpl, itemID, location)
{
	toDo = [itemID];
	tmpItem = getItem(itemtpl);
	if (!tmpItem[0])
	{
		console.log("SHITS FUCKED GETSIZE1", itemID);
		return;
	} else {
		tmpItem = tmpItem[1];
	}
	var outX = 0, outY = 0, outL = 0, outR = 0, outU = 0, outD = 0, tmpL = 0, tmpR = 0, tmpU = 0, tmpD = 0;
	outX = tmpItem._props.Width;
	outY = tmpItem._props.Height;
	while(true){
		if(toDo[0] != undefined){
			for (var tmpKey in location) {
				if (location[tmpKey].parentId && location[tmpKey].parentId == toDo[0]) {
					toDo.push(location[tmpKey]._id);
					
					tmpItem = getItem(location[tmpKey]._tpl);
					if (!tmpItem[0])
					{
						console.log("SHITS FUCKED GETSIZE2", tmpItem, location[tmpKey]._tpl);
						return;
					} else {
						tmpItem = tmpItem[1];
					}
					if(tmpItem._props.ExtraSizeLeft != undefined && tmpItem._props.ExtraSizeLeft > tmpL){
						tmpL = tmpItem._props.ExtraSizeLeft; 
					}
					if(tmpItem._props.ExtraSizeRight != undefined && tmpItem._props.ExtraSizeRight > tmpR){
						tmpR = tmpItem._props.ExtraSizeRight; 
					}
					if(tmpItem._props.ExtraSizeUp != undefined && tmpItem._props.ExtraSizeUp > tmpU){
						tmpU = tmpItem._props.ExtraSizeUp; 
					}
					if(tmpItem._props.ExtraSizeDown != undefined && tmpItem._props.ExtraSizeDown > tmpD){
						tmpD = tmpItem._props.ExtraSizeDown; 
					}
				}
			}
			outL += tmpL; outR += tmpR; outU += tmpU; outD += tmpD;
			tmpL = 0; tmpR = 0; tmpU = 0; tmpD = 0;
			toDo.splice(0, 1);
			continue;
		}
		break;
	}
	return [outX, outY, outL, outR, outU, outD];
}
function handleMoving(body) {
	console.log(body);
	var tmpList = JSON.parse(ReadJson('list.json'));
	switch(body.Action) {

		case "QuestAccept":
			tmpList.data[1].Quests.push({"qid": body.qid.toString(), "startTime": 1337, "status": 2}); // statuses seem as follow - 1 - not accepted | 2 - accepted | 3 - failed | 4 - completed
			fs.writeFileSync('list.json', JSON.stringify(tmpList, null, "\t"), 'utf8');
			FinalOutput = "OK";
			break;
		case "Move":
			
			for (var key in tmpList.data[1].Inventory.items) {
				if (tmpList.data[1].Inventory.items[key]._id && tmpList.data[1].Inventory.items[key]._id == body.item) {
					tmpList.data[1].Inventory.items[key].parentId = body.to.id;
					tmpList.data[1].Inventory.items[key].slotId = body.to.container;
					if (body.to.location) {
						tmpList.data[1].Inventory.items[key].location = body.to.location;
					} else {
						if (tmpList.data[1].Inventory.items[key].location) {
							tmpList.data[1].Inventory.items[key].location = {"x": 0, "y": 0, "r": 0};
						}
					}
					fs.writeFileSync('list.json', JSON.stringify(tmpList, null, "\t"), 'utf8');
					FinalOutput = "OK";
					break;
				}
			}
			break;
		case "Remove":
				toDo = [body.item];
				while(true){
					if(toDo[0] != undefined){
						while(true){ // needed else iterator may decide to jump over stuff
							var tmpEmpty = "yes";
							for (var tmpKey in tmpList.data[1].Inventory.items) {	
								if ((tmpList.data[1].Inventory.items[tmpKey].parentId && tmpList.data[1].Inventory.items[tmpKey].parentId == toDo[0]) || (tmpList.data[1].Inventory.items[tmpKey]._id && tmpList.data[1].Inventory.items[tmpKey]._id == toDo[0])) {
									ItemOutput.data.items.del.push({"_id": tmpList.data[1].Inventory.items[tmpKey]._id});
									toDo.push(tmpList.data[1].Inventory.items[tmpKey]._id);
									tmpList.data[1].Inventory.items.splice(tmpKey, 1);
									tmpEmpty = "no";
								}
							}
							if(tmpEmpty == "yes"){
								break;
							};
						}
						toDo.splice(0, 1);
						continue;
					}
					break;
				}
				fs.writeFileSync('list.json', JSON.stringify(tmpList, null, "\t"), 'utf8');
				FinalOutput = "OK";
			break;
		case "Split":
			for (var key in tmpList.data[1].Inventory.items) {
				if (tmpList.data[1].Inventory.items[key]._id && tmpList.data[1].Inventory.items[key]._id == body.item) {
					tmpList.data[1].Inventory.items[key].upd.StackObjectsCount -= body.count;
					var newItem = GenItemID(); 
					ItemOutput.data.items.new.push({"_id": newItem, "_tpl": tmpList.data[1].Inventory.items[key]._tpl, "parentId": body.container.id, "slotId": body.container.container, "location": body.container.location, "upd": {"StackObjectsCount": body.count}});
					tmpList.data[1].Inventory.items.push({"_id": newItem, "_tpl": tmpList.data[1].Inventory.items[key]._tpl, "parentId": body.container.id, "slotId": body.container.container, "location": body.container.location, "upd": {"StackObjectsCount": body.count}});
					fs.writeFileSync('list.json', JSON.stringify(tmpList, null, "\t"), 'utf8');
					FinalOutput = "OK";
					break;
				}
			}
			break;
		case "Merge":
			for (var key in tmpList.data[1].Inventory.items) {
				if (tmpList.data[1].Inventory.items[key]._id && tmpList.data[1].Inventory.items[key]._id == body.with) {
					for (var key2 in tmpList.data[1].Inventory.items) {
						if (tmpList.data[1].Inventory.items[key2]._id && tmpList.data[1].Inventory.items[key2]._id == body.item) {
							tmpList.data[1].Inventory.items[key].upd.StackObjectsCount = (tmpList.data[1].Inventory.items[key].upd.StackObjectsCount ? tmpList.data[1].Inventory.items[key].upd.StackObjectsCount : 1) + (tmpList.data[1].Inventory.items[key2].upd.StackObjectsCount ? tmpList.data[1].Inventory.items[key2].upd.StackObjectsCount : 1);
							ItemOutput.data.items.del.push({"_id": tmpList.data[1].Inventory.items[key2]._id});
							tmpList.data[1].Inventory.items.splice(key2, 1);
							fs.writeFileSync('list.json', JSON.stringify(tmpList, null, "\t"), 'utf8');
							FinalOutput = "OK";
							break;
						}
					}
				}
			}
			break;
		case "TradingConfirm":
			if(body.type == "buy_from_trader") {
				var tmpTrader = JSON.parse(ReadJson('assort/' + body.tid.replace(/[^a-zA-Z0-9]/g, '') + '.json'));
				for (var key in tmpTrader.data.items) {
					if (tmpTrader.data.items[key]._id && tmpTrader.data.items[key]._id == body.item_id) {
						var Stash2D = Array(stashY).fill(0).map(x => Array(stashX).fill(0));
						for (var key2 in tmpList.data[1].Inventory.items) {
							if(tmpList.data[1].Inventory.items[key2].parentId == "5c71b934354682353958ea35" && tmpList.data[1].Inventory.items[key2].location != undefined) { // hideout
								tmpItem = getItem(tmpList.data[1].Inventory.items[key2]._tpl);
								if (!tmpItem[0])
								{
									console.log("SHITS FUCKED");
									return;
								} else {
									tmpItem = tmpItem[1];
								}
								tmpSize = getSize(tmpList.data[1].Inventory.items[key2]._tpl,tmpList.data[1].Inventory.items[key2]._id, tmpList.data[1].Inventory.items);
								//			x			L				r
								var iW = tmpSize[0] + tmpSize[2] + tmpSize[3];
								//			y			u				d
								var iH = tmpSize[1] + tmpSize[4] + tmpSize[5];
								var fH = (tmpList.data[1].Inventory.items[key2].location.rotation == "Vertical" ? iW : iH);
								var fW = (tmpList.data[1].Inventory.items[key2].location.rotation == "Vertical" ? iH : iW);
								for (var x = 0; x < fH; x++) {
									Stash2D[tmpList.data[1].Inventory.items[key2].location.y + x].fill(1, tmpList.data[1].Inventory.items[key2].location.x, tmpList.data[1].Inventory.items[key2].location.x + fW);
								}
							}
						}
						var tmpSizeX = 0; var tmpSizeY = 0;
						tmpItem = getItem(tmpTrader.data.items[key]._tpl);
						if (!tmpItem[0])
						{
							console.log("SHITS FUCKED BUY_FROM_TRADER");
							return;
						} else {
							tmpItem = tmpItem[1];
						}
						tmpSize = getSize(tmpTrader.data.items[key]._tpl,tmpTrader.data.items[key]._id, tmpTrader.data.items);
						tmpSizeX = tmpSize[0] + tmpSize[2] + tmpSize[3];
						tmpSizeY = tmpSize[1] + tmpSize[4] + tmpSize[5];
						console.log(tmpSizeX, tmpSizeY);
						var badSlot = "no";
						console.log(Stash2D);
						for (var y = 0; y < stashY; y++) {
							for (var x = 0; x < stashX; x++) {
								badSlot = "no";
								for (var itemY = 0; itemY < tmpSizeY; itemY++) {
									for (var itemX = 0; itemX < tmpSizeX; itemX++) {
										if(Stash2D[y + itemY][x + itemX] != 0){
											badSlot = "yes";
											break;
										}
									}
									if(badSlot == "yes"){
										break;
									}
								}
								if(badSlot == "no"){
									var newItem = GenItemID();
									ItemOutput.data.items.new.push({"_id": newItem, "_tpl": tmpTrader.data.items[key]._tpl, "parentId": "5c71b934354682353958ea35", "slotId": "hideout", "location": {"x": x, "y": y, "r": 0}, "upd": {"StackObjectsCount": body.count}});
									tmpList.data[1].Inventory.items.push({"_id": newItem, "_tpl": tmpTrader.data.items[key]._tpl, "parentId": "5c71b934354682353958ea35", "slotId": "hideout", "location": {"x": x, "y": y, "r": 0}, "upd": {"StackObjectsCount": body.count}});
									toDo = [[tmpTrader.data.items[key]._id, newItem]];
									while(true){
										if(toDo[0] != undefined){
											for (var tmpKey in tmpTrader.data.items) {
												if (tmpTrader.data.items[tmpKey].parentId && tmpTrader.data.items[tmpKey].parentId == toDo[0][0]) {
													newItem = GenItemID();
													ItemOutput.data.items.new.push({"_id": newItem, "_tpl": tmpTrader.data.items[tmpKey]._tpl, "parentId": toDo[0][1], "slotId": tmpTrader.data.items[tmpKey].slotId, "location": {"x": x, "y": y, "r": 0}, "upd": {"StackObjectsCount": body.count}});
													tmpList.data[1].Inventory.items.push({"_id": newItem, "_tpl": tmpTrader.data.items[tmpKey]._tpl, "parentId": toDo[0][1], "slotId": tmpTrader.data.items[tmpKey].slotId, "location": {"x": x, "y": y, "r": 0}, "upd": {"StackObjectsCount": body.count}});
													toDo.push([tmpTrader.data.items[tmpKey]._id, newItem]);
												}
											}
											toDo.splice(0, 1);
											continue;
										}
										break;
									}
									fs.writeFileSync('list.json', JSON.stringify(tmpList, null, "\t"), 'utf8');
									FinalOutput = "OK";
									return;
								}
							}
						}
						break;
					}
				}
			}
			break;
		case "Fold":
			for (var key in tmpList.data[1].Inventory.items) {
				if (tmpList.data[1].Inventory.items[key]._id && tmpList.data[1].Inventory.items[key]._id == body.item) {
					tmpList.data[1].Inventory.items[key].upd.Foldable = {"Folded": body.value};
					fs.writeFileSync('list.json', JSON.stringify(tmpList, null, "\t"), 'utf8');
					FinalOutput = "OK";
					break;
				}
			}
			break;
		case "Toggle":
			for (var key in tmpList.data[1].Inventory.items) {
				if (tmpList.data[1].Inventory.items[key]._id && tmpList.data[1].Inventory.items[key]._id == body.item) {
					tmpList.data[1].Inventory.items[key].upd.Togglable = {"On": body.value};
					fs.writeFileSync('list.json', JSON.stringify(tmpList, null, "\t"), 'utf8');
					FinalOutput = "OK";
					break;
				}
			}
			break;
		default:
			console.log("UNHANDLED ACTION");
			break;
	}
}
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
		FinalOutput = ReadJson("assort/" + url.substring(36).replace(/[^a-zA-Z0-9_]/g, '') + ".json");
		return;
	}
	if (url.match(prices)) {
		FinalOutput = ReadJson("prices/" + url.substring(46).replace(/[^a-zA-Z0-9_]/g, '') + ".json"); // thats some budget ass shit
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
			for (var a = 0; a < info.data.length; a++) {
				handleMoving(info.data[a]);
			}
			if(FinalOutput == "OK") {
				FinalOutput = JSON.stringify(ItemOutput);
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
			FinalOutput = '{"err":0, "errmsg":null, "data":{"token":"token_1337", "aid":1337, "lang":"en", "languages":{"en":"English"}, "ndaFree":false, "queued":false, "taxonomy":341, "activeProfileId":"5c71b934354682353958e984", "backend":{"Trading":"http://localhost:1337", "Messaging":"http://localhost:1337", "Main":"http://localhost:1337", "RagFair":"http://localhost:1337"}, "utc_time":1337, "totalInGame":0, "twitchEventMember":false}}';
			break;
		case "/client/items":
			FinalOutput = ReadJson('items.json');
			break;
		case "/client/globals":
			FinalOutput = ReadJson('globals.json');
			break;
		case "/client/game/profile/list":
			FinalOutput = ReadJson('list.json');
			break;
		case "/client/game/profile/select":
			FinalOutput = '{"err":0, "errmsg":null, "data":{"status":"ok", "notifier":{"server":"localhost:1337", "channel_id":"f194bcedc0890f22db37a00dbd7414d2afba981eef61008159a74a29d5fee1cf"}}}';
			break;
		case "/client/profile/status":
			FinalOutput = '{"err":0, "errmsg":null, "data":[{"profileid":"5c71b934354682353958e983", "status":"Free", "sid":"", "ip":"", "port":0}, {"profileid":"5c71b934354682353958e984", "status":"Free", "sid":"", "ip":"", "port":0}]}';
			break;
		case "/client/game/keepalive":
			break;
		case "/client/weather":
			FinalOutput = '{"err":0, "errmsg":null, "data":{"weather":{"timestamp":' + Math.floor(new Date() / 1000) + ', "cloud":-0.475, "wind_speed":2, "wind_direction":3, "wind_gustiness":0.081, "rain":1, "rain_intensity":0, "fog":0.002, "temp":14, "pressure":763, "date":"2019-02-24", "time":"2019-02-24 19:15:02"}, "date":"2019-02-24", "time":"21:02:30", "acceleration":7}}';
			break;
		case "/client/locale/en":
		case "/client/locale/En":
		case "/client/locale/ru":
		case "/client/locale/Ru":
			FinalOutput = ReadJson('locale_en.json');
			break;
		case "/client/locations":
			//FinalOutput = ReadJson('locations.json');
			FinalOutput = ReadJson('locations_old.json');
			break;
		case "/client/handbook/templates":
			FinalOutput = ReadJson('templates.json');
			break;
		case "/client/quest/list":
			FinalOutput = ReadJson('quest_list.json');
			break;
		case "/client/game/bot/generate":
			FinalOutput = ReadJson('bot_generate.json');
			break;
		case "/client/trading/api/getTradersList":
			FinalOutput = ReadJson('traderList.json');
			break;
		case "/client/server/list":
			FinalOutput = ReadJson('serverList.json');
			break;
		default:
			console.log("UNHANDLED REQUEST " + req.url);
			break;
	}
}

server.on('request', function(req, resp) {
	// Get the IP address of the client
	FinalOutput = "";
	ItemOutput = JSON.parse('{"err":0, "errmsg":null, "data":{"items":{"new":[], "change":[], "del":[]}, "badRequest":[], "quests":[], "ragFairOffers":[]}}');
	var remote = req.connection.remoteAddress;
	console.log('Got request from: %s for %s', remote, req.url);
	if(req.method == "POST") {
		console.log("Posting");
		req.on('data', function(data) {
				zlib.inflate(data, function(error, body) {
					if(error) {
						console.log(error);
					} else {
						handleRequest(req, body.toString(), req.url);
						if (FinalOutput == "DEAD") {
							resp.writeHead(301, 
								{Location: 'http://prod.escapefromtarkov.com'+req.url}
							);
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
	} else
	{
		console.log("Getting");
		handleRequest(req, "{}", req.url);
		if (FinalOutput == "DEAD") {
			resp.writeHead(301, 
				{Location: 'http://prod.escapefromtarkov.com'+req.url}
			);
			console.log("Redirecting");
			resp.end();
			return;
		}
		resp.writeHead(200, "OK", {'Content-Type': 'text/plain', 'content-encoding' : 'deflate', 'Set-Cookie' : 'PHPSESSID=yolo'});
		//console.log(FinalOutput);
		zlib.deflate(FinalOutput, function(err, buf) {
			resp.end(buf);
		});
	}


});

//Start the server
server.listen(PORT, function() {
	console.log('EmuTarkov listening on: %s',PORT);
});
