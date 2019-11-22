"use strict";
require('../libs.js');

function getCookies(req) {
    let found = {};
    let cookies = req.headers.cookie;

    if (cookies) {
        for (let cookie of cookies.split(';')) {
            let parts = cookie.split('=');

            found[parts.shift().trim()] = decodeURI(parts.join('='));
        }
    }

    return found;
}

function sendResponse(req, resp, body) {
	if (req.url === "/OfflineRaidSave") {
		return;
	}
	
	let output = "";

	constants.setActiveID(getCookies(req)['PHPSESSID']);

	// get response
	if (req.method === "POST") {
		output = rpc.getResponse(req, body);
	} else {
		output = rpc.getResponse(req, "{}");
	}
	
	// prepare message to send
	if (output === "DONE") {
		return;
	}
	
	if (output === "MAPCONFIG") {
		let mapname = req.url.replace("/api/location/", "");		
		let RandomPreset = utility.getRandomInt(1,6);
		let data_response = utility.readJson("data/configs/api/location/" + mapname + "" + RandomPreset + ".json");
		
		console.log("[MAP.config]: " + mapname);
		header_f.sendTextJson(resp, data_response);
		return;
	}

	if (output === "IMAGE") {
		if (req.url.includes("/files/quest")) {
			console.log("[IMG.quests]:" + req.url);
			req.url = req.url.replace("/files", "/data/images");
		} else if (req.url.includes("/files/handbook")) {
			console.log("[IMG.handbook]:" + req.url);
			req.url = req.url.replace("/files", "/data/images");
		} else if (req.url.includes("/files/trader/avatar")) {
			console.log("[IMG.trader]:" + req.url);
			req.url = "/data/images" + req.url;
		} else if (req.url.includes("/files/CONTENT/banners/")) {
			console.log("[IMG.banners]:" + req.url);
			req.url = req.url.replace('/files/CONTENT/banners/', './data/images/banners/').replace('banner_', '');
		} else {
			console.log("[IMG.regular]:" + req.url);
		}

		header_f.sendFile(resp, "." + req.url);
		return;
	}

	if (req.url === "/" || req.url === "/inv") {
		header_f.sendHTML(resp, output);
	} else {
		header_f.sendZlibJson(resp, output);
	}

	constants.setActiveID(0);
}

function handleRequest(req, resp) {
	// separate request in the log
	if (settings.debug.showSeparator === true) {
		logger.separator();
	}
	
	let ActiveProfile = "";

	if (req.method == "POST") {
		if (req.url != "/OfflineRaidSave") {
			constants.setActiveID(getCookies(req)['PHPSESSID']);
			ActiveProfile = "[ActiveProfile:" + constants.getActiveID() + "]";
		}

		// received data
		let IP = req.connection.remoteAddress.replace("::ffff:","");
		let URL = "[Req:" + req.url + "]";

        req.on('data', function (data) {
            // prevent flood attack
            if (data.length > 1000000 && req.url != "/OfflineRaidSave") {
				request.connection.destroy();
			}

			if (req.url == "/OfflineRaidSave") {
				// save loot if lootSaving is enabled - created on community requests
				if (settings.server.lootSaving == true) {
					let PreparedStringData = data.toString().replace(/(\\r\\n)+/g, "").replace(/(\\)+/g, "");
					let parseBody = JSON.parse(PreparedStringData);

					//get aid from requested profile and set it to active profile
					constants.setActiveID(parseBody.aid);

					let profile_data = utility.readJson(parseBody.game + "\\SavedProfile.json");

					// get the IP address of the client
					console.log(IP + URL + "[SAVE_PROFILE][ProfileID:" + parseBody.aid + "]" + ActiveProfile, "cyan");

					if (settings.debug.debugMode == true) {
						console.log(parseBody);
					}

					profile.saveProfileProgress(parseBody);
				}

				return;
			} else {
				// extract data
				zlib.inflate(data, function(err, body) {
					// SHOW BODY ONLY ON POST REQUESTS AND IF NOT SAVE PROGRESS
					body = ((body !== null && body != "" && body != "{}")?body.toString():"{}");

					// get the IP address of the client
					let IP = "[" + req.connection.remoteAddress.replace("::ffff:","") + "]";
					let URL = "[Req:" + req.url + "]";
					console.log(IP + URL + ActiveProfile + "~", "cyan");

					if (settings.debug.debugMode == true) {
						console.log(body);
					}

					sendResponse(req, resp, body);
				});
			}
		});
	} else {
		let IP = "[" + req.connection.remoteAddress.replace("::ffff:","") + "]";
		let URL = "[GET:" + req.url + "]";

		console.log(IP + URL, "cyan");
		sendResponse(req, resp, null);
	}
}

function start() {
	const options = {
		key: fs.readFileSync("data/bin/server.key");
		cert: fs.readFileSync("data/bin/server.cert");
	};

	port = settings.server.port;
	ip = settings.server.ip;
	
	if (settings.server.generateIp == true) {
        ip = utility.getLocalIpAddress();
		settings.server.ip = ip; 
	}
	
	// set the ip and backendurl 
	settings.server.backendUrl = "https://" + ip;
	backendUrl = settings.server.backendUrl;
	utility.writeJson("server.config.json", settings);

	// show our watermark
	console.log("  └─ JustEmuTarkov " + constants.serverVersion() + " ─┘", "cyan", "");
	console.log("■ https://justemutarkov.github.io/", "cyan", "");

	if (settings.debug.showSeparator === true) {
		logger.separator();
	}

	let serverHTTPS = https.createServer(options, (req, res) => {
		response.setupRPC();
		handleRequest(req, res);
	}).listen(port, function() {
		console.log("» Server: " + backendUrl, "green", "", true);
	});
	
	// ERROR ON CREATION - HTTPS
	serverHTTPS.on('error', function (e) {
		console.log(e);
		console.log("» Port " + port + " is already in use. Check if console isnt already open or change port", "red", "");
    });
}

module.exports.start = start;
