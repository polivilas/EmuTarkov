const fs = require('fs');
const path = require('path');

function createFolder(filepath) {
	if (!fs.existsSync(filepath)) {
		fs.mkdirSync(filepath);
	}
}

function copyFolder(source, target) {
    let files = [];
	let targetFolder = path.join(target, path.basename(source));
    
	// create folder if it doesn't exist    
	createFolder(targetFolder)

    // copy file or folder
    if (fs.lstatSync(source).isDirectory()) {
        files = fs.readdirSync(source);

		for (let file of files) {
			let currentSource = path.join(source, file);
            
			if (fs.lstatSync(currentSource).isDirectory()) {
                copyFolder(currentSource, targetFolder);
            } else {
                fs.copyFileSync(currentSource, targetFolder);
            }
		}
    }
}

module.exports.createFolder = createFolder;
module.exports.copyFolder = copyFolder;