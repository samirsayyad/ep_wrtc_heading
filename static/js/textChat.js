'use strict';

var textChat = function () {
	var socket = null;
	var padId = null;
	var headId = null;
	var VIDEOCHATLIMIT = 4;

	function createAndAppendMessage(msg) {
		if (!msg) return true;

		//correct the time
		// msg.time += window.clientTimeOffset;

		var minutes = '' + new Date(msg.time).getMinutes();
		var hours = '' + new Date(msg.time).getHours();
		if (minutes.length === 1) minutes = '0' + minutes;
		if (hours.length === 1) hours = '0' + hours;
		var timeStr = hours + ':' + minutes;

		var userName = $('<b>').text(msg.userName + ": ");
		var tim = $("<span>").attr({ "class": "time" }).text(timeStr);

		var message = $("<p>").attr({
			"data-authorid": msg.author
		}).append(userName).append(tim).append(msg.text);

		$("#wrtc_textChat").append(message);
		share.scrollDownToLastChatText("#wrtc_textChat");
	}

	function eventTextChatInput(e) {
		var keycode = event.keyCode || event.which;
		// when press Enter key
		if (keycode === 13) {
			var textMessage = $(this).val();
			if (!textMessage) return true;
			$(this).val('');
			var user = share.getUserFromId(clientVars.userId);
			var msg = { text: textMessage, userName: user.name, author: user.userId, time: new Date().getTime() };

			socket.emit("sendTextMessage", padId, headId, msg, function (msg) {
				createAndAppendMessage(msg);
			});
		}
	}

	function eventListers() {
		$(document).on("keypress", "#wrtc_textChatInputBox input", eventTextChatInput);

		dragElement(document.getElementById("wrtc_textChatWrapper"));

		function dragElement(elmnt) {
			var initialX = 0;
			var initialY = 0;
			var xOffset = 0;
			var yOffset = 0;
			var currentX;
			var currentY;
			var initialX;
			var initialY;
			document.querySelector(".textChatToolbar").onmousedown = dragMouseDown;

			function dragMouseDown(e) {
				e = e || window.event;
				e.preventDefault();
				// get the mouse cursor position at startup:
				initialX = e.clientX - xOffset;
				initialY = e.clientY - yOffset;
				document.onmouseup = closeDragElement;
				// call a function whenever the cursor moves:
				document.onmousemove = elementDrag;
			}

			function elementDrag(e) {
				e = e || window.event;
				e.preventDefault();
				// calculate the new cursor position:

				currentX = e.clientX - initialX;
				currentY = e.clientY - initialY;

				xOffset = currentX;
				yOffset = currentY;
				elmnt.style.transition = "all 0s";
				elmnt.style.transform = "translate3d(" + xOffset + "px, " + yOffset + "px, 0)";
			}

			function closeDragElement() {
				/* stop moving when mouse button is released:*/
				elmnt.style.transition = "all 0.3s cubic-bezier(0.74, -0.05, 0.27, 1.75)";
				document.onmouseup = null;
				document.onmousemove = null;
			}
		}
	}

	function deactivateModal() {

		var $TextChatWrapper = $(document).find("#wrtc_textChatWrapper");
		$TextChatWrapper.removeClass('active');

		// animation pop down
		setTimeout(function () {
			$TextChatWrapper.remove();
		}, 300);

		socket.removeListener('receiveTextMessage:' + headId);

		headId = null;
	}

	function activateModal(headingId, headTitle, userCount) {
		headId = headingId || window.headingId;

		if (!headId) return false;

		var textChatBox = $('#wrtc_textChatBox').tmpl({
			headId: headId,
			videoChatLimit: VIDEOCHATLIMIT,
			headTitle: headTitle,
			userCount: userCount
		});
		$('body').append(textChatBox);

		// for animation pop up
		setTimeout(function () {
			$(document).find("#wrtc_textChatWrapper").addClass("active");
		}, 250);

		socket.on("receiveTextMessage:" + headId, function (headingId, msg) {
			if (headingId === headId) {
				createAndAppendMessage(msg);
			}
		});

		socket.emit("getTextMessages", padId, headId, {}, function (data) {
			data.forEach(function (el) {
				createAndAppendMessage(el);
			});
		});

		eventListers();
	}

	function postAceInit(hook, context, webSocket) {
		socket = webSocket;
		VIDEOCHATLIMIT = clientVars.webrtc.videoChatLimit;
		padId = window.pad.getPadId();
	}

	return {
		postAceInit: postAceInit,
		activateModal: activateModal,
		deactivateModal: deactivateModal
	};
}();

module.exports = textChat;