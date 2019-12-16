"use strict";

const fs = require('fs');

function createDir(file) {    
    let filePath = file.substr(0, file.lastIndexOf('/'));

    if (!fs.existsSync(filePath)) {
        fs.mkdirSync(filePath, { recursive: true });
    }
}

function stringify(data) {
    return JSON.stringify(data, null, "\t");
}

function parse(string) {
    return JSON.parse(string);
}

function read(file) {
    return (fs.readFileSync(file, 'utf8')).replace(/[\r\n\t]/g, '').replace(/\s\s+/g, '');
}

function write(file, data) {
    createDir(file);
    fs.writeFileSync(file, stringify(data), 'utf8');
}

module.exports.stringify = stringify;
module.exports.parse = parse;
module.exports.read = read;
module.exports.write = write;