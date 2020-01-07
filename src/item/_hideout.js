"use strict";

require('../libs.js');

const hideout_areas_config = json.parse(json.read(filepaths.user.cache.hideout_areas));
const crafting_receipes = json.parse(json.read(filepaths.user.cache.hideout_production));

// upgrading can take times,the first step is to pay what needed for upgrade and start construction
function HideoutUpgrade(tmpList, body) {
    // pay money or delete items
	for (let itemToPay of body.items) {
		for (let inventoryItem in tmpList.data[0].Inventory.items) {
			//find the specific item in inventory
			if (tmpList.data[0].Inventory.items[inventoryItem]._id == itemToPay.id) {
				// if it's not money, its construction / barter items
				if (tmpList.data[0].Inventory.items[inventoryItem]._tpl == "5449016a4bdc2d6f028b456f") {
					tmpList.data[0].Inventory.items[inventoryItem].upd.StackObjectsCount -= itemToPay.count;
				} else {	
					move_f.removeItem(tmpList, {"Action":"Remove", "item" : tmpList.data[0].Inventory.items[inventoryItem]._id});
				}		
			}
		}
	}

	// time construction management
	for (let hideoutArea in tmpList.data[0].Hideout.Areas) {
		// find areaType in profile
		if (tmpList.data[0].Hideout.Areas[hideoutArea].type == body.areaType) {
			for (let hideout_stage in hideout_areas_config.data) {	
				// find the  good stage from config
				if (hideout_areas_config.data[hideout_stage].type == body.areaType) {
					// get construction time
					let ctime = hideout_areas_config.data[hideout_stage].stages[tmpList.data[0].Hideout.Areas[hideoutArea].level + 1].constructionTime;
					
					if (ctime > 0) {	
						let timestamp = Math.floor(Date.now() / 1000);

						tmpList.data[0].Hideout.Areas[hideoutArea].completeTime = timestamp + ctime;
						tmpList.data[0].Hideout.Areas[hideoutArea].constructing = true;
					}
				}				
			}
		}
	}

	profile.setCharacterData(tmpList);	
	item.resetOutput();
	return item.getOutput();
}

// validating the upgrade
function HideoutUpgradeComplete(tmpList, body) {
	for (let hideoutArea in tmpList.data[0].Hideout.Areas) {
		if (tmpList.data[0].Hideout.Areas[hideoutArea].type == body.areaType) {
			tmpList.data[0].Hideout.Areas[hideoutArea].level++;	
			tmpList.data[0].Hideout.Areas[hideoutArea].completeTime = 0;
			tmpList.data[0].Hideout.Areas[hideoutArea].constructing = false;

			//and then apply bonusses or its auto ? 		
		}
	}

	profile.setCharacterData(tmpList);
	item.resetOutput();		
	return item.getOutput();
}

//move items from hideout
function HideoutPutItemsInAreaSlots(tmpList, body) {
	for (let itemToMove in body.items) {
		for (let inventoryItem of tmpList.data[0].Inventory.items) {
			if (body.items[itemToMove].id == inventoryItem._id) {
				for (let area in tmpList.data[0].Hideout.Areas) {
					if (tmpList.data[0].Hideout.Areas[area].type == body.areaType) {
						let slot_to_add = {
							"item":[{
								"_id": inventoryItem._id,
								"_tpl":inventoryItem._tpl,
								"upd": inventoryItem.upd
							}]
						}

						tmpList.data[0].Hideout.Areas[area].slots.push(slot_to_add);
						move_f.removeItem(tmpList, {"Action":"Remove", "item" : inventoryItem._id});
					}
				}
			}
		}
	}

	profile.setCharacterData(tmpList);	
	return item.getOutput();
}

function HideoutTakeItemsFromAreaSlots(tmpList, body) {
	item.resetOutput();	

	for (let area in tmpList.data[0].Hideout.Areas) {
		if (tmpList.data[0].Hideout.Areas[area].type == body.areaType) {
			// should use body.slots[0] to get the array index but since its not managed like that, its different
			// move tmpList.data[0].Hideout.Areas[area].slots[0].item[0] to inventory with new location --> special function needed 
			// then manual remove --> tmpList.data[0].Hideout.Areas[area].slots.splice(0,1);

			let newReq = {};

    		newReq.item_id = tmpList.data[0].Hideout.Areas[area].slots[0].item[0]._tpl;
    		newReq.count = 1;
			move_f.addItem(tmpList, newReq);
			tmpList = profile.getCharacterData();
			tmpList.data[0].Hideout.Areas[area].slots.splice(0,1);
			profile.setCharacterData(tmpList);
		}
	}

	return item.getOutput();
}

function HideoutToggleArea(tmpList, body) {
	for (let area in tmpList.data[0].Hideout.Areas) {
		if (tmpList.data[0].Hideout.Areas[area].type == body.areaType) {	
			tmpList.data[0].Hideout.Areas[area].active = body.enabled;
		}
	}

	profile.setCharacterData(tmpList);
	item.resetOutput();		
	return item.getOutput();
}

function HideoutSingleProductionStart(tmpList, body) {
	registerProduction(tmpList, body);

	for (let itemToDelete of body.items) {
		move_f.removeItem(tmpList, {"Action":"Remove", "item" : itemToDelete.id});
	}

	item.resetOutput();
	return item.getOutput();
}

