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
    json.data.menu["Escape from Tarkov"] = "JustEmuTarkov";
    json.data.menu["{0} Beta version"] = "{0} | JustEmuTarkov | justemutarkov.github.io";
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
        case "de":
            json.data.interface["NDA Policy warning"] = "Willkommen bei JustEmuTarkov. Viel glück";
            break;
        default:
            json.data.interface["NDA Policy warning"] = "Welcome to JustEmuTarkov. Good luck!";
    }
    // general
    json.data.interface["Escape from Tarkov"] = "JustEmuTarkov";

    return JSON.stringify(json);
}

module.exports.getLanguages = getLanguages;
module.exports.getMenu = getMenu;
module.exports.getGlobal = getGlobal;