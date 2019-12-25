"use strict";

require('../libs.js');

function genericCacher(cachename, filepathNode, output = "") {
    console.log("Caching: " + cachename);

    let base = json.parse(json.read("db/cache/" + cachename));
    let inputFiles = filepathNode;
    let inputNames = Object.keys(inputFiles);
    let i = 0;

    for (let file in inputFiles) {
        let filePath = inputFiles[file];
        let fileData = json.parse(json.read(filePath));
        let fileName = "";

        switch (cachename) {
            case "quests.json":
            case "traders.json":
            case "locale_languages.json":
            case "customization_offers.json":
            case "hideout_areas.json":
            case "hideout_production.json":
            case "hideout_scavcase.json":
                base.data.push(fileData);
            break;

            case "items.json":
                fileName = fileData._id;

                if (settings.debug.examinedByDefault) {
                    fileData._props.ExaminedByDefault = true;
                }
        
                base.data[fileName] = fileData;
            break;

            case "locations.json":
                fileName = inputNames[i++];
                base.data.locations[fileName] = fileData;
            break;

            case "customization_outfits.json":
                fileName = inputNames[i++];
                base.data[fileName] = fileData;
            break;
        }
    }

    if (output == "") {
        json.write("user/cache/" + cachename, base, true);
    } else {
        json.write(output + cachename, base, true);
    }
}

function items() {
    genericCacher("items.json", filepaths.items);
}

function quests() {
    genericCacher("quests.json", filepaths.quests);
}

/*
function traders() {
    genericCacher("traders.json", filepaths.traders);
}
*/

function locations() {
    genericCacher("locations.json", filepaths.locations);
}

function languages() {
    genericCacher("locale_languages.json", filepaths.locales.languages);
}

function customizationOutfits() {
    genericCacher("customization_outfits.json", filepaths.customization.outfits);
}

function customizationOffers() {
    genericCacher("customization_offers.json", filepaths.customization.offers);
}

function hideoutAreas() {
    genericCacher("hideout_areas.json", filepaths.hideout.areas);
}

function hideoutProduction() {
    genericCacher("hideout_production.json", filepaths.hideout.production);
}

function hideoutScavcase() {
    genericCacher("hideout_scavcase.json", filepaths.hideout.scavcase);
}

function templates() {
    console.log("Caching: templates.json");

    let base = json.parse(json.read("db/cache/templates.json"));
    let inputDir = [
        "categories",
        "items"
    ];

    for (let path in inputDir) {
        let inputFiles = filepaths.templates[inputDir[path]];

        for (let file in inputFiles) {
            let filePath = inputFiles[file];
            let fileData = json.parse(json.read(filePath));

            if (path == 0) {
                base.data.Categories.push(fileData);
            } else {
                base.data.Items.push(fileData);
            }
        }
    }

    json.write("user/cache/templates.json", base, true);
}

function assorts(trader) {
    console.log("Caching: assort_" + trader + ".json");

    let base = json.parse(json.read("db/cache/assort.json"));
    let inputNode = filepaths.assort[trader]
    let inputDir = [
        "items",
        "barter_scheme",
        "loyal_level_items"
    ];

    for (let path in inputDir) {
        let inputFiles = inputNode[inputDir[path]];
        let inputNames = Object.keys(inputFiles);
        let i = 0;

        for (let file in inputFiles) {
            let filePath = inputFiles[file];
            let fileName = inputNames[i++];
            let fileData = json.parse(json.read(filePath));

            if (path == 0) {
                base.data.items.push(fileData);
            } else if (path == 1) {
                base.data.barter_scheme[fileName] = fileData;
            } else if (path == 2) {
                base.data.loyal_level_items[fileName] = fileData;
            }
        }
    }

    json.write("user/cache/assort_" + trader + ".json", base);
}

function locales(locale) {
    if (locale == "languages") {
        return;
    }

    let base = json.parse(json.read("db/cache/locale.json"));
    let inputNode = filepaths.locales[locale];
    let inputDir = [
        "mail",
        "quest",
        "preset",
        "handbook",
        "season",
        "templates",
        "locations",
        "banners",
        "trading",
    ];

    console.log("Caching: locale_" + locale + ".json");

    base.data.interface = json.parse(json.read(inputNode.interface));
    base.data.error = json.parse(json.read(inputNode.error));

    for (let path in inputDir) {
        let inputFiles = inputNode[inputDir[path]];
        let inputNames = Object.keys(inputFiles);
        let i = 0;

        for (let file in inputFiles) {
            let filePath = inputFiles[file];
            let fileData = json.parse(json.read(filePath));
            let fileName = inputNames[i++];

            if (path == 0) {
                base.data.mail[fileName] = fileData;
            } else if (path == 1) {
                base.data.quest[fileName] = fileData;
            } else if (path == 2) {
                base.data.preset[fileName] = fileData;
            } else if (path == 3) {
                base.data.handbook[fileName] = fileData;
            } else if (path == 4) {
                base.data.season[fileName] = fileData;
            } else if (path == 5) {
                base.data.templates[fileName] = fileData;
            } else if (path == 6) {
                base.data.locations[fileName] = fileData;
            } else if (path == 7) {
                base.data.banners[fileName] = fileData;
            } else if (path == 8) {
                base.data.trading[fileName] = fileData;
            }
        }
    }

    json.write("user/cache/locale_" + locale + ".json", base, true);
}

function all() {
    let force = settings.mods.rebuildCache;
    let assortList = utility.getDirList("db/assort/");
    let localesList = utility.getDirList("db/locales/");

    if (force || !fs.existsSync("user/cache/items.json")) {
        items();
    }

    if (force || !fs.existsSync("user/cache/quests.json")) {
        quests();
    }

    /*
    if (force || !fs.existsSync("user/cache/traders.json")) {
        traders();
    }
    */

    if (force || !fs.existsSync("user/cache/locations.json")) {
        locations();
    }

    if (force || !fs.existsSync("user/cache/locale_languages.json")) {
        languages();
    }

    if (force || !fs.existsSync("user/cache/customization_outfits.json")) {
        customizationOutfits();
    }

    if (force || !fs.existsSync("user/cache/customization_offers.json")) {
        customizationOffers();
    }

    if (force || !fs.existsSync("user/cache/hideout_areas.json")) {
        hideoutAreas();
    }

    if (force || !fs.existsSync("user/cache/hideout_production.json")) {
        hideoutProduction();
    }

    if (force || !fs.existsSync("user/cache/hideout_scavcase.json")) {
        hideoutScavcase();
    }

    if (force || !fs.existsSync("user/cache/templates.json")) {
        templates();
    }

    for (let assort in assortList) {
        if (force || !fs.existsSync("user/cache/assort_" + assortList[assort] + ".json")) {
            assorts(assortList[assort]);
        }
    }

    for (let locale in localesList) {
        if (localesList[locale] == "languages") {
            continue;
        }

        if (force || !fs.existsSync("user/cache/locale_" + localesList[locale] + ".json")) {
            locales(localesList[locale]);
        }
    }

    settings.mods.rebuildCache = false;
}

module.exports.genericCacher = genericCacher;
module.exports.all = all;