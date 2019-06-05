var utility = require('./utility.js');
var settings = require('./settings.js');

var items = JSON.parse(utility.readJson('data/items.json'));

function generate(databots) { //Welcome to the Scav Randomizer :)
	var generatedBots = [];
	var bots_number = 0;
	var presets = JSON.parse(utility.readJson("data/bots/BotsSettings.json"));
	var weaponPresets = JSON.parse(utility.readJson("data/bots/presetExtended.json")); //load all weapons

	databots.conditions.forEach(function(params) { // loop to generate all scavs
		switch (params.Role) {
			case "bossBully":
				var boss = JSON.parse(utility.readJson("data/bots/bot_bossBully.json"));

				bots_number++;
				boss.Info.Settings.Role = params.Role;
				boss.Info.Settings.BotDifficulty = params.Difficulty;
				generatedBots.push(boss);
				break;

			case "bossKilla":				
				var boss = JSON.parse(utility.readJson("data/bots/bot_bossKilla.json"));

				bots_number++;
				boss.Info.Settings.Role = params.Role;
				boss.Info.Settings.BotDifficulty = params.Difficulty;
				generatedBots.push(boss);
				break;

			default:
				if (params.Role == "followerBully") { 
					params.Limit = 5; 
				}

				for (var i = 1; i <= params.Limit; i++)  { //generate as many as the game request
					var BotBase = JSON.parse(utility.readJson("data/bots/bot_base.json")); //load a dummy bot with nothing
					var internalId = utility.getRandomIntEx(10000); //generate a scavSeed

					if (settings.getEnablePmcWar() == true) {
						if (utility.getRandomIntEx(100) >= 55 ) {
							BotBase._id = "Usec" + internalId;
							BotBase.Info.Nickname = "Usec " + internalId;
							BotBase.Info.LowerNickname = "usec" + internalId;
							BotBase.Info.Side = "Usec";
							BotBase.Info.Voice = "Usec_"+utility.getRandomInt(1,3);
							BotBase.Customization.Head.path = "assets/content/characters/character/prefabs/usec_head_1.bundle";
							BotBase.Customization.Body.path = "assets/content/characters/character/prefabs/usec_body.bundle";
							BotBase.Customization.Feet.path = "assets/content/characters/character/prefabs/usec_feet.bundle";
						} else {
							BotBase._id = "Bear" + internalId;
							BotBase.Info.Nickname = "Bear " + internalId;
							BotBase.Info.LowerNickname = "Bear" + internalId;
							BotBase.Info.Side = "Bear";
							BotBase.Info.Voice = "Bear_"+utility.getRandomInt(1,2);
							BotBase.Customization.Head.path = "assets/content/characters/character/prefabs/bear_head.bundle";
							BotBase.Customization.Body.path = "assets/content/characters/character/prefabs/bear_body.bundle";
							BotBase.Customization.Feet.path = "assets/content/characters/character/prefabs/bear_feet.bundle";
						}
					} else {
						BotBase._id = "scav_" + internalId;
						BotBase.Info.Nickname = "Scav " + internalId;
						BotBase.Info.LowerNickname = "scav" + internalId;

						//define a skin for the scav :
						BotBase.Customization.Head.path = "assets/content/characters/character/prefabs/"+presets.Head[utility.getRandomIntEx(presets.Head.length)] +".bundle";
						BotBase.Customization.Body.path = "assets/content/characters/character/prefabs/"+presets.Body[utility.getRandomIntEx(presets.Body.length)] +".bundle";
						BotBase.Customization.Feet.path = "assets/content/characters/character/prefabs/"+presets.Feet[utility.getRandomIntEx(presets.Feet.length)] +".bundle";
						BotBase.Info.Voice = "Scav_" + utility.getRandomInt(1,6);

						switch (params.Role) {
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
								BotBase.Info.Voice = presets.pmcBotVoices[utility.getRandomIntEx(presets.pmcBotVoices.length)];
								break;
						}
					}

					BotBase.Info.Settings.Role = params.Role;
					BotBase.Info.Settings.BotDifficulty = params.Difficulty;

					//randomize skills (because why not?)
					BotBase.Skills.Common.forEach(function(skill) {
						skill.Progress = utility.getRandomIntEx(5000);
						skill.MaxAchieved = skill.Progress;
					});

					BotBase.Info.Experience = utility.getRandomIntEx(25000000); //level 70 max

					//choose randomly a weapon from preset.json before filling items
					var Weapon = weaponPresets.data[utility.getRandomIntEx(weaponPresets.data.length)];
					
					if (params.Role == "marksman") {
						var found = false;
						
						while (found == false) {
							Weapon = weaponPresets.data[utility.getRandomIntEx(weaponPresets.data.length)];

							presets.filter_marksman.forEach(function(filter) {
								if (Weapon._items[0]._tpl == filter) {
									found = true;
								}
							});
						}
					}

					//check if its a pistol or a primary..
					Weapon.isPistol = false;

					presets.pistols.forEach(function(pistoltpl) {
						if (pistoltpl == Weapon._items[0]._tpl) {
							Weapon.isPistol = true;
						}
					});

					//Add a vest or rig on the scav (can be an armored vest)
					var tempw = {};
					tempw._id = "TacticalVestScav"+ internalId;
					tempw._tpl = presets.Rigs[utility.getRandomIntEx(presets.Rigs.length)];
					tempw.parentId = "5c6687d65e9d882c8841f0fd";
					tempw.slotId = "TacticalVest";
					BotBase.Inventory.items.push(tempw);

					//fill your dummy bot with the random selected preset weapon and its mods
					Weapon._items.forEach(function(item) {
						if (item._id == Weapon._parent) { //if its the weapon itself then add it differently
							if (Weapon.isPistol == false ) {
								var tempw = {};
								
								tempw._id = item._id;
								tempw._tpl = item._tpl;
								tempw.parentId = "5c6687d65e9d882c8841f0fd";
								tempw.slotId = "FirstPrimaryWeapon";
								BotBase.Inventory.items.push(tempw);
							}

							if (Weapon.isPistol == true) {
								var tempw = {};
								tempw._id = item._id;
								tempw._tpl = item._tpl;
								tempw.parentId = "5c6687d65e9d882c8841f0fd";
								tempw.slotId = "Holster";
								BotBase.Inventory.items.push(tempw);
							}
						} else { //add mods, vital parts, etcc
							//randomize magazine
							if (item.slotId == "mod_magazine" ) {
								var compatiblesmags = {};

								for (var slot of items.data[Weapon._items[0]._tpl]._props.Slots) {
									if (slot._name == "mod_magazine") {
										compatiblesmags = slot._props.filters[0].Filter; //array of compatible mags for this weapon
										break;
									}
								}

								var ammo_filter = items.data[Weapon._items[0]._tpl]._props.Chambers[0]._props.filters[0].Filter //array of compatible ammos
								var isMosin = false;

								presets.filter_mosin.forEach(function(someMosinId) {
									if (Weapon._items[0]._tpl == someMosinId) {
										isMosin = true;
									} //check if the weapon given is a mosin
								});

								if (isMosin == false) {
									//add a magazine
									var tempw = {};

									tempw._id = "MagazineWeaponScav"+ internalId;
									tempw._tpl = compatiblesmags[utility.getRandomIntEx(compatiblesmags.length)]; //randomize the magazine of the weapon
									
									var selectedmag = tempw._tpl //store this value
									
									tempw.parentId = Weapon._items[0]._id; //put this mag on the weapon
									tempw.slotId = "mod_magazine";
									BotBase.Inventory.items.push(tempw);

									//then fill ammo of randomized mag
									var tempw = {};
									
									tempw._id = "AmmoMagazine1Scav"+ internalId;
									tempw._tpl = ammo_filter[utility.getRandomIntEx(ammo_filter.length)]; //randomize ammo inside the mag
									tempw.parentId = "MagazineWeaponScav"+ internalId;
									tempw.slotId = "cartridges";
									tempw.upd = {"StackObjectsCount": items.data[selectedmag]._props.Cartridges[0]._max_count }; //fill the magazine
									BotBase.Inventory.items.push(tempw);
								} else { //don't randomize mosin magazine !
									BotBase.Inventory.items.push(item);
									
									//add a magazine
									var tempw = {};
									
									tempw._id = "AmmoMagazine1Scav"+ internalId;
									tempw._tpl = ammo_filter[utility.getRandomIntEx(ammo_filter.length)]; //randomize ammo inside the mag
									tempw.parentId = item._id ;
									tempw.slotId = "cartridges";
									tempw.upd = {"StackObjectsCount": items.data[item._tpl]._props.Cartridges[0]._max_count }; //fill the magazine
									BotBase.Inventory.items.push(tempw);
								}

								//add magazine in the vest
								var tempw = {};
								
								tempw._id = "magazine2VestScav"+ internalId;
								tempw._tpl = compatiblesmags[utility.getRandomIntEx(compatiblesmags.length)]; //randomize this magazine too
								
								var selectedmag = tempw._tpl; //store the selected magazine template for ammo
								
								tempw.parentId = "TacticalVestScav"+ internalId;
								tempw.slotId = "2";
								tempw.location = {"x": 0,"y": 0,"r": 0};
								BotBase.Inventory.items.push(tempw);

								//add ammo in the magazine INSIDE THE VEST-RIG
								var tempw = {};
								
								tempw._id = "AmmoMagazine2Scav"+ internalId;
								tempw._tpl = ammo_filter[utility.getRandomIntEx(ammo_filter.length)];
								tempw.parentId = "magazine2VestScav"+ internalId;
								tempw.slotId = "cartridges";
								tempw.upd = {"StackObjectsCount": items.data[selectedmag]._props.Cartridges[0]._max_count };
								BotBase.Inventory.items.push(tempw);

								//add another magazine in the vest
								var tempw = {};
								
								tempw._id = "magazine3VestScav"+ internalId;
								tempw._tpl = compatiblesmags[utility.getRandomIntEx(compatiblesmags.length)]; //randomize this magazine too
								
								var selectedmag = tempw._tpl; //store the selected magazine template for ammo
								
								tempw.parentId = "TacticalVestScav"+ internalId;
								tempw.slotId = "3";
								tempw.location = {"x": 0,"y": 0,"r": 0};
								BotBase.Inventory.items.push(tempw);

								var tempw = {};
								
								tempw._id = "AmmoMagazine3Scav"+ internalId;
								tempw._tpl = ammo_filter[utility.getRandomIntEx(ammo_filter.length)];
								tempw.parentId = "magazine3VestScav"+ internalId;
								tempw.slotId = "cartridges";
								tempw.upd = {"StackObjectsCount": items.data[selectedmag]._props.Cartridges[0]._max_count };
								BotBase.Inventory.items.push(tempw);

								//add a stack of ammo for moslings and sks
								var tempw = {};
								
								tempw._id = "AmmoFree2Scav"+ internalId;
								tempw._tpl = ammo_filter[utility.getRandomIntEx(ammo_filter.length)];
								tempw.parentId = "TacticalVestScav"+ internalId;
								tempw.slotId = "1";
								tempw.upd = {"StackObjectsCount": utility.getRandomInt(10,30) };
								BotBase.Inventory.items.push(tempw);
							} else {
								BotBase.Inventory.items.push(item); //add mods and vital parts
							}
						}
					});

					for (var bdpt in BotBase.Health.BodyParts) {
						BotBase.Health.BodyParts[bdpt].Health.Current = BotBase.Health.BodyParts[bdpt].Health.Current + utility.getRandomInt(-10,10);
						BotBase.Health.BodyParts[bdpt].Health.Maximum = BotBase.Health.BodyParts[bdpt].Health.Current;
					}

					//add a knife
					var tempw = {};
					tempw._id = "ScabbardScav"+ internalId;
					tempw._tpl= presets.knives[utility.getRandomIntEx(presets.knives.length)]; //yes exactly like above, randomize everything
					tempw.parentId = "5c6687d65e9d882c8841f0fd";
					tempw.slotId = "Scabbard";
					BotBase.Inventory.items.push(tempw);

					if (utility.getRandomIntEx(100) <= 30) { //30% chance to add some glasses
						var tempw = {};
						tempw._id = "EyeWearScav"+ internalId;
						tempw._tpl= presets.Eyewear[utility.getRandomIntEx(presets.Eyewear.length)];
						tempw.parentId = "5c6687d65e9d882c8841f0fd";
						tempw.slotId = "Eyewear";
						BotBase.Inventory.items.push(tempw);
					}

					if (utility.getRandomIntEx(100) <= 40) {
						var tempw = {};
						tempw._id = "FaceCoverScav"+ internalId;
						tempw._tpl= presets.Facecovers[utility.getRandomIntEx(presets.Facecovers.length)];
						tempw.parentId = "5c6687d65e9d882c8841f0fd";
						tempw.slotId = "FaceCover";
						BotBase.Inventory.items.push(tempw);
					}

					if(utility.getRandomIntEx(100) <= 40 ) {
						var tempw = {};
						tempw._id = "HeadWearScav"+ internalId;
						tempw._tpl= presets.Headwear[utility.getRandomIntEx(presets.Headwear.length)];
						tempw.parentId = "5c6687d65e9d882c8841f0fd";
						tempw.slotId = "Headwear";
						BotBase.Inventory.items.push(tempw);
					}

					if (utility.getRandomIntEx(100) <= 25) {
						var tempw = {};
						tempw._id = "BackpackScav"+ internalId;
						tempw._tpl= presets.Backpacks[utility.getRandomIntEx(presets.Backpacks.length)];
						tempw.parentId = "5c6687d65e9d882c8841f0fd";
						tempw.slotId = "Backpack";
						BotBase.Inventory.items.push(tempw);

						if(utility.getRandomIntEx(100) <= 50) { //chance to add something inside
							//to be implemented...
						}
					}

					if (utility.getRandomIntEx(100) <= 25) {
						var tempw = {};
						tempw._id = "ArmorVestScav"+ internalId;
						tempw._tpl= presets.Armors[utility.getRandomIntEx(presets.Armors.length)];
						tempw.parentId = "5c6687d65e9d882c8841f0fd";
						tempw.slotId = "ArmorVest";
						var durabl = utility.getRandomIntEx(45);
						tempw.upd = {"Repairable": {"Durability": durabl }};
						BotBase.Inventory.items.push(tempw);
					}

					if (utility.getRandomIntEx(100) <= 10 || params.Role == "followerBully") { //add meds
						var tempw = {};
						tempw._id = "PocketMedScav"+ internalId;
						tempw._tpl= presets.meds[utility.getRandomIntEx(presets.meds.length)];
						tempw.parentId = "5c6687d65e9d882c8841f121";
						tempw.slotId = "pocket2";
						tempw.location = {"x": 0,"y": 0,"r": 0};
						BotBase.Inventory.items.push(tempw);
					}

					if (utility.getRandomIntEx(100) <= 10 || params.Role == "followerBully") {
						var tempw = {};
						tempw._id = "PocketItemScav"+ internalId;
						tempw._tpl= presets.Grenades[utility.getRandomIntEx(presets.Grenades.length)];
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

module.exports.generate = generate;