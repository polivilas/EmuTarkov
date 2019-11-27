"use strict";

require('../libs.js');

function SaveBuild(tmpList, body)
{
	delete body.Action;
	body.id = utility.generateNewItemId();

	let savedBuilds = JSON.parse(utility.readJson(fileRoutes.others.userBuilds));
	
	savedBuilds.data.push(body);
	utility.writeJson(fileRoutes.others.userBuilds,savedBuilds);
	item.resetOutput();

	let output = item.getOutput();
	
	output.data.builds.push(body)
    return output;
}


function RemoveBuild(tmpList, body) {
	let savedBuilds = JSON.parse(utility.readJson(fileRoutes.others.userBuilds));
	
	for (let wBuild of savedBuilds.data) {
		if (wBuild.id == body.id) {
			for (let i = 0; i < savedBuilds.data.length; i++) { 
		   		if (savedBuilds.data[i] === wBuild) {
			    	savedBuilds.data.splice(i, 1); 
			    	i--;
			  	}
			}
		}
	}

	utility.writeJson(fileRoutes.others.userBuilds, savedBuilds);
	item.resetOutput();
    return item.getOutput();
}

module.exports.saveBuild = SaveBuild;
module.exports.removeBuild = RemoveBuild;