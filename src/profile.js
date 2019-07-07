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

function setCharacterData(data) {
	utility.writeJson(getPath() + 'character.json', data);
}

function getPurchasesData() {
	return JSON.parse(utility.readJson(getPath() + 'purchases.json'));
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
module.exports.getActiveID = getActiveID;
module.exports.setActiveID = setActiveID;
module.exports.changeNickname = changeNickname;
module.exports.changeVoice = changeVoice;
module.exports.find = find;
module.exports.delete = remove;
module.exports.create = create;
module.exports.changeEmail = changeEmail;
module.exports.changePassword = changePassword;