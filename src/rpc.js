"use strict";
require('./libs.js');

let staticRPC = {};

function addResponse(url, func) {
    staticRPC[url] = func;
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

    // map location
    if (url.includes("/api/location")) {
        return "MAPCONFIG";
    }

    // raid banners
    if (url.includes("files/CONTENT/banners")) {
        return "CONTENT";
    }

    // game images
    if (url.includes(".jpg") || url.includes(".png") || url.includes("/data/images/") || url.includes("/files/quest") || url.includes("/files/handbook") || url.includes("/files/trader/avatar")) {
        return "IMAGE";
    }
    
    // notifier base
    if (url.includes("/notifierBase") || url.includes("/notifierServer")) { // notifier custom link
        return '{"err":0, "errmsg":null, "data":[]}';
    }
    
    // notifier custom link
    if (url.includes("/?last_id")) {
        return 'NULLGET';
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

    // handle static RPC here
    for (var key in staticRPC) {      
        if (url === key) {
            output = staticRPC[url](info, body);
            break;
        }
    }

    // request couldn't be handled
    if (output === "") {
        console.log("[UNHANDLED][" + url + "] request data: " + JSON.stringify(info), "white", "red");
        output = '{"err":404, "errmsg":"UNHANDLED RESPONSE: '+ url + '", "data":null}';
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
        }
    }

    return output;
}

module.exports.addResponse = addResponse;
module.exports.getResponse = getResponse;