const childProcess = require('child_process');
const UPX = require('upx')('best') // see options below
const { compile } = require('nexe');

// compile the application
console.log(">>>STARTING BUILD...");
compile({
	input: 'src/main.js',
    output: 'out/JustEmuTarkov-Server',
	build: false,
	ico: 'bin/icon.ico'
}).then(function(err) {
	console.log(">>>Changing ICON...");
	childProcess.execFile('bin/ResourceHacker.exe', [
		'-open',
		'out/JustEmuTarkov-Server.exe',
		'-save',
		'out/JustEmuTarkov-Server.exe',
		'-action',
		'addoverwrite',
		'-res',
		'bin/icon.ico',
		'-mask',
		'ICONGROUP,MAINICON,'
	], function(err) {
		console.log(">>>Compressing Executable...");
		UPX('out/JustEmuTarkov-Server.exe')
		.output('JustEmuTarkov-Server.exe')
		.start().then(function(stats){
			console.log(stats);
		}).catch(function (err) {
			console.log(err);
		});
	});
	
	
});


/*.then(function(err) {
	// set the icon
	childProcess.execFile('bin/ResourceHacker.exe', [
		'-open',
		'out/JustEmuTarkov-Server.exe',
		'-save',
		'out/JustEmuTarkov-Server.exe',
		'-action',
		'addoverwrite',
		'-res',
		'bin/icon.ico',
		'-mask',
		'ICONGROUP,MAINICON,'
	], function(err) {});
});*/