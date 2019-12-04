"use strict";

require('../libs.js');

function getUserBuildsPath() {
	let userBuildsPath = fileRoutes.profiles.userBuilds;
	return userBuildsPath.replace("replaceme", constants.getActiveID());
}

function SaveBuild(tmpList, body) {
	delete body.Action;
	body.id = utility.generateNewItemId();	

	let savedBuilds = JSON.parse(utility.readJson(getUserBuildsPath()));

	savedBuilds.data.push(body);
	utility.writeJson(getUserBuildsPath(), savedBuilds);
	item.resetOutput();

	let output = item.getOutput();
	
	output.data.builds.push(body)
    return output;
}

function RemoveBuild(tmpList, body) {
	let savedBuilds = JSON.parse(utility.readJson(getUserBuildsPath()));
	
	for (let wBuild of savedBuilds.data) {
		if (wBuild.id == body.id) {
			for (let i = 0; i < savedBuilds.data.length; i++) { 
		   		if (savedBuilds.data[i] === wBuild) {
			    	savedBuilds.data.splice(i--, 1);
			  	}
			}
		}
	}

	utility.writeJson(getUserBuildsPath(), savedBuilds);
	item.resetOutput();
    return item.getOutput();
}

module.exports.getUserBuildsPath = getUserBuildsPath;
module.exports.saveBuild = SaveBuild;
module.exports.removeBuild = RemoveBuild;