"use strict";

const fs = require('fs');
const http = require('http');
const zlib = require('zlib');
const logger = require('./logger.js');
const settings = require('./settings.js');
const profile = require('./profile.js');
const item = require('./item.js');
const response = require('./response.js');

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
	// separate request in the log
	logger.separator();
	
	// get the IP address of the client
	console.log("IP address: " + req.connection.remoteAddress, req.url, "black", "green");

	// handle the request
	console.log("Request method: " + req.method, "black", "green");
	
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

function start() {
	let server = http.createServer();
	let port = settings.getServerSettings().port;

	console.log(logger.center("Just EmuTarkov 0.7.0"), "black", "cyan"));
	console.log(logger.center("for more check: https://justemutarkov.github.io/"), "black", "cyan"));
	
	server.on('error', function () {
		console.log("Port " + port + " is already in use", "black", "red"));
		return;
    });

	server.listen(port, function() {
		console.log("Listening on port: " + port, "black", "green"));
	});
	
	server.on('request', function(req, resp) {
		handleRequest(req, resp);
	});
}

module.exports.start = start;