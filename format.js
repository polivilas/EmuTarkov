var http = require('http');
var fs = require('fs');
var zlib = require('zlib');
function ReadJson(file) {
	return (fs.readFileSync(file, 'utf8')).replace(/[\r\n\t]/g, '');
}
var ItemFile = JSON.parse(ReadJson('items.json'));

fs.writeFileSync('items.json', JSON.stringify(ItemFile, null, "\t"), 'utf8');

ItemFile = JSON.parse(ReadJson('locations.json'));

fs.writeFileSync('locations.json', JSON.stringify(ItemFile, null, "\t"), 'utf8');

ItemFile = JSON.parse(ReadJson('templates.json'));

fs.writeFileSync('templates.json', JSON.stringify(ItemFile, null, "\t"), 'utf8');

ItemFile = JSON.parse(ReadJson('locale_en.json'));

fs.writeFileSync('locale_en.json', JSON.stringify(ItemFile, null, "\t"), 'utf8');


ItemFile = JSON.parse(ReadJson('globals.json'));

fs.writeFileSync('globals.json', JSON.stringify(ItemFile, null, "\t"), 'utf8');