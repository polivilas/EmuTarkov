"use strict";

require('../libs.js');

function prepareItems() {
	if (items == "") {
		return json.parse(json.read(filepaths.user.cache.items));
	} else {
		return items;
	}
}

module.exports.prepareItems = prepareItems;