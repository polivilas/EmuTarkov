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
	// reset item output

	constants.setActiveID(getCookies(req)['PHPSESSID']);
	// get response
	if (req.method === "POST") {
		output = response.get(req, body);
	} else {
		output = response.get(req, "{}");
	}

	// prepare message to send
	if (output === "DONE" || output === "NULLGET") {
		return;
	}

	if (output === "CONTENT") {
		let image = req.url.replace('/uploads/CONTENT/banners/', './data/images/banners/').replace('banner_', '');
		console.log("[IMG]:" + image);
		header_f.sendImage(resp, image);
		return;
	}

	if (output === "IMAGE") {
		if (req.url.includes("/files/quest") || req.url.includes("/files/handbook"))
			req.url = req.url.replace("/files", "/data/images");
		header_f.sendImage(resp, "." + req.url);
		return;
	}

	if (req.url === "/" || req.url === "/inv" || req.url === "/random") {
		header_f.sendHTML(resp, output);
	} else if (req.url === "/bottest") {
		header_f.sendTrueJson(resp, output);
	} else {
		header_f.sendJson(resp, output);
	}
	constants.setActiveID(0);
}

function handleRequest(req, resp) {
	// separate request in the log
	if(settings.debug.showSeparator === true)
	{
		logger.separator();
	}
	
	let ActiveProfile = "";

	if (req.method == "POST") {
		if(req.url != "/OfflineRaidSave"){
			constants.setActiveID(getCookies(req)['PHPSESSID']);
			ActiveProfile = "[ActiveProfile:" + constants.getActiveID() + "]";
		}
		// received data
		let IP = req.connection.remoteAddress.replace("::ffff:","");
		let URL = "[Req:" + req.url + "]";
        req.on('data', function (data) {
            // prevent flood attack
            if (data.length > 1000000 && req.url != "/OfflineRaidSave")
                request.connection.destroy();
			if(req.url == "/OfflineRaidSave"){
				if(settings.server.lootSaving == true)
				{ // save loot if lootSaving is enabled - created on community requests
					let PreparedStringData = data.toString().replace(/(\\r\\n)+/g, "").replace(/(\\)+/g, "");
					let parseBody = JSON.parse(PreparedStringData);
					constants.setActiveID(parseBody.aid);//get aid from requested profile and set it to active profile
					let profile_data = utility.readJson(parseBody.game + "\\SavedProfile.json");
					// get the IP address of the client
					console.log(IP + URL + "[SAVE_PROFILE][ProfileID:" + parseBody.aid + "]" + ActiveProfile, "cyan"); //log display
					if(settings.debug.debugMode == true)
						console.log(parseBody); //log display
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
						console.log(IP + URL + ActiveProfile + "~", "cyan"); //log display
						if(settings.debug.debugMode == true)
							console.log(body); //log display
					sendResponse(req, resp, body);
				});
			}
		});
	} else {
		let IP = "[" + req.connection.remoteAddress.replace("::ffff:","") + "]";
		let URL = "[GET:" + req.url + "]";
		console.log(IP + URL, "cyan"); //log display
		sendResponse(req, resp, null);
	}
}

function start() {
	let server = http.createServer();
	port = settings.server.port;
	
	ip = settings.server.ip;
	if (settings.server.generateIp == true)
    {
        ip = utility.getLocalIpAddress();
    }
	// set the ip and backendurl 
	settings.server.ip = ip; 
	settings.server.backendUrl = "http://" + ip + ":" + port; 
	backendUrl = settings.server.backendUrl;
	utility.writeJson("server.config.json", settings); 
	// show our watermark
	console.log("  └─ JustEmuTarkov " + constants.serverVersion() + " ─┘", "cyan", "");
	console.log("■ https://justemutarkov.github.io/", "cyan", "");
	if(settings.debug.showSeparator === true)
	{
		logger.separator();
	}

	// check if port is already being listened to 
	server.on('error', function () {
		console.log("» Port " + port + " is already in use. Check if console isnt already open or change port", "red", "");
		if(settings.debug.debugMode == true)
			require('child_process').exec('start "" "' + __dirname.substring(0, __dirname.length - 3) + 'errorLogs"');
    });

	// listen to port on ip
	server.listen(port, function() {
		console.log("» Starting listening on http://" + ip + ":" + port, "green", "", true);
		console.log(" ","","",true)
	});
	
	// handle request 
	server.on('request', function(req, resp) {
		handleRequest(req, resp);
	});
	

}

module.exports.start = start;
