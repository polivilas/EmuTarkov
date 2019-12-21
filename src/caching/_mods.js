"use strict";

require('../libs.js');

function items(mod) {
    if (!mod.files.hasOwnProperty("items")) {
        return;
    }

    let inputNames = Object.keys(mod.files.items);
    let i = 0;

    for (let item in mod.files.items) {
        if (mod.files.items[item] == "delete") {
            delete filepaths.items[inputNames[i++]];
            continue;
        }

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
        if (mod.files.quests[item] == "delete") {
            delete filepaths.quests[inputNames[i++]];
            continue;
        }

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
        if (mod.files.traders[item] == "delete") {
            delete filepaths.traders[inputNames[i++]];
            continue;
        }

        filepaths.traders[inputNames[i++]] = mod.files.traders[item];
    }
}

function locations(mod) {
    if (!mod.files.hasOwnProperty("locations")) {
        return;
    }

    let inputNames = Object.keys(mod.files.locations);
    let i = 0;

    for (let item in mod.files.locations) {
        if (mod.files.locations[item] == "delete") {
            delete filepaths.locations[inputNames[i++]];
            continue;
        }

        filepaths.locations[inputNames[i++]] = mod.files.locations[item];
    }
}

function languages(mod) {
    if (!mod.files.hasOwnProperty("locales") || !mod.files.locales.hasOwnProperty("languages")) {
        return;
    }

    let inputNames = Object.keys(mod.files.locales.languages);
    let i = 0;

    for (let item in mod.files.locales.languages) {
        if (mod.files.locales.languages[item] == "delete") {
            delete filepaths.locales.languages[inputNames[i++]];
            continue;
        }

        filepaths.locales.languages[inputNames[i++]] = mod.files.locales.languages[item];
    }
}

function assort(mod) {
    if (!mod.files.hasOwnProperty("assort")) {
        return;
    }

    let inputNames = Object.keys(mod.files.assort);
    let i = 0;

    for (let assort in mod.files.assort) {
        // delete assort
        if (mod.files.assort[assort] == null) {
            delete filepaths.assort[assort];
            continue;
        }

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
            if (activeAssort.items[item] == "delete") {
                delete filepaths.assort[assort].items[inputNames[i++]];
                continue
            }

            filepaths.assort[assort].items[inputNames[i++]] = activeAssort.items[item];
        }

        // assort barter_scheme
        inputNames = Object.keys(activeAssort.barter_scheme);
        i = 0;

        for (let item in activeAssort.barter_scheme) {
            if (activeAssort.barter_scheme[item] == "delete") {
                delete filepaths.assort[assort].barter_scheme[inputNames[i++]];
                continue;
            }

            filepaths.assort[assort].barter_scheme[inputNames[i++]] = activeAssort.barter_scheme[item];
        }

        // assort loyal_level_items
        inputNames = Object.keys(activeAssort.loyal_level_items);
        i = 0;

        for (let item in activeAssort.loyal_level_items) {
            if (activeAssort.loyal_level_items[item] == "delete") {
                delete filepaths.assort[assort].loyal_level_items[inputNames[i++]];
                continue;
            }

            filepaths.assort[assort].loyal_level_items[inputNames[i++]] = activeAssort.loyal_level_items[item];
        }
    }
}

function load() {
    let modList = settings.mods.list;

    for (let element in modList) {
        // skip mod
        if (!modList[element].enabled) {
            console.log("Skipping mod " + modList[element].name + " v" + modList[element].version);
            continue;
        }

        let mod = json.parse(json.read("user/mods/" + modList[element].name + "/mod.config.json"))

        // apply mod
        console.log("Loading mod " + modList[element].name + " v" + modList[element].version);
        items(mod);
        quests(mod);
        traders(mod);
        locations(mod);
        languages(mod);
        assort(mod);
    }
}

module.exports.load = load;