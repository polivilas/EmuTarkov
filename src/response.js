"use strict";
require('./libs.js');

function nullResponse(info) {
    return '{"err":0, "errmsg":null, "data":null}';
}

function nullArrayResponse(info) {
    return '{"err":0, "errmsg":null, "data":[]}';
}

function showIndex(info) {
    return index_f.index();
}

function showInventoryChecker(info) {
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

function getFriendList(info) {
    return '{"err":0, "errmsg":null, "data":{"Friends":[], "Ignore":[], "InIgnoreList":[]}}';
}

function handleItems(info) {
    let output = item.moving(info);

    console.log(output);
    return output;
}

function getLocale(info) {
    return locale.getLanguages();
}

function loginUser(info) {
    let output = profile.find(info, backendUrl);
    
    console.log(output);
    return output;
}

function getQueueStatus(info) {
    return '{"err":0, "errmsg":null, "data":{"status": 0, "position": 0}}';
}

function getItems(info) {
    return JSON.stringify(items_f.prepareItems());
}

function getGlobals(info) {
    return utility.readJson('data/configs/globals.json');
}

function getProfileData(info) {
    return JSON.stringify(profile.getCharacterData());
}

function selectProfile(info) {
    return '{"err":0, "errmsg":null, "data":{"status":"ok", "notifier":{"server":"' + backendUrl + '", "channel_id":"f194bcedc0890f22db37a00dbd7414d2afba981eef61008159a74a29d5fee1cf"}}}';
}

function getProfileStatus(info) {
    return '{"err":0, "errmsg":null, "data":[{"profileid":"5c71b934354682353958e983", "status":"Free", "sid":"", "ip":"", "port":0}, {"profileid":"5c71b934354682353958e984", "status":"Free", "sid":"", "ip":"", "port":0}]}';
}

function getWeather(info) {
    return weather_f.main();
}

function getLocations(info) {
    return JSON.stringify(locations, null, "\t").replace(/[\r\n\t]/g, '').replace(/\s\s+/g, '').replace(/[\\]/g, "");
}

function getTemplates(info) {
    return utility.readJson('data/configs/templates.json');
}

function getQuests(info) {
    return JSON.stringify(quests, null, "\t").replace(/[\r\n\t]/g, '').replace(/\s\s+/g, '').replace(/[\\]/g, "");
}

function getMetrics(info) {
    return utility.readJson('data/configs/metricsConfig.json');
}

function getBots(info) {
    return JSON.stringify(bots.generate(info));
}

function getTraderList(info) {
    return JSON.stringify(trader.loadAllTraders());
}

function getServer(info) {
    return '{"err":0, "errmsg":null, "data":[{"ip":"' + ip + '", "port":"' + port + '"}]}';
}

function searchRagfair(info) {
    return ragfair.getOffers(info);
}

function getAvailableMatch(info) {
    return '{"err":404, "errmsg":"JustEmuTarkov Not supports online matching. Please use offline match.\n", "data":false}';
}

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

function getChatServerList(info) {
    return '{"err":0, "errmsg":null, "data":[{"_id":"5ae20a0dcb1c13123084756f", "RegistrationId":20, "DateTime":' + Math.floor(new Date() / 1000) + ', "IsDeveloper":true, "Regions":["EUR"], "VersionId":"bgkidft87ddd", "Ip":"", "Port":0, "Chats":[{"_id":"0", "Members":0}]}]}';
}

function changeNickname(info) {
    return profile.changeNickname(info);
}

function changeVoice(info) {
    profile.changeVoice(info);
    return '{"err":0, "errmsg":null, "data":null}';
}

function getGroupStatus(info) {
    return '{ "err": 0, "errmsg": null, "data": { "players": [], "invite": [], "group": [] } }';
}

function handleRepair(info) {
    return repair_f.main(info);
}

function handleKeepAlive(info) {
    // updates trader refresh time only
    keepAlive_f.main();
    return '{"err":0,"errmsg":null,"data":{"msg":"OK"}}';
}

function validateGameVersion(info) {
    constants.setVersion(info.version.major);
    return '{"err":0,"errmsg":null,"data":null}';
}

function setupConnection(info) {
    let output = '{"err":0,"errmsg":null,"data":{"queued": false, "banTime": 0, "hash": "BAN0", "lang": "en", "aid": "' + constants.getActiveID() + '", "token": "token_' + constants.getActiveID() + '", "taxonomy": "341", "activeProfileId": "5c71b934354682353958e984", "nickname": "user", "backend": {"Trading":"' + backendUrl + '", "Messaging":"' + backendUrl + '", "Main":"' + backendUrl + '", "RagFair":"' + backendUrl + '"}, "totalInGame": 0}}';

    console.log(output);
    return output;
}

function getCustomization(info) {
    return utility.readJson('data/configs/customization/customization.json');
}

function getCustomizationOffers(info) {
    return utility.readJson('data/configs/customization/offers.json');
}

function getCustomizationStorage(info) {
    return utility.readJson('data/configs/customization/storage.json');
}

function getHideoutRecipes(info) {
    return utility.readJson('data/configs/hideout/production_recipes.json');
}

function getHideoutSettings(info) {
    return utility.readJson('data/configs/hideout/settings.json');
}

function getHideoutAreas(info) {
    return utility.readJson('data/configs/hideout/areas.json');
}

function getScavcaseRecipes(info) {
    return utility.readJson('data/configs/hideout/production_scavcase_recipes.json');
}

function getHandbookUserlist(info) {
    return utility.readJson('data/configs/userBuilds.json');
}

function createNotifierChannel(info) {
    return '{"err":0,"errmsg":null,"data":{"notifier":{"server":"' + backendUrl + '","channel_id":"testChannel","url":"' + backendUrl + '/notifierBase"},"notifierServer":"' + backendUrl + '/notifierServer"}}';
}

function getMapLocation(info) {
    return "MAPCONFIG";
}

function getRaidBanners(info) {
    return "CONTENT";
}

function getImage(info) {
    return "IMAGE";
}

function handleNotifierCustomLink(info) {
    return 'DONE';
}

function getProfilePurchases(info) {
    return profile.getPurchasesData();
}

function getTrader(info) {
    return JSON.stringify(trader.get(url.replace(getTrader, '')));
}

function getAssort(info) {
    return JSON.stringify(trader.getAssort(url.replace(assort, '')));
}

function getMenuLocale(info) {
    return locale.getMenu(url.replace(localeMenu, ''));
}

function getGlobalLocale(info) {
    return locale.getGlobal(url.replace(localeGlobal, ''));
}

function setupRPC() {
    // static responses
    rpc.addStaticResponse("/", showIndex);
    rpc.addStaticResponse("/inv", showInventoryChecker);
    rpc.addStaticResponse("/client/friend/list", getFriendList);
    rpc.addStaticResponse("/client/game/profile/items/moving", handleItems);
    rpc.addStaticResponse("/client/languages", getLocale);
    rpc.addStaticResponse("/client/game/login", loginUser);
    rpc.addStaticResponse("/client/queue/status", getQueueStatus);
    rpc.addStaticResponse("/client/items", getItems);
    rpc.addStaticResponse("/client/globals", getGlobals);
    rpc.addStaticResponse("/client/game/profile/list", getProfileData);
    rpc.addStaticResponse("/client/game/profile/select", selectProfile);
    rpc.addStaticResponse("/client/profile/status", getProfileStatus);
    rpc.addStaticResponse("/client/weather", getWeather);
    rpc.addStaticResponse("/client/locations", getLocations);
    rpc.addStaticResponse("/client/handbook/templates", getTemplates);
    rpc.addStaticResponse("/client/quest/list", getQuests);
    rpc.addStaticResponse("/client/getMetricsConfig", getMetrics);
    rpc.addStaticResponse("/client/game/bot/generate", getBots);
    rpc.addStaticResponse("/client/trading/api/getTradersList", getTraderList);
    rpc.addStaticResponse("/client/server/list", getServer);
    rpc.addStaticResponse("/client/ragfair/search", searchRagfair);
    rpc.addStaticResponse("/client/match/available", getAvailableMatch);
    rpc.addStaticResponse("/client/match/join", joinMatch);
    rpc.addStaticResponse("/client/chatServer/list", getChatServerList);
    rpc.addStaticResponse("/client/game/profile/nickname/change", changeNickname);
    rpc.addStaticResponse("/client/game/profile/voice/change", changeVoice);
    rpc.addStaticResponse("/client/match/group/status", getGroupStatus);
    rpc.addStaticResponse("/client/repair/exec", handleRepair);
    rpc.addStaticResponse("/client/game/keepalive", handleKeepAlive);
    rpc.addStaticResponse("/client/game/version/validate", validateGameVersion);
    rpc.addStaticResponse("/client/game/config", setupConnection);
    rpc.addStaticResponse("/client/customization" , getCustomization);
    rpc.addStaticResponse("/client/trading/customization/5ac3b934156ae10c4430e83c/offers", getCustomizationOffers);
    rpc.addStaticResponse("/client/trading/customization/storage", getCustomizationStorage);
    rpc.addStaticResponse("/client/hideout/production/recipes", getHideoutRecipes);
    rpc.addStaticResponse("/client/hideout/settings", getHideoutSettings);
    rpc.addStaticResponse("/client/hideout/areas", getHideoutAreas);
    rpc.addStaticResponse("/client/hideout/production/scavcase/recipes", getScavcaseRecipes);
    rpc.addStaticResponse("/client/handbook/builds/my/list", getHandbookUserlist);
    rpc.addStaticResponse("/client/notifier/channel/create", createNotifierChannel);

    // dynamic responses
    rpc.addDynamicResponse("/api/location", getMapLocation);
    rpc.addDynamicResponse("files/CONTENT/banners", getRaidBanners);
    rpc.addDynamicResponse(".jpg", getImage);
    rpc.addDynamicResponse(".png", getImage);
    rpc.addDynamicResponse("/data/images/", getImage);
    rpc.addDynamicResponse("/files/quest", getImage);
    rpc.addDynamicResponse("/files/handbook", getImage);
    rpc.addDynamicResponse("/files/trader/avatar", getImage);
    rpc.addDynamicResponse("/?last_id", handleNotifierCustomLink);
    rpc.addDynamicResponse("/client/trading/api/getUserAssortPrice/trader/", getProfilePurchases);
    rpc.addDynamicResponse("/client/trading/api/getTrader/", getTrader);
    rpc.addDynamicResponse("/client/trading/api/getTraderAssort/", getAssort);
    rpc.addDynamicResponse("/client/menu/locale/", getMenuLocale);
    rpc.addDynamicResponse("/client/locale/", getGlobalLocale);

    // null responses
    rpc.addStaticResponse("/favicon.ico", nullResponse);
    rpc.addStaticResponse("/client/game/logout", nullResponse);
    rpc.addStaticResponse("/client/putMetrics", nullResponse);
    rpc.addStaticResponse("/client/match/group/looking/stop", nullResponse);
    rpc.addStaticResponse("/client/match/group/exit_from_menu", nullResponse);
    rpc.addStaticResponse("/client/match/exit", nullResponse);
    rpc.addStaticResponse("/client/match/updatePing", nullResponse);
    rpc.addStaticResponse("/client/game/profile/savage/regenerate", nullResponse);
    rpc.addStaticResponse("/client/mail/dialog/list", nullArrayResponse);
    rpc.addStaticResponse("/client/friend/request/list/outbox", nullArrayResponse);
    rpc.addStaticResponse("/client/friend/request/list/inbox", nullArrayResponse);
    rpc.addDynamicResponse("/notifierBase", nullArrayResponse);
    rpc.addDynamicResponse("/notifierServer", nullArrayResponse);
    rpc.addDynamicResponse("/push/notifier/get/", nullArrayResponse);
}

module.exports.setupRPC = setupRPC;