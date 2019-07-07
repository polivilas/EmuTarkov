"use strict";

var utility = require('./utility.js'); 

var profiles = JSON.parse(utility.readJson("data/profiles/profiles.json"));
var profileID = 0;

function getPath() {
	return 'data/profiles/' + profileID + '/';
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

function findID(info, backendUrl) {
	// find the profile
	for (var profile of profiles) {
		// profile matched
		if (info.email == profile.email && info.pass == profile.password) {
			setActiveID(profile.id);
			return '{"err":0, "errmsg":null, "data":{"token":"token_1337", "aid":1337, "lang":"en", "languages":{"en":"English"}, "ndaFree":true, "queued":false, "taxonomy":341, "activeProfileId":"5c71b934354682353958e984", "backend":{"Trading":"' + backendUrl + '", "Messaging":"' + backendUrl + '", "Main":"' + backendUrl + '", "RagFair":"' + backendUrl + '"}, "utc_time":1337, "totalInGame":0, "twitchEventMember":false}}';;
		}
	}

	// profile doesn't exist
	return '{"err":206, "errmsg":"account not found", "data":null}';
}

function changeNickname(info) {
	var tmpList = getCharacterData();

	// check if the nickname exists
	for (var i = 0; i < profiles.length; i++) {
		var profile = JSON.parse(utility.readJson('data/profiles/' + i + '/character.json'));

		// nickname already exists
		if (profile.data[1].Info.Nickname == info.nickname) {
			return '{"err":225, "errmsg":"this nickname is already in use", "data":null}';
		}
	}

	// change nickname
	tmpList.data[1].Info.Nickname = info.nickname;
	tmpList.data[1].Info.LowerNickname = info.nickname.toLowerCase();

	setCharacterData(tmpList);
	return '{"err":0, "errmsg":null, "data":{"status":0, "nicknamechangedate":' + Math.floor(new Date() / 1000) + '}}';
}

module.exports.getCharacterData = getCharacterData;
module.exports.setCharacterData = setCharacterData;
module.exports.getPurchasesData = getPurchasesData;
module.exports.setPurchasesData = setPurchasesData;
module.exports.getActiveID = getActiveID;
module.exports.setActiveID = setActiveID;
module.exports.findID = findID;
module.exports.changeNickname = changeNickname;