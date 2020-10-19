'use strict';

var $ = require('ep_etherpad-lite/static/js/rjquery').$;
var _ = require('ep_etherpad-lite/static/js/underscore');
var randomString = require('ep_etherpad-lite/static/js/pad_utils').randomString;


/** **********************************************************************/
/*                              Plugin                                  */
/** **********************************************************************/

var EPwrtcHeading = (function EPwrtcHeading() {
	var padOuter = null;
	var padInner = null;
	var outerBody = null;

	function enableWrtcHeading() {
		padOuter.find('#wbrtc_chatBox').addClass('active');
		$('#rtcbox').addClass('active');
	}

	function disableWrtcHeading() {
		padOuter.find('#wbrtc_chatBox').removeClass('active');
		$('#rtcbox').removeClass('active');
		// TODO: fully disable plugin
		// WRTC_Room.hangupAll();
	}

	function init(ace, padId, userId) {
		var loc = document.location;
		var port = loc.port === '' ? loc.protocol === 'https:' ? 443 : 80 : loc.port;
		var url = loc.protocol + '//' + loc.hostname + ':' + port + '/' + 'heading_chat_room';
		var socket = io.connect(url);

		socket.emit('join pad', padId, userId, function joinPad() {});

		// find containers
		padOuter = $('iframe[name="ace_outer"]').contents();
		padInner = padOuter.find('iframe[name="ace_inner"]');
		outerBody = padOuter.find('#outerdocbody');

		// insert wbrtc containers
		var $target = outerBody;
		if ($target.find('#wbrtc_chatBox').length) return false;
		$target.prepend('<div id="wbrtc_chatBox"></div><div id="wbrtc_avatarCol"></div>');

		// module settings
		$('#options-wrtc-heading').on('change', function change() {
			$('#options-wrtc-heading').is(':checked') ? enableWrtcHeading() : disableWrtcHeading();
		});

		$('#options-wrtc-heading').trigger('change');



		if (browser.chrome || browser.firefox) {
			padInner.contents().on('copy', function copy(e) {
				events.addTextOnClipboard(e, ace, padInner, false);
			});

			padInner.contents().on('cut', function cut(e) {
				events.addTextOnClipboard(e, ace, padInner, true);
			});

			padInner.contents().on('paste', function paste() {
				setTimeout(function setTimeout() {
					WRTC_Room.adoptHeaderYRoom();
				}, 250);
			});
		}

		return socket;
	}

	return Object.freeze({
		init: init
	});
})();

/** **********************************************************************/
/*                           Etherpad Hooks                             */
/** **********************************************************************/

function getSocket() {
	return window.pad && window.pad.socket;
}

