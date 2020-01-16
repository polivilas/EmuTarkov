"use strict";

require('../libs.js');

/* Adding item to wishlist
*  input: playerProfileData, Request body
*  output: OK (saved profile)
* */
function addToWishList(pmcData, body, sessionID) {
    for (let item in pmcData['Wishlist']) {
        // don't add the item
        if (pmcData.WishList[item] === body['templateId']) {
            return "OK";
        }
    }
    // add the item to the wishlist
    pmcData.WishList.push(body['templateId']);
    profile_f.setPmcData(pmcData, sessionID);
    return "OK";
}

/* Removing item to wishlist
*  input: playerProfileData, Request body
*  output: OK (saved profile)
* */
function removeFromWishList(pmcData, body, sessionID) {
    for (let item in pmcData['Wishlist']) {
        if (pmcData.WishList[item] === body['templateId']) {
            pmcData.WishList.splice(item, 1);
        }
    }
    profile_f.setPmcData(pmcData, sessionID);
    return "OK";
}

/* Reset wishlist to empty []
*  input: playerProfileData
*  output: none
* */
function resetWishList(pmcData){
    pmcData.WishList = [];
    profile_f.setPmcData(pmcData, sessionID);
}

module.exports.addToWishList = addToWishList;
module.exports.removeFromWishList = removeFromWishList;
module.exports.resetWishList = resetWishList;