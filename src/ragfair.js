var utility = require('./utility.js');

var items = JSON.parse(utility.readJson("data/items.json"));

function getOffers(request) {
	var tmpId = "54009119af1c881c07000029";
	
	for (var curItem in items.data) {
		if (curItem == request.handbookId) {
			tmpId = curItem;
			console.log("found item");
			break;
		};
	};

	var response = JSON.parse(utility.readJson("data/ragfair/search.json"));
	
	response.data.offers[0]._id = tmpId;
	response.data.offers[0].items[0]._tpl = tmpId;
	return JSON.stringify(response);
	// this is really not okay. TODO: handle ragfair buying event - maybe connect to trader buy event?
}

module.exports.getOffers = getOffers;