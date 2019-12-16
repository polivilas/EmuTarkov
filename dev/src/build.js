const childProcess = require('child_process');
const UPX = require('upx')('best')
const { compile } = require('nexe');

// compile the application
console.log(">>>STARTING BUILD...");
compile({
	input: 'src/main.js',
    	output: 'EmuTarkov-Server',
	build: false,
	ico: 'dev/res/icon.ico'
}).then(function(err) {
	console.log(">>>Changing ICON...");
	childProcess.execFile('dev/bin/ResourceHacker.exe', [
		'-open',
		'EmuTarkov-Server.exe',
		'-save',
		'EmuTarkov-Server.exe',
		'-action',
		'addoverwrite',
		'-res',
		'dev/res/icon.ico',
		'-mask',
		'ICONGROUP,MAINICON,'
	], function(err) {
		console.log(">>>Compressing Executable...");
		UPX('EmuTarkov-Server.exe')
		.output('EmuTarkov-Server-Compressed.exe')
		.start().then(function(stats) {
			console.log(stats);
		}).catch(function (err) {
			console.log(err);
		});
	});
});