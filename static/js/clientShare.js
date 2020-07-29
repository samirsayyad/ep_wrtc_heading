"use strict";

exports.scrollDownToLastChatText = function scrollDownToLastChatText(selector, force){
	$(selector).animate({ 'scrollTop': $(selector)[0].scrollHeight }, { 'duration': 400, 'queue': false });
}

exports.getUserFromId = function getUserFromId(userId) {
	if (!window.pad || !window.pad.collabClient) return null;
	var result = window.pad.collabClient.getConnectedUsers().filter(function(user) {
		return user.userId === userId;
	});
	var user = result.length > 0 ? result[0] : null;
	return user;
}