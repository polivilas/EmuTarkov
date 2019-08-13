"use strict";

const utility = require('./utility.js'); 
const fs = require('fs');

var profileID = 0;

function getPath() {
	return 'data/profiles/' + profileID + '/';
}

function getProfiles() {
	return JSON.parse(utility.readJson("data/profiles/profiles.json"));
}

function setProfiles(data) {
	return utility.writeJson("data/profiles/profiles.json", data);
}

function getCharacterData() {
	return JSON.parse(utility.readJson(getPath() + 'character.json'));
}

function getStashType(){
	let temp = JSON.parse(utility.readJson(getPath() + 'character.json'));
	for (let key in temp.data[1].Inventory.items) {
		if(temp.data[1].Inventory.items[key]._id == temp.data[1].Inventory.stash)
			return temp.data[1].Inventory.items[key]._tpl;
	}
	console.log("Not found Stash: error check character.json", "red")
	return "NotFound Error";
}

function setCharacterData(data) {
	utility.writeJson(getPath() + 'character.json', data);
}

function getPurchasesData() {
	//themaoci fix for offline raid selling ;) selling for 0.9 times of regular price for now
	//load files
	let multiplier = 0.9;
	let data = JSON.parse(utility.readJson(getPath() + 'character.json'));
	let items = JSON.parse(utility.readJson('data/configs/items.json'));
	items = items.data;
	//prepared vars
	let equipment = data.data[1].Inventory.equipment;
	let stash = data.data[1].Inventory.stash;
	let questRaidItems = data.data[1].Inventory.questRaidItems;
	let questStashItems = data.data[1].Inventory.questStashItems;
	
	data = data.data[1].Inventory.items; // make data as .items array
	
	//do not add this items to the list of soldable
	let notSoldableItems = [
		"544901bf4bdc2ddf018b456d",//wad of rubles
		"5449016a4bdc2d6f028b456f",// rubles
		"569668774bdc2da2298b4568",// euros
		"5696686a4bdc2da3298b456a" // dolars
	];
	
	let purchaseOutput = '{"err": 0,"errmsg":null,"data":{'; //start output string here
	let i = 0;
	for(let invItems in data){
		if(	data[invItems]._id != equipment && 
			data[invItems]._id != stash &&
			data[invItems]._id != questRaidItems &&
			data[invItems]._id != questStashItems && 
			notSoldableItems.indexOf(data[invItems]._tpl) == -1){
			if(i != 0){
				
				purchaseOutput += ',';
			}
			else 
			{
				i++;
			}
			let itemCount = (typeof data[invItems].upd != "undefined")?((typeof data[invItems].upd.StackObjectsCount != "undefined")?data[invItems].upd.StackObjectsCount:1):1;
			let templateId = data[invItems]._tpl;
			let basePrice = (items[templateId]._props.CreditsPrice >= 1)?items[templateId]._props.CreditsPrice:1;
			let preparePrice = basePrice * multiplier * itemCount;
			preparePrice = (preparePrice > 0 && preparePrice != "NaN")?preparePrice:1;
			purchaseOutput += '"' + data[invItems]._id + '":[[{"_tpl": "' + data[invItems]._tpl + 
			'","count": ' + preparePrice.toFixed(0) + '}]]';
		}
		
	}
	purchaseOutput += '}}'; // end output string here
	//utility.writeJson(getPath() + 'purchases.json', purchaseOutput); // save to file isnt needed anymore
	return purchaseOutput;
}

function setPurchasesData(data) {
	utility.writeJson(getPath() + 'purchases.json', data);
}


function getActiveID() {
	return profileID;
}

function setActiveID(ID) {
	if (ID) {
		profileID = ID;
	} else {
		profileID = 0;
	}
}

function findID(ID) {
	let profiles = getProfiles();

	for (let profile of profiles) {
		if (profile.id == ID) {
			return true;
		}
	}

	return false;
}

function findUnusedID() {
	let profiles = getProfiles();

	for (let profile of profiles) {
		if (!findID(profile.id + 1)) {
			return profile.id + 1;
		}
	}

	return profiles.length;
}

function exist(info) {
	let profiles = getProfiles();

	for (let profile of profiles) {
		if (info.email == profile.email && info.pass == profile.password) {
			return profile.id;
		}
	}

	return -1;
}

function nicknameExist(info) {
	let profiles = getProfiles();

	for (let i = 0; i < profiles.length; i++) {
		let profile = JSON.parse(utility.readJson('data/profiles/' + i + '/character.json'));

		if (profile.data[1].Info.Nickname == info.nickname) {
			return true;
		}
	}

	return false;
}

