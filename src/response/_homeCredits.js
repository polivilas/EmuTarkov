"use strict";

require('../libs.js');

function index() {
    return '<style>a{color:#aaa} a:hover{color:#cca} h1{font-size:22px;font-family:"Consolas",serif} a,p,li{font-size:14px;font-family:"Consolas",serif}</style>' +
        '<body style="background:black;color:#aaa;text-align:center;padding:20px;font-family:"Consolas",serif;">' +
        '<h1>JustEmuTarkov ' + constants.serverVersion() + '</a></h1>' + ((constants.gameVersion() !== "") ? 'You are playing game on client version: ' + constants.gameVersion() + '<br><br>' : '') +
        '<a href="https://discord.gg/JnJEev4">> Official Discord <</a><br><br>' +
        '<a href="https://github.com/justemutarkov/">> Official Github <</a><br><br>' +
        '<a href="https://justemutarkov.github.io">> Github Website <</a><br><br>' +
        '<a href="https://maoci.eu/">> Client mirrors <</a><br><br><br>' +
        '<p>Credits to:</p><ul><li>Polivilas</li><li>InNoHurryToCode</li><li>BALIST0N</li><li>TheMaoci</li><li>Mr RUSS</li><li>Windel</li><li>Macmillanic</li><li>Juraszka</li></ul>' +
        '</body>'
}

module.exports.index = index;
