var http = require('http');
var fs = require('fs');
var zlib = require('zlib');
function ReadJson(file) {
	return (fs.readFileSync(file, 'utf8')).replace(/[\r\n\t]/g, '');
}
var outJson = JSON.parse('{"err":0,"errmsg":null,"data":{"items":[],"barter_scheme":{},"loyal_level_items":{}}}');
var ItemFile = JSON.parse(ReadJson('items.json'));

for (var key in ItemFile.data) {
var tmpItem = {};
	tmpItem._id = ItemFile.data[key]._id;
	tmpItem._tpl = ItemFile.data[key]._id;
	tmpItem.parentId = "hideout";
	tmpItem.slotId = "hideout";
	tmpItem.upd = {"StackObjectsCount": 1337 };
	outJson.data.items.push(tmpItem);
	outJson.data.barter_scheme[tmpItem._id] = [[{"count": 1, "_tpl": "5449016a4bdc2d6f028b456f"}]];
	outJson.data.loyal_level_items[tmpItem._id] = 1;
};

fs.writeFileSync('ItemTrader.json', JSON.stringify(outJson, null, "\t"), 'utf8');