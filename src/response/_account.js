"use strict";

require('../libs.js');

let accounts = [];

function init() {
    accounts = json.parse(json.read(filepaths.user.profiles.list));
}

function save() {
    json.write(filepaths.user.profiles.list, accounts);
}

function find(sessionID) {
    for (let account of accounts) {
        if (account.id == sessionID) {
            console.log(account.id == sessionID);
            return account;
        }
    }

    return undefined;
}

function isWiped(sessionID) {
    let account = find(sessionID);
    return account.wipe;
}

function setWipe(sessionID, state) {
    for (let account of accounts) {
        if (account.id === sessionID) {
            account.wipe = state;
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
    return account.nickname;
}

function isNicknameTaken(info) {
    for (let i = 0; i < accounts.length; i++) {
        let account = accounts[i];
        let profile = profile_f.getPmcData(account.id);

        if (account.nickname === info.nickname || profile.Info.Nickname === info.nickname) {
            return true;
        }
    }

    return false;
}

function findID(data) {
    let buff = Buffer.from(data.token, 'base64');
    let text = buff.toString('ascii');
    let info = json.parse(text);
    let sessionID = exists(info);

    return json.stringify({profileId: sessionID});
}

function getPath(sessionID) {
    return "user/profiles/" + sessionID + "/";
}

module.exports.init = init;
module.exports.find = find;
module.exports.exists = exists;
module.exports.isWiped = isWiped;
module.exports.setWipe = setWipe;
module.exports.getReservedNickname = getReservedNickname;
module.exports.isNicknameTaken = isNicknameTaken;
module.exports.findID = findID;
module.exports.getPath = getPath;