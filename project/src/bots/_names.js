"use strict";
const utility = require('../utility.js');
const names = JSON.parse(utility.readJson("data/configs/bots/botNames.json"));

/** ~ Generate Bot Full Name
 * ~~input: typeOfName
 * ~~output: FullName
 * @return {string}
 */
function RandomName(type) {
    let tmpNames = "UNKNOWN";
    switch (type) {
        case "scav":
            tmpNames = names['scav'].name[utility.getRandomInt(0,names['scav'].name.length-1)] + " " + names['scav']['surname'][utility.getRandomInt(0,names['scav']['surname'].length-1)];
            break;
        case "pmc":
            tmpNames = names['pmc'][utility.getRandomInt(0,names['pmc'].length-1)];
            break;
        case "follower":
            tmpNames = names['follower'][utility.getRandomInt(0,names['follower'].length-1)];
            break;
    }
    return tmpNames;
}

module.exports.RandomName = RandomName;
