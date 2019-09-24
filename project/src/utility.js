"use strict";

const fs = require('fs');
const path = require('path');

function readJson(file)
{ //read json file with deleting all tabulators and new lines
	return (fs.readFileSync(file, 'utf8')).replace(/[\r\n\t]/g, '');
}
function writeJson(file, data)
{ //write json to file with tabulators and new lines
    fs.writeFileSync(file, JSON.stringify(data, null, "\t"), 'utf8');
}
function getRandomInt(min, max)
{ // random number from given range
	min = Math.ceil(min);
	max = Math.floor(max);
	if (max > min)
		return Math.floor(Math.random() * (max - min + 1) + min);
	else 
		return min;
}
function getRandomIntEx(max)
{ // random number from 1 to max if 1 given return 1
	if(max > 1)
		return Math.floor(Math.random() * (max - 2) + 1);
	else 
		return 1;
}
function removeDir(dir)
{
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
function getTimestamp()
{
	let time = new Date();
	return time.getTime();
}
function getTime()
{
	let today = new Date();
	let hours = ("0" + today.getHours()).substr(-2);
	let minutes = ("0" + today.getMinutes()).substr(-2);
	let seconds = ("0" + today.getSeconds()).substr(-2);

	return hours + "-" + minutes + "-" + seconds;
}
function getDate()
{
	let today = new Date();
	let day = ("0" + today.getDate()).substr(-2);
	let month = ("0" + (today.getMonth() + 1)).substr(-2);
	let year = ("000" + (today.getYear() + 1)).substr(-4);

	return today.getFullYear() + "-" + month + "-" + day;
}
// Module exporting
module.exports.readJson = readJson;
module.exports.writeJson = writeJson;
module.exports.getRandomInt = getRandomInt;
module.exports.getRandomIntEx = getRandomIntEx;
module.exports.removeDir = removeDir;
module.exports.getTimestamp = getTimestamp;
module.exports.getTime = getTime;
module.exports.getDate = getDate;