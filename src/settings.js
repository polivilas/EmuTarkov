"use strict";

const utility = require('./utility.js');

var data = JSON.parse(utility.readJson("data/config.json"));

function getServerSettings() {
    return data.server;
}

function getLauncherSettings() {
    return data.launcher;
}

function getBotSettings() {
    return data.bots;
}

module.exports.getServerSettings = getServerSettings;
module.exports.getLauncherSettings = getLauncherSettings;
module.exports.getBotSettings = getBotSettings;