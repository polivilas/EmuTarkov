"use strict";
require('./libs.js');

const staticRoutes = {
    "/": showIndex,
    "/inv": showInventoryChecker,
    "/client/friend/list": getFriendList,
    "/client/game/profile/items/moving": handleItems,
    "/client/languages": getLocale,
    "/client/queue/status": getQueueStatus,
    "/client/items": getItems,
    "/client/globals": getGlobals,
    "/client/game/profile/list": getProfileData,
    "/client/game/profile/select": selectProfile,
    "/client/profile/status": getProfileStatus,
    "/client/weather": getWeather,
    "/client/locations": getLocations,
    "/client/handbook/templates": getTemplates,
    "/client/quest/list": getQuests,
    "/client/getMetricsConfig": getMetrics,
    "/client/game/bot/generate": getBots,
    "/client/trading/api/getTradersList": getTraderList,
    "/client/server/list": getServer,
    "/client/ragfair/search": searchRagfair,
    "/client/ragfair/find": searchRagfair,
    "/client/match/available": getAvailableMatch,
    "/client/match/join": joinMatch,
    "/client/chatServer/list": getChatServerList,
    "/client/game/profile/nickname/change": changeNickname,
    "/client/game/profile/voice/change": changeVoice,
    "/client/match/group/status": getGroupStatus,
    "/client/repair/exec": handleRepair,
    "/client/game/keepalive": handleKeepAlive,
    "/client/game/version/validate": validateGameVersion,
    "/client/game/config": getGameConfig,
    "/client/customization": getCustomization,
    "/client/trading/customization/5ac3b934156ae10c4430e83c/offers": getCustomizationOffers,
    "/client/trading/customization/579dc571d53a0658a154fbec/offers": getCustomizationOffers,
    "/client/trading/customization/storage": getCustomizationStorage,
    "/client/hideout/production/recipes": getHideoutRecipes,
    "/client/hideout/settings": getHideoutSettings,
    "/client/hideout/areas": getHideoutAreas,
    "/client/hideout/production/scavcase/recipes": getScavDatacaseRecipes,
    "/client/handbook/builds/my/list": getHandbookUserlist,
    "/client/notifier/channel/create": createNotifierChannel,
    "/client/game/profile/nickname/reserved": getReservedNickname,
    "/client/game/profile/nickname/validate": validateNickname,
    "/client/game/profile/create": createProfile,
    "/client/insurance/items/list/cost": getInsuranceCost,
    "/favicon.ico": nullResponse,
    "/client/game/logout": nullResponse,
    "/client/putMetrics": nullResponse,
    "/client/match/group/looking/stop": nullResponse,
    "/client/match/group/exit_from_menu": nullResponse,
    "/client/match/exit": nullResponse,
    "/client/match/updatePing": nullResponse,
    "/client/game/profile/savage/regenerate": regenerateScav,
    "/client/mail/dialog/list": getMailDialogList,
    "/client/mail/dialog/view": getMailDialogView,
    "/client/mail/dialog/info": getMailDialogInfo,
    "/client/mail/dialog/remove": removeDialog,
    "/client/mail/dialog/pin": pinDialog,
    "/client/mail/dialog/unpin": unpinDialog,
    "/client/friend/request/list/outbox": nullArrayResponse,
    "/client/friend/request/list/inbox": nullArrayResponse,

    // EmuTarkov-Launcher
    "/launcher/profile/login": loginUser
};

const dynamicRoutes = {
    "/api/location": getMapLocation,
    ".jpg": getImage,
    ".png": getImage,
    "/?last_id": handleNotifierCustomLink,
    "/client/trading/api/getUserAssortPrice/trader/": getProfilePurchases,
    "/client/trading/api/getTrader/": getTrader,
    "/client/trading/api/getTraderAssort/": getAssort,
    "/client/menu/locale/": getMenuLocale,
    "/client/locale/": getGlobalLocale,
    "/notifierBase": nullArrayResponse,
    "/notifierServer": nullArrayResponse,
    "/push/notifier/get/": nullArrayResponse
};

function nullResponse(url, info, sessionID) {
    return '{"err":0, "errmsg":null, "data":null}';
}

function nullArrayResponse(url, info, sessionID) {
    return '{"err":0, "errmsg":null, "data":[]}';
}

function showIndex(url, info, sessionID) {
    return index_f.index();
}

