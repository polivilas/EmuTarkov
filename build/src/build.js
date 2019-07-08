const fsext = require('./fsext.js');
const childProcess = require('child_process');

const { compile } = require('nexe');

// create out folder
fsext.createFolder('./out/');

// compile the application
compile({
	input: '../project/src/main.js',
	output: './out/server',
	build: false
}).then(function(err) {
	// set the icon
	childProcess.execFile('./bin/ResourceHacker.exe', [
		'-open',
		'./out/server.exe',
		'-save',
		'./out/server.exe',
		'-action',
		'addoverwrite',
		'-res',
		'./res/icon.ico',
		'-mask',
		'ICONGROUP,MAINICON,'
	], function(err) {});

	// copy data folder
	fsext.copyFolder('../project/data/', './out/');
});