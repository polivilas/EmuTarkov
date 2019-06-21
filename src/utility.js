"use strict";

var fs = require('fs');

function readJson(file) {
	return (fs.readFileSync(file, 'utf8')).replace(/[\r\n\t]/g, '');
}

function writeJson(file, data) {
    fs.writeFileSync(file, JSON.stringify(data, null, "\t"), 'utf8');
}

function getRandomInt(min, max) {
	min = Math.ceil(min);
	max = Math.floor(max);

	return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomIntEx(max) {
	return Math.floor(Math.random() * Math.floor(max));
}

function convertCyrlicToLatin(word){
    var string = "";
    var A = new Array();

	A["Ё"]="YO";A["Й"]="I";A["Ц"]="TS";A["У"]="U";A["К"]="K";A["Е"]="E";A["Н"]="N";A["Г"]="G";A["Ш"]="SH";A["Щ"]="SCH";A["З"]="Z";A["Х"]="H";A["Ъ"]="'";A["ё"]="yo";A["й"]="i";A["ц"]="ts";A["у"]="u";A["к"]="k";A["е"]="e";A["н"]="n";A["г"]="g";A["ш"]="sh";A["щ"]="sch";A["з"]="z";A["х"]="h";A["ъ"]="'";A["Ф"]="F";A["Ы"]="I";A["В"]="V";A["А"]="A";A["П"]="P";A["Р"]="R";A["О"]="O";A["Л"]="L";A["Д"]="D";A["Ж"]="ZH";A["Э"]="E";A["ф"]="f";A["ы"]="i";A["в"]="v";A["а"]="a";A["п"]="p";A["р"]="r";A["о"]="o";A["л"]="l";A["д"]="d";A["ж"]="zh";A["э"]="e";A["Я"]="YA";A["Ч"]="CH";A["С"]="S";A["М"]="M";A["И"]="I";A["Т"]="T";A["Ь"]="'";A["Б"]="B";A["Ю"]="YU";A["я"]="ya";A["ч"]="ch";A["с"]="s";A["м"]="m";A["и"]="i";A["т"]="t";A["ь"]="'";A["б"]="b";A["ю"]="yu";

	for (var i in word){
			string += (word[i] === 'undefined' || word[i] === ' ' )?" ":A[word[i]];
	}

	return string;
}

module.exports.readJson = readJson;
module.exports.writeJson = writeJson;
module.exports.getRandomInt = getRandomInt;
module.exports.getRandomIntEx = getRandomIntEx;
module.exports.convertCyrlicToLatin = convertCyrlicToLatin