function changeNickname(info) {
	let tmpList = getCharacterData();

	// check if the nickname exists
	if (nicknameExist) {
		return '{"err":225, "errmsg":"this nickname is already in use", "data":null}';
	}

	// change nickname
	tmpList.data[1].Info.Nickname = info.nickname;
	tmpList.data[1].Info.LowerNickname = info.nickname.toLowerCase();

	setCharacterData(tmpList);
	return '{"err":0, "errmsg":null, "data":{"status":0, "nicknamechangedate":' + Math.floor(new Date() / 1000) + '}}';
}

function changeVoice(info) {
	let tmpList = getCharacterData();

	tmpList.data[1].Info.Voice = info.voice;

	setCharacterData(tmpList);
}

function find(info, backendUrl) {
	let profiles = getProfiles();
	let ID = exist(info);

	// profile doesn't exist
	if (ID == -1) {
		return '{"err":206, "errmsg":"account not found", "data":null}';
	}

	setActiveID(ID);
	return '{"err":0, "errmsg":null, "data":{"token":"token_1337", "aid":1337, "lang":"en", "languages":{"en":"English"}, "ndaFree":true, "queued":false, "taxonomy":341, "activeProfileId":"5c71b934354682353958e984", "backend":{"Trading":"' + backendUrl + '", "Messaging":"' + backendUrl + '", "Main":"' + backendUrl + '", "RagFair":"' + backendUrl + '"}, "utc_time":1337, "totalInGame":0, "twitchEventMember":false}}';;
}

function remove(info) {
	let profiles = getProfiles();
	let ID = exist(info);
	
	// check if profile exists
	if (ID == -1) {
		console.log("Profile does not exists");
		return;
	}

	// remove profile directory
	utility.removeDir('./data/profiles/' + ID);

	// remove profile
	for (let i in profiles) {
		if (profiles[i].id == ID) {
			profiles.splice(i, 1);
		}
	}

	setProfiles(profiles);
	console.log("Profile " + ID + " deleted");
	return;
}

function create(info) {
	let profiles = getProfiles();
	let ID = findUnusedID();

	// check if profile exists
	if (exist(info) != -1) {
		console.log("Profile already exists");
		return;
	}

	// add the profile
	profiles.push({"email": info.email, "password": info.pass, "id": ID, "timestamp": 0, "online": false});
	setProfiles(profiles);

	// create profile directory
	let profileDir = './data/profiles/' + ID + '/';

	fs.mkdirSync(profileDir);
	fs.copyFileSync('./data/profiles/default/purchases.json', profileDir + 'purchases.json', function(err) {});
	fs.copyFileSync('./data/profiles/default/character.json', profileDir + 'character.json', function(err) {});

	// create the character
	let character = JSON.parse(utility.readJson(profileDir + 'character.json'));
	let characterSide = {};

	switch (info.side) {
		case "bear":
			characterSide = JSON.parse(utility.readJson('./data/profiles/default/bear.json'));
			break;

		case "usec":
			characterSide = JSON.parse(utility.readJson('./data/profiles/default/usec.json'));
			break;

		default:
			console.log("Invalid side");
			remove(info);
			return;
	}

	character.data.push(characterSide.data[0]);
	utility.writeJson(profileDir + 'character.json', character);

	console.log("Profile " + ID + " created");
	return;
}

function changeEmail(info) {
	let profiles = getProfiles();

	for (let profile of profiles) {
		if (info.email == profile.email && info.pass == profile.password) {
			profile.email = info.newEmail;
			setProfiles(profiles);
			console.log("Profile " + profile.id + " changed mail");

			return;
		}
	}

	console.log("Profile not found");
}

function changePassword(info) {
	let profiles = getProfiles();

	for (let profile of profiles) {
		if (info.email == profile.email && info.pass == profile.password) {
			profile.password = info.newPass;
			setProfiles(profiles);
			console.log("Profile " + profile.id + " changed mail");

			return;
		}
	}

	console.log("Profile not found");
}

module.exports.getCharacterData = getCharacterData;
module.exports.setCharacterData = setCharacterData;
module.exports.getPurchasesData = getPurchasesData;
module.exports.setPurchasesData = setPurchasesData;
module.exports.getStashType = getStashType;
module.exports.getActiveID = getActiveID;
module.exports.setActiveID = setActiveID;
module.exports.changeNickname = changeNickname;
module.exports.changeVoice = changeVoice;
module.exports.find = find;
module.exports.delete = remove;
module.exports.create = create;
module.exports.changeEmail = changeEmail;
module.exports.changePassword = changePassword;