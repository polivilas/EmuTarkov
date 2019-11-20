"use strict";

require('./libs.js');

let dynamicRPC = {};
let staticRPC = {};

function addDynamicResponse(url, func) {
    dynamicRPC[url] = func;
}

function addStaticResponse(url, func) {
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

    // handle dynamic requests
    for (var key in dynamicRPC) {
        if (url.includes(key)) {
            return dynamicRPC[key](url, info);
        }
    }

    // handle static requests
    for (var key in staticRPC) {      
        if (url === key) {
            output = staticRPC[key](url, info);
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

module.exports.addDynamicResponse = addDynamicResponse;
module.exports.addStaticResponse = addStaticResponse;
module.exports.getResponse = getResponse;