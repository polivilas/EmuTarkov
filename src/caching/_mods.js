"use strict";

require('../libs.js');

function cache(mod) {
    if (!mod.files.hasOwnProperty("user")) {
       return;
    }

    for (let item in mod.files.user.cache) {
        filepaths.user.cache[item] = mod.files.user.cache[item];
    }
}

function items(mod) {
    if (!mod.files.hasOwnProperty("items")) {
        return;
    }

    for (let item in mod.files.items) {
        filepaths.items[item] = mod.files.items[item];
    }
}

function quests(mod) {
    if (!mod.files.hasOwnProperty("quests")) {
        return;
    }

    for (let item in mod.files.quests) {
        filepaths.quests[item] = mod.files.quests[item];
    }
}

function traders(mod) {
    if (!mod.files.hasOwnProperty("traders")) {
        return;
    }

    for (let item in mod.files.traders) {
        filepaths.traders[item] = mod.files.traders[item];
        filepaths.user.profiles.traders[item] = "user/profiles/__REPLACEME__/traders/" + item + ".json";
    }
}

function locations(mod) {
    if (!mod.files.hasOwnProperty("locations")) {
        return;
    }

    for (let item in mod.files.locations) {
        filepaths.locations[item] = mod.files.locations[item];
    }
}

function weather(mod) {
    if (!mod.files.hasOwnProperty("weather")) {
        return;
    }

    for (let item in mod.files.weather) {
        filepaths.weather[item] = mod.files.weather[item];
    }
}

function customizationOffers(mod) {
    if (!mod.files.hasOwnProperty("customization") || !mod.files.customization.hasOwnProperty("offers")) {
        return;
    }

    for (let item in mod.files.customization.offers) {
        filepaths.customization.offers[item] = mod.files.customization.offers[item];
    }
}

function customizationOutfits(mod) {
    if (!mod.files.hasOwnProperty("customization") || !mod.files.customization.hasOwnProperty("outfits")) {
        return;
    }

    for (let item in mod.files.customization.outfits) {
        filepaths.customization.outfits[item] = mod.files.customization.outfits[item];
    }
}

function hideoutAreas(mod) {
    if (!mod.files.hasOwnProperty("hideout") || !mod.files.customization.hasOwnProperty("areas")) {
        return;
    }

    for (let item in mod.files.hideout.areas) {
        filepaths.hideout.areas[item] = mod.files.hideout.areas[item];
    }
}

function hideoutProduction(mod) {
    if (!mod.files.hasOwnProperty("hideout") || !mod.files.customization.hasOwnProperty("production")) {
        return;
    }

    for (let item in mod.files.hideout.production) {
        filepaths.hideout.production[item] = mod.files.hideout.production[item];
    }
}

function hideoutScavcase(mod) {
    if (!mod.files.hasOwnProperty("hideout") || !mod.files.customization.hasOwnProperty("scavcase")) {
        return;
    }

    for (let item in mod.files.hideout.scavcase) {
        filepaths.hideout.scavcase[item] = mod.files.hideout.scavcase[item];
    }
}

function maps(mod) {
    if (!mod.files.hasOwnProperty("maps")) {
        return;
    }

    for (let item in mod.files.maps) {
        filepaths.maps[item] = mod.files.maps[item];
    }
}

function ragfair(mod) {
    if (!mod.files.hasOwnProperty("ragfair")) {
        return;
    }

    for (let item in mod.files.ragfair) {
        filepaths.ragfair[item] = mod.files.ragfair[item];
    }
}

function templatesCategories(mod) {
    if (!mod.files.hasOwnProperty("templates") || !mod.files.hasOwnProperty("categories")) {
        return;
    }

    for (let item in mod.files.templates.categories) {
        filepaths.templates.categories[item] = mod.files.templates.categories[item];
    }
}

function templatesItems(mod) {
    if (!mod.files.hasOwnProperty("templates") || !mod.files.hasOwnProperty("items")) {
        return;
    }

    for (let item in mod.files.templates.items) {
        filepaths.templates.items[item] = mod.files.templates.items[item];
    }
}

function globals(mod) {
    if (!mod.files.hasOwnProperty("globals")) {
        return;
    }

    filepaths.globals = mod.files.globals;
}

function assort(mod) {
    if (!mod.files.hasOwnProperty("assort")) {
        return;
    }

    for (let assort in mod.files.assort) {
        // create assort
        if (!filepaths.assort.hasOwnProperty(assort)) {
            filepaths.assort[assort] = mod.files.assort[assort];
            continue;
        }
        
        // set active assort
        let activeAssort = mod.files.assort[assort];

        // assort items
        for (let item in activeAssort.items) {
            filepaths.assort[assort].items[item] = activeAssort.items[item];
        }

        // assort barter_scheme
        for (let item in activeAssort.barter_scheme) {
            filepaths.assort[assort].barter_scheme[item] = activeAssort.barter_scheme[item];
        }

        // assort loyal_level_items
        for (let item in activeAssort.loyal_level_items) {
            filepaths.assort[assort].loyal_level_items[item] = activeAssort.loyal_level_items[item];
        }
    }
}

function locales(mod) {
    if (!mod.files.hasOwnProperty("locales")) {
        return;
    }

    for (let locale in mod.files.locales) {
        // create locale
        if (!filepaths.locales.hasOwnProperty(locale)) {
            filepaths.locales[locale] = mod.files.locales[locale];
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
        for (let item in activeLocale.banners) {
            filepaths.locales[locale].banners[item] = activeLocale.banners[item];
        }

        // locale handbook
        for (let item in activeLocale.handbook) {
            filepaths.locales[locale].handbook[item] = activeLocale.handbook[item];
        }

        // locale locations
        for (let item in activeLocale.locations) {
            filepaths.locales[locale].locations[item] = activeLocale.locations[item];
        }

        // locale mail
        for (let item in activeLocale.mail) {
            filepaths.locales[locale].mail[item] = activeLocale.mail[item];
        }

        // locale preset
        for (let item in activeLocale.preset) {
            filepaths.locales[locale].preset[item] = activeLocale.preset[item];
        }

        // locale quest
        for (let item in activeLocale.quest) {
            filepaths.locales[locale].quest[item] = activeLocale.quest[item];
        }

        // locale season
        for (let item in activeLocale.season) {
            filepaths.locales[locale].season[item] = activeLocale.season[item];
        }

        // locale templates
        for (let item in activeLocale.templates) {
            filepaths.locales[locale].templates[item] = activeLocale.templates[item];
        }

        // locale trading
        for (let item in activeLocale.trading) {
            filepaths.locales[locale].trading[item] = activeLocale.trading[item];
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
        weather(mod);
        customizationOffers(mod);
        customizationOutfits(mod);
        hideoutAreas(mod);
        hideoutProduction(mod);
        hideoutScavcase(mod);
        maps(mod);
        ragfair(mod);
        templatesCategories(mod);
        templatesItems(mod);
        globals(mod);
        assort(mod);
        locales(mod);
    }
}

module.exports.isRebuildRequired = isRebuildRequired;
module.exports.load = load;