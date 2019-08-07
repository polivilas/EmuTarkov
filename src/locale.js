"use strict";

const utility = require('./utility.js');

var localePath = "data/configs/locale/";

function getLanguages() {
    return utility.readJson(localePath + "languages.json");
}

function getMenu(lang) {
    let langName = lang.toLowerCase();
    let json = JSON.parse(utility.readJson(localePath + langName + "/menu.json"));

    // general
    json.data.menu["Escape from Tarkov"] = "JUST EMUTARKOV";
    json.data.menu["{0} Beta version"] = "{0} | Just EmuTarkov | justemutarkov.github.io";

    return JSON.stringify(json);
}

function getGlobal(lang) {
    let langName = lang.toLowerCase();
    let json = JSON.parse(utility.readJson(localePath + langName + "/global.json"));

    // language specific
    switch (lang) {
        case "ru":
            json.data.interface["NDA Policy warning"] = "Добро Пожаловать в Just EmuTarkov. Удачи!";
            break;

        default:
            json.data.interface["NDA Policy warning"] = "Welcome to Just EmuTarkov. Good luck!";
    }

    // general
    json.data.interface["Escape from Tarkov"] = "JUST EMUTARKOV";

    return JSON.stringify(json);
}

module.exports.getLanguages = getLanguages;
module.exports.getMenu = getMenu;
module.exports.getGlobal = getGlobal;