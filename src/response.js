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
    "/client/hideout/production/scavcase/recipes": getScavcaseRecipes,
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
    "/client/game/profile/savage/regenerate": nullResponse,
    "/client/mail/dialog/list": getMailDialogList,
    "/client/mail/dialog/view": getMailDialogView,
    "/client/mail/dialog/info": getMailDialogInfo,
    "/client/friend/request/list/outbox": nullArrayResponse,
    "/client/friend/request/list/inbox": nullArrayResponse,

    // EmuLib
    "/OfflineRaidSave": offlineRaidSave,
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
            output += '<td ' + ((inv[y][x] === 1) ? 'style="background:#aaa"' : '') + '>' + inv[y][x] + "</td>";
        }

        output += "</tr>";
    }

    output += "</table>";
    return output;
}

function getGameConfig() {
    let backendUrl = "https://" + ip;
    return '{"err":0,"errmsg":null,"data":{"queued": false, "banTime": 0, "hash": "BAN0", "lang": "en", "aid":' + constants.getActiveID() + ', "token": "token_' + constants.getActiveID() + '", "taxonomy": "341", "activeProfileId": "user' + constants.getActiveID() + 'pmc", "nickname": "user", "backend": {"Trading":"' + backendUrl + '", "Messaging":"' + backendUrl + '", "Main":"' + backendUrl + '", "RagFair":"' + backendUrl + '"}, "totalInGame": 0}}';
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
    return profile.find(info);
}

function getInsuranceCost(url, info) {
    return insure_f.cost(info);
}

function getQueueStatus(url, info) {
    return '{"err":0, "errmsg":null, "data":{"status": 0, "position": 0}}';
}

function getItems(url, info) {
    return JSON.stringify(json.parse(json.read(filepaths.user.cache.items)));
}

function getGlobals(url, info) {
    return json.read(filepaths.globals);
}

function getProfileData(url, info) {
    const responseData = profile.getCharacterData();

    // If we have experience gained after the raid, we save it
    if (responseData.data.length > 0 && responseData.data[0].Stats.TotalSessionExperience > 0) {
        const sessionExp = responseData.data[0].Stats.TotalSessionExperience;
        responseData.data[0].Info.Experience += sessionExp;
        responseData.data[0].Stats.TotalSessionExperience = 0;

        profile.setCharacterData(responseData);

        responseData.data[0].Info.Experience -= sessionExp;
    }

    return JSON.stringify(responseData);
}

function selectProfile(url, info) {
    return '{"err":0, "errmsg":null, "data":{"status":"ok", "notifier":{"server":"https://' + ip + '", "channel_id":"f194bcedc0890f22db37a00dbd7414d2afba981eef61008159a74a29d5fee1cf"}}}';
}

function getProfileStatus(url, info) {
    return '{"err":0, "errmsg":null, "data":[{"profileid":"user' + constants.getActiveID() + 'scav", "status":"Free", "sid":"", "ip":"", "port":0}, {"profileid":"user' + constants.getActiveID() + 'pmc", "status":"Free", "sid":"", "ip":"", "port":0}]}';
}