function showInventoryChecker(url, info, sessionID) {
    let output = "";
    let inv = itm_hf.recheckInventoryFreeSpace(profile_f.get(sessionID));

    output += "<style>td{border:1px solid #aaa;}</style>Inventory Stash Usage:<br><table><tr><td>-</td><td>0</td><td>1</td><td>2</td><td>3</td><td>4</td><td>5</td><td>6</td><td>7</td><td>8</td><td>9<br>";

    for (let y = 0; y < inv.length; y++) {
        output += '<tr><td>' + y + "</td>";

        for (let x = 0; x < inv[0].length; x++) {
            output += '<td ' + ((inv[y][x] === 1) ? 'style="background:#aaa"' : '') + '>' + inv[y][x] + "</td>";
        }

        output += "</tr>";
    }

    output += "</table>";
    return output;
}

function getGameConfig(url, info, sessionID) {
    let backendUrl = "https://" + ip;
    return '{"err":0,"errmsg":null,"data":{"queued": false, "banTime": 0, "hash": "BAN0", "lang": "en", "aid":' + sessionID + ', "token": "token_' + sessionID + '", "taxonomy": "341", "activeProfileId": "user' + sessionID + 'pmc", "nickname": "user", "backend": {"Trading":"' + backendUrl + '", "Messaging":"' + backendUrl + '", "Main":"' + backendUrl + '", "RagFair":"' + backendUrl + '"}, "totalInGame": 0}}';
}

function getFriendList(url, info, sessionID) {
    return '{"err":0, "errmsg":null, "data":{"Friends":[], "Ignore":[], "InIgnoreList":[]}}';
}

function handleItems(url, info, sessionID) {
    return item.moving(info, sessionID);
}

function getLocale(url, info, sessionID) {
    return locale.getLanguages();
}

function loginUser(url, info, sessionID) {
    return account_f.findID(info);
}

function getInsuranceCost(url, info, sessionID) {
    return insure_f.cost(info);
}

function getQueueStatus(url, info, sessionID) {
    return '{"err":0, "errmsg":null, "data":{"status": 0, "position": 0}}';
}

function getItems(url, info, sessionID) {
    return JSON.stringify(json.parse(json.read(filepaths.user.cache.items)));
}

function getGlobals(url, info, sessionID) {
    return json.read(filepaths.user.cache.globals);
}

function getProfileData(url, info, sessionID) {
    return JSON.stringify(profile_f.get(sessionID));
}

function regenerateScav(url, info, sessionID) {
    let response = {err: 0, errmsg: null, data: []};

    response.data.push(profile_f.generateScav(sessionID));
    return JSON.stringify(response);
}

function selectProfile(url, info, sessionID) {
    return '{"err":0, "errmsg":null, "data":{"status":"ok", "notifier":{"server":"https://' + ip + '", "channel_id":"f194bcedc0890f22db37a00dbd7414d2afba981eef61008159a74a29d5fee1cf"}}}';
}

function getProfileStatus(url, info, sessionID) {
    return '{"err":0, "errmsg":null, "data":[{"profileid":"scav' + sessionID + '", "status":"Free", "sid":"", "ip":"", "port":0}, {"profileid":"pmc' + sessionID + '", "status":"Free", "sid":"", "ip":"", "port":0}]}';
}

function getWeather(url, info, sessionID) {
    let time = utility.getTime().replace("-", ":").replace("-", ":");
    let date = utility.getDate();
    let datetime = date + " " + time;
    let output = {};

    // set weather
    if (settings.gameplay.location.forceWeatherEnabled) {
        output = weather.data[settings.gameplay.location.forceWeatherId];
    } else {
        output = weather.data[utility.getRandomInt(0, weather.length - 1)];
    }

    // replace date and time
    if (settings.gameplay.location.realTimeEnabled) {
        output.data.weather.timestamp = Math.floor(new Date() / 1000);
        output.data.weather.date = date;
        output.data.weather.time = datetime;
        output.data.date = date;
        output.data.time = time;
    }

    return JSON.stringify(output);
}

function getLocations(url, info, sessionID) {
    return JSON.stringify(locations, null, "\t").replace(/[\r\n\t]/g, '').replace(/\s\s+/g, '').replace(/[\\]/g, "");
}

