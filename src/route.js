"use strict";

require('./libs.js');

function flush() {
    filepaths = json.parse(json.read("db/cache/filepaths.json"));
}

function dump() {
    json.write("user/cache/filepaths.json", filepaths, true);
}

function genericFilepathCacher(type, basepath) {
    console.log("Routing: " + basepath + "/");

    let inputDir = basepath + "/";
    let inputFiles = fs.readdirSync(inputDir);
    
    for (let file in inputFiles) {
        let filePath = inputDir + inputFiles[file];
        let fileName = inputFiles[file].replace(".json", "");

        switch (type) {
            case "items": filepaths.items[fileName] = filePath; break;
            case "quests": filepaths.quests[fileName] = filePath; break;
            case "traders": filepaths.traders[fileName] = filePath; break;
            case "locations": filepaths.locations[fileName] = filePath; break;
            case "languages": filepaths.locales.languages[fileName] = filePath; break;
            case "customOutfits": filepaths.customization.outfits[fileName] = filePath; break;
            case "customOffers": filepaths.customization.offers[fileName] = filePath; break;
            case "hideoutAreas": filepaths.hideout.areas[fileName] = filePath; break;
            case "hideoutProd": filepaths.hideout.production[fileName] = filePath; break;
            case "hideoutScav": filepaths.hideout.scavcase[fileName] = filePath; break;
            case "weather": filepaths.weather[fileName] = filePath; break;
            case "maps": filepaths.maps[fileName] = filePath; break;
            case "botsInv": filepaths.bots.inventory[fileName] = filePath; break;
            case "userCache": filepaths.user.cache[fileName] = filePath; break;
        }
    }
}

function items() {
    genericFilepathCacher("items", "db/items");
}

function quests() {
    genericFilepathCacher("quests", "db/quests");
}

function traders() {
    genericFilepathCacher("traders", "db/traders");
}

function locations() {
    genericFilepathCacher("locations", "db/locations");
}

function languages() {
    genericFilepathCacher("languages", "db/locales/languages");
}

function customizationOutfits() {
    genericFilepathCacher("customOutfits", "db/customization/outfits");
}

function customizationOffers() {
    genericFilepathCacher("customOffers", "db/customization/offers");
}

function hideoutAreas() {
    genericFilepathCacher("hideoutAreas", "db/hideout/areas");
}

function hideoutProduction() {
    genericFilepathCacher("hideoutProd", "db/hideout/production");
}

function hideoutScavcase() {
    genericFilepathCacher("hideoutScav", "db/hideout/scavcase");
}

function templates() {
    console.log("Caching: templates.json");

    let inputDir = [
        "db/templates/Categories/",
        "db/templates/Items/"
    ];

    for (let path in inputDir) {
        let inputFiles = fs.readdirSync(inputDir[path]);

        for (let file in inputFiles) {
            let filePath = inputDir[path] + inputFiles[file];
            let fileName = inputFiles[file].replace(".json", "");

            if (path == 0) {
                filepaths.templates.categories[fileName] = filePath;
            } else {
                filepaths.templates.items[fileName] = filePath;
            }
        }
    }
}

function assort() {
    let dirList = utility.getDirList("db/assort/");

    for (let trader in dirList) {
        console.log("Caching: assort_" + dirList[trader]);

        let assortFilePath = {"items":{}, "barter_scheme":{}, "loyal_level_items":{}};
        let inputDir = [
            "db/assort/" + dirList[trader] + "/items/",
            "db/assort/" + dirList[trader] + "/barter/",
            "db/assort/" + dirList[trader] + "/loyalty/"
        ];

        for (let path in inputDir) {
            let inputFiles = fs.readdirSync(inputDir[path]);

            for (let file in inputFiles) {
                let filePath = inputDir[path] + inputFiles[file];
                let fileName = inputFiles[file].replace(".json", "");
                let fileData = json.parse(json.read(filePath));

                if (path == 0) {
                    assortFilePath.items[fileData._id] = filePath;
                } else if (path == 1) {
                    assortFilePath.barter_scheme[fileName] = filePath;
                } else if (path == 2) {
                    assortFilePath.loyal_level_items[fileName] = filePath;
                }
            }
        }

        filepaths.assort[dirList[trader]] = assortFilePath;
        filepaths.user.cache["assort_" + dirList[trader]] = "user/cache/assort_" + dirList[trader] + ".json";
    }
}


