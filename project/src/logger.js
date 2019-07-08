const fs = require('fs');
const path = require('path');
const util = require('util');
const utility = require('./utility.js');

var fileStream = undefined;

printf = console.log;
console.log = function(data) {
	printf(data);
	fileStream.write(util.format(data) + '\n');
};

function start() {
	let file = utility.getTime() + "_" + utility.getDate() + ".log";
	let folder = "./logs";
	let filepath = path.join(folder, file);

	if (!fs.existsSync(folder)) {
		fs.mkdirSync(folder);
	}

	if (!fs.existsSync(filepath)) {
		fs.writeFileSync(filepath);
	}

	fileStream = fs.createWriteStream(filepath, {flags : 'w'});
}

module.exports.start = start;