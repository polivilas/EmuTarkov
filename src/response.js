"use strict";
require('./libs.js');

const staticRoutes = {
    "/": showIndex,
    "/inv": showInventoryChecker,
    "/client/friend/list": getFriendList,
    "/client/game/profile/items/moving": handleItems,
    "/client/languages": getLocale,
    "/client/game/login": loginUser,
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
    "/client/game/config": loginUser,
    "/client/customization": getCustomization,
    "/client/trading/customization/5ac3b934156ae10c4430e83c/offers": getCustomizationOffers,
    "/client/trading/customization/579dc571d53a0658a154fbec/offers": getCustomizationOffers,
    "/client/trading/customization/storage": getCustomizationStorage,
    "/client/hideout/production/recipes": getHideoutRecipes,
    "/client/hideout/settings": getHideoutSettings,
    "/client/hideout/areas": getHideoutAreas,
    "/client/hideout/production/scavcase/recipes": getScavcaseRecipes,
    "/client/handbook/builds/my/list": getHandbookUserlist,
    "/client/notifier/channel/create": createNotifierChannel,
    "/client/game/profile/nickname/reserved": getReservedNickname,
    "/client/game/profile/nickname/validate": validateNickname,
    "/client/game/profile/create": createProfile,
    "/OfflineRaidSave": offlineRaidSave,
    "/favicon.ico": nullResponse,
    "/client/game/logout": nullResponse,
    "/client/putMetrics": nullResponse,
    "/client/match/group/looking/stop": nullResponse,
    "/client/match/group/exit_from_menu": nullResponse,
    "/client/match/exit": nullResponse,
    "/client/match/updatePing": nullResponse,
    "/client/game/profile/savage/regenerate": nullResponse,
    "/client/mail/dialog/list": nullArrayResponse,
    "/client/friend/request/list/outbox": nullArrayResponse,
    "/client/friend/request/list/inbox": nullArrayResponse
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
    "/server/profile/get/": getProfileById,
    "/notifierBase": nullArrayResponse,
    "/notifierServer": nullArrayResponse,
    "/push/notifier/get/": nullArrayResponse
};

function nullResponse(url, info) {
    return '{"err":0, "errmsg":null, "data":null}';
}

function nullArrayResponse(url, info) {
    return '{"err":0, "errmsg":null, "data":[]}';
}

function showIndex(url, info) {
    return index_f.index();
}

function showInventoryChecker(url, info) {
    let output = "";
    let inv = itm_hf.recheckInventoryFreeSpace(profile.getCharacterData());
    
    output += "<style>td{border:1px solid #aaa;}</style>Inventory Stash Usage:<br><table><tr><td>-</td><td>0</td><td>1</td><td>2</td><td>3</td><td>4</td><td>5</td><td>6</td><td>7</td><td>8</td><td>9<br>";
    
    for (let y = 0; y < inv.length; y++) {
        output += '<tr><td>' + y + "</td>";
        
        for (let x = 0; x < inv[0].length; x++) {
            output += '<td ' + ((inv[y][x] === 1)?'style="background:#aaa"':'') + '>' + inv[y][x] + "</td>";
        }
        
        output += "</tr>";
    }
    
    output += "</table>";
    return output;
}

function getFriendList(url, info) {
    return '{"err":0, "errmsg":null, "data":{"Friends":[], "Ignore":[], "InIgnoreList":[]}}';
}

function handleItems(url, info) {
    let output = item.moving(info);
    return output;
}

function getLocale(url, info) {
    return locale.getLanguages();
}

function loginUser(url, info) {
    return profile.find();
}

function getQueueStatus(url, info) {
    return '{"err":0, "errmsg":null, "data":{"status": 0, "position": 0}}';
}

function getItems(url, info) {
    return JSON.stringify(items_f.prepareItems());
}

function getGlobals(url, info) {
    return json.read(filepaths.globals);
}

function getProfileData(url, info) {
    return JSON.stringify(profile.getCharacterData());
}

function selectProfile(url, info) {
    return '{"err":0, "errmsg":null, "data":{"status":"ok", "notifier":{"server":"https://' + ip + '", "channel_id":"f194bcedc0890f22db37a00dbd7414d2afba981eef61008159a74a29d5fee1cf"}}}';
}