function getTemplates(url, info, sessionID) {
    return json.read(filepaths.user.cache.templates);
}

function getQuests(url, info, sessionID) {
    return JSON.stringify(quests, null, "\t").replace(/[\r\n\t]/g, '').replace(/\s\s+/g, '').replace(/[\\]/g, "");
}

function getMetrics(url, info, sessionID) {
    return json.read(`{"err":0,"errmsg":null,"data":{"Keys":[0,8,10,13,16,20,26,30,33,45,53,66,100,500,750,1000],"NetProcessingBins":[0,1,2,3,4,5,6,7,8,10,13,16,20,26,30,33,45,53,66,100,500,750,1000],"RenderBins":[0,4,8,10,13,16,20,26,30,33,45,53,66,100,500,750,1000],"GameUpdateBins":[0,4,8,10,13,16,20,26,30,33,45,53,66,100,500,750,1000],"MemoryMeasureInterval":180}}`);
}

function getBots(url, info, sessionID) {
    return JSON.stringify(bots.generate(info));
}

function getTraderList(url, info, sessionID) {
    return JSON.stringify(trader.loadAllTraders(sessionID));
}

function getServer(url, info, sessionID) {
    return '{"err":0, "errmsg":null, "data":[{"ip":"' + ip + '", "port":"' + 443 + '"}]}';
}

function searchRagfair(url, info, sessionID) {
    return ragfair.getOffers(info);
}

function getAvailableMatch(url, info, sessionID) {
    return '{"err":404, "errmsg":"EmuTarkov-0.8.0 does not supports online raids. Please use offline match.\n", "data":false}';

    // use this for online lan testing
    //return '{"err":0, "errmsg":null, "data":true}';
}

