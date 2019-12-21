"use strict";

require('./libs.js');

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

function assorts() {
    let dirList = utility.getDirList("db/assort/");

    for (let trader in dirList) {
        console.log("Caching: assort_" + dirList[trader]);

        let base = json.parse(json.read("db/cache/assort.json"));
        let inputNode = filepaths.assort[dirList[trader]]
        let inputDir = [
            "items",
            "barter_scheme",
            "loyal_level_items"
        ];

        for (let path in inputDir) {
            let inputFiles = inputNode[inputDir[path]];
            let inputNames = Object.keys(inputFiles);
            
            for (let file in inputFiles) {
                let filePath = inputFiles[file];
                let fileName = inputNames[file];
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

        json.write("user/cache/assort_" + dirList[trader] + ".json", base);
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

            for (let file in inputFiles) {
                let filePath = inputFiles[file];
                let fileData = json.parse(json.read(filePath));
                let fileName = inputNames[file];

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

    if (force || !fs.existsSync("user/cache/traders.json")) {
        traders();
    }

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
        if (force || !fs.existsSync("user/cache/assort_" + localesList[assort] + ".json")) {
            assorts();
            break;
        }
    }

    for (let locale in localesList) {
        if (localesList[locale] == "languages") {
            continue;
        }

        if (force || !fs.existsSync("user/cache/locale_" + localesList[locale] + ".json")) {
            locales();
            break;
        }
    }

    settings.mods.rebuildCache = false;
}

module.exports.all = all;