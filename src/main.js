"use strict";

var settings = require('./settings.js');
var login = require('./login.js');
var server = require('./server.js');

// launcher logic
if (settings.getEmulateLauncher()) {
	login.start();
}

// server logic
if (settings.getEmulateServer()) {
	server.start();
}