function joinMatch(url, info, sessionID) {
    let shortid = "";
    let profileId = "";

    // check if the player is a scav
    if (info.savage === true) {
        shortid = "3XR5";
        profileId = "scav" + sessionID;
    } else {
        shortid = "3SRC";
        profileId = "pmc" + sessionID;
    }

    return JSON.stringify({
        "err": 0,
        "errmsg": null,
        "data": [{
            "profileid": profileId,
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

function getChatServerList(url, info, sessionID) {
    return '{"err":0, "errmsg":null, "data":[{"_id":"5ae20a0dcb1c13123084756f", "RegistrationId":20, "DateTime":' + Math.floor(new Date() / 1000) + ', "IsDeveloper":true, "Regions":["EUR"], "VersionId":"bgkidft87ddd", "Ip":"", "Port":0, "Chats":[{"_id":"0", "Members":0}]}]}';
}

function changeNickname(url, info, sessionID) {
    return profile_f.changeNickname(info);
}

function changeVoice(url, info, sessionID) {
    profile_f.changeVoice(info);
    return nullResponse(url, info, sessionID);
}

function getGroupStatus(url, info, sessionID) {
    return '{ "err": 0, "errmsg": null, "data": { "players": [], "invite": [], "group": [] } }';
}

function handleRepair(url, info, sessionID) {
    return repair_f.main(info);
}

function handleKeepAlive(url, info, sessionID) {
    keepAlive_f.main(sessionID);
    return '{"err":0,"errmsg":null,"data":{"msg":"OK"}}';
}

function validateGameVersion(url, info, sessionID) {
    constants.setVersion(info.version.major);
    return nullResponse(url, info, sessionID);
}

function getCustomization(info) {
    return json.stringify(customizationOutfits);
}

function getCustomizationOffers(url, info, sessionID) {
    let tmpOffers = [];
    let offers = customizationOffers;
    let splittedUrl = url.split('/');

    for (let offer of offers.data) {
        if (offer.tid === splittedUrl[splittedUrl.length - 2]) {
            tmpOffers.push(offer);
        }
    }

    offers.data = tmpOffers;
    return JSON.stringify(offers);
}

function getCustomizationStorage(url, info, sessionID) {
    return json.read(customization_f.getPath(sessionID));
}

function getHideoutRecipes(url, info, sessionID) {
    return json.read(filepaths.user.cache.hideout_production);
}

function getHideoutSettings(url, info, sessionID) {
    return json.read(filepaths.hideout.settings);
}

function getHideoutAreas(url, info, sessionID) {
    return json.read(filepaths.user.cache.hideout_areas);
}

function getScavDatacaseRecipes(url, info, sessionID) {
    return json.read(filepaths.user.cache.hideout_scavcase);
}

function getHandbookUserlist(url, info, sessionID) {
    return json.read(weaponBuilds_f.getPath(sessionID));
}

function createNotifierChannel(url, info, sessionID) {
    return '{"err":0,"errmsg":null,"data":{"notifier":{"server":"https://' + ip + '","channel_id":"testChannel","url":"https://' + ip + '/notifierBase"},"notifierServer":"https://' + ip + '/notifierServer"}}';
}

function getReservedNickname(url, info, sessionID) {
    return '{"err":0,"errmsg":null,"data":"' + account_f.getReservedNickname(sessionID) + '"}';
}

function validateNickname(url, info, sessionID) {
    // todo: validate nickname properly
    return '{"err":0,"errmsg":null,"data":{"status":"ok"}}';
}

function createProfile(url, info, sessionID) {
    profile_f.create(info, sessionID);
    return '{"err":0,"errmsg":null,"data":{"uid":"pmc' + sessionID + '"}}';
}

function getMailDialogList(url, info, sessionID) {
    return dialogue_f.generateDialogueList(sessionID);
}

function getMailDialogView(url, info, sessionID) {
    return dialogue_f.generateDialogueView(info.dialogId, sessionID);
}

// This doesn't appear to be called.
function getMailDialogInfo(url, info, sessionID) {
    return nullResponse;
}

function removeDialog(url, info, sessionID) {
    dialogue_f.removeDialogue(info.dialogId, sessionID);
    return nullArrayResponse;
}

function pinDialog(url, info, sessionID) {
    dialogue_f.setDialoguePin(info.dialogId, true, sessionID);
    return nullArrayResponse;
}

function unpinDialog(url, info, sessionID) {
    dialogue_f.setDialoguePin(info.dialogId, false, sessionID);
    return nullArrayResponse;
}

function getMapLocation(url, info, sessionID) {
    return "MAPCONFIG";
}

function getImage(url, info, sessionID) {
    return "IMAGE";
}

function handleNotifierCustomLink(url, info, sessionID) {
    return 'DONE';
}

function getProfilePurchases(url, info, sessionID) {
    // let's grab the traderId from the url
    return profile_f.getPurchasesData(url.substr(url.lastIndexOf('/') + 1), sessionID);
}

function getTrader(url, info, sessionID) {
    return JSON.stringify(trader.get(url.replace("/client/trading/api/getTrader/", ''), sessionID));
}

function getAssort(url, info, sessionID) {
    return JSON.stringify(assort_f.get(url.replace("/client/trading/api/getTraderAssort/", ''), sessionID));
}

function getMenuLocale(url, info, sessionID) {
    return locale.getMenu(url.replace("/client/menu/locale/", ''));
}

function getGlobalLocale(url, info, sessionID) {
    return locale.getGlobal(url.replace("/client/locale/", ''));
}

function getResponse(req, body, sessionID) {
    let output = "";
    let url = req.url;
    let info = JSON.parse("{}");

    // parse body
    if (body !== "") {
        info = JSON.parse(body);
    }

    // remove ?retry=X from URL
    if (url.indexOf("?retry=") != -1) {
        url = url.split("?retry=")[0];
    }

    // handle static requests
    if (typeof staticRoutes[url] !== "undefined") {
        return staticRoutes[url](url, info, sessionID);
    }

    // handle dynamic requests
    for (let key in dynamicRoutes) {
        if (url.indexOf(key) != -1) {
            return dynamicRoutes[key](url, info, sessionID);
        }
    }

    // request couldn't be handled
    if (output === "") {
        logger.logError("[UNHANDLED][" + url + "] request data: " + json.stringify(info));
        output = '{"err":404, "errmsg":"UNHANDLED RESPONSE: ' + url + '", "data":null}';
        return output;
    }

    // load from cache when server is in release mode
    if (typeof info.crc != "undefined") {
        let crctest = json.parse(output);

        if (typeof crctest.crc != "undefined") {
            if (info.crc.toString() === crctest.crc.toString()) {
                logger.logInfo("[Loading from game cache files]");
                output = nullResponse(url, info, sessionID);
            } else {
                output = json.stringify(crctest).replace(/\s\s+/g, '');
            }

            return output;
        }
    }

    return output;
}

module.exports.getResponse = getResponse;