function getProfileStatus(url, info) {
    return '{"err":0, "errmsg":null, "data":[{"profileid":"user' + constants.getActiveID() + 'scav", "status":"Free", "sid":"", "ip":"", "port":0}, {"profileid":"user' + constants.getActiveID() + 'pmc", "status":"Free", "sid":"", "ip":"", "port":0}]}';
}

function getWeather(url, info) {
    return weather_f.main();
}

function getLocations(url, info) {
    return JSON.stringify(locations, null, "\t").replace(/[\r\n\t]/g, '').replace(/\s\s+/g, '').replace(/[\\]/g, "");
}

function getTemplates(url, info) {
    return json.read(filepaths.user.cache.templates);
}

function getQuests(url, info) {
    return JSON.stringify(quests, null, "\t").replace(/[\r\n\t]/g, '').replace(/\s\s+/g, '').replace(/[\\]/g, "");
}

function getMetrics(url, info) {
    return json.read(`{"err":0,"errmsg":null,"data":{"Keys":[0,8,10,13,16,20,26,30,33,45,53,66,100,500,750,1000],"NetProcessingBins":[0,1,2,3,4,5,6,7,8,10,13,16,20,26,30,33,45,53,66,100,500,750,1000],"RenderBins":[0,4,8,10,13,16,20,26,30,33,45,53,66,100,500,750,1000],"GameUpdateBins":[0,4,8,10,13,16,20,26,30,33,45,53,66,100,500,750,1000],"MemoryMeasureInterval":180}}`);
}

function getBots(url, info) {
    return JSON.stringify(bots.generate(info));
}

function getTraderList(url, info) {
    return JSON.stringify(trader.loadAllTraders());
}

function getServer(url, info) {
    return '{"err":0, "errmsg":null, "data":[{"ip":"' + ip + '", "port":"' + port + '"}]}';
}

function searchRagfair(url, info) {
    return ragfair.getOffers(info);
}

function getAvailableMatch(url, info) {
    return '{"err":404, "errmsg":"EmuTarkov-0.8.0 does not supports online raids. Please use offline match.\n", "data":false}';
    
    // use this for online lan testing
    //return '{"err":0, "errmsg":null, "data":true}';
}

function joinMatch(url, info) {
    let shortid = "";
    let profileId = "";

    // check if the player is a scav
    if (info.savage === true) {
        shortid = "3XR5";
        profileId = "user" + constants.getActiveID() + "scav";
    } else {
        shortid = "3SRC";
        profileId = "user" + constants.getActiveID() + "pmc";
    }

    return JSON.stringify({"err": 0, "errmsg": null, "data": [{"profileid": profileId, "status": "busy", "ip": "", "port": 0, "location": info.location, "sid": "", "gamemode": "deathmatch", "shortid": shortid}]});
}

function getChatServerList(url, info) {
    return '{"err":0, "errmsg":null, "data":[{"_id":"5ae20a0dcb1c13123084756f", "RegistrationId":20, "DateTime":' + Math.floor(new Date() / 1000) + ', "IsDeveloper":true, "Regions":["EUR"], "VersionId":"bgkidft87ddd", "Ip":"", "Port":0, "Chats":[{"_id":"0", "Members":0}]}]}';
}

function changeNickname(url, info) {
    return profile.changeNickname(info);
}

function changeVoice(url, info) {
    profile.changeVoice(info);
    return '{"err":0, "errmsg":null, "data":null}';
}

function getGroupStatus(url, info) {
    return '{ "err": 0, "errmsg": null, "data": { "players": [], "invite": [], "group": [] } }';
}

function handleRepair(url, info) {
    return repair_f.main(info);
}

function handleKeepAlive(url, info) {
    keepAlive_f.main();
    return '{"err":0,"errmsg":null,"data":{"msg":"OK"}}';
}

function validateGameVersion(url, info) {
    constants.setVersion(info.version.major);
    return '{"err":0,"errmsg":null,"data":null}';
}

function getCustomization(info) {
    return json.read(filepaths.user.cache.customization_outfits);
}

