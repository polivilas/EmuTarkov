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
        case "assort": filepaths.assort[fileName] = filePath; break;
        case "userCache": filepaths.user.cache[fileName] = filePath; break;
    }
}

function exist() {
    if (settings.debug.rebuildCache) {
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

function getLocaleFilepaths(shortName) {
    switch (shortName) {
        case "ru": return filepaths.locales.ru;
        case "ge": return filepaths.locales.ge;
        case "fr": return filepaths.locales.fr;
        default: return filepaths.locales.en;
    }
}

function localesHelper(shortName) {
    console.log("Caching: locale_" + shortName + ".json");

    let base = json.parse(json.read("db/cache/locale.json"));
    let localeFilepath = getLocaleFilepaths(shortName);

    let inputDir = [
        "db/locales/" + shortName + "/mail/",
        "db/locales/" + shortName + "/quest/",
        "db/locales/" + shortName + "/preset/",
        "db/locales/" + shortName + "/handbook/",
        "db/locales/" + shortName + "/season/",
        "db/locales/" + shortName + "/templates/",
        "db/locales/" + shortName + "/locations/",
        "db/locales/" + shortName + "/banners/",
        "db/locales/" + shortName + "/trading/",
    ];

    base.data.interface = json.parse(json.read("db/locales/" + shortName + "/interface.json"));
    base.data.error = json.parse(json.read("db/locales/" + shortName + "/error.json"));
    
    localeFilepath.menu = "db/locales/" + shortName + "/menu.json";
    localeFilepath.interface = "db/locales/" + shortName + "/interface.json";
    localeFilepath.error = "db/locales/" + shortName + "/error.json";

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

    json.write("user/cache/locale_" + shortName + ".json", base, true);

    switch (shortName) {
        case "ru": filepaths.locales.ru = localeFilepath; break;
        case "ge": filepaths.locales.ge = localeFilepath; break;
        case "fr": filepaths.locales.fr = localeFilepath; break;
        default: filepaths.locales.en = localeFilepath; break;
    }
}

function locales() {
    localesHelper("en");
    localesHelper("ge");
    localesHelper("fr");
    localesHelper("ru");
}

function weather() {
    console.log("Caching: weather");
    genericFilepathCacher("weather", "db/weather");
}

function maps() {
    console.log("Caching: maps");
    genericFilepathCacher("maps", "db/maps");
}

function assort() {
    console.log("Caching: assort");
    genericFilepathCacher("assort", "db/assort");
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
    locales();
    
    // just filepaths
    userCache();
    weather();
    maps();
    assort();
    bots();
    images();
    others();

    dumpFilepaths();
    console.log("Done: caching files");
}

module.exports.exist = exist;
module.exports.all = all;