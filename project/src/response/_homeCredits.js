"use strict";
const server = require('../server/_constants.js');

//// ---- FUNCTIONS BELOW ---- ////

function index() {
    return '<style>a{color:#aaa} a:hover{color:#cca} h1{font-size:22px;font-family:"Consolas",serif} a,p,li{font-size:14px;font-family:"Consolas",serif}</style>' +
        '<body style="background:black;color:#aaa;text-align:center;padding:20px;font-family:"Consolas",serif;">' +
        '<h1>JustEmuTarkov ' + server.serverVersion() + '</a></h1>' + ((server.gameVersion() !== "") ? 'You are playing game on client version: ' + server.gameVersion() + '<br><br>' : '') +
        '<a href="https://discord.gg/JnJEev4">> Official Discord <</a><br><br>' +
        '<a href="https://github.com/justemutarkov/">> Official Github <</a><br><br>' +
        '<a href="https://justemutarkov.github.io">> Github Website <</a><br><br>' +
        '<a href="https://maoci.eu/eft/">> Client mirrors <</a><br><br><br>' +
        '<p>Credits to:</p><ul><li>Polivilas</li><li>TheMaoci</li><li>InNoHurryToCode</li><li>BALIST0N</li><li>Mr RUSS</li><li>Windel</li><li>magMAR</li><li>Algorithm</li><li>TRegular</li><li>SBalaci</li><li>Macmillanic</li><li>Juraszka</li></ul>' +
        '</body>'
}

//// ---- EXPORT LIST ---- ////

module.exports.index = index;
//module.exports.funcname = funcname; // preset
