"use strict";

require('../libs.js');

function SaveBuild(tmpList,body)
{
	delete body.Action;
	body.id = utility.generateNewItemId();
	var savedBuilds = JSON.parse( utility.readJson('database/configs/userBuilds.json') );
	savedBuilds.data.push(body);
	utility.writeJson('database/configs/userBuilds.json',savedBuilds);

	item.resetOutput();
	let output = item.getOutput();
	output.data.builds.push(body)
    return output; //YES ! 
}


function RemoveBuild(tmpList,body)
{
	
	var savedBuilds = JSON.parse( utility.readJson('database/configs/userBuilds.json') );
	
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
	utility.writeJson('database/configs/userBuilds.json',savedBuilds);

	item.resetOutput();
    return item.getOutput();
}


module.exports.saveBuild = SaveBuild;
module.exports.removeBuild = RemoveBuild;