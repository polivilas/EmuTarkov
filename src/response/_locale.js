"use strict";

require('../libs.js');

function getLanguages() {
    return json.read(filepaths.user.cache.languages);
}

function getMenu(lang = "en") {
    let base = filepaths.locales[lang.toLowerCase()];

    return json.read(base.menu);
}

function getGlobal(lang = "en") {
    return json.read(filepaths.user.cache["locale_" + lang.toLowerCase()]);
}

module.exports.getLanguages = getLanguages;
module.exports.getMenu = getMenu;
module.exports.getGlobal = getGlobal;