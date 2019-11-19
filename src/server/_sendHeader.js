"use strict";

require('../libs.js');

function sendJson(resp, output) {
    resp.writeHead(200, "OK", {
		'Content-Type': 'text/plain', 
		'content-encoding' : 'deflate', 
		'Set-Cookie' : 'PHPSESSID=' + constants.getActiveID()
		});

    zlib.deflate(output, function (err, buf) {
        resp.end(buf);
    });
    //resp.end(output);
}
function sendMapData(resp, output) {
    resp.writeHead(200, "OK", {'Content-Type': 'text/plain'});
    resp.end(output);
}

function sendTrueJson(resp, output) {
    resp.writeHead(200, "OK", {
        'Content-Type': 'application/json',
        'content-encoding': 'deflate'
    });

    zlib.deflate(output, function (err, buf) {
        resp.end(buf);
    });
}

function sendHTML(resp, output) {
    resp.writeHead(200, "OK", {'Content-Type': 'text/html'});
    resp.end(output);
}

function sendImage(resp, file) {
	var mime = {
		html: 'text/html',
		txt: 'text/plain',
		css: 'text/css',
		gif: 'image/gif',
		jpg: 'image/jpeg',
		png: 'image/png',
		svg: 'image/svg+xml',
		js: 'application/javascript'
	};
	let pathSlic = file.split("/");
    let type = mime[pathSlic[pathSlic.length -1].split(".")[1]] || 'text/plain';
    let fileStream = fs.createReadStream(file);

    // send file
    fileStream.on('open', function () {
        resp.setHeader('Content-Type', type);
        fileStream.pipe(resp);
    });
}

module.exports.sendJson = sendJson;
module.exports.sendTrueJson = sendTrueJson;
module.exports.sendMapData = sendMapData;
module.exports.sendHTML = sendHTML;
module.exports.sendImage = sendImage;
