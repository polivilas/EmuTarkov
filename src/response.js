"use strict";
require('./libs.js');

function nullResponse(info, body) {
    return '{"err":0, "errmsg":null, "data":null}';
}

function nullArrayResponse(info, body) {
    return '{"err":0, "errmsg":null, "data":[]}';
}

function showIndex(info, body) {
    return index_f.index();
}

function showInventoryChecker(info, body) {
    let output = "";
	let inv = itm_hf.recheckInventoryFreeSpace(profile.getCharacterData());
    
    output += "<style>td{border:1px solid #aaa;}</style>Inventory Stash Usage:<br><table><tr><td>-</td><td>0</td><td>1</td><td>2</td><td>3</td><td>4</td><td>5</td><td>6</td><td>7</td><td>8</td><td>9<br>";
    
    for (let y = 0; y < inv.length; y++) {
        output += '<tr><td>' + y + "</td>";
        
		for (let x = 0; x < inv[0].length; x++) {
            output += '<td ' + ((inv[y][x] === 1)?'style="background:#aaa"':'') + '>' + inv[y][x] + "</td>";
            output += "</tr>";
        }
        
        output += "</table>";
    }

    return output;
}

function getFriendList(info, body) {
    return '{"err":0, "errmsg":null, "data":{"Friends":[], "Ignore":[], "InIgnoreList":[]}}';
}

function handleItems(info, body) {
    let output = item.moving(info);

    console.log(output);
    return output;
}

function getLocale(info, body) {
    return locale.getLanguages();
}

function loginUser(info, body) {
    let output = profile.find(info, backendUrl);
    
    console.log(output);
    return output;
}

function getQueueStatus(info, body) {
    return '{"err":0, "errmsg":null, "data":{"status": 0, "position": 0}}';
}

function getItems(info, body) {
    return JSON.stringify(items_f.prepareItems());
}

function getGlobals(info, body) {
    return utility.readJson('data/configs/globals.json');
}

function getProfileData(info, body) {
    return JSON.stringify(profile.getCharacterData());
}

function selectProfile(info, body) {
    return '{"err":0, "errmsg":null, "data":{"status":"ok", "notifier":{"server":"' + backendUrl + '", "channel_id":"f194bcedc0890f22db37a00dbd7414d2afba981eef61008159a74a29d5fee1cf"}}}';
}

function getProfileStatus(info, body) {
    return '{"err":0, "errmsg":null, "data":[{"profileid":"5c71b934354682353958e983", "status":"Free", "sid":"", "ip":"", "port":0}, {"profileid":"5c71b934354682353958e984", "status":"Free", "sid":"", "ip":"", "port":0}]}';
}

function getWeather(info, body) {
    return weather_f.main();
}

function getLocations(info, body) {
    return JSON.stringify(locations, null, "\t").replace(/[\r\n\t]/g, '').replace(/\s\s+/g, '').replace(/[\\]/g, "");
}

function getTemplates(info, body) {
    return utility.readJson('data/configs/templates.json');
}

function getQuests(info, body) {
    return JSON.stringify(quests, null, "\t").replace(/[\r\n\t]/g, '').replace(/\s\s+/g, '').replace(/[\\]/g, "");
}

function getMetrics(info, body) {
    return utility.readJson('data/configs/metricsConfig.json');
}

function getBots(info, body) {
    return JSON.stringify(bots.generate(body));
}

function getTraderList(info, body) {
    return JSON.stringify(trader.loadAllTraders());
}

function getServer(info, body) {
    return '{"err":0, "errmsg":null, "data":[{"ip":"' + ip + '", "port":"' + port + '"}]}';
}

function searchRagfair(info, body) {
    return ragfair.getOffers(info);
}

function getAvailableMatch(info, body) {
    return '{"err":404, "errmsg":"JustEmuTarkov Not supports online matching. Please use offline match.\n", "data":false}';
}

