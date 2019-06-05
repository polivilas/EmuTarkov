var fs = require('fs');

function readJson(file) {
	return (fs.readFileSync(file, 'utf8')).replace(/[\r\n\t]/g, '');
}

function getRandomInt(min, max) {
	min = Math.ceil(min);
	max = Math.floor(max);

	return Math.floor(Math.random() * (max - min + 1)) + min;
} // stolen off StackOverflow

function getRandomIntEx(max) {
	return Math.floor(Math.random() * Math.floor(max));
}

module.exports.readJson = readJson;
module.exports.getRandomInt = getRandomInt;
module.exports.getRandomIntEx = getRandomIntEx;