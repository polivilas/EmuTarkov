"use strict";

var settings = require('./settings.js');
var launcher = require('./launcher.js');
var server = require('./server.js');

// launcher logic
if (settings.getLauncherSettings().enabled) {
	launcher.start();
}

// server logic
if (settings.getServerSettings().enabled) {
	server.start();
}