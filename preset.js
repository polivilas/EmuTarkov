var http = require('http');
var fs = require('fs');
var zlib = require('zlib');
function ReadJson(file) {
	return (fs.readFileSync(file, 'utf8')).replace(/[\r\n\t]/g, '');
}
var outJson = JSON.parse('{"err":0,"errmsg":null,"data":{"items":[],"barter_scheme":{},"loyal_level_items":{}}}');
var PresetFile = JSON.parse(ReadJson('preset.json'));
for (var key in PresetFile.data) {
	var fuckthis = "no";
	for (var key3 in outJson.data.items){
		if (outJson.data.items[key3] && outJson.data.items[key3]._id == PresetFile.data[key]._id){
			fuckthis = "yes"
			break;
		}
	};

//{"_id": "EZSHOP1500","_tpl": "5a13f24186f77410e57c5626","parentId": "hideout","slotId": "hideout","upd": {"StackObjectsCount": 1337 }},
	if(fuckthis == "yes"){
		console.log("skipped dupe");
		continue;
	};
	for (var key2 in PresetFile.data[key]._items) {
		for (var key3 in outJson.data.items){
			if (outJson.data.items[key3] && outJson.data.items[key3]._id == PresetFile.data[key]._items[key2]._id){
				fuckthis = "yes"
				break;
			}
		};
		if(fuckthis == "yes"){
			console.log("skipped dupe");
			break;
		};
		if(PresetFile.data[key]._items[key2].parentId == undefined){
			PresetFile.data[key]._items[key2].parentId = "hideout";
			PresetFile.data[key]._items[key2].slotId = "hideout";
			PresetFile.data[key]._items[key2].upd = {"StackObjectsCount": 1337 };
		}
		outJson.data.items.push(PresetFile.data[key]._items[key2]);

	};
	if(fuckthis == "yes"){
		console.log("skipped dupe");
		continue;
	};
	outJson.data.barter_scheme[PresetFile.data[key]._parent] = [[{"count": 1, "_tpl": "5449016a4bdc2d6f028b456f"}]];
	outJson.data.loyal_level_items[PresetFile.data[key]._parent] = 1;
	fs.writeFileSync('outPreset.json', JSON.stringify(outJson, null, "\t"), 'utf8');
}
//"parentId": "hideout","slotId": "hideout","upd": {"StackObjectsCount": 1337 }