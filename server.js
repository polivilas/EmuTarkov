var http = require('http');
var fs = require('fs');
var zlib = require('zlib');
var regedit = require('regedit');
var server = http.createServer();
var FinalOutput = "";
var PORT = 1337;
var assort = new RegExp('/client/trading/api/getTraderAssort/([a-z0-9])+', 'i');
var prices = new RegExp('/client/trading/api/getUserAssortPrice/([a-z0-9])+', 'i');
var getTrader = new RegExp('/client/trading/api/getTrader/', 'i');
var traderImg = new RegExp('/files/([a-z0-9/\.jpng])+', 'i');
var content = new RegExp('/uploads/([a-z0-9/\.jpng_])+', 'i');
var pushNotifier = new RegExp('/push/notifier/get/', 'i');
var ItemOutput = "";
var tmpItem = {};
var tmpSize = {};
var toDo = [];
var stashX = 10; // fix for your stash size
var stashY = 66; // ^ if you edited it ofc
function ReadJson(file) {
	return (fs.readFileSync(file, 'utf8')).replace(/[\r\n\t]/g, '');
}

var itemJSON = JSON.parse(ReadJson('items.json'));
itemJSON = itemJSON.data;
function getRandomInt(min, max) {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min + 1)) + min;
} // stolen off StackOverflow

function getRandomIntEx(max) 
{
	return Math.floor(Math.random() * Math.floor(max));
}

function GenItemID(){
	return Math.floor(new Date() / 1000) + getRandomInt(0, 999999999).toString(); 
}

function getItem(template)
{
	for(var itm in itemJSON) {
		if (itemJSON[itm]._id && itemJSON[itm]._id == template) {
			var item = itemJSON[itm];
			return [true, item];
		}
	}
	return [false, {}];
}
function getSize(itemtpl, itemID, location)
{
	toDo = [itemID];
	tmpItem = getItem(itemtpl);
	if (!tmpItem[0])
	{
		console.log("SHITS FUCKED GETSIZE1", itemID);
		return; 
	} else {
		tmpItem = tmpItem[1];
	}
	var outX = 0, outY = 0, outL = 0, outR = 0, outU = 0, outD = 0, tmpL = 0, tmpR = 0, tmpU = 0, tmpD = 0;
	outX = tmpItem._props.Width;
	outY = tmpItem._props.Height;
	while(true){
		if(toDo[0] != undefined){
			for (var tmpKey in location) {
				if (location[tmpKey].parentId && location[tmpKey].parentId == toDo[0]) {
					toDo.push(location[tmpKey]._id);
					
					tmpItem = getItem(location[tmpKey]._tpl);
					if (!tmpItem[0])
					{
						console.log("SHITS FUCKED GETSIZE2", tmpItem, location[tmpKey]._tpl);
						return;
					} else {
						tmpItem = tmpItem[1];
					}
					if(tmpItem._props.ExtraSizeLeft != undefined && tmpItem._props.ExtraSizeLeft > tmpL){
						tmpL = tmpItem._props.ExtraSizeLeft; 
					}
					if(tmpItem._props.ExtraSizeRight != undefined && tmpItem._props.ExtraSizeRight > tmpR){
						tmpR = tmpItem._props.ExtraSizeRight; 
					}
					if(tmpItem._props.ExtraSizeUp != undefined && tmpItem._props.ExtraSizeUp > tmpU){
						tmpU = tmpItem._props.ExtraSizeUp; 
					}
					if(tmpItem._props.ExtraSizeDown != undefined && tmpItem._props.ExtraSizeDown > tmpD){
						tmpD = tmpItem._props.ExtraSizeDown; 
					}
				}
			}
			outL += tmpL; outR += tmpR; outU += tmpU; outD += tmpD;
			tmpL = 0; tmpR = 0; tmpU = 0; tmpD = 0;
			toDo.splice(0, 1);
			continue;
		}
		break;
	}
	return [outX, outY, outL, outR, outU, outD];
}

