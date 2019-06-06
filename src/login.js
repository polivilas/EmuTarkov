var regedit = require('regedit');

function createToken(loginJson) {
	// get timestamp
	loginJson.timestamp = (Math.floor(new Date() / 1000) + 45) ^ 698464131;
	console.log(loginJson.timestamp, 'actual = ', Math.floor(new Date() / 1000) + 45);
	
	// encrypt the token
	var tmpB64 = Buffer.from(JSON.stringify(loginJson)).toString('base64');
	
	// convert it to bytes
	var bytes = [];
	
	for (var i = 0; i < tmpB64.length; ++i) {
		var code = tmpB64.charCodeAt(i);
		
		bytes = bytes.concat([code]);
	}
	
	bytes = bytes.concat(0);

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