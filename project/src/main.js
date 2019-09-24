"use strict";
const logger = require('./logger.js');
const server = require('./server.js');
const trader = require('./trader.js');
function setTitle(title) {
    process.stdout.write(
        String.fromCharCode(27) + ']0;' + title + String.fromCharCode(7)
    );
}
setTitle("JustEmuTarkov Server " + server.version());
logger.start();
server.start();
trader.load();

