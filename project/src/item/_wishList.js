"use strict";

const profile = require('../profile.js');
const itm_hf = require('./helpFunctions.js');	// additional functions

//// ---- FUNCTIONS BELOW ---- ////

/* Adding item to wishlist
*  input: playerProfileData, Request body
*  output: OK (saved profile)
* */
function addToWishList(tmpList, body) {
    for (let item in tmpList.data[1]['Wishlist']) {
        // don't add the item
        if (tmpList.data[1].WishList[item] === body['templateId']) {
            return "OK";
        }
    }
    // add the item to the wishlist
    tmpList.data[1].WishList.push(body['templateId']);
    profile.setCharacterData(tmpList);
    return "OK";
}
/* Removing item to wishlist
*  input: playerProfileData, Request body
*  output: OK (saved profile)
* */
function removeFromWishList(tmpList, body) {
    for (let item in tmpList.data[1]['Wishlist']) {
        if (tmpList.data[1].WishList[item] === body['templateId']) {
            tmpList.data[1].WishList.splice(item, 1);
        }
    }
    profile.setCharacterData(tmpList);
    return "OK";
}
/* Reset wishlist to empty []
*  input: playerProfileData
*  output: none
* */
function resetWishList(tmpList){
    tmpList.data[1].WishList = [];
    profile.setCharacterData(tmpList);
}

//// ---- EXPORT LIST ---- ////

module.exports.addToWishList = addToWishList;
module.exports.removeFromWishList = removeFromWishList;
module.exports.resetWishList = resetWishList;
//module.exports.funcname = funcname; // preset
