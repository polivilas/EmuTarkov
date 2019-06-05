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

var itemJSON = JSON.parse(ReadJson('data/items.json'));
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
	var presets = JSON.parse(ReadJson("data/bots/BotsSettings.json"))

	var weaponPresets = JSON.parse(ReadJson("data/bots/presetExtended.json")); //load all weapons
	databots.conditions.forEach(function(params) // loop to generate all scavs
	{
		switch(params.Role)
		{
			case "bossBully":
				bots_number++;
				var boss = JSON.parse(ReadJson("data/bots/bot_bossBully.json"))
				boss.Info.Settings.Role = params.Role;
				boss.Info.Settings.BotDifficulty = params.Difficulty;
				generatedBots.push(boss);
			break;

			case "bossKilla":
				bots_number++;
				var boss = JSON.parse(ReadJson("data/bots/bot_bossKilla.json"))
				boss.Info.Settings.Role = params.Role;
				boss.Info.Settings.BotDifficulty = params.Difficulty;
				generatedBots.push(boss);
			break;

			default:

				if(params.Role == "followerBully"){ params.Limit = 5; }

				for (var i = 1; i <= params.Limit ;i++) //generate as many as the game request
				{
					var BotBase = JSON.parse(ReadJson("data/bots/bot_base.json")); //load a dummy bot with nothing
					var internalId = getRandomIntEx(10000); //generate a scavSeed

					if(presets.EnablePmcWar == true)
					{

						if( getRandomIntEx(100) >= 55 )
						{
							BotBase._id = "Usec" + internalId;
							BotBase.Info.Nickname = "Usec " + internalId;
							BotBase.Info.LowerNickname = "usec" + internalId;
							BotBase.Info.Side = "Usec";
							BotBase.Info.Voice = "Usec_"+getRandomInt(1,3);
							BotBase.Customization.Head.path = "assets/content/characters/character/prefabs/usec_head_1.bundle";
							BotBase.Customization.Body.path = "assets/content/characters/character/prefabs/usec_body.bundle";
							BotBase.Customization.Feet.path = "assets/content/characters/character/prefabs/usec_feet.bundle";
						}
						else
						{
							BotBase._id = "Bear" + internalId;
							BotBase.Info.Nickname = "Bear " + internalId;
							BotBase.Info.LowerNickname = "Bear" + internalId;
							BotBase.Info.Side = "Bear";
							BotBase.Info.Voice = "Bear_"+getRandomInt(1,2);
							BotBase.Customization.Head.path = "assets/content/characters/character/prefabs/bear_head.bundle";
							BotBase.Customization.Body.path = "assets/content/characters/character/prefabs/bear_body.bundle";
							BotBase.Customization.Feet.path = "assets/content/characters/character/prefabs/bear_feet.bundle";
						}
					}
					else
					{
						BotBase._id = "scav_" + internalId;
						BotBase.Info.Nickname = "Scav " + internalId;
						BotBase.Info.LowerNickname = "scav" + internalId;

						//define a skin for the scav :
						BotBase.Customization.Head.path = "assets/content/characters/character/prefabs/"+presets.Head[getRandomIntEx(presets.Head.length)] +".bundle";
						BotBase.Customization.Body.path = "assets/content/characters/character/prefabs/"+presets.Body[getRandomIntEx(presets.Body.length)] +".bundle";
						BotBase.Customization.Feet.path = "assets/content/characters/character/prefabs/"+presets.Feet[getRandomIntEx(presets.Feet.length)] +".bundle";
						BotBase.Info.Voice = "Scav_" + getRandomInt(1,6);

						switch(params.Role)
						{
							case "followerBully":
								BotBase._id = "guard_" + internalId;
								BotBase.Info.Nickname = "Guard " + i;
								BotBase.Info.LowerNickname = "guard" + internalId;
								BotBase.Customization.Head.path = "assets/content/characters/character/prefabs/wild_head_1.bundle";
								BotBase.Customization.Body.path = "assets/content/characters/character/prefabs/wild_security_body_1.bundle";
								BotBase.Customization.Feet.path = "assets/content/characters/character/prefabs/wild_security_feet_1.bundle";
							break;

							case "marksman":
								BotBase._id = "sniper_" + internalId;
								BotBase.Info.Nickname = "Sniper " + internalId;
								BotBase.Info.LowerNickname = "sniper" + internalId;
							break;

							case "pmcBot":
								BotBase._id = "raider_" + internalId;
								BotBase.Info.Nickname = "Raider " + internalId;
								BotBase.Info.LowerNickname = "raider" + internalId;
								BotBase.Info.Voice = presets.pmcBotVoices[getRandomIntEx(presets.pmcBotVoices.length)];
							break;
						}
					}

					BotBase.Info.Settings.Role = params.Role;
					BotBase.Info.Settings.BotDifficulty = params.Difficulty;

					//randomize skills (because why not?)
					BotBase.Skills.Common.forEach(function(skill)
					{
						skill.Progress = getRandomIntEx(5000);
						skill.MaxAchieved = skill.Progress;
					});

					BotBase.Info.Experience = getRandomIntEx(25000000); //level 70 max

					//choose randomly a weapon from preset.json before filling items
					var Weapon = weaponPresets.data[getRandomIntEx(weaponPresets.data.length)];
					if(params.Role == "marksman")
					{
						var found = false;
						while(found == false)
						{
							Weapon = weaponPresets.data[getRandomIntEx(weaponPresets.data.length)];
							presets.filter_marksman.forEach(function(filter)
							{
								if(Weapon._items[0]._tpl == filter){ found = true; }
							});
						}
					}

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
										compatiblesmags = slot._props.filters[0].Filter; //array of compatible mags for this weapon
										break;
									}
								}

								var ammo_filter = itemJSON[Weapon._items[0]._tpl]._props.Chambers[0]._props.filters[0].Filter //array of compatible ammos

								var isMosin = false;
								presets.filter_mosin.forEach(function(someMosinId)
								{
									if(Weapon._items[0]._tpl == someMosinId){isMosin = true;} //check if the weapon given is a mosin
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
								else //don't randomize mosin magazine !
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
								tempw.location = {"x": 0,"y": 0,"r": 0};
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
								tempw.location = {"x": 0,"y": 0,"r": 0};
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

					for( var bdpt in BotBase.Health.BodyParts )
					{
						BotBase.Health.BodyParts[bdpt].Health.Current = BotBase.Health.BodyParts[bdpt].Health.Current + getRandomInt(-10,10);
						BotBase.Health.BodyParts[bdpt].Health.Maximum = BotBase.Health.BodyParts[bdpt].Health.Current;
					}


					//add a knife
					var tempw = {};
					tempw._id = "ScabbardScav"+ internalId;
					tempw._tpl= presets.knives[getRandomIntEx(presets.knives.length)]; //yes exactly like above, randomize everything
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
					if(getRandomIntEx(100) <= 25)
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

					if(getRandomIntEx(100) <= 10 || params.Role == "followerBully") //add meds
					{

						var tempw = {};
						tempw._id = "PocketMedScav"+ internalId;
						tempw._tpl= presets.meds[getRandomIntEx(presets.meds.length)];
						tempw.parentId = "5c6687d65e9d882c8841f121";
						tempw.slotId = "pocket2";
						tempw.location = {"x": 0,"y": 0,"r": 0};
						BotBase.Inventory.items.push(tempw);

					}

					if(getRandomIntEx(100) <= 10 || params.Role == "followerBully" )
					{
						var tempw = {};
						tempw._id = "PocketItemScav"+ internalId;
						tempw._tpl= presets.Grenades[getRandomIntEx(presets.Grenades.length)];
						tempw.parentId = "5c6687d65e9d882c8841f121";
						tempw.slotId = "pocket1";
						tempw.location = {"x": 0,"y": 0,"r": 0};
						BotBase.Inventory.items.push(tempw);
					}

					bots_number++; //just a counter :)
					generatedBots.push(BotBase); //don't forget to add your nice scav with all other

				}
			break;
		}
	});

	console.log("generated " + bots_number + " scavs possibilities");
	return generatedBots;
}


