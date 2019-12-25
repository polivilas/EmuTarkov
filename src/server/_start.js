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
	let output = "";

	// get response
	if (req.method === "POST") {
		output = response.getResponse(req, body);
	} else {
		output = response.getResponse(req, "{}");
	}
	
	// prepare message to send
	if (output === "DONE") {
		return;
	}

	if (output === "IMAGE") {
		let splittedUrl = req.url.split('/');
		let filepath = "";
		let file = splittedUrl[splittedUrl.length - 1];
		let baseNode = undefined;

		file = file.replace(".jpg", "").replace(".png", "");

		// get images to look through
		if (req.url.indexOf("/quest") != -1) {
			console.log("[IMG.quests]:" + req.url);
			baseNode = filepaths.images.quest;
		} else if (req.url.indexOf("/handbook") != -1) {
			console.log("[IMG.handbook]:" + req.url);
			baseNode = filepaths.images.handbook;
		} else if (req.url.indexOf("/avatar") != -1) {
			console.log("[IMG.trader]:" + req.url);
			baseNode = filepaths.images.trader;
		} else if (req.url.indexOf("/banners") != -1) {
			console.log("[IMG.banners]:" + req.url);
			baseNode = filepaths.images.banners;
		} else {
			console.log("[IMG.hideout]:" + req.url);
			baseNode = filepaths.images.hideout;
		}

		// get image
		let keys = Object.keys(baseNode);

		for (let i = 0; i < keys.length; i++) {
			let key = keys[i];

			if (key == file) {
				filepath = baseNode[key];
				break;
			}
		}

		if (filepath === "") {
			// throw an error here
		}

		// send image
		header_f.sendFile(resp, filepath);
		return;
	}

	if (output === "MAPCONFIG") {
		let mapname = req.url.replace("/api/location/", "");		
		let RandomPreset = utility.getRandomInt(1, 6);
		let map = json.read(filepaths.maps[mapname.toLowerCase() + RandomPreset]);
		
		console.log("[MAP.config]: " + mapname);
		header_f.sendTextJson(resp, map);
		return;
	}

	if (output === "GETPROFILEBYID") {
		let profileIdRequested = req.url.replace("/server/profile/get/", '');
   		let profileData = profile.getProfileByID(profileIdRequested);

   		console.log("Profile Requested By the game : " + profileIdRequested);
   		header_f.sendTextJson(resp, profileData);
   		return;
	}

	if (req.url === "/" || req.url === "/inv") {
		header_f.sendHTML(resp, output);
	} else {
		header_f.sendZlibJson(resp, output);
	}
}

function handleRequest(req, resp) {
	let IP = req.connection.remoteAddress.replace("::ffff:","");

	constants.setActiveID(getCookies(req)['PHPSESSID']);
	
	if (req.method == "POST") {
		// received data
        req.on('data', function (data) {
            // prevent flood attack
            if (data.length > 1000000 && req.url != "/OfflineRaidSave") {
				request.connection.destroy();
			}

			// extract data
			zlib.inflate(data, function(err, body) {
				let jsonData = ((body !== null && body != "" && body != "{}") ? body.toString() : "{}");

				// get the IP address of the client
				let displayBody = ((settings.debug.debugMode === true) ? jsonData : "");
				console.log("[" + constants.getActiveID() + "][" + IP + "] " + req.url + " -> " + displayBody, "cyan");

				sendResponse(req, resp, jsonData);
			});
		});
	} else {
		console.log("[" + constants.getActiveID() + "][" + IP + "] " + req.url, "cyan");
		sendResponse(req, resp, null);
	}
}

function start() {
	const options = {
		cert: fs.readFileSync(filepaths.cert.server.cert),
		key: fs.readFileSync(filepaths.cert.server.key)
	};

	// set the ip	
	if (settings.server.generateIp == true) {
        ip = utility.getLocalIpAddress();
		settings.server.ip = ip; 
	}

	json.write(filepaths.user.config, settings);

	// show our watermark
	let text_1 = "JustEmuTarkov " + constants.serverVersion();
	let text_2 = "https://justemutarkov.github.io/";
	let diffrence = Math.abs(text_1.length - text_2.length);
	let whichIsLonger = ((text_1.length >= text_2.length) ? text_1.length:text_2.length);
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

	// create HTTPS server (port 443)
	let serverHTTPS = https.createServer(options, (req, res) => {
		handleRequest(req, res);
	}).listen(port, ip, function() {
		console.log("» server url: " + "https://" + ip + "/", "green", "", true);
	});
	
	// server already running
	serverHTTPS.on('error', function (e) {
		console.log(e);
		console.log("» Port " + port + " is already in use. Check if console isnt already open or change port", "red", "");
	});
}

module.exports.start = start;