"use strict";

require('./libs.js');

let fileStream = undefined;

function start() {
    let file = utility.getTime() + "_" + utility.getDate() + ".log";
    let folder = "user/logs/";
    let filepath = path.join(folder, file);

    // create log folder
    if (!fs.existsSync(folder)) {
        fs.mkdirSync(folder);
    }

    // create log file
    if (!fs.existsSync(filepath)) {
        fs.writeFileSync(filepath);
    }

    fileStream = fs.createWriteStream(filepath, {flags: 'w'});
}

// colorData[0] -> front, colorData[1] -> back
const colorData = [
    {
        black: "\x1b[30m",
        red: "\x1b[31m",
        green: "\x1b[32m",
        yellow: "\x1b[33m",
        blue: "\x1b[34m",
        magenta: "\x1b[35m",
        cyan: "\x1b[36m",
        white: "\x1b[37m"
    },
    {
        black: "\x1b[40m",
        red: "\x1b[41m",
        green: "\x1b[42m",
        yellow: "\x1b[43m",
        blue: "\x1b[44m",
        magenta: "\x1b[45m",
        cyan: "\x1b[46m",
        white: "\x1b[47m"
    }
];

function log(data, colorFront = "", colorBack = "") {
    let setColors = "";
    let colors = ["", ""];

    if (typeof colorFront !== "") {
        colors[0] = colorFront;
    }

    if (typeof colorBack !== "") {
        colors[1] = colorBack;
    }

    // properly set colorString indicator
    for (let i = 0; i < colors.length; i++) {
        if (((i === 0) || (i === 1)) && colors[i] !== "") {
            setColors += colorData[i][colors[i]];
        }
    }

    // print data
    if (colors[0] !== "" || colors[1] !== "") {
        console.log(setColors + data + "\x1b[0m");
    } else {
        console.log(data);
    }

    // write the logged data to the file
    if (typeof fileStream !== "undefined") {
        fileStream.write(util.format(data) + '\n');
    }
};

function logError(text) {
    log("[ERROR] " + text, "white", "red");
}

function logWarning(text) {
    log("[WARNING] " + text, "white", "yellow");
}

function logSuccess(text) {
    log("[SUCCESS] " + text, "white", "green");
}

function logInfo(text) {
    log("[INFO] " + text, "cyan", "black");
}

function logRequest(text) {
    log(text, "cyan", "black");
}

function logData(data) {
    log(data);
}

function logIp(text) {
    log(text, "green", "black");
}

module.exports.start = start;
module.exports.logError = logError;
module.exports.logWarning = logWarning;
module.exports.logSuccess = logSuccess;
module.exports.logInfo = logInfo;
module.exports.logRequest = logRequest;
module.exports.logData = logData;
module.exports.logIp = logIp;