function locales() {
    let dirList = utility.getDirList("db/locales/");

    for (let dir in dirList) {
        if (dirList[dir] == "languages") {
            continue;
        }

        let locale = dirList[dir];
        let localeFilepath = {"menu": "", "interface": "", "error": "", "mail": {}, "quest": {}, "preset": {}, "handbook": {}, "season": {}, "templates": {}, "locations": {}, "banners": {}, "trading": {}}
        let inputDir = [
            "db/locales/" + locale + "/mail/",
            "db/locales/" + locale + "/quest/",
            "db/locales/" + locale + "/preset/",
            "db/locales/" + locale + "/handbook/",
            "db/locales/" + locale + "/season/",
            "db/locales/" + locale + "/templates/",
            "db/locales/" + locale + "/locations/",
            "db/locales/" + locale + "/banners/",
            "db/locales/" + locale + "/trading/",
        ];

        console.log("Routing: locale_" + locale + ".json");
        
        localeFilepath.menu = "db/locales/" + locale + "/menu.json";
        localeFilepath.interface = "db/locales/" + locale + "/interface.json";
        localeFilepath.error = "db/locales/" + locale + "/error.json";

        for (let path in inputDir) {
            let inputFiles = fs.readdirSync(inputDir[path]);
            
            for (let file in inputFiles) {
                let filePath = inputDir[path] + inputFiles[file];
                let fileName = inputFiles[file].replace(".json", "");

                if (path == 0) {
                    localeFilepath.mail[fileName] = filePath;
                } else if (path == 1) {
                    localeFilepath.quest[fileName] = filePath;
                } else if (path == 2) {
                    localeFilepath.preset[fileName] = filePath;
                } else if (path == 3) {
                    localeFilepath.handbook[fileName] = filePath;
                } else if (path == 4) {
                    localeFilepath.season[fileName] = filePath;
                } else if (path == 5) {
                    localeFilepath.templates[fileName] = filePath;
                } else if (path == 6) {
                    localeFilepath.locations[fileName] = filePath;
                } else if (path == 7) {
                    localeFilepath.banners[fileName] = filePath;
                } else if (path == 8) {
                    localeFilepath.trading[fileName] = filePath;
                }
            }
        }

        filepaths.locales[locale] = localeFilepath;
    }
}

function weather() {
    genericFilepathCacher("weather", "db/weather");
}

function maps() {
    genericFilepathCacher("maps", "db/maps");
}

function bots() {
    console.log("Routing: bots");
    filepaths.bots.base = "db/bots/base.json";
    filepaths.bots.names = "db/bots/names.json";
    filepaths.bots.outfits = "db/bots/outfits.json";
    genericFilepathCacher("botsInv", "db/bots/inventory");
}

function images() {
    console.log("Routing: images");

    let inputDir = [
        "res/banners/",
        "res/handbook/",
        "res/hideout/",
        "res/quest/",
        "res/trader/",
    ];

    for (let path in inputDir) {
        let inputFiles = fs.readdirSync(inputDir[path]);
        
        for (let file in inputFiles) {
            let filePath = inputDir[path] + inputFiles[file];
            let fileName = inputFiles[file].replace(".png", "").replace(".jpg", "");

            if (path == 0) {
                filepaths.images.banners[fileName] = filePath;
            } else if (path == 1) {
                filepaths.images.handbook[fileName] = filePath;
            } else if (path == 2) {
                filepaths.images.hideout[fileName] = filePath;
            } else if (path == 3) {
                filepaths.images.quest[fileName] = filePath;
            } else if (path == 4) {
                filepaths.images.trader[fileName] = filePath;
            }
        }
    }
}

function others() {
    console.log("Routing: others");
    filepaths.user.config = "user/server.config.json";
    filepaths.user.profiles.list = "user/profiles/list.json";
    filepaths.user.profiles.character = "user/profiles/__REPLACEME__/character.json";
    filepaths.user.profiles.storage = "user/profiles/__REPLACEME__/storage.json";
    filepaths.user.profiles.userBuilds = "user/profiles/__REPLACEME__/userBuilds.json";
    filepaths.globals = "db/globals.json";
    filepaths.hideout.settings = "db/hideout/settings.json";
    filepaths.ragfair.offer = "db/ragfair/offer.json";
    filepaths.ragfair.search = "db/ragfair/search.json";
    filepaths.cert.server.cert = "cert/server.cert";
    filepaths.cert.server.key = "cert/server.key";
}

