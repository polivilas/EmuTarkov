var http = require('http');
var zlib = require('zlib');

var settings = require('./settings.js');
var login = require('./login.js');
var item = require('./item.js');
var response = require('./response.js');

var server = http.createServer();
var serverSettings = settings.getServerSettings();
var port = serverSettings.port;
var output = "";

server.on('request', function(req, resp) {
	// Get the IP address of the client
	output = "";
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
						output = response.handleRequest(req, body.toString(), req.url);
						
						if (output == "DEAD") {
							resp.writeHead(301, {Location: 'http://prod.escapefromtarkov.com'+req.url});
							console.log("Redirecting");
							resp.end();

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
		output = response.handleRequest(req, "{}", req.url);
		
		if (output == "DEAD") {
			resp.writeHead(301,	{Location: 'http://prod.escapefromtarkov.com'+req.url});
			console.log("Redirecting");
			resp.end();

			return;
		}

		resp.writeHead(200, "OK", {'Content-Type': 'text/plain', 'content-encoding' : 'deflate', 'Set-Cookie' : 'PHPSESSID=yolo'});
		
		zlib.deflate(output, function(err, buf) {
			resp.end(buf);
		});
	}
});

//Start the server
server.listen(port, function() {
	console.log('EmuTarkov listening on: %s', port);
});

// create login token
var accountSettings = settings.getAccountSettings();
var loginData = JSON.parse('{"email":' + accountSettings.email + ',"password":' + accountSettings.password + ', "toggle":true, "timestamp":1337}');

setInterval(function() {
	login.createToken(loginData);
}, 1000 * 60);

login.createToken(loginData);