"use strict";
require('./libs.js');

let gameVer = "";

function joinMatch(info) {
    let shortid = "";

    // check if the player is a scav
    if (info.savage === true) {
        shortid = "3XR5";
    } else {
        shortid = "3SRC";
    }

    return JSON.stringify({
        "err": 0,
        "errmsg": null,
        "data": [{
            "profileid": "5c71b934354682353958e983",
            "status": "busy",
            "ip": "",
            "port": 0,
            "location": info.location,
            "sid": "",
            "gamemode": "deathmatch",
            "shortid": shortid
        }]
    });
}

function get(req, body) {
    let output = "";
    let url = req.url;
    let info = JSON.parse("{}");
    // parse body
    if (body !== "") {
        info = JSON.parse(body);
    }
    // remove ?retry=X from URL
    if (url.includes("?retry=")) {
        url = url.split("?retry=")[0];
    }
	//prepare Input Finished

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
    if (url.includes("/notifierBase") || url.includes("/notifierServer")) { // notifier custom link
        return '{"err":0, "errmsg":null, "data":[]}';
    }
    if (url.includes("/?last_id")) { // notifier custom link
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
            output = index_f.index();
            break;
        case "/inv":
			output = "";
			let inv = itm_hf.recheckInventoryFreeSpace(profile.getCharacterData())
			output += "<style>td{border:1px solid #aaa;}</style>Inventory Stash Usage:<br><table><tr><td>-</td><td>0</td><td>1</td><td>2</td><td>3</td><td>4</td><td>5</td><td>6</td><td>7</td><td>8</td><td>9<br>";
			for(let y=0; y<inv.length;y++){
				output += '<tr><td>' + y + "</td>";
				for(let x=0; x<inv[0].length;x++)
					output += '<td ' + ((inv[y][x] === 1)?'style="background:#aaa"':'') + '>' + inv[y][x] + "</td>"
				output += "</tr>"
			}
			output += "</table>"
            break;
		case "/random":
			output = utility.generateNewItemId() + "<br>" + utility.generateNewItemId() + "<br>" + utility.generateNewItemId() + "<br>" + utility.generateNewItemId() + "<br>" + utility.generateNewItemId() + "<br>" + utility.generateNewItemId() + "<br>" + utility.generateNewItemId() + "<br>" + utility.generateNewItemId() + "<br>" + utility.generateNewItemId() + "<br>" + utility.generateNewItemId() + "<br>" + utility.generateNewItemId() + "<br>" + utility.generateNewItemId() + "<br>" + utility.generateNewItemId() + "<br>" + utility.generateNewItemId() + "<br>" + utility.generateNewItemId() + "<br>" + utility.generateNewItemId() + "<br>" + utility.generateNewItemId() + "<br>" + utility.generateNewItemId() + "<br>" + utility.generateNewItemId();
			break;
        case "/errortest":
            throw new Error('testing error handling. response.js - line 101');

        case "/client/friend/list":
            output = '{"err":0, "errmsg":null, "data":{"Friends":[], "Ignore":[], "InIgnoreList":[]}}';
            break;

        case "/client/game/profile/items/moving":
            output = item.moving(info);
			console.log(output);
            break;

        case "/client/languages":
            output = locale.getLanguages();
            break;

        case "/client/game/login":
				let x = profile.find(info, backendUrl);
				console.log(x);
            output = x;
            break;

        case "/client/queue/status":
            output = '{"err":0, "errmsg":null, "data":{"status": 0, "position": 0}}';
            break;

        case "/client/items":
            output = JSON.stringify(utility.prepareItemsFile());
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

        case "/client/weather":
            output = weather_f.main();
            break;

        case "/client/locations":
			output = JSON.stringify(locations, null, "\t").replace(/[\r\n\t]/g, '').replace(/\s\s+/g, '').replace(/[\\]/g, "");
            //output = utility.readJson('data/configs/locations.json');
            break;

        case "/client/handbook/templates":
            output = utility.readJson('data/configs/templates.json');
            break;

        case "/client/quest/list":
            output = JSON.stringify(quests, null, "\t").replace(/[\r\n\t]/g, '').replace(/\s\s+/g, '').replace(/[\\]/g, "");
            break;

        case "/client/getMetricsConfig":
            output = utility.readJson('data/configs/metricsConfig.json');
            break;

        case "/client/game/bot/generate":
            // TODO: TheMaoci Dont forget to remove this later says TheMaoci - its for testing if bots are generating if you cann get response from webbrowser
            if (body === "{}")
                body = "{\"conditions\":[{\"Role\":\"assault\",\"Limit\":30,\"Difficulty\":\"normal\"}]}";
            output = JSON.stringify({"err": 0, "errmsg": null, "data": bots.generate(JSON.parse(body))});
            break;
		case "/bottest":
            // TODO: TheMaoci Dont forget to remove this later says TheMaoci - its for testing if bots are generating if you cann get response from webbrowser
            if (body === "{}")
                body = "{\"conditions\":[{\"Role\":\"assault\",\"Limit\":30,\"Difficulty\":\"normal\"},{\"Role\":\"assault\",\"Limit\":30,\"Difficulty\":\"hard\"}]}";
            output = JSON.stringify({"err": 0, "errmsg": null, "data": bots.generate(JSON.parse(body))});
            break;

        case "/client/trading/api/getTradersList":
            output = JSON.stringify(trader.getList());
            break;

        case "/client/server/list":
            output = '{"err":0, "errmsg":null, "data":[{"ip":"' + ip + '", "port":"' + port + '"}]}';
            break;

        case "/client/ragfair/search":
            output = ragfair.getOffers(info);
            break;

        case "/client/match/available":
            output = '{"err":666, "errmsg":"JustEmuTarkov Not supports online matching. Please use offline match.\nAfter pressing `OK` your profile will be refreshed", "data":false}';
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
            output = repair_f.main(info);
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
            keepAlive_f.main(); // call it each 30 seconds cause game - can be used for something interesting
            output = '{"err":0,"errmsg":null,"data":{"msg":"OK"}}';
            break;
        case "/client/game/version/validate":
            constants.setVersion(info.version.major);
            output = '{"err":0,"errmsg":null,"data":null}';
            break;
        case "/client/notifier/channel/create":
            output = '{"err":0,"errmsg":null,"data":{"notifier":{"server":"' + backendUrl + '","channel_id":"testChannel","url":"' + backendUrl + '/notifierBase"},"notifierServer":"' + backendUrl + '/notifierServer"}}';
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
            console.log("[UNHANDLED][" + req.url + "] request data: " + JSON.stringify(info), "white", "red");
            break;
    }
		if(typeof info.crc != "undefined"){
			let crctest = JSON.parse(output);
			if(typeof crctest.crc != "undefined"){
				if(info.crc !== crctest.crc){
					crctest.crc = utility.adlerGen(output.replace(/\s\s+/g, ''));
					output = JSON.stringify(crctest).replace(/\s\s+/g, '');
					console.log("[NewCRC:" + crctest.crc + "]", "", "", true);
				}
			}
		}

    return output;
}

module.exports.get = get;