"use strict";

require('./libs.js');

function flushFilepaths() {
    filepaths = json.parse(json.read("db/cache/filepaths.json"));
}

function dumpFilepaths() {
    json.write("user/cache/filepaths.json", filepaths, true);
}

function setFilePath(type, fileName, filePath) {
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

function exist() {
    if (settings.mods.rebuildCache) {
        return false;
    }

    if (!fs.existsSync("user/cache/filepaths.json")) {
        return false;
    }

    for (let file in filepaths.user.cache) {
        if (!fs.existSync(filepaths.user.cache[file])) {
            return false;
        }
    }

    return true;
}

function genericFilepathCacher(type, basepath) {
    let inputDir = basepath + "/";
    let inputFiles = fs.readdirSync(inputDir);
    
    for (let file in inputFiles) {
        let filePath = inputDir + inputFiles[file];
        let fileName = inputFiles[file].replace(".json", "");

        setFilePath(type, fileName, filePath);
    }
}

function genericCacher(type, basepath, cachename) {
    console.log("Caching: " + cachename);

    let base = json.parse(json.read("db/cache/" + cachename));
    let inputDir = basepath + "/";
    let inputFiles = fs.readdirSync(inputDir);

    for (let file in inputFiles) {
        let filePath = inputDir + inputFiles[file];
        let fileData = json.parse(json.read(filePath));
        let fileName = "";

        switch (type) {
            case "customOffers":
            case "hideoutAreas":
            case "hideoutProd":
            case "hideoutScav":
                fileName = inputFiles[file].replace(".json", "");
                base.data.push(fileData);
                break;

            case "quests":
            case "traders":
                fileName = fileData._id;
                base.data.push(fileData);
                break;

            case "items":
                fileName = fileData._id;

                if (settings.debug.examinedByDefault) {
                    fileData._props.ExaminedByDefault = true;
                }

                base.data[fileName] = fileData;
                break;

            case "locations":
                fileName = inputFiles[file].replace(".json", "");
                base.data.locations[fileName] = fileData;
                break;
            
            case "languages":
                fileName = fileData.ShortName;
                base.data.push(fileData);
                break;

            case "customOutfits":
                fileName = inputFiles[file].replace(".json", "");
                base.data[fileName] = fileData;
                break;
        }

        setFilePath(type, fileName, filePath);
    }

    json.write("user/cache/" + cachename, base, true);
}

function items() {
    genericCacher("items", "db/items", "items.json");
}

function quests() {
    genericCacher("quests", "db/quests", "quests.json");
}

function traders() {
    genericCacher("traders", "db/traders", "traders.json");
}

function locations() {
    genericCacher("locations", "db/locations", "locations.json");
}

function languages() {
    genericCacher("languages", "db/locales/languages", "locale_languages.json");
}

function customizationOutfits() {
    genericCacher("customOutfits", "db/customization/outfits", "customization_outfits.json");
}

function customizationOffers() {
    genericCacher("customOffers", "db/customization/offers", "customization_offers.json");
}

function hideoutAreas() {
    genericCacher("hideoutAreas", "db/hideout/areas", "hideout_areas.json");
}

function hideoutProduction() {
    genericCacher("hideoutProd", "db/hideout/production", "hideout_production.json");
}

function hideoutScavcase() {
    genericCacher("hideoutScav", "db/hideout/scavcase", "hideout_scavcase.json");
}

function templates() {
    console.log("Caching: templates.json");

    let base = json.parse(json.read("db/cache/templates.json"));
    let inputDir = [
        "db/templates/Categories/",
        "db/templates/Items/"
    ];

    for (let path in inputDir) {
        let inputFiles = fs.readdirSync(inputDir[path]);

        for (let file in inputFiles) {
            let filePath = inputDir[path] + inputFiles[file];
            let fileData = json.parse(json.read(filePath));
            let fileName = inputFiles[file].replace(".json", "");

            if (path == 0) {
                base.data.Categories.push(fileData);
                filepaths.templates.categories[fileName] = filePath;
            } else {
                base.data.Items.push(fileData);
                filepaths.templates.items[fileName] = filePath;
            }
        }
    }

    json.write("user/cache/templates.json", base, true);
}

function assort() {
    let dirList = utility.getDirList("db/assort/");

    for (let trader in dirList) {
        console.log("Caching: assort_" + dirList[trader]);

        let base = json.parse(json.read("db/cache/assort.json"));
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
                    base.data.items.push(fileData);
                    assortFilePath.items[fileData._id] = filePath;
                } else if (path == 1) {
                    base.data.barter_scheme[fileName] = fileData;
                    assortFilePath.barter_scheme[fileName] = filePath;
                } else if (path == 2) {
                    base.data.loyal_level_items[fileName] = fileData;
                    assortFilePath.loyal_level_items[fileName] = filePath;
                }
            }
        }

        json.write("user/cache/assort_" + dirList[trader] + ".json", base);
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

        let base = json.parse(json.read("db/cache/locale.json"));
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

        console.log("Caching: locale_" + locale + ".json");

        base.data.interface = json.parse(json.read("db/locales/" + locale + "/interface.json"));
        base.data.error = json.parse(json.read("db/locales/" + locale + "/error.json"));
        
        localeFilepath.menu = "db/locales/" + locale + "/menu.json";
        localeFilepath.interface = "db/locales/" + locale + "/interface.json";
        localeFilepath.error = "db/locales/" + locale + "/error.json";

        for (let path in inputDir) {
            let inputFiles = fs.readdirSync(inputDir[path]);
            
            for (let file in inputFiles) {
                let filePath = inputDir[path] + inputFiles[file];
                let fileData = json.parse(json.read(filePath));
                let fileName = inputFiles[file].replace(".json", "");

                if (path == 0) {
                    base.data.mail[fileName] = fileData;
                    localeFilepath.mail[fileName] = filePath;
                } else if (path == 1) {
                    base.data.quest[fileName] = fileData;
                    localeFilepath.quest[fileName] = filePath;
                } else if (path == 2) {
                    base.data.preset[fileName] = fileData;
                    localeFilepath.preset[fileName] = filePath;
                } else if (path == 3) {
                    base.data.handbook[fileName] = fileData;
                    localeFilepath.handbook[fileName] = filePath;
                } else if (path == 4) {
                    base.data.season[fileName] = fileData;
                    localeFilepath.season[fileName] = filePath;
                } else if (path == 5) {
                    base.data.templates[fileName] = fileData;
                    localeFilepath.templates[fileName] = filePath;
                } else if (path == 6) {
                    base.data.locations[fileName] = fileData;
                    localeFilepath.locations[fileName] = filePath;
                } else if (path == 7) {
                    base.data.banners[fileName] = fileData;
                    localeFilepath.banners[fileName] = filePath;
                } else if (path == 8) {
                    base.data.trading[fileName] = fileData;
                    localeFilepath.trading[fileName] = filePath;
                }
            }
        }

        json.write("user/cache/locale_" + locale + ".json", base, true);
        filepaths.locales[locale] = localeFilepath;
    }
}

function weather() {
    console.log("Caching: weather");
    genericFilepathCacher("weather", "db/weather");
}

function maps() {
    console.log("Caching: maps");
    genericFilepathCacher("maps", "db/maps");
}

function bots() {
    console.log("Caching: bots");
    filepaths.bots.base = "db/bots/base.json";
    filepaths.bots.names = "db/bots/names.json";
    filepaths.bots.outfits = "db/bots/outfits.json";
    genericFilepathCacher("botsInv", "db/bots/inventory");
}

function userCache() {
    genericFilepathCacher("userCache", "user/cache");
}

function images() {
    console.log("Caching: images");

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
    console.log("Caching: others");
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

function all() {
    console.log("Start: caching files");
    flushFilepaths();

    // full caching
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
    
    // just filepaths
    userCache();
    weather();
    maps();
    bots();
    images();
    others();

    // load server mods
    loadMods()

    dumpFilepaths();
    console.log("Done: caching files");
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

module.exports.exist = exist;
module.exports.all = all;