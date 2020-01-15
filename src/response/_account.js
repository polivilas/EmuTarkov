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

function find(sessionID) {
    for (let account of account) {
        if (account.id === sessionID) {
            return account;
        }
    }

    return undefined;
}

function isWiped(sessionID) {
    let account = find(sessionID);

    if (account !== typeof "undefined") {
        return account.wipe;
    }

    return true;
}

function setWipe(sessionID, state) {
    for (let account in accounts) {
        if (accounts[account].id === sessionID) {
            accounts[account].wipe = state;
        }
    }

    save();
}

function exists(info) {
    for (let account of accounts) {
        if (info.email === account.email && info.password === account.password) {
            return account.id;
        }
    }

    return 0;
}

function getReservedNickname(sessionID) {
    let account = find(sessionID);

    if (account !== typeof "undefined") {
        return account.nickname;
    }

    return "";
}

function isNicknameTaken(info, sessionID) {
    for (let i = 0; i < accounts.length; i++) {
        let account = accounts[i];
        let profile = json.parse(json.read(profile.getPath(sessionID)));

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