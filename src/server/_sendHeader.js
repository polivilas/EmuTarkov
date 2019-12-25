"use strict";

require('../libs.js');

const mime = {
	html: 'text/html',
	txt: 'text/plain',
	css: 'text/css',
	gif: 'image/gif',
	jpg: 'image/jpeg',
	png: 'image/png',
	svg: 'image/svg+xml',
	js: 'application/javascript',
	json: 'application/json'
};

function sendZlibJson(resp, output) {
    resp.writeHead(200, "OK", {
		'Content-Type': mime['json'], 
		'content-encoding' : 'deflate', 
		'Set-Cookie' : 'PHPSESSID=' + constants.getActiveID()
	});

    zlib.deflate(output, function (err, buf) {
        resp.end(buf);
    });
}

function sendTextJson(resp, output) {
    resp.writeHead(200, "OK", {'Content-Type': mime['json']});
    resp.end(output);
}

function sendHTML(resp, output) {
    resp.writeHead(200, "OK", {'Content-Type': mime['html']});
    resp.end(output);
}

function sendFile(resp, file) {
    let pathSlic = file.split("/");
    let type = mime[pathSlic[pathSlic.length -1].split(".")[1]] || mime['txt'];
    let fileStream = fs.createReadStream(file);

    fileStream.on('open', function () {
        resp.setHeader('Content-Type', type);
        fileStream.pipe(resp);
    });
}

module.exports.sendZlibJson = sendZlibJson;
module.exports.sendTextJson = sendTextJson;
module.exports.sendHTML = sendHTML;
module.exports.sendFile = sendFile;