function generateBots(databots) //Welcome to the Scav Randomizer :) 
{
	var generatedBots = [];
	var bots_number = 0;
	var presets = 
	{
		Head:["wild_head_1","wild_head_2","wild_head_3","wild_dealmaker_head","bear_head_1","usec_head_1","head_boss_killa","bear_head"],
		Body:["wild_body","wild_body_1","wild_body_2","wild_body_3","wild_dealmaker_body","wild_security_body_1","wild_security_body_2","top_boss_killa","top_wild_scavelite"],
		Feet:["wild_feet","wild_feet_1","wild_feet_2","wild_dealmaker_feet","wild_security_feet_1","pant_boss_killa","pants_wild_scavelite"],
		pmcBotVoices:["Bear_1","Bear_2","Usec_1","Usec_2","Usec_3"], 

		filter_mosin:["5ae08f0a5acfc408fb1398a1","5bfd297f0db834001a669119"],
		Grenades:["5710c24ad2720bc3458b45a3","58d3db5386f77426186285a0","5448be9a4bdc2dfd2f8b456a","5a0c27731526d80618476ac4"],
		Backpacks:["5c0e774286f77468413cc5b2","544a5cde4bdc2d39388b456b","56e335e4d2720b6c058b456d","56e33680d2720be2748b4576","5ab8f04f86f774585f4237d8","5c0e805e86f774683f3dd637","545cdae64bdc2d39198b4568","56e33634d2720bd8058b456b","5ab8ebf186f7742d8b372e80","56e294cdd2720b603a8b4575","59e763f286f7742ee57895da","5ab8ee7786f7742d8f33f0b9","5b44c6ae86f7742d1627baea","5ca20d5986f774331e7c9602"],
		Rigs:["59e7643b86f7742cbf2c109a","5b44cad286f77402a54ae7e5","5c0e446786f7742013381639","5c0e6a1586f77404597b4965","544a5caa4bdc2d1a388b4568","5929a2a086f7744f4b234d43","5c0e722886f7740458316a57","5c0e746986f7741453628fe5","592c2d1a86f7746dbe2af32a","5c0e3eb886f7742015526062","5b44c8ea86f7742d1627baf1","5ab8dab586f77441cd04f2a2","572b7adb24597762ae139821","5c0e9f2c86f77432297fe0a3","5648a69d4bdc2ded0b8b457b","5ab8dced86f774646209ec87","5ca20abf86f77418567a43f2"],
		Armors:["5c0e5bab86f77461f55ed1f3","5648a7494bdc2d9d488b4583","59e7635f86f7742cbf2c1095","5ab8e4ed86f7742d8e50c7fa","5b44d22286f774172b0c9de8","5c0e625a86f7742d77340f62","5c0e655586f774045612eeb2","5b44cf1486f77431723e3d05","5b44d0de86f774503d30cba8","545cdb794bdc2d3a198b456a","5ab8e79e86f7742d8b372e78","5c0e541586f7747fa54205c9","5c0e57ba86f7747fa141986d","5c0e5edb86f77461f55ed1f7","5c0e51be86f774598e797894","5c0e53c886f7747fa54205c7","5b44cd8b86f774503d30cba2","5ca2151486f774244a3b8d30","5ca21c6986f77479963115a7"],
		Facecovers:["59e7715586f7742ee5789605","5b4325355acfc40019478126","5ab8f4ff86f77431c60d91ba","5ab8f85d86f7745cd93a1cf5","5b432f3d5acfc4704b4a1dfb","5bd0716d86f774171822ef4b","5bd073a586f7747e6f135799","5bd06f5d86f77427101ad47c","5bd071d786f7747e707b93a3","5b432b6c5acfc4001a599bf0","5ab8f39486f7745cd93a1cca","5b432b2f5acfc4771e1c6622","5b432c305acfc40019478128","5c1a1e3f2e221602b66cc4c2","572b7fa524597762b747ce82","572b7f1624597762ae139822","5b4326435acfc433000ed01d"],
		Headwear:["59e7708286f7742cbd762753","5aa7cfc0e5b5b00015693143","5aa7e454e5b5b0214e506fa2","5b432d215acfc4771e1c6624","5c066ef40db834001966a595","5c06c6a80db834001b735491","5c17a7ed2e2216152142459c","572b7d8524597762b472f9d1","5aa7e4a4e5b5b000137b76f2","5b4329f05acfc47a86086aa1","5b40e3f35acfc40016388218","5b43271c5acfc432ff4dce65","59e770f986f7742cbe3164ef","59ef13ca86f77445fd0e2483","5aa2b87de5b5b00016327c25","5aa2b8d7e5b5b00014028f4a","5ac8d6885acfc400180ae7b0","572b7fa124597762b472f9d2","5a7c4850e899ef00150be885","5b4327aa5acfc400175496e0","5c0d2727d174af02a012cf58","5c0e874186f7745dc7616606","5645bc214bdc2d363b8b4571","5aa2b9ede5b5b000137b758b","5bd073c986f7747f627e796c","5ab8f20c86f7745cdb629fb2","5aa2a7e8e5b5b00016327c16","5aa2ba19e5b5b00014028f4e","5c091a4e0db834001d5addc8","5aa2ba46e5b5b000137b758d","5aa7d03ae5b5b00016327db5","5aa7d193e5b5b000171d063f","5c08f87c0db8340019124324","59e7711e86f7746cae05fbe1","5a154d5cfcdbcb001a3b00da","5a43943586f77416ad2f06e2","5a16bb52fcdbcb001a3b00dc","5aa2b89be5b5b0001569311f","5aa7e276e5b5b000171d0647","5b4329075acfc400153b78ff","5b40e1525acfc4771e1c6611","5b40e5e25acfc4001a599bea","5a43957686f7742a2c2f11b0","5b40e2bc5acfc40016388216","5b40e4035acfc47a87740943","5b40e61f5acfc4001a599bec","5ca20ee186f774799474abc2"],
		Eyewear:["5b432be65acfc433000ed01f","5aa2b986e5b5b00014028f4c","5aa2b923e5b5b000137b7589","59e770b986f7742cbd762754","5aa2b9aee5b5b00015693121","5c1a1cc52e221602b3136e3d","5c0d32fcd174af02a1659c75","557ff21e4bdc2d89578b4586"],
		knives:["57e26ea924597715ca604a09","5bc9c1e2d4351e00367fbcf0","5bffdc370db834001d23eca8","54491bb74bdc2d09088b4567","57e26fc7245977162a14b800","5bead2e00db834001c062938","5c0116620db834001808a647","5c07df7f0db834001b73588a","5c0126f40db834002a125382","5bffe7930db834001b734a39","5c012ffc0db834001d23f03f","5c010e350db83400232feec7","57cd379a24597778e7682ecf","5bffdd7e0db834001b734a1a"],
		pistols:["5a17f98cfcdbcb0980087290","5b1fa9b25acfc40018633c01","56d59856d2720bd8418b456a","5b3b713c5acfc4330140bd8d","5a7ae0c351dfba0017554310","576a581d2459771e7b1bc4f1","59f98b4986f7746f546d2cef","571a12c42459771f627b58a0","5abccb7dd8ce87001773e277","5448bd6b4bdc2dfc2f8b4569","579204f224597773d619e051","56e0598dd2720bb5668b45a6",]
	}
	
	var weaponPresets = JSON.parse(ReadJson("bots/presetExtended.json")); //load all weapons
	databots.conditions.forEach(function(params) // loop to generate all scavs 
	{
		for (var i = 1; i <= params.Limit; i++) //generate as many as the game request
		{
			var BotBase = JSON.parse(ReadJson("bots/bot_base.json")); //load a dummy bot with nothing
			var internalId = getRandomIntEx(10000); //generate a scavSeed

			//filling basic infos
			BotBase._id  = "scavNumber" + internalId;
			BotBase.Info.Nickname = "Scav Number " + internalId;
			BotBase.Info.LowerNickname = "Scav Number " + internalId;

			if(params.Role == "pmcBot"){ BotBase.Info.Voice = presets.pmcBotVoices[getRandomIntEx(presets.pmcBotVoices.length)]; } //if its a raider, give him a noice voice
			else{ BotBase.Info.Voice = "Scav_" + getRandomInt(1,6); } //or just set a simple scav voice

			BotBase.Info.Settings.Role = params.Role; 
			BotBase.Info.Settings.BotDifficulty = params.Difficulty;

			//define a skin for the scav : 
			BotBase.Customization.Head.path = "assets/content/characters/character/prefabs/"+presets.Head[getRandomIntEx(presets.Head.length)] +".bundle";
			BotBase.Customization.Body.path = "assets/content/characters/character/prefabs/"+presets.Body[getRandomIntEx(presets.Body.length)] +".bundle";
			BotBase.Customization.Feet.path = "assets/content/characters/character/prefabs/"+presets.Feet[getRandomIntEx(presets.Feet.length)] +".bundle";

			//randomize skills (because why not?)
			BotBase.Skills.Common.forEach(function(skill)
			{
				skill.Progress = getRandomIntEx(5000);
				skill.MaxAchieved = skill.Progress;
			});

			//choose randomly a weapon from preset.json before filling items
			var Weapon = weaponPresets.data[getRandomIntEx(weaponPresets.data.length)];

			//check if its a pistol or a primary..
			Weapon.isPistol = false;
			presets.pistols.forEach(function(pistoltpl)
			{   
				if(pistoltpl == Weapon._items[0]._tpl){ Weapon.isPistol = true; }
			});

			//Add a vest or rig on the scav (can be an armored vest)
			var tempw = {};
			tempw._id = "TacticalVestScav"+ internalId;
			tempw._tpl = presets.Rigs[getRandomIntEx(presets.Rigs.length)];
			tempw.parentId = "5c6687d65e9d882c8841f0fd";
			tempw.slotId = "TacticalVest";  
			BotBase.Inventory.items.push(tempw);

			//fill your dummy bot with the random selected preset weapon and its mods
			Weapon._items.forEach(function(item)
			{
				if(item._id == Weapon._parent)//if its the weapon itself then add it differently
				{
					if( Weapon.isPistol == false )
					{   
						var tempw = {};
						tempw._id = item._id;
						tempw._tpl = item._tpl;
						tempw.parentId = "5c6687d65e9d882c8841f0fd";
						tempw.slotId = "FirstPrimaryWeapon";  
						BotBase.Inventory.items.push(tempw);
					}
					if( Weapon.isPistol == true )
					{   
						var tempw = {};
						tempw._id = item._id;
						tempw._tpl = item._tpl;
						tempw.parentId = "5c6687d65e9d882c8841f0fd";
						tempw.slotId = "Holster";  
						BotBase.Inventory.items.push(tempw);
					}
				}
				else //add mods, vital parts, etcc
				{   
					//randomize magazine
					if(item.slotId == "mod_magazine" )
					{   
						var compatiblesmags = {};
						for(var slot of itemJSON[Weapon._items[0]._tpl]._props.Slots)
						{
							if (slot._name == "mod_magazine")
							{
								compatiblesmags = slot._props.filters[0].Filter;    //array of compatible mags for this weapon
								break; 
							} 
						}

						var ammo_filter = itemJSON[Weapon._items[0]._tpl]._props.Chambers[0]._props.filters[0].Filter //array of compatible ammos 

						var isMosin = false;
						presets.filter_mosin.forEach(function(someMosinId)
						{
							if(Weapon._items[0]._tpl == someMosinId){isMosin = true;}   //check if the weapon given is a mosin
						});
						
						if(isMosin == false)
						{                       
							//add a magazine
							var tempw = {};
							tempw._id = "MagazineWeaponScav"+ internalId;
							tempw._tpl = compatiblesmags[getRandomIntEx(compatiblesmags.length)]; //randomize the magazine of the weapon
							var selectedmag = tempw._tpl //store this value 
							tempw.parentId = Weapon._items[0]._id; //put this mag on the weapon
							tempw.slotId = "mod_magazine";
							BotBase.Inventory.items.push(tempw);

							//then fill ammo of randomized mag
							var tempw = {};
							tempw._id = "AmmoMagazine1Scav"+ internalId;
							tempw._tpl = ammo_filter[getRandomIntEx(ammo_filter.length)]; //randomize ammo inside the mag
							tempw.parentId = "MagazineWeaponScav"+ internalId; 
							tempw.slotId = "cartridges";
							tempw.upd = {"StackObjectsCount": itemJSON[selectedmag]._props.Cartridges[0]._max_count }; //fill the magazine
							BotBase.Inventory.items.push(tempw);
						}
						else 
						{
							BotBase.Inventory.items.push(item);
							//add a magazine
							var tempw = {};
							tempw._id = "AmmoMagazine1Scav"+ internalId;
							tempw._tpl = ammo_filter[getRandomIntEx(ammo_filter.length)]; //randomize ammo inside the mag
							tempw.parentId = item._id ;
							tempw.slotId = "cartridges";
							tempw.upd = {"StackObjectsCount": itemJSON[item._tpl]._props.Cartridges[0]._max_count }; //fill the magazine
							BotBase.Inventory.items.push(tempw);
						}
						
						//add magazine in the vest
						var tempw = {};
						tempw._id = "magazine2VestScav"+ internalId;
						tempw._tpl = compatiblesmags[getRandomIntEx(compatiblesmags.length)]; //randomize this magazine too
						var selectedmag = tempw._tpl; //store the selected magazine template for ammo
						tempw.parentId = "TacticalVestScav"+ internalId;
						tempw.slotId = "2";
						tempw.location =  {"x": 0,"y": 0,"r": 0};
						BotBase.Inventory.items.push(tempw);

						//add ammo in the magazine INSIDE THE VEST-RIG
						var tempw = {};
						tempw._id = "AmmoMagazine2Scav"+ internalId;
						tempw._tpl = ammo_filter[getRandomIntEx(ammo_filter.length)];
						tempw.parentId = "magazine2VestScav"+ internalId;
						tempw.slotId = "cartridges";
						tempw.upd = {"StackObjectsCount": itemJSON[selectedmag]._props.Cartridges[0]._max_count };
						BotBase.Inventory.items.push(tempw);

						//add another magazine in the vest
						var tempw = {};
						tempw._id = "magazine3VestScav"+ internalId;
						tempw._tpl = compatiblesmags[getRandomIntEx(compatiblesmags.length)]; //randomize this magazine too
						var selectedmag = tempw._tpl; //store the selected magazine template for ammo
						tempw.parentId = "TacticalVestScav"+ internalId;
						tempw.slotId = "3";
						tempw.location =  {"x": 0,"y": 0,"r": 0};
						BotBase.Inventory.items.push(tempw);

						var tempw = {};
						tempw._id = "AmmoMagazine3Scav"+ internalId;
						tempw._tpl = ammo_filter[getRandomIntEx(ammo_filter.length)];
						tempw.parentId = "magazine3VestScav"+ internalId;
						tempw.slotId = "cartridges";
						tempw.upd = {"StackObjectsCount": itemJSON[selectedmag]._props.Cartridges[0]._max_count };
						BotBase.Inventory.items.push(tempw);

						//add a stack of ammo for moslings and sks
						var tempw = {};
						tempw._id = "AmmoFree2Scav"+ internalId;
						tempw._tpl = ammo_filter[getRandomIntEx(ammo_filter.length)];
						tempw.parentId = "TacticalVestScav"+ internalId;
						tempw.slotId = "1";
						tempw.upd = {"StackObjectsCount": getRandomInt(10,30) };
						BotBase.Inventory.items.push(tempw);

					}
					else
					{
						BotBase.Inventory.items.push(item); //add mods and vital parts
					}
				}
			});

			//add a knife
			var tempw = {};
			tempw._id = "ScabbardScav"+ internalId;
			tempw._tpl= presets.knives[getRandomIntEx(presets.knives.length)];  //yes exactly like above, randomize everything
			tempw.parentId = "5c6687d65e9d882c8841f0fd";
			tempw.slotId = "Scabbard";  
			BotBase.Inventory.items.push(tempw);

			if(getRandomIntEx(100) <= 30) //30% chance to add some glasses
			{
				var tempw = {};
				tempw._id = "EyeWearScav"+ internalId;
				tempw._tpl= presets.Eyewear[getRandomIntEx(presets.Eyewear.length)];
				tempw.parentId = "5c6687d65e9d882c8841f0fd";
				tempw.slotId = "Eyewear";  
				BotBase.Inventory.items.push(tempw);
			}

			if(getRandomIntEx(100) <= 40)
			{
				var tempw = {};
				tempw._id = "FaceCoverScav"+ internalId;
				tempw._tpl= presets.Facecovers[getRandomIntEx(presets.Facecovers.length)];
				tempw.parentId = "5c6687d65e9d882c8841f0fd";
				tempw.slotId = "FaceCover";  
				BotBase.Inventory.items.push(tempw);
			}
			
			if(getRandomIntEx(100) <= 40 ) 
			{
				var tempw = {};
				tempw._id = "HeadWearScav"+ internalId;
				tempw._tpl= presets.Headwear[getRandomIntEx(presets.Headwear.length)];
				tempw.parentId = "5c6687d65e9d882c8841f0fd";
				tempw.slotId = "Headwear";  
				BotBase.Inventory.items.push(tempw);
			}

			if(getRandomIntEx(100) <= 25) 
			{
				var tempw = {};
				tempw._id = "BackpackScav"+ internalId;
				tempw._tpl= presets.Backpacks[getRandomIntEx(presets.Backpacks.length)];
				tempw.parentId = "5c6687d65e9d882c8841f0fd";
				tempw.slotId = "Backpack";  
				BotBase.Inventory.items.push(tempw);

				if(getRandomIntEx(100) <= 50) //chance to add something inside
				{
					//to be implemented...
				}
			}   
			if(getRandomIntEx(100) <=  25) 
			{
				var tempw = {};
				tempw._id = "ArmorVestScav"+ internalId;
				tempw._tpl= presets.Armors[getRandomIntEx(presets.Armors.length)];
				tempw.parentId = "5c6687d65e9d882c8841f0fd";
				tempw.slotId = "ArmorVest";
				var durabl = getRandomIntEx(45);
				tempw.upd = {"Repairable": {"Durability": durabl }};
				BotBase.Inventory.items.push(tempw);
			}

			if(getRandomIntEx(100) <= 10 ) 
			{
				var tempw = {};
				tempw._id = "PocketItemScav"+ internalId;
				tempw._tpl= presets.Grenades[getRandomIntEx(presets.Grenades.length)];
				tempw.parentId = "5c6687d65e9d882c8841f121";
				tempw.slotId = "pocket1"; 
				tempw.location =  {"x": 0,"y": 0,"r": 0}; 
				BotBase.Inventory.items.push(tempw);
			}

			bots_number++; //just a counter :)
			generatedBots.push(BotBase); //don't forget to add your nice scav with all other
			
		}
	});
	
	fs.writeFileSync('bots/bot_generate_v2.json', JSON.stringify(generatedBots, null, "\t"), 'utf8'); //just a log file ... 
	console.log("generated " +  bots_number + " scavs possibilities");
	return generatedBots;
}

