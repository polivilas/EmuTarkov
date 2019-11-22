"use strict";

require('./libs.js');

let dynamicResp = {};
let staticResp = {};

function addDynamicResponse(url, func) {
    dynamicResp[url] = func;
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

    // handle static requests
    // NoHurry: fair enough, this _seems_ to work tho, would reduce overhad alot if it really does  ;)
	if (staticResp[url] !== undefined) {
        return staticResp[url](url, info);
    }
	
    // handle dynamic requests
    for (let key in dynamicResp) {
        if (url.indexOf(key) != -1) {
            return dynamicResp[key](url, info);
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

module.exports.addDynamicResponse = addDynamicResponse;
module.exports.addStaticResponse = addStaticResponse;
module.exports.getResponse = getResponse;
