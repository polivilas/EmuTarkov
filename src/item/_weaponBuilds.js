"use strict";

require('../libs.js');

function getUserBuildsPath() {
	let filepath = filepaths.user.profiles.userbuilds;
	return filepath.replace("__REPLACEME__", constants.getActiveID());
}

function SaveBuild(tmpList, body) {
	item.resetOutput();
	delete body.Action;
	body.id = utility.generateNewItemId();	

	let output = item.getOutput();
	let savedBuilds = json.parse(json.read(getUserBuildsPath()));
	let ids = [];
	let dupes = {};
	let newParents = {}

	for (let itemBuild of body.items) {
		ids.push(itemBuild._id);
	}
	
	for (let x in ids) {
		dupes[x] = (dupes[x] || 0) + 1;
	}

	for (let itemBuilds in body.items) {
		if (dupes[body.items[itemBuilds]._id] > 1 ) {
			let newId = utility.generateNewItemId();
			
			logger.logWarning("id is duplicated ! " + body.items[itemBuilds]._id);
			newParents[newId] = {"oldId" : body.items[itemBuilds]._id, "slot" : body.items[itemBuilds].slotId};
			body.items[itemBuilds]._id = newId;
		}

		if (dupes[body.items[itemBuilds].parentId] > 1) {
			loggr.logWarning("an item has a duplicated parent ! : " + body.items[itemBuilds].parentId);

			for (let newId in newParents) {
				if (body.items[itemBuilds].parentId == newParents[newId].oldId) {
					body.items[itemBuilds].parentId = newId;
				}

				delete newParents[newId];
			}
		}
	}

	savedBuilds.data.push(body);
	json.write(getUserBuildsPath(), savedBuilds);
	output.data.builds.push(body);
    return output;
}

function RemoveBuild(tmpList, body) {
	let savedBuilds = json.parse(json.read(getUserBuildsPath()));
	
	for (let wBuild of savedBuilds.data) {
		if (wBuild.id == body.id) {
			for (let i = 0; i < savedBuilds.data.length; i++) { 
		   		if (savedBuilds.data[i] === wBuild) {
			    	savedBuilds.data.splice(i--, 1);
			  	}
			}
		}
	}

	json.write(getUserBuildsPath(), savedBuilds);
	item.resetOutput();
    return item.getOutput();
}

module.exports.getUserBuildsPath = getUserBuildsPath;
module.exports.saveBuild = SaveBuild;
module.exports.removeBuild = RemoveBuild;