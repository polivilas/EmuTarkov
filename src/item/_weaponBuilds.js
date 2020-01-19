"use strict";

require('../libs.js');

function getPath(sessionID) {
	let path = filepaths.user.profiles.userbuilds;
	return path.replace("__REPLACEME__", sessionID);
}

function SaveBuild(pmcData, body, sessionID) {
	item.resetOutput();
	delete body.Action;
	body.id = utility.generateNewItemId();	

	let output = item.getOutput();
	let savedBuilds = json.parse(json.read(getPath(sessionID)));

	// replace duplicate ID's
	body.items = itm_hf.replaceIDs(pmcData, body.items, false);
	logger.logWarning("Weapons after ID change");
	logger.logData(body.items);

	savedBuilds.data.push(body);
	json.write(getPath(sessionID), savedBuilds);
	output.data.builds.push(body);
    return output;
}

function RemoveBuild(pmcData, body, sessionID) {
	let savedBuilds = json.parse(json.read(getPath(sessionID)));
	
	for (let wBuild of savedBuilds.data) {
		if (wBuild.id == body.id) {
			for (let i = 0; i < savedBuilds.data.length; i++) { 
		   		if (savedBuilds.data[i] === wBuild) {
			    	savedBuilds.data.splice(i--, 1);
			  	}
			}
		}
	}

	json.write(getPath(sessionID), savedBuilds);
	item.resetOutput();
    return item.getOutput();
}

module.exports.getPath = getPath;
module.exports.saveBuild = SaveBuild;
module.exports.removeBuild = RemoveBuild;