function cache() {
    let assortList = utility.getDirList("db/assort/");
    let localesList = utility.getDirList("db/locales/");

    filepaths.user.cache.items = "user/cache/items.json";
    filepaths.user.cache.quests = "user/cache/quests.json";
    filepaths.user.cache.traders = "user/cache/traders.json";
    filepaths.user.cache.locations = "user/cache/locations.json";
    filepaths.user.cache.customization_outfits = "user/cache/customization_outfits.json";
    filepaths.user.cache.customization_offers = "user/cache/customization_offers.json";
    filepaths.user.cache.hideout_areas = "user/cache/hideout_areas.json";
    filepaths.user.cache.hideout_production = "user/cache/hideout_production.json";
    filepaths.user.cache.hideout_scavcase = "user/cache/hideout_scavcase.json";
    filepaths.user.cache.templates = "user/cache/templates.json";

    for (let assort in assortList) {
        filepaths.user.cache[assortList[assort]] = "user/cache/assort_" + localesList[assort] + ".json";
    }

    for (let locale in localesList) {
        filepaths.user.cache[localesList[locale]] = "user/cache/locale_" + localesList[locale] + ".json";
    }
}

function loadMods() {
    let modList = settings.mods.list;

    for (let element in modList) {
        if (!modList[element].enabled) {
            console.log("Skipping mod " + modList[element].name + " v" + modList[element].version);
            continue;
        } else {
            console.log("Loading mod " + modList[element].name + " v" + modList[element].version);
        }

        let mod = json.parse(json.read("user/mods/" + modList[element].name + "/mod.config.json"))

        // assort
        for (let assort in mod.files.assort) {
            if (mod.files.assort[assort] == null) {
                delete filepaths.assort[assort];
                continue;
            }

            if (!filepaths.assort.hasOwnProperty(mod.files.assort[assort])) {
                filepaths.assort[assort] = mod.files.assort[assort];
                continue;
            }
            
            let activeAssort = mods.files.assort

            // assort items
            for (let item in activeAssort.items) {
                if (activeAssort.items[item] == "delete") {
                    delete filepaths.assort[assort].items[item];
                }

                filepaths.assort[assort].items[item] = activeAssort.items[item];
            }

            // assort barter_scheme
            for (let item in activeAssort.items) {
                if (activeAssort.barter_scheme[item] == "delete") {
                    delete filepaths.assort[assort].barter_scheme[item];
                }

                filepaths.assort[assort].barter_scheme[item] = activeAssort.barter_scheme[item];
            }

            // assort loyal_level_items
            for (let item in activeAssort.items) {
                if (activeAssort.loyal_level_items[item] == "delete") {
                    delete filepaths.assort[assort].loyal_level_items[item];
                }

                filepaths.assort[assort].loyal_level_items[item] = activeAssort.loyal_level_items[item];
            }
        }

        // items
        for (let item in mod.files.items) {
            if (mod.files.items[item] == "delete") {
                delete filepaths.items[item];
            }

            filepaths.items[item] = mod.files.items[item];
        }
    }
}

function routeDatabase() {
    items();
    quests();
    traders();
    locations();
    languages();
    customizationOutfits();
    customizationOffers();
    hideoutAreas();
    hideoutProduction();
    hideoutScavcase();
    templates();
    assort();
    locales();
    weather();
    maps();
    bots();
    images();
    cache();
    others();
}

function all() {
    // force rebuilding routes
    let force = settings.mods.rebuildRoutes;

    // routes are not routed
    if (force || !fs.existsSync("user/cache/filepaths.json")) {
        routeDatabase();
        dump();
    }

    // mods haven't been added
    if (force || settings.mods.currList.length > 0 && settings.mods.prevList == 0) {
        settings.mods.prevList = settings.mods.currList;
        loadMods();
        dump();
    }

    // modlist has changed
    for (let mod in settings.mods.currList) {
        if (force) {
            break;
        }

        if (settings.mods.currList[mod].name != settings.mods.prevList[mod].name || settings.mods.currList[mod].version != settings.mods.prevList[mod].version) {4
            settings.mods.prevList = settings.mods.currList;
            routeDatabase();
            loadMods();
            dump();
            break;
        }
    }

    filepaths = json.parse(json.read("user/cache/filepaths.json"));
    settings.mods.rebuildRoutes = false;
}

module.exports.all = all;