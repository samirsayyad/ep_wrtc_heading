/**
 * Copyright 2013 j <j@mailb.org>
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
"use strict";

window.WRTC = (function () {
	var videoSizes = { large: "260px", small: "160px" };
	var pcConfig = {};
	var pcConstraints = {
		optional: [{
			DtlsSrtpKeyAgreement: true
		}]
	};
	var sdpConstraints = {
		mandatory: {
			OfferToReceiveAudio: true,
			OfferToReceiveVideo: true
		}
	};
	var localStream;
	var remoteStream = {};
	var pc = {};
	var callQueue = [];
	var enlargedVideos = new Set();

	var self = {
		// API HOOKS
		postAceInit: function postAceInit(hook, context) {
			pcConfig.iceServers = clientVars.webrtc && clientVars.webrtc.iceServers ? clientVars.webrtc.iceServers : [{
				url: "stun:stun.l.google.com:19302"
			}];
			if (clientVars.webrtc.video.sizes.large) {
				videoSizes.large = clientVars.webrtc.video.sizes.large + "px";
			}
			if (clientVars.webrtc.video.sizes.small) {
				videoSizes.small = clientVars.webrtc.video.sizes.small + "px";
			}
			self.init(context.pad);
		},
		aceSetAuthorStyle: function aceSetAuthorStyle(hook, context) {
			if (context.author) {
				var user = self.getUserFromId(context.author);
				if (user) {
					$("#video_" + context.author.replace(/\./g, "_")).css({
						"border-color": user.colorId
					}).siblings(".user-name").text(user.name);
				}
			}
		},
		userJoinOrUpdate: function userJoinOrUpdate(hook, context) {
			/*
      var userId = context.userInfo.userId;
      console.log('userJoinOrUpdate', context, context.userInfo.userId, pc[userId]);
      */
		},
		userLeave: function userLeave(hook, context, callback) {
			var userId = context.userInfo.userId;
			if (userId && pc[userId]) {
				self.hangup(userId, true);
			}
			callback();
		},
		handleClientMessage_RTC_MESSAGE: function handleClientMessage_RTC_MESSAGE(hook, context) {
			if (context.payload.data.headingId === window.headingId) self.receiveMessage(context.payload);
		},

		// END OF API HOOKS
		show: function show() {
			$("#rtcbox").css("display", "flex");
		},
		showUserMediaError: function showUserMediaError(err) {
			// show an error returned from getUserMedia
			var reason;
			// For reference on standard errors returned by getUserMedia:
			// https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
			// However keep in mind that we add our own errors in getUserMediaPolyfill
			switch (err.name) {
				case "CustomNotSupportedError":
					reason = "Sorry, your browser does not support WebRTC. (or you have it disabled in your settings).<br><br>" + "To participate in this audio/video chat you have to user a browser with WebRTC support like Chrome, Firefox or Opera." + '<a href="http://www.webrtc.org/" target="_new">Find out more</a>';
					self.sendErrorStat("NotSupported");
					break;
				case "CustomSecureConnectionError":
					reason = "Sorry, you need to install SSL certificates for your Etherpad instance to use WebRTC";
					self.sendErrorStat("SecureConnection");
					break;
				case "NotAllowedError":
					// For certain (I suspect older) browsers, `NotAllowedError` indicates either an insecure connection or the user rejecting camera permissions.
					// The error for both cases appears to be identical, so our best guess at telling them apart is to guess whether we are in a secure context.
					// (webrtc is considered secure for https connections or on localhost)
					if (location.protocol === "https:" || location.hostname === "localhost" || location.hostname === "127.0.0.1") {
						reason = "Sorry, you need to give us permission to use your camera and microphone";
						self.sendErrorStat("Permission");
					} else {
						reason = "Sorry, you need to install SSL certificates for your Etherpad instance to use WebRTC";
						self.sendErrorStat("SecureConnection");
					}
					break;
				case "NotFoundError":
					reason = "Sorry, we couldn't find a suitable camera on your device. If you have a camera, make sure it set up correctly and refresh this website to retry.";
					self.sendErrorStat("NotFound");
					break;
				case "NotReadableError":
					// `err.message` might give useful info to the user (not necessarily useful for other error messages)
					reason = "Sorry, a hardware error occurred that prevented access to your camera and/or microphone:<br><br>" + err.message;
					self.sendErrorStat("Hardware");
					break;
				case "AbortError":
					// `err.message` might give useful info to the user (not necessarily useful for other error messages)
					reason = "Sorry, an error occurred (probably not hardware related) that prevented access to your camera and/or microphone:<br><br>" + err.message;
					self.sendErrorStat("Abort");
					break;
				default:
					// `err` as a string might give useful info to the user (not necessarily useful for other error messages)
					reason = "Sorry, there was an unknown Error:<br><br>" + err;
					self.sendErrorStat("Unknown");
			}
			$.gritter.add({
				title: "Error",
				text: reason,
				sticky: true,
				class_name: "error"
			});
			self.hide();
		},
		hide: function hide(userId) {
			userId = userId.split(".")[1];
			$("#rtcbox").find("#video_a_" + userId).parent().remove();
		},
		activate: function activate(headingId) {
			self.show();
			self.hangupAll();
			self.getUserMedia(headingId);
		},
		deactivate: function deactivate(userId, headingId) {
			self.hide(userId);
			self.hangupAll(headingId);
			self.hangup(userId, true, headingId);

			if (localStream) {
				var videoTrack = localStream.getVideoTracks()[0];
				// var audioTrack = localStream.getAudioTracks()[0]
				if (videoTrack.stop === undefined) {
					// deprecated in 2015, probably disabled by 2020
					// https://developers.google.com/web/updates/2015/07/mediastream-deprecations
					localStream.stop();
				} else {
					// videoTrack.stop();
					// audioTrack.stop();
				}
				localStream = null;
			}
		},
		toggleMuted: function toggleMuted() {
			var audioTrack = localStream.getAudioTracks()[0];
			if (audioTrack) {
				audioTrack.enabled = !audioTrack.enabled;
				return !audioTrack.enabled;
			}
		},
		toggleVideo: function toggleVideo() {
			var videoTrack = localStream.getVideoTracks()[0];
			if (videoTrack) {
				videoTrack.enabled = !videoTrack.enabled;
				return !videoTrack.enabled;
			}
		},
		getUserFromId: function getUserFromId(userId) {
			if (!self._pad || !self._pad.collabClient) return null;
			var result = self._pad.collabClient.getConnectedUsers().filter(function (user) {
				return user.userId === userId;
			});
			var user = result.length > 0 ? result[0] : null;
			return user;
		},
		setStream: function setStream(userId, stream) {
			var isLocal = userId === self.getUserId();
			var videoId = "video_" + userId.replace(/\./g, "_");
			var video = $("#" + videoId)[0];

			var user = self.getUserFromId(userId);

			if (!video && stream) {
				var videoContainer = $("<div class='video-container'>").css({
					width: videoSizes.small,
					"max-height": videoSizes.small
				}).appendTo($("#rtcbox"));

				videoContainer.append($('<div class="user-name">').text(user.name));

				video = $("<video playsinline>").attr("id", videoId).css({
					"border-color": user.colorId,
					width: videoSizes.small,
					"max-height": videoSizes.small
				}).on({
					loadedmetadata: function loadedmetadata() {
						self.addInterface(userId);
					}
				}).appendTo(videoContainer)[0];

				video.autoplay = true;
				if (isLocal) {
					videoContainer.addClass("local-user");
					video.muted = true;
				}
				self.addInterface(userId);
			}
			if (stream) {
				attachMediaStream(video, stream);
			} else if (video) {
				$(video).parent().remove();
			}
		},
		addInterface: function addInterface(userId) {
			var isLocal = userId === self.getUserId();
			var videoId = "video_" + userId.replace(/\./g, "_");
			var $video = $("#" + videoId);

			var $mute = $("<span class='interface-btn audio-btn buttonicon'>").attr("title", "Mute").on({
				click: function click(event) {
					var muted;
					if (isLocal) {
						muted = self.toggleMuted();
					} else {
						$video[0].muted = !$video[0].muted;
						muted = $video[0].muted;
					}
					$mute.attr("title", muted ? "Unmute" : "Mute").toggleClass("muted", muted);
				}
			});
			var videoEnabled = true;
			var $disableVideo = isLocal ? $("<span class='interface-btn video-btn buttonicon'>").attr("title", "Disable video").on({
				click: function click(event) {
					self.toggleVideo();
					videoEnabled = !videoEnabled;
					$disableVideo.attr("title", videoEnabled ? "Disable video" : "Enable video").toggleClass("off", !videoEnabled);
				}
			}) : null;

			var videoEnlarged = false;
			var $largeVideo = $("<span class='interface-btn enlarge-btn buttonicon'>").attr("title", "Make video larger").on({
				click: function click(event) {
					videoEnlarged = !videoEnlarged;

					if (videoEnlarged) {
						enlargedVideos.add(userId);
					} else {
						enlargedVideos["delete"](userId);
					}

					$largeVideo.attr("title", videoEnlarged ? "Make video smaller" : "Make video larger").toggleClass("large", videoEnlarged);

					var videoSize = videoEnlarged ? videoSizes.large : videoSizes.small;
					$video.parent().css({ width: videoSize, "max-height": videoSize });
					$video.css({ width: videoSize, "max-height": videoSize });
				}
			});

			$("#interface_" + videoId).remove();
			$("<div class='interface-container'>").attr("id", "interface_" + videoId).append($mute).append($disableVideo).append($largeVideo).insertAfter($video);
		},
		// Sends a stat to the back end. `statName` must be in the
		// approved list on the server side.
		sendErrorStat: function sendErrorStat(statName) {
			var msg = { component: "pad", type: "STATS", data: { statName: statName, type: "RTC_MESSAGE" } };
			pad.socket.json.send(msg);
		},
		sendMessage: function sendMessage(to, data) {
			self._pad.collabClient.sendMessage({
				type: "RTC_MESSAGE",
				payload: { data: data, to: to }
			});
		},
		receiveMessage: function receiveMessage(msg) {
			var peer = msg.from;
			var data = msg.data;
			var type = data.type;
			if (peer === self.getUserId()) {
				// console.log('ignore own messages');
				return;
			}
			/*
      if (type != 'icecandidate')
        console.log('receivedMessage', 'peer', peer, 'type', type, 'data', data);
      */
			if (type === "hangup") {
				self.hangup(peer, true);
			} else if (type === "offer") {
				if (pc[peer]) {
					self.hangup(peer, true);
					self.createPeerConnection(peer, data.headingId);
				} else {
					self.createPeerConnection(peer, data.headingId);
				}
				if (localStream) {
					if (pc[peer].getLocalStreams) {
						if (!pc[peer].getLocalStreams().length) {
							pc[peer].addStream(localStream);
						}
					} else if (pc[peer].localStreams) {
						if (!pc[peer].localStreams.length) {
							pc[peer].addStream(localStream);
						}
					}
				}
				var offer = new RTCSessionDescription(data.offer);
				pc[peer].setRemoteDescription(offer, function () {
					pc[peer].createAnswer(function (desc) {
						desc.sdp = cleanupSdp(desc.sdp);
						pc[peer].setLocalDescription(desc, function () {
							self.sendMessage(peer, { type: "answer", answer: desc, headingId: data.headingId });
						}, logError);
					}, logError, sdpConstraints);
				}, logError);
			} else if (type === "answer") {
				if (pc[peer]) {
					var answer = new RTCSessionDescription(data.answer);
					pc[peer].setRemoteDescription(answer, function () {}, logError);
				}
			} else if (type === "icecandidate") {
				if (pc[peer]) {
					var candidate = new RTCIceCandidate(data.candidate);
					var p = pc[peer].addIceCandidate(candidate);
					if (p) {
						p.then(function () {
							// Do stuff when the candidate is successfully passed to the ICE agent
						})["catch"](function () {
							console.log("Error: Failure during addIceCandidate()", data);
						});
					}
				}
			} else {
				console.log("unknown message", data);
			}
		},
		hangupAll: function hangupAll(_hangupAll) {
			Object.keys(pc).forEach(function (userId) {
				self.hangup(userId, true, _hangupAll);
			});
		},
		getUserId: function getUserId() {
			return self._pad && self._pad.getUserId();
		},
		hangup: function hangup(userId, notify, headingId) {
			notify = arguments.length === 1 ? true : notify;
			if (pc[userId] && userId !== self.getUserId()) {
				self.setStream(userId, "");
				pc[userId].close();
				delete pc[userId];
				notify && self.sendMessage(userId, { type: "hangup", headingId: headingId });
			}
		},
		call: function call(userId, headingId) {
			if (!localStream) {
				callQueue.push(userId);
				return;
			}
			var constraints = { optional: [], mandatory: {} };
			// temporary measure to remove Moz* constraints in Chrome
			if (webrtcDetectedBrowser === "chrome") {
				for (var prop in constraints.mandatory) {
					if (prop.indexOf("Moz") !== -1) {
						delete constraints.mandatory[prop];
					}
				}
			}
			constraints = mergeConstraints(constraints, sdpConstraints);

			if (!pc[userId]) {
				self.createPeerConnection(userId, headingId);
			}
			pc[userId].addStream(localStream);
			pc[userId].createOffer(function (desc) {
				desc.sdp = cleanupSdp(desc.sdp);
				pc[userId].setLocalDescription(desc, function () {
					self.sendMessage(userId, { type: "offer", offer: desc, headingId: headingId });
				}, logError);
			}, logError, constraints);
		},
		createPeerConnection: function createPeerConnection(userId, headingId) {
			if (pc[userId]) {
				console.log("WARNING creating PC connection even though one exists", userId);
			}
			pc[userId] = new RTCPeerConnection(pcConfig, pcConstraints);
			pc[userId].onicecandidate = function (event) {
				if (event.candidate) {
					self.sendMessage(userId, {
						type: "icecandidate",
						headingId: headingId,
						candidate: event.candidate
					});
				}
			};
			pc[userId].onaddstream = function (event) {
				remoteStream[userId] = event.stream;
				self.setStream(userId, event.stream);
			};
			pc[userId].onremovestream = function (event) {
				self.setStream(userId, "");
			};
		},
		getUserMedia: function getUserMedia(headingId) {
			var mediaConstraints = {
				audio: true,
				video: {
					optional: [],
					mandatory: {
						maxWidth: 320,
						maxHeight: 240
					}
				}
			};
			window.navigator.mediaDevices.getUserMedia(mediaConstraints).then(function (stream) {
				localStream = stream;
				self.setStream(self._pad.getUserId(), stream);
				self._pad.collabClient.getConnectedUsers().forEach(function (user) {
					if (user.userId !== self.getUserId()) {
						if (pc[user.userId]) {
							self.hangup(user.userId, false, headingId);
						}
						self.call(user.userId, headingId);
					}
				});
			})["catch"](function (err) {
				self.showUserMediaError(err);
			});
		},
		init: function init(pad) {
			self._pad = pad || window.pad;
			$(window).on("unload", function () {
				self.hangupAll();
			});
		}
	};

	// Normalize RTC implementation between browsers
	// var getUserMedia = window.navigator.mediaDevices.getUserMedia
	var attachMediaStream = function attachMediaStream(element, stream) {
		if (typeof element.srcObject !== "undefined") {
			element.srcObject = stream;
		} else if (typeof element.mozSrcObject !== "undefined") {
			element.mozSrcObject = stream;
		} else if (typeof element.src !== "undefined") {
			element.src = URL.createObjectURL(stream);
		} else {
			console.log("Error attaching stream to element.", element);
		}
	};
	var webrtcDetectedBrowser = "chrome";

	// Set Opus as the default audio codec if it's present.
	function preferOpus(sdp) {
		var sdpLines = sdp.split("\r\n");

		// Search for m line.
		for (var i = 0; i < sdpLines.length; i++) {
			if (sdpLines[i].search("m=audio") !== -1) {
				var mLineIndex = i;
				break;
			}
		}
		if (mLineIndex === null) return sdp;

		// If Opus is available, set it as the default in m line.
		for (var j = 0; j < sdpLines.length; j++) {
			if (sdpLines[j].search("opus/48000") !== -1) {
				var opusPayload = extractSdp(sdpLines[j], /:(\d+) opus\/48000/i);
				if (opusPayload) sdpLines[mLineIndex] = setDefaultCodec(sdpLines[mLineIndex], opusPayload);
				break;
			}
		}

		// Remove CN in m line and sdp.
		sdpLines = removeCN(sdpLines, mLineIndex);

		sdp = sdpLines.join("\r\n");
		return sdp;
	}

	function extractSdp(sdpLine, pattern) {
		var result = sdpLine.match(pattern);
		return result && result.length === 2 ? result[1] : null;
	}

	// Set the selected codec to the first in m line.
	function setDefaultCodec(mLine, payload) {
		var elements = mLine.split(" ");
		var newLine = [];
		var index = 0;
		for (var i = 0; i < elements.length; i++) {
			if (index === 3)
				// Format of media starts from the fourth.
				newLine[index++] = payload; // Put target payload to the first.
			if (elements[i] !== payload) newLine[index++] = elements[i];
		}
		return newLine.join(" ");
	}

	// Strip CN from sdp before CN constraints is ready.
	function removeCN(sdpLines, mLineIndex) {
		var mLineElements = sdpLines[mLineIndex].split(" ");
		// Scan from end for the convenience of removing an item.
		for (var i = sdpLines.length - 1; i >= 0; i--) {
			var payload = extractSdp(sdpLines[i], /a=rtpmap:(\d+) CN\/\d+/i);
			if (payload) {
				var cnPos = mLineElements.indexOf(payload);
				if (cnPos !== -1) {
					// Remove CN payload from m line.
					mLineElements.splice(cnPos, 1);
				}
				// Remove CN line in sdp
				sdpLines.splice(i, 1);
			}
		}

		sdpLines[mLineIndex] = mLineElements.join(" ");
		return sdpLines;
	}

	function sdpRate(sdp, rate) {
		rate = rate || 1638400;
		return sdp.replace(/b=AS:\d+\r/g, "b=AS:" + rate + "\r");
	}

	function cleanupSdp(sdp) {
		sdp = preferOpus(sdp);
		sdp = sdpRate(sdp);
		return sdp;
	}

	function mergeConstraints(cons1, cons2) {
		var merged = cons1;
		for (var name in cons2.mandatory) {
			merged.mandatory[name] = cons2.mandatory[name];
		}
		merged.optional.concat(cons2.optional);
		return merged;
	}
	function logError(error) {
		console.log("WebRTC ERROR:", error);
	}

	self.pc = pc;
	// window.rtc = self
	return self;
})();