function getWeather(url, info) {
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
    return '{"err":0, "errmsg":null, "data":[{"ip":"' + ip + '", "port":"' + https_port + '"}]}';
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

function getChatServerList(url, info) {
    return '{"err":0, "errmsg":null, "data":[{"_id":"5ae20a0dcb1c13123084756f", "RegistrationId":20, "DateTime":' + Math.floor(new Date() / 1000) + ', "IsDeveloper":true, "Regions":["EUR"], "VersionId":"bgkidft87ddd", "Ip":"", "Port":0, "Chats":[{"_id":"0", "Members":0}]}]}';
}

function changeNickname(url, info) {
    return profile.changeNickname(info);
}

function changeVoice(url, info) {
    profile.changeVoice(info);
    return nullResponse(url, info);
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
    if (settings.gameplay.features.lootSavingEnabled === false) {
        return "DONE";
    }

    constants.setActiveID(info.profile.aid);
    profile.saveProfileProgress(info);
    return "DONE";
}

// this shows a list of conversations available
// request: {"limit":30,"offset":0}
// response: {"err":0,"errmsg":null,"data":[{"type":1,"message":{"dt":1576780987,"type":1,"text":"Oh you're Dreamz init","uid":"5b09e7ac8ed239663f049ac3"},"new":0,"attachmentsNew":0,"_id":"5bd9aae93546826f3c560d6b","Users":[{"_id":"5bd9aae93546826f3c560d6b","Info":{"Nickname":"StraightOnSight","Side":"Usec","Level":1,"MemberCategory":"Default"}}],"pinned":false},{"type":1,"message":{"dt":1576778783,"type":1,"text":"suck my ass","uid":"5a3a9f3f46b16870c921cfa0"},"new":0,"attachmentsNew":0,"_id":"5a3a9f3f46b16870c921cfa0","Users":[{"_id":"5a3a9f3f46b16870c921cfa0","Info":{"Nickname":"ZackFair","Side":"Bear","Level":9,"MemberCategory":"Default"}}],"pinned":false},{"type":1,"message":{"dt":1536917869,"type":1,"text":"trying*","uid":"5b09e7ac8ed239663f049ac3"},"new":0,"attachmentsNew":0,"pinned":false,"_id":"5b7a8952f0dd353a3d5bed8f","Users":[{"_id":"5b7a8952f0dd353a3d5bed8f","Info":{"Nickname":"laplaie974","Side":"Bear","Level":1,"MemberCategory":"Default"}}]}]}
// limit: amount of messages to display
// offset: no idea
function getMailDialogList(url, info) {
    // these are used to show user conversations
    // a message looks like this: {"type":1,"message":{"dt":<datetime>,"type":1,"text":<message text>,"uid":<user id, like user0pmc>},"new":0,"attachmentsNew":0,"_id":"5bd9aae93546826f3c560d6b","Users":[{"_id":"5bd9aae93546826f3c560d6b","Info":{"Nickname":"StraightOnSight","Side":"Usec","Level":1,"MemberCategory":"Default"}}],"pinned":false},

    return nullArrayResponse(url, info);
}

// this displays the full conversation
// request: {"type":1,"dialogId":"5bd9aae93546826f3c560d6b","limit":30,"time":0.0}
// response: {"err":0,"errmsg":null,"data":{"messages":[{"_id":"5dfbc4bb838e89696277a1ce","uid":"5b09e7ac8ed239663f049ac3","type":1,"dt":1576780987.6456,"text":"Oh you're Dreamz init","hasRewards":false},{"_id":"5dfbc49db496aa7ac411583a","uid":"5b09e7ac8ed239663f049ac3","type":1,"dt":1576780957.4885,"text":"And why are you saying fuck off lmfao","hasRewards":false},{"_id":"5dfbc4978ad8fa614d69ce73","uid":"5b09e7ac8ed239663f049ac3","type":1,"dt":1576780951.7064,"text":"Who even are you","hasRewards":false},{"_id":"5bdae6696588815f0c799eb8","uid":"5bd9aae93546826f3c560d6b","type":1,"dt":1541072489.5961,"text":"Fuck off","hasRewards":false}],"profiles":[{"_id":"5b09e7ac8ed239663f049ac3","Info":{"Nickname":"InAHurryToCode","Side":"Usec","Level":1,"MemberCategory":"Default"}},{"_id":"5bd9aae93546826f3c560d6b","Info":{"Nickname":"StraightOnSight","Side":"Usec","Level":1,"MemberCategory":"Default"}}],"hasMessagesWithRewards":false}}
// dialogId: unique ID of the message list
// limit: amount of messages visible
// offset: no idea
function getMailDialogView(url, info) {
    // an overview of the object is like this: {"messages"[list of messages], "profiles":[list of profiles], "hasMessagesWithRewards":<does it contain message with items?>}
    // a message looks like this: {"_id":<string, unique>, "uid": <user id that sent message, like ussr0pmc>, "dt": <datetime with milliseconds>, "text": <the message to display>. "hasRewards": <item attached to message?>}
    // a profile looks like this: {"_id":<user id, like user0pmc>,"Info":{"Nickname":<nickname of profile>,"Side":<side of profile>,"Level":<profile level>,"MemberCategory":"Default"}}

    return nullResponse(url, info);
}

// these are trader conversations
// request: {"dialogId":"54cb57776803fa99248b456e"}
// response: {"err":0,"errmsg":null,"data":{"type":2,"message":{"dt":1577648943,"type":10,"text":"quest started","uid":"54cb57776803fa99248b456e","templateId":"5abe61a786f7746ad512da4e"},"new":1,"_id":"54cb57776803fa99248b456e","pinned":false}}
// dialogId: user id, like user0pmc
function getMailDialogInfo(url, info) {
    // an overview of the object is this:

    return '{"err":0,"errmsg":null,"data":{"type":2,"message":{"dt":1577648943,"type":10,"text":"quest started","uid":"user' + constants.getActiveID() + 'pmc","templateId":"5abe61a786f7746ad512da4e"},"new":1,"_id":"user' + constants.getActiveID() + 'pmc","pinned":false}}';
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
                output = nullResponse(url, info);
            } else {
                output = json.stringify(crctest).replace(/\s\s+/g, '');
            }

            return output;
        }
    }

    return output;
}

module.exports.getResponse = getResponse;