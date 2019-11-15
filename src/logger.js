
require('./libs.js');

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

var fileStream = undefined;

printf = console.log;
console.log = function (data, colorFront, colorBack, isLog = false) {
    let setColors = "";
    let colors = ["", ""];
    if (typeof colorFront !== "undefined")
        colors[0] = colorFront;
    if (typeof colorBack !== "undefined")
        colors[1] = colorBack;

    // properly set colorString indicator
    for (let i = 0; i < colors.length; i++) {
        if (((i === 0) || (i === 1)) && colors[i] !== "") {
            setColors += colorData[i][colors[i]];
        }
    }

    // print data
    if (colors[0] !== "" || colors[1] !== "") {
        printf(setColors + data + "\x1b[0m");
    } else {
        printf(data);
    }

    // write the logged data to the file - if debugmode on write everything
    if (isLog === false || settings.debug.debugMode === true)
        if (typeof fileStream !== "undefined")
            fileStream.write(util.format(data) + '\n');
};

function separator() {
    let s = '';
    for (let i = 0; i < process.stdout.columns - 1; i++) {
        s = s + '-';
    }
    console.log(s);
}

function center(text) {
    let count = (process.stdout.columns - text.length) / 2;
    let space = '';
    for (let i = 0; i < count; i++) {
        space += ' ';
    }
    return space + text + space;
}

function start() {
    let file = utility.getTime() + "_" + utility.getDate() + ".log";
    let folder = "./errorLogs";
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

/* TODO unused for now TheMaoci
process.on('uncaughtException',
    function (err) {
        const timeout = 5; // extra time. auto-close on crash... -> 1 = 1sec
        console.log("SERVER CRASHED!");
        console.log("[ERROR] - Start displaying", "red");
        console.log(err);
        console.log("[ERROR] - Ends displaying", "red");
        console.log("[INFO] - opening error logs folder", "red");
        if (settings.debug.disableLogsDisplayer === false) {
            require('child_process').exec('start "" "' + __dirname.substring(0, __dirname.length - 3) + 'errorLogs"');
        }

        setTimeout
        (
            function () {
                console.log("[KILLING PROCESS]", "red", "", true);
                return process.kill(process.pid);
            },
            timeout * 1000
        );

    }
);*/

module.exports.separator = separator;
module.exports.center = center;
module.exports.start = start;