function getCustomizationOffers(url, info) {  
    let tempoffers = [];
    let allOffers = json.parse(json.read(filepaths.user.cache.customization_offers));
    let splittedUrl = url.split('/');

    for (let oneOffer of allOffers.data) {
        if (oneOffer.tid == splittedUrl[splittedUrl.length - 2]) {
            tempoffers.push(oneOffer);
        }
    }

    allOffers.data = tempoffers;
    return JSON.stringify(allOffers);
}

function getCustomizationStorage(url, info) {
    return json.read(customization_f.getCustomizationStoragePath());
}

function getHideoutRecipes(url, info) {
    return json.read(filepaths.user.cache.hideout_production);
}

function getHideoutSettings(url, info) {
    return json.read(filepaths.hideout.settings);
}

function getHideoutAreas(url, info) {
    return json.read(filepaths.user.cache.hideout_areas);
}

function getScavcaseRecipes(url, info) {
    return json.read(filepaths.user.cache.hideout_scavcase);
}

function getHandbookUserlist(url, info) {
    return json.read(weaponBuilds_f.getUserBuildsPath());
}

function createNotifierChannel(url, info) {
    if (constants.gameVersion() == "0.11.7.4711") {
        return '{"err":0,"errmsg":null,"data":{"notifier":{"server":"http://' + ip + '","channel_id":"testChannel","url":"http://' + ip + '/notifierBase"},"notifierServer":"http://' + ip + '/notifierServer"}}';
    }

    // assume client is 0.12.x.xxxx
    return '{"err":0,"errmsg":null,"data":{"notifier":{"server":"https://' + ip + '","channel_id":"testChannel","url":"https://' + ip + '/notifierBase"},"notifierServer":"https://' + ip + '/notifierServer"}}';
}

function getReservedNickname(url, info) {
    return '{"err":0,"errmsg":null,"data":"' + profile.getReservedNickname() + '"}';
}

function validateNickname(url, info) {
    // todo: validate nickname properly
    return '{"err":0,"errmsg":null,"data":{"status":"ok"}}';
}

function createProfile(url, info) {
    profile.create(info);
    return '{"err":0,"errmsg":null,"data":{"uid":"user' + constants.getActiveID() + 'pmc"}}';
}

function offlineRaidSave(url, info) {
    if (!settings.server.lootSaving) {
        return "DONE";
    }

    constants.setActiveID(info.profile.aid.replace("user", ""));
    profile.saveProfileProgress(info);
    return "DONE";
}

function getMapLocation(url, info) {
    return "MAPCONFIG";
}

function getImage(url, info) {
    return "IMAGE";
}

function handleNotifierCustomLink(url, info) {
    return 'DONE';
}

function getProfilePurchases(url, info) {
    return profile.getPurchasesData();
}

function getTrader(url, info) {
    return JSON.stringify(trader.get(url.replace("/client/trading/api/getTrader/", '')));
}

function getAssort(url, info) {
    return JSON.stringify(trader.getAssort(url.replace("/client/trading/api/getTraderAssort/", '')));
}

function getMenuLocale(url, info) {
    return locale.getMenu(url.replace("/client/menu/locale/", ''));
}

function getGlobalLocale(url, info) {
    return locale.getGlobal(url.replace("/client/locale/", ''));
}

function getProfileById(url, body) {
    return "GETPROFILEBYID";
}

function getResponse(req, body) {
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
        return staticRoutes[url](url, info);
    }
	
    // handle dynamic requests
    for (let key in dynamicRoutes) {
        if (url.indexOf(key) != -1) {
            return dynamicRoutes[key](url, info);
        }
    }

    // request couldn't be handled
    if (output === "") {
        console.log("[UNHANDLED][" + url + "] request data: " + JSON.stringify(info), "white", "red");
        output = '{"err":404, "errmsg":"UNHANDLED RESPONSE: '+ url + '", "data":null}';
		return output;
    }

    // load from cache when server is in release mode
    if (typeof info.crc != "undefined") {
        let crctest = JSON.parse(output);

        if (typeof crctest.crc != "undefined") {
            if (info.crc.toString() === crctest.crc.toString() && settings.debug.debugMode != true) {
                console.log("[Loading From Cache Files]", "", "", true);
                output = '{"err":0, "errmsg":null, "data":null}';
            } else {
                output = JSON.stringify(crctest).replace(/\s\s+/g, '');
            }
            
			return output;
        }
    }

    return output;
}

module.exports.getResponse = getResponse;