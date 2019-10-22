"use strict";

require('../libs.js');

function sendJson(resp, output) {
    resp.writeHead(200, "OK", {
        'Content-Type': 'text/plain',
        'content-encoding': 'deflate',
        'Set-Cookie': 'PHPSESSID=' + constants.getActiveID()
    });

    zlib.deflate(output, function (err, buf) {
        resp.end(buf);
    });
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
    let fileStream = fs.createReadStream(file);

    // send file
    fileStream.on('open', function () {
        resp.setHeader('Content-Type', 'image/png');
        fileStream.pipe(resp);
    });
}

module.exports.sendJson = sendJson;
module.exports.sendTrueJson = sendTrueJson;
module.exports.sendHTML = sendHTML;
module.exports.sendImage = sendImage;
