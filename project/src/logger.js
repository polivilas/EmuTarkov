const fs = require('fs');
const path = require('path');
const util = require('util');
const utility = require('./utility.js');

var fileStream = undefined;

printf = console.log; 
console.log = function(data, colorBack, colorFront) {
	let setColors = "";

	// check if we need to generate colors
    if (typeof colorBack !== "undefined" && typeof colorFront !== "undefined") {
		let colors = [colorBack.toLowerCase(), colorFront.toLowerCase()];

		for (let i = 0; i < colors.length; i++) {
			switch (colors[i]) {
				case 'black':
					setColors += "\x1b[40m";
					break;

				case 'red':
					setColors += "\x1b[41m";
					break;

				case 'green':
					setColors += "\x1b[42m";
					break;

				case 'yellow':
					setColors += "\x1b[43m";
					break;

				case 'blue':
					setColors += "\x1b[44m";
					break;

				case 'magenta':
					setColors += "\x1b[45m";
					break;

				case 'cyan':
					setColors += "\x1b[46m";
					break;

				case 'white':
					setColors += "\x1b[47m";
					break;
            
				default:
					break;
			}
		}
	}
	
	// show the data to the console
	if (typeof colorBack !== "undefined" && typeof colorFront !== "undefined") {
		printf(setColors + data + "\x1b[0m";);
	} else {
		printf(data);
	}

	// write the logged data to the file
	fileStream.write(util.format(data) + '\n');
}

function separator() {
    let s = '';

    for (let i = 0; i < process.stdout.columns - 1; i++) {
        s = s + '-';
	}
    
	console.log(s, "red", "black");
}

function centerConsole(text){
	let count = (process.stdout.columns - text.length) / 2;
	let space = '';

	for (let i = 0; i < count; i++) {
        space += ' ';
	}
	
	return space + text;
}

function start() {
	let file = utility.getTime() + "_" + utility.getDate() + ".log";
	let folder = "./logs";
	let filepath = path.join(folder, file);

	if (!fs.existsSync(folder)) {
		fs.mkdirSync(folder);
	}

	if (!fs.existsSync(filepath)) {
		fs.writeFileSync(filepath);
	}

	fileStream = fs.createWriteStream(filepath, {flags : 'w'});
}

module.exports.start = start;