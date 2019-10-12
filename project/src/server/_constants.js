"use strict";
let version = '0.7.5';
let game = 'Not Started';
let ProfileActiveId = 0;

function serverVersion() {
    return version;
}
function gameVersion() {
	return game;
}
function setVersion(setTo) {
	game = setTo;
}
function getActiveID() {
	return ProfileActiveId;
}

function setActiveID(ID) {
	ProfileActiveId = ID ? ID : 0;
}

module.exports.getActiveID = getActiveID;
module.exports.setActiveID = setActiveID;
module.exports.serverVersion = serverVersion;
module.exports.gameVersion = gameVersion;
module.exports.setVersion = setVersion;

