"use strict";

require('../libs.js');

function flush() {
    filepaths = json.parse(json.read("db/cache/filepaths.json"));
}

function dump() {
    json.write("user/cache/filepaths.json", filepaths);
}

function genericFilepathCacher(type, basepath) {
    logger.logInfo("Routing: " + basepath + "/");

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
            case "customOutfits": filepaths.customization.outfits[fileName] = filePath; break;
            case "customOffers": filepaths.customization.offers[fileName] = filePath; break;
            case "hideoutAreas": filepaths.hideout.areas[fileName] = filePath; break;
            case "hideoutProd": filepaths.hideout.production[fileName] = filePath; break;
            case "hideoutScav": filepaths.hideout.scavcase[fileName] = filePath; break;
            case "weather": filepaths.weather[fileName] = filePath; break;
            case "maps": filepaths.maps[fileName] = filePath; break;
            case "botsInv": filepaths.bots.inventory[fileName] = filePath; break;
            case "userCache": filepaths.user.cache[fileName] = filePath; break;
            case "profileTraders": filepaths.user.profiles.traders[fileName] = "user/profiles/__REPLACEME__/traders/" + fileName + ".json"; break;
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
    genericFilepathCacher("profileTraders", "db/traders");
}

function locations() {
    genericFilepathCacher("locations", "db/locations");
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
    logger.logInfo("Routing: db/templates/");

    let inputDir = [
        "db/templates/categories/",
        "db/templates/items/"
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
        logger.logInfo("Routing: db/assort/" + dirList[trader] + "/");

        let assortFilePath = {"items":{}, "barter_scheme":{}, "loyal_level_items":{}};
        let inputDir = [
            "db/assort/" + dirList[trader] + "/items/",
            "db/assort/" + dirList[trader] + "/barter/",
            "db/assort/" + dirList[trader] + "/level/"
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
    }
}

function weather() {
    genericFilepathCacher("weather", "db/weather");
}

function maps() {
    genericFilepathCacher("maps", "db/maps");
}

function bots() {
    logger.logInfo("Routing: bots");
    
    filepaths.bots.base = "db/bots/base.json";
    
    let inputDir = [
        "db/bots/pmc/bear/",
        "db/bots/pmc/usec/",
        "db/bots/scav/assault/",
        "db/bots/scav/bossbully/",
        "db/bots/scav/bossgluhar/",
        "db/bots/scav/bosskilla/",
        "db/bots/scav/bosskojaniy/",
        "db/bots/scav/followerbully/",
        "db/bots/scav/followergluharassault/",
        "db/bots/scav/followergluharscout/",
        "db/bots/scav/followergluharsecurity/",
        "db/bots/scav/followerkojaniy/",
        "db/bots/scav/marksman/",
        "db/bots/scav/pmcbot/"
    ];

    let cacheDir = [
        "appearance/body/",
        "appearance/head/",
        "appearance/hands/",
        "appearance/feet/",
        "appearance/voice/",
        "health/",
        "inventory/",
        "experience/",
        "names/"
    ];

    for (let path in inputDir) {
        let baseNode = json.parse(json.read("db/cache/bots.json"));

        for (let item in cacheDir) {
            let inputFiles = fs.readdirSync(inputDir[path] + cacheDir[item]);

            for (let file in inputFiles) {
                let filePath = inputDir[path] + cacheDir[item] + inputFiles[file];
                let fileName = inputFiles[file].replace(".json", "");

                if (item == 0) {
                    baseNode.appearance.body[fileName] = filePath;
                } else if (item == 1) {
                    baseNode.appearance.head[fileName] = filePath;
                } else if (item == 2) {
                    baseNode.appearance.hands[fileName] = filePath;
                } else if (item == 3) {
                    baseNode.appearance.feet[fileName] = filePath;
                } else if (item == 4) {
                    baseNode.appearance.voice[fileName] = filePath;
                } else if (item == 5) {
                    baseNode.health[fileName] = filePath;
                } else if (item == 6) {
                    baseNode.inventory[fileName] = filePath;
                } else if (item == 7) {
                    baseNode.experience[fileName] = filePath;
                } else if (item == 8) {
                    baseNode.names[fileName] = filePath;
                }
            }
        }
        
        if (path == 0) {
            filepaths.bots.pmc.bear = baseNode;
        } else if (path == 1) {
            filepaths.bots.pmc.usec = baseNode;
        } else if (path == 2) {
            filepaths.bots.scav.assault = baseNode;
        } else if (path == 3) {
            filepaths.bots.scav.bossbully = baseNode;
        } else if (path == 4) {
            filepaths.bots.scav.bossgluhar = baseNode;
        } else if (path == 5) {
            filepaths.bots.scav.bosskilla = baseNode;
        }  else if (path == 6) {
            filepaths.bots.scav.bosskojaniy = baseNode;
        } else if (path == 7) {
            filepaths.bots.scav.followerbully = baseNode;
        } else if (path == 8) {
            filepaths.bots.scav.followergluharassault = baseNode;
        } else if (path == 9) {
            filepaths.bots.scav.followergluharscout = baseNode;
        } else if (path == 10) {
            filepaths.bots.scav.followergluharsecurity = baseNode;
        } else if (path == 11) {
            filepaths.bots.scav.followerkojaniy = baseNode;
        } else if (path == 12) {
            filepaths.bots.scav.marksman = baseNode;
        } else if (path == 13) {
            filepaths.bots.scav.pmcbot = baseNode;
        }
    }
}

function images() {
    logger.logInfo("Routing: images");

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
    logger.logInfo("Routing: others");

    filepaths.profile.character = "db/profile/character.json";
    filepaths.profile.storage = "db/profile/storage.json";
    filepaths.profile.userbuilds = "db/profile/userbuilds.json";
    filepaths.user.profiles.list = "user/profiles/list.json";
    filepaths.user.profiles.character = "user/profiles/__REPLACEME__/character.json";
    filepaths.user.profiles.scav = "user/profiles/__REPLACEME__/scav.json";
    filepaths.user.profiles.storage = "user/profiles/__REPLACEME__/storage.json";
    filepaths.user.profiles.userbuilds = "user/profiles/__REPLACEME__/userbuilds.json";
    filepaths.user.config = "user/server.config.json";
    filepaths.globals = "db/globals.json";
    filepaths.hideout.settings = "db/hideout/settings.json";
    filepaths.ragfair.offer = "db/ragfair/offer.json";
    filepaths.ragfair.search = "db/ragfair/search.json";
    filepaths.cert.server.cert = "cert/server.cert";
    filepaths.cert.server.key = "cert/server.key";
}

function cache() {
    let assortList = utility.getDirList("db/assort/");

    filepaths.user.cache.items = "user/cache/items.json";
    filepaths.user.cache.quests = "user/cache/quests.json";
    filepaths.user.cache.locations = "user/cache/locations.json";
    filepaths.user.cache.languages = "user/cache/languages.json";
    filepaths.user.cache.customization_outfits = "user/cache/customization_outfits.json";
    filepaths.user.cache.customization_offers = "user/cache/customization_offers.json";
    filepaths.user.cache.hideout_areas = "user/cache/hideout_areas.json";
    filepaths.user.cache.hideout_production = "user/cache/hideout_production.json";
    filepaths.user.cache.hideout_scavcase = "user/cache/hideout_scavcase.json";
    filepaths.user.cache.weather = "user/cache/weather.json";
    filepaths.user.cache.templates = "user/cache/templates.json";
    filepaths.user.cache.mods = "user/cache/mods.json";
    filepaths.user.cache.globals = filepaths.globals;
    filepaths.user.cache.assort_579dc571d53a0658a154fbec = "user/cache/assort_579dc571d53a0658a154fbec.json";

    for (let assort in assortList) {
        filepaths.user.cache["assort_" + assortList[assort]] = "user/cache/assort_" + assortList[assort] + ".json";
    }
}

function routeDatabase() {
    flush();
    items();
    quests();
    traders();
    locations();
    customizationOutfits();
    customizationOffers();
    hideoutAreas();
    hideoutProduction();
    hideoutScavcase();
    templates();
    assort();
    weather();
    maps();
    bots();
    images();
    others();
    cache();
}

function all() {
    // force rebuilding routes
    let force = false;

    // force if rebuild is required
    if (mods.isRebuildRequired()) {
        logger.logWarning("Modslist mismatch, force rebuilding cache");
        force = true;
    }

    // generate routes
    if (force || !fs.existsSync("user/cache/filepaths.json")) {
        routeDatabase();
        mods.load();
        dump();
    } else {
        filepaths = json.parse(json.read("user/cache/filepaths.json"));
    }
}

module.exports.all = all;