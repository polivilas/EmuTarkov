"use strict";

const utility = require('../utility.js');

//// ---- FUNCTIONS BELOW ---- ////
/*
Wind // 0 - 1
WindDirection // 1 - 8
CloudDensity // -1 - 1
Fog // 0 - 1 ??
fallingWater // 0 - 1
LyingWater // 0 - 1 
Temperature -50 - 50
*/
function main() { // TODO: Use weather API
    let time = utility.getTime().replace("-", ":").replace("-", ":");
    let date = utility.getDate();
    let dateTime = date + " " + time;

    return '{"err":0, "errmsg":null, "data":{"weather":{"timestamp":' + Math.floor(new Date() / 1000) + ', "cloud":-0.475, "wind_speed":2, "wind_direction":3, "wind_gustiness":0.081, "rain":1, "rain_intensity":0, "fog":0.002, "temp":14, "pressure":763, "date":"' + date + '", "time":"' + dateTime + '"}, "date":"' + date + '", "time":"' + time + '", "acceleration":1}}';
}

//// ---- EXPORT LIST ---- ////

module.exports.main = main;
//module.exports.funcname = funcname; // preset
