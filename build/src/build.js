const childProcess = require('child_process');

const { compile } = require('nexe');

// compile the application
compile({
	input: '../project/src/main.js',
    output: './out/EmuTarkov-Server',
	build: false
}).then(function(err) {
	// set the icon
	childProcess.execFile('./bin/ResourceHacker.exe', [
		'-open',
		'./out/EmuTarkov-Server.exe',
		'-save',
		'./out/EmuTarkov-Server.exe',
		'-action',
		'addoverwrite',
		'-res',
		'./res/icon.ico',
		'-mask',
		'ICONGROUP,MAINICON,'
	], function(err) {});
});