process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0; // ignore selfsigned ssl certificate

const fs = require('fs');
const zlib = require('zlib');
const https = require('https');
let integer = 0;
let gameVersion = '0.12.1.5208';

function readJson(file) { //read json file with deleting all tabulators and new lines
    return (fs.readFileSync(file, 'utf8')).replace(/[\r\n\t]/g, '').replace(/\s\s+/g, '');
}

function send(url, _port = 443, path, data, type = "POST"){
	return new Promise ((resolve, reject) => {
		const options = { // options for https data it must stay like this
		  hostname: url,
		  port: _port,
		  path: path,
		  method: type,
		  headers: {
			  'User-Agent':			'UnityPlayer/2018.4.11f1 (UnityWebRequest/1.0, libcurl/7.52.0-DEV)',
			  'Content-Type': 		'application/json',
			  'Accept': 			'application/json',
			  'App-Version': 		'EFT Client ' + gameVersion,
			  'GClient-RequestId': 	integer
		  } 
		};

		integer++; // add integer number to request counting requests and also making their stupid RequestId Counter

		zlib.deflate(data, function (err, buffer) { // this is kinda working
			const req = https.request(options, (res) => { // request https data with options above
				console.log("  ["+integer+"]"+((integer < 10)?" ":"")+"> [Response Status Code]: " + res.statusCode + " »»" + path);

				if(res.statusCode != 200){ 
					reject("No Response: " + res.statusCode);
				}
				
				let chunks = [];

				res.on('data', (d) => {
					chunks.push(d);
				});

				res.on('end', function(){
					resolve(Buffer.concat(chunks));
				});
			});

			// return error if error on request
			req.on('error', err => {
				reject(err); 
			});

			req.write(buffer);
			req.end();
		});
	});
}

async function testServer() {
	console.log("\nSERVER TESTER STARTING...");

	let settings = JSON.parse(readJson(__dirname + "/../../user/server.config.json"));
	const url = settings.server.ip;
	const port = 443;
	const path = [
	/* 0	*/	"/",
	/* 1	*/	"/client/languages",
	/* 2	*/	"/client/menu/locale/en",
	/* 3	*/	"/client/game/version/validate",
	/* 4	*/	"/client/game/login",
	/* 5	*/	"/client/game/keepalive",
	/* 6	*/	"/client/items",
	/* 7	*/	"/client/globals",
//	/* 8	*/	"/client/game/profile/list",
	/* 9	*/	"/client/locations",
	/* 10	*/	"/client/weather",
	/* 11	*/	"/client/locale/en",
	/* 12	*/	"/client/game/profile/select",
	/* 13	*/	"/client/profile/status",
	/* 14	*/	"/client/handbook/templates",
	/* 15	*/	"/client/quest/list",
	/* 16	*/	"/client/notifier/channel/create",
	/* 17	*/	"/client/mail/dialog/list",
	/* 18	*/	"/client/friend/list",
	/* 19	*/	"/client/friend/request/list/inbox",
	/* 20	*/	"/client/friend/request/list/outbox",
	/* 21	*/	"/client/server/list",
	/* 22	*/	"/client/trading/api/getTradersList",
	/* 23	*/	"/OfflineRaidSave"
	];
	const data = [
	/* 0	*/	"",
	/* 1	*/	'{"crc":0}',
	/* 2	*/	'{"crc":0}',
	/* 3	*/	'{"version":{"major":"' + gameVersion + '","minor":"live","game":"live","backend":"6","taxonomy":"341"},"develop":true}',
	/* 4	*/	'{"email":"user@jet.com","pass":"5f4dcc3b5aa765d61d8327deb882cf99","version":{"major":"' + gameVersion + '","minor":"live","game":"live","backend":"6","taxonomy":"341"},"device_id":"7ae28fd31fd437b6085385aede3141ae","develop":true,"sec":1}',
	/* 5	*/	'{}',
	/* 6	*/	'{"crc":1074351527}',
	/* 7	*/	'{"crc":0}',
//	/* 8	*/	'{}',
	/* 9	*/	'{"crc":850408639}',
	/* 10	*/	'{}',
	/* 11	*/	'{"crc":2863236201}',
	/* 12	*/	'{"uid":"5c71b934354682353958e984"}',
	/* 13	*/	'{}',
	/* 14	*/	'{}',
	/* 15	*/	'{"completed":true}',
	/* 16	*/	'{}',
	/* 17	*/	'{"limit":30,"offset":0}',
	/* 18	*/	'{}',
	/* 19	*/	'{}',
	/* 20	*/	'{}',
	/* 21	*/	'{}',
	/* 22	*/	'{}',
	/* 23	*/	readJson(__dirname + "/../db/offlineRaidprofile.json")
	];

	for (let i = 0; i < path.length; i++) {
		try {
			let res = await send(url, port, path[i], data[i]);
			console.log("  Status of request: " + ((res.length > 0 || url != "/OfflineRaidSave") ? "[OK]" : "[BAD]"));
			console.log("");
		} catch (err) {
			console.log("»SCRIPT ERROR » " + path[i], err);
		}
	}
}

testServer();