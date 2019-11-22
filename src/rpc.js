"use strict";

require('./libs.js');

let dynamicResp = {};
let staticResp = {};

function addDynamicResponse(url, func) {
    staticResp[url] = func;
}

function addStaticResponse(url, func) {
    staticResp[url] = func;
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

    // handle dynamic requests
    for (var key in dynamicResp) {
        if (url.indexOf(key) != -1) {
            return dynamicResp[key](url, info);
        }
    }

    // handle static requests
    if (staticResp.indexOf(url) != -1) {
        output = staticResp[key](url, info);
        break;
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

module.exports.addDynamicResponse = addDynamicResponse;
module.exports.addStaticResponse = addStaticResponse;
module.exports.getResponse = getResponse;
