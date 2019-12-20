"use strict";

process.stdout.setEncoding('utf8');

let isFirstLaunch = "first";
let start0 = new Date();

console.log('[Starting Application]','','');

require("./libs.js")(isFirstLaunch, start0);

ended_at = new Date() - start0;
console.info('[Library Loaded]  %dms', ended_at);
console.info("[Mods loaded] ", settings.mods.list);
process.stdout.write('\x1Bc');

process.stdout.write(String.fromCharCode(27) + ']0;' + "JustEmuTarkov Server " + constants.serverVersion() + String.fromCharCode(7));

logger.start();
server.start();

process.on('uncaughtException', (error, promise) => {
    console.log("[ERROR] Server: " + constants.serverVersion(), "red");
    console.log("[ERROR] Game: " + ((constants.gameVersion() !== "")?constants.gameVersion():"Not Launched"), "red");
    console.log("[ERROR] Trace:", "red");
    console.log(error, "cyan");
    console.log(error);
    console.log("[LOGGING] Finished Dumping Error", "cyan");
});