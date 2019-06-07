var regedit = require('regedit');

var settings = require('./settings.js');

var data = JSON.parse('{"email":' + settings.getEmail() + ',"password":' + settings.getPassword() + ', "toggle":true, "timestamp":1337}');

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
	console.log("Token timestamp: " + data.timestamp);
	
	// encrypt the token
	var tmpB64 = convertStringToBase64(JSON.stringify(data));
	
	// convert encrypted token to bytes
	convertStringToBytes(tmpB64);

	// put the token into the registery
	regedit.putValue( {
		'HKCU\\SOFTWARE\\Battlestate Games\\EscapeFromTarkov': {
			'bC5vLmcuaS5u_h1472614626': {
				value: bytes,
				type: 'REG_BINARY'
			}
		}
    }, function(err) {
		if (err) {
			console.log("Shits fucked.", err);
		};
	});
};

module.exports.createToken = createToken;