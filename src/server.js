"use strict";

var fs = require('fs');
var http = require('http');
var zlib = require('zlib');
var utility = require('./utility.js');
var settings = require('./settings.js');
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
	resp.writeHead(200, "OK", {'Content-Type': 'text/plain', 'content-encoding' : 'deflate', 'Set-Cookie' : 'PHPSESSID=' + output.account});
	
	zlib.deflate(output.message, function(err, buf) {
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
	var output = JSON.parse('{"account":0, "message":""}');

	// get active account
	var account = getCookies(req)['PHPSESSID'];

	if (account == undefined) {
		output.account = 0;
	} else {
		output.account = account;
	}

	utility.setAccountID(account);

	// get response
	if (req.method == "POST") {
		output = response.get(req, body.toString(), output);
	} else {
		output = response.get(req, "{}", output);
	}
	
	console.log("ProfileID: " + output.account);

	// image
	if (output.message == "IMAGE") {
		sendImage(resp, '.' + req.url);
		return;
	}

	// json
	sendJson(resp, output);

	// reset utility account id
	utility.setAccountID(account);
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