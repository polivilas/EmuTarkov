"use strict";

require('../libs.js');

function generate() {
    let output = {"err": 0, "errmsg": null, "data": {}};

    // set weather
    if (settings.gameplay.location.forceWeatherEnabled) {
        output.data = weather.data[settings.gameplay.location.forceWeatherId];
    } else {
        output.data = weather.data[utility.getRandomInt(0, weather.length - 1)];
    }

    // replace date and time
    if (settings.gameplay.location.realTimeEnabled) {
        let time = utility.getTime().replace("-", ":").replace("-", ":");
        let date = utility.getDate();
        let datetime = date + " " + time;

        output.data.weather.timestamp = Math.floor(new Date() / 1000);
        output.data.weather.date = date;
        output.data.weather.time = datetime;
        output.data.date = date;
        output.data.time = time;
    }

    return JSON.stringify(output);
}

module.exports.generate = generate;