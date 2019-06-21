"use strict";

var regedit = require('regedit');
var settings = require('./settings.js');

var accountSettings = settings.getAccountSettings();
var data = JSON.parse('{"email":' + accountSettings.email + ',"password":' + accountSettings.password + ',"toggle":true,"timestamp":0}');

function convertStringToBase64(string) {
	return Buffer.from(string).toString('base64');
}

function convertStringToBytes(string) {
	var bytes = [];
	
	for (var i = 0; i < string.length; ++i) {
		var code = string.charCodeAt(i);
		
		bytes = bytes.concat([code]);
	}

	return bytes.concat(0);
}

function createToken() {
	// generate timestamp
	data.timestamp = (Math.floor(new Date() / 1000) + 45) ^ 698464131;
	
	// encrypt the token
	var tmpB64 = convertStringToBase64(JSON.stringify(data));
	
	// convert encrypted token to bytes
	var bytes = convertStringToBytes(tmpB64);

	// put the token into the registery
	regedit.putValue({'HKCU\\SOFTWARE\\Battlestate Games\\EscapeFromTarkov': {'bC5vLmcuaS5u_h1472614626': {value: bytes, type: 'REG_BINARY'}}}, function(err) {		
		if (err && err.code == 2) {
			console.log("Registry key missing, creating one");
			regedit.createKey('HKCU\\SOFTWARE\\Battlestate Games\\EscapeFromTarkov', function(err){});
			regedit.putValue({'HKCU\\SOFTWARE\\Battlestate Games\\EscapeFromTarkov': {'bC5vLmcuaS5u_h1472614626': {value: bytes, type: 'REG_BINARY'}}}, function(err) {});
		}

		console.log("Created login token at timestamp " + data.timestamp);
	});
};

function start() {
	setInterval(function() {
		createToken();
	}, 1000 * 60);

	createToken();
}

module.exports.createToken = createToken;
module.exports.start = start;