var ItemJSON = JSON.parse(ReadJson("data/items.json"));
function RagfairOffers(request)
{
	var tmpId = "54009119af1c881c07000029";
	for (var curItem in ItemJSON.data)
	{
		if (curItem == request.handbookId){
			tmpId = curItem;
			console.log("found item");
			break;
		};
	};
	var response = JSON.parse(ReadJson("data/ragfair/search.json"));
	response.data.offers[0]._id = tmpId;
	response.data.offers[0].items[0]._tpl = tmpId;
	FinalOutput = JSON.stringify(response);
	// this is really not okay. TODO: handle ragfair buying event - maybe connect to trader buy event?
}

function handleMoving(body) {
	console.log(body);
	var tmpList = JSON.parse(ReadJson('data/list.json'));
	switch(body.Action) {

		case "QuestAccept":
			tmpList.data[1].Quests.push({"qid": body.qid.toString(), "startTime": 1337, "status": 2}); // statuses seem as follow - 1 - not accepted | 2 - accepted | 3 - failed | 4 - completed
			fs.writeFileSync('data/list.json', JSON.stringify(tmpList, null, "\t"), 'utf8');
			FinalOutput = "OK";
			break;

		case "QuestComplete":
			tmpList.data[1].Quests.forEach(function(quest)
			{
				if(quest.qid == body.qid){quest.status = 4;}
			});

			//send reward to the profile : if quest_list.id == bodyqid then quest_list.succes

			fs.writeFileSync('data/list.json', JSON.stringify(tmpList, null, "\t"), 'utf8');
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
							//tmpList.data[1].Inventory.items[key].location = {"x": 0, "y": 0, "r": 0};// is bad and leading to profile corruption/etc
							delete tmpList.data[1].Inventory.items[key].location;
						}
					}
					fs.writeFileSync('data/list.json', JSON.stringify(tmpList, null, "\t"), 'utf8');
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
				fs.writeFileSync('data/list.json', JSON.stringify(tmpList, null, "\t"), 'utf8');
				FinalOutput = "OK";
			break;
		case "Split":
			for (var key in tmpList.data[1].Inventory.items) {
				if (tmpList.data[1].Inventory.items[key]._id && tmpList.data[1].Inventory.items[key]._id == body.item) {
					tmpList.data[1].Inventory.items[key].upd.StackObjectsCount -= body.count;
					var newItem = GenItemID();
					ItemOutput.data.items.new.push({"_id": newItem, "_tpl": tmpList.data[1].Inventory.items[key]._tpl, "parentId": body.container.id, "slotId": body.container.container, "location": body.container.location, "upd": {"StackObjectsCount": body.count}});
					tmpList.data[1].Inventory.items.push({"_id": newItem, "_tpl": tmpList.data[1].Inventory.items[key]._tpl, "parentId": body.container.id, "slotId": body.container.container, "location": body.container.location, "upd": {"StackObjectsCount": body.count}});
					fs.writeFileSync('data/list.json', JSON.stringify(tmpList, null, "\t"), 'utf8');
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
							fs.writeFileSync('data/list.json', JSON.stringify(tmpList, null, "\t"), 'utf8');
							FinalOutput = "OK";
							break;
						}
					}
				}
			}
			break;
		case "TradingConfirm":
			if(body.type == "buy_from_trader") {
				var tmpTrader = JSON.parse(ReadJson('data/assort/' + body.tid.replace(/[^a-zA-Z0-9]/g, '') + '.json'));
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
						if (body.count > tmpItem._props.StackMaxSize){
							body.count = tmpItem._props.StackMaxSize;
						};
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
									fs.writeFileSync('data/list.json', JSON.stringify(tmpList, null, "\t"), 'utf8');
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
					fs.writeFileSync('data/list.json', JSON.stringify(tmpList, null, "\t"), 'utf8');
					FinalOutput = "OK";
					break;
				}
			}
			break;
		case "Toggle":
			for (var key in tmpList.data[1].Inventory.items) {
				if (tmpList.data[1].Inventory.items[key]._id && tmpList.data[1].Inventory.items[key]._id == body.item) {
					tmpList.data[1].Inventory.items[key].upd.Togglable = {"On": body.value};
					fs.writeFileSync('data/list.json', JSON.stringify(tmpList, null, "\t"), 'utf8');
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
		FinalOutput = ReadJson("data/assort/" + url.substring(36).replace(/[^a-zA-Z0-9_]/g, '') + ".json");
		return;
	}
	if (url.match(prices)) {
		FinalOutput = ReadJson("data/prices/" + url.substring(46).replace(/[^a-zA-Z0-9_]/g, '') + ".json"); // thats some budget ass shit
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
			FinalOutput = '{"err":0, "errmsg":null, "data":{"token":"token_1337", "aid":1337, "lang":"en", "languages":{"en":"English"}, "ndaFree":true, "queued":false, "taxonomy":341, "activeProfileId":"5c71b934354682353958e984", "backend":{"Trading":"http://localhost:1337", "Messaging":"http://localhost:1337", "Main":"http://localhost:1337", "RagFair":"http://localhost:1337"}, "utc_time":1337, "totalInGame":0, "twitchEventMember":false}}';
			break;
		case "/client/game/logout":
			FinalOutput = '{"err":0, "errmsg":null, "data":null}';
			break;
		case "/client/queue/status":
			FinalOutput = '{"err":0, "errmsg":null, "data":{"status": 0, "position": 0}}';
			break;
		case "/client/items":
			FinalOutput = ReadJson('data/items.json');
			break;
		case "/client/globals":
			FinalOutput = ReadJson('data/globals.json');
			break;
		case "/client/game/profile/list":
			FinalOutput = ReadJson('data/list.json');
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
			FinalOutput = ReadJson('data/locale_en.json');
			break;
		case "/client/locations":
			FinalOutput = ReadJson('data/locations.json');
			break;
		case "/client/handbook/templates":
			FinalOutput = ReadJson('data/templates.json');
			break;
		case "/client/quest/list":
			FinalOutput = ReadJson('data/questList.json');
			break;
		case "/client/getMetricsConfig":
			FinalOutput = ReadJson('data/metricsConfig.json');
			break;
		case "/client/putMetrics":
			FinalOutput = '{"err":0, "errmsg":null, "data":null}';
			break;
		case "/client/game/bot/generate":
			FinalOutput = JSON.stringify( {"err": 0,"errmsg": null,"data": generateBots(JSON.parse(body)) } );
			break;
		case "/client/trading/api/getTradersList":
			FinalOutput = ReadJson('data/traderList.json');
			break;
		case "/client/server/list":
			FinalOutput = '{"err":0, "errmsg":null, "data":[{"ip":"127.0.0.1", "port":1337}]}';
			break;
		case "/client/ragfair/search":
			RagfairOffers(info);
			break;
		case "/client/match/available":
			FinalOutput = '{"err":0, "errmsg":null, "data":true}';
			break;
		case "/client/match/join":
			var clientrequest = JSON.parse(body);
			var shortid = "";
						
			if (clientrequest.savage == true) {
				shortid = "3XR5";
			} else {
				shortid = "3SRC";
			}

			console.log("scav:" + clientrequest.savage + ", shortid: " + shortid);
			
			FinalOutput = JSON.stringify( {"err": 0,"errmsg": null,"data": [ {"profileid": "5c71b934354682353958e983", "status": "busy", "ip": "", "port": 0, "location": clientrequest.location, "sid": "", "gamemode": "deathmatch", "shortid": shortid} ] });
			break;
		case "/client/match/exit":
			FinalOutput = '{"err":0, "errmsg":null, "data":null}';
			break;
		case "/client/chatServer/list":
			FinalOutput = '{"err":0, "errmsg":null, "data":[{"_id":"5ae20a0dcb1c13123084756f", "RegistrationId":20, "DateTime":' + Math.floor(new Date() / 1000) + ', "IsDeveloper":true, "Regions":["EUR"], "VersionId":"bgkidft87ddd", "Ip":"", "Port":0, "Chats":[{"_id":"0", "Members":0}]}]}';
			break;
		case "/client/game/profile/nickname/change":
			var clientrequest = JSON.parse(body);
			var tmpList = JSON.parse(ReadJson("data/list.json"));

			tmpList.data[1].Info.Nickname = clientrequest.nickname;
			tmpList.data[1].Info.LowerNickname = clientrequest.nickname.toLowerCase();
			fs.writeFileSync('data/list.json', JSON.stringify(tmpList, null, "\t"), 'utf8');
			
			FinalOutput = '{"err":0, "errmsg":null, "data":{"status":0, "nicknamechangedate":' + Math.floor(new Date() / 1000) + '}}';	
			break;
		case "/dump":
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
