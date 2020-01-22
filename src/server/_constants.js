"use strict";
let server = '1.0.0';
let game = 'Not Started';
const saveLootBuffers = {};

function serverVersion() {
    return server;
}

function gameVersion() {
    return game;
}

function setVersion(version) {
    game = version;
}

function putInBuffer(sessionID, data, bufLength) {
    sessionID -= 0; //cast to integer

    if (saveLootBuffers[sessionID] === undefined || saveLootBuffers[sessionID].allocated !== bufLength) {
        saveLootBuffers[sessionID] = {
            written: 0,
            allocated: bufLength,
            buffer: Buffer.alloc(bufLength)
        };
    }

    let buf = saveLootBuffers[sessionID];
    
    data.copy(buf.buffer, buf.written, 0);
    buf.written += data.length;
    return buf.written === buf.allocated;
}

function getFromBuffer(sessionID) {
    sessionID -= 0; //cast to integer
    return saveLootBuffers[sessionID].buffer;
}

module.exports.serverVersion = serverVersion;
module.exports.gameVersion = gameVersion;
module.exports.setVersion = setVersion;
module.exports.putInBuffer = putInBuffer;
module.exports.getFromBuffer = getFromBuffer;