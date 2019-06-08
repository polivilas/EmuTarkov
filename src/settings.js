"use strict";

var utility = require('./utility.js');

var data = JSON.parse(utility.readJson("data/settings.json"));

function getEmulationSettings() {
    return data.emulation;
}

function getServerSettings() {
    return data.server;
}

function getAccountSettings() {
    return data.account;
}

function getBotSettings() {
    return data.bots;
}

module.exports.getEmulationSettings = getEmulationSettings;
module.exports.getServerSettings = getServerSettings;
module.exports.getAccountSettings = getAccountSettings;
module.exports.getBotSettings = getBotSettings;