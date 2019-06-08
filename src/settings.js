var utility = require('./utility.js');

var settings = JSON.parse(utility.readJson("data/settings.json"));

function getServerPort() {
	return settings.server.port;
}

function getAccountEmail() {
    return settings.account.email;
}

function getAccountPassword() {
    return settings.account.password;
}

function getBotSettings() {
    return settings.bots;
}

module.exports.getServerPort = getServerPort;
module.exports.getAccountEmail = getAccountEmail;
module.exports.getAccountPassword = getAccountPassword;
module.exports.getBotSettings = getBotSettings;