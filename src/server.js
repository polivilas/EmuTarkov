"use strict";

const fs = require('fs');
const http = require('http');
const zlib = require('zlib');
const os = require('os');
const utility =  require('./utility.js');
const logger = require('./logger.js');
const profile = require('./profile.js');
const item = require('./item.js');
const response = require('./response.js');
const ver = "0.7.3";

var settings = JSON.parse(utility.readJson("data/server.config.json")); 

function version(){
	return ver;
}
function getLocalIpAddress() { 
	let address = "127.0.0.1"; 
    let ifaces = os.networkInterfaces(); 
 
	for (let dev in ifaces) { 
		let iface = ifaces[dev].filter(function(details) { 
			return details.family === 'IPv4' && details.internal === false; 
		}); 
 
		if (iface.length > 0) { 
			address = iface[0].address; 
		} 
	} 
 
	return address; 
} 

function getCookies(req) {
	let found = {}
	let cookies = req.headers.cookie;

	if (cookies) {
		for (let cookie of cookies.split(';')) {
			let parts = cookie.split('=');

			found[parts.shift().trim()] = decodeURI(parts.join('='));
		}
	}

    return found;
}

function sendJson(resp, output) {
	resp.writeHead(200, "OK", {'Content-Type': 'text/plain', 'content-encoding' : 'deflate', 'Set-Cookie' : 'PHPSESSID=' + profile.getActiveID()});
	
	zlib.deflate(output, function(err, buf) {
		resp.end(buf);
	});
}

function sendImage(resp, file) {
	let fileStream = fs.createReadStream(file);

	// send file
	fileStream.on('open', function() {
		resp.setHeader('Content-Type', 'image/png');
		fileStream.pipe(resp);
	});
}

function saveProfileProgress(offRaidData)
{
	 	let profile_data = JSON.parse(utility.readJson(settings.game + "\\SavedProfile.json"));
		let offRaidProfile = profile_data;
		let currentProfile = profile.getCharacterData();
		//replace data below
		currentProfile.data[1].Info.Experience = offRaidProfile.Info.Experience;
		//currentProfile.data[1].Health = offRaidProfile.Health;
		currentProfile.data[1].Skills = offRaidProfile.Skills;
		currentProfile.data[1].Stats.SessionCounters = offRaidProfile.Stats.SessionCounters;
		currentProfile.data[1].Stats.OverallCounters = offRaidProfile.Stats.OverallCounters;
		currentProfile.data[1].Stats.LastSessionDate = offRaidProfile.Stats.LastSessionDate;
		currentProfile.data[1].Encyclopedia = offRaidProfile.Encyclopedia;
		currentProfile.data[1].ConditionCounters = offRaidProfile.ConditionCounters;
		currentProfile.data[1].Quests = offRaidProfile.Quests;
		//currentProfile.data[1].TraderStandings = offRaidProfile.TraderStandings;


		//work with a string instead of looping through data, less code, less ressources, faster
		var string_inventory = JSON.stringify(offRaidProfile.Inventory.items);

		//replace all these GClasses shit
		string_inventory = string_inventory.replace(new RegExp("GClass795", 'g'), "Repairable");
		string_inventory = string_inventory.replace(new RegExp("GClass780", 'g'), "Foldable");
		string_inventory = string_inventory.replace(new RegExp("GClass779", 'g'), "FireMode");
		string_inventory = string_inventory.replace(new RegExp("GClass796", 'g'), "Sight");
		string_inventory = string_inventory.replace(new RegExp("GClass791", 'g'), "MedKit");
		string_inventory = string_inventory.replace(new RegExp("GClass778", 'g'), "FaceShield");
		string_inventory = string_inventory.replace(new RegExp("GClass788", 'g'), "Light");
		string_inventory = string_inventory.replace(new RegExp("GClass786", 'g'), "Keycard");
		string_inventory = string_inventory.replace(new RegExp("GClass799", 'g'), "Tag");
		string_inventory = string_inventory.replace(new RegExp("GClass800", 'g'), "Togglable");
		// left to check: SpawnedInSession, Dogtag

		//and then re-parse the string into an object
		offRaidProfile.Inventory.items = JSON.parse(string_inventory);

		//remove previous equippement & other, KEEP ONLY THE STASH
		item.removeItem( currentProfile, {Action: 'Remove', item: currentProfile.data[1].Inventory.equipment} );
		item.removeItem( currentProfile, {Action: 'Remove', item: currentProfile.data[1].Inventory.questRaidItems} );
		item.removeItem( currentProfile, {Action: 'Remove', item: currentProfile.data[1].Inventory.questStashItems} );

		//and then fill with offline raid equipement
		for(var inventoryitem in offRaidProfile.Inventory.items)
		{
			currentProfile.data[1].Inventory.items.push(offRaidProfile.Inventory.items[inventoryitem]);
		}	

		let pocketid = "";
		var items_to_delete = [];

		//but if the player get killed, he loose almost everything
		if(offRaidData.status != "Survived" && offRaidData.status != "Runner")
		{	
			for(var inventoryitem in currentProfile.data[1].Inventory.items )
			{
				if(  currentProfile.data[1].Inventory.items[inventoryitem].parentId == currentProfile.data[1].Inventory.equipment 
					&& currentProfile.data[1].Inventory.items[inventoryitem].slotId != "SecuredContainer"
					&& currentProfile.data[1].Inventory.items[inventoryitem].slotId != "Scabbard"
					&& currentProfile.data[1].Inventory.items[inventoryitem].slotId != "Pockets")
				{
					//store it and delete later because i dont know its not working otherwiswe
					items_to_delete.push( currentProfile.data[1].Inventory.items[inventoryitem]._id );
				}

				//we need pocket id for later, its working differently
				if (currentProfile.data[1].Inventory.items[inventoryitem].slotId == "Pockets")
				{
					pocketid = currentProfile.data[1].Inventory.items[inventoryitem]._id;
				}
			}

			//and then delete inside pockets
			for(var inventoryitem in currentProfile.data[1].Inventory.items )
			{
				if(currentProfile.data[1].Inventory.items[inventoryitem].parentId == pocketid )
				{
					//store it and delete later because i dont know its not working otherwiswe
					items_to_delete.push( currentProfile.data[1].Inventory.items[inventoryitem]._id );
				}	
			}

			//finally delete them
			for(var item_to_delete in items_to_delete )
			{
				item.removeItem( currentProfile, {Action: 'Remove', item: items_to_delete[item_to_delete] } );
			}	
		}
		utility.writeJson(settings.game + "\\SavedProfile.json", "{}");
		profile.setCharacterData(currentProfile);	
}

