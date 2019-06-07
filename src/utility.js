var fs = require('fs');

function readJson(file) {
	return (fs.readFileSync(file, 'utf8')).replace(/[\r\n\t]/g, '');
}

function writeJson(file, data) {
    fs.writeFileSync(file, JSON.stringify(data, null, "\t"), 'utf8');
}

function getRandomInt(min, max) {
	min = Math.ceil(min);
	max = Math.floor(max);

	return Math.floor(Math.random() * (max - min + 1)) + min;
} // stolen off StackOverflow

function getRandomIntEx(max) {
	return Math.floor(Math.random() * Math.floor(max));
}

function convertStringToBytes(string) {
	var bytes = [];
	
	for (var i = 0; i < string.length; ++i) {
		var code = string.charCodeAt(i);
		
		bytes = bytes.concat([code]);
	}
	
	return bytes.concat(0);
}

module.exports.readJson = readJson;
module.exports.writeJson = writeJson;
module.exports.getRandomInt = getRandomInt;
module.exports.getRandomIntEx = getRandomIntEx;
module.exports.convertStringToBytes = convertStringToBytes;