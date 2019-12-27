"use strict";

require('../libs.js');

function cache(mod) {
    if (!mod.files.hasOwnProperty("user")) {
       return;
    }

    if (!mod.files.user.hasOwnProperty("cache")) {
        return;
    }

    let inputNames = Object.keys(mod.files.user.cache);
    let i = 0;

    for (let item in mod.files.user.cache) {
        filepaths.user.cache[inputNames[i++]] = mod.files.user.cache[item];
    }
}

function items(mod) {
    if (!mod.files.hasOwnProperty("items")) {
        return;
    }

    let inputNames = Object.keys(mod.files.items);
    let i = 0;

    for (let item in mod.files.items) {
        filepaths.items[inputNames[i++]] = mod.files.items[item];
    }
}

function quests(mod) {
    if (!mod.files.hasOwnProperty("quests")) {
        return;
    }

    let inputNames = Object.keys(mod.files.quests);
    let i = 0;

    for (let item in mod.files.quests) {
        filepaths.quests[inputNames[i++]] = mod.files.quests[item];
    }
}

function traders(mod) {
    if (!mod.files.hasOwnProperty("traderss")) {
        return;
    }

    let inputNames = Object.keys(mod.files.traders);
    let i = 0;

    for (let item in mod.files.traders) {
        filepaths.traders[inputNames[i++]] = mod.files.traders[item];
        filepaths.user.profiles.traders[fileName] = "user/profiles/__REPLACEME__/traders/" + fileName + ".json";
    }
}

function locations(mod) {
    if (!mod.files.hasOwnProperty("locations")) {
        return;
    }

    let inputNames = Object.keys(mod.files.locations);
    let i = 0;

    for (let item in mod.files.locations) {
        filepaths.locations[inputNames[i++]] = mod.files.locations[item];
    }
}

function assort(mod) {
    if (!mod.files.hasOwnProperty("assort")) {
        return;
    }

    let inputNames = Object.keys(mod.files.assort);
    let i = 0;

    for (let assort in mod.files.assort) {
        // create assort
        if (!filepaths.assort.hasOwnProperty(inputNames[i])) {
            filepaths.assort[inputNames[i++]] = mod.files.assort[assort];
            continue;
        }
        
        // set active assort
        let activeAssort = mod.files.assort[assort];

        // assort items
        inputNames = Object.keys(activeAssort.items);
        i = 0;

        for (let item in activeAssort.items) {
            filepaths.assort[assort].items[inputNames[i++]] = activeAssort.items[item];
        }

        // assort barter_scheme
        inputNames = Object.keys(activeAssort.barter_scheme);
        i = 0;

        for (let item in activeAssort.barter_scheme) {
            filepaths.assort[assort].barter_scheme[inputNames[i++]] = activeAssort.barter_scheme[item];
        }

        // assort loyal_level_items
        inputNames = Object.keys(activeAssort.loyal_level_items);
        i = 0;

        for (let item in activeAssort.loyal_level_items) {
            filepaths.assort[assort].loyal_level_items[inputNames[i++]] = activeAssort.loyal_level_items[item];
        }
    }
}

function locales(mod) {
    if (!mod.files.hasOwnProperty("locales")) {
        return;
    }

    let inputNames = Object.keys(mod.files.locales);
    let i = 0;

    for (let locale in mod.files.locales) {
        // create locale
        if (!filepaths.locales.hasOwnProperty(inputNames[i])) {
            filepaths.locales[inputNames[i++]] = mod.files.locales[locale];
            continue;
        }
        
        // set active locale
        let activeLocale = mod.files.locales[locale];

        // set static locale data
        filepaths.locales[locale].name = activeLocale.shortname;
        filepaths.locales[locale].menu = activeLocale.menu;
        filepaths.locales[locale].interface = activeLocale.interface;
        filepaths.locales[locale].error = activeLocale.error;

        // locale banners
        inputNames = Object.keys(activeLocale.banners);
        i = 0;

        for (let text in activeLocale.banners) {
            filepaths.locales[locale].banners[inputNames[i++]] = activeLocale.banners[text];
        }

        // locale handbook
        inputNames = Object.keys(activeLocale.handbook);
        i = 0;

        for (let text in activeLocale.handbook) {
            filepaths.locales[locale].handbook[inputNames[i++]] = activeLocale.handbook[text];
        }

        // locale locations
        inputNames = Object.keys(activeLocale.locations);
        i = 0;

        for (let text in activeLocale.locations) {
            filepaths.locales[locale].locations[inputNames[i++]] = activeLocale.locations[text];
        }

        // locale mail
        inputNames = Object.keys(activeLocale.mail);
        i = 0;

        for (let text in activeLocale.mail) {
            filepaths.locales[locale].mail[inputNames[i++]] = activeLocale.mail[text];
        }

        // locale preset
        inputNames = Object.keys(activeLocale.preset);
        i = 0;

        for (let text in activeLocale.preset) {
            filepaths.locales[locale].preset[inputNames[i++]] = activeLocale.preset[text];
        }

        // locale quest
        inputNames = Object.keys(activeLocale.quest);
        i = 0;

        for (let text in activeLocale.quest) {
            filepaths.locales[locale].quest[inputNames[i++]] = activeLocale.quest[text];
        }

        // locale season
        inputNames = Object.keys(activeLocale.season);
        i = 0;

        for (let text in activeLocale.season) {
            filepaths.locales[locale].season[inputNames[i++]] = activeLocale.season[text];
        }

        // locale templates
        inputNames = Object.keys(activeLocale.templates);
        i = 0;

        for (let text in activeLocale.templates) {
            filepaths.locales[locale].templates[inputNames[i++]] = activeLocale.templates[text];
        }

        // locale trading
        inputNames = Object.keys(activeLocale.trading);
        i = 0;

        for (let text in activeLocale.trading) {
            filepaths.locales[locale].trading[inputNames[i++]] = activeLocale.trading[text];
        }
    }
}

function isRebuildRequired() {
    let modList = settings.mods.list;

    if (!fs.existsSync("user/cache/mods.json")) {
        return true;
    }

    let cachedList = json.parse(json.read("user/cache/mods.json"));

    if (modList.length !== cachedList.length) {
        return true;
    }

    for (let mod in modList) {
        if (modList[mod].name !== cachedList[mod].name) {
            return true;
        }
            
        if (modList[mod].version !== cachedList[mod].version) {
            return true;
        }
        
        if (modList[mod].enabled !== typeof undefined && cachedList[mod].enabled !== typeof undefined && modList[mod].enabled !== cachedList[mod].enabled) {
            return true;
        }
    }

    return false;
}

function load() {
    let modList = settings.mods.list;

    for (let element of modList) {
        // skip mod
        if (element.enabled !== undefined && !element.enabled) {
            console.log("Skipping mod " + element.author + "-" + element.name + " v" + element.version);
            continue;
        }

        // apply mod
        let mod = json.parse(json.read("user/mods/" + element.author + "-" + element.name + "/mod.config.json"))

        console.log("Loading mod " + element.author + "-" + element.name + " v" + element.version);
        
        cache(mod);
        items(mod);
        quests(mod);
        traders(mod);
        locations(mod);
        assort(mod);
        locales(mod);
    }
}

module.exports.isRebuildRequired = isRebuildRequired;
module.exports.load = load;