function sendResponse(req, resp, body) {
	if(req.url == "/OfflineRaidSave"){
		return;
	}
	let output = "";
	// reset item output
	item.resetOutput();
	// get active profile

		profile.setActiveID(getCookies(req)['PHPSESSID']);
		console.log("[Request]::" + req.url, "cyan");
		if(settings.dev == true)
			console.log(body.toString());
	
		// get response
		if (req.method == "POST") {
			output = response.get(req, body.toString());
		} else {
			output = response.get(req, "{}");
		}
		
		// prepare message to send
		if (output == "DONE") {
			return;
		}

		if (output == "CONTENT") {
			let image = req.url.replace('/uploads/CONTENT/banners/', './data/images/banners/').replace('banner_', '');

			console.log("The banner image location: " + image);
			sendImage(resp, image);
			return;
		}

		if (output == "IMAGE") {
			sendImage(resp, "." + req.url);
			return;
		}
		//if(req.url == "/client/game/profile/items/moving")
		//	console.log(output);
	sendJson(resp, output);
	profile.setActiveID(0);
}

function handleRequest(req, resp) {
	// separate request in the log
	logger.separator();
	
	let prof = "";
	if (req.method == "POST") {
		if(req.url != "/OfflineRaidSave"){
		profile.setActiveID(getCookies(req)['PHPSESSID']);
		prof = " Profile(" + profile.getActiveID() + ")";
		}
		else
		{
		}
	}
	// get the IP address of the client
	let IP = "[Access][IP > " + req.connection.remoteAddress + "]";
	let method = (settings.dev == true)?" <" + req.method + ">":"";
	console.log(IP + method + prof, "cyan"); //log display
	
	if (req.method == "POST") {
		// received data
        req.on('data', function (data) {
            // prevent flood attack
            if (data.length > 1000000 && req.url != "/OfflineRaidSave")
                request.connection.destroy();
			if(req.url == "/OfflineRaidSave"){
				let PreparedStringData = data.toString().replace(/(\\r\\n)+/g, "").replace(/(\\)+/g, "");
                console.log(PreparedStringData); // here is a bug not all data is transfered
					//save offline profile there checking the data on the fly / "exfil" and "profile" entry
					
				let parseBody = JSON.parse(PreparedStringData);
				profile.setActiveID(parseBody.aid);
				let profile_data = utility.readJson(settings.game + "\\SavedProfile.json");
				console.log("Request: /SAVE_PROFILE_REQUEST", "cyan");
				saveProfileProgress(parseBody);
				return;
			} else {
				// extract data
				zlib.inflate(data, function(err, body) {
					sendResponse(req, resp, body);
				});
			}
		});
	} else {
		sendResponse(req, resp, null);
	}
}

function start() {
	let server = http.createServer();
	let port = settings.server.port;
	let ip = getLocalIpAddress();
	
	// set the ip and backendurl 
	settings.server.ip = ip; 
	settings.server.backendUrl = "http://" + ip + ":" + port; 
	utility.writeJson("data/server.config.json", settings); 
 
	// show our watermark
	console.log("Just EmuTarkov " + version(), "white", "cyan");
	console.log("https://justemutarkov.github.io/", "white", "cyan");
	logger.separator();

	// check if port is already being listened to 
	server.on('error', function () {
		console.log("Port " + port + " is already in use", "white", "red");
		return;
    });

	// listen to port on ip
	server.listen(port, function() {
		console.log("Listening on port: " + port + " with ip " + ip, "white", "green");
	});
	
	// handle request 
	server.on('request', function(req, resp) {
		handleRequest(req, resp);
	});
	

}

module.exports.start = start;
module.exports.version = version;