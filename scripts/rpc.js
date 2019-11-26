"use strict";

require('./libs.js');

let dynamicRoutes = {};
let staticRoutes = {};

function addDynamicRoute(url, func) {
    dynamicRoutes[url] = func;
}

function addStaticRoute(url, func) {
    staticRoutes[url] = func;
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

module.exports.addDynamicRoute = addDynamicRoute;
module.exports.addStaticRoute = addStaticRoute;
module.exports.getResponse = getResponse;
