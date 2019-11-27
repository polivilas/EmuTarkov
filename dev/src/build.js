const childProcess = require('child_process');
const UPX = require('upx')('best')
const { compile } = require('nexe');

// compile the application
console.log(">>>STARTING BUILD...");
compile({
	input: 'scripts/main.js',
    	output: 'JustEmuTarkov-Server',
	build: false,
	ico: 'dev/res/icon.ico'
}).then(function(err) {
	console.log(">>>Changing ICON...");
	childProcess.execFile('dev/bin/ResourceHacker.exe', [
		'-open',
		'JustEmuTarkov-Server.exe',
		'-save',
		'JustEmuTarkov-Server.exe',
		'-action',
		'addoverwrite',
		'-res',
		'dev/res/icon.ico',
		'-mask',
		'ICONGROUP,MAINICON,'
	], function(err) {
		console.log(">>>Compressing Executable...");
		UPX('JustEmuTarkov-Server.exe')
		.output('JustEmuTarkov-Server_compressed.exe')
		.start().then(function(stats) {
			console.log(stats);
		}).catch(function (err) {
			console.log(err);
		});
	});
});