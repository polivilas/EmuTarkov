"use strict";

require('../libs.js');

function SaveBuild(tmpList,body)
{
	delete body.Action;
	body.id = utility.generateNewItemId();
	var savedBuilds = JSON.parse( utility.readJson('data/configs/userBuilds.json') );
	savedBuilds.data.push(body);
	utility.writeJson('data/configs/userBuilds.json',savedBuilds);

	return "OK"; //need to respond something specific here, otherwise game stuck
}

function RemoveBuild(tmpList,body)
{
	
	var savedBuilds = JSON.parse( utility.readJson('data/configs/userBuilds.json') );
	
	for(var wBuild of savedBuilds.data)
	{
		if(wBuild.id == body.id)
		{
			for( var i = 0; i < savedBuilds.data.length; i++)
			{ 
		   		if ( savedBuilds.data[i] === wBuild) 
		   		{
			    	savedBuilds.data.splice(i, 1); 
			    	i--;
			  	}
			}
		}
	}
	utility.writeJson('data/configs/userBuilds.json',savedBuilds);

	item.resetOutput();
    return item.getOutput();
}


module.exports.saveBuild = SaveBuild;
module.exports.removeBuild = RemoveBuild;