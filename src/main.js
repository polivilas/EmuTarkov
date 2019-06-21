"use strict";

var settings = require('./settings.js');
var launcher = require('./launcher.js');
var server = require('./server.js');

var emulationSettings = settings.getEmulationSettings();

// launcher logic
if (emulationSettings.emulateLauncher) {
	launcher.start();
}

// server logic
if (emulationSettings.emulateServer) {
	server.start();
}