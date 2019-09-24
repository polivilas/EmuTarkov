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
const ver = "0.7.4 RC.11";
var settings = JSON.parse(utility.readJson("server.config.json")); 

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
function sendHTML(resp, output) {
	resp.writeHead(200, "OK", {'Content-Type': 'text/html'});
	resp.end(output);
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
		currentProfile.data[1].Info.Level = offRaidProfile.Info.Level;
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
		let replaceConfig = JSON.parse(utility.readJson("data/configs/offlineProgressionReplacer.json")); 
		var keys = Object.keys(replaceConfig);
		for(let iterate = 0; iterate < keys.length; iterate++)
		{
			string_inventory = string_inventory.replace(new RegExp(keys[iterate], 'g'), replaceConfig[keys[iterate]]);
		}
		/* version 3333 
		{
			"GClass798": "Sight",
			"GClass795": "Repairable",
			"GClass780": "Foldable",
			"GClass779": "FireMode",
			"GClass791": "MedKit",
			"GClass781": "FoodDrink",
			"GClass778": "FaceShield",
			"GClass800": "Togglable",
			"GClass786": "Keycard",
			"GClass799": "Tag",
			"GClass788": "Light",
			"GClass000": "Dogtag" ??? unknownGCLASS
		}
		*/
		// left to check: SpawnedInSession, Dogtag

		//and then re-parse the string into an object preparing to replace ID fix
		offRaidProfile.Inventory.items = JSON.parse(string_inventory);
		
		// replace bsg shit long ID with proper one
		for (let recalID in offRaidProfile.Inventory.items)
		{
			//do not replace important ID's
			if(
				offRaidProfile.Inventory.items[recalID]._id != offRaidProfile.Inventory.equipment && 
				offRaidProfile.Inventory.items[recalID]._id != offRaidProfile.Inventory.questRaidItems && 
				offRaidProfile.Inventory.items[recalID]._id != offRaidProfile.Inventory.questStashItems
			){
			let old_id = offRaidProfile.Inventory.items[recalID]._id;
			let new_id = "oRd_" + item.GenItemID();
			string_inventory = string_inventory.replace(new RegExp(old_id, 'g'), new_id);
			}
		}
		offRaidProfile.Inventory.items = JSON.parse(string_inventory);

		//remove previous equippement & other, KEEP ONLY THE STASH
		item.removeItem( currentProfile, {Action: 'Remove', item: currentProfile.data[1].Inventory.equipment} );
		item.removeItem( currentProfile, {Action: 'Remove', item: currentProfile.data[1].Inventory.questRaidItems} );
		item.removeItem( currentProfile, {Action: 'Remove', item: currentProfile.data[1].Inventory.questStashItems} );

		
		
		//and then fill with offline raid equipement
		for(let inventoryitem in offRaidProfile.Inventory.items)
		{
			currentProfile.data[1].Inventory.items.push(offRaidProfile.Inventory.items[inventoryitem]);
		}	
		
		let pocketid = "";
		let items_to_delete = [];

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
		// get response
		if (req.method == "POST") {
			output = response.get(req, body);
		} else {
			output = response.get(req, "{}");
		}
		
		// prepare message to send
		if (output == "DONE" || output == "NULLGET") 
		{
			return;
		}

		if (output == "CONTENT") 
		{
			let image = req.url.replace('/uploads/CONTENT/banners/', './data/images/banners/').replace('banner_', '');

			console.log("The banner image location: " + image);
			sendImage(resp, image);
			return;
		}

		if (output == "IMAGE") 
		{
			if(req.url.includes("/files/quest") || req.url.includes("/files/handbook"))
				req.url = req.url.replace("/files", "/data/images")
			sendImage(resp, "." + req.url);
			return;
		}
		//if(req.url == "/client/game/profile/items/moving")
			//console.log(output,"","",true);
		if(req.url === "/")
			sendHTML(resp, output);
		else
			sendJson(resp, output);
	profile.setActiveID(0);
}
function handleRequest(req, resp) {
	// separate request in the log
	if(settings.debug.showSeparator === true)
	{
		logger.separator();
	}
	
	let prof = "";
	if (req.method == "POST") {
		if(req.url != "/OfflineRaidSave"){
		profile.setActiveID(getCookies(req)['PHPSESSID']);
		prof = "[Profile:" + profile.getActiveID() + "]";
		}
		else
		{
		}
	}
	// get the IP address of the client
	let IP = "[INFO][IP>" + req.connection.remoteAddress + "]";
	let URL = "[Req:" + req.url + "]";
	let method = (settings.debug.debugMode == true)?"<" + req.method + ">":"";
	// [INFO][IP>192.168.1.1:1337]<POST>[Profile:0][Req:/client/items]
	console.log(IP + method + prof + URL, "cyan"); //log display
	
	if (req.method == "POST") {
		// received data
        req.on('data', function (data) {
            // prevent flood attack
            if (data.length > 1000000 && req.url != "/OfflineRaidSave")
                request.connection.destroy();
			if(req.url == "/OfflineRaidSave"){
				if(settings.server.lootSaving === true)
				{ // save loot if lootSaving is enabled - created on community requests
					let PreparedStringData = data.toString().replace(/(\\r\\n)+/g, "").replace(/(\\)+/g, "");
					let parseBody = JSON.parse(PreparedStringData);
					profile.setActiveID(parseBody.aid);//get aid from requested profile and set it to active profile
					let profile_data = utility.readJson(settings.game + "\\SavedProfile.json");
					console.log("[CUSTOM][SAVE_PROFILE_REQUEST] - Profile aid:" + parseBody.aid, "cyan");
					saveProfileProgress(parseBody);
				}
				return;
			} else {
				// extract data
				zlib.inflate(data, function(err, body) {
					// SHOW BODY ONLY ON POST REQUESTS AND IF NOT SAVE PROGRESS
					body = ((body !== null && body != "" && body != "{}")?body.toString():"{}");
					if(settings.debug.debugMode == true)
						console.log(body, "", "", true);
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
	utility.writeJson("server.config.json", settings); 
 
	// show our watermark
	console.log("> JustEmuTarkov " + version() + "  <", "white", "cyan");
	console.log("> https://justemutarkov.github.io/  <", "white", "cyan");
	if(settings.debug.showSeparator === true)
	{
		logger.separator();
	}

	// check if port is already being listened to 
	server.on('error', function () {
		console.log("Port " + port + " is already in use. Check if console isnt already open or change port", "white", "red");
		if(settings.debug.debugMode == true)
			require('child_process').exec('start "" "' + __dirname.substring(0, __dirname.length - 3) + 'logs"');
    });

	// listen to port on ip
	server.listen(port, function() {
		console.log("> Starting listening on http://" + ip + ":" + port, "white", "green", true);
	});
	
	// handle request 
	server.on('request', function(req, resp) {
		handleRequest(req, resp);
	});
	

}

module.exports.start = start;
module.exports.version = version;