var hooks = {
	postAceInit: function postAceInit(hook, context) {

		if (!$('#editorcontainerbox').hasClass('flex-layout')) {
			$.gritter.add({
				title: 'Error',
				text: 'ep_wrtc_heading: Please upgrade to etherpad 1.8.3 for this plugin to work correctly',
				sticky: true,
				class_name: 'error'
			});
		}

		// TODO: use/replace Rest api to get this
		// Bridge into the ep_profiles
		window.clientVars.ep_profile_list = {};
		getSocket().on('message', function message(obj) {
			if (obj.type === 'COLLABROOM' && obj.data && obj.data.type === 'CUSTOM') {
				var data = obj.data.payload;
				if (data.action === 'EP_PROFILE_USERS_LIST') {
					data.list.forEach(function updateList(el) {
						if (!window.clientVars.ep_profile_list[el.userId]) window.clientVars.ep_profile_list[el.userId] = {};
						window.clientVars.ep_profile_list[el.userId] = el;
					});
				}
				if (data.action === 'EP_PROFILE_USER_LOGIN_UPDATE') {
					window.clientVars.ep_profile_list[data.userId] = data;
				}
			}
		});

		var ace = context.ace;
		var userId = window.pad.getUserId();
		var padId = window.pad.getPadId();

		var socket = EPwrtcHeading.init(ace, padId, userId);

		// TODO: make sure the priority of these components are in line
		// TODO: make sure clientVars contain all data that's necessary

		if(!clientVars.userId || !clientVars.padId) throw new Error("[wrtc]: clientVars doesn't exists");

		WRTC.postAceInit(hook, context, socket, padId);
		WRTC_Room.postAceInit(hook, context, socket, padId);
		videoChat.postAceInit(hook, context, socket, padId);
		textChat.postAceInit(hook, context, socket, padId);
		
		$('#editorcontainer iframe').ready(function readyObj() {
			WRTC.appendInterfaceLayout();
			setTimeout(function () {
				WRTC_Room.findTags();
			}, 250);
		});

		$(window).resize(_.debounce(function resize() {
			WRTC_Room.adoptHeaderYRoom();
		}, 100));
	},
	aceEditEvent: function aceEditEvent(hook, context) {
		var eventType = context.callstack.editEvent.eventType;

		// ignore these types
		if ('handleClick,idleWorkTimer,setup,importText,setBaseText,setWraps'.includes(eventType)) return;

		// some times init ep_wrtc_heading is not yet in the plugin list
		if (context.callstack.docTextChanged) WRTC_Room.adoptHeaderYRoom();

		// apply changes to the other user
		if (eventType === 'applyChangesToBase' && context.callstack.selectionAffected) {
			setTimeout(function setTimeout() {
				WRTC_Room.findTags();
			}, 250);
		}

		// if user create a new heading, depend on ep_headings2
		if (eventType === 'insertheading') {
			// unfortunately "setAttributesRange" takes a little time to set attribute
			// also ep_headings2 plugin has setTimeout about 250 ms to set and update H tag
			// more info: https://github.com/ether/ep_headings2/blob/6827f1f0b64d99c3f3082bc0477d87187073a74f/static/js/index.js#L71
			setTimeout(function setTimeout() {
				WRTC_Room.findTags();
			}, 250);
		}
	},
	aceAttribsToClasses: function aceAttribsToClasses(hook, context) {
		if (context.key === 'headingTagId') {
			return ['headingTagId_' + context.value];
		}
	},
	aceEditorCSS: function aceEditorCSS() {
		var version = clientVars.webrtc.version || 1;
		return ['ep_wrtc_heading/static/css/wrtcRoom.css?v=' + version + ''];
	},
	aceSetAuthorStyle: function aceSetAuthorStyle(hook, context) {
		WRTC_Room.aceSetAuthorStyle(context);
		WRTC.aceSetAuthorStyle(context);
	},
	userLeave: function userLeave(hook, context, callback) {
		WRTC_Room.userLeave(context, callback);
		console.log("etherpad user leave")
		// WRTC.userLeave(hook, context, callback);
	},
	aceSelectionChanged: function aceSelectionChanged(rep, context) {
		if (context.callstack.type === 'insertheading') {
			rep = context.rep;
			var headingTagId = ['headingTagId', randomString(16)];
			context.documentAttributeManager.setAttributesOnRange(rep.selStart, rep.selEnd, [headingTagId]);
		}
	},
	aceInitialized: function aceInitialized(hook, context) {
		var editorInfo = context.editorInfo;
		editorInfo.ace_hasHeaderOnSelection = _(events.hasHeaderOnSelection).bind(context);
	},
	chatNewMessage: function chatNewMessage(hook, context, callback) {
		var text = context.text;
		// If the incoming message is a link and the link has the title attribute wrtc
		if(text.indexOf('href=') > 0){
			text = $(text);
			var href = text.attr("href");
			var currentPath = location.origin + location.pathname;
			// If the link is belong to this header
			if(href.indexOf(currentPath) === 0){
				var urlParams = new URLSearchParams(href);
				var headerId = urlParams.get('id');
				var target = urlParams.get('target');
				if(headerId) {
					text = text.attr({
						"data-join": target,
						"data-action":"JOIN",
						"data-id": headerId
					}).addClass('btn_roomHandler');
					context.text = jQuery('<div />').append(text.eq(0).clone()).html();
				}
			}
		}
		callback(context);
	}
};

exports.postAceInit = hooks.postAceInit;
exports.aceEditorCSS = hooks.aceEditorCSS;
exports.aceAttribsToClasses = hooks.aceAttribsToClasses;
exports.aceEditEvent = hooks.aceEditEvent;
exports.aceSetAuthorStyle = hooks.aceSetAuthorStyle;
exports.userLeave = hooks.userLeave;
exports.aceSelectionChanged = hooks.aceSelectionChanged;
exports.aceInitialized = hooks.aceInitialized;
exports.chatNewMessage = hooks.chatNewMessage;