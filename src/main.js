"use strict";

var settings = require('./settings.js');
var login = require('./login.js');
var server = require('./server.js');

var emulationSettings = settings.getEmulationSettings();

// launcher logic
if (emulationSettings.emulateLauncher) {
	login.start();
}

// server logic
if (emulationSettings.emulateServer) {
	server.start();
}