function HideoutScavCaseProductionStart(tmpList, body) {
	for (let moneyToEdit of body.items) {
		for (let inventoryItem in tmpList.data[0].Inventory.items) {
			if (tmpList.data[0].Inventory.items[inventoryItem]._id == moneyToEdit.id) {
				tmpList.data[0].Inventory.items[inventoryItem].upd.StackObjectsCount -= moneyToEdit.count;
			}
		}
	}

	let scavcase_receipes = json.parse(json.read(filepaths.user.cache.hideout_scavcase));

	for (let receipe in scavcase_receipes.data) {	
		if (body.recipeId == scavcase_receipes.data[receipe]._id) {
			let rarityItemCounter = {};

			for (let rarity in scavcase_receipes.data[receipe].EndProducts) {
				if (scavcase_receipes.data[receipe].EndProducts[rarity].max > 0) {
					rarityItemCounter[rarity] = scavcase_receipes.data[receipe].EndProducts[rarity].max;
				}
			}

			let products = [];
			
			for (let rarityType in rarityItemCounter) {
				while (rarityItemCounter[rarityType] != 0) {	
					let random = utility.getRandomIntEx( Object.keys(items.data).length) //1 to items length
					let randomKey = Object.keys(items.data)[random];
					let tempItem = items.data[randomKey];
					
					if (tempItem._props.Rarity == rarityType) {
						//products are not registered correctly
						products.push({ 
							"_id" : utility.generateNewItemId(),
							"_tpl":tempItem._id
						});

						rarityItemCounter[rarityType] -= 1;
					}
				}
			}

			tmpList.data[0].Hideout.Production["14"] = { 
				"Progress":0,
				"inProgress": true,
           		"RecipeId": body.recipeId,
        		"Products": products,
        		"StartTime":  Math.floor(Date.now()/1000)
        	};
		}
	}

	profile.setCharacterData(tmpList);
	item.resetOutput();
	return item.getOutput();
}

function HideoutContinuousProductionStart(tmpList, body) {
	registerProduction(tmpList, body);
	item.resetOutput();
	return item.getOutput();
}

function HideoutTakeProduction(tmpList, body) {
	let found = false;

	for (let receipe in crafting_receipes.data) {	
		if (body.recipeId == crafting_receipes.data[receipe]._id) {
			found = true;

			// delete the production in profile Hideout.Production
			for (let prod in tmpList.data[0].Hideout.Production) {
				if (tmpList.data[0].Hideout.Production[prod].RecipeId == body.recipeId) {
					delete tmpList.data[0].Hideout.Production[prod]
					profile.setCharacterData(tmpList);
				}
			}

			// create item and throw it into profile
			let newReq = {};

			newReq.item_id = crafting_receipes.data[receipe].endProduct;
			newReq.count = crafting_receipes.data[receipe].count;
			move_f.addItem(tmpList, newReq);
			item.resetOutput();
			return item.getOutput();
		}	
	}

	let allOutput = item.getOutput();

	// its a scavcase production then manage it differently
	if (found == false) {
		let scavcase_receipes = json.parse(json.read(filepaths.user.cache.hideout_scavcase));

		for (let receipe in scavcase_receipes.data) {
			if (body.recipeId == scavcase_receipes.data[receipe]._id) {
				found = true;

				for (let prod in tmpList.data[0].Hideout.Production) {
					if (tmpList.data[0].Hideout.Production[prod].RecipeId == body.recipeId ) {
						// give items BEFORE deleting the production
						for (let itemProd of tmpList.data[0].Hideout.Production[prod].Products ) {
							let newReq = {};

							tmpList = profile.getCharacterData();
							newReq.item_id = itemProd._tpl;
							newReq.count = 1;
		
							let tempOutput = move_f.addItem(tmpList, newReq);

							for (let newItem of tempOutput.data.items.new) {
								allOutput.data.items.new.push(newItem);
							}

						}

						delete tmpList.data[0].Hideout.Production[prod];
						profile.setCharacterData(tmpList);
						return allOutput;
					}
				}
			}
		}
	}

	return "";
}

function registerProduction(tmpList, body) {
	for (let receipe in crafting_receipes.data) {
		if (body.recipeId == crafting_receipes.data[receipe]._id) {
			tmpList.data[0].Hideout.Production[crafting_receipes.data[receipe].areaType] = { 
				"Progress":0,
				"inProgress": true,
           		"RecipeId": body.recipeId,
        		"Products": [],
        		"StartTime": Math.floor(Date.now()/1000)
        	};
		}
	}

	profile.setCharacterData(tmpList);
}

module.exports.hideoutUpgrade = HideoutUpgrade;
module.exports.hideoutUpgradeComplete = HideoutUpgradeComplete;
module.exports.hideoutPutItemsInAreaSlots = HideoutPutItemsInAreaSlots;
module.exports.hideoutTakeItemsFromAreaSlots = HideoutTakeItemsFromAreaSlots;
module.exports.hideoutToggleArea = HideoutToggleArea;
module.exports.hideoutSingleProductionStart  = HideoutSingleProductionStart;
module.exports.hideoutContinuousProductionStart = HideoutContinuousProductionStart;
module.exports.hideoutScavCaseProductionStart = HideoutScavCaseProductionStart;
module.exports.hideoutTakeProduction = HideoutTakeProduction;
