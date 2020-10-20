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
'use strict';

var WRTC = (function WRTC() {
	var padId = null;
	var socket = null;
	var videoSizes = { large: '260px', small: '160px' };
	var pcConfig = {};
	var audioInputSelect = null;
	var videoSelect = null;
	var audioOutputSelect = null;
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
	var localVideoElement = null;
	var gState = null
	var streamId = null

	var joinBefore = false;
	var connection = null

	var sessionId = null

	var RTCTTTSSSCOOO = function () {




		 connection = new RTCMultiConnection();

		//  connection.connect();

		// connection.socketURL = 'https://rtcmulticonnection.herokuapp.com:443/';
		connection.socketURL = '/';

		connection.socketMessageEvent = 'video-conference-demo';

		connection.session = {
			audio: true,
			video: true
		};

		connection.sdpConstraints.mandatory = {
			OfferToReceiveAudio: true,
			OfferToReceiveVideo: true
		};

		// STAR_FIX_VIDEO_AUTO_PAUSE_ISSUES
		// via: https://github.com/muaz-khan/RTCMultiConnection/issues/778#issuecomment-524853468
		var bitrates = 128;
		var resolutions = 'Ultra-HD';
		var videoConstraints = {};

		if (resolutions == 'HD') {
			videoConstraints = {
				width: {
					ideal: 300
				},
				height: {
					ideal: 200
				},
				frameRate: 10
			};
		}

		if (resolutions == 'Ultra-HD') {
			videoConstraints = {
				width: {
					ideal: 1920
				},
				height: {
					ideal: 1080
				},
				frameRate: 30
			};
		}

		connection.mediaConstraints = {
			video: videoConstraints,
			audio: true
		};

		var CodecsHandler = connection.CodecsHandler;

		connection.processSdp = function (sdp) {
			var codecs = 'vp9';

			if (codecs.length) {
				sdp = CodecsHandler.preferCodec(sdp, codecs.toLowerCase());
			}

			if (resolutions == 'HD') {
				sdp = CodecsHandler.setApplicationSpecificBandwidth(sdp, {
					audio: 128,
					video: bitrates,
					screen: bitrates
				});

				sdp = CodecsHandler.setVideoBitrates(sdp, {
					min: bitrates * 8 * 1024,
					max: bitrates * 8 * 1024,
				});
			}

			if (resolutions == 'Ultra-HD') {
				sdp = CodecsHandler.setApplicationSpecificBandwidth(sdp, {
					audio: 128,
					video: bitrates,
					screen: bitrates
				});

				sdp = CodecsHandler.setVideoBitrates(sdp, {
					min: bitrates * 8 * 1024,
					max: bitrates * 8 * 1024,
				});
			}

			return sdp;
		};
		// END_FIX_VIDEO_AUTO_PAUSE_ISSUES

		// https://www.rtcmulticonnection.org/docs/iceServers/
		// use your own TURN-server here!
		connection.iceServers = [{
			'urls': [
				'stun:stun.l.google.com:19302',
				'stun:stun1.l.google.com:19302',
				'stun:stun2.l.google.com:19302',
				'stun:stun.l.google.com:19302?transport=udp',
			]
		}];


		connection.onstream = function (event) {
			var existing = document.getElementById(event.streamid);
			if (existing && existing.parentNode) {
				existing.parentNode.removeChild(existing);
			}

			event.mediaElement.removeAttribute('src');
			event.mediaElement.removeAttribute('srcObject');
			event.mediaElement.muted = true;
			event.mediaElement.volume = 0;

			var video = document.createElement('video');

			try {
				video.setAttributeNode(document.createAttribute('autoplay'));
				video.setAttributeNode(document.createAttribute('playsinline'));
			} catch (e) {
				video.setAttribute('autoplay', true);
				video.setAttribute('playsinline', true);
			}

			if (event.type === 'local') {
				video.volume = 0;
				try {
					video.setAttributeNode(document.createAttribute('muted'));
				} catch (e) {
					video.setAttribute('muted', true);
				}
			}
			localStream = event.stream
			streamId = event.streamid
			video.srcObject = event.stream;

			// var width = parseInt(connection.videosContainer.clientWidth / 3) - 20;
			// var mediaElement = getHTMLMediaElement(video, {
			// 		title: event.userid,
			// 		buttons: ['full-screen'],
			// 		width: width,
			// 		showOnMouseEnter: false
			// });

			console.log(connection.videosContainer)
			$(connection.videosContainer).append(
				$(video).css({
					"width": "200px",
					"height": "160px"
				}).attr({
					id: event.streamid
				})

			);

			// setTimeout(function() {
			// 	video.media.play();
			// }, 5000);

			// mediaElement.id = event.streamid;

			// to keep room-id in cache
			// localStorage.setItem(connection.socketMessageEvent, connection.sessionid);

			// chkRecordConference.parentNode.style.display = 'none';






		};


		connection.onstreamended = function (event) {

			console.log("---------------------------------------------------22222")
			console.log(event)
			console.log(connection)
			console.log(connection.streamEvents.selectAll())

			if (event.type === "local") {
				joinBefore = true
			}

			console.log("---------------------------------------------------22222")
			var mediaElement = document.getElementById(event.streamid);
			if (mediaElement && event.type === "remote") {
				mediaElement.parentNode.removeChild(mediaElement);
			}
		};

		connection.onMediaError = function (e) {
			console.log("onMediaError=>>>", e)
			if (e.message === 'Concurrent mic process limit.') {
				if (DetectRTC.audioInputDevices.length <= 1) {
					alert('Please select external microphone. Check github issue number 483.');
					return;
				}

				var secondaryMic = DetectRTC.audioInputDevices[1].deviceId;
				connection.mediaConstraints.audio = {
					deviceId: secondaryMic
				};

				connection.join(connection.sessionid);
			}
		};




		var sessions = {};
		connection.onNewSession = function (session) {

			console.log(session, "sessionsessionsessionsession")

			if (sessions[session.sessionid]) return;
			sessions[session.sessionid] = session;

			var tr = document.createElement('tr');
			tr.innerHTML = '<td><strong>' + session.extra['session-name'] + '</strong> is running a conference!</td>' +
				'<td><button class="join">Join</button></td>';
			roomsList.insertBefore(tr, roomsList.firstChild);

			var joinRoomButton = tr.querySelector('.join');
			joinRoomButton.setAttribute('data-sessionid', session.sessionid);
			joinRoomButton.onclick = function () {
				this.disabled = true;

				var sessionid = this.getAttribute('data-sessionid');
				session = sessions[sessionid];

				if (!session) throw 'No such session exists.';

				connection.join(session);
			};
		};

	



	}


	var dddd = function () {
		var videosContainer = document.querySelector('#wrtc_modal .videoWrapper') || document.body;

		connection = new RTCMultiConnection();

	 // https://github.com/muaz-khan/WebRTC-Experiment/tree/master/socketio-over-nodejs
	 var SIGNALING_SERVER = 'https://socketio-over-nodejs2.herokuapp.com:443/';

	 connection.openSignalingChannel = function (config) {
		 var channel = config.channel || connection.channel || 'default-namespace';
		 var sender = Math.round(Math.random() * 9999999999) + 9999999999;

		 io.connect(SIGNALING_SERVER).emit('new-channel', {
			 channel: channel,
			 sender: sender
		 });

		 var socket = io.connect(SIGNALING_SERVER + channel);
		 socket.channel = channel;

		 socket.on('connect', function () {
			 if (config.callback) config.callback(socket);
		 });

		 socket.send = function (message) {
			 socket.emit('message', {
				 sender: sender,
				 data: message
			 });
		 };

		 socket.on('message', config.onmessage);
	 };


	 connection.onstream = function (e) {
		 e.mediaElement.width = 300;
		 videosContainer.appendChild(e.mediaElement, videosContainer.firstChild);
		 // rotateVideo(e.mediaElement);
		 // scaleVideos();

		 document.getElementById('leave-conference').disabled = false;
	 };



	 connection.onstreamended = function (e) {
		 e.mediaElement.style.opacity = 0;
		 rotateVideo(e.mediaElement);
		 setTimeout(function () {
			 if (e.mediaElement.parentNode) {
				 e.mediaElement.parentNode.removeChild(e.mediaElement);
			 }
			 scaleVideos();
		 }, 1000);
	 };



	 
	 var sessions = {};
	 connection.onNewSession = function (session) {
		 if (sessions[session.sessionid]) return;
		 sessions[session.sessionid] = session;

		 console.log(session.sessionid, "session.sessionidsession.sessionidsession.sessionid")

		 // var tr = document.createElement('tr');
		 // tr.innerHTML = '<td><strong>' + session.extra['session-name'] + '</strong> is running a conference!</td>' +
		 // 	'<td><button class="join">Join</button></td>';
		 // roomsList.insertBefore(tr, roomsList.firstChild);

		 // var joinRoomButton = tr.querySelector('.join');
		 // joinRoomButton.setAttribute('data-sessionid', session.sessionid);
		 // joinRoomButton.onclick = function () {
		 // 	this.disabled = true;

		 // 	var sessionid = this.getAttribute('data-sessionid');
		 // 	session = sessions[sessionid];

		 // 	if (!session) throw 'No such session exists.';

		 // 	connection.join(session);
		 // };
	 };
	}

	// create an empty priority queue
var queue = new TinyQueue();

	var queue = [];

	share.wrtcPubsub.on('WebRTC call', function(data){
		console.log('WebRTC call')
		var userId = data.userId
		var headerId = data.headerId

		//put value on end of queue
		queue.push(data);

	})

	share.wrtcPubsub.on('WebRTC accept new call', function(data){
		console.log('WebRTC accept new call')

	})

	function postAceInit(hook, context, webSocket, docId) {
		padId = docId;
		socket = webSocket;

		// RTCTTTSSSCOOO()
		dddd()

		// https://developer.mozilla.org/en-US/docs/Web/API/RTCConfiguration/iceServers
		// Don't forget to use TURN server, The Stun server is not enough.
		pcConfig.iceServers = [{
			'urls': [
				'stun:stun.l.google.com:19302',
				'stun:stun1.l.google.com:19302',
				'stun:stun2.l.google.com:19302',
				'stun:stun.l.google.com:19302?transport=udp',
			]
		}];

		if(clientVars.webrtc && clientVars.webrtc.iceServers) pcConfig.iceServers = clientVars.webrtc.iceServers;

		if (clientVars.webrtc.video.sizes.large) {
			videoSizes.large = clientVars.webrtc.video.sizes.large + 'px';
		}
		if (clientVars.webrtc.video.sizes.small) {
			videoSizes.small = clientVars.webrtc.video.sizes.small + 'px';
		}
		webSocket.on("RTC_MESSAGE", async function(context){




			if (context.data.payload.data.headerId === window.headerId) {
				// console.log("my oooooooofffffffff, ", context.data.payload.data.type)
				// if(context.data.payload.data.type!=='offer'){
					await self.receiveMessage(context.data.payload);
				// }
			} 
	
			
	
	
		})


		// webSocket.on('makeCall', function(userId, headerId) {
		// 	console.log(userId, headerId, "============makeCallmakeCallmakeCall")
		// 	self.call(userId, headerId);
		// })

		$(document).on('change', 'select#audioSource', self.audioVideoInputChange);
		$(document).on('change', 'select#videoSource', self.audioVideoInputChange);
		$(document).on('change', 'select#audioOutput', self.changeAudioDestination);

		$(window).on('unload', function () {
			self.hangupAll();
		});

	}

	function aceSetAuthorStyle (context) {
		if (context.author) {
			var user = share.getUserFromId(context.author);
			if (user) {
				$('#video_' + user.userId.replace(/\./g, '_')).css({
					'border-color': user.colorId
				}).siblings('.user-name').text(user.name);
			}
		}
	}

	var self = {
		_pad: window.pad,
		postAceInit: postAceInit,
		aceSetAuthorStyle: aceSetAuthorStyle,
		appendInterfaceLayout: function appendInterfaceLayout() {
			// TODO: legacy code, move it to template
			var werc_toolbar = $('#wertc_modal_toolbar').tmpl({
				videoChatLimit: clientVars.webrtc.videoChatLimit,
				headerId: ''
			});
			var $wrtc_modal = $('<div id="wrtc_modal"><div class="videoWrapper" class="thin-scrollbar"></div></div');
			$wrtc_modal.append(werc_toolbar);
			$('body').prepend($wrtc_modal);

			$(document).on('click', '#wrtc_modal .btn_toggle_modal', function click() {
				var $parent = $(this).parent().parent();
				var action = $(this).attr('data-action');
				var videoBox = $('#wrtc_modal .videoWrapper').innerHeight();

				$(this).find('.fa_arrow-from-top').toggle();
				$(this).find('.fa_arrow-to-top').toggle();

				if (action === 'collapse') {
					$(this).attr({ 'data-action': 'expand' });
					$parent.find('.btn_enlarge').removeAttr('active');
					$('#wrtc_modal').css({
						transform: 'translate(-50%, -' + videoBox + 'px)'
					});
				} else {
					$(this).attr({ 'data-action': 'collapse' });
					$parent.find('.btn_enlarge').attr({ active: true });
					$('#wrtc_modal').css({
						transform: 'translate(-50%, 0)'
					});
				}
			});
		
			$(document).on('click', '#wrtc_settings .btn_info', function click() {
				var userID = Object.keys(pc)
				var $this =  $(this)
				var isActive = $this.attr('data-active')
				var $modal = $(document).find("#wrtc_settings .wrtc_info")

				if(isActive){
					$modal.hide();
					if(pc[userID[0]]){
						getStats(pc[userID[0]], function(result) {
							result.nomore();
						})
					}
					$this.removeAttr("data-active")
					return true;
				} else {
					$this.attr({'data-active': true})
					$modal.show()
				}

				if(pc[userID[0]] && !isActive){
					function bytesToSize(bytes) {
							var k = 1000;
							var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
							if (bytes <= 0) {
									return '0 Bytes';
							}
							var i = parseInt(Math.floor(Math.log(bytes) / Math.log(k)), 10);
							
							if(!sizes[i]) {
									return '0 Bytes';
							}
		
							return (bytes / Math.pow(k, i)).toPrecision(3) + ' ' + sizes[i];
					}
					getStats(pc[userID[0]], function(result) {
							const statistic ={
								"speed": bytesToSize(result.bandwidth.speed),
								"availableSendBandwidth": bytesToSize(result.bandwidth.availableSendBandwidth),
								"video": {
									"send.codecs": result.video.send.codecs.join(", "),
									// "recv.codecs": result.video.recv.codecs.join(", "),
									"bytesSent": bytesToSize(result.video.bytesSent),
									"bytesReceived": bytesToSize(result.video.bytesReceived)
								},
								"audio":{
									"send.codecs": result.audio.send.codecs.join(", "),
									// "recv.codecs": result.audio.recv.codecs.join(", "),
									"bytesSent": bytesToSize(result.audio.bytesSent),
									"bytesReceived": bytesToSize(result.audio.bytesReceived)
								}
							}
							$(document).find("#wrtc_settings .wrtc_info").html(`<pre>${JSON.stringify(statistic, undefined, 2)}</pre>`)
					}, 1000);
				}
	
			
			

			})
		
			$(document).on('click', '#wrtc_settings .btn_close', function click() {
				$('#wrtc_settings').toggleClass('active');
				var $btnInfo = $("#wrtc_settings .btn_info")
				if($btnInfo.attr('data-active')) $btnInfo.trigger("click")
			});

		},
		userLeave: function userLeave(userId) {
			// if (userId && pc[userId]) {
			// 	gState = "LEAVING"
			// 	self.removeVideoInterface(userId)
			// 	self.hangup(userId, true);
			// }
			sessions = {};

			connection.leave();


			  // //   // disconnect with all users
				// 	connection.getAllParticipants().forEach(function(pid) {
				// 		connection.disconnectWith(pid);
				// });

				// console.log("localstream", localStream)
				// if(localStream){
				// 	share.stopStreaming(localStream)
				// 	localStream = null
				// }
				// console.log("localstream", localStream)
				// console.log("------------------------")
				// // console.log(connection.streamEvents.selectFirst().stream)
				// console.log("------------------------")

				// if(connection.streamEvents.selectFirst() && connection.streamEvents.selectFirst().stream)
				// 	share.stopStreaming(connection.streamEvents.selectFirst().stream)

				// connection.leave()


				// console.log(connection.attachStreams)
				// console.log(connection.attachStreams)


				// connection.removeStream(streamId);

				// connection.closeSocket();
				

				// stop all local cameras
				// connection.attachStreams.forEach(function(stream) {
				// 		stream.stop();
				// });
		
				// close socket.io connection
				

				console.log(connection.streamEvents.selectAll())

		},
		show: function show() {
			$('#pad_title').addClass('f_wrtcActive');
		},
		showUserMediaError: function showUserMediaError(err) {
			// show an error returned from getUserMedia
			var reason;
			// For reference on standard errors returned by getUserMedia:
			// https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
			// However keep in mind that we add our own errors in getUserMediaPolyfill
			switch (err.name) {
				case 'CustomNotSupportedError':
					reason = 'Sorry, your browser does not support WebRTC. (or you have it disabled in your settings).<br><br>' + 'To participate in this audio/video chat you have to user a browser with WebRTC support like Chrome, Firefox or Opera.' + '<a href="http://www.webrtc.org/" target="_new">Find out more</a>';
					self.sendErrorStat('NotSupported');
					break;
				case 'CustomSecureConnectionError':
					reason = 'Sorry, you need to install SSL certificates for your Etherpad instance to use WebRTC';
					self.sendErrorStat('SecureConnection');
					break;
				case 'NotAllowedError':
					// For certain (I suspect older) browsers, `NotAllowedError` indicates either an insecure connection or the user rejecting camera permissions.
					// The error for both cases appears to be identical, so our best guess at telling them apart is to guess whether we are in a secure context.
					// (webrtc is considered secure for https connections or on localhost)
					if (location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
						reason = 'Sorry, you need to give us permission to use your camera and microphone';
						self.sendErrorStat('Permission');
					} else {
						reason = 'Sorry, you need to install SSL certificates for your Etherpad instance to use WebRTC';
						self.sendErrorStat('SecureConnection');
					}
					break;
				case 'NotFoundError':
					reason = "Sorry, we couldn't find a suitable camera on your device. If you have a camera, make sure it set up correctly and refresh this website to retry.";
					self.sendErrorStat('NotFound');
					break;
				case 'NotReadableError':
					// `err.message` might give useful info to the user (not necessarily useful for other error messages)
					reason = 'Sorry, a hardware error occurred that prevented access to your camera and/or microphone:<br><br>' + err.message;
					self.sendErrorStat('Hardware');
					break;
				case 'AbortError':
					// `err.message` might give useful info to the user (not necessarily useful for other error messages)
					reason = 'Sorry, an error occurred (probably not hardware related) that prevented access to your camera and/or microphone:<br><br>' + err.message;
					self.sendErrorStat('Abort');
					break;
				default:
					// `err` as a string might give useful info to the user (not necessarily useful for other error messages)
					reason = 'Sorry, there was an unknown Error:<br><br>' + err;
					self.sendErrorStat('Unknown');
			}
			$.gritter.add({
				title: 'Error',
				text: reason,
				sticky: true,
				class_name: 'error'
			});
			self.hide();
		},
		hide: function hide(userId) {
			if (!userId) return false;
			userId = userId.split('.')[1];
			$('#rtcbox').find('#video_a_' + userId).parent().remove();
		},
		activate: function activate(headerId) {
			self.show();
			// isActive = true;
			// return self.getUserMedia(headerId);

			// console.log(connection.streamEvents.selectAll(), "===========activate")
			// console.log(connection, "===========activate")


			// by default, socket.io server is assumed to be deployed on your own URL
			// connection.socketURL = '/';

			// comment-out below line if you do not have your own socket.io server



console.log("sessionidsessionidsessionid0",sessionId , connection.sessionid)

			connection.checkPresence(headerId, function(isRoomExist, roomid) {
				if (isRoomExist === true) {
					// this.disabled = true;

					// var sessionid = this.getAttribute('data-sessionid');
					session = sessions[headerId];

					if (!session) {
						sessionId = headerId
					connection.extra = {
							'session-name': 'Anonymous'
					};
						connection.open();
						return false
					}

					connection.join(headerId);
				}else{
					connection.sessionid = headerId;
					// this.disabled = true;

					sessionId = connection.sessionid
					connection.extra = {
							'session-name': 'Anonymous'
					};
					connection.open();
				}
			})








			// connection.videosContainer = $(document).find('#wrtc_modal .videoWrapper');


		
			// console.log("connect again to sokcet")

				
			// connection.checkPresence(headerId, function(isRoomExist, roomid) {
			// 	console.log(isRoomExist, roomid, "checkPresence", joinBefore)

			// 	connection.sessionid(`${window.pad.getPadId()}:${headerId}`)


			// 		if (isRoomExist === true) {
			// 			connection.connect(headerId);
			// 			// if(joinBefore) {
			// 			// 	connection.rejoin(headerId);

			// 			// }else {

			// 			// 	connection.join(headerId);
							
			// 			// }
			// 		} else {
			// 				connection.open(headerId);
			// 		}
			// });






































		},
		deactivate: function deactivate(userId, headerId) {
			// if (!userId) return false;
			// gState = "DEACTIVE"
			// self.hide(userId);
			// self.hangupAll(headerId);
			// if(pc[userId]) pc[userId].close();
			// self.hangup(userId, true, headerId);
			// if (localStream) {
			// 	share.stopStreaming(localStream)
			// 	localStream = null;
			// }
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
		appendNewVideoInterface: function appendNewVideoInterface (userId, stream) {
			if (!userId) return false;
			var isLocal = userId === share.getUserId();
			var videoId = 'video_' + userId.replace(/\./g, '_');
			var video = $(document).find('#' + videoId)[0];
			
			var user = share.getUserFromId(userId) || {name: "Anonymous"};

			if (!video) {
				var videoContainer = $("<div class='video-container'>")
				.css({
					'width': videoSizes.small,
					'max-height': videoSizes.small
				})
				.append($('<div class="user-name">').text(user.name))
				.append(`<p class="connectionStatus" style="color: #ffff;position: absolute;padding: 0;margin:0">connecting</p>`)
				.appendTo($('#wrtc_modal .videoWrapper'));

				video = $('<video playsinline>')
				.attr('id', videoId)
				.css({
					'border-color': user.colorId,
					'width': videoSizes.small,
					'max-height': videoSizes.small
				})
				.on({
					loadedmetadata: function loadedmetadata() {
						self.addInterface(userId);
					}
				})
				.appendTo(videoContainer)[0];

				video.autoplay = true;

				if (isLocal) {
					videoContainer.addClass('local-user');
					video.muted = true;
				}
				self.addInterface(userId);
			}
			if(stream) attachMediaStream(video, stream);
		},
		removeVideoInterface: function stopStreaming(userId){
			if (!userId) return false;
			var videoId = 'video_' + userId.replace(/\./g, '_');
			var video = $(document).find('#' + videoId)[0];
			if (video) $(video).parent().find('.connectionStatus').text(gState);
			if(video && gState !== "RECONNECTING") $(video).parent().remove();
		},
		setStream: function setStream(userId, stream) {

			// if (!userId) return false;
			// var videoId = 'video_' + userId.replace(/\./g, '_');
			// var video = $(document).find('#' + videoId)[0];
			// if (video) $(video).parent().find('.connectionStatus').text(gState);

			// if(!video){
			// 	self.appendNewVideoInterface(userId, stream)
			// } else {
			// 	if(stream) attachMediaStream(video, stream);
			// }

			if (!userId) return false;
			var isLocal = userId === share.getUserId();
			var videoId = 'video_' + userId.replace(/\./g, '_');
			var video = $('#' + videoId)[0];

			var user = share.getUserFromId(userId);

			if (!video && stream) {
				var videoContainer = $("<div class='video-container'>").css({
					width: videoSizes.small,
					'max-height': videoSizes.small
				}).appendTo($('#wrtc_modal .videoWrapper'));

				videoContainer.append($('<div class="user-name">').text(user.name));

				video = $('<video playsinline>').attr('id', videoId).css({
					'border-color': user.colorId,
					width: videoSizes.small,
					'max-height': videoSizes.small
				}).on({
					loadedmetadata: function loadedmetadata() {
						self.addInterface(userId);
					}
				}).appendTo(videoContainer)[0];

				video.autoplay = true;
				if (isLocal) {
					videoContainer.addClass('local-user');
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
			if (!userId) return false;
			var isLocal = userId === share.getUserId();
			var videoId = 'video_' + userId.replace(/\./g, '_');
			var $video = $(document).find('#' + videoId);
			var videoEnabled = true;
			var videoEnlarged = false;

			var $mute = $("<span class='interface-btn audio-btn buttonicon'>")
			.attr('title', 'Mute')
			.on({
				click: function click() {
					var muted;
					if (isLocal) {
						muted = self.toggleMuted();
					} else {
						$video[0].muted = !$video[0].muted;
						muted = $video[0].muted;
					}
					$mute.attr('title', muted ? 'Unmute' : 'Mute').toggleClass('muted', muted);
				}
			});

			var $disableVideo = isLocal ? $("<span class='interface-btn video-btn buttonicon'>").attr('title', 'Disable video').on({
				click: function click() {
					self.toggleVideo();
					videoEnabled = !videoEnabled;
					$disableVideo.attr('title', videoEnabled ? 'Disable video' : 'Enable video').toggleClass('off', !videoEnabled);
				}
			}) : null;


			var $largeVideo = $("<span class='interface-btn enlarge-btn buttonicon'>").attr('title', 'Make video larger').on({
				click: function click() {
					videoEnlarged = !videoEnlarged;

					if (videoEnlarged) {
						enlargedVideos.add(userId);
					} else {
						enlargedVideos['delete'](userId);
					}

					$largeVideo.attr('title', videoEnlarged ? 'Make video smaller' : 'Make video larger').toggleClass('large', videoEnlarged);

					var videoSize = $(document).find('#wrtc_modal .ndbtn.btn_enlarge').hasClass('large') ? videoSizes.large : videoSizes.small;
					
					$video.parent().css({ width: videoSize, 'max-height': videoSize });
					$video.css({ width: videoSize, 'max-height': videoSize });
				}
			});

			if($(document).find('#wrtc_modal .ndbtn.btn_enlarge').hasClass('large')){
				$video.parent().css({ width: videoSizes.large,  });
				$video.css({ width: videoSizes.large, });
			}

			if(isLocal) localVideoElement = $video;

			$('#interface_' + videoId).remove();
			$("<div class='interface-container'>")
			.attr('id', 'interface_' + videoId)
			.append([$largeVideo, $disableVideo, $mute])
			.insertAfter($video);

			self.changeAudioDestination();

		},
		// Sends a stat to the back end. `statName` must be in the
		// approved list on the server side.
		sendErrorStat: function sendErrorStat(statName) {
			var msg = { component: 'pad', type: 'STATS', data: { statName: statName, type: 'RTC_MESSAGE' } };
			console.error("[wrtc]: ", msg)
			// self._pad.socket.json.send(msg);
		},
		sendMessage: function sendMessage(to, data) {
			socket.emit("RTC_MESSAGE", {
				type: 'RTC_MESSAGE',
				client: {
					userId: clientVars.userId, 
					name: clientVars.userName,
					padId:clientVars.padId,
					headerId: window.headerId
				},
				payload: { data: data, to: to }
			});
		},
		receiveMessage: async function receiveMessage(msg) {
			// var peer = msg.from; // userId sender
			// var data = msg.data;
			// var type = data.type;
			// // ignore own messages
			// if (peer === share.getUserId()) return;
			// // console.log(peer, "===-===",share.getUserId(), "===", type, new Date().getSeconds())
			
			// if (type === 'hangup') {
			// 	self.hangup(peer, true);
			// } else if (type === 'offer') {

				
			// 	if (pc[peer]) {
			// 		self.hangup(peer, true);
			// 		self.createPeerConnection(peer, data.headerId);
			// 	} else {
			// 		self.createPeerConnection(peer, data.headerId);
			// 	}

			// 	var offer = new RTCSessionDescription(data.offer);

			// 	await pc[peer].setRemoteDescription(offer).catch(err => logError(err, "offer:setRemoteDescription"))
				
			// 	if (localStream) {
			// 		if (pc[peer].getLocalStreams) {
			// 			if (!pc[peer].getLocalStreams().length) {
			// 				pc[peer].addStream(localStream);
			// 			}
			// 		} else if (pc[peer].localStreams) {
			// 			if (!pc[peer].localStreams.length) {
			// 				pc[peer].addStream(localStream);
			// 			}
			// 		}
			// 	}


				
			// 	let desc = await pc[peer].createAnswer(sdpConstraints).catch((err) => logError(err, "offer:createAnswer"))
				
			// 	desc.sdp = cleanupSdp(desc.sdp);

			// 	await pc[peer].setLocalDescription(desc).catch((err) => logError(err, "offer:setLocalDescription"))

			// 	self.sendMessage(peer, { type: 'answer', answer: desc, userId: msg.from, headerId: data.headerId });
			// 	console.log("Now You can have new connection33333")
			// } else if (type === 'answer') {
			// 	//  console.log(type, "============", peer)
			// 	if (pc[peer]) {
			// 		// console.log(data, "================")
			// 		var answer = new RTCSessionDescription(data.answer);
			// 		await pc[peer].setRemoteDescription(answer).catch((err) => logError(err, "answer:setRemoteDescription", msg))
			// 		console.log("Now You can have new connection22222222")
			// 	}
			// } else if (type === 'icecandidate') {
			// 	if (pc[peer]) {
			// 		if(!data.candidate) return false
			// 		var candidate = new RTCIceCandidate(data.candidate);
			// 		// console.log(candidate)
			// 		await pc[peer].addIceCandidate(candidate).catch(error => {
			// 			console.error('Error: Failure during addIceCandidate()', error);
			// 		})
			// 		console.log("Now You can have new connection11")
			// 	}
			// } else {
			// 	console.error('unknown server message', data);
			// }

			// return true;
			var peer = msg.from;
			var data = msg.data;
			var type = data.type;
			if (peer === share.getUserId()) {
				// console.info('ignore own messages');
				return;
			}
			/*
      if (type != 'icecandidate')
        console.info('receivedMessage', 'peer', peer, 'type', type, 'data', data);
      */
			if (type === 'hangup') {
				self.hangup(peer, true);
			} else if (type === 'offer') {
				if (pc[peer]) {
					self.hangup(peer, true);
					self.createPeerConnection(peer, data.headerId);
				} else {
					self.createPeerConnection(peer, data.headerId);
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
							self.sendMessage(peer, { type: 'answer', answer: desc, headerId: data.headerId });
						}, logError);
					}, logError, sdpConstraints);
				}, logError);
			} else if (type === 'answer') {
				if (pc[peer]) {
					var answer = new RTCSessionDescription(data.answer);
					pc[peer].setRemoteDescription(answer, function () {}, logError);
				}
			} else if (type === 'icecandidate') {
				if (pc[peer]) {
					var candidate = new RTCIceCandidate(data.candidate);
					var p = pc[peer].addIceCandidate(candidate);
					if (p) {
						p.then(function () {
							// Do stuff when the candidate is successfully passed to the ICE agent
						})['catch'](function () {
							console.error('Error: Failure during addIceCandidate()', data);
						});
					}
				}
			} else {
				console.error('unknown message', data);
			}
		},
		audioVideoInputChange: function audioVideoInputChange() {
			if(!localStream) return false;
			localStream.getTracks().forEach(function (track) {
				track.stop();
			});
			self.getUserMedia(window.headerId);
		},
		attachSinkId: function attachSinkId(element, sinkId) {
			// Attach audio output device to video element using device/sink ID.
			if (element && element[0] && typeof element[0].sinkId !== 'undefined') {
				element[0].setSinkId(sinkId).then(() => {
							// console.info(`Success, audio output device attached: ${sinkId}`);
						})['catch'](error => {
							var errorMessage = error;
							if (error.name === 'SecurityError') {
								errorMessage = `You need to use HTTPS for selecting audio output device: ${error}`;
							}
							console.error(errorMessage);
							// Jump back to first output device in the list as it's the default.
							audioOutputSelect.selectedIndex = 0;
						});
			} else {
				console.warn('Browser does not support output device selection.');
			}
		},
		changeAudioDestination: function changeAudioDestination() {
			var audioOutputSelect = document.querySelector('select#audioOutput');
			var audioDestination = audioOutputSelect.value;
			var videoElement = localVideoElement
			self.attachSinkId(videoElement, audioDestination);
		},
		hangupAll: function hangupAll(_headerId) {
			Object.keys(pc).forEach(function (userId) {
				if(userId) self.hangup(userId, true, _headerId);
			});
		},
		hangup: function hangup(userId, notify, headerId) {
			// notify = arguments.length === 1 ? true : notify;
			// // console.log("hangUp", userId, notify, headerId)
			// if (pc[userId] && userId !== share.getUserId()) {
			// 	self.removeVideoInterface(userId)
			// 	pc[userId].close();
			// 	delete pc[userId];
			// 	if (notify) self.sendMessage(userId, { type: 'hangup', headerId: headerId });
			// }
			notify = arguments.length === 1 ? true : notify;
			if (pc[userId] && userId !== share.getUserId()) {
				self.setStream(userId, '');
				pc[userId].close();
				delete pc[userId];
				if (notify) self.sendMessage(userId, { type: 'hangup', headerId: headerId });
			}
		},
		createPeerConnection: function createPeerConnection(userId, headerId, targetCreate) {
			if (pc[userId]) console.warn('WARNING creating PC connection even though one exists', userId);
			// if((pc[userId])) return false

			pc[userId] = new RTCPeerConnection(pcConfig, pcConstraints);

			pc[userId].onicecandidate = function (event) {
				if (event.candidate) {
					self.appendNewVideoInterface(userId)
					self.sendMessage(userId, {type: 'icecandidate', headerId: headerId, candidate: event.candidate});
				} else {
					// socket.emit('openForCalling', window.pad.getPadId(), window.headerId)
					console.log("now you can have newconnnection44444444444444444444")
			
				}
			};

			if(targetCreate === 'local'){
				
			}

			pc[userId].ontrack = function(event) {
				remoteStream[userId] = event.stream;
				self.setStream(userId, event.stream);
			};

			pc[userId].onaddstream = function (event) {
				remoteStream[userId] = event.stream;
				self.setStream(userId, event.stream);
			};

			pc[userId].onremovestream = function () {
				self.removeVideoInterface(userId)
			};

		},
		call: function call(userId, headerId) {
			if (!localStream) return;
			
			var constraints = { optional: [], mandatory: {} };

			// TODO: sdpConstraints option are lagecy
			// https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/createOffer#RTCOfferOptions_dictionary
			constraints = mergeConstraints(constraints, sdpConstraints);

			if (!pc[userId]) self.createPeerConnection(userId, headerId, 'local');
			
			pc[userId].addStream(localStream);

			pc[userId].addEventListener("negotiationneeded", ev => {

				pc[userId].createOffer(constraints)
				.then(function(desc) {
					desc.sdp = cleanupSdp(desc.sdp);
					return pc[userId].setLocalDescription(desc)
				})
				.then(function (){
				// if (userId !== share.getUserId() ) {
					
					// }
					self.sendMessage(userId, { type: 'offer', offer: pc[userId].localDescription, headerId: headerId });			
				}).then(function(){
					
				})
				.catch((err) => logError(err, "call:createOffer"));

			})


		},
		getUserMedia: function getUserMedia(headerId) {
			audioInputSelect = document.querySelector('select#audioSource');
			videoSelect = document.querySelector('select#videoSource');
			audioOutputSelect = document.querySelector('select#audioOutput');
			
			var audioSource = audioInputSelect.value;
			var videoSource = videoSelect.value;
			var audioOutput = audioOutputSelect.value;

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

			// attach user audio source
			if (audioSource) {
				mediaConstraints.audio = { deviceId: { exact: audioSource } };
			}

			// attach user video source
			if (videoSource) {
				mediaConstraints.video = { deviceId: { exact: videoSource } };
			}

			// save user default video/audio settings
			localStorage.setItem('videoSettings', JSON.stringify({ microphone: audioSource, speaker: audioOutput, camera: videoSource }));

			window.navigator.mediaDevices
			.getUserMedia(mediaConstraints)
			.then(function (stream) {
				localStream = stream;
				// create video stream for current pc
				self.appendNewVideoInterface(share.getUserId(), stream)

				
				// socket.emit('canMakeACall', window.pad.getPadId(),  window.headerId, function(canI){
					// console.log("canIcanIcanIcanIcanI", canI)
					// if(canI === null) {
					// 	socket.emit('openForCalling', window.pad.getPadId(), window.headerId)
					// 	canI = true
					// }

					// if(canI){

						socket.emit('getHeaderUserlist', padId, window.headerId, function(userList){
							userList.forEach(function (userId) {
								if (userId !== share.getUserId() ) {
									// if (pc[userId] && gState === "RECONNECTING") {
									// 	self.hangup(userId, null, headerId);
									// }
									self.call(userId, headerId);
								}
								// else {
								// 	if(userList.length > 1)
								// 		socket.emit('closeForCalling', window.pad.getPadId(), window.headerId)

								// }
							});
						
						})

					// }else{
					
					// 	// console.log("canIcanIcanIcanIcanIcanIcanIcanI", canI)
					// }
				// })

			})
			.catch(function (err) {
				self.showUserMediaError(err);
			});
		}
	};

	// Normalize RTC implementation between browsers
	// var getUserMedia = window.navigator.mediaDevices.getUserMedia
	var attachMediaStream = function attachMediaStream(element, stream) {
		console.log(stream)
		if (!stream){
			console.error("[wrtc]: stream is not exists.", stream)
			return false;
		}
		if (typeof element.srcObject !== 'undefined') {
			element.srcObject = stream;
		} else if (typeof element.mozSrcObject !== 'undefined') {
			element.mozSrcObject = stream;
		} else if (typeof element.src !== 'undefined') {
			element.src = URL.createObjectURL(stream);
		} else {
			console.error('Error attaching stream to element.', element);
		}
		if (element) $(element).parent().find('.connectionStatus').text("");
	};

	function cleanupSdp(sdp) {
		var bandwidth = {
			screen: 300, // 300kbits minimum
			audio: 70,   // 50kbits  minimum
			minVideo: 125, // 125kbits  min
			maxVideo: 125, // 125kbits  max
			videoCodec: clientVars.webrtc.video.codec
		};

		var isScreenSharing = false;

		sdp = BandwidthHandler.setApplicationSpecificBandwidth(sdp, bandwidth, isScreenSharing);
		sdp = BandwidthHandler.setVideoBitrates(sdp, {
			min: bandwidth.minVideo,
			max: bandwidth.maxVideo,
			codec: bandwidth.videoCodec
		});
		sdp = BandwidthHandler.setOpusAttributes(sdp);

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

	function logError(error, functionName, data) {
		// attempt to reconnect
		console.log(error, functionName, data, "=========logError")
		if(error && error.message.includes("Failed to set remote answer sdp")){
			console.log("Try reconnecting")
			//setTimeout(() => {
				console.log("reconnecting...")
				// self.receiveMessage(data)
				gState = "RECONNECTING"
				// share.stopStreaming(localStream)
				// self.getUserMedia(window.headerId)


				// socket.emit('getHeaderUserlist', window.pad.getPadId(), window.headerId, function(userList){
				// 	userList.forEach(function (userId) {
				// 		if (userId !== share.getUserId() ) {
				// 			if (pc[userId]) {
				// 				self.hangup(userId, null, headerId);
				// 			}
				// 			self.call(userId, window.headerId);
				// 		}
				// 	});
				// });



				// $(document).find("#wrtc_modal .btn_reload.btn_roomHandler").trigger("click")
			//}, 100);
		}
		
		console.error('WebRTC ERROR:', error);
	}

	self.pc = pc;
	return self;
})();



// Get Start
// action flow
// 1. activate