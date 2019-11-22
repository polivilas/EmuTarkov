"use strict";

require('../libs.js');

//// ---- FUNCTIONS BELOW ---- ////

function prepareWeather() {
    let i = 0;
    let data = [];
    let files = fs.readdirSync("database/configs/weather/");

    for (let file in files) {
        data[i++] = JSON.parse(utility.readJson("database/configs/weather/" + files[file]));
    }

    return data;
}

function change() {
    let time = utility.getTime().replace("-", ":").replace("-", ":");
    let date = utility.getDate();
    let datetime = date + " " + time;
    let output = weathers[utility.getRandomInt(0, weathers.length - 1)];

    // replace date and time
    output.weather.timestamp = Math.floor(new Date() / 1000);
    output.weather.date = date;
    output.weather.time = datetime;
    output.date = date;
    output.time = time;

    return '{"err": 0, "errmsg": null, "data": ' + JSON.stringify(output) + '}';
}

//// ---- EXPORT LIST ---- ////

module.exports.prepareWeather = prepareWeather;
module.exports.main = change;