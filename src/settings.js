var utility = require('./utility.js');

var data = JSON.parse(utility.readJson("data/settings.json"));

function getEmulateLauncher() {
    return data.emulation.emulateLauncher;
}

function getEmulateServer() {
    return data.emulation.emulateServer;
}

function getPort() {
	return data.server.port;
}

function getEmail() {
    return data.account.email;
}

function getPassword() {
    return data.account.password;
}

function getEnablePmcWar() {
    return data.bots.enablePmcWar;
}

module.exports.getEmulateLauncher = getEmulateLauncher;
module.exports.getEmulateServer = getEmulateServer;
module.exports.getPort = getPort;
module.exports.getEmail = getEmail;
module.exports.getPassword = getPassword;
module.exports.getEnablePmcWar = getEnablePmcWar;