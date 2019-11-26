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
		let data_response = utility.readJson("database/configs/api/location/" + mapname + "" + RandomPreset + ".json");
		
		console.log("[MAP.config]: " + mapname);
		header_f.sendTextJson(resp, data_response);
		return;
	}

	if (output === "IMAGE") {
		let url_array = req.url.split("/");
		let additionalPath = "";
		if (req.url.indexOf("/quest") != -1) {
			console.log("[IMG.quests]:" + req.url);
			additionalPath = "/quest";
		} else if (req.url.indexOf("/handbook") != -1) {
			console.log("[IMG.handbook]:" + req.url);
			additionalPath = "/handbook";
		} else if (req.url.indexOf("/avatar") != -1) {
			console.log("[IMG.trader]:" + req.url);
			additionalPath = "/trader";
		} else if (req.url.indexOf("/banners") != -1) {
			console.log("[IMG.banners]:" + req.url);
			additionalPath = "/banners";
		} else {
			console.log("[IMG.regular]:" + req.url);
			additionalPath = "/other";
		}
		req.url = "/database/images" + additionalPath + "/" + url_array[url_array.length-1];

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
					console.log("[SAVE_PROFILE][ProfileID:" + parseBody.aid + "]" + ActiveProfile, "cyan");

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
					//let IP = "[" + req.connection.remoteAddress.replace("::ffff:","") + "]";
					let URL = "" + req.url + "";//"[Req:" + req.url + "]";
					let displayBody = ((settings.debug.debugMode === true)?body:"");
					console.log(URL + " -> " + displayBody, "cyan");

					sendResponse(req, resp, body);
				});
			}
		});
	} else {
		//let IP = "[" + req.connection.remoteAddress.replace("::ffff:","") + "]";

		console.log(req.url, "cyan");
		sendResponse(req, resp, null);
	}
}

function start() {
	const options = {
		key: fs.readFileSync("binaries/server.key"),
		cert: fs.readFileSync("binaries/server.cert")
	};

	// set the ip and backendurl 
	port = settings.server.port;
	ip = settings.server.ip;
	
	if (settings.server.generateIp == true) {
        ip = utility.getLocalIpAddress();
		settings.server.ip = ip; 
	}
	
	settings.server.backendUrl = "https://" + ip;
	backendUrl = settings.server.backendUrl;
	utility.writeJson("appdata/server.config.json", settings);

	// show our watermark
	let text_1 = "JustEmuTarkov " + constants.serverVersion();
	let text_2 = "Website: https://justemutarkov.github.io/";
	let diffrence = Math.abs(text_1.length - text_2.length);
	let whichIsLonger = ((text_1.length >= text_2.length)?text_1.length:text_2.length);
	let box_spacing_between_1 = "";
	let box_spacing_between_2 = "";
	let box_width = "";

	if (text_1.length >= text_2.length) {
		for (let i = 0; i < diffrence; i++) {
			box_spacing_between_2 += " ";
		}
	} else {
		for (let i = 0; i < diffrence; i++) {
			box_spacing_between_1 += " ";
		}
	}
	
	for (let i = 0; i < whichIsLonger; i++) {
		box_width += "═";
	}
	
	console.log("╔═" + box_width + "═╗", "cyan", "");
	console.log("║ " + text_1 + box_spacing_between_1 + " ║", "cyan", "");
	console.log("║ " + text_2 + box_spacing_between_2 + " ║", "cyan", "");
	console.log("╚═" + box_width + "═╝", "cyan", "");

	if (settings.debug.showSeparator === true) {
		logger.separator();
	}

	// create server
	let serverHTTPS = https.createServer(options, (req, res) => {
		// setup server
		response.setupRoutes();
		bots.setupRoutes();
		item.setupRoutes();

		// handle requests
		handleRequest(req, res);
	}).listen(port, ip, function() {
		console.log("» Server url: " + backendUrl, "green", "", true);
	});
	
	// ERROR ON CREATION - HTTPS
	serverHTTPS.on('error', function (e) {
		console.log(e);
		console.log("» Port " + port + " is already in use. Check if console isnt already open or change port", "red", "");
    });
}

module.exports.start = start;