function RagfairOffers(request)
{
	/* // forecast/provide flea market api management when i will find that famous search.json
	request = JSON.parse(request)
	if(request.handbookId != "")
	{
		var handbook = JSON.parse( ReadJson('templates.json') );
		handbook.data.Categories.forEach(function(categ)
		{
			if(categ.Id == request.handbookId)
			{
				//console.log(categ);
			}
		});
	}

	if( request.linkedSearchId != "" )
	{
		itemJSON[request.linkedSearchId]._props.Slots.forEach(function(ItemSlot)
		{   
			ItemSlot._props.filters.forEach(function(itemSlotFilter)
			{   
				itemSlotFilter.Filter.forEach(function(mod)
				{
					//console.log( itemJSON[mod]._name ); 
				})
				
			});
			
		});
		
	}*/
}

function handleMoving(body) {
	console.log(body);
	var tmpList = JSON.parse(ReadJson('list.json'));
	switch(body.Action) {

		case "QuestAccept":
			tmpList.data[1].Quests.push({"qid": body.qid.toString(), "startTime": 1337, "status": 2}); // statuses seem as follow - 1 - not accepted | 2 - accepted | 3 - failed | 4 - completed
			fs.writeFileSync('list.json', JSON.stringify(tmpList, null, "\t"), 'utf8');
			FinalOutput = "OK";
			break;
		case "Move":
			
			for (var key in tmpList.data[1].Inventory.items) {
				if (tmpList.data[1].Inventory.items[key]._id && tmpList.data[1].Inventory.items[key]._id == body.item) {
					tmpList.data[1].Inventory.items[key].parentId = body.to.id;
					tmpList.data[1].Inventory.items[key].slotId = body.to.container;
					if (body.to.location) {
						tmpList.data[1].Inventory.items[key].location = body.to.location;
					} else {
						if (tmpList.data[1].Inventory.items[key].location) {
							tmpList.data[1].Inventory.items[key].location = {"x": 0, "y": 0, "r": 0};
						}
					}
					fs.writeFileSync('list.json', JSON.stringify(tmpList, null, "\t"), 'utf8');
					FinalOutput = "OK";
					break;
				}
			}
			break;
		case "Remove":
				toDo = [body.item];
				while(true){
					if(toDo[0] != undefined){
						while(true){ // needed else iterator may decide to jump over stuff
							var tmpEmpty = "yes";
							for (var tmpKey in tmpList.data[1].Inventory.items) {	
								if ((tmpList.data[1].Inventory.items[tmpKey].parentId && tmpList.data[1].Inventory.items[tmpKey].parentId == toDo[0]) || (tmpList.data[1].Inventory.items[tmpKey]._id && tmpList.data[1].Inventory.items[tmpKey]._id == toDo[0])) {
									ItemOutput.data.items.del.push({"_id": tmpList.data[1].Inventory.items[tmpKey]._id});
									toDo.push(tmpList.data[1].Inventory.items[tmpKey]._id);
									tmpList.data[1].Inventory.items.splice(tmpKey, 1);
									tmpEmpty = "no";
								}
							}
							if(tmpEmpty == "yes"){
								break;
							};
						}
						toDo.splice(0, 1);
						continue;
					}
					break;
				}
				fs.writeFileSync('list.json', JSON.stringify(tmpList, null, "\t"), 'utf8');
				FinalOutput = "OK";
			break;
		case "Split":
			for (var key in tmpList.data[1].Inventory.items) {
				if (tmpList.data[1].Inventory.items[key]._id && tmpList.data[1].Inventory.items[key]._id == body.item) {
					tmpList.data[1].Inventory.items[key].upd.StackObjectsCount -= body.count;
					var newItem = GenItemID(); 
					ItemOutput.data.items.new.push({"_id": newItem, "_tpl": tmpList.data[1].Inventory.items[key]._tpl, "parentId": body.container.id, "slotId": body.container.container, "location": body.container.location, "upd": {"StackObjectsCount": body.count}});
					tmpList.data[1].Inventory.items.push({"_id": newItem, "_tpl": tmpList.data[1].Inventory.items[key]._tpl, "parentId": body.container.id, "slotId": body.container.container, "location": body.container.location, "upd": {"StackObjectsCount": body.count}});
					fs.writeFileSync('list.json', JSON.stringify(tmpList, null, "\t"), 'utf8');
					FinalOutput = "OK";
					break;
				}
			}
			break;
		case "Merge":
			for (var key in tmpList.data[1].Inventory.items) {
				if (tmpList.data[1].Inventory.items[key]._id && tmpList.data[1].Inventory.items[key]._id == body.with) {
					for (var key2 in tmpList.data[1].Inventory.items) {
						if (tmpList.data[1].Inventory.items[key2]._id && tmpList.data[1].Inventory.items[key2]._id == body.item) {
							tmpList.data[1].Inventory.items[key].upd.StackObjectsCount = (tmpList.data[1].Inventory.items[key].upd.StackObjectsCount ? tmpList.data[1].Inventory.items[key].upd.StackObjectsCount : 1) + (tmpList.data[1].Inventory.items[key2].upd.StackObjectsCount ? tmpList.data[1].Inventory.items[key2].upd.StackObjectsCount : 1);
							ItemOutput.data.items.del.push({"_id": tmpList.data[1].Inventory.items[key2]._id});
							tmpList.data[1].Inventory.items.splice(key2, 1);
							fs.writeFileSync('list.json', JSON.stringify(tmpList, null, "\t"), 'utf8');
							FinalOutput = "OK";
							break;
						}
					}
				}
			}
			break;
		case "TradingConfirm":
			if(body.type == "buy_from_trader") {
				var tmpTrader = JSON.parse(ReadJson('assort/' + body.tid.replace(/[^a-zA-Z0-9]/g, '') + '.json'));
				for (var key in tmpTrader.data.items) {
					if (tmpTrader.data.items[key]._id && tmpTrader.data.items[key]._id == body.item_id) {
						var Stash2D = Array(stashY).fill(0).map(x => Array(stashX).fill(0));
						for (var key2 in tmpList.data[1].Inventory.items) {
							if(tmpList.data[1].Inventory.items[key2].parentId == "5c71b934354682353958ea35" && tmpList.data[1].Inventory.items[key2].location != undefined) { // hideout
								tmpItem = getItem(tmpList.data[1].Inventory.items[key2]._tpl);
								if (!tmpItem[0])
								{
									console.log("SHITS FUCKED");
									return;
								} else {
									tmpItem = tmpItem[1];
								}
								tmpSize = getSize(tmpList.data[1].Inventory.items[key2]._tpl,tmpList.data[1].Inventory.items[key2]._id, tmpList.data[1].Inventory.items);
								//			x			L				r
								var iW = tmpSize[0] + tmpSize[2] + tmpSize[3];
								//			y			u				d
								var iH = tmpSize[1] + tmpSize[4] + tmpSize[5];
								var fH = (tmpList.data[1].Inventory.items[key2].location.rotation == "Vertical" ? iW : iH);
								var fW = (tmpList.data[1].Inventory.items[key2].location.rotation == "Vertical" ? iH : iW);
								for (var x = 0; x < fH; x++) {
									Stash2D[tmpList.data[1].Inventory.items[key2].location.y + x].fill(1, tmpList.data[1].Inventory.items[key2].location.x, tmpList.data[1].Inventory.items[key2].location.x + fW);
								}
							}
						}
						var tmpSizeX = 0; var tmpSizeY = 0;
						tmpItem = getItem(tmpTrader.data.items[key]._tpl);
						if (!tmpItem[0])
						{
							console.log("SHITS FUCKED BUY_FROM_TRADER");
							return;
						} else {
							tmpItem = tmpItem[1];
						}
						tmpSize = getSize(tmpTrader.data.items[key]._tpl,tmpTrader.data.items[key]._id, tmpTrader.data.items);
						tmpSizeX = tmpSize[0] + tmpSize[2] + tmpSize[3];
						tmpSizeY = tmpSize[1] + tmpSize[4] + tmpSize[5];
						console.log(tmpSizeX, tmpSizeY);
						var badSlot = "no";
						console.log(Stash2D);
						for (var y = 0; y < stashY; y++) {
							for (var x = 0; x < stashX; x++) {
								badSlot = "no";
								for (var itemY = 0; itemY < tmpSizeY; itemY++) {
									for (var itemX = 0; itemX < tmpSizeX; itemX++) {
										if(Stash2D[y + itemY][x + itemX] != 0){
											badSlot = "yes";
											break;
										}
									}
									if(badSlot == "yes"){
										break;
									}
								}
								if(badSlot == "no"){
									var newItem = GenItemID();
									ItemOutput.data.items.new.push({"_id": newItem, "_tpl": tmpTrader.data.items[key]._tpl, "parentId": "5c71b934354682353958ea35", "slotId": "hideout", "location": {"x": x, "y": y, "r": 0}, "upd": {"StackObjectsCount": body.count}});
									tmpList.data[1].Inventory.items.push({"_id": newItem, "_tpl": tmpTrader.data.items[key]._tpl, "parentId": "5c71b934354682353958ea35", "slotId": "hideout", "location": {"x": x, "y": y, "r": 0}, "upd": {"StackObjectsCount": body.count}});
									toDo = [[tmpTrader.data.items[key]._id, newItem]];
									while(true){
										if(toDo[0] != undefined){
											for (var tmpKey in tmpTrader.data.items) {
												if (tmpTrader.data.items[tmpKey].parentId && tmpTrader.data.items[tmpKey].parentId == toDo[0][0]) {
													newItem = GenItemID();
													ItemOutput.data.items.new.push({"_id": newItem, "_tpl": tmpTrader.data.items[tmpKey]._tpl, "parentId": toDo[0][1], "slotId": tmpTrader.data.items[tmpKey].slotId, "location": {"x": x, "y": y, "r": 0}, "upd": {"StackObjectsCount": body.count}});
													tmpList.data[1].Inventory.items.push({"_id": newItem, "_tpl": tmpTrader.data.items[tmpKey]._tpl, "parentId": toDo[0][1], "slotId": tmpTrader.data.items[tmpKey].slotId, "location": {"x": x, "y": y, "r": 0}, "upd": {"StackObjectsCount": body.count}});
													toDo.push([tmpTrader.data.items[tmpKey]._id, newItem]);
												}
											}
											toDo.splice(0, 1);
											continue;
										}
										break;
									}
									fs.writeFileSync('list.json', JSON.stringify(tmpList, null, "\t"), 'utf8');
									FinalOutput = "OK";
									return;
								}
							}
						}
						break;
					}
				}
			}
			break;
		case "Fold":
			for (var key in tmpList.data[1].Inventory.items) {
				if (tmpList.data[1].Inventory.items[key]._id && tmpList.data[1].Inventory.items[key]._id == body.item) {
					tmpList.data[1].Inventory.items[key].upd.Foldable = {"Folded": body.value};
					fs.writeFileSync('list.json', JSON.stringify(tmpList, null, "\t"), 'utf8');
					FinalOutput = "OK";
					break;
				}
			}
			break;
		case "Toggle":
			for (var key in tmpList.data[1].Inventory.items) {
				if (tmpList.data[1].Inventory.items[key]._id && tmpList.data[1].Inventory.items[key]._id == body.item) {
					tmpList.data[1].Inventory.items[key].upd.Togglable = {"On": body.value};
					fs.writeFileSync('list.json', JSON.stringify(tmpList, null, "\t"), 'utf8');
					FinalOutput = "OK";
					break;
				}
			}
			break;
		default:
			console.log("UNHANDLED ACTION");
			break;
	}
}
function handleRequest(req, body, url) {
	var info = JSON.parse("{}");
	if (body != "") {
		try {
			info = JSON.parse(body);
		} catch(err) {
			console.error(err);
		}
	}
	console.log(url + " with data " + body);
	
	// handle special cases
	if (url.match(assort)) {
		FinalOutput = ReadJson("assort/" + url.substring(36).replace(/[^a-zA-Z0-9_]/g, '') + ".json");
		return;
	}
	if (url.match(prices)) {
		FinalOutput = ReadJson("prices/" + url.substring(46).replace(/[^a-zA-Z0-9_]/g, '') + ".json"); // thats some budget ass shit
		return;
	}
	if (url.match(getTrader)) {
		console.log(url.substring(30));
		FinalOutput = '{"err":0, "errmsg":null, "data":{"_id":"' + url.substring(30) + '", "working":true, "name":"ez", "surname":"ez", "nickname":"ez", "location":"", "avatar":"/files/trader/avatar/59b91ca086f77469a81232e4.jpg", "balance_rub":80000000, "balance_dol":80000000, "balance_eur":80000000, "display":true, "discount":1337, "discount_end":0, "buyer_up":false, "currency":"RUB", "supply_next_time":1551040000, "repair":{"availability":true, "quality":"1.2", "excluded_id_list":[], "excluded_category":[], "currency":"5449016a4bdc2d6f028b456f", "currency_coefficient":1, "price_rate":0}, "insurance":{"availability":true, "min_payment":0, "min_return_hour":24, "max_return_hour":36, "max_storage_time":72, "excluded_category":[]}, "gridHeight":1000, "loyalty":{"currentLevel":1337, "currentStanding":1337, "currentSalesSum":1337, "loyaltyLevels":{"0":{"minLevel":1, "minSalesSum":0, "minStanding":0}, "1":{"minLevel":1, "minSalesSum":1, "minStanding":1}, "2":{"minLevel":1, "minSalesSum":1, "minStanding":1}, "3":{"minLevel":1, "minSalesSum":1, "minStanding":1}}}, "sell_category":[]}}';
		return;
	}
	if (url.match(traderImg) || url.match(content)) {
		FinalOutput = "DEAD";
		return;
	}
	if (url.match(pushNotifier)) {
		FinalOutput = '{"err":0, "errmsg":null, "data":[]}';
		return;
	}


	switch(url) {
		case "/":
			FinalOutput = 'EFT backend emulator for Escape From Tarkov version 0.11.2.2680 by polivilas @ UnKnoWnCheaTs.me';
			break;
		case "/client/friend/list":
			FinalOutput = '{"err":0, "errmsg":null, "data":{"Friends":[], "Ignore":[], "InIgnoreList":[]}}';
			break;
		case "/client/game/profile/items/moving":
			for (var a = 0; a < info.data.length; a++) {
				handleMoving(info.data[a]);
			}
			if(FinalOutput == "OK") {
				FinalOutput = JSON.stringify(ItemOutput);
			}
			break;
		case "/client/mail/dialog/list":
			FinalOutput = '{"err":0, "errmsg":null, "data":[]}';
			break;
		case "/client/friend/request/list/outbox":
		case "/client/friend/request/list/inbox":
			FinalOutput = '{"err":0, "errmsg":null, "data":[]}';
			break;
		case "/client/languages":
			FinalOutput = '{"err":0, "errmsg":null, "data":[{"ShortName":"en", "Name":"English"}, {"ShortName":"ru", "Name":"Русский"}], "crc":0}';
			break;
		case "/client/menu/locale/en":
		case "/client/menu/locale/ru":
			FinalOutput = '{"err":0, "errmsg":null, "data":{"menu":{"NEXT":"NEXT", "Escape from Tarkov":"ESCAPE FROM TARKOV", "Servers are currently at full capacity":"Servers are currently at full capacity", "EXIT":"EXIT", "REMEMBER ACCOUNT":"REMEMBER ACCOUNT", "AUTHORIZATION":"AUTHORIZATION", "Profile data loading...":"Profile data loading...", "{0} Beta version":"{0} Beta version | EmuTarkov", "DOWN: ":"DOWN: ", "LEFT: ":"LEFT: ", "RIGHT: ":"RIGHT: "}}, "crc":0}';
			break;
		case "/client/game/version/validate":
			FinalOutput = '{"err":0, "errmsg":null, "data":null}';
			break;
		case "/client/game/login":
			FinalOutput = '{"err":0, "errmsg":null, "data":{"token":"token_1337", "aid":1337, "lang":"en", "languages":{"en":"English"}, "ndaFree":false, "queued":false, "taxonomy":341, "activeProfileId":"5c71b934354682353958e984", "backend":{"Trading":"http://localhost:1337", "Messaging":"http://localhost:1337", "Main":"http://localhost:1337", "RagFair":"http://localhost:1337"}, "utc_time":1337, "totalInGame":0, "twitchEventMember":false}}';
			break;
		case "/client/items":
			FinalOutput = ReadJson('items.json');
			break;
		case "/client/globals":
			FinalOutput = ReadJson('globals.json');
			break;
		case "/client/game/profile/list":
			FinalOutput = ReadJson('list.json');
			break;
		case "/client/game/profile/select":
			FinalOutput = '{"err":0, "errmsg":null, "data":{"status":"ok", "notifier":{"server":"localhost:1337", "channel_id":"f194bcedc0890f22db37a00dbd7414d2afba981eef61008159a74a29d5fee1cf"}}}';
			break;
		case "/client/profile/status":
			FinalOutput = '{"err":0, "errmsg":null, "data":[{"profileid":"5c71b934354682353958e983", "status":"Free", "sid":"", "ip":"", "port":0}, {"profileid":"5c71b934354682353958e984", "status":"Free", "sid":"", "ip":"", "port":0}]}';
			break;
		case "/client/game/keepalive":
			FinalOutput = '{"err":0, "errmsg":null, "data":null}';
			break;
		case "/client/weather":
			FinalOutput = '{"err":0, "errmsg":null, "data":{"weather":{"timestamp":' + Math.floor(new Date() / 1000) + ', "cloud":-0.475, "wind_speed":2, "wind_direction":3, "wind_gustiness":0.081, "rain":1, "rain_intensity":0, "fog":0.002, "temp":14, "pressure":763, "date":"2019-02-24", "time":"2019-02-24 19:15:02"}, "date":"2019-02-24", "time":"21:02:30", "acceleration":7}}';
			break;
		case "/client/locale/en":
		case "/client/locale/En":
		case "/client/locale/ru":
		case "/client/locale/Ru":
			FinalOutput = ReadJson('locale_en.json');
			break;
		case "/client/locations":
			FinalOutput = ReadJson('locations.json');
			break;
		case "/client/handbook/templates":
			FinalOutput = ReadJson('templates.json');
			break;
		case "/client/quest/list":
			FinalOutput = ReadJson('quest_list.json');
			break;
		case "/client/game/bot/generate":
			FinalOutput = JSON.stringify( {"err": 0,"errmsg": null,"data": generateBots(JSON.parse(body)) } );
			//FinalOutput = ReadJson('bot_generate.json');
			break;
		case "/client/trading/api/getTradersList":
			FinalOutput = ReadJson('traderList.json');
			break;
		case "/client/server/list":
			FinalOutput = ReadJson('serverList.json');
			break;
		case "/client/ragfair/search":
			FinalOutput = ReadJson('ragfair/search.json');
			break;
		default:
			console.log('\x1b[31m',"UNHANDLED REQUEST " + req.url,'\x1b[0m');
			break;
	}
}

