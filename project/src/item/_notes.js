"use strict";

const profile = require('../profile.js');

//// ---- FUNCTIONS BELOW ---- ////

function addNote(tmpList, body) { // -> Note ADD
    tmpList.data[1].Notes.Notes.push({
		"Time": body.note.Time, 
		"Text": body.note.Text
	});
    profile.setCharacterData(tmpList);
    return "OK";
}

function editNode(tmpList, body) { // -> Note Edit
    tmpList.data[1].Notes.Notes[body.index] = {
		"Time": body.note.Time, 
		"Text": body.note.Text
	};
    profile.setCharacterData(tmpList);
    return "OK";
}

function deleteNote(tmpList, body) { // -> Note Delete
    tmpList.data[1].Notes.Notes.splice(body.index, 1);
    profile.setCharacterData(tmpList);
    return "OK";
}

//// ---- EXPORT LIST ---- ////

module.exports.addNote = addNote;
module.exports.editNode = editNode;
module.exports.deleteNote = deleteNote;