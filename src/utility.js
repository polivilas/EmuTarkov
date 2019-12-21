"use strict";

require("./libs.js");

function clearString(string) {
	return string.replace(/[\r\n\t]/g, '').replace(/\s\s+/g, '').replace(/[\\]/g, "");
}

function adlerGen(string){
	return adler32.sum(string);
}

function generateCRC(string) {
    return string.split("").reduce(function(a, b) {
        a = ((a << 5) - a) + b.charCodeAt(0);
        return a & a;
    }, 0);
}

function getRandomInt(min = 0, max = 100) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return (max > min) ? Math.floor(Math.random() * (max - min + 1) + min) : min;
}

function getRandomIntEx(max) {
    return (max > 1) ? Math.floor(Math.random() * (max - 2) + 1) : 1;
}

function getDirList(path) {
    return fs.readdirSync(path).filter(function(file) {
        return fs.statSync(path + '/' + file).isDirectory();
    });
}

function removeDir(dir) {
    for (file of fs.readdirSync(dir)) {
        let curPath = path.join(dir, file);

        if (fs.lstatSync(curPath).isDirectory()) {
            removeDir(curPath);
        } else {
            fs.unlinkSync(curPath);
        }
    }

    fs.rmdirSync(dir);
}

function getTimestamp() {
    let time = new Date();

    return Math.floor(time.getTime() / 1000);
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

    return today.getFullYear() + "-" + month + "-" + day;
}

function makeSign(length) {
    let result = '';
    let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let charactersLength = characters.length;
    
    for (let i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    
    return result;
}

function generateNewItemId() {
	let getTime = new Date();
	let month = getTime.getMonth().toString();
	let date = getTime.getDate().toString();
	let hour = getTime.getHours().toString();
	let minute = getTime.getMinutes().toString();
	let second = getTime.getSeconds().toString();
	let random = getRandomInt(1000000000, 9999999999).toString();
	let retVal = "I" + (month + date + hour + minute + second + random).toString();
    let sign = makeSign(24 - retVal.length).toString();
    
    return retVal + sign;
}

function getLocalIpAddress() {
    let address = "127.0.0.1";
    let ifaces = os.networkInterfaces();

    for (let dev in ifaces) {
        let iface = ifaces[dev].filter(function (details) {
            return details.family === 'IPv4' && details.internal === false;
        });

        if (iface.length > 0) {
            address = iface[0].address;
        }
    }

    return address;
}

module.exports.clearString = clearString;
module.exports.adlerGen = adlerGen;
module.exports.generateCRC = generateCRC;
module.exports.getRandomInt = getRandomInt;
module.exports.getRandomIntEx = getRandomIntEx;
module.exports.getDirList = getDirList;
module.exports.removeDir = removeDir;
module.exports.getTimestamp = getTimestamp;
module.exports.getTime = getTime;
module.exports.getDate = getDate;
module.exports.makeSign = makeSign;
module.exports.generateNewItemId = generateNewItemId;
module.exports.getLocalIpAddress = getLocalIpAddress;