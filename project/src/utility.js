"use strict";

require("./libs.js");

let itemsCatched = settings.server.itemsCached;
// ----------- ONLY STATIC FUNCTIONS -------------- //

function readJson(file) { //read json file with deleting all tabulators and new lines
    return (fs.readFileSync(file, 'utf8')).replace(/[\r\n\t]/g, '').replace(/\s\s+/g, '');
}

function writeJson(file, data) { //write json to file with tabulators and new lines
    fs.writeFileSync(file, JSON.stringify(data, null, "\t"), 'utf8');
}

function clearString(s){
	return s.replace(/[\r\n\t]/g, '').replace(/\s\s+/g, '').replace(/[\\]/g, "");
}

function adlerGen(s){
	return adler32.sum(s);
}

function generateCRC(s){ // generate CRC from Server Version
  return s.split("").reduce(function(a,b){a=((a<<5)-a)+b.charCodeAt(0);return a&a},0);              
}
/* Load Items Data 
* load them from small files if they are not cached and flag tells we dont need to cache
* also if file cached exist load from there always save into temp variable 
* and after its loaded Quickly load from there
* input: null
* output: items.json formated data
**/
function prepareItemsFile() {
	if(!itemsCatched || !fs.existsSync('data/configs/itemsCache.json')){
		let itemsDir = ["data/configs/items_default/", "data/configs/items_mods/"];
		let items_BaseJSON = JSON.parse(readJson('data/configs/itemsBase.json'));
		let items_data = items_BaseJSON.data;
		for(let i = 0; i< itemsDir.length; i++){
			let items_List = fs.readdirSync(itemsDir[i]);
			// load trader files
			for (let file in items_List) {
				if (typeof items_List[file] != "undefined") {
							let temp_fileData = JSON.parse(readJson(itemsDir[i] + items_List[file]));
							items_data[temp_fileData._id] = temp_fileData;
				}
			}
		}
		items_BaseJSON.data = items_data;
		items = items_BaseJSON;
		writeJson('data/configs/itemsCache.json', items_BaseJSON);
		settings.server.itemsCached = true;
		writeJson("server.config.json", settings);
		return items_BaseJSON;
	} else {
		if(items == "")
			return JSON.parse(readJson('data/configs/itemsCache.json'));
		else
			return items;
	}
	
}

function getRandomInt(min = 0, max = 100) { // random number from given range
    min = Math.ceil(min);
    max = Math.floor(max);
    if (max > min)
        return Math.floor(Math.random() * (max - min + 1) + min);
    else
        return min;
}

function getRandomIntEx(max) { // random number from 1 to max if 1 given return 1
    if (max > 1)
        return Math.floor(Math.random() * (max - 2) + 1);
    else
        return 1;
}

function removeDir(dir) {
    fs.readdirSync(dir).forEach(function (file, index) {
        let curPath = path.join(dir, file);

        if (fs.lstatSync(curPath).isDirectory()) {
            removeDir(curPath);
        } else {
            fs.unlinkSync(curPath);
        }
    });

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
    // let year = ("000" + (today.getYear() + 1)).substr(-4);

    return today.getFullYear() + "-" + month + "-" + day;
}

/**
 * @return {string}
 */
function MakeSign(length) {
   let result           = '';
    let characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let charactersLength = characters.length;
   for ( let i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
   }
   return result;
}

function generateNewItemId() { // --> Generate ID ultra not repeatable tested for 10.000.000 generates on same time it wasnt duplicated so im assume its ok
	let getTime = new Date();
	let month = getTime.getMonth().toString();
	let date = getTime.getDate().toString();
	let hour = getTime.getHours().toString();
	let minute = getTime.getMinutes().toString();
	let second = getTime.getSeconds().toString();
	let random = getRandomInt(1000000000, 9999999999).toString();
	let retVal = "I" + (month + date + hour + minute + second + random).toString();
	let sign = MakeSign(24 - retVal.length).toString()
	retVal = retVal + sign;
    return retVal;
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

// Module exporting
module.exports.getLocalIpAddress = getLocalIpAddress;
module.exports.prepareItemsFile = prepareItemsFile;
module.exports.clearString = clearString;
module.exports.adlerGen = adlerGen;
module.exports.generateCRC = generateCRC;
module.exports.readJson = readJson;
module.exports.writeJson = writeJson;
module.exports.getRandomInt = getRandomInt;
module.exports.getRandomIntEx = getRandomIntEx;
module.exports.generateNewItemId = generateNewItemId;
module.exports.removeDir = removeDir;
module.exports.getTimestamp = getTimestamp;
module.exports.getTime = getTime;
module.exports.getDate = getDate;
module.exports.MakeSign = MakeSign;