"use strict";

require('../libs.js');

function addNote(tmpList, body) {
    tmpList.data[0].Notes.Notes.push({
		"Time": body.note.Time, 
		"Text": body.note.Text
	});
    profile.setCharacterData(tmpList);
    return "OK";
}

function editNode(tmpList, body) {
    tmpList.data[0].Notes.Notes[body.index] = {
		"Time": body.note.Time, 
		"Text": body.note.Text
	};
    profile.setCharacterData(tmpList);
    return "OK";
}

function deleteNote(tmpList, body) {
    tmpList.data[0].Notes.Notes.splice(body.index, 1);
    profile.setCharacterData(tmpList);
    return "OK";
}

module.exports.addNote = addNote;
module.exports.editNode = editNode;
module.exports.deleteNote = deleteNote;