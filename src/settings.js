var settings = JSON.parse(utility.readJson("settings.json"));

function getPort() {
	return settings.server.port;
}

module.exports.getPort = getPort;