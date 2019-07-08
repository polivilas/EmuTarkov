"use strict";

const fs = require('fs');
const http = require('http');
const zlib = require('zlib');
const settings = require('./settings.js');
const profile = require('./profile.js');
const item = require('./item.js');
const response = require('./response.js');

// create responsive separator which counts the columns of console and 
function separator() {
    let s = '';

    for (let i = 0;i < process.stdout.columns - 1; i++) {
        s = s + '-';
	}
    
	console.log('\x1b[31m' + s + "\x1b[0m");//yea some console magic happend here ;) red color text
}

function COLOR(s,c1,c2) {
    let t1 = ''
	let t2 = '';
    
	switch (c1) {
		case 'BBlack':
			t1 = "\x1b[40m";
			break;

        case 'BRed':
			t1 = "\x1b[41m";
			break;

        case 'BGreen':
			t1 = "\x1b[42m";
			break;

        case 'BYellow':
			t1 = "\x1b[43m";
			break;

        case 'BBlue':
			t1 = "\x1b[44m";
			break;

        case 'BMagenta':
			t1 = "\x1b[45m";
			break;

        case 'BCyan':
			t1 = "\x1b[46m";
			break;

        case 'BWhite':
			t1 = "\x1b[47m";
			break;
		
		default:
			t1 = "";
			break;
	}

	switch (c2) {
        case 'FBlack': t2 = "\x1b[30m";break;
        case 'FRed': t2 = "\x1b[31m";break;
        case 'FGreen': t2 = "\x1b[32m";break;
        case 'FYellow': t2 = "\x1b[33m";break;
        case 'FBlue': t2 = "\x1b[34m";break;
        case 'FMagenta': t2 = "\x1b[35m";break;
        case 'FCyan': t2 = "\x1b[36m";break;
        case 'FWhite': t2 = "\x1b[37m";break;
		default: t2 = "";
	}

    return t1 + t2 + s + "\x1b[0m"; 
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

function sendResponse(req, resp, body) {
	let output = "";

	// reset item output
	item.resetOutput();

	// get active profile
	profile.setActiveID(getCookies(req)['PHPSESSID']);

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

	sendJson(resp, output);
	profile.setActiveID(0);
}

function handleRequest(req, resp) {
	// separate request in the log - themaoci -)
	separator();
	
	// get the IP address of the client
	console.log(COLOR("IP address:", "BGreen", "FBlack") + " " + req.connection.remoteAddress, req.url);

	// handle the request
	console.log(COLOR("Request method:", "BGreen", "FBlack") + " " + req.method);
	
	if (req.method == "POST") {
		// received data
		req.on('data', function(data) {
			zlib.inflate(data, function(err, body) {
				sendResponse(req, resp, body);
			});
		});
	} else {
		sendResponse(req, resp, null);
	}
}

function centerConsoleLog(text){
	let n = (process.stdout.columns - text.length) / 2;
	let space = '';

	for (let i = 0;i < n; i++) {
        space = space + ' ';
	}
	
	return space + text;
}

function start() {
	let server = http.createServer();
	let port = settings.getServerSettings().port;

	console.log(COLOR(centerConsoleLog("Just EmuTarkov 0.7.0"), "BBlue", "FBlack"));
	console.log(COLOR(centerConsoleLog("for more check: https://justemutarkov.github.io/"), "BBlue", "FBlack"));
	
	server.on('error', function () {
		console.log(COLOR("Port " + port + " is already in use","","FRed"));
		return;
    });

	server.listen(port, function() {
		console.log(COLOR("Listening on port: " + port,"","FGreen"));
	});
	
	server.on('request', function(req, resp) {
		handleRequest(req, resp);
	});
}

module.exports.start = start;
module.exports.COLOR = COLOR;
module.exports.centerConsoleLog = centerConsoleLog;