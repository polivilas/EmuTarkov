"use strict";

const fs = require('fs');
const path = require('path');

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
}

function getRandomIntEx(max) {
	return Math.floor(Math.random() * Math.floor(max));
}

function removeDir(dir) {
	fs.readdirSync(dir).forEach(function(file, index) {
		let curPath = path.join(dir, file);
		
		if (fs.lstatSync(curPath).isDirectory()) {
			removeDir(curPath);
		} else {
			fs.unlinkSync(curPath);
		}
    });
    
	fs.rmdirSync(dir);
}

function getTime() {
	let today = new Date();
	let hours = ("0" + today.getHours()).substr(-2);
	let minutes = ("0" + today.getMinutes()).substr(-2);
	let seconds = ("0" + today.getSeconds()).substr(-2);

	return hours + "-" + minutes + "-" + seconds;
}

function getDate() {
	let today = new Date();
	let day = ("0" + today.getDate()).substr(-2);
	let month = ("0" + (today.getMonth() + 1)).substr(-2);
	let year = ("000" + (today.getYear() + 1)).substr(-4);

	return today.getFullYear() + "-" + month + "-" + day;
}

module.exports.readJson = readJson;
module.exports.writeJson = writeJson;
module.exports.getRandomInt = getRandomInt;
module.exports.getRandomIntEx = getRandomIntEx;
module.exports.removeDir = removeDir;
module.exports.getTime = getTime;
module.exports.getDate = getDate;