"use strict";

require('../libs.js');

let accounts = [];

function init() {
    accounts = load();
}

function load() {
    return json.parse(json.read(filepaths.user.profiles.list));
}

function save() {
    json.write(filepaths.user.profiles.list, accounts);
}

function findAccount(sessionID) {
    for (let profile of account) {
        if (profile.id === sessionID) {
            return profile;
        }
    }

    return undefined;
}

function isWiped() {
    let profile = findAccount(constants.getActiveID());

    if (profile !== typeof "undefined") {
        return profile.wipe;
    }

    return true;
}

function setWipe(sessionID, state) {
    for (let profile in accounts) {
        if (accounts[profile].id === sessionID) {
            accounts[profile].wipe = state;
        }
    }

    save();
}

function exists(info) {
    for (let profile of accounts) {
        if (info.email === profile.email && info.password === profile.password) {
            return profile.id;
        }
    }

    return 0;
}

function getReservedNickname(sessionID) {
    let profile = findAccount(sessionID);

    if (profile !== typeof "undefined") {
        return profile.nickname;
    }

    return "";
}

function isNicknameTaken(info) {
    for (let i = 0; i < accounts.length; i++) {
        let account = accounts[i];
        let profile = json.parse(json.read(profile.getPath()));

        if (account.nickname === info.nickname || profile.Info.Nickname === info.nickname) {
            return true;
        }
    }

    return false;
}

function findId(data) {
    let buff = Buffer.from(data.token, 'base64');
    let text = buff.toString('ascii');
    let info = json.parse(text);
    let sessionID = exists(info);

    constants.setActiveID(sessionID);
    return json.stringify({profileId: sessionID});
}

function getPath(sessionID) {
    return "user/profiles/" + sessionID + "/";
}

module.exports.init = init;
module.exports.exists = exists;
module.exports.isWiped = isWiped;
module.exports.setWipe = setWipe;
module.exports.getReservedNickname = getReservedNickname;
module.exports.isNicknameTaken = isNicknameTaken;
module.exports.findId = findId;
module.exports.getPath = getPath;