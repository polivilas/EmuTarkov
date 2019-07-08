const fs = require('fs');
const resourceHacker = require('node-resourcehacker');

const { compile } = require('nexe');

// compile the application
compile({
	input: '../src/main.js',
	output: './output/server',
	build: false
});

// set the windows desktop icon
process.env['SOURCE_RESOURCE_HACKER'] =  __dirname + '/res/resource_hacker.zip';

resourceHacker({
    operation: 'addoverwrite',
    input: __dirname + '/output/server.exe',
    output:  __dirname + '/output/server.exe',
    resource:  __dirname + '/res/icon.ico',
    resourceType: 'ICONGROUP',
    resourceName: 'IDR_MAINFRAME',
}, function(err) {});