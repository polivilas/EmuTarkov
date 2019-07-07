"use strict";

var fs = require('fs');
var http = require('http');
var zlib = require('zlib');
var settings = require('./settings.js');
var item = require('./item.js');
var response = require('./response.js');

var getCookies = function(req) {
	var cookies = {};
	
	req.headers && req.headers.cookie.split(';').forEach(function(cookie) {
		var parts = cookie.match(/(.*?)=(.*)$/)
    
		cookies[ parts[1].trim() ] = (parts[2] || '').trim();
	});
  
	return cookies;
};

function sendJson(resp, json) {
	resp.writeHead(200, "OK", {'Content-Type': 'text/plain', 'content-encoding' : 'deflate', 'Set-Cookie' : 'PHPSESSID=yolo'});
	
	zlib.deflate(json, function(err, buf) {
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
	// get response
	var output = "";

	if (req.method == "POST") {
		output = response.get(req, body.toString());
	} else {
		output = response.get(req, "{}");
	}
	
	// image
	if (output == "IMAGE") {
		sendImage(resp, '.' + req.url);
		return;
	}

	// json
	sendJson(resp, output);
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