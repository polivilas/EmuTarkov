"use strict";

require('../libs.js');

function getPath(sessionID) {
	let path = filepaths.user.profiles.userbuilds;
	return path.replace("__REPLACEME__", sessionID);
}

function SaveBuild(tmpList, body, sessionID) {
	item.resetOutput();
	delete body.Action;
	body.id = utility.generateNewItemId();	

	let output = item.getOutput();
	let savedBuilds = json.parse(json.read(getPath(sessionID)));
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
	json.write(getPath(sessionID), savedBuilds);
	output.data.builds.push(body);
    return output;
}

function RemoveBuild(tmpList, body, sessionID) {
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