function joinMatch(info, body) {
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

function getChatServerList(info, body) {
    return '{"err":0, "errmsg":null, "data":[{"_id":"5ae20a0dcb1c13123084756f", "RegistrationId":20, "DateTime":' + Math.floor(new Date() / 1000) + ', "IsDeveloper":true, "Regions":["EUR"], "VersionId":"bgkidft87ddd", "Ip":"", "Port":0, "Chats":[{"_id":"0", "Members":0}]}]}';
}

function changeNickname(info, body) {
    return profile.changeNickname(info);
}

function changeVoice(info, body) {
    profile.changeVoice(info);
    return '{"err":0, "errmsg":null, "data":null}';
}

function getGroupStatus(info, body) {
    return '{ "err": 0, "errmsg": null, "data": { "players": [], "invite": [], "group": [] } }';
}

function handleRepair(info, body) {
    return repair_f.main(info);
}

function handleKeepAlive(info, body) {
    // updates trader refresh time only
    keepAlive_f.main();
    return '{"err":0,"errmsg":null,"data":{"msg":"OK"}}';
}

function validateGameVersion(info, body) {
    constants.setVersion(info.version.major);
    return '{"err":0,"errmsg":null,"data":null}';
}

function setupConnection(info, body) {
    let output = '{"err":0,"errmsg":null,"data":{"queued": false, "banTime": 0, "hash": "BAN0", "lang": "en", "aid": "' + constants.getActiveID() + '", "token": "token_' + constants.getActiveID() + '", "taxonomy": "341", "activeProfileId": "5c71b934354682353958e984", "nickname": "user", "backend": {"Trading":"' + backendUrl + '", "Messaging":"' + backendUrl + '", "Main":"' + backendUrl + '", "RagFair":"' + backendUrl + '"}, "totalInGame": 0}}';

    console.log(output);
    return output;
}

function getCustomization(info, body) {
    return utility.readJson('data/configs/customization/customization.json');
}

function getCustomizationOffers(info, body) {
    return utility.readJson('data/configs/customization/offers.json');
}

function getCustomizationStorage(info, body) {
    return utility.readJson('data/configs/customization/storage.json');
}

function getHideoutRecipes(info, body) {
    return utility.readJson('data/configs/hideout/production_recipes.json');
}

function getHideoutSettings(info, body) {
    return utility.readJson('data/configs/hideout/settings.json');
}

function getHideoutAreas(info, body) {
    return utility.readJson('data/configs/hideout/areas.json');
}

function getScavcaseRecipes(info, body) {
    return utility.readJson('data/configs/hideout/production_scavcase_recipes.json');
}

function getHandbookUserlist(info, body) {
    return utility.readJson('data/configs/userBuilds.json');
}

function createNotifierChannel(info, body) {
    return '{"err":0,"errmsg":null,"data":{"notifier":{"server":"' + backendUrl + '","channel_id":"testChannel","url":"' + backendUrl + '/notifierBase"},"notifierServer":"' + backendUrl + '/notifierServer"}}';
}

function setupStaticRPC() {
    rpc.addResponse("/", showIndex);
    rpc.addResponse("/inv", showInventoryChecker);
    rpc.addResponse("/client/friend/list", getFriendList);
    rpc.addResponse("/client/game/profile/items/moving", handleItems);
    rpc.addResponse("/client/languages", getLocale);
    rpc.addResponse("/client/game/login", loginUser);
    rpc.addResponse("/client/queue/status", getQueueStatus);
    rpc.addResponse("/client/items", getItems);
    rpc.addResponse("/client/globals", getGlobals);
    rpc.addResponse("/client/game/profile/list", getProfileData);
    rpc.addResponse("/client/game/profile/select", selectProfile);
    rpc.addResponse("/client/profile/status", getProfileStatus);
    rpc.addResponse("/client/weather", getWeather);
    rpc.addResponse("/client/locations", getLocations);
    rpc.addResponse("/client/handbook/templates", getTemplates);
    rpc.addResponse("/client/quest/list", getQuests);
    rpc.addResponse("/client/getMetricsConfig", getMetrics);
    rpc.addResponse("/client/game/bot/generate", getBots);
    rpc.addResponse("/client/trading/api/getTradersList", getTraderList);
    rpc.addResponse("/client/server/list", getServer);
    rpc.addResponse("/client/ragfair/search", searchRagfair);
    rpc.addResponse("/client/match/available", getAvailableMatch);
    rpc.addResponse("/client/match/join", joinMatch);
    rpc.addResponse("/client/chatServer/list", getChatServerList);
    rpc.addResponse("/client/game/profile/nickname/change", changeNickname);
    rpc.addResponse("/client/game/profile/voice/change", changeVoice);
    rpc.addResponse("/client/match/group/status", getGroupStatus);
    rpc.addResponse("/client/repair/exec", handleRepair);
    rpc.addResponse("/client/game/keepalive", handleKeepAlive);
    rpc.addResponse("/client/game/version/validate", validateGameVersion);
    rpc.addResponse("/client/game/config", setupConnection);
    rpc.addResponse("/client/customization" , getCustomization);
    rpc.addResponse("/client/trading/customization/5ac3b934156ae10c4430e83c/offers", getCustomizationOffers);
    rpc.addResponse("/client/trading/customization/storage", getCustomizationStorage);
    rpc.addResponse("/client/hideout/production/recipes", getHideoutRecipes);
    rpc.addResponse("/client/hideout/settings", getHideoutSettings);
    rpc.addResponse("/client/hideout/areas", getHideoutAreas);
    rpc.addResponse("/client/hideout/production/scavcase/recipes", getScavcaseRecipes);
    rpc.addResponse("/client/handbook/builds/my/list", getHandbookUserlist);
    rpc.addResponse("/client/notifier/channel/create", createNotifierChannel);

    // NULL responses
    rpc.addResponse("/favicon.ico", nullResponse);
    rpc.addResponse("/client/game/logout", nullResponse);
    rpc.addResponse("/client/putMetrics", nullResponse);
    rpc.addResponse("/client/match/group/looking/stop", nullResponse);
    rpc.addResponse("/client/match/group/exit_from_menu", nullResponse);
    rpc.addResponse("/client/match/exit", nullResponse);
    rpc.addResponse("/client/match/updatePing", nullResponse);
    rpc.addResponse("/client/game/profile/savage/regenerate", nullResponse);
    rpc.addResponse("/client/mail/dialog/list", nullArrayResponse);
    rpc.addResponse("/client/friend/request/list/outbox", nullArrayResponse);
    rpc.addResponse("/client/friend/request/list/inbox", nullArrayResponse);
}

module.exports.setupStaticRPC = setupStaticRPC;