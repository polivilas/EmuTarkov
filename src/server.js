var http = require('http');
var zlib = require('zlib');

var settings = require('./settings.js');
var item = require('./item.js');
var response = require('./response.js');

function redirect(resp) {
	resp.writeHead(301, {Location: 'http://prod.escapefromtarkov.com'+req.url});
	console.log("Redirecting");
	resp.end();
}

function handleRequest(req, resp) {
	// Get the IP address of the client
	var output = "";
	item.resetOutput();
	
	var remote = req.connection.remoteAddress;
	
	console.log('Got request from: %s for %s', remote, req.url);
	
	if (req.method == "POST") {
		console.log("Posting");
		req.on('data', function(data) {
				zlib.inflate(data, function(error, body) {
					if (error) {
						console.log(error);
					} else {
						output = response.get(req, body.toString(), req.url);
						
						if (output == "DEAD") {
							redirect(resp);
							return;
						}

						resp.writeHead(200, "OK", {'Content-Type': 'text/plain', 'content-encoding' : 'deflate', 'Set-Cookie' : 'PHPSESSID=yolo'});
						
						zlib.deflate(output, function(err, buf) {
							resp.end(buf);
						});

						return;
					}
			});
		});
	} else {
		console.log("Getting");
		output = response.get(req, "{}", req.url);
		
		if (output == "DEAD") {
			redirect(resp);
			return;
		}

		resp.writeHead(200, "OK", {'Content-Type': 'text/plain', 'content-encoding' : 'deflate', 'Set-Cookie' : 'PHPSESSID=yolo'});
		
		zlib.deflate(output, function(err, buf) {
			resp.end(buf);
		});
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