var utility = require('./utility.js');

var settings = JSON.parse(utility.readJson("settings.json"));

function getPort() {
	return settings.server.port;
}

function getEmail() {
    return settings.account.email;
}

function getPassword() {
    return settings.account.password;
}

module.exports.getPort = getPort;