server.on('request', function(req, resp) {
	// Get the IP address of the client
	FinalOutput = "";
	ItemOutput = JSON.parse('{"err":0, "errmsg":null, "data":{"items":{"new":[], "change":[], "del":[]}, "badRequest":[], "quests":[], "ragFairOffers":[]}}');
	var remote = req.connection.remoteAddress;
	console.log('Got request from: %s for %s', remote, req.url);
	if(req.method == "POST") {
		console.log("Posting");
		req.on('data', function(data) {
				zlib.inflate(data, function(error, body) {
					if(error) {
						console.log(error);
					} else {
						handleRequest(req, body.toString(), req.url);
						if (FinalOutput == "DEAD") {
							resp.writeHead(301, 
								{Location: 'http://prod.escapefromtarkov.com'+req.url}
							);
							console.log("Redirecting");
							resp.end();
							return;
						}
						resp.writeHead(200, "OK", {'Content-Type': 'text/plain', 'content-encoding' : 'deflate', 'Set-Cookie' : 'PHPSESSID=yolo'});
						zlib.deflate(FinalOutput, function(err, buf) {
							resp.end(buf);
						});
						return;
					}
			});
		});
	} else
	{
		console.log("Getting");
		handleRequest(req, "{}", req.url);
		if (FinalOutput == "DEAD") {
			resp.writeHead(301, 
				{Location: 'http://prod.escapefromtarkov.com'+req.url}
			);
			console.log("Redirecting");
			resp.end();
			return;
		}
		resp.writeHead(200, "OK", {'Content-Type': 'text/plain', 'content-encoding' : 'deflate', 'Set-Cookie' : 'PHPSESSID=yolo'});
		//console.log(FinalOutput);
		zlib.deflate(FinalOutput, function(err, buf) {
			resp.end(buf);
		});
	}


});

//Start the server
server.listen(PORT, function() {
	console.log('EmuTarkov listening on: %s',PORT);
});

var spoofedLogin = JSON.parse('{"email":"1337","password":"1337","toggle":true,"timestamp":1337}');
function SpoofLauncher(){
	spoofedLogin.timestamp = (Math.floor(new Date() / 1000) + 45) ^ 698464131;
	console.log(spoofedLogin.timestamp, 'actual = ', Math.floor(new Date() / 1000) + 45);
	var tmpB64 = Buffer.from(JSON.stringify(spoofedLogin)).toString('base64');
	var bytes = [];
	for (var i = 0; i < tmpB64.length; ++i) {
		var code = tmpB64.charCodeAt(i);
		bytes = bytes.concat([code]);
	}
	bytes = bytes.concat(0);
	regedit.putValue({
		'HKCU\\SOFTWARE\\Battlestate Games\\EscapeFromTarkov': {
			'bC5vLmcuaS5u_h1472614626': {
				value: bytes,
				type: 'REG_BINARY'
			}
		}
	}, function(err) {
		if(err){
			console.log("Shits fucked.", err);
		};
	});
};
setInterval(function() {
	SpoofLauncher();
}, 1000 * 60);
SpoofLauncher();