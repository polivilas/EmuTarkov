"use strict";

var fs = require('fs');
var http = require('http');
var zlib = require('zlib');
var settings = require('./settings.js');
var profile = require('./profile.js');
var item = require('./item.js');
var response = require('./response.js');

var getCookies = function(req) {
	var found = {}
	var cookies = req.headers.cookie;

	if (cookies) {
		for (var cookie of cookies.split(';')) {
			var parts = cookie.split('=');

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
	var fileStream = fs.createReadStream(file);

	fileStream.on('open', function() {
		resp.setHeader('Content-Type', 'image/png');
		fileStream.pipe(resp);
	});
}

function sendResponse(req, resp, body) {
	var output = "";

	// get active profile
	profile.setActiveID(getCookies(req)['PHPSESSID']);

	// get response
	if (req.method == "POST") {
		output = response.get(req, body.toString());
	} else {
		output = response.get(req, "{}");
	}
	
	console.log("ProfileID: " + profile.getActiveID());

	// send image
	if (output == "IMAGE") {
		sendImage(resp, '.' + req.url);
		return;
	}

	// send json
	sendJson(resp, output);

	// reset utility profile ID
	profile.setActiveID(0);
}

function handleRequest(req, resp) {
	// reset item output
	item.resetOutput();
	
	// get the IP address of the client
	console.log('Got request from: %s for %s', req.connection.remoteAddress, req.url);

	// handle the request
	if (req.method == "POST") {
		console.log("POST");

		// received data
		req.on('data', function(data) {
			zlib.inflate(data, function(err, body) {
				sendResponse(req, resp, body);
			});
		});
	} else {
		console.log("GET");
		sendResponse(req, resp, null);
	}
}

function start() {
	var server = http.createServer();
	var port = settings.getServerSettings().port;

	server.listen(port, function() {
		console.log('EmuTarkov listening on: %s', port);
	});
	
	server.on('request', function(req, resp) {
		handleRequest(req, resp);
	});
}

module.exports.start = start;