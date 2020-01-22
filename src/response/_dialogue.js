"use strict";

require('../libs.js');

let dialogues = {};

// TODO(camo1018): Reduce the number of dialogue file reads and writes.
let messageTypes = {
	"npcTrader": 2,
	"questStart": 10,
	"questFail": 11,
	"questSuccess": 12
};

function getPath(sessionID) {
    let path = filepaths.user.profiles.dialogue;
    return path.replace("__REPLACEME__", sessionID);
}

function get(sessionID) {
	if (typeof dialogues[sessionID] === "undefined") {
        dialogues[sessionID] = json.parse(json.read(getPath(sessionID)));
	}
	
    return dialogues[sessionID];
}

function set(dialogueData, sessionID) {
	dialogues[sessionID] = dialogueData;
    json.write(getPath(sessionID), dialogueData);
}

/*
* Set the content of the dialogue on the list tab.
*/
function generateDialogueList(sessionID) {
	let dialogueFile = get(sessionID);
	let data = [];

	// Iterate through all dialogues
	for (let dialogueID in dialogueFile) {
		data.push(getDialogueInfo(dialogueFile, dialogueID, sessionID));
	}

	return '{"err":0,"errmsg":null,"data":' + json.stringify(data) + '}';
}

/* Get the content of an incoming message. */
function getDialogueInfo(dialogueFile, dialogueID, sessionID) {
	let dialogue = dialogueFile[dialogueID];
	let dialogueInfo = {
		"_id": dialogueID,
		"type": 2, // Type npcTrader.
		"message": getMessagePreview(dialogue),
		"new": dialogue.new,
		"attachmentsNew": dialogue.attachmentsNew,
		"pinned": dialogue.pinned
	};

	return dialogueInfo;
}

/*
* Set the content of the dialogue on the details panel, showing all the messages
* for the specified dialogue.
*/
function generateDialogueView(dialogueID, sessionID) {
	// TODO(camo1018): Respect the message limit, but to heck with it for now.
	let dialogueFile = get(sessionID);
	let messages = dialogueFile[dialogueID].messages;
	return '{"err":0,"errmsg":null, "data":' + json.stringify({"messages": messages}) + '}';
}

/*
* Return the int value associated with the messageType, for readability.
*/
function getMessageTypeValue(messageType) {
	return messageTypes[messageType];
}

/*
* Add a templated message to the dialogue.
*/
function addDialogueMessage(dialogueID, messageTemplateId, messageType, sessionID, rewards = []) {
	let dialogueFile = get(sessionID);
	let isNewDialogue = !(dialogueID in dialogueFile);
	let dialogue = dialogueFile[dialogueID];

	if (isNewDialogue) {
		dialogue = {
			"_id": dialogueID,
			"messages": [],
			"pinned": false,
			"new": 0,
			"attachmentsNew": 0
		};
		dialogueFile[dialogueID] = dialogue;
	}

	dialogue.new += 1;

	// Generate item stash if we have rewards.
	let items = {};

	if (rewards.length > 0) {
		const stashId = utility.generateNewItemId();

		items.stash = stashId;
		items.data = [];

		for (let reward of rewards) {
			reward._id = utility.generateNewItemId();
			reward.parentId = stashId;
			reward.slotId = "main";
			items.data.push(reward);
		}

		dialogue.attachmentsNew += 1;
	}

	let message = {
		"_id": utility.generateNewDialogueId(),
		"uid": dialogueID,
		"type": messageType,
		"dt": Date.now() / 1000,
		"templateId": messageTemplateId,
		"hasRewards": rewards.length > 0,
		"items": items
	};

	dialogue.messages.push(message);
	set(dialogueFile, sessionID);

	let notificationMessage = notifier_f.createNewMessageNotification(message);
	notifier_f.notifierService.addToMessageQueue(notificationMessage, sessionID);
}

/*
* Get the preview contents of the last message in a dialogue.
*/
function getMessagePreview(dialogue) {
	// The last message of the dialogue should be shown on the preview.
	let message = dialogue.messages[dialogue.messages.length - 1];

	return {
		"dt": message.dt,
		"type": message.type,
		"templateId": message.templateId,
		"uid": dialogue._id
	};
}

/*
* Get the item contents for a particular message.
*/
function getMessageItemContents(messageId, sessionID) {
	let dialogueFile = get(sessionID);

	for (let dialogueId in dialogueFile) {
		let messages = dialogueFile[dialogueId].messages;

		for (let message of messages) {
			if (message._id === messageId) {
				return message.items.data;
			}
		}
	}

	return [];
}

// TODO(camo1018): Coalesce all findAndReturnChildren functions.
/* Find And Return Children (TRegular)
* input: MessageItems, InitialItem._id
* output: list of item._id
* List is backward first item is the furthest child and last item is main item
* returns all child items ids in array, includes itself and children
* Same as the function in helpFunctions, just adapted for message ittems.
* */
function findAndReturnChildren(messageItems, itemid) {
    let list = [];

    for (let childitem of messageItems) {
        if (childitem.parentId === itemid) {
            list.push.apply(list, findAndReturnChildren(messageItems, childitem._id));
        }
    }

    list.push(itemid);// it's required
    return list;
}

function removeDialogue(dialogueId, sessionID) {
	let dialogueFile = get(sessionID);
	delete dialogueFile[dialogueId];	
	set(dialogueFile, sessionID);
}

function setDialoguePin(dialogueId, shouldPin, sessionID) {
	let dialogueFile = get(sessionID);
	dialogueFile[dialogueId].pinned = shouldPin;
	setDialogue
}

function setRead(dialogueIds, sessionID) {
	let dialogueFile = get(sessionID);

	for (let dialogId of dialogueIds) {
		dialogueFile[dialogId].new = 0;
		dialogueFile[dialogId].attachmentsNew = 0;
	}

	set(dialogueFile, sessionID);
}

function getAllAttachments(dialogueId, sessionID) {
	let dialogueFile = get(sessionID);	
	return {"messages": dialogueFile[dialogueId].messages};
}

module.exports.get = get;
module.exports.generateDialogueList = generateDialogueList;
module.exports.generateDialogueView = generateDialogueView;
module.exports.getDialogueInfo = getDialogueInfo;
module.exports.getMessageTypeValue = getMessageTypeValue;
module.exports.addDialogueMessage = addDialogueMessage;
module.exports.getMessageItemContents = getMessageItemContents;
module.exports.findAndReturnChildren = findAndReturnChildren;
module.exports.removeDialogue = removeDialogue;
module.exports.setDialoguePin = setDialoguePin;
module.exports.setRead = setRead;
module.exports.getAllAttachments = getAllAttachments;