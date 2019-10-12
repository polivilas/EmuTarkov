"use strict";

require('./libs.js');

var localePath = "data/configs/locale/";

function getLanguages() {
    return utility.readJson(localePath + "languages.json");
}

function getMenu(lang) {
    let langName = lang.toLowerCase();
    let json = JSON.parse(utility.readJson(localePath + langName + "/menu.json"));
    // general
    //json.data.menu["Escape from Tarkov"] = "JustEmuTarkov";
    json.data.menu["{0} Beta version"] = "{0} | JET " + constants.serverVersion() + " | JustEmuTarkov";
    return JSON.stringify(json);
}

function getGlobal(lang = "en") {
    let langName = lang.toLowerCase();
    let langDir = localePath + langName + "/categories/";
	let langBase = {"err":0,"errmsg":null,"data":{},"crc":0};
    // language specific
	let items_List = fs.readdirSync(langDir);
	// load trader files
	for (let file in langDir) {
		if (langDir.hasOwnProperty(file)) {
			if (items_List[file] !== undefined) {
				if (items_List.hasOwnProperty(file)) {
					let temp_fileData = JSON.parse(utility.readJson(langDir + items_List[file]));
					langBase.data[items_List[file].replace(".json","")] = temp_fileData;
				}
			}
		}
	}
    switch (lang) {
        case "ru":
            langBase.data.interface["NDA Policy warning"] = "Добро Пожаловать в Just EmuTarkov. Удачи!";
            break;
        case "de":
            langBase.data.interface["NDA Policy warning"] = "Willkommen bei JustEmuTarkov. Viel glück";
            break;
        default:
            langBase.data.interface["NDA Policy warning"] = "Welcome to JustEmuTarkov. Good luck!";
    }

    return JSON.stringify(langBase);
}

module.exports.getLanguages = getLanguages;
module.exports.getMenu = getMenu;
module.exports.getGlobal = getGlobal;