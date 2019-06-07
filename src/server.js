"use strict";

var http = require('http');
var zlib = require('zlib');
var settings = require('./settings.js');
var item = require('./item.js');
var response = require('./response.js');

function sendResponse(req, resp, body) {
	var output = "";
	
	// get response
	if (req.method == "POST") {
		output = response.get(req, body.toString(), req.url);
	} else {
		output = response.get(req, "{}", req.url);
	}

	// redirect
	if (output == "DEAD") {
		resp.writeHead(301, {Location: 'http://prod.escapefromtarkov.com'+req.url});
		console.log("Redirecting");
		resp.end();

		return;
	}

	// send response
	resp.writeHead(200, "OK", {'Content-Type': 'text/plain', 'content-encoding' : 'deflate', 'Set-Cookie' : 'PHPSESSID=yolo'});
	
	zlib.deflate(output, function(err, buf) {
		resp.end(buf);
	});
}

function handleRequest(req, resp) {
	// reset item output
	item.resetOutput();
	
	// get the IP address of the client
	console.log('Got request from: %s for %s', req.connection.remoteAddress, req.url);
	
	// handle the request
	if (req.method == "POST") {
		console.log("Posting");

		// received data
		req.on('data', function(data) {
			zlib.inflate(data, function(err, body) {
				sendResponse(req, resp, body);
			});
		});
	} else {
		console.log("Getting");
		sendResponse(req, resp, null);
	}
}

function start() {
	var server = http.createServer();
	var port = settings.getPort();

	server.listen(port, function() {
		console.log('EmuTarkov listening on: %s', port);
	});
	
	server.on('request', function(req, resp) {
		handleRequest(req, resp);
	});
}

module.exports.start = start;