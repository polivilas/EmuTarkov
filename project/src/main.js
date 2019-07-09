"use strict";

const logger = require('./logger.js');
const server = require('./server.js');

function setTitle(title) {
    process.stdout.write(
        String.fromCharCode(27) + ']0;' + title + String.fromCharCode(7)
    );
}

setTitle("Just EmuTarkov Server");
logger.start();
server.start();