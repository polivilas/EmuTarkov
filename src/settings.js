var utility = require('./utility.js');

var settings = JSON.parse(utility.readJson("data/settings.json"));

function getServerSettings() {
    return settings.server;
}

function getAccountSettings() {
    return settings.account;
}

function getBotSettings() {
    return settings.bots;
}

module.exports.getServerSettings = getServerSettings;
module.exports.getAccountSettings = getAccountSettings;
module.exports.getBotSettings = getBotSettings;