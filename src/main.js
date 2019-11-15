"use strict";
let start0 = new Date();
console.log('[Starting Application]  %dms', new Date() - start0);

require("./libs.js");

console.info('[Library Loaded]  %dms', new Date() - start0);


function setTitle(title) {
	process.stdout.write(
		String.fromCharCode(27) + ']0;' + title + String.fromCharCode(7)
	);
}

	setTitle("JustEmuTarkov Server " + constants.serverVersion());
	logger.start();
	server.start();
	trader.load();
process.on('uncaughtException', (error, promise) => {
    console.log("[ERROR] Server: " + constants.serverVersion(), "red");
    console.log("[ERROR] Game: " + ((constants.gameVersion() !== "")?constants.gameVersion():"Not Launched"), "red");
    console.log("[ERROR] Trace:", "red");
    console.log(error, "cyan");
    console.log(error);
    console.log("[LOGGING] Finished Dumping Error", "cyan");
});
