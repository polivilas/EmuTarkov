"use strict";

require('../libs.js');

//// ---- FUNCTIONS BELOW ---- ////

function prepareWeather() {
    let i = 0;
    let data = [];

    for (let file in filepaths.weather) {
        data[i++] = json.parse(json.read(filepaths.weather[file]));
    }

    return data;
}

function change() {
    let time = utility.getTime().replace("-", ":").replace("-", ":");
    let date = utility.getDate();
    let datetime = date + " " + time;
    let output = weathers[utility.getRandomInt(0, weathers.length - 1)];

    // replace date and time
    output.data.weather.timestamp = Math.floor(new Date() / 1000);
    output.data.weather.date = date;
    output.data.weather.time = datetime;
    output.data.date = date;
    output.data.time = time;

    return JSON.stringify(output);
}

//// ---- EXPORT LIST ---- ////

module.exports.prepareWeather = prepareWeather;
module.exports.main = change;