"use strict";

require('../libs.js');

function items(mod) {
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

function assort(mod) {
    let inputNames = Object.keys(mod.files.items);
    let i = 0;

    for (let assort in mod.files.assort) {
        // delete assort
        if (mod.files.assort[assort] == null) {
            delete filepaths.assort[assort];
            continue;
        }

        // create assort
        if (!filepaths.assort.hasOwnProperty(mod.files.assort[assort])) {
            filepaths.assort[assort] = mod.files.assort[assort];
            continue;
        }
        
        let activeAssort = mods.files.assort;

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
        assort(mod);
        items(mod);
    }
}

module.exports.load = load;