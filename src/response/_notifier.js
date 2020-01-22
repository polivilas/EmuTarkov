"use strict";

require('../libs.js');

/*
* NotifierService class maintains a queue of notifications which will be pushed upon notification 
* request from client per session.
*/
class NotifierService {
	constructor() {
		this.messageQueue = {};
	}

	/* Get messageQueue for a particular sessionID. */
	getMessageQueue(sessionID) {
		if (!this.hasMessageQueue(sessionID)) {
			return [];
		}

		return this.messageQueue[sessionID];
	}

	/* Pop first message from the queue for a particular sessionID and return the message. */
	popMessageFromQueue(sessionID) {
		if (!this.hasMessageQueue(sessionID)) {
			return null;
		}

		return this.messageQueue[sessionID].splice(0, 1)[0];
	}

	/* Add notificationMessage to the messageQueue for a particular sessionID. */
	addToMessageQueue(notificationMessage, sessionID) {
		if (!this.hasMessageQueue(sessionID)) {
			this.messageQueue[sessionID] = [notificationMessage];
			return;
		}

		this.messageQueue[sessionID].push(notificationMessage);
	}

	/* Checks whether we already have a message queue created for a particular sessionID. */
	hasMessageQueue(sessionID) {
		return sessionID in this.messageQueue;
	}

	/* Checks whether a particular sessionID has notifications waiting to be processed. */
	hasMessagesInQueue(sessionID) {
		if (!this.hasMessageQueue(sessionID)) {
			return false;
		}

		return this.messageQueue[sessionID].length > 0;
	}
}

/* Creates a new notification of type "new_message" with the specified dialogueMessage object. */
function createNewMessageNotification(dialogueMessage) {
	return {type: "new_message", eventId: dialogueMessage._id, data : {"dialogId": dialogueMessage.uid, "message": dialogueMessage}};
}

module.exports.notifierService = new NotifierService();
module.exports.createNewMessageNotification = createNewMessageNotification;