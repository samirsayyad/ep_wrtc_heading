(function() {
  if (!navigator.mediaDevices) navigator.mediaDevices = {};
  if (!navigator.mediaDevices.getUserMedia) {
    var getUserMedia =
      navigator.webkitGetUserMedia ||
      navigator.mozGetUserMedia ||
      navigator.msGetUserMedia ||
      navigator.getUserMedia;

    if (getUserMedia) {
      navigator.mediaDevices.getUserMedia = function(constraints) {
        return new Promise(function(resolve, reject) {
          getUserMedia(
            constraints,
            function(stream) {
              resolve(stream);
            },
            function(error) {
              reject(error);
            }
          );
        });
      };
    } else {
      navigator.mediaDevices.getUserMedia = function() {
        // A missing `getUserMedia` seemingly can mean one of two things:
        //
        // 1) WebRTC is unsupported or disabled on this browser
        // 2) This is an insecure connection
        //   * This handling of insecure connections happens only on certain browsers.
        //     It was observed in Chromium 80 and Firefox 75, but not Firefox 68. I suspect it's the new behavior.
        //   * In other browsers, it handles insecure connections by throwing `NotAllowedError`.
        //     We still handle this case in the calling function.
        //   * See: https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
        //     As of this writing, this claims that the browser does *both* of these things for
        //     insecure connections, which is of course impossible and thus confusing.
        //
        // We will attempt to distinguish these two cases by checking for various webrtc-related fields on
        // `window` (inspired by github.com/muaz-khan/DetectRTC). If none of those fields exist, we assume
        // that WebRTC is not supported on this browser.
        return new Promise(function(resolve, reject) {
          if (!(window.RTCPeerConnection || window.webkitRTCPeerConnection || window.mozRTCPeerConnection || window.RTCIceGatherer)) {
            var e = new Error("getUserMedia is not supported in this browser.");
            // I'd use NotSupportedError but I'm afraid they'll change the spec on us again
            e.name = 'CustomNotSupportedError';
            reject(e);
          } else {
            var e = new Error("insecure connection");
            // I'd use NotAllowedError but I'm afraid they'll change the spec on us again
            e.name = 'CustomSecureConnectionError';
            reject(e);
          }
        });
      };
    }
  }
})();
'use strict';

// Last time updated: 2019-06-15 4:26:11 PM UTC

// _________________________
// RTCMultiConnection v3.6.9

// Open-Sourced: https://github.com/muaz-khan/RTCMultiConnection

// --------------------------------------------------
// Muaz Khan     - www.MuazKhan.com
// MIT License   - www.WebRTC-Experiment.com/licence
// --------------------------------------------------

"use strict";var RTCMultiConnection=function(roomid,forceOptions){function SocketConnection(connection,connectCallback){function isData(session){return!session.audio&&!session.video&&!session.screen&&session.data}function updateExtraBackup(remoteUserId,extra){connection.peersBackup[remoteUserId]||(connection.peersBackup[remoteUserId]={userid:remoteUserId,extra:{}}),connection.peersBackup[remoteUserId].extra=extra}function onMessageEvent(message){if(message.remoteUserId==connection.userid){if(connection.peers[message.sender]&&connection.peers[message.sender].extra!=message.message.extra&&(connection.peers[message.sender].extra=message.extra,connection.onExtraDataUpdated({userid:message.sender,extra:message.extra}),updateExtraBackup(message.sender,message.extra)),message.message.streamSyncNeeded&&connection.peers[message.sender]){var stream=connection.streamEvents[message.message.streamid];if(!stream||!stream.stream)return;var action=message.message.action;if("ended"===action||"inactive"===action||"stream-removed"===action)return connection.peersBackup[stream.userid]&&(stream.extra=connection.peersBackup[stream.userid].extra),void connection.onstreamended(stream);var type="both"!=message.message.type?message.message.type:null;return void("function"==typeof stream.stream[action]&&stream.stream[action](type))}if("dropPeerConnection"===message.message)return void connection.deletePeer(message.sender);if(message.message.allParticipants)return message.message.allParticipants.indexOf(message.sender)===-1&&message.message.allParticipants.push(message.sender),void message.message.allParticipants.forEach(function(participant){mPeer[connection.peers[participant]?"renegotiatePeer":"createNewPeer"](participant,{localPeerSdpConstraints:{OfferToReceiveAudio:connection.sdpConstraints.mandatory.OfferToReceiveAudio,OfferToReceiveVideo:connection.sdpConstraints.mandatory.OfferToReceiveVideo},remotePeerSdpConstraints:{OfferToReceiveAudio:connection.session.oneway?!!connection.session.audio:connection.sdpConstraints.mandatory.OfferToReceiveAudio,OfferToReceiveVideo:connection.session.oneway?!!connection.session.video||!!connection.session.screen:connection.sdpConstraints.mandatory.OfferToReceiveVideo},isOneWay:!!connection.session.oneway||"one-way"===connection.direction,isDataOnly:isData(connection.session)})});if(message.message.newParticipant){if(message.message.newParticipant==connection.userid)return;if(connection.peers[message.message.newParticipant])return;return void mPeer.createNewPeer(message.message.newParticipant,message.message.userPreferences||{localPeerSdpConstraints:{OfferToReceiveAudio:connection.sdpConstraints.mandatory.OfferToReceiveAudio,OfferToReceiveVideo:connection.sdpConstraints.mandatory.OfferToReceiveVideo},remotePeerSdpConstraints:{OfferToReceiveAudio:connection.session.oneway?!!connection.session.audio:connection.sdpConstraints.mandatory.OfferToReceiveAudio,OfferToReceiveVideo:connection.session.oneway?!!connection.session.video||!!connection.session.screen:connection.sdpConstraints.mandatory.OfferToReceiveVideo},isOneWay:!!connection.session.oneway||"one-way"===connection.direction,isDataOnly:isData(connection.session)})}if(message.message.readyForOffer&&(connection.attachStreams.length&&(connection.waitingForLocalMedia=!1),connection.waitingForLocalMedia))return void setTimeout(function(){onMessageEvent(message)},1);if(message.message.newParticipationRequest&&message.sender!==connection.userid){connection.peers[message.sender]&&connection.deletePeer(message.sender);var userPreferences={extra:message.extra||{},localPeerSdpConstraints:message.message.remotePeerSdpConstraints||{OfferToReceiveAudio:connection.sdpConstraints.mandatory.OfferToReceiveAudio,OfferToReceiveVideo:connection.sdpConstraints.mandatory.OfferToReceiveVideo},remotePeerSdpConstraints:message.message.localPeerSdpConstraints||{OfferToReceiveAudio:connection.session.oneway?!!connection.session.audio:connection.sdpConstraints.mandatory.OfferToReceiveAudio,OfferToReceiveVideo:connection.session.oneway?!!connection.session.video||!!connection.session.screen:connection.sdpConstraints.mandatory.OfferToReceiveVideo},isOneWay:"undefined"!=typeof message.message.isOneWay?message.message.isOneWay:!!connection.session.oneway||"one-way"===connection.direction,isDataOnly:"undefined"!=typeof message.message.isDataOnly?message.message.isDataOnly:isData(connection.session),dontGetRemoteStream:"undefined"!=typeof message.message.isOneWay?message.message.isOneWay:!!connection.session.oneway||"one-way"===connection.direction,dontAttachLocalStream:!!message.message.dontGetRemoteStream,connectionDescription:message,successCallback:function(){}};return void connection.onNewParticipant(message.sender,userPreferences)}return message.message.changedUUID&&connection.peers[message.message.oldUUID]&&(connection.peers[message.message.newUUID]=connection.peers[message.message.oldUUID],delete connection.peers[message.message.oldUUID]),message.message.userLeft?(mPeer.onUserLeft(message.sender),void(message.message.autoCloseEntireSession&&connection.leave())):void mPeer.addNegotiatedMessage(message.message,message.sender)}}var parameters="";parameters+="?userid="+connection.userid,parameters+="&sessionid="+connection.sessionid,parameters+="&msgEvent="+connection.socketMessageEvent,parameters+="&socketCustomEvent="+connection.socketCustomEvent,parameters+="&autoCloseEntireSession="+!!connection.autoCloseEntireSession,connection.session.broadcast===!0&&(parameters+="&oneToMany=true"),parameters+="&maxParticipantsAllowed="+connection.maxParticipantsAllowed,connection.enableScalableBroadcast&&(parameters+="&enableScalableBroadcast=true",parameters+="&maxRelayLimitPerUser="+(connection.maxRelayLimitPerUser||2)),parameters+="&extra="+JSON.stringify(connection.extra||{}),connection.socketCustomParameters&&(parameters+=connection.socketCustomParameters);try{io.sockets={}}catch(e){}if(connection.socketURL||(connection.socketURL="/"),"/"!=connection.socketURL.substr(connection.socketURL.length-1,1))throw'"socketURL" MUST end with a slash.';connection.enableLogs&&("/"==connection.socketURL?console.info("socket.io url is: ",location.origin+"/"):console.info("socket.io url is: ",connection.socketURL));try{connection.socket=io(connection.socketURL+parameters)}catch(e){connection.socket=io.connect(connection.socketURL+parameters,connection.socketOptions)}var mPeer=connection.multiPeersHandler;connection.socket.on("extra-data-updated",function(remoteUserId,extra){connection.peers[remoteUserId]&&(connection.peers[remoteUserId].extra=extra,connection.onExtraDataUpdated({userid:remoteUserId,extra:extra}),updateExtraBackup(remoteUserId,extra))}),connection.socket.on(connection.socketMessageEvent,onMessageEvent);var alreadyConnected=!1;connection.socket.resetProps=function(){alreadyConnected=!1},connection.socket.on("connect",function(){alreadyConnected||(alreadyConnected=!0,connection.enableLogs&&console.info("socket.io connection is opened."),setTimeout(function(){connection.socket.emit("extra-data-updated",connection.extra)},1e3),connectCallback&&connectCallback(connection.socket))}),connection.socket.on("disconnect",function(event){connection.onSocketDisconnect(event)}),connection.socket.on("error",function(event){connection.onSocketError(event)}),connection.socket.on("user-disconnected",function(remoteUserId){remoteUserId!==connection.userid&&(connection.onUserStatusChanged({userid:remoteUserId,status:"offline",extra:connection.peers[remoteUserId]?connection.peers[remoteUserId].extra||{}:{}}),connection.deletePeer(remoteUserId))}),connection.socket.on("user-connected",function(userid){userid!==connection.userid&&connection.onUserStatusChanged({userid:userid,status:"online",extra:connection.peers[userid]?connection.peers[userid].extra||{}:{}})}),connection.socket.on("closed-entire-session",function(sessionid,extra){connection.leave(),connection.onEntireSessionClosed({sessionid:sessionid,userid:sessionid,extra:extra})}),connection.socket.on("userid-already-taken",function(useridAlreadyTaken,yourNewUserId){connection.onUserIdAlreadyTaken(useridAlreadyTaken,yourNewUserId)}),connection.socket.on("logs",function(log){connection.enableLogs&&console.debug("server-logs",log)}),connection.socket.on("number-of-broadcast-viewers-updated",function(data){connection.onNumberOfBroadcastViewersUpdated(data)}),connection.socket.on("set-isInitiator-true",function(sessionid){sessionid==connection.sessionid&&(connection.isInitiator=!0)})}function MultiPeers(connection){function initFileBufferReader(){connection.fbr=new FileBufferReader,connection.fbr.onProgress=function(chunk){connection.onFileProgress(chunk)},connection.fbr.onBegin=function(file){connection.onFileStart(file)},connection.fbr.onEnd=function(file){connection.onFileEnd(file)}}var self=this,skipPeers=["getAllParticipants","getLength","selectFirst","streams","send","forEach"];connection.peers={getLength:function(){var numberOfPeers=0;for(var peer in this)skipPeers.indexOf(peer)==-1&&numberOfPeers++;return numberOfPeers},selectFirst:function(){var firstPeer;for(var peer in this)skipPeers.indexOf(peer)==-1&&(firstPeer=this[peer]);return firstPeer},getAllParticipants:function(sender){var allPeers=[];for(var peer in this)skipPeers.indexOf(peer)==-1&&peer!=sender&&allPeers.push(peer);return allPeers},forEach:function(callbcak){this.getAllParticipants().forEach(function(participant){callbcak(connection.peers[participant])})},send:function(data,remoteUserId){var that=this;if(!isNull(data.size)&&!isNull(data.type)){if(connection.enableFileSharing)return void self.shareFile(data,remoteUserId);"string"!=typeof data&&(data=JSON.stringify(data))}if(!("text"===data.type||data instanceof ArrayBuffer||data instanceof DataView))return void TextSender.send({text:data,channel:this,connection:connection,remoteUserId:remoteUserId});if("text"===data.type&&(data=JSON.stringify(data)),remoteUserId){var remoteUser=connection.peers[remoteUserId];if(remoteUser)return remoteUser.channels.length?void remoteUser.channels.forEach(function(channel){channel.send(data)}):(connection.peers[remoteUserId].createDataChannel(),connection.renegotiate(remoteUserId),void setTimeout(function(){that.send(data,remoteUserId)},3e3))}this.getAllParticipants().forEach(function(participant){return that[participant].channels.length?void that[participant].channels.forEach(function(channel){channel.send(data)}):(connection.peers[participant].createDataChannel(),connection.renegotiate(participant),void setTimeout(function(){that[participant].channels.forEach(function(channel){channel.send(data)})},3e3))})}},this.uuid=connection.userid,this.getLocalConfig=function(remoteSdp,remoteUserId,userPreferences){return userPreferences||(userPreferences={}),{streamsToShare:userPreferences.streamsToShare||{},rtcMultiConnection:connection,connectionDescription:userPreferences.connectionDescription,userid:remoteUserId,localPeerSdpConstraints:userPreferences.localPeerSdpConstraints,remotePeerSdpConstraints:userPreferences.remotePeerSdpConstraints,dontGetRemoteStream:!!userPreferences.dontGetRemoteStream,dontAttachLocalStream:!!userPreferences.dontAttachLocalStream,renegotiatingPeer:!!userPreferences.renegotiatingPeer,peerRef:userPreferences.peerRef,channels:userPreferences.channels||[],onLocalSdp:function(localSdp){self.onNegotiationNeeded(localSdp,remoteUserId)},onLocalCandidate:function(localCandidate){localCandidate=OnIceCandidateHandler.processCandidates(connection,localCandidate),localCandidate&&self.onNegotiationNeeded(localCandidate,remoteUserId)},remoteSdp:remoteSdp,onDataChannelMessage:function(message){if(!connection.fbr&&connection.enableFileSharing&&initFileBufferReader(),"string"==typeof message||!connection.enableFileSharing)return void self.onDataChannelMessage(message,remoteUserId);var that=this;return message instanceof ArrayBuffer||message instanceof DataView?void connection.fbr.convertToObject(message,function(object){that.onDataChannelMessage(object)}):message.readyForNextChunk?void connection.fbr.getNextChunk(message,function(nextChunk,isLastChunk){connection.peers[remoteUserId].channels.forEach(function(channel){channel.send(nextChunk)})},remoteUserId):message.chunkMissing?void connection.fbr.chunkMissing(message):void connection.fbr.addChunk(message,function(promptNextChunk){connection.peers[remoteUserId].peer.channel.send(promptNextChunk)})},onDataChannelError:function(error){self.onDataChannelError(error,remoteUserId)},onDataChannelOpened:function(channel){self.onDataChannelOpened(channel,remoteUserId)},onDataChannelClosed:function(event){self.onDataChannelClosed(event,remoteUserId)},onRemoteStream:function(stream){connection.peers[remoteUserId]&&connection.peers[remoteUserId].streams.push(stream),self.onGettingRemoteMedia(stream,remoteUserId)},onRemoteStreamRemoved:function(stream){self.onRemovingRemoteMedia(stream,remoteUserId)},onPeerStateChanged:function(states){self.onPeerStateChanged(states),"new"===states.iceConnectionState&&self.onNegotiationStarted(remoteUserId,states),"connected"===states.iceConnectionState&&self.onNegotiationCompleted(remoteUserId,states),states.iceConnectionState.search(/closed|failed/gi)!==-1&&(self.onUserLeft(remoteUserId),self.disconnectWith(remoteUserId))}}},this.createNewPeer=function(remoteUserId,userPreferences){if(!(connection.maxParticipantsAllowed<=connection.getAllParticipants().length)){if(userPreferences=userPreferences||{},connection.isInitiator&&connection.session.audio&&"two-way"===connection.session.audio&&!userPreferences.streamsToShare&&(userPreferences.isOneWay=!1,userPreferences.isDataOnly=!1,userPreferences.session=connection.session),!userPreferences.isOneWay&&!userPreferences.isDataOnly)return userPreferences.isOneWay=!0,void this.onNegotiationNeeded({enableMedia:!0,userPreferences:userPreferences},remoteUserId);userPreferences=connection.setUserPreferences(userPreferences,remoteUserId);var localConfig=this.getLocalConfig(null,remoteUserId,userPreferences);connection.peers[remoteUserId]=new PeerInitiator(localConfig)}},this.createAnsweringPeer=function(remoteSdp,remoteUserId,userPreferences){userPreferences=connection.setUserPreferences(userPreferences||{},remoteUserId);var localConfig=this.getLocalConfig(remoteSdp,remoteUserId,userPreferences);connection.peers[remoteUserId]=new PeerInitiator(localConfig)},this.renegotiatePeer=function(remoteUserId,userPreferences,remoteSdp){if(!connection.peers[remoteUserId])return void(connection.enableLogs&&console.error("Peer ("+remoteUserId+") does not exist. Renegotiation skipped."));userPreferences||(userPreferences={}),userPreferences.renegotiatingPeer=!0,userPreferences.peerRef=connection.peers[remoteUserId].peer,userPreferences.channels=connection.peers[remoteUserId].channels;var localConfig=this.getLocalConfig(remoteSdp,remoteUserId,userPreferences);connection.peers[remoteUserId]=new PeerInitiator(localConfig)},this.replaceTrack=function(track,remoteUserId,isVideoTrack){if(!connection.peers[remoteUserId])throw"This peer ("+remoteUserId+") does not exist.";var peer=connection.peers[remoteUserId].peer;return peer.getSenders&&"function"==typeof peer.getSenders&&peer.getSenders().length?void peer.getSenders().forEach(function(rtpSender){isVideoTrack&&"video"===rtpSender.track.kind&&(connection.peers[remoteUserId].peer.lastVideoTrack=rtpSender.track,rtpSender.replaceTrack(track)),isVideoTrack||"audio"!==rtpSender.track.kind||(connection.peers[remoteUserId].peer.lastAudioTrack=rtpSender.track,rtpSender.replaceTrack(track))}):(console.warn("RTPSender.replaceTrack is NOT supported."),void this.renegotiatePeer(remoteUserId))},this.onNegotiationNeeded=function(message,remoteUserId){},this.addNegotiatedMessage=function(message,remoteUserId){if(message.type&&message.sdp)return"answer"==message.type&&connection.peers[remoteUserId]&&connection.peers[remoteUserId].addRemoteSdp(message),"offer"==message.type&&(message.renegotiatingPeer?this.renegotiatePeer(remoteUserId,null,message):this.createAnsweringPeer(message,remoteUserId)),void(connection.enableLogs&&console.log("Remote peer's sdp:",message.sdp));if(message.candidate)return connection.peers[remoteUserId]&&connection.peers[remoteUserId].addRemoteCandidate(message),void(connection.enableLogs&&console.log("Remote peer's candidate pairs:",message.candidate));if(message.enableMedia){connection.session=message.userPreferences.session||connection.session,connection.session.oneway&&connection.attachStreams.length&&(connection.attachStreams=[]),message.userPreferences.isDataOnly&&connection.attachStreams.length&&(connection.attachStreams.length=[]);var streamsToShare={};connection.attachStreams.forEach(function(stream){streamsToShare[stream.streamid]={isAudio:!!stream.isAudio,isVideo:!!stream.isVideo,isScreen:!!stream.isScreen}}),message.userPreferences.streamsToShare=streamsToShare,self.onNegotiationNeeded({readyForOffer:!0,userPreferences:message.userPreferences},remoteUserId)}message.readyForOffer&&connection.onReadyForOffer(remoteUserId,message.userPreferences)},this.onGettingRemoteMedia=function(stream,remoteUserId){},this.onRemovingRemoteMedia=function(stream,remoteUserId){},this.onGettingLocalMedia=function(localStream){},this.onLocalMediaError=function(error,constraints){connection.onMediaError(error,constraints)},this.shareFile=function(file,remoteUserId){initFileBufferReader(),connection.fbr.readAsArrayBuffer(file,function(uuid){var arrayOfUsers=connection.getAllParticipants();remoteUserId&&(arrayOfUsers=[remoteUserId]),arrayOfUsers.forEach(function(participant){connection.fbr.getNextChunk(uuid,function(nextChunk){connection.peers[participant].channels.forEach(function(channel){channel.send(nextChunk)})},participant)})},{userid:connection.userid,chunkSize:"Firefox"===DetectRTC.browser.name?15e3:connection.chunkSize||0})};var textReceiver=new TextReceiver(connection);this.onDataChannelMessage=function(message,remoteUserId){textReceiver.receive(JSON.parse(message),remoteUserId,connection.peers[remoteUserId]?connection.peers[remoteUserId].extra:{})},this.onDataChannelClosed=function(event,remoteUserId){event.userid=remoteUserId,event.extra=connection.peers[remoteUserId]?connection.peers[remoteUserId].extra:{},connection.onclose(event)},this.onDataChannelError=function(error,remoteUserId){error.userid=remoteUserId,event.extra=connection.peers[remoteUserId]?connection.peers[remoteUserId].extra:{},connection.onerror(error)},this.onDataChannelOpened=function(channel,remoteUserId){return connection.peers[remoteUserId].channels.length?void(connection.peers[remoteUserId].channels=[channel]):(connection.peers[remoteUserId].channels.push(channel),void connection.onopen({userid:remoteUserId,extra:connection.peers[remoteUserId]?connection.peers[remoteUserId].extra:{},channel:channel}))},this.onPeerStateChanged=function(state){connection.onPeerStateChanged(state)},this.onNegotiationStarted=function(remoteUserId,states){},this.onNegotiationCompleted=function(remoteUserId,states){},this.getRemoteStreams=function(remoteUserId){return remoteUserId=remoteUserId||connection.peers.getAllParticipants()[0],connection.peers[remoteUserId]?connection.peers[remoteUserId].streams:[]}}function fireEvent(obj,eventName,args){if("undefined"!=typeof CustomEvent){var eventDetail={arguments:args,__exposedProps__:args},event=new CustomEvent(eventName,eventDetail);obj.dispatchEvent(event)}}function setHarkEvents(connection,streamEvent){if(streamEvent.stream&&getTracks(streamEvent.stream,"audio").length){if(!connection||!streamEvent)throw"Both arguments are required.";if(connection.onspeaking&&connection.onsilence){if("undefined"==typeof hark)throw"hark.js not found.";hark(streamEvent.stream,{onspeaking:function(){connection.onspeaking(streamEvent)},onsilence:function(){connection.onsilence(streamEvent)},onvolumechange:function(volume,threshold){connection.onvolumechange&&connection.onvolumechange(merge({volume:volume,threshold:threshold},streamEvent))}})}}}function setMuteHandlers(connection,streamEvent){streamEvent.stream&&streamEvent.stream&&streamEvent.stream.addEventListener&&(streamEvent.stream.addEventListener("mute",function(event){event=connection.streamEvents[streamEvent.streamid],event.session={audio:"audio"===event.muteType,video:"video"===event.muteType},connection.onmute(event)},!1),streamEvent.stream.addEventListener("unmute",function(event){event=connection.streamEvents[streamEvent.streamid],event.session={audio:"audio"===event.unmuteType,video:"video"===event.unmuteType},connection.onunmute(event)},!1))}function getRandomString(){if(window.crypto&&window.crypto.getRandomValues&&navigator.userAgent.indexOf("Safari")===-1){for(var a=window.crypto.getRandomValues(new Uint32Array(3)),token="",i=0,l=a.length;i<l;i++)token+=a[i].toString(36);return token}return(Math.random()*(new Date).getTime()).toString(36).replace(/\./g,"")}function getRMCMediaElement(stream,callback,connection){if(!connection.autoCreateMediaElement)return void callback({});var isAudioOnly=!1;getTracks(stream,"video").length||stream.isVideo||stream.isScreen||(isAudioOnly=!0),"Firefox"===DetectRTC.browser.name&&(connection.session.video||connection.session.screen)&&(isAudioOnly=!1);var mediaElement=document.createElement(isAudioOnly?"audio":"video");if(mediaElement.srcObject=stream,mediaElement.setAttribute("autoplay",!0),mediaElement.setAttribute("playsinline",!0),mediaElement.setAttribute("controls",!0),mediaElement.setAttribute("muted",!1),mediaElement.setAttribute("volume",1),"Firefox"===DetectRTC.browser.name){var streamEndedEvent="ended";"oninactive"in mediaElement&&(streamEndedEvent="inactive"),mediaElement.addEventListener(streamEndedEvent,function(){if(currentUserMediaRequest.remove(stream.idInstance),"local"===stream.type){streamEndedEvent="ended","oninactive"in stream&&(streamEndedEvent="inactive"),StreamsHandler.onSyncNeeded(stream.streamid,streamEndedEvent),connection.attachStreams.forEach(function(aStream,idx){stream.streamid===aStream.streamid&&delete connection.attachStreams[idx]});var newStreamsArray=[];connection.attachStreams.forEach(function(aStream){aStream&&newStreamsArray.push(aStream)}),connection.attachStreams=newStreamsArray;var streamEvent=connection.streamEvents[stream.streamid];if(streamEvent)return void connection.onstreamended(streamEvent);this.parentNode&&this.parentNode.removeChild(this)}},!1)}var played=mediaElement.play();if("undefined"!=typeof played){var cbFired=!1;setTimeout(function(){cbFired||(cbFired=!0,callback(mediaElement))},1e3),played.then(function(){cbFired||(cbFired=!0,callback(mediaElement))})["catch"](function(error){cbFired||(cbFired=!0,callback(mediaElement))})}else callback(mediaElement)}function listenEventHandler(eventName,eventHandler){window.removeEventListener(eventName,eventHandler),window.addEventListener(eventName,eventHandler,!1)}function removeNullEntries(array){var newArray=[];return array.forEach(function(item){item&&newArray.push(item)}),newArray}function isData(session){return!session.audio&&!session.video&&!session.screen&&session.data}function isNull(obj){return"undefined"==typeof obj}function isString(obj){return"string"==typeof obj}function isAudioPlusTab(connection,audioPlusTab){return(!connection.session.audio||"two-way"!==connection.session.audio)&&("Firefox"===DetectRTC.browser.name&&audioPlusTab!==!1||!("Chrome"!==DetectRTC.browser.name||DetectRTC.browser.version<50)&&(typeof audioPlusTab===!0||!("undefined"!=typeof audioPlusTab||!connection.session.audio||!connection.session.screen||connection.session.video)&&(audioPlusTab=!0,!0)))}function getTracks(stream,kind){return stream&&stream.getTracks?stream.getTracks().filter(function(t){return t.kind===(kind||"audio")}):[]}function isUnifiedPlanSupportedDefault(){var canAddTransceiver=!1;try{if("undefined"==typeof RTCRtpTransceiver)return!1;if(!("currentDirection"in RTCRtpTransceiver.prototype))return!1;var tempPc=new RTCPeerConnection;try{tempPc.addTransceiver("audio"),canAddTransceiver=!0}catch(e){}tempPc.close()}catch(e){canAddTransceiver=!1}return canAddTransceiver&&isUnifiedPlanSuppored()}function isUnifiedPlanSuppored(){var isUnifiedPlanSupported=!1;try{var pc=new RTCPeerConnection({sdpSemantics:"unified-plan"});try{var config=pc.getConfiguration();isUnifiedPlanSupported="unified-plan"==config.sdpSemantics||("plan-b"==config.sdpSemantics,!1)}catch(e){isUnifiedPlanSupported=!1}}catch(e){isUnifiedPlanSupported=!1}return isUnifiedPlanSupported}function setCordovaAPIs(){if("undefined"!=typeof cordova&&"undefined"!=typeof cordova.plugins&&"undefined"!=typeof cordova.plugins.iosrtc){var iosrtc=cordova.plugins.iosrtc;window.webkitRTCPeerConnection=iosrtc.RTCPeerConnection,window.RTCSessionDescription=iosrtc.RTCSessionDescription,window.RTCIceCandidate=iosrtc.RTCIceCandidate,window.MediaStream=iosrtc.MediaStream,window.MediaStreamTrack=iosrtc.MediaStreamTrack,navigator.getUserMedia=navigator.webkitGetUserMedia=iosrtc.getUserMedia,iosrtc.debug.enable("iosrtc*"),"function"==typeof iosrtc.selectAudioOutput&&iosrtc.selectAudioOutput(window.iOSDefaultAudioOutputDevice||"speaker"),iosrtc.registerGlobals()}}function setSdpConstraints(config){var sdpConstraints={OfferToReceiveAudio:!!config.OfferToReceiveAudio,OfferToReceiveVideo:!!config.OfferToReceiveVideo};return sdpConstraints}function PeerInitiator(config){function setChannelEvents(channel){channel.binaryType="arraybuffer",channel.onmessage=function(event){config.onDataChannelMessage(event.data)},channel.onopen=function(){config.onDataChannelOpened(channel)},channel.onerror=function(error){config.onDataChannelError(error)},channel.onclose=function(event){config.onDataChannelClosed(event)},channel.internalSend=channel.send,channel.send=function(data){"open"===channel.readyState&&channel.internalSend(data)},peer.channel=channel}function createOfferOrAnswer(_method){peer[_method](defaults.sdpConstraints).then(function(localSdp){"Safari"!==DetectRTC.browser.name&&(localSdp.sdp=connection.processSdp(localSdp.sdp)),peer.setLocalDescription(localSdp).then(function(){connection.trickleIce&&(config.onLocalSdp({type:localSdp.type,sdp:localSdp.sdp,remotePeerSdpConstraints:config.remotePeerSdpConstraints||!1,renegotiatingPeer:!!config.renegotiatingPeer||!1,connectionDescription:self.connectionDescription,dontGetRemoteStream:!!config.dontGetRemoteStream,extra:connection?connection.extra:{},streamsToShare:streamsToShare}),connection.onSettingLocalDescription(self))},function(error){connection.enableLogs&&console.error("setLocalDescription error",error)})},function(error){connection.enableLogs&&console.error("sdp-error",error)})}if("undefined"!=typeof window.RTCPeerConnection?RTCPeerConnection=window.RTCPeerConnection:"undefined"!=typeof mozRTCPeerConnection?RTCPeerConnection=mozRTCPeerConnection:"undefined"!=typeof webkitRTCPeerConnection&&(RTCPeerConnection=webkitRTCPeerConnection),RTCSessionDescription=window.RTCSessionDescription||window.mozRTCSessionDescription,RTCIceCandidate=window.RTCIceCandidate||window.mozRTCIceCandidate,MediaStreamTrack=window.MediaStreamTrack,!RTCPeerConnection)throw"WebRTC 1.0 (RTCPeerConnection) API are NOT available in this browser.";var connection=config.rtcMultiConnection;this.extra=config.remoteSdp?config.remoteSdp.extra:connection.extra,this.userid=config.userid,this.streams=[],this.channels=config.channels||[],this.connectionDescription=config.connectionDescription,this.addStream=function(session){connection.addStream(session,self.userid)},this.removeStream=function(streamid){connection.removeStream(streamid,self.userid)};var self=this;config.remoteSdp&&(this.connectionDescription=config.remoteSdp.connectionDescription);var allRemoteStreams={};defaults.sdpConstraints=setSdpConstraints({OfferToReceiveAudio:!0,OfferToReceiveVideo:!0});var peer,renegotiatingPeer=!!config.renegotiatingPeer;config.remoteSdp&&(renegotiatingPeer=!!config.remoteSdp.renegotiatingPeer);var localStreams=[];if(connection.attachStreams.forEach(function(stream){stream&&localStreams.push(stream)}),renegotiatingPeer)peer=config.peerRef;else{var iceTransports="all";(connection.candidates.turn||connection.candidates.relay)&&(connection.candidates.stun||connection.candidates.reflexive||connection.candidates.host||(iceTransports="relay"));try{var params={iceServers:connection.iceServers,iceTransportPolicy:connection.iceTransportPolicy||iceTransports};"undefined"!=typeof connection.iceCandidatePoolSize&&(params.iceCandidatePoolSize=connection.iceCandidatePoolSize),"undefined"!=typeof connection.bundlePolicy&&(params.bundlePolicy=connection.bundlePolicy),"undefined"!=typeof connection.rtcpMuxPolicy&&(params.rtcpMuxPolicy=connection.rtcpMuxPolicy),connection.sdpSemantics&&(params.sdpSemantics=connection.sdpSemantics||"unified-plan"),connection.iceServers&&connection.iceServers.length||(params=null,connection.optionalArgument=null),peer=new RTCPeerConnection(params,connection.optionalArgument)}catch(e){try{var params={iceServers:connection.iceServers};peer=new RTCPeerConnection(params)}catch(e){peer=new RTCPeerConnection}}}!peer.getRemoteStreams&&peer.getReceivers&&(peer.getRemoteStreams=function(){var stream=new MediaStream;return peer.getReceivers().forEach(function(receiver){stream.addTrack(receiver.track)}),[stream]}),!peer.getLocalStreams&&peer.getSenders&&(peer.getLocalStreams=function(){var stream=new MediaStream;return peer.getSenders().forEach(function(sender){stream.addTrack(sender.track)}),[stream]}),peer.onicecandidate=function(event){if(event.candidate)connection.trickleIce&&config.onLocalCandidate({candidate:event.candidate.candidate,sdpMid:event.candidate.sdpMid,sdpMLineIndex:event.candidate.sdpMLineIndex});else if(!connection.trickleIce){var localSdp=peer.localDescription;config.onLocalSdp({type:localSdp.type,sdp:localSdp.sdp,remotePeerSdpConstraints:config.remotePeerSdpConstraints||!1,renegotiatingPeer:!!config.renegotiatingPeer||!1,connectionDescription:self.connectionDescription,dontGetRemoteStream:!!config.dontGetRemoteStream,extra:connection?connection.extra:{},streamsToShare:streamsToShare})}},localStreams.forEach(function(localStream){config.remoteSdp&&config.remoteSdp.remotePeerSdpConstraints&&config.remoteSdp.remotePeerSdpConstraints.dontGetRemoteStream||config.dontAttachLocalStream||(localStream=connection.beforeAddingStream(localStream,self),localStream&&(peer.getLocalStreams().forEach(function(stream){localStream&&stream.id==localStream.id&&(localStream=null)}),localStream&&localStream.getTracks&&localStream.getTracks().forEach(function(track){try{peer.addTrack(track,localStream)}catch(e){}})))}),peer.oniceconnectionstatechange=peer.onsignalingstatechange=function(){var extra=self.extra;connection.peers[self.userid]&&(extra=connection.peers[self.userid].extra||extra),peer&&(config.onPeerStateChanged({iceConnectionState:peer.iceConnectionState,iceGatheringState:peer.iceGatheringState,signalingState:peer.signalingState,extra:extra,userid:self.userid}),peer&&peer.iceConnectionState&&peer.iceConnectionState.search(/closed|failed/gi)!==-1&&self.streams instanceof Array&&self.streams.forEach(function(stream){var streamEvent=connection.streamEvents[stream.id]||{streamid:stream.id,stream:stream,type:"remote"};connection.onstreamended(streamEvent)}))};var sdpConstraints={OfferToReceiveAudio:!!localStreams.length,OfferToReceiveVideo:!!localStreams.length};config.localPeerSdpConstraints&&(sdpConstraints=config.localPeerSdpConstraints),defaults.sdpConstraints=setSdpConstraints(sdpConstraints);var dontDuplicate={};peer.ontrack=function(event){if(event&&"track"===event.type){if(event.stream=event.streams[event.streams.length-1],event.stream.id||(event.stream.id=event.track.id),dontDuplicate[event.stream.id]&&"Safari"!==DetectRTC.browser.name)return void(event.track&&(event.track.onended=function(){peer&&peer.onremovestream(event)}));dontDuplicate[event.stream.id]=event.stream.id;var streamsToShare={};config.remoteSdp&&config.remoteSdp.streamsToShare?streamsToShare=config.remoteSdp.streamsToShare:config.streamsToShare&&(streamsToShare=config.streamsToShare);
var streamToShare=streamsToShare[event.stream.id];streamToShare?(event.stream.isAudio=streamToShare.isAudio,event.stream.isVideo=streamToShare.isVideo,event.stream.isScreen=streamToShare.isScreen):(event.stream.isVideo=!!getTracks(event.stream,"video").length,event.stream.isAudio=!event.stream.isVideo,event.stream.isScreen=!1),event.stream.streamid=event.stream.id,allRemoteStreams[event.stream.id]=event.stream,config.onRemoteStream(event.stream),event.stream.getTracks().forEach(function(track){track.onended=function(){peer&&peer.onremovestream(event)}}),event.stream.onremovetrack=function(){peer&&peer.onremovestream(event)}}},peer.onremovestream=function(event){event.stream.streamid=event.stream.id,allRemoteStreams[event.stream.id]&&delete allRemoteStreams[event.stream.id],config.onRemoteStreamRemoved(event.stream)},"function"!=typeof peer.removeStream&&(peer.removeStream=function(stream){stream.getTracks().forEach(function(track){peer.removeTrack(track,stream)})}),this.addRemoteCandidate=function(remoteCandidate){peer.addIceCandidate(new RTCIceCandidate(remoteCandidate))},this.addRemoteSdp=function(remoteSdp,cb){cb=cb||function(){},"Safari"!==DetectRTC.browser.name&&(remoteSdp.sdp=connection.processSdp(remoteSdp.sdp)),peer.setRemoteDescription(new RTCSessionDescription(remoteSdp)).then(cb,function(error){connection.enableLogs&&console.error("setRemoteDescription failed","\n",error,"\n",remoteSdp.sdp),cb()})["catch"](function(error){connection.enableLogs&&console.error("setRemoteDescription failed","\n",error,"\n",remoteSdp.sdp),cb()})};var isOfferer=!0;config.remoteSdp&&(isOfferer=!1),this.createDataChannel=function(){var channel=peer.createDataChannel("sctp",{});setChannelEvents(channel)},connection.session.data!==!0||renegotiatingPeer||(isOfferer?this.createDataChannel():peer.ondatachannel=function(event){var channel=event.channel;setChannelEvents(channel)}),this.enableDisableVideoEncoding=function(enable){var rtcp;if(peer.getSenders().forEach(function(sender){rtcp||"video"!==sender.track.kind||(rtcp=sender)}),rtcp&&rtcp.getParameters){var parameters=rtcp.getParameters();parameters.encodings[1]&&(parameters.encodings[1].active=!!enable),parameters.encodings[2]&&(parameters.encodings[2].active=!!enable),rtcp.setParameters(parameters)}},config.remoteSdp&&(config.remoteSdp.remotePeerSdpConstraints&&(sdpConstraints=config.remoteSdp.remotePeerSdpConstraints),defaults.sdpConstraints=setSdpConstraints(sdpConstraints),this.addRemoteSdp(config.remoteSdp,function(){createOfferOrAnswer("createAnswer")})),"two-way"!=connection.session.audio&&"two-way"!=connection.session.video&&"two-way"!=connection.session.screen||(defaults.sdpConstraints=setSdpConstraints({OfferToReceiveAudio:"two-way"==connection.session.audio||config.remoteSdp&&config.remoteSdp.remotePeerSdpConstraints&&config.remoteSdp.remotePeerSdpConstraints.OfferToReceiveAudio,OfferToReceiveVideo:"two-way"==connection.session.video||"two-way"==connection.session.screen||config.remoteSdp&&config.remoteSdp.remotePeerSdpConstraints&&config.remoteSdp.remotePeerSdpConstraints.OfferToReceiveAudio}));var streamsToShare={};peer.getLocalStreams().forEach(function(stream){streamsToShare[stream.streamid]={isAudio:!!stream.isAudio,isVideo:!!stream.isVideo,isScreen:!!stream.isScreen}}),isOfferer&&createOfferOrAnswer("createOffer"),peer.nativeClose=peer.close,peer.close=function(){if(peer){try{peer.nativeClose!==peer.close&&peer.nativeClose()}catch(e){}peer=null,self.peer=null}},this.peer=peer}function setStreamType(constraints,stream){constraints.mandatory&&constraints.mandatory.chromeMediaSource?stream.isScreen=!0:constraints.mozMediaSource||constraints.mediaSource?stream.isScreen=!0:constraints.video?stream.isVideo=!0:constraints.audio&&(stream.isAudio=!0)}function getUserMediaHandler(options){function streaming(stream,returnBack){setStreamType(options.localMediaConstraints,stream);var streamEndedEvent="ended";"oninactive"in stream&&(streamEndedEvent="inactive"),stream.addEventListener(streamEndedEvent,function(){delete currentUserMediaRequest.streams[idInstance],currentUserMediaRequest.mutex=!1,currentUserMediaRequest.queueRequests.indexOf(options)&&(delete currentUserMediaRequest.queueRequests[currentUserMediaRequest.queueRequests.indexOf(options)],currentUserMediaRequest.queueRequests=removeNullEntries(currentUserMediaRequest.queueRequests))},!1),currentUserMediaRequest.streams[idInstance]={stream:stream},currentUserMediaRequest.mutex=!1,currentUserMediaRequest.queueRequests.length&&getUserMediaHandler(currentUserMediaRequest.queueRequests.shift()),options.onGettingLocalMedia(stream,returnBack)}if(currentUserMediaRequest.mutex===!0)return void currentUserMediaRequest.queueRequests.push(options);currentUserMediaRequest.mutex=!0;var idInstance=JSON.stringify(options.localMediaConstraints);if(currentUserMediaRequest.streams[idInstance])streaming(currentUserMediaRequest.streams[idInstance].stream,!0);else{var isBlackBerry=!!/BB10|BlackBerry/i.test(navigator.userAgent||"");if(isBlackBerry||"undefined"==typeof navigator.mediaDevices||"function"!=typeof navigator.mediaDevices.getUserMedia)return navigator.getUserMedia=navigator.getUserMedia||navigator.webkitGetUserMedia||navigator.mozGetUserMedia,void navigator.getUserMedia(options.localMediaConstraints,function(stream){stream.streamid=stream.streamid||stream.id||getRandomString(),stream.idInstance=idInstance,streaming(stream)},function(error){options.onLocalMediaError(error,options.localMediaConstraints)});if("undefined"==typeof navigator.mediaDevices){navigator.getUserMedia=navigator.getUserMedia||navigator.webkitGetUserMedia||navigator.mozGetUserMedia;var getUserMediaStream,getUserMediaError,getUserMediaSuccess=function(){},getUserMediaFailure=function(){};navigator.mediaDevices={getUserMedia:function(hints){return navigator.getUserMedia(hints,function(getUserMediaSuccess){getUserMediaSuccess(stream),getUserMediaStream=stream},function(error){getUserMediaFailure(error),getUserMediaError=error}),{then:function(successCB){return getUserMediaStream?void successCB(getUserMediaStream):(getUserMediaSuccess=successCB,{then:function(failureCB){return getUserMediaError?void failureCB(getUserMediaError):void(getUserMediaFailure=failureCB)}})}}}}}if(options.localMediaConstraints.isScreen===!0){if(navigator.mediaDevices.getDisplayMedia)navigator.mediaDevices.getDisplayMedia(options.localMediaConstraints).then(function(stream){stream.streamid=stream.streamid||stream.id||getRandomString(),stream.idInstance=idInstance,streaming(stream)})["catch"](function(error){options.onLocalMediaError(error,options.localMediaConstraints)});else{if(!navigator.getDisplayMedia)throw new Error("getDisplayMedia API is not availabe in this browser.");navigator.getDisplayMedia(options.localMediaConstraints).then(function(stream){stream.streamid=stream.streamid||stream.id||getRandomString(),stream.idInstance=idInstance,streaming(stream)})["catch"](function(error){options.onLocalMediaError(error,options.localMediaConstraints)})}return}navigator.mediaDevices.getUserMedia(options.localMediaConstraints).then(function(stream){stream.streamid=stream.streamid||stream.id||getRandomString(),stream.idInstance=idInstance,streaming(stream)})["catch"](function(error){options.onLocalMediaError(error,options.localMediaConstraints)})}}function TextReceiver(connection){function receive(data,userid,extra){var uuid=data.uuid;if(content[uuid]||(content[uuid]=[]),content[uuid].push(data.message),data.last){var message=content[uuid].join("");data.isobject&&(message=JSON.parse(message));var receivingTime=(new Date).getTime(),latency=receivingTime-data.sendingTime,e={data:message,userid:userid,extra:extra,latency:latency};connection.autoTranslateText?(e.original=e.data,connection.Translator.TranslateText(e.data,function(translatedText){e.data=translatedText,connection.onmessage(e)})):connection.onmessage(e),delete content[uuid]}}var content={};return{receive:receive}}var browserFakeUserAgent="Fake/5.0 (FakeOS) AppleWebKit/123 (KHTML, like Gecko) Fake/12.3.4567.89 Fake/123.45";!function(that){that&&"undefined"==typeof window&&"undefined"!=typeof global&&(global.navigator={userAgent:browserFakeUserAgent,getUserMedia:function(){}},global.console||(global.console={}),"undefined"==typeof global.console.debug&&(global.console.debug=global.console.info=global.console.error=global.console.log=global.console.log||function(){console.log(arguments)}),"undefined"==typeof document&&(that.document={},document.createElement=document.captureStream=document.mozCaptureStream=function(){var obj={getContext:function(){return obj},play:function(){},pause:function(){},drawImage:function(){},toDataURL:function(){return""}};return obj},document.addEventListener=document.removeEventListener=that.addEventListener=that.removeEventListener=function(){},that.HTMLVideoElement=that.HTMLMediaElement=function(){}),"undefined"==typeof io&&(that.io=function(){return{on:function(eventName,callback){callback=callback||function(){},"connect"===eventName&&callback()},emit:function(eventName,data,callback){callback=callback||function(){},"open-room"!==eventName&&"join-room"!==eventName||callback(!0,data.sessionid,null)}}}),"undefined"==typeof location&&(that.location={protocol:"file:",href:"",hash:"",origin:"self"}),"undefined"==typeof screen&&(that.screen={width:0,height:0}),"undefined"==typeof URL&&(that.URL={createObjectURL:function(){return""},revokeObjectURL:function(){return""}}),that.window=global)}("undefined"!=typeof global?global:null),function(){function getBrowserInfo(){var nameOffset,verOffset,ix,nAgt=(navigator.appVersion,navigator.userAgent),browserName=navigator.appName,fullVersion=""+parseFloat(navigator.appVersion),majorVersion=parseInt(navigator.appVersion,10);if(isSafari&&!isChrome&&nAgt.indexOf("CriOS")!==-1&&(isSafari=!1,isChrome=!0),isOpera){browserName="Opera";try{fullVersion=navigator.userAgent.split("OPR/")[1].split(" ")[0],majorVersion=fullVersion.split(".")[0]}catch(e){fullVersion="0.0.0.0",majorVersion=0}}else isIE?(verOffset=nAgt.indexOf("rv:"),verOffset>0?fullVersion=nAgt.substring(verOffset+3):(verOffset=nAgt.indexOf("MSIE"),fullVersion=nAgt.substring(verOffset+5)),browserName="IE"):isChrome?(verOffset=nAgt.indexOf("Chrome"),browserName="Chrome",fullVersion=nAgt.substring(verOffset+7)):isSafari?(verOffset=nAgt.indexOf("Safari"),browserName="Safari",fullVersion=nAgt.substring(verOffset+7),(verOffset=nAgt.indexOf("Version"))!==-1&&(fullVersion=nAgt.substring(verOffset+8)),navigator.userAgent.indexOf("Version/")!==-1&&(fullVersion=navigator.userAgent.split("Version/")[1].split(" ")[0])):isFirefox?(verOffset=nAgt.indexOf("Firefox"),browserName="Firefox",fullVersion=nAgt.substring(verOffset+8)):(nameOffset=nAgt.lastIndexOf(" ")+1)<(verOffset=nAgt.lastIndexOf("/"))&&(browserName=nAgt.substring(nameOffset,verOffset),fullVersion=nAgt.substring(verOffset+1),browserName.toLowerCase()===browserName.toUpperCase()&&(browserName=navigator.appName));return isEdge&&(browserName="Edge",fullVersion=navigator.userAgent.split("Edge/")[1]),(ix=fullVersion.search(/[; \)]/))!==-1&&(fullVersion=fullVersion.substring(0,ix)),majorVersion=parseInt(""+fullVersion,10),isNaN(majorVersion)&&(fullVersion=""+parseFloat(navigator.appVersion),majorVersion=parseInt(navigator.appVersion,10)),{fullVersion:fullVersion,version:majorVersion,name:browserName,isPrivateBrowsing:!1}}function retry(isDone,next){var currentTrial=0,maxRetry=50,isTimeout=!1,id=window.setInterval(function(){isDone()&&(window.clearInterval(id),next(isTimeout)),currentTrial++>maxRetry&&(window.clearInterval(id),isTimeout=!0,next(isTimeout))},10)}function isIE10OrLater(userAgent){var ua=userAgent.toLowerCase();if(0===ua.indexOf("msie")&&0===ua.indexOf("trident"))return!1;var match=/(?:msie|rv:)\s?([\d\.]+)/.exec(ua);return!!(match&&parseInt(match[1],10)>=10)}function detectPrivateMode(callback){var isPrivate;try{if(window.webkitRequestFileSystem)window.webkitRequestFileSystem(window.TEMPORARY,1,function(){isPrivate=!1},function(e){isPrivate=!0});else if(window.indexedDB&&/Firefox/.test(window.navigator.userAgent)){var db;try{db=window.indexedDB.open("test"),db.onerror=function(){return!0}}catch(e){isPrivate=!0}"undefined"==typeof isPrivate&&retry(function(){return"done"===db.readyState},function(isTimeout){isTimeout||(isPrivate=!db.result)})}else if(isIE10OrLater(window.navigator.userAgent)){isPrivate=!1;try{window.indexedDB||(isPrivate=!0)}catch(e){isPrivate=!0}}else if(window.localStorage&&/Safari/.test(window.navigator.userAgent)){try{window.localStorage.setItem("test",1)}catch(e){isPrivate=!0}"undefined"==typeof isPrivate&&(isPrivate=!1,window.localStorage.removeItem("test"))}}catch(e){isPrivate=!1}retry(function(){return"undefined"!=typeof isPrivate},function(isTimeout){callback(isPrivate)})}function detectDesktopOS(){for(var cs,unknown="-",nVer=navigator.appVersion,nAgt=navigator.userAgent,os=unknown,clientStrings=[{s:"Windows 10",r:/(Windows 10.0|Windows NT 10.0)/},{s:"Windows 8.1",r:/(Windows 8.1|Windows NT 6.3)/},{s:"Windows 8",r:/(Windows 8|Windows NT 6.2)/},{s:"Windows 7",r:/(Windows 7|Windows NT 6.1)/},{s:"Windows Vista",r:/Windows NT 6.0/},{s:"Windows Server 2003",r:/Windows NT 5.2/},{s:"Windows XP",r:/(Windows NT 5.1|Windows XP)/},{s:"Windows 2000",r:/(Windows NT 5.0|Windows 2000)/},{s:"Windows ME",r:/(Win 9x 4.90|Windows ME)/},{s:"Windows 98",r:/(Windows 98|Win98)/},{s:"Windows 95",r:/(Windows 95|Win95|Windows_95)/},{s:"Windows NT 4.0",r:/(Windows NT 4.0|WinNT4.0|WinNT|Windows NT)/},{s:"Windows CE",r:/Windows CE/},{s:"Windows 3.11",r:/Win16/},{s:"Android",r:/Android/},{s:"Open BSD",r:/OpenBSD/},{s:"Sun OS",r:/SunOS/},{s:"Linux",r:/(Linux|X11)/},{s:"iOS",r:/(iPhone|iPad|iPod)/},{s:"Mac OS X",r:/Mac OS X/},{s:"Mac OS",r:/(MacPPC|MacIntel|Mac_PowerPC|Macintosh)/},{s:"QNX",r:/QNX/},{s:"UNIX",r:/UNIX/},{s:"BeOS",r:/BeOS/},{s:"OS/2",r:/OS\/2/},{s:"Search Bot",r:/(nuhk|Googlebot|Yammybot|Openbot|Slurp|MSNBot|Ask Jeeves\/Teoma|ia_archiver)/}],i=0;cs=clientStrings[i];i++)if(cs.r.test(nAgt)){os=cs.s;break}var osVersion=unknown;switch(/Windows/.test(os)&&(/Windows (.*)/.test(os)&&(osVersion=/Windows (.*)/.exec(os)[1]),os="Windows"),os){case"Mac OS X":/Mac OS X (10[\.\_\d]+)/.test(nAgt)&&(osVersion=/Mac OS X (10[\.\_\d]+)/.exec(nAgt)[1]);break;case"Android":/Android ([\.\_\d]+)/.test(nAgt)&&(osVersion=/Android ([\.\_\d]+)/.exec(nAgt)[1]);break;case"iOS":/OS (\d+)_(\d+)_?(\d+)?/.test(nAgt)&&(osVersion=/OS (\d+)_(\d+)_?(\d+)?/.exec(nVer),osVersion=osVersion[1]+"."+osVersion[2]+"."+(0|osVersion[3]))}return{osName:os,osVersion:osVersion}}function getAndroidVersion(ua){ua=(ua||navigator.userAgent).toLowerCase();var match=ua.match(/android\s([0-9\.]*)/);return!!match&&match[1]}function DetectLocalIPAddress(callback,stream){if(DetectRTC.isWebRTCSupported){var isPublic=!0,isIpv4=!0;getIPs(function(ip){ip?ip.match(regexIpv4Local)?(isPublic=!1,callback("Local: "+ip,isPublic,isIpv4)):ip.match(regexIpv6)?(isIpv4=!1,callback("Public: "+ip,isPublic,isIpv4)):callback("Public: "+ip,isPublic,isIpv4):callback()},stream)}}function getIPs(callback,stream){function handleCandidate(candidate){if(!candidate)return void callback();var match=regexIpv4.exec(candidate);if(match){var ipAddress=match[1],isPublic=candidate.match(regexIpv4Local),isIpv4=!0;void 0===ipDuplicates[ipAddress]&&callback(ipAddress,isPublic,isIpv4),ipDuplicates[ipAddress]=!0}}function afterCreateOffer(){var lines=pc.localDescription.sdp.split("\n");lines.forEach(function(line){line&&0===line.indexOf("a=candidate:")&&handleCandidate(line)})}if("undefined"!=typeof document&&"function"==typeof document.getElementById){var ipDuplicates={},RTCPeerConnection=window.RTCPeerConnection||window.mozRTCPeerConnection||window.webkitRTCPeerConnection;if(!RTCPeerConnection){var iframe=document.getElementById("iframe");if(!iframe)return;var win=iframe.contentWindow;RTCPeerConnection=win.RTCPeerConnection||win.mozRTCPeerConnection||win.webkitRTCPeerConnection}if(RTCPeerConnection){var peerConfig=null;"Chrome"===DetectRTC.browser&&DetectRTC.browser.version<58&&(peerConfig={optional:[{RtpDataChannels:!0}]});var servers={iceServers:[{urls:"stun:stun.l.google.com:19302"}]},pc=new RTCPeerConnection(servers,peerConfig);if(stream&&(pc.addStream?pc.addStream(stream):pc.addTrack&&stream.getTracks()[0]&&pc.addTrack(stream.getTracks()[0],stream)),pc.onicecandidate=function(event){event.candidate&&event.candidate.candidate?handleCandidate(event.candidate.candidate):handleCandidate()},!stream)try{pc.createDataChannel("sctp",{})}catch(e){}DetectRTC.isPromisesSupported?pc.createOffer().then(function(result){pc.setLocalDescription(result).then(afterCreateOffer)}):pc.createOffer(function(result){pc.setLocalDescription(result,afterCreateOffer,function(){})},function(){})}}}function checkDeviceSupport(callback){if(!canEnumerate)return void(callback&&callback());if(!navigator.enumerateDevices&&window.MediaStreamTrack&&window.MediaStreamTrack.getSources&&(navigator.enumerateDevices=window.MediaStreamTrack.getSources.bind(window.MediaStreamTrack)),!navigator.enumerateDevices&&navigator.enumerateDevices&&(navigator.enumerateDevices=navigator.enumerateDevices.bind(navigator)),!navigator.enumerateDevices)return void(callback&&callback());MediaDevices=[],audioInputDevices=[],audioOutputDevices=[],videoInputDevices=[],hasMicrophone=!1,hasSpeakers=!1,hasWebcam=!1,isWebsiteHasMicrophonePermissions=!1,isWebsiteHasWebcamPermissions=!1;var alreadyUsedDevices={};navigator.enumerateDevices(function(devices){devices.forEach(function(_device){var device={};for(var d in _device)try{"function"!=typeof _device[d]&&(device[d]=_device[d])}catch(e){}alreadyUsedDevices[device.deviceId+device.label+device.kind]||("audio"===device.kind&&(device.kind="audioinput"),"video"===device.kind&&(device.kind="videoinput"),device.deviceId||(device.deviceId=device.id),device.id||(device.id=device.deviceId),device.label?("videoinput"!==device.kind||isWebsiteHasWebcamPermissions||(isWebsiteHasWebcamPermissions=!0),"audioinput"!==device.kind||isWebsiteHasMicrophonePermissions||(isWebsiteHasMicrophonePermissions=!0)):(device.isCustomLabel=!0,"videoinput"===device.kind?device.label="Camera "+(videoInputDevices.length+1):"audioinput"===device.kind?device.label="Microphone "+(audioInputDevices.length+1):"audiooutput"===device.kind?device.label="Speaker "+(audioOutputDevices.length+1):device.label="Please invoke getUserMedia once.","undefined"!=typeof DetectRTC&&DetectRTC.browser.isChrome&&DetectRTC.browser.version>=46&&!/^(https:|chrome-extension:)$/g.test(location.protocol||"")&&"undefined"!=typeof document&&"string"==typeof document.domain&&document.domain.search&&document.domain.search(/localhost|127.0./g)===-1&&(device.label="HTTPs is required to get label of this "+device.kind+" device.")),"audioinput"===device.kind&&(hasMicrophone=!0,audioInputDevices.indexOf(device)===-1&&audioInputDevices.push(device)),"audiooutput"===device.kind&&(hasSpeakers=!0,audioOutputDevices.indexOf(device)===-1&&audioOutputDevices.push(device)),"videoinput"===device.kind&&(hasWebcam=!0,videoInputDevices.indexOf(device)===-1&&videoInputDevices.push(device)),MediaDevices.push(device),alreadyUsedDevices[device.deviceId+device.label+device.kind]=device)}),"undefined"!=typeof DetectRTC&&(DetectRTC.MediaDevices=MediaDevices,DetectRTC.hasMicrophone=hasMicrophone,DetectRTC.hasSpeakers=hasSpeakers,DetectRTC.hasWebcam=hasWebcam,DetectRTC.isWebsiteHasWebcamPermissions=isWebsiteHasWebcamPermissions,DetectRTC.isWebsiteHasMicrophonePermissions=isWebsiteHasMicrophonePermissions,DetectRTC.audioInputDevices=audioInputDevices,DetectRTC.audioOutputDevices=audioOutputDevices,DetectRTC.videoInputDevices=videoInputDevices),callback&&callback()})}function getAspectRatio(w,h){function gcd(a,b){return 0==b?a:gcd(b,a%b)}var r=gcd(w,h);return w/r/(h/r)}var browserFakeUserAgent="Fake/5.0 (FakeOS) AppleWebKit/123 (KHTML, like Gecko) Fake/12.3.4567.89 Fake/123.45",isNodejs="object"==typeof process&&"object"==typeof process.versions&&process.versions.node&&!process.browser;if(isNodejs){var version=process.versions.node.toString().replace("v","");browserFakeUserAgent="Nodejs/"+version+" (NodeOS) AppleWebKit/"+version+" (KHTML, like Gecko) Nodejs/"+version+" Nodejs/"+version}!function(that){"undefined"==typeof window&&("undefined"==typeof window&&"undefined"!=typeof global?(global.navigator={userAgent:browserFakeUserAgent,getUserMedia:function(){}},that.window=global):"undefined"==typeof window,"undefined"==typeof location&&(that.location={protocol:"file:",href:"",hash:""}),"undefined"==typeof screen&&(that.screen={width:0,height:0}))}("undefined"!=typeof global?global:window);var navigator=window.navigator;"undefined"!=typeof navigator?("undefined"!=typeof navigator.webkitGetUserMedia&&(navigator.getUserMedia=navigator.webkitGetUserMedia),"undefined"!=typeof navigator.mozGetUserMedia&&(navigator.getUserMedia=navigator.mozGetUserMedia)):navigator={getUserMedia:function(){},userAgent:browserFakeUserAgent};var isMobileDevice=!!/Android|webOS|iPhone|iPad|iPod|BB10|BlackBerry|IEMobile|Opera Mini|Mobile|mobile/i.test(navigator.userAgent||""),isEdge=!(navigator.userAgent.indexOf("Edge")===-1||!navigator.msSaveOrOpenBlob&&!navigator.msSaveBlob),isOpera=!!window.opera||navigator.userAgent.indexOf(" OPR/")>=0,isFirefox="undefined"!=typeof window.InstallTrigger,isSafari=/^((?!chrome|android).)*safari/i.test(navigator.userAgent),isChrome=!!window.chrome&&!isOpera,isIE="undefined"!=typeof document&&!!document.documentMode&&!isEdge,isMobile={Android:function(){return navigator.userAgent.match(/Android/i)},BlackBerry:function(){return navigator.userAgent.match(/BlackBerry|BB10/i)},iOS:function(){return navigator.userAgent.match(/iPhone|iPad|iPod/i)},Opera:function(){return navigator.userAgent.match(/Opera Mini/i)},Windows:function(){return navigator.userAgent.match(/IEMobile/i)},any:function(){return isMobile.Android()||isMobile.BlackBerry()||isMobile.iOS()||isMobile.Opera()||isMobile.Windows()},getOsName:function(){var osName="Unknown OS";return isMobile.Android()&&(osName="Android"),isMobile.BlackBerry()&&(osName="BlackBerry"),isMobile.iOS()&&(osName="iOS"),isMobile.Opera()&&(osName="Opera Mini"),isMobile.Windows()&&(osName="Windows"),osName}},osName="Unknown OS",osVersion="Unknown OS Version",osInfo=detectDesktopOS();osInfo&&osInfo.osName&&"-"!=osInfo.osName?(osName=osInfo.osName,osVersion=osInfo.osVersion):isMobile.any()&&(osName=isMobile.getOsName(),"Android"==osName&&(osVersion=getAndroidVersion()));var isNodejs="object"==typeof process&&"object"==typeof process.versions&&process.versions.node;"Unknown OS"===osName&&isNodejs&&(osName="Nodejs",osVersion=process.versions.node.toString().replace("v",""));var isCanvasSupportsStreamCapturing=!1,isVideoSupportsStreamCapturing=!1;["captureStream","mozCaptureStream","webkitCaptureStream"].forEach(function(item){"undefined"!=typeof document&&"function"==typeof document.createElement&&(!isCanvasSupportsStreamCapturing&&item in document.createElement("canvas")&&(isCanvasSupportsStreamCapturing=!0),!isVideoSupportsStreamCapturing&&item in document.createElement("video")&&(isVideoSupportsStreamCapturing=!0))});var regexIpv4Local=/^(192\.168\.|169\.254\.|10\.|172\.(1[6-9]|2\d|3[01]))/,regexIpv4=/([0-9]{1,3}(\.[0-9]{1,3}){3})/,regexIpv6=/[a-f0-9]{1,4}(:[a-f0-9]{1,4}){7}/,MediaDevices=[],audioInputDevices=[],audioOutputDevices=[],videoInputDevices=[];navigator.mediaDevices&&navigator.mediaDevices.enumerateDevices&&(navigator.enumerateDevices=function(callback){var enumerateDevices=navigator.mediaDevices.enumerateDevices();enumerateDevices&&enumerateDevices.then?navigator.mediaDevices.enumerateDevices().then(callback)["catch"](function(){callback([])}):callback([])});var canEnumerate=!1;"undefined"!=typeof MediaStreamTrack&&"getSources"in MediaStreamTrack?canEnumerate=!0:navigator.mediaDevices&&navigator.mediaDevices.enumerateDevices&&(canEnumerate=!0);var hasMicrophone=!1,hasSpeakers=!1,hasWebcam=!1,isWebsiteHasMicrophonePermissions=!1,isWebsiteHasWebcamPermissions=!1,DetectRTC=window.DetectRTC||{};DetectRTC.browser=getBrowserInfo(),detectPrivateMode(function(isPrivateBrowsing){DetectRTC.browser.isPrivateBrowsing=!!isPrivateBrowsing}),DetectRTC.browser["is"+DetectRTC.browser.name]=!0,DetectRTC.osName=osName,DetectRTC.osVersion=osVersion;var isWebRTCSupported=("object"==typeof process&&"object"==typeof process.versions&&process.versions["node-webkit"],!1);["RTCPeerConnection","webkitRTCPeerConnection","mozRTCPeerConnection","RTCIceGatherer"].forEach(function(item){isWebRTCSupported||item in window&&(isWebRTCSupported=!0)}),DetectRTC.isWebRTCSupported=isWebRTCSupported,DetectRTC.isORTCSupported="undefined"!=typeof RTCIceGatherer;var isScreenCapturingSupported=!1;if(DetectRTC.browser.isChrome&&DetectRTC.browser.version>=35?isScreenCapturingSupported=!0:DetectRTC.browser.isFirefox&&DetectRTC.browser.version>=34?isScreenCapturingSupported=!0:DetectRTC.browser.isEdge&&DetectRTC.browser.version>=17?isScreenCapturingSupported=!0:"Android"===DetectRTC.osName&&DetectRTC.browser.isChrome&&(isScreenCapturingSupported=!0),!/^(https:|chrome-extension:)$/g.test(location.protocol||"")){var isNonLocalHost="undefined"!=typeof document&&"string"==typeof document.domain&&document.domain.search&&document.domain.search(/localhost|127.0./g)===-1;isNonLocalHost&&(DetectRTC.browser.isChrome||DetectRTC.browser.isEdge||DetectRTC.browser.isOpera)?isScreenCapturingSupported=!1:DetectRTC.browser.isFirefox&&(isScreenCapturingSupported=!1)}DetectRTC.isScreenCapturingSupported=isScreenCapturingSupported;var webAudio={isSupported:!1,isCreateMediaStreamSourceSupported:!1};["AudioContext","webkitAudioContext","mozAudioContext","msAudioContext"].forEach(function(item){webAudio.isSupported||item in window&&(webAudio.isSupported=!0,window[item]&&"createMediaStreamSource"in window[item].prototype&&(webAudio.isCreateMediaStreamSourceSupported=!0))}),DetectRTC.isAudioContextSupported=webAudio.isSupported,DetectRTC.isCreateMediaStreamSourceSupported=webAudio.isCreateMediaStreamSourceSupported;var isRtpDataChannelsSupported=!1;DetectRTC.browser.isChrome&&DetectRTC.browser.version>31&&(isRtpDataChannelsSupported=!0),DetectRTC.isRtpDataChannelsSupported=isRtpDataChannelsSupported;var isSCTPSupportd=!1;DetectRTC.browser.isFirefox&&DetectRTC.browser.version>28?isSCTPSupportd=!0:DetectRTC.browser.isChrome&&DetectRTC.browser.version>25?isSCTPSupportd=!0:DetectRTC.browser.isOpera&&DetectRTC.browser.version>=11&&(isSCTPSupportd=!0),DetectRTC.isSctpDataChannelsSupported=isSCTPSupportd,DetectRTC.isMobileDevice=isMobileDevice;var isGetUserMediaSupported=!1;navigator.getUserMedia?isGetUserMediaSupported=!0:navigator.mediaDevices&&navigator.mediaDevices.getUserMedia&&(isGetUserMediaSupported=!0),DetectRTC.browser.isChrome&&DetectRTC.browser.version>=46&&!/^(https:|chrome-extension:)$/g.test(location.protocol||"")&&"undefined"!=typeof document&&"string"==typeof document.domain&&document.domain.search&&document.domain.search(/localhost|127.0./g)===-1&&(isGetUserMediaSupported="Requires HTTPs"),"Nodejs"===DetectRTC.osName&&(isGetUserMediaSupported=!1),DetectRTC.isGetUserMediaSupported=isGetUserMediaSupported;var displayResolution="";if(screen.width){var width=screen.width?screen.width:"",height=screen.height?screen.height:"";displayResolution+=""+width+" x "+height}DetectRTC.displayResolution=displayResolution,DetectRTC.displayAspectRatio=getAspectRatio(screen.width,screen.height).toFixed(2),DetectRTC.isCanvasSupportsStreamCapturing=isCanvasSupportsStreamCapturing,DetectRTC.isVideoSupportsStreamCapturing=isVideoSupportsStreamCapturing,"Chrome"==DetectRTC.browser.name&&DetectRTC.browser.version>=53&&(DetectRTC.isCanvasSupportsStreamCapturing||(DetectRTC.isCanvasSupportsStreamCapturing="Requires chrome flag: enable-experimental-web-platform-features"),DetectRTC.isVideoSupportsStreamCapturing||(DetectRTC.isVideoSupportsStreamCapturing="Requires chrome flag: enable-experimental-web-platform-features")),DetectRTC.DetectLocalIPAddress=DetectLocalIPAddress,DetectRTC.isWebSocketsSupported="WebSocket"in window&&2===window.WebSocket.CLOSING,DetectRTC.isWebSocketsBlocked=!DetectRTC.isWebSocketsSupported,"Nodejs"===DetectRTC.osName&&(DetectRTC.isWebSocketsSupported=!0,DetectRTC.isWebSocketsBlocked=!1),DetectRTC.checkWebSocketsSupport=function(callback){callback=callback||function(){};try{var starttime,websocket=new WebSocket("wss://echo.websocket.org:443/");websocket.onopen=function(){DetectRTC.isWebSocketsBlocked=!1,starttime=(new Date).getTime(),websocket.send("ping")},websocket.onmessage=function(){DetectRTC.WebsocketLatency=(new Date).getTime()-starttime+"ms",callback(),websocket.close(),websocket=null},websocket.onerror=function(){DetectRTC.isWebSocketsBlocked=!0,callback()}}catch(e){DetectRTC.isWebSocketsBlocked=!0,callback()}},DetectRTC.load=function(callback){callback=callback||function(){},checkDeviceSupport(callback)},"undefined"!=typeof MediaDevices?DetectRTC.MediaDevices=MediaDevices:DetectRTC.MediaDevices=[],DetectRTC.hasMicrophone=hasMicrophone,DetectRTC.hasSpeakers=hasSpeakers,DetectRTC.hasWebcam=hasWebcam,DetectRTC.isWebsiteHasWebcamPermissions=isWebsiteHasWebcamPermissions,DetectRTC.isWebsiteHasMicrophonePermissions=isWebsiteHasMicrophonePermissions,DetectRTC.audioInputDevices=audioInputDevices,DetectRTC.audioOutputDevices=audioOutputDevices,DetectRTC.videoInputDevices=videoInputDevices;var isSetSinkIdSupported=!1;"undefined"!=typeof document&&"function"==typeof document.createElement&&"setSinkId"in document.createElement("video")&&(isSetSinkIdSupported=!0),DetectRTC.isSetSinkIdSupported=isSetSinkIdSupported;var isRTPSenderReplaceTracksSupported=!1;DetectRTC.browser.isFirefox&&"undefined"!=typeof mozRTCPeerConnection?"getSenders"in mozRTCPeerConnection.prototype&&(isRTPSenderReplaceTracksSupported=!0):DetectRTC.browser.isChrome&&"undefined"!=typeof webkitRTCPeerConnection&&"getSenders"in webkitRTCPeerConnection.prototype&&(isRTPSenderReplaceTracksSupported=!0),DetectRTC.isRTPSenderReplaceTracksSupported=isRTPSenderReplaceTracksSupported;var isRemoteStreamProcessingSupported=!1;DetectRTC.browser.isFirefox&&DetectRTC.browser.version>38&&(isRemoteStreamProcessingSupported=!0),DetectRTC.isRemoteStreamProcessingSupported=isRemoteStreamProcessingSupported;var isApplyConstraintsSupported=!1;"undefined"!=typeof MediaStreamTrack&&"applyConstraints"in MediaStreamTrack.prototype&&(isApplyConstraintsSupported=!0),DetectRTC.isApplyConstraintsSupported=isApplyConstraintsSupported;var isMultiMonitorScreenCapturingSupported=!1;DetectRTC.browser.isFirefox&&DetectRTC.browser.version>=43&&(isMultiMonitorScreenCapturingSupported=!0),DetectRTC.isMultiMonitorScreenCapturingSupported=isMultiMonitorScreenCapturingSupported,DetectRTC.isPromisesSupported=!!("Promise"in window),DetectRTC.version="1.3.9","undefined"==typeof DetectRTC&&(window.DetectRTC={});var MediaStream=window.MediaStream;"undefined"==typeof MediaStream&&"undefined"!=typeof webkitMediaStream&&(MediaStream=webkitMediaStream),"undefined"!=typeof MediaStream&&"function"==typeof MediaStream?DetectRTC.MediaStream=Object.keys(MediaStream.prototype):DetectRTC.MediaStream=!1,"undefined"!=typeof MediaStreamTrack?DetectRTC.MediaStreamTrack=Object.keys(MediaStreamTrack.prototype):DetectRTC.MediaStreamTrack=!1;var RTCPeerConnection=window.RTCPeerConnection||window.mozRTCPeerConnection||window.webkitRTCPeerConnection;"undefined"!=typeof RTCPeerConnection?DetectRTC.RTCPeerConnection=Object.keys(RTCPeerConnection.prototype):DetectRTC.RTCPeerConnection=!1,window.DetectRTC=DetectRTC,"undefined"!=typeof module&&(module.exports=DetectRTC),"function"==typeof define&&define.amd&&define("DetectRTC",[],function(){return DetectRTC})}(),"undefined"!=typeof cordova&&(DetectRTC.isMobileDevice=!0,DetectRTC.browser.name="Chrome"),navigator&&navigator.userAgent&&navigator.userAgent.indexOf("Crosswalk")!==-1&&(DetectRTC.isMobileDevice=!0,DetectRTC.browser.name="Chrome"),window.addEventListener||(window.addEventListener=function(el,eventName,eventHandler){
el.attachEvent&&el.attachEvent("on"+eventName,eventHandler)}),window.attachEventListener=function(video,type,listener,useCapture){video.addEventListener(type,listener,useCapture)};var MediaStream=window.MediaStream;"undefined"==typeof MediaStream&&"undefined"!=typeof webkitMediaStream&&(MediaStream=webkitMediaStream),"undefined"!=typeof MediaStream&&("stop"in MediaStream.prototype||(MediaStream.prototype.stop=function(){this.getTracks().forEach(function(track){track.stop()})})),window.iOSDefaultAudioOutputDevice=window.iOSDefaultAudioOutputDevice||"speaker",document.addEventListener("deviceready",setCordovaAPIs,!1),setCordovaAPIs();var RTCPeerConnection,defaults={};"undefined"!=typeof window.RTCPeerConnection?RTCPeerConnection=window.RTCPeerConnection:"undefined"!=typeof mozRTCPeerConnection?RTCPeerConnection=mozRTCPeerConnection:"undefined"!=typeof webkitRTCPeerConnection&&(RTCPeerConnection=webkitRTCPeerConnection);var RTCSessionDescription=window.RTCSessionDescription||window.mozRTCSessionDescription,RTCIceCandidate=window.RTCIceCandidate||window.mozRTCIceCandidate,MediaStreamTrack=window.MediaStreamTrack,CodecsHandler=function(){function preferCodec(sdp,codecName){var info=splitLines(sdp);return info.videoCodecNumbers?"vp8"===codecName&&info.vp8LineNumber===info.videoCodecNumbers[0]?sdp:"vp9"===codecName&&info.vp9LineNumber===info.videoCodecNumbers[0]?sdp:"h264"===codecName&&info.h264LineNumber===info.videoCodecNumbers[0]?sdp:sdp=preferCodecHelper(sdp,codecName,info):sdp}function preferCodecHelper(sdp,codec,info,ignore){var preferCodecNumber="";if("vp8"===codec){if(!info.vp8LineNumber)return sdp;preferCodecNumber=info.vp8LineNumber}if("vp9"===codec){if(!info.vp9LineNumber)return sdp;preferCodecNumber=info.vp9LineNumber}if("h264"===codec){if(!info.h264LineNumber)return sdp;preferCodecNumber=info.h264LineNumber}var newLine=info.videoCodecNumbersOriginal.split("SAVPF")[0]+"SAVPF ",newOrder=[preferCodecNumber];return ignore&&(newOrder=[]),info.videoCodecNumbers.forEach(function(codecNumber){codecNumber!==preferCodecNumber&&newOrder.push(codecNumber)}),newLine+=newOrder.join(" "),sdp=sdp.replace(info.videoCodecNumbersOriginal,newLine)}function splitLines(sdp){var info={};return sdp.split("\n").forEach(function(line){0===line.indexOf("m=video")&&(info.videoCodecNumbers=[],line.split("SAVPF")[1].split(" ").forEach(function(codecNumber){codecNumber=codecNumber.trim(),codecNumber&&codecNumber.length&&(info.videoCodecNumbers.push(codecNumber),info.videoCodecNumbersOriginal=line)})),line.indexOf("VP8/90000")===-1||info.vp8LineNumber||(info.vp8LineNumber=line.replace("a=rtpmap:","").split(" ")[0]),line.indexOf("VP9/90000")===-1||info.vp9LineNumber||(info.vp9LineNumber=line.replace("a=rtpmap:","").split(" ")[0]),line.indexOf("H264/90000")===-1||info.h264LineNumber||(info.h264LineNumber=line.replace("a=rtpmap:","").split(" ")[0])}),info}function removeVPX(sdp){var info=splitLines(sdp);return sdp=preferCodecHelper(sdp,"vp9",info,!0),sdp=preferCodecHelper(sdp,"vp8",info,!0)}function disableNACK(sdp){if(!sdp||"string"!=typeof sdp)throw"Invalid arguments.";return sdp=sdp.replace("a=rtcp-fb:126 nack\r\n",""),sdp=sdp.replace("a=rtcp-fb:126 nack pli\r\n","a=rtcp-fb:126 pli\r\n"),sdp=sdp.replace("a=rtcp-fb:97 nack\r\n",""),sdp=sdp.replace("a=rtcp-fb:97 nack pli\r\n","a=rtcp-fb:97 pli\r\n")}function prioritize(codecMimeType,peer){if(peer&&peer.getSenders&&peer.getSenders().length){if(!codecMimeType||"string"!=typeof codecMimeType)throw"Invalid arguments.";peer.getSenders().forEach(function(sender){for(var params=sender.getParameters(),i=0;i<params.codecs.length;i++)if(params.codecs[i].mimeType==codecMimeType){params.codecs.unshift(params.codecs.splice(i,1));break}sender.setParameters(params)})}}function removeNonG722(sdp){return sdp.replace(/m=audio ([0-9]+) RTP\/SAVPF ([0-9 ]*)/g,"m=audio $1 RTP/SAVPF 9")}function setBAS(sdp,bandwidth,isScreen){return bandwidth?"undefined"!=typeof isFirefox&&isFirefox?sdp:(isScreen&&(bandwidth.screen?bandwidth.screen<300&&console.warn("It seems that you are using wrong bandwidth value for screen. Screen sharing is expected to fail."):console.warn("It seems that you are not using bandwidth for screen. Screen sharing is expected to fail.")),bandwidth.screen&&isScreen&&(sdp=sdp.replace(/b=AS([^\r\n]+\r\n)/g,""),sdp=sdp.replace(/a=mid:video\r\n/g,"a=mid:video\r\nb=AS:"+bandwidth.screen+"\r\n")),(bandwidth.audio||bandwidth.video)&&(sdp=sdp.replace(/b=AS([^\r\n]+\r\n)/g,"")),bandwidth.audio&&(sdp=sdp.replace(/a=mid:audio\r\n/g,"a=mid:audio\r\nb=AS:"+bandwidth.audio+"\r\n")),bandwidth.screen?sdp=sdp.replace(/a=mid:video\r\n/g,"a=mid:video\r\nb=AS:"+bandwidth.screen+"\r\n"):bandwidth.video&&(sdp=sdp.replace(/a=mid:video\r\n/g,"a=mid:video\r\nb=AS:"+bandwidth.video+"\r\n")),sdp):sdp}function findLine(sdpLines,prefix,substr){return findLineInRange(sdpLines,0,-1,prefix,substr)}function findLineInRange(sdpLines,startLine,endLine,prefix,substr){for(var realEndLine=endLine!==-1?endLine:sdpLines.length,i=startLine;i<realEndLine;++i)if(0===sdpLines[i].indexOf(prefix)&&(!substr||sdpLines[i].toLowerCase().indexOf(substr.toLowerCase())!==-1))return i;return null}function getCodecPayloadType(sdpLine){var pattern=new RegExp("a=rtpmap:(\\d+) \\w+\\/\\d+"),result=sdpLine.match(pattern);return result&&2===result.length?result[1]:null}function setVideoBitrates(sdp,params){params=params||{};var vp8Payload,xgoogle_min_bitrate=params.min,xgoogle_max_bitrate=params.max,sdpLines=sdp.split("\r\n"),vp8Index=findLine(sdpLines,"a=rtpmap","VP8/90000");if(vp8Index&&(vp8Payload=getCodecPayloadType(sdpLines[vp8Index])),!vp8Payload)return sdp;var rtxPayload,rtxIndex=findLine(sdpLines,"a=rtpmap","rtx/90000");if(rtxIndex&&(rtxPayload=getCodecPayloadType(sdpLines[rtxIndex])),!rtxIndex)return sdp;var rtxFmtpLineIndex=findLine(sdpLines,"a=fmtp:"+rtxPayload.toString());if(null!==rtxFmtpLineIndex){var appendrtxNext="\r\n";appendrtxNext+="a=fmtp:"+vp8Payload+" x-google-min-bitrate="+(xgoogle_min_bitrate||"228")+"; x-google-max-bitrate="+(xgoogle_max_bitrate||"228"),sdpLines[rtxFmtpLineIndex]=sdpLines[rtxFmtpLineIndex].concat(appendrtxNext),sdp=sdpLines.join("\r\n")}return sdp}function setOpusAttributes(sdp,params){params=params||{};var opusPayload,sdpLines=sdp.split("\r\n"),opusIndex=findLine(sdpLines,"a=rtpmap","opus/48000");if(opusIndex&&(opusPayload=getCodecPayloadType(sdpLines[opusIndex])),!opusPayload)return sdp;var opusFmtpLineIndex=findLine(sdpLines,"a=fmtp:"+opusPayload.toString());if(null===opusFmtpLineIndex)return sdp;var appendOpusNext="";return appendOpusNext+="; stereo="+("undefined"!=typeof params.stereo?params.stereo:"1"),appendOpusNext+="; sprop-stereo="+("undefined"!=typeof params["sprop-stereo"]?params["sprop-stereo"]:"1"),"undefined"!=typeof params.maxaveragebitrate&&(appendOpusNext+="; maxaveragebitrate="+(params.maxaveragebitrate||1048576)),"undefined"!=typeof params.maxplaybackrate&&(appendOpusNext+="; maxplaybackrate="+(params.maxplaybackrate||1048576)),"undefined"!=typeof params.cbr&&(appendOpusNext+="; cbr="+("undefined"!=typeof params.cbr?params.cbr:"1")),"undefined"!=typeof params.useinbandfec&&(appendOpusNext+="; useinbandfec="+params.useinbandfec),"undefined"!=typeof params.usedtx&&(appendOpusNext+="; usedtx="+params.usedtx),"undefined"!=typeof params.maxptime&&(appendOpusNext+="\r\na=maxptime:"+params.maxptime),sdpLines[opusFmtpLineIndex]=sdpLines[opusFmtpLineIndex].concat(appendOpusNext),sdp=sdpLines.join("\r\n")}function forceStereoAudio(sdp){for(var sdpLines=sdp.split("\r\n"),fmtpLineIndex=null,i=0;i<sdpLines.length;i++)if(sdpLines[i].search("opus/48000")!==-1){var opusPayload=extractSdp(sdpLines[i],/:(\d+) opus\/48000/i);break}for(var i=0;i<sdpLines.length;i++)if(sdpLines[i].search("a=fmtp")!==-1){var payload=extractSdp(sdpLines[i],/a=fmtp:(\d+)/);if(payload===opusPayload){fmtpLineIndex=i;break}}return null===fmtpLineIndex?sdp:(sdpLines[fmtpLineIndex]=sdpLines[fmtpLineIndex].concat("; stereo=1; sprop-stereo=1"),sdp=sdpLines.join("\r\n"))}return{removeVPX:removeVPX,disableNACK:disableNACK,prioritize:prioritize,removeNonG722:removeNonG722,setApplicationSpecificBandwidth:function(sdp,bandwidth,isScreen){return setBAS(sdp,bandwidth,isScreen)},setVideoBitrates:function(sdp,params){return setVideoBitrates(sdp,params)},setOpusAttributes:function(sdp,params){return setOpusAttributes(sdp,params)},preferVP9:function(sdp){return preferCodec(sdp,"vp9")},preferCodec:preferCodec,forceStereoAudio:forceStereoAudio}}();window.BandwidthHandler=CodecsHandler;var OnIceCandidateHandler=function(){function processCandidates(connection,icePair){var candidate=icePair.candidate,iceRestrictions=connection.candidates,stun=iceRestrictions.stun,turn=iceRestrictions.turn;if(isNull(iceRestrictions.reflexive)||(stun=iceRestrictions.reflexive),isNull(iceRestrictions.relay)||(turn=iceRestrictions.relay),(iceRestrictions.host||!candidate.match(/typ host/g))&&(turn||!candidate.match(/typ relay/g))&&(stun||!candidate.match(/typ srflx/g))){var protocol=connection.iceProtocols;if((protocol.udp||!candidate.match(/ udp /g))&&(protocol.tcp||!candidate.match(/ tcp /g)))return connection.enableLogs&&console.debug("Your candidate pairs:",candidate),{candidate:candidate,sdpMid:icePair.sdpMid,sdpMLineIndex:icePair.sdpMLineIndex}}}return{processCandidates:processCandidates}}(),IceServersHandler=function(){function getIceServers(connection){var iceServers=[{urls:["stun:stun.l.google.com:19302","stun:stun1.l.google.com:19302","stun:stun2.l.google.com:19302","stun:stun.l.google.com:19302?transport=udp"]}];return iceServers}return{getIceServers:getIceServers}}();window.currentUserMediaRequest={streams:[],mutex:!1,queueRequests:[],remove:function(idInstance){this.mutex=!1;var stream=this.streams[idInstance];if(stream){stream=stream.stream;var options=stream.currentUserMediaRequestOptions;this.queueRequests.indexOf(options)&&(delete this.queueRequests[this.queueRequests.indexOf(options)],this.queueRequests=removeNullEntries(this.queueRequests)),this.streams[idInstance].stream=null,delete this.streams[idInstance]}}};var StreamsHandler=function(){function handleType(type){if(type)return"string"==typeof type||"undefined"==typeof type?type:type.audio&&type.video?null:type.audio?"audio":type.video?"video":void 0}function setHandlers(stream,syncAction,connection){function graduallyIncreaseVolume(){if(connection.streamEvents[stream.streamid].mediaElement){var mediaElement=connection.streamEvents[stream.streamid].mediaElement;mediaElement.volume=0,afterEach(200,5,function(){try{mediaElement.volume+=.2}catch(e){mediaElement.volume=1}})}}if(stream&&stream.addEventListener){if("undefined"==typeof syncAction||1==syncAction){var streamEndedEvent="ended";"oninactive"in stream&&(streamEndedEvent="inactive"),stream.addEventListener(streamEndedEvent,function(){StreamsHandler.onSyncNeeded(this.streamid,streamEndedEvent)},!1)}stream.mute=function(type,isSyncAction){type=handleType(type),"undefined"!=typeof isSyncAction&&(syncAction=isSyncAction),"undefined"!=typeof type&&"audio"!=type||getTracks(stream,"audio").forEach(function(track){track.enabled=!1,connection.streamEvents[stream.streamid].isAudioMuted=!0}),"undefined"!=typeof type&&"video"!=type||getTracks(stream,"video").forEach(function(track){track.enabled=!1}),"undefined"!=typeof syncAction&&1!=syncAction||StreamsHandler.onSyncNeeded(stream.streamid,"mute",type),connection.streamEvents[stream.streamid].muteType=type||"both",fireEvent(stream,"mute",type)},stream.unmute=function(type,isSyncAction){type=handleType(type),"undefined"!=typeof isSyncAction&&(syncAction=isSyncAction),graduallyIncreaseVolume(),"undefined"!=typeof type&&"audio"!=type||getTracks(stream,"audio").forEach(function(track){track.enabled=!0,connection.streamEvents[stream.streamid].isAudioMuted=!1}),"undefined"!=typeof type&&"video"!=type||(getTracks(stream,"video").forEach(function(track){track.enabled=!0}),"undefined"!=typeof type&&"video"==type&&connection.streamEvents[stream.streamid].isAudioMuted&&!function looper(times){times||(times=0),times++,times<100&&connection.streamEvents[stream.streamid].isAudioMuted&&(stream.mute("audio"),setTimeout(function(){looper(times)},50))}()),"undefined"!=typeof syncAction&&1!=syncAction||StreamsHandler.onSyncNeeded(stream.streamid,"unmute",type),connection.streamEvents[stream.streamid].unmuteType=type||"both",fireEvent(stream,"unmute",type)}}}function afterEach(setTimeoutInteval,numberOfTimes,callback,startedTimes){startedTimes=(startedTimes||0)+1,startedTimes>=numberOfTimes||setTimeout(function(){callback(),afterEach(setTimeoutInteval,numberOfTimes,callback,startedTimes)},setTimeoutInteval)}return{setHandlers:setHandlers,onSyncNeeded:function(streamid,action,type){}}}(),TextSender={send:function(config){function sendText(textMessage,text){var data={type:"text",uuid:uuid,sendingTime:sendingTime};textMessage&&(text=textMessage,data.packets=parseInt(text.length/packetSize)),text.length>packetSize?data.message=text.slice(0,packetSize):(data.message=text,data.last=!0,data.isobject=isobject),channel.send(data,remoteUserId),textToTransfer=text.slice(data.message.length),textToTransfer.length&&setTimeout(function(){sendText(null,textToTransfer)},connection.chunkInterval||100)}var connection=config.connection,channel=config.channel,remoteUserId=config.remoteUserId,initialText=config.text,packetSize=connection.chunkSize||1e3,textToTransfer="",isobject=!1;isString(initialText)||(isobject=!0,initialText=JSON.stringify(initialText));var uuid=getRandomString(),sendingTime=(new Date).getTime();sendText(initialText)}},FileProgressBarHandler=function(){function handle(connection){function updateLabel(progress,label){if(progress.position!==-1){var position=+progress.position.toFixed(2).split(".")[1]||100;label.innerHTML=position+"%"}}var progressHelper={};connection.onFileStart=function(file){var div=document.createElement("div");return div.title=file.name,div.innerHTML="<label>0%</label> <progress></progress>",file.remoteUserId&&(div.innerHTML+=" (Sharing with:"+file.remoteUserId+")"),connection.filesContainer||(connection.filesContainer=document.body||document.documentElement),connection.filesContainer.insertBefore(div,connection.filesContainer.firstChild),file.remoteUserId?(progressHelper[file.uuid]||(progressHelper[file.uuid]={}),progressHelper[file.uuid][file.remoteUserId]={div:div,progress:div.querySelector("progress"),label:div.querySelector("label")},void(progressHelper[file.uuid][file.remoteUserId].progress.max=file.maxChunks)):(progressHelper[file.uuid]={div:div,progress:div.querySelector("progress"),label:div.querySelector("label")},void(progressHelper[file.uuid].progress.max=file.maxChunks))},connection.onFileProgress=function(chunk){var helper=progressHelper[chunk.uuid];helper&&(chunk.remoteUserId&&!(helper=progressHelper[chunk.uuid][chunk.remoteUserId])||(helper.progress.value=chunk.currentPosition||chunk.maxChunks||helper.progress.max,updateLabel(helper.progress,helper.label)))},connection.onFileEnd=function(file){var helper=progressHelper[file.uuid];if(!helper)return void console.error("No such progress-helper element exist.",file);if(!file.remoteUserId||(helper=progressHelper[file.uuid][file.remoteUserId])){var div=helper.div;file.type.indexOf("image")!=-1?div.innerHTML='<a href="'+file.url+'" download="'+file.name+'">Download <strong style="color:red;">'+file.name+'</strong> </a><br /><img src="'+file.url+'" title="'+file.name+'" style="max-width: 80%;">':div.innerHTML='<a href="'+file.url+'" download="'+file.name+'">Download <strong style="color:red;">'+file.name+'</strong> </a><br /><iframe src="'+file.url+'" title="'+file.name+'" style="width: 80%;border: 0;height: inherit;margin-top:1em;"></iframe>'}}}return{handle:handle}}(),TranslationHandler=function(){function handle(connection){connection.autoTranslateText=!1,connection.language="en",connection.googKey="AIzaSyCgB5hmFY74WYB-EoWkhr9cAGr6TiTHrEE",connection.Translator={TranslateText:function(text,callback){var newScript=document.createElement("script");newScript.type="text/javascript";var sourceText=encodeURIComponent(text),randomNumber="method"+connection.token();window[randomNumber]=function(response){return response.data&&response.data.translations[0]&&callback?void callback(response.data.translations[0].translatedText):response.error&&"Daily Limit Exceeded"===response.error.message?void console.error('Text translation failed. Error message: "Daily Limit Exceeded."'):response.error?void console.error(response.error.message):void console.error(response)};var source="https://www.googleapis.com/language/translate/v2?key="+connection.googKey+"&target="+(connection.language||"en-US")+"&callback=window."+randomNumber+"&q="+sourceText;newScript.src=source,document.getElementsByTagName("head")[0].appendChild(newScript)},getListOfLanguages:function(callback){var xhr=new XMLHttpRequest;xhr.onreadystatechange=function(){if(xhr.readyState==XMLHttpRequest.DONE){var response=JSON.parse(xhr.responseText);if(response&&response.data&&response.data.languages)return void callback(response.data.languages);if(response.error&&"Daily Limit Exceeded"===response.error.message)return void console.error('Text translation failed. Error message: "Daily Limit Exceeded."');if(response.error)return void console.error(response.error.message);console.error(response)}};var url="https://www.googleapis.com/language/translate/v2/languages?key="+connection.googKey+"&target=en";xhr.open("GET",url,!0),xhr.send(null)}}}return{handle:handle}}();!function(connection){function onUserLeft(remoteUserId){connection.deletePeer(remoteUserId)}function connectSocket(connectCallback){if(connection.socketAutoReConnect=!0,connection.socket)return void(connectCallback&&connectCallback(connection.socket));if("undefined"==typeof SocketConnection)if("undefined"!=typeof FirebaseConnection)window.SocketConnection=FirebaseConnection;else{if("undefined"==typeof PubNubConnection)throw"SocketConnection.js seems missed.";window.SocketConnection=PubNubConnection}new SocketConnection(connection,function(s){connectCallback&&connectCallback(connection.socket)})}function joinRoom(connectionDescription,cb){connection.socket.emit("join-room",{sessionid:connection.sessionid,session:connection.session,mediaConstraints:connection.mediaConstraints,sdpConstraints:connection.sdpConstraints,streams:getStreamInfoForAdmin(),extra:connection.extra,password:"undefined"!=typeof connection.password&&"object"!=typeof connection.password?connection.password:""},function(isRoomJoined,error){if(isRoomJoined===!0){if(connection.enableLogs&&console.log("isRoomJoined: ",isRoomJoined," roomid: ",connection.sessionid),connection.peers[connection.sessionid])return;mPeer.onNegotiationNeeded(connectionDescription)}isRoomJoined===!1&&connection.enableLogs&&console.warn("isRoomJoined: ",error," roomid: ",connection.sessionid),cb(isRoomJoined,connection.sessionid,error)})}function openRoom(callback){connection.enableLogs&&console.log("Sending open-room signal to socket.io"),connection.waitingForLocalMedia=!1,connection.socket.emit("open-room",{sessionid:connection.sessionid,session:connection.session,mediaConstraints:connection.mediaConstraints,sdpConstraints:connection.sdpConstraints,streams:getStreamInfoForAdmin(),extra:connection.extra,identifier:connection.publicRoomIdentifier,password:"undefined"!=typeof connection.password&&"object"!=typeof connection.password?connection.password:""},function(isRoomOpened,error){isRoomOpened===!0&&(connection.enableLogs&&console.log("isRoomOpened: ",isRoomOpened," roomid: ",connection.sessionid),callback(isRoomOpened,connection.sessionid)),isRoomOpened===!1&&(connection.enableLogs&&console.warn("isRoomOpened: ",error," roomid: ",connection.sessionid),callback(isRoomOpened,connection.sessionid,error))})}function getStreamInfoForAdmin(){try{return connection.streamEvents.selectAll("local").map(function(event){return{streamid:event.streamid,tracks:event.stream.getTracks().length}})}catch(e){return[]}}function beforeJoin(userPreferences,callback){if(connection.dontCaptureUserMedia||userPreferences.isDataOnly)return void callback();var localMediaConstraints={};userPreferences.localPeerSdpConstraints.OfferToReceiveAudio&&(localMediaConstraints.audio=connection.mediaConstraints.audio),userPreferences.localPeerSdpConstraints.OfferToReceiveVideo&&(localMediaConstraints.video=connection.mediaConstraints.video);var session=userPreferences.session||connection.session;return session.oneway&&"two-way"!==session.audio&&"two-way"!==session.video&&"two-way"!==session.screen?void callback():(session.oneway&&session.audio&&"two-way"===session.audio&&(session={audio:!0}),void((session.audio||session.video||session.screen)&&(session.screen?"Edge"===DetectRTC.browser.name?navigator.getDisplayMedia({video:!0,audio:isAudioPlusTab(connection)}).then(function(screen){screen.isScreen=!0,mPeer.onGettingLocalMedia(screen),!session.audio&&!session.video||isAudioPlusTab(connection)?callback(screen):connection.invokeGetUserMedia(null,callback)},function(error){console.error("Unable to capture screen on Edge. HTTPs and version 17+ is required.")}):connection.invokeGetUserMedia({audio:isAudioPlusTab(connection),video:!0,isScreen:!0},!session.audio&&!session.video||isAudioPlusTab(connection)?callback:connection.invokeGetUserMedia(null,callback)):(session.audio||session.video)&&connection.invokeGetUserMedia(null,callback,session))))}function applyConstraints(stream,mediaConstraints){return stream?(mediaConstraints.audio&&getTracks(stream,"audio").forEach(function(track){track.applyConstraints(mediaConstraints.audio)}),void(mediaConstraints.video&&getTracks(stream,"video").forEach(function(track){track.applyConstraints(mediaConstraints.video)}))):void(connection.enableLogs&&console.error("No stream to applyConstraints."))}function replaceTrack(track,remoteUserId,isVideoTrack){return remoteUserId?void mPeer.replaceTrack(track,remoteUserId,isVideoTrack):void connection.peers.getAllParticipants().forEach(function(participant){mPeer.replaceTrack(track,participant,isVideoTrack)})}forceOptions=forceOptions||{useDefaultDevices:!0},connection.channel=connection.sessionid=(roomid||location.href.replace(/\/|:|#|\?|\$|\^|%|\.|`|~|!|\+|@|\[|\||]|\|*. /g,"").split("\n").join("").split("\r").join(""))+"";var mPeer=new MultiPeers(connection),preventDuplicateOnStreamEvents={};mPeer.onGettingLocalMedia=function(stream,callback){if(callback=callback||function(){},preventDuplicateOnStreamEvents[stream.streamid])return void callback();preventDuplicateOnStreamEvents[stream.streamid]=!0;try{stream.type="local"}catch(e){}connection.setStreamEndHandler(stream),getRMCMediaElement(stream,function(mediaElement){mediaElement.id=stream.streamid,mediaElement.muted=!0,mediaElement.volume=0,connection.attachStreams.indexOf(stream)===-1&&connection.attachStreams.push(stream),"undefined"!=typeof StreamsHandler&&StreamsHandler.setHandlers(stream,!0,connection),connection.streamEvents[stream.streamid]={stream:stream,type:"local",mediaElement:mediaElement,userid:connection.userid,extra:connection.extra,streamid:stream.streamid,isAudioMuted:!0};try{setHarkEvents(connection,connection.streamEvents[stream.streamid]),setMuteHandlers(connection,connection.streamEvents[stream.streamid]),connection.onstream(connection.streamEvents[stream.streamid])}catch(e){}callback()},connection)},mPeer.onGettingRemoteMedia=function(stream,remoteUserId){try{stream.type="remote"}catch(e){}connection.setStreamEndHandler(stream,"remote-stream"),getRMCMediaElement(stream,function(mediaElement){mediaElement.id=stream.streamid,"undefined"!=typeof StreamsHandler&&StreamsHandler.setHandlers(stream,!1,connection),connection.streamEvents[stream.streamid]={stream:stream,type:"remote",userid:remoteUserId,extra:connection.peers[remoteUserId]?connection.peers[remoteUserId].extra:{},mediaElement:mediaElement,streamid:stream.streamid},setMuteHandlers(connection,connection.streamEvents[stream.streamid]),connection.onstream(connection.streamEvents[stream.streamid])},connection)},mPeer.onRemovingRemoteMedia=function(stream,remoteUserId){var streamEvent=connection.streamEvents[stream.streamid];streamEvent||(streamEvent={stream:stream,type:"remote",userid:remoteUserId,extra:connection.peers[remoteUserId]?connection.peers[remoteUserId].extra:{},streamid:stream.streamid,mediaElement:connection.streamEvents[stream.streamid]?connection.streamEvents[stream.streamid].mediaElement:null}),connection.peersBackup[streamEvent.userid]&&(streamEvent.extra=connection.peersBackup[streamEvent.userid].extra),connection.onstreamended(streamEvent),delete connection.streamEvents[stream.streamid]},mPeer.onNegotiationNeeded=function(message,remoteUserId,callback){callback=callback||function(){},remoteUserId=remoteUserId||message.remoteUserId,message=message||"";var messageToDeliver={remoteUserId:remoteUserId,message:message,sender:connection.userid};message.remoteUserId&&message.message&&message.sender&&(messageToDeliver=message),connectSocket(function(){connection.socket.emit(connection.socketMessageEvent,messageToDeliver,callback)})},mPeer.onUserLeft=onUserLeft,mPeer.disconnectWith=function(remoteUserId,callback){connection.socket&&connection.socket.emit("disconnect-with",remoteUserId,callback||function(){}),connection.deletePeer(remoteUserId)},connection.socketOptions={transport:"polling"},connection.openOrJoin=function(roomid,callback){callback=callback||function(){},connection.checkPresence(roomid,function(isRoomExist,roomid){if(isRoomExist){connection.sessionid=roomid;var localPeerSdpConstraints=!1,remotePeerSdpConstraints=!1,isOneWay=!!connection.session.oneway,isDataOnly=isData(connection.session);remotePeerSdpConstraints={OfferToReceiveAudio:connection.sdpConstraints.mandatory.OfferToReceiveAudio,OfferToReceiveVideo:connection.sdpConstraints.mandatory.OfferToReceiveVideo},localPeerSdpConstraints={OfferToReceiveAudio:isOneWay?!!connection.session.audio:connection.sdpConstraints.mandatory.OfferToReceiveAudio,OfferToReceiveVideo:isOneWay?!!connection.session.video||!!connection.session.screen:connection.sdpConstraints.mandatory.OfferToReceiveVideo};var connectionDescription={remoteUserId:connection.sessionid,message:{newParticipationRequest:!0,isOneWay:isOneWay,isDataOnly:isDataOnly,localPeerSdpConstraints:localPeerSdpConstraints,remotePeerSdpConstraints:remotePeerSdpConstraints},sender:connection.userid};return void beforeJoin(connectionDescription.message,function(){joinRoom(connectionDescription,callback)})}return connection.waitingForLocalMedia=!0,connection.isInitiator=!0,connection.sessionid=roomid||connection.sessionid,isData(connection.session)?void openRoom(callback):void connection.captureUserMedia(function(){openRoom(callback)})})},connection.waitingForLocalMedia=!1,connection.open=function(roomid,callback){callback=callback||function(){},connection.waitingForLocalMedia=!0,connection.isInitiator=!0,connection.sessionid=roomid||connection.sessionid,connectSocket(function(){return isData(connection.session)?void openRoom(callback):void connection.captureUserMedia(function(){openRoom(callback)})})},connection.peersBackup={},connection.deletePeer=function(remoteUserId){if(remoteUserId&&connection.peers[remoteUserId]){var eventObject={userid:remoteUserId,extra:connection.peers[remoteUserId]?connection.peers[remoteUserId].extra:{}};if(connection.peersBackup[eventObject.userid]&&(eventObject.extra=connection.peersBackup[eventObject.userid].extra),connection.onleave(eventObject),connection.peers[remoteUserId]){connection.peers[remoteUserId].streams.forEach(function(stream){stream.stop()});var peer=connection.peers[remoteUserId].peer;if(peer&&"closed"!==peer.iceConnectionState)try{peer.close()}catch(e){}connection.peers[remoteUserId]&&(connection.peers[remoteUserId].peer=null,delete connection.peers[remoteUserId])}}},connection.rejoin=function(connectionDescription){if(!connection.isInitiator&&connectionDescription&&Object.keys(connectionDescription).length){var extra={};connection.peers[connectionDescription.remoteUserId]&&(extra=connection.peers[connectionDescription.remoteUserId].extra,connection.deletePeer(connectionDescription.remoteUserId)),connectionDescription&&connectionDescription.remoteUserId&&(connection.join(connectionDescription.remoteUserId),connection.onReConnecting({userid:connectionDescription.remoteUserId,extra:extra}))}},connection.join=function(remoteUserId,options){connection.sessionid=!!remoteUserId&&(remoteUserId.sessionid||remoteUserId.remoteUserId||remoteUserId)||connection.sessionid,connection.sessionid+="";var localPeerSdpConstraints=!1,remotePeerSdpConstraints=!1,isOneWay=!1,isDataOnly=!1;if(remoteUserId&&remoteUserId.session||!remoteUserId||"string"==typeof remoteUserId){var session=remoteUserId?remoteUserId.session||connection.session:connection.session;isOneWay=!!session.oneway,isDataOnly=isData(session),remotePeerSdpConstraints={OfferToReceiveAudio:connection.sdpConstraints.mandatory.OfferToReceiveAudio,OfferToReceiveVideo:connection.sdpConstraints.mandatory.OfferToReceiveVideo},localPeerSdpConstraints={OfferToReceiveAudio:isOneWay?!!connection.session.audio:connection.sdpConstraints.mandatory.OfferToReceiveAudio,OfferToReceiveVideo:isOneWay?!!connection.session.video||!!connection.session.screen:connection.sdpConstraints.mandatory.OfferToReceiveVideo}}options=options||{};var cb=function(){};"function"==typeof options&&(cb=options,options={}),"undefined"!=typeof options.localPeerSdpConstraints&&(localPeerSdpConstraints=options.localPeerSdpConstraints),"undefined"!=typeof options.remotePeerSdpConstraints&&(remotePeerSdpConstraints=options.remotePeerSdpConstraints),"undefined"!=typeof options.isOneWay&&(isOneWay=options.isOneWay),"undefined"!=typeof options.isDataOnly&&(isDataOnly=options.isDataOnly);var connectionDescription={remoteUserId:connection.sessionid,message:{newParticipationRequest:!0,isOneWay:isOneWay,isDataOnly:isDataOnly,localPeerSdpConstraints:localPeerSdpConstraints,remotePeerSdpConstraints:remotePeerSdpConstraints},sender:connection.userid};return beforeJoin(connectionDescription.message,function(){connectSocket(function(){joinRoom(connectionDescription,cb)})}),connectionDescription},connection.publicRoomIdentifier="",connection.getUserMedia=connection.captureUserMedia=function(callback,sessionForced){callback=callback||function(){};var session=sessionForced||connection.session;return connection.dontCaptureUserMedia||isData(session)?void callback():void((session.audio||session.video||session.screen)&&(session.screen?"Edge"===DetectRTC.browser.name?navigator.getDisplayMedia({video:!0,audio:isAudioPlusTab(connection)}).then(function(screen){if(screen.isScreen=!0,mPeer.onGettingLocalMedia(screen),(session.audio||session.video)&&!isAudioPlusTab(connection)){var nonScreenSession={};for(var s in session)"screen"!==s&&(nonScreenSession[s]=session[s]);return void connection.invokeGetUserMedia(sessionForced,callback,nonScreenSession)}callback(screen)},function(error){console.error("Unable to capture screen on Edge. HTTPs and version 17+ is required.")}):connection.invokeGetUserMedia({audio:isAudioPlusTab(connection),video:!0,isScreen:!0},function(stream){if((session.audio||session.video)&&!isAudioPlusTab(connection)){var nonScreenSession={};for(var s in session)"screen"!==s&&(nonScreenSession[s]=session[s]);return void connection.invokeGetUserMedia(sessionForced,callback,nonScreenSession)}callback(stream)}):(session.audio||session.video)&&connection.invokeGetUserMedia(sessionForced,callback,session)))},connection.onbeforeunload=function(arg1,dontCloseSocket){connection.closeBeforeUnload&&(connection.peers.getAllParticipants().forEach(function(participant){mPeer.onNegotiationNeeded({userLeft:!0},participant),connection.peers[participant]&&connection.peers[participant].peer&&connection.peers[participant].peer.close(),delete connection.peers[participant]}),dontCloseSocket||connection.closeSocket(),connection.isInitiator=!1)},window.ignoreBeforeUnload?connection.closeBeforeUnload=!1:(connection.closeBeforeUnload=!0,
window.addEventListener("beforeunload",connection.onbeforeunload,!1)),connection.userid=getRandomString(),connection.changeUserId=function(newUserId,callback){callback=callback||function(){},connection.userid=newUserId||getRandomString(),connection.socket.emit("changed-uuid",connection.userid,callback)},connection.extra={},connection.attachStreams=[],connection.session={audio:!0,video:!0},connection.enableFileSharing=!1,connection.bandwidth={screen:!1,audio:!1,video:!1},connection.codecs={audio:"opus",video:"VP9"},connection.processSdp=function(sdp){return isUnifiedPlanSupportedDefault()?sdp:"Safari"===DetectRTC.browser.name?sdp:("VP8"===connection.codecs.video.toUpperCase()&&(sdp=CodecsHandler.preferCodec(sdp,"vp8")),"VP9"===connection.codecs.video.toUpperCase()&&(sdp=CodecsHandler.preferCodec(sdp,"vp9")),"H264"===connection.codecs.video.toUpperCase()&&(sdp=CodecsHandler.preferCodec(sdp,"h264")),"G722"===connection.codecs.audio&&(sdp=CodecsHandler.removeNonG722(sdp)),"Firefox"===DetectRTC.browser.name?sdp:((connection.bandwidth.video||connection.bandwidth.screen)&&(sdp=CodecsHandler.setApplicationSpecificBandwidth(sdp,connection.bandwidth,!!connection.session.screen)),connection.bandwidth.video&&(sdp=CodecsHandler.setVideoBitrates(sdp,{min:8*connection.bandwidth.video*1024,max:8*connection.bandwidth.video*1024})),connection.bandwidth.audio&&(sdp=CodecsHandler.setOpusAttributes(sdp,{maxaveragebitrate:8*connection.bandwidth.audio*1024,maxplaybackrate:8*connection.bandwidth.audio*1024,stereo:1,maxptime:3})),sdp))},"undefined"!=typeof CodecsHandler&&(connection.BandwidthHandler=connection.CodecsHandler=CodecsHandler),connection.mediaConstraints={audio:{mandatory:{},optional:connection.bandwidth.audio?[{bandwidth:8*connection.bandwidth.audio*1024||1048576}]:[]},video:{mandatory:{},optional:connection.bandwidth.video?[{bandwidth:8*connection.bandwidth.video*1024||1048576},{facingMode:"user"}]:[{facingMode:"user"}]}},"Firefox"===DetectRTC.browser.name&&(connection.mediaConstraints={audio:!0,video:!0}),forceOptions.useDefaultDevices||DetectRTC.isMobileDevice||DetectRTC.load(function(){var lastAudioDevice,lastVideoDevice;if(DetectRTC.MediaDevices.forEach(function(device){"audioinput"===device.kind&&connection.mediaConstraints.audio!==!1&&(lastAudioDevice=device),"videoinput"===device.kind&&connection.mediaConstraints.video!==!1&&(lastVideoDevice=device)}),lastAudioDevice){if("Firefox"===DetectRTC.browser.name)return void(connection.mediaConstraints.audio!==!0?connection.mediaConstraints.audio.deviceId=lastAudioDevice.id:connection.mediaConstraints.audio={deviceId:lastAudioDevice.id});1==connection.mediaConstraints.audio&&(connection.mediaConstraints.audio={mandatory:{},optional:[]}),connection.mediaConstraints.audio.optional||(connection.mediaConstraints.audio.optional=[]);var optional=[{sourceId:lastAudioDevice.id}];connection.mediaConstraints.audio.optional=optional.concat(connection.mediaConstraints.audio.optional)}if(lastVideoDevice){if("Firefox"===DetectRTC.browser.name)return void(connection.mediaConstraints.video!==!0?connection.mediaConstraints.video.deviceId=lastVideoDevice.id:connection.mediaConstraints.video={deviceId:lastVideoDevice.id});1==connection.mediaConstraints.video&&(connection.mediaConstraints.video={mandatory:{},optional:[]}),connection.mediaConstraints.video.optional||(connection.mediaConstraints.video.optional=[]);var optional=[{sourceId:lastVideoDevice.id}];connection.mediaConstraints.video.optional=optional.concat(connection.mediaConstraints.video.optional)}}),connection.sdpConstraints={mandatory:{OfferToReceiveAudio:!0,OfferToReceiveVideo:!0},optional:[{VoiceActivityDetection:!1}]},connection.sdpSemantics=null,connection.iceCandidatePoolSize=null,connection.bundlePolicy=null,connection.rtcpMuxPolicy=null,connection.iceTransportPolicy=null,connection.optionalArgument={optional:[{DtlsSrtpKeyAgreement:!0},{googImprovedWifiBwe:!0},{googScreencastMinBitrate:300},{googIPv6:!0},{googDscp:!0},{googCpuUnderuseThreshold:55},{googCpuOveruseThreshold:85},{googSuspendBelowMinBitrate:!0},{googCpuOveruseDetection:!0}],mandatory:{}},connection.iceServers=IceServersHandler.getIceServers(connection),connection.candidates={host:!0,stun:!0,turn:!0},connection.iceProtocols={tcp:!0,udp:!0},connection.onopen=function(event){connection.enableLogs&&console.info("Data connection has been opened between you & ",event.userid)},connection.onclose=function(event){connection.enableLogs&&console.warn("Data connection has been closed between you & ",event.userid)},connection.onerror=function(error){connection.enableLogs&&console.error(error.userid,"data-error",error)},connection.onmessage=function(event){connection.enableLogs&&console.debug("data-message",event.userid,event.data)},connection.send=function(data,remoteUserId){connection.peers.send(data,remoteUserId)},connection.close=connection.disconnect=connection.leave=function(){connection.onbeforeunload(!1,!0)},connection.closeEntireSession=function(callback){callback=callback||function(){},connection.socket.emit("close-entire-session",function looper(){return connection.getAllParticipants().length?void setTimeout(looper,100):(connection.onEntireSessionClosed({sessionid:connection.sessionid,userid:connection.userid,extra:connection.extra}),void connection.changeUserId(null,function(){connection.close(),callback()}))})},connection.onEntireSessionClosed=function(event){connection.enableLogs&&console.info("Entire session is closed: ",event.sessionid,event.extra)},connection.onstream=function(e){var parentNode=connection.videosContainer;parentNode.insertBefore(e.mediaElement,parentNode.firstChild);var played=e.mediaElement.play();return"undefined"!=typeof played?void played["catch"](function(){}).then(function(){setTimeout(function(){e.mediaElement.play()},2e3)}):void setTimeout(function(){e.mediaElement.play()},2e3)},connection.onstreamended=function(e){e.mediaElement||(e.mediaElement=document.getElementById(e.streamid)),e.mediaElement&&e.mediaElement.parentNode&&e.mediaElement.parentNode.removeChild(e.mediaElement)},connection.direction="many-to-many",connection.removeStream=function(streamid,remoteUserId){var stream;return connection.attachStreams.forEach(function(localStream){localStream.id===streamid&&(stream=localStream)}),stream?(connection.peers.getAllParticipants().forEach(function(participant){if(!remoteUserId||participant===remoteUserId){var user=connection.peers[participant];try{user.peer.removeStream(stream)}catch(e){}}}),void connection.renegotiate()):void console.warn("No such stream exist.",streamid)},connection.addStream=function(session,remoteUserId){function gumCallback(stream){session.streamCallback&&session.streamCallback(stream),connection.renegotiate(remoteUserId)}return session.getTracks?(connection.attachStreams.indexOf(session)===-1&&(session.streamid||(session.streamid=session.id),connection.attachStreams.push(session)),void connection.renegotiate(remoteUserId)):isData(session)?void connection.renegotiate(remoteUserId):void((session.audio||session.video||session.screen)&&(session.screen?"Edge"===DetectRTC.browser.name?navigator.getDisplayMedia({video:!0,audio:isAudioPlusTab(connection)}).then(function(screen){screen.isScreen=!0,mPeer.onGettingLocalMedia(screen),!session.audio&&!session.video||isAudioPlusTab(connection)?gumCallback(screen):connection.invokeGetUserMedia(null,function(stream){gumCallback(stream)})},function(error){console.error("Unable to capture screen on Edge. HTTPs and version 17+ is required.")}):connection.invokeGetUserMedia({audio:isAudioPlusTab(connection),video:!0,isScreen:!0},function(stream){!session.audio&&!session.video||isAudioPlusTab(connection)?gumCallback(stream):connection.invokeGetUserMedia(null,function(stream){gumCallback(stream)})}):(session.audio||session.video)&&connection.invokeGetUserMedia(null,gumCallback)))},connection.invokeGetUserMedia=function(localMediaConstraints,callback,session){session||(session=connection.session),localMediaConstraints||(localMediaConstraints=connection.mediaConstraints),getUserMediaHandler({onGettingLocalMedia:function(stream){var videoConstraints=localMediaConstraints.video;videoConstraints&&(videoConstraints.mediaSource||videoConstraints.mozMediaSource?stream.isScreen=!0:videoConstraints.mandatory&&videoConstraints.mandatory.chromeMediaSource&&(stream.isScreen=!0)),stream.isScreen||(stream.isVideo=!!getTracks(stream,"video").length,stream.isAudio=!stream.isVideo&&getTracks(stream,"audio").length),mPeer.onGettingLocalMedia(stream,function(){"function"==typeof callback&&callback(stream)})},onLocalMediaError:function(error,constraints){mPeer.onLocalMediaError(error,constraints)},localMediaConstraints:localMediaConstraints||{audio:!!session.audio&&localMediaConstraints.audio,video:!!session.video&&localMediaConstraints.video}})},connection.applyConstraints=function(mediaConstraints,streamid){if(!MediaStreamTrack||!MediaStreamTrack.prototype.applyConstraints)return void alert("track.applyConstraints is NOT supported in your browser.");if(streamid){var stream;return connection.streamEvents[streamid]&&(stream=connection.streamEvents[streamid].stream),void applyConstraints(stream,mediaConstraints)}connection.attachStreams.forEach(function(stream){applyConstraints(stream,mediaConstraints)})},connection.replaceTrack=function(session,remoteUserId,isVideoTrack){function gumCallback(stream){connection.replaceTrack(stream,remoteUserId,isVideoTrack||session.video||session.screen)}if(session=session||{},!RTCPeerConnection.prototype.getSenders)return void connection.addStream(session);if(session instanceof MediaStreamTrack)return void replaceTrack(session,remoteUserId,isVideoTrack);if(session instanceof MediaStream)return getTracks(session,"video").length&&replaceTrack(getTracks(session,"video")[0],remoteUserId,!0),void(getTracks(session,"audio").length&&replaceTrack(getTracks(session,"audio")[0],remoteUserId,!1));if(isData(session))throw"connection.replaceTrack requires audio and/or video and/or screen.";(session.audio||session.video||session.screen)&&(session.screen?"Edge"===DetectRTC.browser.name?navigator.getDisplayMedia({video:!0,audio:isAudioPlusTab(connection)}).then(function(screen){screen.isScreen=!0,mPeer.onGettingLocalMedia(screen),!session.audio&&!session.video||isAudioPlusTab(connection)?gumCallback(screen):connection.invokeGetUserMedia(null,gumCallback)},function(error){console.error("Unable to capture screen on Edge. HTTPs and version 17+ is required.")}):connection.invokeGetUserMedia({audio:isAudioPlusTab(connection),video:!0,isScreen:!0},!session.audio&&!session.video||isAudioPlusTab(connection)?gumCallback:connection.invokeGetUserMedia(null,gumCallback)):(session.audio||session.video)&&connection.invokeGetUserMedia(null,gumCallback))},connection.resetTrack=function(remoteUsersIds,isVideoTrack){remoteUsersIds||(remoteUsersIds=connection.getAllParticipants()),"string"==typeof remoteUsersIds&&(remoteUsersIds=[remoteUsersIds]),remoteUsersIds.forEach(function(participant){var peer=connection.peers[participant].peer;"undefined"!=typeof isVideoTrack&&isVideoTrack!==!0||!peer.lastVideoTrack||connection.replaceTrack(peer.lastVideoTrack,participant,!0),"undefined"!=typeof isVideoTrack&&isVideoTrack!==!1||!peer.lastAudioTrack||connection.replaceTrack(peer.lastAudioTrack,participant,!1)})},connection.renegotiate=function(remoteUserId){return remoteUserId?void mPeer.renegotiatePeer(remoteUserId):void connection.peers.getAllParticipants().forEach(function(participant){mPeer.renegotiatePeer(participant)})},connection.setStreamEndHandler=function(stream,isRemote){if(stream&&stream.addEventListener&&(isRemote=!!isRemote,!stream.alreadySetEndHandler)){stream.alreadySetEndHandler=!0;var streamEndedEvent="ended";"oninactive"in stream&&(streamEndedEvent="inactive"),stream.addEventListener(streamEndedEvent,function(){if(stream.idInstance&&currentUserMediaRequest.remove(stream.idInstance),!isRemote){var streams=[];connection.attachStreams.forEach(function(s){s.id!=stream.id&&streams.push(s)}),connection.attachStreams=streams}var streamEvent=connection.streamEvents[stream.streamid];if(streamEvent||(streamEvent={stream:stream,streamid:stream.streamid,type:isRemote?"remote":"local",userid:connection.userid,extra:connection.extra,mediaElement:connection.streamEvents[stream.streamid]?connection.streamEvents[stream.streamid].mediaElement:null}),isRemote&&connection.peers[streamEvent.userid]){var peer=connection.peers[streamEvent.userid].peer,streams=[];peer.getRemoteStreams().forEach(function(s){s.id!=stream.id&&streams.push(s)}),connection.peers[streamEvent.userid].streams=streams}streamEvent.userid===connection.userid&&"remote"===streamEvent.type||(connection.peersBackup[streamEvent.userid]&&(streamEvent.extra=connection.peersBackup[streamEvent.userid].extra),connection.onstreamended(streamEvent),delete connection.streamEvents[stream.streamid])},!1)}},connection.onMediaError=function(error,constraints){connection.enableLogs&&console.error(error,constraints)},connection.autoCloseEntireSession=!1,connection.filesContainer=connection.videosContainer=document.body||document.documentElement,connection.isInitiator=!1,connection.shareFile=mPeer.shareFile,"undefined"!=typeof FileProgressBarHandler&&FileProgressBarHandler.handle(connection),"undefined"!=typeof TranslationHandler&&TranslationHandler.handle(connection),connection.token=getRandomString,connection.onNewParticipant=function(participantId,userPreferences){connection.acceptParticipationRequest(participantId,userPreferences)},connection.acceptParticipationRequest=function(participantId,userPreferences){userPreferences.successCallback&&(userPreferences.successCallback(),delete userPreferences.successCallback),mPeer.createNewPeer(participantId,userPreferences)},"undefined"!=typeof StreamsHandler&&(connection.StreamsHandler=StreamsHandler),connection.onleave=function(userid){},connection.invokeSelectFileDialog=function(callback){var selector=new FileSelector;selector.accept="*.*",selector.selectSingleFile(callback)},connection.onmute=function(e){if(e&&e.mediaElement)if("both"===e.muteType||"video"===e.muteType){e.mediaElement.src=null;var paused=e.mediaElement.pause();"undefined"!=typeof paused?paused.then(function(){e.mediaElement.poster=e.snapshot||"https://cdn.webrtc-experiment.com/images/muted.png"}):e.mediaElement.poster=e.snapshot||"https://cdn.webrtc-experiment.com/images/muted.png"}else"audio"===e.muteType&&(e.mediaElement.muted=!0)},connection.onunmute=function(e){e&&e.mediaElement&&e.stream&&("both"===e.unmuteType||"video"===e.unmuteType?(e.mediaElement.poster=null,e.mediaElement.srcObject=e.stream,e.mediaElement.play()):"audio"===e.unmuteType&&(e.mediaElement.muted=!1))},connection.onExtraDataUpdated=function(event){event.status="online",connection.onUserStatusChanged(event,!0)},connection.getAllParticipants=function(sender){return connection.peers.getAllParticipants(sender)},"undefined"!=typeof StreamsHandler&&(StreamsHandler.onSyncNeeded=function(streamid,action,type){connection.peers.getAllParticipants().forEach(function(participant){mPeer.onNegotiationNeeded({streamid:streamid,action:action,streamSyncNeeded:!0,type:type||"both"},participant)})}),connection.connectSocket=function(callback){connectSocket(callback)},connection.closeSocket=function(){try{io.sockets={}}catch(e){}connection.socket&&("function"==typeof connection.socket.disconnect&&connection.socket.disconnect(),"function"==typeof connection.socket.resetProps&&connection.socket.resetProps(),connection.socket=null)},connection.getSocket=function(callback){return!callback&&connection.enableLogs&&console.warn("getSocket.callback paramter is required."),callback=callback||function(){},connection.socket?callback(connection.socket):connectSocket(function(){callback(connection.socket)}),connection.socket},connection.getRemoteStreams=mPeer.getRemoteStreams;var skipStreams=["selectFirst","selectAll","forEach"];if(connection.streamEvents={selectFirst:function(options){return connection.streamEvents.selectAll(options)[0]},selectAll:function(options){options||(options={local:!0,remote:!0,isScreen:!0,isAudio:!0,isVideo:!0}),"local"==options&&(options={local:!0}),"remote"==options&&(options={remote:!0}),"screen"==options&&(options={isScreen:!0}),"audio"==options&&(options={isAudio:!0}),"video"==options&&(options={isVideo:!0});var streams=[];return Object.keys(connection.streamEvents).forEach(function(key){var event=connection.streamEvents[key];if(skipStreams.indexOf(key)===-1){var ignore=!0;options.local&&"local"===event.type&&(ignore=!1),options.remote&&"remote"===event.type&&(ignore=!1),options.isScreen&&event.stream.isScreen&&(ignore=!1),options.isVideo&&event.stream.isVideo&&(ignore=!1),options.isAudio&&event.stream.isAudio&&(ignore=!1),options.userid&&event.userid===options.userid&&(ignore=!1),ignore===!1&&streams.push(event)}}),streams}},connection.socketURL="/",connection.socketMessageEvent="RTCMultiConnection-Message",connection.socketCustomEvent="RTCMultiConnection-Custom-Message",connection.DetectRTC=DetectRTC,connection.setCustomSocketEvent=function(customEvent){customEvent&&(connection.socketCustomEvent=customEvent),connection.socket&&connection.socket.emit("set-custom-socket-event-listener",connection.socketCustomEvent)},connection.getNumberOfBroadcastViewers=function(broadcastId,callback){connection.socket&&broadcastId&&callback&&connection.socket.emit("get-number-of-users-in-specific-broadcast",broadcastId,callback)},connection.onNumberOfBroadcastViewersUpdated=function(event){connection.enableLogs&&connection.isInitiator&&console.info("Number of broadcast (",event.broadcastId,") viewers",event.numberOfBroadcastViewers)},connection.onUserStatusChanged=function(event,dontWriteLogs){connection.enableLogs&&!dontWriteLogs&&console.info(event.userid,event.status)},connection.getUserMediaHandler=getUserMediaHandler,connection.multiPeersHandler=mPeer,connection.enableLogs=!0,connection.setCustomSocketHandler=function(customSocketHandler){"undefined"!=typeof SocketConnection&&(SocketConnection=customSocketHandler)},connection.chunkSize=4e4,connection.maxParticipantsAllowed=1e3,connection.disconnectWith=mPeer.disconnectWith,connection.checkPresence=function(roomid,callback){return roomid=roomid||connection.sessionid,"SSEConnection"===SocketConnection.name?void SSEConnection.checkPresence(roomid,function(isRoomExist,_roomid,extra){return connection.socket?void callback(isRoomExist,_roomid):(isRoomExist||(connection.userid=_roomid),void connection.connectSocket(function(){callback(isRoomExist,_roomid,extra)}))}):connection.socket?void connection.socket.emit("check-presence",roomid+"",function(isRoomExist,_roomid,extra){connection.enableLogs&&console.log("checkPresence.isRoomExist: ",isRoomExist," roomid: ",_roomid),callback(isRoomExist,_roomid,extra)}):void connection.connectSocket(function(){connection.checkPresence(roomid,callback)})},connection.onReadyForOffer=function(remoteUserId,userPreferences){connection.multiPeersHandler.createNewPeer(remoteUserId,userPreferences)},connection.setUserPreferences=function(userPreferences){return connection.dontAttachStream&&(userPreferences.dontAttachLocalStream=!0),connection.dontGetRemoteStream&&(userPreferences.dontGetRemoteStream=!0),userPreferences},connection.updateExtraData=function(){connection.socket.emit("extra-data-updated",connection.extra)},connection.enableScalableBroadcast=!1,connection.maxRelayLimitPerUser=3,connection.dontCaptureUserMedia=!1,connection.dontAttachStream=!1,connection.dontGetRemoteStream=!1,connection.onReConnecting=function(event){connection.enableLogs&&console.info("ReConnecting with",event.userid,"...")},connection.beforeAddingStream=function(stream){return stream},connection.beforeRemovingStream=function(stream){return stream},"undefined"!=typeof isChromeExtensionAvailable&&(connection.checkIfChromeExtensionAvailable=isChromeExtensionAvailable),"undefined"!=typeof isFirefoxExtensionAvailable&&(connection.checkIfChromeExtensionAvailable=isFirefoxExtensionAvailable),"undefined"!=typeof getChromeExtensionStatus&&(connection.getChromeExtensionStatus=getChromeExtensionStatus),connection.modifyScreenConstraints=function(screen_constraints){return screen_constraints},connection.onPeerStateChanged=function(state){connection.enableLogs&&state.iceConnectionState.search(/closed|failed/gi)!==-1&&console.error("Peer connection is closed between you & ",state.userid,state.extra,"state:",state.iceConnectionState)},connection.isOnline=!0,listenEventHandler("online",function(){connection.isOnline=!0}),listenEventHandler("offline",function(){connection.isOnline=!1}),connection.isLowBandwidth=!1,navigator&&navigator.connection&&navigator.connection.type&&(connection.isLowBandwidth=navigator.connection.type.toString().toLowerCase().search(/wifi|cell/g)!==-1,connection.isLowBandwidth)){if(connection.bandwidth={audio:!1,video:!1,screen:!1},connection.mediaConstraints.audio&&connection.mediaConstraints.audio.optional&&connection.mediaConstraints.audio.optional.length){var newArray=[];connection.mediaConstraints.audio.optional.forEach(function(opt){"undefined"==typeof opt.bandwidth&&newArray.push(opt)}),connection.mediaConstraints.audio.optional=newArray}if(connection.mediaConstraints.video&&connection.mediaConstraints.video.optional&&connection.mediaConstraints.video.optional.length){var newArray=[];connection.mediaConstraints.video.optional.forEach(function(opt){"undefined"==typeof opt.bandwidth&&newArray.push(opt)}),connection.mediaConstraints.video.optional=newArray}}connection.getExtraData=function(remoteUserId,callback){if(!remoteUserId)throw"remoteUserId is required.";return"function"==typeof callback?void connection.socket.emit("get-remote-user-extra-data",remoteUserId,function(extra,remoteUserId,error){callback(extra,remoteUserId,error)}):connection.peers[remoteUserId]?connection.peers[remoteUserId].extra:connection.peersBackup[remoteUserId]?connection.peersBackup[remoteUserId].extra:{}},forceOptions.autoOpenOrJoin&&connection.openOrJoin(connection.sessionid),connection.onUserIdAlreadyTaken=function(useridAlreadyTaken,yourNewUserId){connection.close(),connection.closeSocket(),connection.isInitiator=!1,connection.userid=connection.token(),connection.join(connection.sessionid),connection.enableLogs&&console.warn("Userid already taken.",useridAlreadyTaken,"Your new userid:",connection.userid)},connection.trickleIce=!0,connection.version="3.6.9",connection.onSettingLocalDescription=function(event){connection.enableLogs&&console.info("Set local description for remote user",event.userid)},connection.resetScreen=function(){sourceId=null,DetectRTC&&DetectRTC.screen&&delete DetectRTC.screen.sourceId,currentUserMediaRequest={streams:[],mutex:!1,queueRequests:[]}},connection.autoCreateMediaElement=!0,connection.password=null,connection.setPassword=function(password,callback){callback=callback||function(){},connection.socket?connection.socket.emit("set-password",password,callback):(connection.password=password,callback(!0,connection.sessionid,null))},connection.onSocketDisconnect=function(event){connection.enableLogs&&console.warn("socket.io connection is closed")},connection.onSocketError=function(event){connection.enableLogs&&console.warn("socket.io connection is failed")},connection.errors={ROOM_NOT_AVAILABLE:"Room not available",INVALID_PASSWORD:"Invalid password",USERID_NOT_AVAILABLE:"User ID does not exist",ROOM_PERMISSION_DENIED:"Room permission denied",ROOM_FULL:"Room full",DID_NOT_JOIN_ANY_ROOM:"Did not join any room yet",INVALID_SOCKET:"Invalid socket",PUBLIC_IDENTIFIER_MISSING:"publicRoomIdentifier is required",INVALID_ADMIN_CREDENTIAL:"Invalid username or password attempted"}}(this)};"undefined"!=typeof module&&(module.exports=exports=RTCMultiConnection),"function"==typeof define&&define.amd&&define("RTCMultiConnection",[],function(){return RTCMultiConnection});
(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.adapter = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
	/*
	 *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
	 *
	 *  Use of this source code is governed by a BSD-style license
	 *  that can be found in the LICENSE file in the root of the source
	 *  tree.
	 */
	/* eslint-env node */
	
	'use strict';
	
	var _adapter_factory = require('./adapter_factory.js');
	
	var adapter = (0, _adapter_factory.adapterFactory)({ window: typeof window === 'undefined' ? undefined : window });
	module.exports = adapter; // this is the difference from adapter_core.
	
	},{"./adapter_factory.js":2}],2:[function(require,module,exports){
	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.adapterFactory = adapterFactory;
	
	var _utils = require('./utils');
	
	var utils = _interopRequireWildcard(_utils);
	
	var _chrome_shim = require('./chrome/chrome_shim');
	
	var chromeShim = _interopRequireWildcard(_chrome_shim);
	
	var _edge_shim = require('./edge/edge_shim');
	
	var edgeShim = _interopRequireWildcard(_edge_shim);
	
	var _firefox_shim = require('./firefox/firefox_shim');
	
	var firefoxShim = _interopRequireWildcard(_firefox_shim);
	
	var _safari_shim = require('./safari/safari_shim');
	
	var safariShim = _interopRequireWildcard(_safari_shim);
	
	var _common_shim = require('./common_shim');
	
	var commonShim = _interopRequireWildcard(_common_shim);
	
	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }
	
	// Shimming starts here.
	/*
	 *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
	 *
	 *  Use of this source code is governed by a BSD-style license
	 *  that can be found in the LICENSE file in the root of the source
	 *  tree.
	 */
	function adapterFactory() {
		var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
				window = _ref.window;
	
		var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {
			shimChrome: true,
			shimFirefox: true,
			shimEdge: true,
			shimSafari: true
		};
	
		// Utils.
		var logging = utils.log;
		var browserDetails = utils.detectBrowser(window);
	
		var adapter = {
			browserDetails: browserDetails,
			commonShim: commonShim,
			extractVersion: utils.extractVersion,
			disableLog: utils.disableLog,
			disableWarnings: utils.disableWarnings
		};
	
		// Shim browser if found.
		switch (browserDetails.browser) {
			case 'chrome':
				if (!chromeShim || !chromeShim.shimPeerConnection || !options.shimChrome) {
					logging('Chrome shim is not included in this adapter release.');
					return adapter;
				}
				if (browserDetails.version === null) {
					logging('Chrome shim can not determine version, not shimming.');
					return adapter;
				}
				logging('adapter.js shimming chrome.');
				// Export to the adapter global object visible in the browser.
				adapter.browserShim = chromeShim;
	
				chromeShim.shimGetUserMedia(window);
				chromeShim.shimMediaStream(window);
				chromeShim.shimPeerConnection(window);
				chromeShim.shimOnTrack(window);
				chromeShim.shimAddTrackRemoveTrack(window);
				chromeShim.shimGetSendersWithDtmf(window);
				chromeShim.shimGetStats(window);
				chromeShim.shimSenderReceiverGetStats(window);
				chromeShim.fixNegotiationNeeded(window);
	
				commonShim.shimRTCIceCandidate(window);
				commonShim.shimConnectionState(window);
				commonShim.shimMaxMessageSize(window);
				commonShim.shimSendThrowTypeError(window);
				commonShim.removeAllowExtmapMixed(window);
				break;
			case 'firefox':
				if (!firefoxShim || !firefoxShim.shimPeerConnection || !options.shimFirefox) {
					logging('Firefox shim is not included in this adapter release.');
					return adapter;
				}
				logging('adapter.js shimming firefox.');
				// Export to the adapter global object visible in the browser.
				adapter.browserShim = firefoxShim;
	
				firefoxShim.shimGetUserMedia(window);
				firefoxShim.shimPeerConnection(window);
				firefoxShim.shimOnTrack(window);
				firefoxShim.shimRemoveStream(window);
				firefoxShim.shimSenderGetStats(window);
				firefoxShim.shimReceiverGetStats(window);
				firefoxShim.shimRTCDataChannel(window);
				firefoxShim.shimAddTransceiver(window);
				firefoxShim.shimGetParameters(window);
				firefoxShim.shimCreateOffer(window);
				firefoxShim.shimCreateAnswer(window);
	
				commonShim.shimRTCIceCandidate(window);
				commonShim.shimConnectionState(window);
				commonShim.shimMaxMessageSize(window);
				commonShim.shimSendThrowTypeError(window);
				break;
			case 'edge':
				if (!edgeShim || !edgeShim.shimPeerConnection || !options.shimEdge) {
					logging('MS edge shim is not included in this adapter release.');
					return adapter;
				}
				logging('adapter.js shimming edge.');
				// Export to the adapter global object visible in the browser.
				adapter.browserShim = edgeShim;
	
				edgeShim.shimGetUserMedia(window);
				edgeShim.shimGetDisplayMedia(window);
				edgeShim.shimPeerConnection(window);
				edgeShim.shimReplaceTrack(window);
	
				// the edge shim implements the full RTCIceCandidate object.
	
				commonShim.shimMaxMessageSize(window);
				commonShim.shimSendThrowTypeError(window);
				break;
			case 'safari':
				if (!safariShim || !options.shimSafari) {
					logging('Safari shim is not included in this adapter release.');
					return adapter;
				}
				logging('adapter.js shimming safari.');
				// Export to the adapter global object visible in the browser.
				adapter.browserShim = safariShim;
	
				safariShim.shimRTCIceServerUrls(window);
				safariShim.shimCreateOfferLegacy(window);
				safariShim.shimCallbacksAPI(window);
				safariShim.shimLocalStreamsAPI(window);
				safariShim.shimRemoteStreamsAPI(window);
				safariShim.shimTrackEventTransceiver(window);
				safariShim.shimGetUserMedia(window);
				safariShim.shimAudioContext(window);
	
				commonShim.shimRTCIceCandidate(window);
				commonShim.shimMaxMessageSize(window);
				commonShim.shimSendThrowTypeError(window);
				commonShim.removeAllowExtmapMixed(window);
				break;
			default:
				logging('Unsupported browser!');
				break;
		}
	
		return adapter;
	}
	
	// Browser shims.
	
	},{"./chrome/chrome_shim":3,"./common_shim":6,"./edge/edge_shim":7,"./firefox/firefox_shim":11,"./safari/safari_shim":14,"./utils":15}],3:[function(require,module,exports){
	/*
	 *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
	 *
	 *  Use of this source code is governed by a BSD-style license
	 *  that can be found in the LICENSE file in the root of the source
	 *  tree.
	 */
	/* eslint-env node */
	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.shimGetDisplayMedia = exports.shimGetUserMedia = undefined;
	
	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };
	
	var _getusermedia = require('./getusermedia');
	
	Object.defineProperty(exports, 'shimGetUserMedia', {
		enumerable: true,
		get: function get() {
			return _getusermedia.shimGetUserMedia;
		}
	});
	
	var _getdisplaymedia = require('./getdisplaymedia');
	
	Object.defineProperty(exports, 'shimGetDisplayMedia', {
		enumerable: true,
		get: function get() {
			return _getdisplaymedia.shimGetDisplayMedia;
		}
	});
	exports.shimMediaStream = shimMediaStream;
	exports.shimOnTrack = shimOnTrack;
	exports.shimGetSendersWithDtmf = shimGetSendersWithDtmf;
	exports.shimGetStats = shimGetStats;
	exports.shimSenderReceiverGetStats = shimSenderReceiverGetStats;
	exports.shimAddTrackRemoveTrackWithNative = shimAddTrackRemoveTrackWithNative;
	exports.shimAddTrackRemoveTrack = shimAddTrackRemoveTrack;
	exports.shimPeerConnection = shimPeerConnection;
	exports.fixNegotiationNeeded = fixNegotiationNeeded;
	
	var _utils = require('../utils.js');
	
	var utils = _interopRequireWildcard(_utils);
	
	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }
	
	function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
	
	function shimMediaStream(window) {
		window.MediaStream = window.MediaStream || window.webkitMediaStream;
	}
	
	function shimOnTrack(window) {
		if ((typeof window === 'undefined' ? 'undefined' : _typeof(window)) === 'object' && window.RTCPeerConnection && !('ontrack' in window.RTCPeerConnection.prototype)) {
			Object.defineProperty(window.RTCPeerConnection.prototype, 'ontrack', {
				get: function get() {
					return this._ontrack;
				},
				set: function set(f) {
					if (this._ontrack) {
						this.removeEventListener('track', this._ontrack);
					}
					this.addEventListener('track', this._ontrack = f);
				},
	
				enumerable: true,
				configurable: true
			});
			var origSetRemoteDescription = window.RTCPeerConnection.prototype.setRemoteDescription;
			window.RTCPeerConnection.prototype.setRemoteDescription = function setRemoteDescription() {
				var _this = this;
	
				if (!this._ontrackpoly) {
					this._ontrackpoly = function (e) {
						// onaddstream does not fire when a track is added to an existing
						// stream. But stream.onaddtrack is implemented so we use that.
						e.stream.addEventListener('addtrack', function (te) {
							var receiver = void 0;
							if (window.RTCPeerConnection.prototype.getReceivers) {
								receiver = _this.getReceivers().find(function (r) {
									return r.track && r.track.id === te.track.id;
								});
							} else {
								receiver = { track: te.track };
							}
	
							var event = new Event('track');
							event.track = te.track;
							event.receiver = receiver;
							event.transceiver = { receiver: receiver };
							event.streams = [e.stream];
							_this.dispatchEvent(event);
						});
						e.stream.getTracks().forEach(function (track) {
							var receiver = void 0;
							if (window.RTCPeerConnection.prototype.getReceivers) {
								receiver = _this.getReceivers().find(function (r) {
									return r.track && r.track.id === track.id;
								});
							} else {
								receiver = { track: track };
							}
							var event = new Event('track');
							event.track = track;
							event.receiver = receiver;
							event.transceiver = { receiver: receiver };
							event.streams = [e.stream];
							_this.dispatchEvent(event);
						});
					};
					this.addEventListener('addstream', this._ontrackpoly);
				}
				return origSetRemoteDescription.apply(this, arguments);
			};
		} else {
			// even if RTCRtpTransceiver is in window, it is only used and
			// emitted in unified-plan. Unfortunately this means we need
			// to unconditionally wrap the event.
			utils.wrapPeerConnectionEvent(window, 'track', function (e) {
				if (!e.transceiver) {
					Object.defineProperty(e, 'transceiver', { value: { receiver: e.receiver } });
				}
				return e;
			});
		}
	}
	
	function shimGetSendersWithDtmf(window) {
		// Overrides addTrack/removeTrack, depends on shimAddTrackRemoveTrack.
		if ((typeof window === 'undefined' ? 'undefined' : _typeof(window)) === 'object' && window.RTCPeerConnection && !('getSenders' in window.RTCPeerConnection.prototype) && 'createDTMFSender' in window.RTCPeerConnection.prototype) {
			var shimSenderWithDtmf = function shimSenderWithDtmf(pc, track) {
				return {
					track: track,
					get dtmf() {
						if (this._dtmf === undefined) {
							if (track.kind === 'audio') {
								this._dtmf = pc.createDTMFSender(track);
							} else {
								this._dtmf = null;
							}
						}
						return this._dtmf;
					},
					_pc: pc
				};
			};
	
			// augment addTrack when getSenders is not available.
			if (!window.RTCPeerConnection.prototype.getSenders) {
				window.RTCPeerConnection.prototype.getSenders = function getSenders() {
					this._senders = this._senders || [];
					return this._senders.slice(); // return a copy of the internal state.
				};
				var origAddTrack = window.RTCPeerConnection.prototype.addTrack;
				window.RTCPeerConnection.prototype.addTrack = function addTrack(track, stream) {
					var sender = origAddTrack.apply(this, arguments);
					if (!sender) {
						sender = shimSenderWithDtmf(this, track);
						this._senders.push(sender);
					}
					return sender;
				};
	
				var origRemoveTrack = window.RTCPeerConnection.prototype.removeTrack;
				window.RTCPeerConnection.prototype.removeTrack = function removeTrack(sender) {
					origRemoveTrack.apply(this, arguments);
					var idx = this._senders.indexOf(sender);
					if (idx !== -1) {
						this._senders.splice(idx, 1);
					}
				};
			}
			var origAddStream = window.RTCPeerConnection.prototype.addStream;
			window.RTCPeerConnection.prototype.addStream = function addStream(stream) {
				var _this2 = this;
	
				this._senders = this._senders || [];
				origAddStream.apply(this, [stream]);
				stream.getTracks().forEach(function (track) {
					_this2._senders.push(shimSenderWithDtmf(_this2, track));
				});
			};
	
			var origRemoveStream = window.RTCPeerConnection.prototype.removeStream;
			window.RTCPeerConnection.prototype.removeStream = function removeStream(stream) {
				var _this3 = this;
	
				this._senders = this._senders || [];
				origRemoveStream.apply(this, [stream]);
	
				stream.getTracks().forEach(function (track) {
					var sender = _this3._senders.find(function (s) {
						return s.track === track;
					});
					if (sender) {
						// remove sender
						_this3._senders.splice(_this3._senders.indexOf(sender), 1);
					}
				});
			};
		} else if ((typeof window === 'undefined' ? 'undefined' : _typeof(window)) === 'object' && window.RTCPeerConnection && 'getSenders' in window.RTCPeerConnection.prototype && 'createDTMFSender' in window.RTCPeerConnection.prototype && window.RTCRtpSender && !('dtmf' in window.RTCRtpSender.prototype)) {
			var origGetSenders = window.RTCPeerConnection.prototype.getSenders;
			window.RTCPeerConnection.prototype.getSenders = function getSenders() {
				var _this4 = this;
	
				var senders = origGetSenders.apply(this, []);
				senders.forEach(function (sender) {
					return sender._pc = _this4;
				});
				return senders;
			};
	
			Object.defineProperty(window.RTCRtpSender.prototype, 'dtmf', {
				get: function get() {
					if (this._dtmf === undefined) {
						if (this.track.kind === 'audio') {
							this._dtmf = this._pc.createDTMFSender(this.track);
						} else {
							this._dtmf = null;
						}
					}
					return this._dtmf;
				}
			});
		}
	}
	
	function shimGetStats(window) {
		if (!window.RTCPeerConnection) {
			return;
		}
	
		var origGetStats = window.RTCPeerConnection.prototype.getStats;
		window.RTCPeerConnection.prototype.getStats = function getStats() {
			var _this5 = this;
	
			var _arguments = Array.prototype.slice.call(arguments),
					selector = _arguments[0],
					onSucc = _arguments[1],
					onErr = _arguments[2];
	
			// If selector is a function then we are in the old style stats so just
			// pass back the original getStats format to avoid breaking old users.
	
	
			if (arguments.length > 0 && typeof selector === 'function') {
				return origGetStats.apply(this, arguments);
			}
	
			// When spec-style getStats is supported, return those when called with
			// either no arguments or the selector argument is null.
			if (origGetStats.length === 0 && (arguments.length === 0 || typeof selector !== 'function')) {
				return origGetStats.apply(this, []);
			}
	
			var fixChromeStats_ = function fixChromeStats_(response) {
				var standardReport = {};
				var reports = response.result();
				reports.forEach(function (report) {
					var standardStats = {
						id: report.id,
						timestamp: report.timestamp,
						type: {
							localcandidate: 'local-candidate',
							remotecandidate: 'remote-candidate'
						}[report.type] || report.type
					};
					report.names().forEach(function (name) {
						standardStats[name] = report.stat(name);
					});
					standardReport[standardStats.id] = standardStats;
				});
	
				return standardReport;
			};
	
			// shim getStats with maplike support
			var makeMapStats = function makeMapStats(stats) {
				return new Map(Object.keys(stats).map(function (key) {
					return [key, stats[key]];
				}));
			};
	
			if (arguments.length >= 2) {
				var successCallbackWrapper_ = function successCallbackWrapper_(response) {
					onSucc(makeMapStats(fixChromeStats_(response)));
				};
	
				return origGetStats.apply(this, [successCallbackWrapper_, selector]);
			}
	
			// promise-support
			return new Promise(function (resolve, reject) {
				origGetStats.apply(_this5, [function (response) {
					resolve(makeMapStats(fixChromeStats_(response)));
				}, reject]);
			}).then(onSucc, onErr);
		};
	}
	
	function shimSenderReceiverGetStats(window) {
		if (!((typeof window === 'undefined' ? 'undefined' : _typeof(window)) === 'object' && window.RTCPeerConnection && window.RTCRtpSender && window.RTCRtpReceiver)) {
			return;
		}
	
		// shim sender stats.
		if (!('getStats' in window.RTCRtpSender.prototype)) {
			var origGetSenders = window.RTCPeerConnection.prototype.getSenders;
			if (origGetSenders) {
				window.RTCPeerConnection.prototype.getSenders = function getSenders() {
					var _this6 = this;
	
					var senders = origGetSenders.apply(this, []);
					senders.forEach(function (sender) {
						return sender._pc = _this6;
					});
					return senders;
				};
			}
	
			var origAddTrack = window.RTCPeerConnection.prototype.addTrack;
			if (origAddTrack) {
				window.RTCPeerConnection.prototype.addTrack = function addTrack() {
					var sender = origAddTrack.apply(this, arguments);
					sender._pc = this;
					return sender;
				};
			}
			window.RTCRtpSender.prototype.getStats = function getStats() {
				var sender = this;
				return this._pc.getStats().then(function (result) {
					return (
						/* Note: this will include stats of all senders that
						 *   send a track with the same id as sender.track as
						 *   it is not possible to identify the RTCRtpSender.
						 */
						utils.filterStats(result, sender.track, true)
					);
				});
			};
		}
	
		// shim receiver stats.
		if (!('getStats' in window.RTCRtpReceiver.prototype)) {
			var origGetReceivers = window.RTCPeerConnection.prototype.getReceivers;
			if (origGetReceivers) {
				window.RTCPeerConnection.prototype.getReceivers = function getReceivers() {
					var _this7 = this;
	
					var receivers = origGetReceivers.apply(this, []);
					receivers.forEach(function (receiver) {
						return receiver._pc = _this7;
					});
					return receivers;
				};
			}
			utils.wrapPeerConnectionEvent(window, 'track', function (e) {
				e.receiver._pc = e.srcElement;
				return e;
			});
			window.RTCRtpReceiver.prototype.getStats = function getStats() {
				var receiver = this;
				return this._pc.getStats().then(function (result) {
					return utils.filterStats(result, receiver.track, false);
				});
			};
		}
	
		if (!('getStats' in window.RTCRtpSender.prototype && 'getStats' in window.RTCRtpReceiver.prototype)) {
			return;
		}
	
		// shim RTCPeerConnection.getStats(track).
		var origGetStats = window.RTCPeerConnection.prototype.getStats;
		window.RTCPeerConnection.prototype.getStats = function getStats() {
			if (arguments.length > 0 && arguments[0] instanceof window.MediaStreamTrack) {
				var track = arguments[0];
				var sender = void 0;
				var receiver = void 0;
				var err = void 0;
				this.getSenders().forEach(function (s) {
					if (s.track === track) {
						if (sender) {
							err = true;
						} else {
							sender = s;
						}
					}
				});
				this.getReceivers().forEach(function (r) {
					if (r.track === track) {
						if (receiver) {
							err = true;
						} else {
							receiver = r;
						}
					}
					return r.track === track;
				});
				if (err || sender && receiver) {
					return Promise.reject(new DOMException('There are more than one sender or receiver for the track.', 'InvalidAccessError'));
				} else if (sender) {
					return sender.getStats();
				} else if (receiver) {
					return receiver.getStats();
				}
				return Promise.reject(new DOMException('There is no sender or receiver for the track.', 'InvalidAccessError'));
			}
			return origGetStats.apply(this, arguments);
		};
	}
	
	function shimAddTrackRemoveTrackWithNative(window) {
		// shim addTrack/removeTrack with native variants in order to make
		// the interactions with legacy getLocalStreams behave as in other browsers.
		// Keeps a mapping stream.id => [stream, rtpsenders...]
		window.RTCPeerConnection.prototype.getLocalStreams = function getLocalStreams() {
			var _this8 = this;
	
			this._shimmedLocalStreams = this._shimmedLocalStreams || {};
			return Object.keys(this._shimmedLocalStreams).map(function (streamId) {
				return _this8._shimmedLocalStreams[streamId][0];
			});
		};
	
		var origAddTrack = window.RTCPeerConnection.prototype.addTrack;
		window.RTCPeerConnection.prototype.addTrack = function addTrack(track, stream) {
			if (!stream) {
				return origAddTrack.apply(this, arguments);
			}
			this._shimmedLocalStreams = this._shimmedLocalStreams || {};
	
			var sender = origAddTrack.apply(this, arguments);
			if (!this._shimmedLocalStreams[stream.id]) {
				this._shimmedLocalStreams[stream.id] = [stream, sender];
			} else if (this._shimmedLocalStreams[stream.id].indexOf(sender) === -1) {
				this._shimmedLocalStreams[stream.id].push(sender);
			}
			return sender;
		};
	
		var origAddStream = window.RTCPeerConnection.prototype.addStream;
		window.RTCPeerConnection.prototype.addStream = function addStream(stream) {
			var _this9 = this;
	
			this._shimmedLocalStreams = this._shimmedLocalStreams || {};
	
			stream.getTracks().forEach(function (track) {
				var alreadyExists = _this9.getSenders().find(function (s) {
					return s.track === track;
				});
				if (alreadyExists) {
					throw new DOMException('Track already exists.', 'InvalidAccessError');
				}
			});
			var existingSenders = this.getSenders();
			origAddStream.apply(this, arguments);
			var newSenders = this.getSenders().filter(function (newSender) {
				return existingSenders.indexOf(newSender) === -1;
			});
			this._shimmedLocalStreams[stream.id] = [stream].concat(newSenders);
		};
	
		var origRemoveStream = window.RTCPeerConnection.prototype.removeStream;
		window.RTCPeerConnection.prototype.removeStream = function removeStream(stream) {
			this._shimmedLocalStreams = this._shimmedLocalStreams || {};
			delete this._shimmedLocalStreams[stream.id];
			return origRemoveStream.apply(this, arguments);
		};
	
		var origRemoveTrack = window.RTCPeerConnection.prototype.removeTrack;
		window.RTCPeerConnection.prototype.removeTrack = function removeTrack(sender) {
			var _this10 = this;
	
			this._shimmedLocalStreams = this._shimmedLocalStreams || {};
			if (sender) {
				Object.keys(this._shimmedLocalStreams).forEach(function (streamId) {
					var idx = _this10._shimmedLocalStreams[streamId].indexOf(sender);
					if (idx !== -1) {
						_this10._shimmedLocalStreams[streamId].splice(idx, 1);
					}
					if (_this10._shimmedLocalStreams[streamId].length === 1) {
						delete _this10._shimmedLocalStreams[streamId];
					}
				});
			}
			return origRemoveTrack.apply(this, arguments);
		};
	}
	
	function shimAddTrackRemoveTrack(window) {
		if (!window.RTCPeerConnection) {
			return;
		}
		var browserDetails = utils.detectBrowser(window);
		// shim addTrack and removeTrack.
		if (window.RTCPeerConnection.prototype.addTrack && browserDetails.version >= 65) {
			return shimAddTrackRemoveTrackWithNative(window);
		}
	
		// also shim pc.getLocalStreams when addTrack is shimmed
		// to return the original streams.
		var origGetLocalStreams = window.RTCPeerConnection.prototype.getLocalStreams;
		window.RTCPeerConnection.prototype.getLocalStreams = function getLocalStreams() {
			var _this11 = this;
	
			var nativeStreams = origGetLocalStreams.apply(this);
			this._reverseStreams = this._reverseStreams || {};
			return nativeStreams.map(function (stream) {
				return _this11._reverseStreams[stream.id];
			});
		};
	
		var origAddStream = window.RTCPeerConnection.prototype.addStream;
		window.RTCPeerConnection.prototype.addStream = function addStream(stream) {
			var _this12 = this;
	
			this._streams = this._streams || {};
			this._reverseStreams = this._reverseStreams || {};
	
			stream.getTracks().forEach(function (track) {
				var alreadyExists = _this12.getSenders().find(function (s) {
					return s.track === track;
				});
				if (alreadyExists) {
					throw new DOMException('Track already exists.', 'InvalidAccessError');
				}
			});
			// Add identity mapping for consistency with addTrack.
			// Unless this is being used with a stream from addTrack.
			if (!this._reverseStreams[stream.id]) {
				var newStream = new window.MediaStream(stream.getTracks());
				this._streams[stream.id] = newStream;
				this._reverseStreams[newStream.id] = stream;
				stream = newStream;
			}
			origAddStream.apply(this, [stream]);
		};
	
		var origRemoveStream = window.RTCPeerConnection.prototype.removeStream;
		window.RTCPeerConnection.prototype.removeStream = function removeStream(stream) {
			this._streams = this._streams || {};
			this._reverseStreams = this._reverseStreams || {};
	
			origRemoveStream.apply(this, [this._streams[stream.id] || stream]);
			delete this._reverseStreams[this._streams[stream.id] ? this._streams[stream.id].id : stream.id];
			delete this._streams[stream.id];
		};
	
		window.RTCPeerConnection.prototype.addTrack = function addTrack(track, stream) {
			var _this13 = this;
	
			if (this.signalingState === 'closed') {
				throw new DOMException('The RTCPeerConnection\'s signalingState is \'closed\'.', 'InvalidStateError');
			}
			var streams = [].slice.call(arguments, 1);
			if (streams.length !== 1 || !streams[0].getTracks().find(function (t) {
				return t === track;
			})) {
				// this is not fully correct but all we can manage without
				// [[associated MediaStreams]] internal slot.
				throw new DOMException('The adapter.js addTrack polyfill only supports a single ' + ' stream which is associated with the specified track.', 'NotSupportedError');
			}
	
			var alreadyExists = this.getSenders().find(function (s) {
				return s.track === track;
			});
			if (alreadyExists) {
				throw new DOMException('Track already exists.', 'InvalidAccessError');
			}
	
			this._streams = this._streams || {};
			this._reverseStreams = this._reverseStreams || {};
			var oldStream = this._streams[stream.id];
			if (oldStream) {
				// this is using odd Chrome behaviour, use with caution:
				// https://bugs.chromium.org/p/webrtc/issues/detail?id=7815
				// Note: we rely on the high-level addTrack/dtmf shim to
				// create the sender with a dtmf sender.
				oldStream.addTrack(track);
	
				// Trigger ONN async.
				Promise.resolve().then(function () {
					_this13.dispatchEvent(new Event('negotiationneeded'));
				});
			} else {
				var newStream = new window.MediaStream([track]);
				this._streams[stream.id] = newStream;
				this._reverseStreams[newStream.id] = stream;
				this.addStream(newStream);
			}
			return this.getSenders().find(function (s) {
				return s.track === track;
			});
		};
	
		// replace the internal stream id with the external one and
		// vice versa.
		function replaceInternalStreamId(pc, description) {
			var sdp = description.sdp;
			Object.keys(pc._reverseStreams || []).forEach(function (internalId) {
				var externalStream = pc._reverseStreams[internalId];
				var internalStream = pc._streams[externalStream.id];
				sdp = sdp.replace(new RegExp(internalStream.id, 'g'), externalStream.id);
			});
			return new RTCSessionDescription({
				type: description.type,
				sdp: sdp
			});
		}
		function replaceExternalStreamId(pc, description) {
			var sdp = description.sdp;
			Object.keys(pc._reverseStreams || []).forEach(function (internalId) {
				var externalStream = pc._reverseStreams[internalId];
				var internalStream = pc._streams[externalStream.id];
				sdp = sdp.replace(new RegExp(externalStream.id, 'g'), internalStream.id);
			});
			return new RTCSessionDescription({
				type: description.type,
				sdp: sdp
			});
		}
		['createOffer', 'createAnswer'].forEach(function (method) {
			var nativeMethod = window.RTCPeerConnection.prototype[method];
			var methodObj = _defineProperty({}, method, function () {
				var _this14 = this;
	
				var args = arguments;
				var isLegacyCall = arguments.length && typeof arguments[0] === 'function';
				if (isLegacyCall) {
					return nativeMethod.apply(this, [function (description) {
						var desc = replaceInternalStreamId(_this14, description);
						args[0].apply(null, [desc]);
					}, function (err) {
						if (args[1]) {
							args[1].apply(null, err);
						}
					}, arguments[2]]);
				}
				return nativeMethod.apply(this, arguments).then(function (description) {
					return replaceInternalStreamId(_this14, description);
				});
			});
			window.RTCPeerConnection.prototype[method] = methodObj[method];
		});
	
		var origSetLocalDescription = window.RTCPeerConnection.prototype.setLocalDescription;
		window.RTCPeerConnection.prototype.setLocalDescription = function setLocalDescription() {
			if (!arguments.length || !arguments[0].type) {
				return origSetLocalDescription.apply(this, arguments);
			}
			arguments[0] = replaceExternalStreamId(this, arguments[0]);
			return origSetLocalDescription.apply(this, arguments);
		};
	
		// TODO: mangle getStats: https://w3c.github.io/webrtc-stats/#dom-rtcmediastreamstats-streamidentifier
	
		var origLocalDescription = Object.getOwnPropertyDescriptor(window.RTCPeerConnection.prototype, 'localDescription');
		Object.defineProperty(window.RTCPeerConnection.prototype, 'localDescription', {
			get: function get() {
				var description = origLocalDescription.get.apply(this);
				if (description.type === '') {
					return description;
				}
				return replaceInternalStreamId(this, description);
			}
		});
	
		window.RTCPeerConnection.prototype.removeTrack = function removeTrack(sender) {
			var _this15 = this;
	
			if (this.signalingState === 'closed') {
				throw new DOMException('The RTCPeerConnection\'s signalingState is \'closed\'.', 'InvalidStateError');
			}
			// We can not yet check for sender instanceof RTCRtpSender
			// since we shim RTPSender. So we check if sender._pc is set.
			if (!sender._pc) {
				throw new DOMException('Argument 1 of RTCPeerConnection.removeTrack ' + 'does not implement interface RTCRtpSender.', 'TypeError');
			}
			var isLocal = sender._pc === this;
			if (!isLocal) {
				throw new DOMException('Sender was not created by this connection.', 'InvalidAccessError');
			}
	
			// Search for the native stream the senders track belongs to.
			this._streams = this._streams || {};
			var stream = void 0;
			Object.keys(this._streams).forEach(function (streamid) {
				var hasTrack = _this15._streams[streamid].getTracks().find(function (track) {
					return sender.track === track;
				});
				if (hasTrack) {
					stream = _this15._streams[streamid];
				}
			});
	
			if (stream) {
				if (stream.getTracks().length === 1) {
					// if this is the last track of the stream, remove the stream. This
					// takes care of any shimmed _senders.
					this.removeStream(this._reverseStreams[stream.id]);
				} else {
					// relying on the same odd chrome behaviour as above.
					stream.removeTrack(sender.track);
				}
				this.dispatchEvent(new Event('negotiationneeded'));
			}
		};
	}
	
	function shimPeerConnection(window) {
		var browserDetails = utils.detectBrowser(window);
	
		if (!window.RTCPeerConnection && window.webkitRTCPeerConnection) {
			// very basic support for old versions.
			window.RTCPeerConnection = window.webkitRTCPeerConnection;
		}
		if (!window.RTCPeerConnection) {
			return;
		}
	
		var addIceCandidateNullSupported = window.RTCPeerConnection.prototype.addIceCandidate.length === 0;
	
		// shim implicit creation of RTCSessionDescription/RTCIceCandidate
		if (browserDetails.version < 53) {
			['setLocalDescription', 'setRemoteDescription', 'addIceCandidate'].forEach(function (method) {
				var nativeMethod = window.RTCPeerConnection.prototype[method];
				var methodObj = _defineProperty({}, method, function () {
					arguments[0] = new (method === 'addIceCandidate' ? window.RTCIceCandidate : window.RTCSessionDescription)(arguments[0]);
					return nativeMethod.apply(this, arguments);
				});
				window.RTCPeerConnection.prototype[method] = methodObj[method];
			});
		}
	
		// support for addIceCandidate(null or undefined)
		var nativeAddIceCandidate = window.RTCPeerConnection.prototype.addIceCandidate;
		window.RTCPeerConnection.prototype.addIceCandidate = function addIceCandidate() {
			if (!addIceCandidateNullSupported && !arguments[0]) {
				if (arguments[1]) {
					arguments[1].apply(null);
				}
				return Promise.resolve();
			}
			// Firefox 68+ emits and processes {candidate: "", ...}, ignore
			// in older versions. Native support planned for Chrome M77.
			if (browserDetails.version < 78 && arguments[0] && arguments[0].candidate === '') {
				return Promise.resolve();
			}
			return nativeAddIceCandidate.apply(this, arguments);
		};
	}
	
	// Attempt to fix ONN in plan-b mode.
	function fixNegotiationNeeded(window) {
		var browserDetails = utils.detectBrowser(window);
		utils.wrapPeerConnectionEvent(window, 'negotiationneeded', function (e) {
			var pc = e.target;
			if (browserDetails.version < 72 || pc.getConfiguration && pc.getConfiguration().sdpSemantics === 'plan-b') {
				if (pc.signalingState !== 'stable') {
					return;
				}
			}
			return e;
		});
	}
	
	},{"../utils.js":15,"./getdisplaymedia":4,"./getusermedia":5}],4:[function(require,module,exports){
	/*
	 *  Copyright (c) 2018 The adapter.js project authors. All Rights Reserved.
	 *
	 *  Use of this source code is governed by a BSD-style license
	 *  that can be found in the LICENSE file in the root of the source
	 *  tree.
	 */
	/* eslint-env node */
	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.shimGetDisplayMedia = shimGetDisplayMedia;
	function shimGetDisplayMedia(window, getSourceId) {
		if (window.navigator.mediaDevices && 'getDisplayMedia' in window.navigator.mediaDevices) {
			return;
		}
		if (!window.navigator.mediaDevices) {
			return;
		}
		// getSourceId is a function that returns a promise resolving with
		// the sourceId of the screen/window/tab to be shared.
		if (typeof getSourceId !== 'function') {
			console.error('shimGetDisplayMedia: getSourceId argument is not ' + 'a function');
			return;
		}
		window.navigator.mediaDevices.getDisplayMedia = function getDisplayMedia(constraints) {
			return getSourceId(constraints).then(function (sourceId) {
				var widthSpecified = constraints.video && constraints.video.width;
				var heightSpecified = constraints.video && constraints.video.height;
				var frameRateSpecified = constraints.video && constraints.video.frameRate;
				constraints.video = {
					mandatory: {
						chromeMediaSource: 'desktop',
						chromeMediaSourceId: sourceId,
						maxFrameRate: frameRateSpecified || 3
					}
				};
				if (widthSpecified) {
					constraints.video.mandatory.maxWidth = widthSpecified;
				}
				if (heightSpecified) {
					constraints.video.mandatory.maxHeight = heightSpecified;
				}
				return window.navigator.mediaDevices.getUserMedia(constraints);
			});
		};
	}
	
	},{}],5:[function(require,module,exports){
	/*
	 *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
	 *
	 *  Use of this source code is governed by a BSD-style license
	 *  that can be found in the LICENSE file in the root of the source
	 *  tree.
	 */
	/* eslint-env node */
	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	
	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };
	
	exports.shimGetUserMedia = shimGetUserMedia;
	
	var _utils = require('../utils.js');
	
	var utils = _interopRequireWildcard(_utils);
	
	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }
	
	var logging = utils.log;
	
	function shimGetUserMedia(window) {
		var navigator = window && window.navigator;
	
		if (!navigator.mediaDevices) {
			return;
		}
	
		var browserDetails = utils.detectBrowser(window);
	
		var constraintsToChrome_ = function constraintsToChrome_(c) {
			if ((typeof c === 'undefined' ? 'undefined' : _typeof(c)) !== 'object' || c.mandatory || c.optional) {
				return c;
			}
			var cc = {};
			Object.keys(c).forEach(function (key) {
				if (key === 'require' || key === 'advanced' || key === 'mediaSource') {
					return;
				}
				var r = _typeof(c[key]) === 'object' ? c[key] : { ideal: c[key] };
				if (r.exact !== undefined && typeof r.exact === 'number') {
					r.min = r.max = r.exact;
				}
				var oldname_ = function oldname_(prefix, name) {
					if (prefix) {
						return prefix + name.charAt(0).toUpperCase() + name.slice(1);
					}
					return name === 'deviceId' ? 'sourceId' : name;
				};
				if (r.ideal !== undefined) {
					cc.optional = cc.optional || [];
					var oc = {};
					if (typeof r.ideal === 'number') {
						oc[oldname_('min', key)] = r.ideal;
						cc.optional.push(oc);
						oc = {};
						oc[oldname_('max', key)] = r.ideal;
						cc.optional.push(oc);
					} else {
						oc[oldname_('', key)] = r.ideal;
						cc.optional.push(oc);
					}
				}
				if (r.exact !== undefined && typeof r.exact !== 'number') {
					cc.mandatory = cc.mandatory || {};
					cc.mandatory[oldname_('', key)] = r.exact;
				} else {
					['min', 'max'].forEach(function (mix) {
						if (r[mix] !== undefined) {
							cc.mandatory = cc.mandatory || {};
							cc.mandatory[oldname_(mix, key)] = r[mix];
						}
					});
				}
			});
			if (c.advanced) {
				cc.optional = (cc.optional || []).concat(c.advanced);
			}
			return cc;
		};
	
		var shimConstraints_ = function shimConstraints_(constraints, func) {
			if (browserDetails.version >= 61) {
				return func(constraints);
			}
			constraints = JSON.parse(JSON.stringify(constraints));
			if (constraints && _typeof(constraints.audio) === 'object') {
				var remap = function remap(obj, a, b) {
					if (a in obj && !(b in obj)) {
						obj[b] = obj[a];
						delete obj[a];
					}
				};
				constraints = JSON.parse(JSON.stringify(constraints));
				remap(constraints.audio, 'autoGainControl', 'googAutoGainControl');
				remap(constraints.audio, 'noiseSuppression', 'googNoiseSuppression');
				constraints.audio = constraintsToChrome_(constraints.audio);
			}
			if (constraints && _typeof(constraints.video) === 'object') {
				// Shim facingMode for mobile & surface pro.
				var face = constraints.video.facingMode;
				face = face && ((typeof face === 'undefined' ? 'undefined' : _typeof(face)) === 'object' ? face : { ideal: face });
				var getSupportedFacingModeLies = browserDetails.version < 66;
	
				if (face && (face.exact === 'user' || face.exact === 'environment' || face.ideal === 'user' || face.ideal === 'environment') && !(navigator.mediaDevices.getSupportedConstraints && navigator.mediaDevices.getSupportedConstraints().facingMode && !getSupportedFacingModeLies)) {
					delete constraints.video.facingMode;
					var matches = void 0;
					if (face.exact === 'environment' || face.ideal === 'environment') {
						matches = ['back', 'rear'];
					} else if (face.exact === 'user' || face.ideal === 'user') {
						matches = ['front'];
					}
					if (matches) {
						// Look for matches in label, or use last cam for back (typical).
						return navigator.mediaDevices.enumerateDevices().then(function (devices) {
							devices = devices.filter(function (d) {
								return d.kind === 'videoinput';
							});
							var dev = devices.find(function (d) {
								return matches.some(function (match) {
									return d.label.toLowerCase().includes(match);
								});
							});
							if (!dev && devices.length && matches.includes('back')) {
								dev = devices[devices.length - 1]; // more likely the back cam
							}
							if (dev) {
								constraints.video.deviceId = face.exact ? { exact: dev.deviceId } : { ideal: dev.deviceId };
							}
							constraints.video = constraintsToChrome_(constraints.video);
							logging('chrome: ' + JSON.stringify(constraints));
							return func(constraints);
						});
					}
				}
				constraints.video = constraintsToChrome_(constraints.video);
			}
			logging('chrome: ' + JSON.stringify(constraints));
			return func(constraints);
		};
	
		var shimError_ = function shimError_(e) {
			if (browserDetails.version >= 64) {
				return e;
			}
			return {
				name: {
					PermissionDeniedError: 'NotAllowedError',
					PermissionDismissedError: 'NotAllowedError',
					InvalidStateError: 'NotAllowedError',
					DevicesNotFoundError: 'NotFoundError',
					ConstraintNotSatisfiedError: 'OverconstrainedError',
					TrackStartError: 'NotReadableError',
					MediaDeviceFailedDueToShutdown: 'NotAllowedError',
					MediaDeviceKillSwitchOn: 'NotAllowedError',
					TabCaptureError: 'AbortError',
					ScreenCaptureError: 'AbortError',
					DeviceCaptureError: 'AbortError'
				}[e.name] || e.name,
				message: e.message,
				constraint: e.constraint || e.constraintName,
				toString: function toString() {
					return this.name + (this.message && ': ') + this.message;
				}
			};
		};
	
		var getUserMedia_ = function getUserMedia_(constraints, onSuccess, onError) {
			shimConstraints_(constraints, function (c) {
				navigator.webkitGetUserMedia(c, onSuccess, function (e) {
					if (onError) {
						onError(shimError_(e));
					}
				});
			});
		};
		navigator.getUserMedia = getUserMedia_.bind(navigator);
	
		// Even though Chrome 45 has navigator.mediaDevices and a getUserMedia
		// function which returns a Promise, it does not accept spec-style
		// constraints.
		if (navigator.mediaDevices.getUserMedia) {
			var origGetUserMedia = navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);
			navigator.mediaDevices.getUserMedia = function (cs) {
				return shimConstraints_(cs, function (c) {
					return origGetUserMedia(c).then(function (stream) {
						if (c.audio && !stream.getAudioTracks().length || c.video && !stream.getVideoTracks().length) {
							stream.getTracks().forEach(function (track) {
								track.stop();
							});
							throw new DOMException('', 'NotFoundError');
						}
						return stream;
					}, function (e) {
						return Promise.reject(shimError_(e));
					});
				});
			};
		}
	}
	
	},{"../utils.js":15}],6:[function(require,module,exports){
	/*
	 *  Copyright (c) 2017 The WebRTC project authors. All Rights Reserved.
	 *
	 *  Use of this source code is governed by a BSD-style license
	 *  that can be found in the LICENSE file in the root of the source
	 *  tree.
	 */
	/* eslint-env node */
	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	
	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };
	
	exports.shimRTCIceCandidate = shimRTCIceCandidate;
	exports.shimMaxMessageSize = shimMaxMessageSize;
	exports.shimSendThrowTypeError = shimSendThrowTypeError;
	exports.shimConnectionState = shimConnectionState;
	exports.removeAllowExtmapMixed = removeAllowExtmapMixed;
	
	var _sdp = require('sdp');
	
	var _sdp2 = _interopRequireDefault(_sdp);
	
	var _utils = require('./utils');
	
	var utils = _interopRequireWildcard(_utils);
	
	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function shimRTCIceCandidate(window) {
		// foundation is arbitrarily chosen as an indicator for full support for
		// https://w3c.github.io/webrtc-pc/#rtcicecandidate-interface
		if (!window.RTCIceCandidate || window.RTCIceCandidate && 'foundation' in window.RTCIceCandidate.prototype) {
			return;
		}
	
		var NativeRTCIceCandidate = window.RTCIceCandidate;
		window.RTCIceCandidate = function RTCIceCandidate(args) {
			// Remove the a= which shouldn't be part of the candidate string.
			if ((typeof args === 'undefined' ? 'undefined' : _typeof(args)) === 'object' && args.candidate && args.candidate.indexOf('a=') === 0) {
				args = JSON.parse(JSON.stringify(args));
				args.candidate = args.candidate.substr(2);
			}
	
			if (args.candidate && args.candidate.length) {
				// Augment the native candidate with the parsed fields.
				var nativeCandidate = new NativeRTCIceCandidate(args);
				var parsedCandidate = _sdp2.default.parseCandidate(args.candidate);
				var augmentedCandidate = Object.assign(nativeCandidate, parsedCandidate);
	
				// Add a serializer that does not serialize the extra attributes.
				augmentedCandidate.toJSON = function toJSON() {
					return {
						candidate: augmentedCandidate.candidate,
						sdpMid: augmentedCandidate.sdpMid,
						sdpMLineIndex: augmentedCandidate.sdpMLineIndex,
						usernameFragment: augmentedCandidate.usernameFragment
					};
				};
				return augmentedCandidate;
			}
			return new NativeRTCIceCandidate(args);
		};
		window.RTCIceCandidate.prototype = NativeRTCIceCandidate.prototype;
	
		// Hook up the augmented candidate in onicecandidate and
		// addEventListener('icecandidate', ...)
		utils.wrapPeerConnectionEvent(window, 'icecandidate', function (e) {
			if (e.candidate) {
				Object.defineProperty(e, 'candidate', {
					value: new window.RTCIceCandidate(e.candidate),
					writable: 'false'
				});
			}
			return e;
		});
	}
	
	function shimMaxMessageSize(window) {
		if (!window.RTCPeerConnection) {
			return;
		}
		var browserDetails = utils.detectBrowser(window);
	
		if (!('sctp' in window.RTCPeerConnection.prototype)) {
			Object.defineProperty(window.RTCPeerConnection.prototype, 'sctp', {
				get: function get() {
					return typeof this._sctp === 'undefined' ? null : this._sctp;
				}
			});
		}
	
		var sctpInDescription = function sctpInDescription(description) {
			if (!description || !description.sdp) {
				return false;
			}
			var sections = _sdp2.default.splitSections(description.sdp);
			sections.shift();
			return sections.some(function (mediaSection) {
				var mLine = _sdp2.default.parseMLine(mediaSection);
				return mLine && mLine.kind === 'application' && mLine.protocol.indexOf('SCTP') !== -1;
			});
		};
	
		var getRemoteFirefoxVersion = function getRemoteFirefoxVersion(description) {
			// TODO: Is there a better solution for detecting Firefox?
			var match = description.sdp.match(/mozilla...THIS_IS_SDPARTA-(\d+)/);
			if (match === null || match.length < 2) {
				return -1;
			}
			var version = parseInt(match[1], 10);
			// Test for NaN (yes, this is ugly)
			return version !== version ? -1 : version;
		};
	
		var getCanSendMaxMessageSize = function getCanSendMaxMessageSize(remoteIsFirefox) {
			// Every implementation we know can send at least 64 KiB.
			// Note: Although Chrome is technically able to send up to 256 KiB, the
			//       data does not reach the other peer reliably.
			//       See: https://bugs.chromium.org/p/webrtc/issues/detail?id=8419
			var canSendMaxMessageSize = 65536;
			if (browserDetails.browser === 'firefox') {
				if (browserDetails.version < 57) {
					if (remoteIsFirefox === -1) {
						// FF < 57 will send in 16 KiB chunks using the deprecated PPID
						// fragmentation.
						canSendMaxMessageSize = 16384;
					} else {
						// However, other FF (and RAWRTC) can reassemble PPID-fragmented
						// messages. Thus, supporting ~2 GiB when sending.
						canSendMaxMessageSize = 2147483637;
					}
				} else if (browserDetails.version < 60) {
					// Currently, all FF >= 57 will reset the remote maximum message size
					// to the default value when a data channel is created at a later
					// stage. :(
					// See: https://bugzilla.mozilla.org/show_bug.cgi?id=1426831
					canSendMaxMessageSize = browserDetails.version === 57 ? 65535 : 65536;
				} else {
					// FF >= 60 supports sending ~2 GiB
					canSendMaxMessageSize = 2147483637;
				}
			}
			return canSendMaxMessageSize;
		};
	
		var getMaxMessageSize = function getMaxMessageSize(description, remoteIsFirefox) {
			// Note: 65536 bytes is the default value from the SDP spec. Also,
			//       every implementation we know supports receiving 65536 bytes.
			var maxMessageSize = 65536;
	
			// FF 57 has a slightly incorrect default remote max message size, so
			// we need to adjust it here to avoid a failure when sending.
			// See: https://bugzilla.mozilla.org/show_bug.cgi?id=1425697
			if (browserDetails.browser === 'firefox' && browserDetails.version === 57) {
				maxMessageSize = 65535;
			}
	
			var match = _sdp2.default.matchPrefix(description.sdp, 'a=max-message-size:');
			if (match.length > 0) {
				maxMessageSize = parseInt(match[0].substr(19), 10);
			} else if (browserDetails.browser === 'firefox' && remoteIsFirefox !== -1) {
				// If the maximum message size is not present in the remote SDP and
				// both local and remote are Firefox, the remote peer can receive
				// ~2 GiB.
				maxMessageSize = 2147483637;
			}
			return maxMessageSize;
		};
	
		var origSetRemoteDescription = window.RTCPeerConnection.prototype.setRemoteDescription;
		window.RTCPeerConnection.prototype.setRemoteDescription = function setRemoteDescription() {
			this._sctp = null;
			// Chrome decided to not expose .sctp in plan-b mode.
			// As usual, adapter.js has to do an 'ugly worakaround'
			// to cover up the mess.
			if (browserDetails.browser === 'chrome' && browserDetails.version >= 76) {
				var _getConfiguration = this.getConfiguration(),
						sdpSemantics = _getConfiguration.sdpSemantics;
	
				if (sdpSemantics === 'plan-b') {
					Object.defineProperty(this, 'sctp', {
						get: function get() {
							return typeof this._sctp === 'undefined' ? null : this._sctp;
						},
	
						enumerable: true,
						configurable: true
					});
				}
			}
	
			if (sctpInDescription(arguments[0])) {
				// Check if the remote is FF.
				var isFirefox = getRemoteFirefoxVersion(arguments[0]);
	
				// Get the maximum message size the local peer is capable of sending
				var canSendMMS = getCanSendMaxMessageSize(isFirefox);
	
				// Get the maximum message size of the remote peer.
				var remoteMMS = getMaxMessageSize(arguments[0], isFirefox);
	
				// Determine final maximum message size
				var maxMessageSize = void 0;
				if (canSendMMS === 0 && remoteMMS === 0) {
					maxMessageSize = Number.POSITIVE_INFINITY;
				} else if (canSendMMS === 0 || remoteMMS === 0) {
					maxMessageSize = Math.max(canSendMMS, remoteMMS);
				} else {
					maxMessageSize = Math.min(canSendMMS, remoteMMS);
				}
	
				// Create a dummy RTCSctpTransport object and the 'maxMessageSize'
				// attribute.
				var sctp = {};
				Object.defineProperty(sctp, 'maxMessageSize', {
					get: function get() {
						return maxMessageSize;
					}
				});
				this._sctp = sctp;
			}
	
			return origSetRemoteDescription.apply(this, arguments);
		};
	}
	
	function shimSendThrowTypeError(window) {
		if (!(window.RTCPeerConnection && 'createDataChannel' in window.RTCPeerConnection.prototype)) {
			return;
		}
	
		// Note: Although Firefox >= 57 has a native implementation, the maximum
		//       message size can be reset for all data channels at a later stage.
		//       See: https://bugzilla.mozilla.org/show_bug.cgi?id=1426831
	
		function wrapDcSend(dc, pc) {
			var origDataChannelSend = dc.send;
			dc.send = function send() {
				var data = arguments[0];
				var length = data.length || data.size || data.byteLength;
				if (dc.readyState === 'open' && pc.sctp && length > pc.sctp.maxMessageSize) {
					throw new TypeError('Message too large (can send a maximum of ' + pc.sctp.maxMessageSize + ' bytes)');
				}
				return origDataChannelSend.apply(dc, arguments);
			};
		}
		var origCreateDataChannel = window.RTCPeerConnection.prototype.createDataChannel;
		window.RTCPeerConnection.prototype.createDataChannel = function createDataChannel() {
			var dataChannel = origCreateDataChannel.apply(this, arguments);
			wrapDcSend(dataChannel, this);
			return dataChannel;
		};
		utils.wrapPeerConnectionEvent(window, 'datachannel', function (e) {
			wrapDcSend(e.channel, e.target);
			return e;
		});
	}
	
	/* shims RTCConnectionState by pretending it is the same as iceConnectionState.
	 * See https://bugs.chromium.org/p/webrtc/issues/detail?id=6145#c12
	 * for why this is a valid hack in Chrome. In Firefox it is slightly incorrect
	 * since DTLS failures would be hidden. See
	 * https://bugzilla.mozilla.org/show_bug.cgi?id=1265827
	 * for the Firefox tracking bug.
	 */
	function shimConnectionState(window) {
		if (!window.RTCPeerConnection || 'connectionState' in window.RTCPeerConnection.prototype) {
			return;
		}
		var proto = window.RTCPeerConnection.prototype;
		Object.defineProperty(proto, 'connectionState', {
			get: function get() {
				return {
					completed: 'connected',
					checking: 'connecting'
				}[this.iceConnectionState] || this.iceConnectionState;
			},
	
			enumerable: true,
			configurable: true
		});
		Object.defineProperty(proto, 'onconnectionstatechange', {
			get: function get() {
				return this._onconnectionstatechange || null;
			},
			set: function set(cb) {
				if (this._onconnectionstatechange) {
					this.removeEventListener('connectionstatechange', this._onconnectionstatechange);
					delete this._onconnectionstatechange;
				}
				if (cb) {
					this.addEventListener('connectionstatechange', this._onconnectionstatechange = cb);
				}
			},
	
			enumerable: true,
			configurable: true
		});
	
		['setLocalDescription', 'setRemoteDescription'].forEach(function (method) {
			var origMethod = proto[method];
			proto[method] = function () {
				if (!this._connectionstatechangepoly) {
					this._connectionstatechangepoly = function (e) {
						var pc = e.target;
						if (pc._lastConnectionState !== pc.connectionState) {
							pc._lastConnectionState = pc.connectionState;
							var newEvent = new Event('connectionstatechange', e);
							pc.dispatchEvent(newEvent);
						}
						return e;
					};
					this.addEventListener('iceconnectionstatechange', this._connectionstatechangepoly);
				}
				return origMethod.apply(this, arguments);
			};
		});
	}
	
	function removeAllowExtmapMixed(window) {
		/* remove a=extmap-allow-mixed for webrtc.org < M71 */
		if (!window.RTCPeerConnection) {
			return;
		}
		var browserDetails = utils.detectBrowser(window);
		if (browserDetails.browser === 'chrome' && browserDetails.version >= 71) {
			return;
		}
		if (browserDetails.browser === 'safari' && browserDetails.version >= 605) {
			return;
		}
		var nativeSRD = window.RTCPeerConnection.prototype.setRemoteDescription;
		window.RTCPeerConnection.prototype.setRemoteDescription = function setRemoteDescription(desc) {
			if (desc && desc.sdp && desc.sdp.indexOf('\na=extmap-allow-mixed') !== -1) {
				desc.sdp = desc.sdp.split('\n').filter(function (line) {
					return line.trim() !== 'a=extmap-allow-mixed';
				}).join('\n');
			}
			return nativeSRD.apply(this, arguments);
		};
	}
	
	},{"./utils":15,"sdp":17}],7:[function(require,module,exports){
	/*
	 *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
	 *
	 *  Use of this source code is governed by a BSD-style license
	 *  that can be found in the LICENSE file in the root of the source
	 *  tree.
	 */
	/* eslint-env node */
	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.shimGetDisplayMedia = exports.shimGetUserMedia = undefined;
	
	var _getusermedia = require('./getusermedia');
	
	Object.defineProperty(exports, 'shimGetUserMedia', {
		enumerable: true,
		get: function get() {
			return _getusermedia.shimGetUserMedia;
		}
	});
	
	var _getdisplaymedia = require('./getdisplaymedia');
	
	Object.defineProperty(exports, 'shimGetDisplayMedia', {
		enumerable: true,
		get: function get() {
			return _getdisplaymedia.shimGetDisplayMedia;
		}
	});
	exports.shimPeerConnection = shimPeerConnection;
	exports.shimReplaceTrack = shimReplaceTrack;
	
	var _utils = require('../utils');
	
	var utils = _interopRequireWildcard(_utils);
	
	var _filtericeservers = require('./filtericeservers');
	
	var _rtcpeerconnectionShim = require('rtcpeerconnection-shim');
	
	var _rtcpeerconnectionShim2 = _interopRequireDefault(_rtcpeerconnectionShim);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }
	
	function shimPeerConnection(window) {
		var browserDetails = utils.detectBrowser(window);
	
		if (window.RTCIceGatherer) {
			if (!window.RTCIceCandidate) {
				window.RTCIceCandidate = function RTCIceCandidate(args) {
					return args;
				};
			}
			if (!window.RTCSessionDescription) {
				window.RTCSessionDescription = function RTCSessionDescription(args) {
					return args;
				};
			}
			// this adds an additional event listener to MediaStrackTrack that signals
			// when a tracks enabled property was changed. Workaround for a bug in
			// addStream, see below. No longer required in 15025+
			if (browserDetails.version < 15025) {
				var origMSTEnabled = Object.getOwnPropertyDescriptor(window.MediaStreamTrack.prototype, 'enabled');
				Object.defineProperty(window.MediaStreamTrack.prototype, 'enabled', {
					set: function set(value) {
						origMSTEnabled.set.call(this, value);
						var ev = new Event('enabled');
						ev.enabled = value;
						this.dispatchEvent(ev);
					}
				});
			}
		}
	
		// ORTC defines the DTMF sender a bit different.
		// https://github.com/w3c/ortc/issues/714
		if (window.RTCRtpSender && !('dtmf' in window.RTCRtpSender.prototype)) {
			Object.defineProperty(window.RTCRtpSender.prototype, 'dtmf', {
				get: function get() {
					if (this._dtmf === undefined) {
						if (this.track.kind === 'audio') {
							this._dtmf = new window.RTCDtmfSender(this);
						} else if (this.track.kind === 'video') {
							this._dtmf = null;
						}
					}
					return this._dtmf;
				}
			});
		}
		// Edge currently only implements the RTCDtmfSender, not the
		// RTCDTMFSender alias. See http://draft.ortc.org/#rtcdtmfsender2*
		if (window.RTCDtmfSender && !window.RTCDTMFSender) {
			window.RTCDTMFSender = window.RTCDtmfSender;
		}
	
		var RTCPeerConnectionShim = (0, _rtcpeerconnectionShim2.default)(window, browserDetails.version);
		window.RTCPeerConnection = function RTCPeerConnection(config) {
			if (config && config.iceServers) {
				config.iceServers = (0, _filtericeservers.filterIceServers)(config.iceServers, browserDetails.version);
				utils.log('ICE servers after filtering:', config.iceServers);
			}
			return new RTCPeerConnectionShim(config);
		};
		window.RTCPeerConnection.prototype = RTCPeerConnectionShim.prototype;
	}
	
	function shimReplaceTrack(window) {
		// ORTC has replaceTrack -- https://github.com/w3c/ortc/issues/614
		if (window.RTCRtpSender && !('replaceTrack' in window.RTCRtpSender.prototype)) {
			window.RTCRtpSender.prototype.replaceTrack = window.RTCRtpSender.prototype.setTrack;
		}
	}
	
	},{"../utils":15,"./filtericeservers":8,"./getdisplaymedia":9,"./getusermedia":10,"rtcpeerconnection-shim":16}],8:[function(require,module,exports){
	/*
	 *  Copyright (c) 2018 The WebRTC project authors. All Rights Reserved.
	 *
	 *  Use of this source code is governed by a BSD-style license
	 *  that can be found in the LICENSE file in the root of the source
	 *  tree.
	 */
	/* eslint-env node */
	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.filterIceServers = filterIceServers;
	
	var _utils = require('../utils');
	
	var utils = _interopRequireWildcard(_utils);
	
	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }
	
	// Edge does not like
	// 1) stun: filtered after 14393 unless ?transport=udp is present
	// 2) turn: that does not have all of turn:host:port?transport=udp
	// 3) turn: with ipv6 addresses
	// 4) turn: occurring muliple times
	function filterIceServers(iceServers, edgeVersion) {
		var hasTurn = false;
		iceServers = JSON.parse(JSON.stringify(iceServers));
		return iceServers.filter(function (server) {
			if (server && (server.urls || server.url)) {
				var urls = server.urls || server.url;
				if (server.url && !server.urls) {
					utils.deprecated('RTCIceServer.url', 'RTCIceServer.urls');
				}
				var isString = typeof urls === 'string';
				if (isString) {
					urls = [urls];
				}
				urls = urls.filter(function (url) {
					// filter STUN unconditionally.
					if (url.indexOf('stun:') === 0) {
						return false;
					}
	
					var validTurn = url.startsWith('turn') && !url.startsWith('turn:[') && url.includes('transport=udp');
					if (validTurn && !hasTurn) {
						hasTurn = true;
						return true;
					}
					return validTurn && !hasTurn;
				});
	
				delete server.url;
				server.urls = isString ? urls[0] : urls;
				return !!urls.length;
			}
		});
	}
	
	},{"../utils":15}],9:[function(require,module,exports){
	/*
	 *  Copyright (c) 2018 The adapter.js project authors. All Rights Reserved.
	 *
	 *  Use of this source code is governed by a BSD-style license
	 *  that can be found in the LICENSE file in the root of the source
	 *  tree.
	 */
	/* eslint-env node */
	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.shimGetDisplayMedia = shimGetDisplayMedia;
	function shimGetDisplayMedia(window) {
		if (!('getDisplayMedia' in window.navigator)) {
			return;
		}
		if (!window.navigator.mediaDevices) {
			return;
		}
		if (window.navigator.mediaDevices && 'getDisplayMedia' in window.navigator.mediaDevices) {
			return;
		}
		window.navigator.mediaDevices.getDisplayMedia = window.navigator.getDisplayMedia.bind(window.navigator);
	}
	
	},{}],10:[function(require,module,exports){
	/*
	 *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
	 *
	 *  Use of this source code is governed by a BSD-style license
	 *  that can be found in the LICENSE file in the root of the source
	 *  tree.
	 */
	/* eslint-env node */
	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.shimGetUserMedia = shimGetUserMedia;
	function shimGetUserMedia(window) {
		var navigator = window && window.navigator;
	
		var shimError_ = function shimError_(e) {
			return {
				name: { PermissionDeniedError: 'NotAllowedError' }[e.name] || e.name,
				message: e.message,
				constraint: e.constraint,
				toString: function toString() {
					return this.name;
				}
			};
		};
	
		// getUserMedia error shim.
		var origGetUserMedia = navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);
		navigator.mediaDevices.getUserMedia = function (c) {
			return origGetUserMedia(c).catch(function (e) {
				return Promise.reject(shimError_(e));
			});
		};
	}
	
	},{}],11:[function(require,module,exports){
	/*
	 *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
	 *
	 *  Use of this source code is governed by a BSD-style license
	 *  that can be found in the LICENSE file in the root of the source
	 *  tree.
	 */
	/* eslint-env node */
	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.shimGetDisplayMedia = exports.shimGetUserMedia = undefined;
	
	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };
	
	var _getusermedia = require('./getusermedia');
	
	Object.defineProperty(exports, 'shimGetUserMedia', {
		enumerable: true,
		get: function get() {
			return _getusermedia.shimGetUserMedia;
		}
	});
	
	var _getdisplaymedia = require('./getdisplaymedia');
	
	Object.defineProperty(exports, 'shimGetDisplayMedia', {
		enumerable: true,
		get: function get() {
			return _getdisplaymedia.shimGetDisplayMedia;
		}
	});
	exports.shimOnTrack = shimOnTrack;
	exports.shimPeerConnection = shimPeerConnection;
	exports.shimSenderGetStats = shimSenderGetStats;
	exports.shimReceiverGetStats = shimReceiverGetStats;
	exports.shimRemoveStream = shimRemoveStream;
	exports.shimRTCDataChannel = shimRTCDataChannel;
	exports.shimAddTransceiver = shimAddTransceiver;
	exports.shimGetParameters = shimGetParameters;
	exports.shimCreateOffer = shimCreateOffer;
	exports.shimCreateAnswer = shimCreateAnswer;
	
	var _utils = require('../utils');
	
	var utils = _interopRequireWildcard(_utils);
	
	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }
	
	function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
	
	function shimOnTrack(window) {
		if ((typeof window === 'undefined' ? 'undefined' : _typeof(window)) === 'object' && window.RTCTrackEvent && 'receiver' in window.RTCTrackEvent.prototype && !('transceiver' in window.RTCTrackEvent.prototype)) {
			Object.defineProperty(window.RTCTrackEvent.prototype, 'transceiver', {
				get: function get() {
					return { receiver: this.receiver };
				}
			});
		}
	}
	
	function shimPeerConnection(window) {
		var browserDetails = utils.detectBrowser(window);
	
		if ((typeof window === 'undefined' ? 'undefined' : _typeof(window)) !== 'object' || !(window.RTCPeerConnection || window.mozRTCPeerConnection)) {
			return; // probably media.peerconnection.enabled=false in about:config
		}
		if (!window.RTCPeerConnection && window.mozRTCPeerConnection) {
			// very basic support for old versions.
			window.RTCPeerConnection = window.mozRTCPeerConnection;
		}
	
		if (browserDetails.version < 53) {
			// shim away need for obsolete RTCIceCandidate/RTCSessionDescription.
			['setLocalDescription', 'setRemoteDescription', 'addIceCandidate'].forEach(function (method) {
				var nativeMethod = window.RTCPeerConnection.prototype[method];
				var methodObj = _defineProperty({}, method, function () {
					arguments[0] = new (method === 'addIceCandidate' ? window.RTCIceCandidate : window.RTCSessionDescription)(arguments[0]);
					return nativeMethod.apply(this, arguments);
				});
				window.RTCPeerConnection.prototype[method] = methodObj[method];
			});
		}
	
		// support for addIceCandidate(null or undefined)
		// as well as ignoring {sdpMid, candidate: ""}
		if (browserDetails.version < 68) {
			var nativeAddIceCandidate = window.RTCPeerConnection.prototype.addIceCandidate;
			window.RTCPeerConnection.prototype.addIceCandidate = function addIceCandidate() {
				if (!arguments[0]) {
					if (arguments[1]) {
						arguments[1].apply(null);
					}
					return Promise.resolve();
				}
				// Firefox 68+ emits and processes {candidate: "", ...}, ignore
				// in older versions.
				if (arguments[0] && arguments[0].candidate === '') {
					return Promise.resolve();
				}
				return nativeAddIceCandidate.apply(this, arguments);
			};
		}
	
		var modernStatsTypes = {
			inboundrtp: 'inbound-rtp',
			outboundrtp: 'outbound-rtp',
			candidatepair: 'candidate-pair',
			localcandidate: 'local-candidate',
			remotecandidate: 'remote-candidate'
		};
	
		var nativeGetStats = window.RTCPeerConnection.prototype.getStats;
		window.RTCPeerConnection.prototype.getStats = function getStats() {
			var _arguments = Array.prototype.slice.call(arguments),
					selector = _arguments[0],
					onSucc = _arguments[1],
					onErr = _arguments[2];
	
			return nativeGetStats.apply(this, [selector || null]).then(function (stats) {
				if (browserDetails.version < 53 && !onSucc) {
					// Shim only promise getStats with spec-hyphens in type names
					// Leave callback version alone; misc old uses of forEach before Map
					try {
						stats.forEach(function (stat) {
							stat.type = modernStatsTypes[stat.type] || stat.type;
						});
					} catch (e) {
						if (e.name !== 'TypeError') {
							throw e;
						}
						// Avoid TypeError: "type" is read-only, in old versions. 34-43ish
						stats.forEach(function (stat, i) {
							stats.set(i, Object.assign({}, stat, {
								type: modernStatsTypes[stat.type] || stat.type
							}));
						});
					}
				}
				return stats;
			}).then(onSucc, onErr);
		};
	}
	
	function shimSenderGetStats(window) {
		if (!((typeof window === 'undefined' ? 'undefined' : _typeof(window)) === 'object' && window.RTCPeerConnection && window.RTCRtpSender)) {
			return;
		}
		if (window.RTCRtpSender && 'getStats' in window.RTCRtpSender.prototype) {
			return;
		}
		var origGetSenders = window.RTCPeerConnection.prototype.getSenders;
		if (origGetSenders) {
			window.RTCPeerConnection.prototype.getSenders = function getSenders() {
				var _this = this;
	
				var senders = origGetSenders.apply(this, []);
				senders.forEach(function (sender) {
					return sender._pc = _this;
				});
				return senders;
			};
		}
	
		var origAddTrack = window.RTCPeerConnection.prototype.addTrack;
		if (origAddTrack) {
			window.RTCPeerConnection.prototype.addTrack = function addTrack() {
				var sender = origAddTrack.apply(this, arguments);
				sender._pc = this;
				return sender;
			};
		}
		window.RTCRtpSender.prototype.getStats = function getStats() {
			return this.track ? this._pc.getStats(this.track) : Promise.resolve(new Map());
		};
	}
	
	function shimReceiverGetStats(window) {
		if (!((typeof window === 'undefined' ? 'undefined' : _typeof(window)) === 'object' && window.RTCPeerConnection && window.RTCRtpSender)) {
			return;
		}
		if (window.RTCRtpSender && 'getStats' in window.RTCRtpReceiver.prototype) {
			return;
		}
		var origGetReceivers = window.RTCPeerConnection.prototype.getReceivers;
		if (origGetReceivers) {
			window.RTCPeerConnection.prototype.getReceivers = function getReceivers() {
				var _this2 = this;
	
				var receivers = origGetReceivers.apply(this, []);
				receivers.forEach(function (receiver) {
					return receiver._pc = _this2;
				});
				return receivers;
			};
		}
		utils.wrapPeerConnectionEvent(window, 'track', function (e) {
			e.receiver._pc = e.srcElement;
			return e;
		});
		window.RTCRtpReceiver.prototype.getStats = function getStats() {
			return this._pc.getStats(this.track);
		};
	}
	
	function shimRemoveStream(window) {
		if (!window.RTCPeerConnection || 'removeStream' in window.RTCPeerConnection.prototype) {
			return;
		}
		window.RTCPeerConnection.prototype.removeStream = function removeStream(stream) {
			var _this3 = this;
	
			utils.deprecated('removeStream', 'removeTrack');
			this.getSenders().forEach(function (sender) {
				if (sender.track && stream.getTracks().includes(sender.track)) {
					_this3.removeTrack(sender);
				}
			});
		};
	}
	
	function shimRTCDataChannel(window) {
		// rename DataChannel to RTCDataChannel (native fix in FF60):
		// https://bugzilla.mozilla.org/show_bug.cgi?id=1173851
		if (window.DataChannel && !window.RTCDataChannel) {
			window.RTCDataChannel = window.DataChannel;
		}
	}
	
	function shimAddTransceiver(window) {
		// https://github.com/webrtcHacks/adapter/issues/998#issuecomment-516921647
		// Firefox ignores the init sendEncodings options passed to addTransceiver
		// https://bugzilla.mozilla.org/show_bug.cgi?id=1396918
		if (!((typeof window === 'undefined' ? 'undefined' : _typeof(window)) === 'object' && window.RTCPeerConnection)) {
			return;
		}
		var origAddTransceiver = window.RTCPeerConnection.prototype.addTransceiver;
		if (origAddTransceiver) {
			window.RTCPeerConnection.prototype.addTransceiver = function addTransceiver() {
				this.setParametersPromises = [];
				var initParameters = arguments[1];
				var shouldPerformCheck = initParameters && 'sendEncodings' in initParameters;
				if (shouldPerformCheck) {
					// If sendEncodings params are provided, validate grammar
					initParameters.sendEncodings.forEach(function (encodingParam) {
						if ('rid' in encodingParam) {
							var ridRegex = /^[a-z0-9]{0,16}$/i;
							if (!ridRegex.test(encodingParam.rid)) {
								throw new TypeError('Invalid RID value provided.');
							}
						}
						if ('scaleResolutionDownBy' in encodingParam) {
							if (!(parseFloat(encodingParam.scaleResolutionDownBy) >= 1.0)) {
								throw new RangeError('scale_resolution_down_by must be >= 1.0');
							}
						}
						if ('maxFramerate' in encodingParam) {
							if (!(parseFloat(encodingParam.maxFramerate) >= 0)) {
								throw new RangeError('max_framerate must be >= 0.0');
							}
						}
					});
				}
				var transceiver = origAddTransceiver.apply(this, arguments);
				if (shouldPerformCheck) {
					// Check if the init options were applied. If not we do this in an
					// asynchronous way and save the promise reference in a global object.
					// This is an ugly hack, but at the same time is way more robust than
					// checking the sender parameters before and after the createOffer
					// Also note that after the createoffer we are not 100% sure that
					// the params were asynchronously applied so we might miss the
					// opportunity to recreate offer.
					var sender = transceiver.sender;
	
					var params = sender.getParameters();
					if (!('encodings' in params) ||
					// Avoid being fooled by patched getParameters() below.
					params.encodings.length === 1 && Object.keys(params.encodings[0]).length === 0) {
						params.encodings = initParameters.sendEncodings;
						sender.sendEncodings = initParameters.sendEncodings;
						this.setParametersPromises.push(sender.setParameters(params).then(function () {
							delete sender.sendEncodings;
						}).catch(function () {
							delete sender.sendEncodings;
						}));
					}
				}
				return transceiver;
			};
		}
	}
	
	function shimGetParameters(window) {
		if (!((typeof window === 'undefined' ? 'undefined' : _typeof(window)) === 'object' && window.RTCRtpSender)) {
			return;
		}
		var origGetParameters = window.RTCRtpSender.prototype.getParameters;
		if (origGetParameters) {
			window.RTCRtpSender.prototype.getParameters = function getParameters() {
				var params = origGetParameters.apply(this, arguments);
				if (!('encodings' in params)) {
					params.encodings = [].concat(this.sendEncodings || [{}]);
				}
				return params;
			};
		}
	}
	
	function shimCreateOffer(window) {
		// https://github.com/webrtcHacks/adapter/issues/998#issuecomment-516921647
		// Firefox ignores the init sendEncodings options passed to addTransceiver
		// https://bugzilla.mozilla.org/show_bug.cgi?id=1396918
		if (!((typeof window === 'undefined' ? 'undefined' : _typeof(window)) === 'object' && window.RTCPeerConnection)) {
			return;
		}
		var origCreateOffer = window.RTCPeerConnection.prototype.createOffer;
		window.RTCPeerConnection.prototype.createOffer = function createOffer() {
			var _this4 = this,
					_arguments2 = arguments;
	
			if (this.setParametersPromises && this.setParametersPromises.length) {
				return Promise.all(this.setParametersPromises).then(function () {
					return origCreateOffer.apply(_this4, _arguments2);
				}).finally(function () {
					_this4.setParametersPromises = [];
				});
			}
			return origCreateOffer.apply(this, arguments);
		};
	}
	
	function shimCreateAnswer(window) {
		// https://github.com/webrtcHacks/adapter/issues/998#issuecomment-516921647
		// Firefox ignores the init sendEncodings options passed to addTransceiver
		// https://bugzilla.mozilla.org/show_bug.cgi?id=1396918
		if (!((typeof window === 'undefined' ? 'undefined' : _typeof(window)) === 'object' && window.RTCPeerConnection)) {
			return;
		}
		var origCreateAnswer = window.RTCPeerConnection.prototype.createAnswer;
		window.RTCPeerConnection.prototype.createAnswer = function createAnswer() {
			var _this5 = this,
					_arguments3 = arguments;
	
			if (this.setParametersPromises && this.setParametersPromises.length) {
				return Promise.all(this.setParametersPromises).then(function () {
					return origCreateAnswer.apply(_this5, _arguments3);
				}).finally(function () {
					_this5.setParametersPromises = [];
				});
			}
			return origCreateAnswer.apply(this, arguments);
		};
	}
	
	},{"../utils":15,"./getdisplaymedia":12,"./getusermedia":13}],12:[function(require,module,exports){
	/*
	 *  Copyright (c) 2018 The adapter.js project authors. All Rights Reserved.
	 *
	 *  Use of this source code is governed by a BSD-style license
	 *  that can be found in the LICENSE file in the root of the source
	 *  tree.
	 */
	/* eslint-env node */
	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.shimGetDisplayMedia = shimGetDisplayMedia;
	function shimGetDisplayMedia(window, preferredMediaSource) {
		if (window.navigator.mediaDevices && 'getDisplayMedia' in window.navigator.mediaDevices) {
			return;
		}
		if (!window.navigator.mediaDevices) {
			return;
		}
		window.navigator.mediaDevices.getDisplayMedia = function getDisplayMedia(constraints) {
			if (!(constraints && constraints.video)) {
				var err = new DOMException('getDisplayMedia without video ' + 'constraints is undefined');
				err.name = 'NotFoundError';
				// from https://heycam.github.io/webidl/#idl-DOMException-error-names
				err.code = 8;
				return Promise.reject(err);
			}
			if (constraints.video === true) {
				constraints.video = { mediaSource: preferredMediaSource };
			} else {
				constraints.video.mediaSource = preferredMediaSource;
			}
			return window.navigator.mediaDevices.getUserMedia(constraints);
		};
	}
	
	},{}],13:[function(require,module,exports){
	/*
	 *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
	 *
	 *  Use of this source code is governed by a BSD-style license
	 *  that can be found in the LICENSE file in the root of the source
	 *  tree.
	 */
	/* eslint-env node */
	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	
	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };
	
	exports.shimGetUserMedia = shimGetUserMedia;
	
	var _utils = require('../utils');
	
	var utils = _interopRequireWildcard(_utils);
	
	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }
	
	function shimGetUserMedia(window) {
		var browserDetails = utils.detectBrowser(window);
		var navigator = window && window.navigator;
		var MediaStreamTrack = window && window.MediaStreamTrack;
	
		navigator.getUserMedia = function (constraints, onSuccess, onError) {
			// Replace Firefox 44+'s deprecation warning with unprefixed version.
			utils.deprecated('navigator.getUserMedia', 'navigator.mediaDevices.getUserMedia');
			navigator.mediaDevices.getUserMedia(constraints).then(onSuccess, onError);
		};
	
		if (!(browserDetails.version > 55 && 'autoGainControl' in navigator.mediaDevices.getSupportedConstraints())) {
			var remap = function remap(obj, a, b) {
				if (a in obj && !(b in obj)) {
					obj[b] = obj[a];
					delete obj[a];
				}
			};
	
			var nativeGetUserMedia = navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);
			navigator.mediaDevices.getUserMedia = function (c) {
				if ((typeof c === 'undefined' ? 'undefined' : _typeof(c)) === 'object' && _typeof(c.audio) === 'object') {
					c = JSON.parse(JSON.stringify(c));
					remap(c.audio, 'autoGainControl', 'mozAutoGainControl');
					remap(c.audio, 'noiseSuppression', 'mozNoiseSuppression');
				}
				return nativeGetUserMedia(c);
			};
	
			if (MediaStreamTrack && MediaStreamTrack.prototype.getSettings) {
				var nativeGetSettings = MediaStreamTrack.prototype.getSettings;
				MediaStreamTrack.prototype.getSettings = function () {
					var obj = nativeGetSettings.apply(this, arguments);
					remap(obj, 'mozAutoGainControl', 'autoGainControl');
					remap(obj, 'mozNoiseSuppression', 'noiseSuppression');
					return obj;
				};
			}
	
			if (MediaStreamTrack && MediaStreamTrack.prototype.applyConstraints) {
				var nativeApplyConstraints = MediaStreamTrack.prototype.applyConstraints;
				MediaStreamTrack.prototype.applyConstraints = function (c) {
					if (this.kind === 'audio' && (typeof c === 'undefined' ? 'undefined' : _typeof(c)) === 'object') {
						c = JSON.parse(JSON.stringify(c));
						remap(c, 'autoGainControl', 'mozAutoGainControl');
						remap(c, 'noiseSuppression', 'mozNoiseSuppression');
					}
					return nativeApplyConstraints.apply(this, [c]);
				};
			}
		}
	}
	
	},{"../utils":15}],14:[function(require,module,exports){
	/*
	 *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
	 *
	 *  Use of this source code is governed by a BSD-style license
	 *  that can be found in the LICENSE file in the root of the source
	 *  tree.
	 */
	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	
	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };
	
	exports.shimLocalStreamsAPI = shimLocalStreamsAPI;
	exports.shimRemoteStreamsAPI = shimRemoteStreamsAPI;
	exports.shimCallbacksAPI = shimCallbacksAPI;
	exports.shimGetUserMedia = shimGetUserMedia;
	exports.shimConstraints = shimConstraints;
	exports.shimRTCIceServerUrls = shimRTCIceServerUrls;
	exports.shimTrackEventTransceiver = shimTrackEventTransceiver;
	exports.shimCreateOfferLegacy = shimCreateOfferLegacy;
	exports.shimAudioContext = shimAudioContext;
	
	var _utils = require('../utils');
	
	var utils = _interopRequireWildcard(_utils);
	
	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }
	
	function shimLocalStreamsAPI(window) {
		if ((typeof window === 'undefined' ? 'undefined' : _typeof(window)) !== 'object' || !window.RTCPeerConnection) {
			return;
		}
		if (!('getLocalStreams' in window.RTCPeerConnection.prototype)) {
			window.RTCPeerConnection.prototype.getLocalStreams = function getLocalStreams() {
				if (!this._localStreams) {
					this._localStreams = [];
				}
				return this._localStreams;
			};
		}
		if (!('addStream' in window.RTCPeerConnection.prototype)) {
			var _addTrack = window.RTCPeerConnection.prototype.addTrack;
			window.RTCPeerConnection.prototype.addStream = function addStream(stream) {
				var _this = this;
	
				if (!this._localStreams) {
					this._localStreams = [];
				}
				if (!this._localStreams.includes(stream)) {
					this._localStreams.push(stream);
				}
				// Try to emulate Chrome's behaviour of adding in audio-video order.
				// Safari orders by track id.
				stream.getAudioTracks().forEach(function (track) {
					return _addTrack.call(_this, track, stream);
				});
				stream.getVideoTracks().forEach(function (track) {
					return _addTrack.call(_this, track, stream);
				});
			};
	
			window.RTCPeerConnection.prototype.addTrack = function addTrack(track) {
				var _this2 = this;
	
				for (var _len = arguments.length, streams = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
					streams[_key - 1] = arguments[_key];
				}
	
				if (streams) {
					streams.forEach(function (stream) {
						if (!_this2._localStreams) {
							_this2._localStreams = [stream];
						} else if (!_this2._localStreams.includes(stream)) {
							_this2._localStreams.push(stream);
						}
					});
				}
				return _addTrack.apply(this, arguments);
			};
		}
		if (!('removeStream' in window.RTCPeerConnection.prototype)) {
			window.RTCPeerConnection.prototype.removeStream = function removeStream(stream) {
				var _this3 = this;
	
				if (!this._localStreams) {
					this._localStreams = [];
				}
				var index = this._localStreams.indexOf(stream);
				if (index === -1) {
					return;
				}
				this._localStreams.splice(index, 1);
				var tracks = stream.getTracks();
				this.getSenders().forEach(function (sender) {
					if (tracks.includes(sender.track)) {
						_this3.removeTrack(sender);
					}
				});
			};
		}
	}
	
	function shimRemoteStreamsAPI(window) {
		if ((typeof window === 'undefined' ? 'undefined' : _typeof(window)) !== 'object' || !window.RTCPeerConnection) {
			return;
		}
		if (!('getRemoteStreams' in window.RTCPeerConnection.prototype)) {
			window.RTCPeerConnection.prototype.getRemoteStreams = function getRemoteStreams() {
				return this._remoteStreams ? this._remoteStreams : [];
			};
		}
		if (!('onaddstream' in window.RTCPeerConnection.prototype)) {
			Object.defineProperty(window.RTCPeerConnection.prototype, 'onaddstream', {
				get: function get() {
					return this._onaddstream;
				},
				set: function set(f) {
					var _this4 = this;
	
					if (this._onaddstream) {
						this.removeEventListener('addstream', this._onaddstream);
						this.removeEventListener('track', this._onaddstreampoly);
					}
					this.addEventListener('addstream', this._onaddstream = f);
					this.addEventListener('track', this._onaddstreampoly = function (e) {
						e.streams.forEach(function (stream) {
							if (!_this4._remoteStreams) {
								_this4._remoteStreams = [];
							}
							if (_this4._remoteStreams.includes(stream)) {
								return;
							}
							_this4._remoteStreams.push(stream);
							var event = new Event('addstream');
							event.stream = stream;
							_this4.dispatchEvent(event);
						});
					});
				}
			});
			var origSetRemoteDescription = window.RTCPeerConnection.prototype.setRemoteDescription;
			window.RTCPeerConnection.prototype.setRemoteDescription = function setRemoteDescription() {
				var pc = this;
				if (!this._onaddstreampoly) {
					this.addEventListener('track', this._onaddstreampoly = function (e) {
						e.streams.forEach(function (stream) {
							if (!pc._remoteStreams) {
								pc._remoteStreams = [];
							}
							if (pc._remoteStreams.indexOf(stream) >= 0) {
								return;
							}
							pc._remoteStreams.push(stream);
							var event = new Event('addstream');
							event.stream = stream;
							pc.dispatchEvent(event);
						});
					});
				}
				return origSetRemoteDescription.apply(pc, arguments);
			};
		}
	}
	
	function shimCallbacksAPI(window) {
		if ((typeof window === 'undefined' ? 'undefined' : _typeof(window)) !== 'object' || !window.RTCPeerConnection) {
			return;
		}
		var prototype = window.RTCPeerConnection.prototype;
		var origCreateOffer = prototype.createOffer;
		var origCreateAnswer = prototype.createAnswer;
		var setLocalDescription = prototype.setLocalDescription;
		var setRemoteDescription = prototype.setRemoteDescription;
		var addIceCandidate = prototype.addIceCandidate;
	
		prototype.createOffer = function createOffer(successCallback, failureCallback) {
			var options = arguments.length >= 2 ? arguments[2] : arguments[0];
			var promise = origCreateOffer.apply(this, [options]);
			if (!failureCallback) {
				return promise;
			}
			promise.then(successCallback, failureCallback);
			return Promise.resolve();
		};
	
		prototype.createAnswer = function createAnswer(successCallback, failureCallback) {
			var options = arguments.length >= 2 ? arguments[2] : arguments[0];
			var promise = origCreateAnswer.apply(this, [options]);
			if (!failureCallback) {
				return promise;
			}
			promise.then(successCallback, failureCallback);
			return Promise.resolve();
		};
	
		var withCallback = function withCallback(description, successCallback, failureCallback) {
			var promise = setLocalDescription.apply(this, [description]);
			if (!failureCallback) {
				return promise;
			}
			promise.then(successCallback, failureCallback);
			return Promise.resolve();
		};
		prototype.setLocalDescription = withCallback;
	
		withCallback = function withCallback(description, successCallback, failureCallback) {
			var promise = setRemoteDescription.apply(this, [description]);
			if (!failureCallback) {
				return promise;
			}
			promise.then(successCallback, failureCallback);
			return Promise.resolve();
		};
		prototype.setRemoteDescription = withCallback;
	
		withCallback = function withCallback(candidate, successCallback, failureCallback) {
			var promise = addIceCandidate.apply(this, [candidate]);
			if (!failureCallback) {
				return promise;
			}
			promise.then(successCallback, failureCallback);
			return Promise.resolve();
		};
		prototype.addIceCandidate = withCallback;
	}
	
	function shimGetUserMedia(window) {
		var navigator = window && window.navigator;
	
		if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
			// shim not needed in Safari 12.1
			var mediaDevices = navigator.mediaDevices;
			var _getUserMedia = mediaDevices.getUserMedia.bind(mediaDevices);
			navigator.mediaDevices.getUserMedia = function (constraints) {
				return _getUserMedia(shimConstraints(constraints));
			};
		}
	
		if (!navigator.getUserMedia && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
			navigator.getUserMedia = function getUserMedia(constraints, cb, errcb) {
				navigator.mediaDevices.getUserMedia(constraints).then(cb, errcb);
			}.bind(navigator);
		}
	}
	
	function shimConstraints(constraints) {
		if (constraints && constraints.video !== undefined) {
			return Object.assign({}, constraints, { video: utils.compactObject(constraints.video) });
		}
	
		return constraints;
	}
	
	function shimRTCIceServerUrls(window) {
		if (!window.RTCPeerConnection) {
			return;
		}
		// migrate from non-spec RTCIceServer.url to RTCIceServer.urls
		var OrigPeerConnection = window.RTCPeerConnection;
		window.RTCPeerConnection = function RTCPeerConnection(pcConfig, pcConstraints) {
			if (pcConfig && pcConfig.iceServers) {
				var newIceServers = [];
				for (var i = 0; i < pcConfig.iceServers.length; i++) {
					var server = pcConfig.iceServers[i];
					if (!server.hasOwnProperty('urls') && server.hasOwnProperty('url')) {
						utils.deprecated('RTCIceServer.url', 'RTCIceServer.urls');
						server = JSON.parse(JSON.stringify(server));
						server.urls = server.url;
						delete server.url;
						newIceServers.push(server);
					} else {
						newIceServers.push(pcConfig.iceServers[i]);
					}
				}
				pcConfig.iceServers = newIceServers;
			}
			return new OrigPeerConnection(pcConfig, pcConstraints);
		};
		window.RTCPeerConnection.prototype = OrigPeerConnection.prototype;
		// wrap static methods. Currently just generateCertificate.
		if ('generateCertificate' in OrigPeerConnection) {
			Object.defineProperty(window.RTCPeerConnection, 'generateCertificate', {
				get: function get() {
					return OrigPeerConnection.generateCertificate;
				}
			});
		}
	}
	
	function shimTrackEventTransceiver(window) {
		// Add event.transceiver member over deprecated event.receiver
		if ((typeof window === 'undefined' ? 'undefined' : _typeof(window)) === 'object' && window.RTCTrackEvent && 'receiver' in window.RTCTrackEvent.prototype && !('transceiver' in window.RTCTrackEvent.prototype)) {
			Object.defineProperty(window.RTCTrackEvent.prototype, 'transceiver', {
				get: function get() {
					return { receiver: this.receiver };
				}
			});
		}
	}
	
	function shimCreateOfferLegacy(window) {
		var origCreateOffer = window.RTCPeerConnection.prototype.createOffer;
		window.RTCPeerConnection.prototype.createOffer = function createOffer(offerOptions) {
			if (offerOptions) {
				if (typeof offerOptions.offerToReceiveAudio !== 'undefined') {
					// support bit values
					offerOptions.offerToReceiveAudio = !!offerOptions.offerToReceiveAudio;
				}
				var audioTransceiver = this.getTransceivers().find(function (transceiver) {
					return transceiver.receiver.track.kind === 'audio';
				});
				if (offerOptions.offerToReceiveAudio === false && audioTransceiver) {
					if (audioTransceiver.direction === 'sendrecv') {
						if (audioTransceiver.setDirection) {
							audioTransceiver.setDirection('sendonly');
						} else {
							audioTransceiver.direction = 'sendonly';
						}
					} else if (audioTransceiver.direction === 'recvonly') {
						if (audioTransceiver.setDirection) {
							audioTransceiver.setDirection('inactive');
						} else {
							audioTransceiver.direction = 'inactive';
						}
					}
				} else if (offerOptions.offerToReceiveAudio === true && !audioTransceiver) {
					this.addTransceiver('audio');
				}
	
				if (typeof offerOptions.offerToReceiveVideo !== 'undefined') {
					// support bit values
					offerOptions.offerToReceiveVideo = !!offerOptions.offerToReceiveVideo;
				}
				var videoTransceiver = this.getTransceivers().find(function (transceiver) {
					return transceiver.receiver.track.kind === 'video';
				});
				if (offerOptions.offerToReceiveVideo === false && videoTransceiver) {
					if (videoTransceiver.direction === 'sendrecv') {
						if (videoTransceiver.setDirection) {
							videoTransceiver.setDirection('sendonly');
						} else {
							videoTransceiver.direction = 'sendonly';
						}
					} else if (videoTransceiver.direction === 'recvonly') {
						if (videoTransceiver.setDirection) {
							videoTransceiver.setDirection('inactive');
						} else {
							videoTransceiver.direction = 'inactive';
						}
					}
				} else if (offerOptions.offerToReceiveVideo === true && !videoTransceiver) {
					this.addTransceiver('video');
				}
			}
			return origCreateOffer.apply(this, arguments);
		};
	}
	
	function shimAudioContext(window) {
		if ((typeof window === 'undefined' ? 'undefined' : _typeof(window)) !== 'object' || window.AudioContext) {
			return;
		}
		window.AudioContext = window.webkitAudioContext;
	}
	
	},{"../utils":15}],15:[function(require,module,exports){
	/*
	 *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
	 *
	 *  Use of this source code is governed by a BSD-style license
	 *  that can be found in the LICENSE file in the root of the source
	 *  tree.
	 */
	/* eslint-env node */
	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	
	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };
	
	exports.extractVersion = extractVersion;
	exports.wrapPeerConnectionEvent = wrapPeerConnectionEvent;
	exports.disableLog = disableLog;
	exports.disableWarnings = disableWarnings;
	exports.log = log;
	exports.deprecated = deprecated;
	exports.detectBrowser = detectBrowser;
	exports.compactObject = compactObject;
	exports.walkStats = walkStats;
	exports.filterStats = filterStats;
	
	function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
	
	var logDisabled_ = true;
	var deprecationWarnings_ = true;
	
	/**
	 * Extract browser version out of the provided user agent string.
	 *
	 * @param {!string} uastring userAgent string.
	 * @param {!string} expr Regular expression used as match criteria.
	 * @param {!number} pos position in the version string to be returned.
	 * @return {!number} browser version.
	 */
	function extractVersion(uastring, expr, pos) {
		var match = uastring.match(expr);
		return match && match.length >= pos && parseInt(match[pos], 10);
	}
	
	// Wraps the peerconnection event eventNameToWrap in a function
	// which returns the modified event object (or false to prevent
	// the event).
	function wrapPeerConnectionEvent(window, eventNameToWrap, wrapper) {
		if (!window.RTCPeerConnection) {
			return;
		}
		var proto = window.RTCPeerConnection.prototype;
		var nativeAddEventListener = proto.addEventListener;
		proto.addEventListener = function (nativeEventName, cb) {
			if (nativeEventName !== eventNameToWrap) {
				return nativeAddEventListener.apply(this, arguments);
			}
			var wrappedCallback = function wrappedCallback(e) {
				var modifiedEvent = wrapper(e);
				if (modifiedEvent) {
					if (cb.handleEvent) {
						cb.handleEvent(modifiedEvent);
					} else {
						cb(modifiedEvent);
					}
				}
			};
			this._eventMap = this._eventMap || {};
			if (!this._eventMap[eventNameToWrap]) {
				this._eventMap[eventNameToWrap] = new Map();
			}
			this._eventMap[eventNameToWrap].set(cb, wrappedCallback);
			return nativeAddEventListener.apply(this, [nativeEventName, wrappedCallback]);
		};
	
		var nativeRemoveEventListener = proto.removeEventListener;
		proto.removeEventListener = function (nativeEventName, cb) {
			if (nativeEventName !== eventNameToWrap || !this._eventMap || !this._eventMap[eventNameToWrap]) {
				return nativeRemoveEventListener.apply(this, arguments);
			}
			if (!this._eventMap[eventNameToWrap].has(cb)) {
				return nativeRemoveEventListener.apply(this, arguments);
			}
			var unwrappedCb = this._eventMap[eventNameToWrap].get(cb);
			this._eventMap[eventNameToWrap].delete(cb);
			if (this._eventMap[eventNameToWrap].size === 0) {
				delete this._eventMap[eventNameToWrap];
			}
			if (Object.keys(this._eventMap).length === 0) {
				delete this._eventMap;
			}
			return nativeRemoveEventListener.apply(this, [nativeEventName, unwrappedCb]);
		};
	
		Object.defineProperty(proto, 'on' + eventNameToWrap, {
			get: function get() {
				return this['_on' + eventNameToWrap];
			},
			set: function set(cb) {
				if (this['_on' + eventNameToWrap]) {
					this.removeEventListener(eventNameToWrap, this['_on' + eventNameToWrap]);
					delete this['_on' + eventNameToWrap];
				}
				if (cb) {
					this.addEventListener(eventNameToWrap, this['_on' + eventNameToWrap] = cb);
				}
			},
	
			enumerable: true,
			configurable: true
		});
	}
	
	function disableLog(bool) {
		if (typeof bool !== 'boolean') {
			return new Error('Argument type: ' + (typeof bool === 'undefined' ? 'undefined' : _typeof(bool)) + '. Please use a boolean.');
		}
		logDisabled_ = bool;
		return bool ? 'adapter.js logging disabled' : 'adapter.js logging enabled';
	}
	
	/**
	 * Disable or enable deprecation warnings
	 * @param {!boolean} bool set to true to disable warnings.
	 */
	function disableWarnings(bool) {
		if (typeof bool !== 'boolean') {
			return new Error('Argument type: ' + (typeof bool === 'undefined' ? 'undefined' : _typeof(bool)) + '. Please use a boolean.');
		}
		deprecationWarnings_ = !bool;
		return 'adapter.js deprecation warnings ' + (bool ? 'disabled' : 'enabled');
	}
	
	function log() {
		if ((typeof window === 'undefined' ? 'undefined' : _typeof(window)) === 'object') {
			if (logDisabled_) {
				return;
			}
			if (typeof console !== 'undefined' && typeof console.log === 'function') {
				console.log.apply(console, arguments);
			}
		}
	}
	
	/**
	 * Shows a deprecation warning suggesting the modern and spec-compatible API.
	 */
	function deprecated(oldMethod, newMethod) {
		if (!deprecationWarnings_) {
			return;
		}
		console.warn(oldMethod + ' is deprecated, please use ' + newMethod + ' instead.');
	}
	
	/**
	 * Browser detector.
	 *
	 * @return {object} result containing browser and version
	 *     properties.
	 */
	function detectBrowser(window) {
		// Returned result object.
		var result = { browser: null, version: null };
	
		// Fail early if it's not a browser
		if (typeof window === 'undefined' || !window.navigator) {
			result.browser = 'Not a browser.';
			return result;
		}
	
		var navigator = window.navigator;
	
	
		if (navigator.mozGetUserMedia) {
			// Firefox.
			result.browser = 'firefox';
			result.version = extractVersion(navigator.userAgent, /Firefox\/(\d+)\./, 1);
		} else if (navigator.webkitGetUserMedia || window.isSecureContext === false && window.webkitRTCPeerConnection && !window.RTCIceGatherer) {
			// Chrome, Chromium, Webview, Opera.
			// Version matches Chrome/WebRTC version.
			// Chrome 74 removed webkitGetUserMedia on http as well so we need the
			// more complicated fallback to webkitRTCPeerConnection.
			result.browser = 'chrome';
			result.version = extractVersion(navigator.userAgent, /Chrom(e|ium)\/(\d+)\./, 2);
		} else if (navigator.mediaDevices && navigator.userAgent.match(/Edge\/(\d+).(\d+)$/)) {
			// Edge.
			result.browser = 'edge';
			result.version = extractVersion(navigator.userAgent, /Edge\/(\d+).(\d+)$/, 2);
		} else if (window.RTCPeerConnection && navigator.userAgent.match(/AppleWebKit\/(\d+)\./)) {
			// Safari.
			result.browser = 'safari';
			result.version = extractVersion(navigator.userAgent, /AppleWebKit\/(\d+)\./, 1);
			result.supportsUnifiedPlan = window.RTCRtpTransceiver && 'currentDirection' in window.RTCRtpTransceiver.prototype;
		} else {
			// Default fallthrough: not supported.
			result.browser = 'Not a supported browser.';
			return result;
		}
	
		return result;
	}
	
	/**
	 * Checks if something is an object.
	 *
	 * @param {*} val The something you want to check.
	 * @return true if val is an object, false otherwise.
	 */
	function isObject(val) {
		return Object.prototype.toString.call(val) === '[object Object]';
	}
	
	/**
	 * Remove all empty objects and undefined values
	 * from a nested object -- an enhanced and vanilla version
	 * of Lodash's `compact`.
	 */
	function compactObject(data) {
		if (!isObject(data)) {
			return data;
		}
	
		return Object.keys(data).reduce(function (accumulator, key) {
			var isObj = isObject(data[key]);
			var value = isObj ? compactObject(data[key]) : data[key];
			var isEmptyObject = isObj && !Object.keys(value).length;
			if (value === undefined || isEmptyObject) {
				return accumulator;
			}
			return Object.assign(accumulator, _defineProperty({}, key, value));
		}, {});
	}
	
	/* iterates the stats graph recursively. */
	function walkStats(stats, base, resultSet) {
		if (!base || resultSet.has(base.id)) {
			return;
		}
		resultSet.set(base.id, base);
		Object.keys(base).forEach(function (name) {
			if (name.endsWith('Id')) {
				walkStats(stats, stats.get(base[name]), resultSet);
			} else if (name.endsWith('Ids')) {
				base[name].forEach(function (id) {
					walkStats(stats, stats.get(id), resultSet);
				});
			}
		});
	}
	
	/* filter getStats for a sender/receiver track. */
	function filterStats(result, track, outbound) {
		var streamStatsType = outbound ? 'outbound-rtp' : 'inbound-rtp';
		var filteredResult = new Map();
		if (track === null) {
			return filteredResult;
		}
		var trackStats = [];
		result.forEach(function (value) {
			if (value.type === 'track' && value.trackIdentifier === track.id) {
				trackStats.push(value);
			}
		});
		trackStats.forEach(function (trackStat) {
			result.forEach(function (stats) {
				if (stats.type === streamStatsType && stats.trackId === trackStat.id) {
					walkStats(result, stats, filteredResult);
				}
			});
		});
		return filteredResult;
	}
	
	},{}],16:[function(require,module,exports){
	/*
	 *  Copyright (c) 2017 The WebRTC project authors. All Rights Reserved.
	 *
	 *  Use of this source code is governed by a BSD-style license
	 *  that can be found in the LICENSE file in the root of the source
	 *  tree.
	 */
	 /* eslint-env node */
	'use strict';
	
	var SDPUtils = require('sdp');
	
	function fixStatsType(stat) {
		return {
			inboundrtp: 'inbound-rtp',
			outboundrtp: 'outbound-rtp',
			candidatepair: 'candidate-pair',
			localcandidate: 'local-candidate',
			remotecandidate: 'remote-candidate'
		}[stat.type] || stat.type;
	}
	
	function writeMediaSection(transceiver, caps, type, stream, dtlsRole) {
		var sdp = SDPUtils.writeRtpDescription(transceiver.kind, caps);
	
		// Map ICE parameters (ufrag, pwd) to SDP.
		sdp += SDPUtils.writeIceParameters(
				transceiver.iceGatherer.getLocalParameters());
	
		// Map DTLS parameters to SDP.
		sdp += SDPUtils.writeDtlsParameters(
				transceiver.dtlsTransport.getLocalParameters(),
				type === 'offer' ? 'actpass' : dtlsRole || 'active');
	
		sdp += 'a=mid:' + transceiver.mid + '\r\n';
	
		if (transceiver.rtpSender && transceiver.rtpReceiver) {
			sdp += 'a=sendrecv\r\n';
		} else if (transceiver.rtpSender) {
			sdp += 'a=sendonly\r\n';
		} else if (transceiver.rtpReceiver) {
			sdp += 'a=recvonly\r\n';
		} else {
			sdp += 'a=inactive\r\n';
		}
	
		if (transceiver.rtpSender) {
			var trackId = transceiver.rtpSender._initialTrackId ||
					transceiver.rtpSender.track.id;
			transceiver.rtpSender._initialTrackId = trackId;
			// spec.
			var msid = 'msid:' + (stream ? stream.id : '-') + ' ' +
					trackId + '\r\n';
			sdp += 'a=' + msid;
			// for Chrome. Legacy should no longer be required.
			sdp += 'a=ssrc:' + transceiver.sendEncodingParameters[0].ssrc +
					' ' + msid;
	
			// RTX
			if (transceiver.sendEncodingParameters[0].rtx) {
				sdp += 'a=ssrc:' + transceiver.sendEncodingParameters[0].rtx.ssrc +
						' ' + msid;
				sdp += 'a=ssrc-group:FID ' +
						transceiver.sendEncodingParameters[0].ssrc + ' ' +
						transceiver.sendEncodingParameters[0].rtx.ssrc +
						'\r\n';
			}
		}
		// FIXME: this should be written by writeRtpDescription.
		sdp += 'a=ssrc:' + transceiver.sendEncodingParameters[0].ssrc +
				' cname:' + SDPUtils.localCName + '\r\n';
		if (transceiver.rtpSender && transceiver.sendEncodingParameters[0].rtx) {
			sdp += 'a=ssrc:' + transceiver.sendEncodingParameters[0].rtx.ssrc +
					' cname:' + SDPUtils.localCName + '\r\n';
		}
		return sdp;
	}
	
	// Edge does not like
	// 1) stun: filtered after 14393 unless ?transport=udp is present
	// 2) turn: that does not have all of turn:host:port?transport=udp
	// 3) turn: with ipv6 addresses
	// 4) turn: occurring muliple times
	function filterIceServers(iceServers, edgeVersion) {
		var hasTurn = false;
		iceServers = JSON.parse(JSON.stringify(iceServers));
		return iceServers.filter(function(server) {
			if (server && (server.urls || server.url)) {
				var urls = server.urls || server.url;
				if (server.url && !server.urls) {
					console.warn('RTCIceServer.url is deprecated! Use urls instead.');
				}
				var isString = typeof urls === 'string';
				if (isString) {
					urls = [urls];
				}
				urls = urls.filter(function(url) {
					var validTurn = url.indexOf('turn:') === 0 &&
							url.indexOf('transport=udp') !== -1 &&
							url.indexOf('turn:[') === -1 &&
							!hasTurn;
	
					if (validTurn) {
						hasTurn = true;
						return true;
					}
					return url.indexOf('stun:') === 0 && edgeVersion >= 14393 &&
							url.indexOf('?transport=udp') === -1;
				});
	
				delete server.url;
				server.urls = isString ? urls[0] : urls;
				return !!urls.length;
			}
		});
	}
	
	// Determines the intersection of local and remote capabilities.
	function getCommonCapabilities(localCapabilities, remoteCapabilities) {
		var commonCapabilities = {
			codecs: [],
			headerExtensions: [],
			fecMechanisms: []
		};
	
		var findCodecByPayloadType = function(pt, codecs) {
			pt = parseInt(pt, 10);
			for (var i = 0; i < codecs.length; i++) {
				if (codecs[i].payloadType === pt ||
						codecs[i].preferredPayloadType === pt) {
					return codecs[i];
				}
			}
		};
	
		var rtxCapabilityMatches = function(lRtx, rRtx, lCodecs, rCodecs) {
			var lCodec = findCodecByPayloadType(lRtx.parameters.apt, lCodecs);
			var rCodec = findCodecByPayloadType(rRtx.parameters.apt, rCodecs);
			return lCodec && rCodec &&
					lCodec.name.toLowerCase() === rCodec.name.toLowerCase();
		};
	
		localCapabilities.codecs.forEach(function(lCodec) {
			for (var i = 0; i < remoteCapabilities.codecs.length; i++) {
				var rCodec = remoteCapabilities.codecs[i];
				if (lCodec.name.toLowerCase() === rCodec.name.toLowerCase() &&
						lCodec.clockRate === rCodec.clockRate) {
					if (lCodec.name.toLowerCase() === 'rtx' &&
							lCodec.parameters && rCodec.parameters.apt) {
						// for RTX we need to find the local rtx that has a apt
						// which points to the same local codec as the remote one.
						if (!rtxCapabilityMatches(lCodec, rCodec,
								localCapabilities.codecs, remoteCapabilities.codecs)) {
							continue;
						}
					}
					rCodec = JSON.parse(JSON.stringify(rCodec)); // deepcopy
					// number of channels is the highest common number of channels
					rCodec.numChannels = Math.min(lCodec.numChannels,
							rCodec.numChannels);
					// push rCodec so we reply with offerer payload type
					commonCapabilities.codecs.push(rCodec);
	
					// determine common feedback mechanisms
					rCodec.rtcpFeedback = rCodec.rtcpFeedback.filter(function(fb) {
						for (var j = 0; j < lCodec.rtcpFeedback.length; j++) {
							if (lCodec.rtcpFeedback[j].type === fb.type &&
									lCodec.rtcpFeedback[j].parameter === fb.parameter) {
								return true;
							}
						}
						return false;
					});
					// FIXME: also need to determine .parameters
					//  see https://github.com/openpeer/ortc/issues/569
					break;
				}
			}
		});
	
		localCapabilities.headerExtensions.forEach(function(lHeaderExtension) {
			for (var i = 0; i < remoteCapabilities.headerExtensions.length;
					 i++) {
				var rHeaderExtension = remoteCapabilities.headerExtensions[i];
				if (lHeaderExtension.uri === rHeaderExtension.uri) {
					commonCapabilities.headerExtensions.push(rHeaderExtension);
					break;
				}
			}
		});
	
		// FIXME: fecMechanisms
		return commonCapabilities;
	}
	
	// is action=setLocalDescription with type allowed in signalingState
	function isActionAllowedInSignalingState(action, type, signalingState) {
		return {
			offer: {
				setLocalDescription: ['stable', 'have-local-offer'],
				setRemoteDescription: ['stable', 'have-remote-offer']
			},
			answer: {
				setLocalDescription: ['have-remote-offer', 'have-local-pranswer'],
				setRemoteDescription: ['have-local-offer', 'have-remote-pranswer']
			}
		}[type][action].indexOf(signalingState) !== -1;
	}
	
	function maybeAddCandidate(iceTransport, candidate) {
		// Edge's internal representation adds some fields therefore
		// not all fieldѕ are taken into account.
		var alreadyAdded = iceTransport.getRemoteCandidates()
				.find(function(remoteCandidate) {
					return candidate.foundation === remoteCandidate.foundation &&
							candidate.ip === remoteCandidate.ip &&
							candidate.port === remoteCandidate.port &&
							candidate.priority === remoteCandidate.priority &&
							candidate.protocol === remoteCandidate.protocol &&
							candidate.type === remoteCandidate.type;
				});
		if (!alreadyAdded) {
			iceTransport.addRemoteCandidate(candidate);
		}
		return !alreadyAdded;
	}
	
	
	function makeError(name, description) {
		var e = new Error(description);
		e.name = name;
		// legacy error codes from https://heycam.github.io/webidl/#idl-DOMException-error-names
		e.code = {
			NotSupportedError: 9,
			InvalidStateError: 11,
			InvalidAccessError: 15,
			TypeError: undefined,
			OperationError: undefined
		}[name];
		return e;
	}
	
	module.exports = function(window, edgeVersion) {
		// https://w3c.github.io/mediacapture-main/#mediastream
		// Helper function to add the track to the stream and
		// dispatch the event ourselves.
		function addTrackToStreamAndFireEvent(track, stream) {
			stream.addTrack(track);
			stream.dispatchEvent(new window.MediaStreamTrackEvent('addtrack',
					{track: track}));
		}
	
		function removeTrackFromStreamAndFireEvent(track, stream) {
			stream.removeTrack(track);
			stream.dispatchEvent(new window.MediaStreamTrackEvent('removetrack',
					{track: track}));
		}
	
		function fireAddTrack(pc, track, receiver, streams) {
			var trackEvent = new Event('track');
			trackEvent.track = track;
			trackEvent.receiver = receiver;
			trackEvent.transceiver = {receiver: receiver};
			trackEvent.streams = streams;
			window.setTimeout(function() {
				pc._dispatchEvent('track', trackEvent);
			});
		}
	
		var RTCPeerConnection = function(config) {
			var pc = this;
	
			var _eventTarget = document.createDocumentFragment();
			['addEventListener', 'removeEventListener', 'dispatchEvent']
					.forEach(function(method) {
						pc[method] = _eventTarget[method].bind(_eventTarget);
					});
	
			this.canTrickleIceCandidates = null;
	
			this.needNegotiation = false;
	
			this.localStreams = [];
			this.remoteStreams = [];
	
			this._localDescription = null;
			this._remoteDescription = null;
	
			this.signalingState = 'stable';
			this.iceConnectionState = 'new';
			this.connectionState = 'new';
			this.iceGatheringState = 'new';
	
			config = JSON.parse(JSON.stringify(config || {}));
	
			this.usingBundle = config.bundlePolicy === 'max-bundle';
			if (config.rtcpMuxPolicy === 'negotiate') {
				throw(makeError('NotSupportedError',
						'rtcpMuxPolicy \'negotiate\' is not supported'));
			} else if (!config.rtcpMuxPolicy) {
				config.rtcpMuxPolicy = 'require';
			}
	
			switch (config.iceTransportPolicy) {
				case 'all':
				case 'relay':
					break;
				default:
					config.iceTransportPolicy = 'all';
					break;
			}
	
			switch (config.bundlePolicy) {
				case 'balanced':
				case 'max-compat':
				case 'max-bundle':
					break;
				default:
					config.bundlePolicy = 'balanced';
					break;
			}
	
			config.iceServers = filterIceServers(config.iceServers || [], edgeVersion);
	
			this._iceGatherers = [];
			if (config.iceCandidatePoolSize) {
				for (var i = config.iceCandidatePoolSize; i > 0; i--) {
					this._iceGatherers.push(new window.RTCIceGatherer({
						iceServers: config.iceServers,
						gatherPolicy: config.iceTransportPolicy
					}));
				}
			} else {
				config.iceCandidatePoolSize = 0;
			}
	
			this._config = config;
	
			// per-track iceGathers, iceTransports, dtlsTransports, rtpSenders, ...
			// everything that is needed to describe a SDP m-line.
			this.transceivers = [];
	
			this._sdpSessionId = SDPUtils.generateSessionId();
			this._sdpSessionVersion = 0;
	
			this._dtlsRole = undefined; // role for a=setup to use in answers.
	
			this._isClosed = false;
		};
	
		Object.defineProperty(RTCPeerConnection.prototype, 'localDescription', {
			configurable: true,
			get: function() {
				return this._localDescription;
			}
		});
		Object.defineProperty(RTCPeerConnection.prototype, 'remoteDescription', {
			configurable: true,
			get: function() {
				return this._remoteDescription;
			}
		});
	
		// set up event handlers on prototype
		RTCPeerConnection.prototype.onicecandidate = null;
		RTCPeerConnection.prototype.onaddstream = null;
		RTCPeerConnection.prototype.ontrack = null;
		RTCPeerConnection.prototype.onremovestream = null;
		RTCPeerConnection.prototype.onsignalingstatechange = null;
		RTCPeerConnection.prototype.oniceconnectionstatechange = null;
		RTCPeerConnection.prototype.onconnectionstatechange = null;
		RTCPeerConnection.prototype.onicegatheringstatechange = null;
		RTCPeerConnection.prototype.onnegotiationneeded = null;
		RTCPeerConnection.prototype.ondatachannel = null;
	
		RTCPeerConnection.prototype._dispatchEvent = function(name, event) {
			if (this._isClosed) {
				return;
			}
			this.dispatchEvent(event);
			if (typeof this['on' + name] === 'function') {
				this['on' + name](event);
			}
		};
	
		RTCPeerConnection.prototype._emitGatheringStateChange = function() {
			var event = new Event('icegatheringstatechange');
			this._dispatchEvent('icegatheringstatechange', event);
		};
	
		RTCPeerConnection.prototype.getConfiguration = function() {
			return this._config;
		};
	
		RTCPeerConnection.prototype.getLocalStreams = function() {
			return this.localStreams;
		};
	
		RTCPeerConnection.prototype.getRemoteStreams = function() {
			return this.remoteStreams;
		};
	
		// internal helper to create a transceiver object.
		// (which is not yet the same as the WebRTC 1.0 transceiver)
		RTCPeerConnection.prototype._createTransceiver = function(kind, doNotAdd) {
			var hasBundleTransport = this.transceivers.length > 0;
			var transceiver = {
				track: null,
				iceGatherer: null,
				iceTransport: null,
				dtlsTransport: null,
				localCapabilities: null,
				remoteCapabilities: null,
				rtpSender: null,
				rtpReceiver: null,
				kind: kind,
				mid: null,
				sendEncodingParameters: null,
				recvEncodingParameters: null,
				stream: null,
				associatedRemoteMediaStreams: [],
				wantReceive: true
			};
			if (this.usingBundle && hasBundleTransport) {
				transceiver.iceTransport = this.transceivers[0].iceTransport;
				transceiver.dtlsTransport = this.transceivers[0].dtlsTransport;
			} else {
				var transports = this._createIceAndDtlsTransports();
				transceiver.iceTransport = transports.iceTransport;
				transceiver.dtlsTransport = transports.dtlsTransport;
			}
			if (!doNotAdd) {
				this.transceivers.push(transceiver);
			}
			return transceiver;
		};
	
		RTCPeerConnection.prototype.addTrack = function(track, stream) {
			if (this._isClosed) {
				throw makeError('InvalidStateError',
						'Attempted to call addTrack on a closed peerconnection.');
			}
	
			var alreadyExists = this.transceivers.find(function(s) {
				return s.track === track;
			});
	
			if (alreadyExists) {
				throw makeError('InvalidAccessError', 'Track already exists.');
			}
	
			var transceiver;
			for (var i = 0; i < this.transceivers.length; i++) {
				if (!this.transceivers[i].track &&
						this.transceivers[i].kind === track.kind) {
					transceiver = this.transceivers[i];
				}
			}
			if (!transceiver) {
				transceiver = this._createTransceiver(track.kind);
			}
	
			this._maybeFireNegotiationNeeded();
	
			if (this.localStreams.indexOf(stream) === -1) {
				this.localStreams.push(stream);
			}
	
			transceiver.track = track;
			transceiver.stream = stream;
			transceiver.rtpSender = new window.RTCRtpSender(track,
					transceiver.dtlsTransport);
			return transceiver.rtpSender;
		};
	
		RTCPeerConnection.prototype.addStream = function(stream) {
			var pc = this;
			if (edgeVersion >= 15025) {
				stream.getTracks().forEach(function(track) {
					pc.addTrack(track, stream);
				});
			} else {
				// Clone is necessary for local demos mostly, attaching directly
				// to two different senders does not work (build 10547).
				// Fixed in 15025 (or earlier)
				var clonedStream = stream.clone();
				stream.getTracks().forEach(function(track, idx) {
					var clonedTrack = clonedStream.getTracks()[idx];
					track.addEventListener('enabled', function(event) {
						clonedTrack.enabled = event.enabled;
					});
				});
				clonedStream.getTracks().forEach(function(track) {
					pc.addTrack(track, clonedStream);
				});
			}
		};
	
		RTCPeerConnection.prototype.removeTrack = function(sender) {
			if (this._isClosed) {
				throw makeError('InvalidStateError',
						'Attempted to call removeTrack on a closed peerconnection.');
			}
	
			if (!(sender instanceof window.RTCRtpSender)) {
				throw new TypeError('Argument 1 of RTCPeerConnection.removeTrack ' +
						'does not implement interface RTCRtpSender.');
			}
	
			var transceiver = this.transceivers.find(function(t) {
				return t.rtpSender === sender;
			});
	
			if (!transceiver) {
				throw makeError('InvalidAccessError',
						'Sender was not created by this connection.');
			}
			var stream = transceiver.stream;
	
			transceiver.rtpSender.stop();
			transceiver.rtpSender = null;
			transceiver.track = null;
			transceiver.stream = null;
	
			// remove the stream from the set of local streams
			var localStreams = this.transceivers.map(function(t) {
				return t.stream;
			});
			if (localStreams.indexOf(stream) === -1 &&
					this.localStreams.indexOf(stream) > -1) {
				this.localStreams.splice(this.localStreams.indexOf(stream), 1);
			}
	
			this._maybeFireNegotiationNeeded();
		};
	
		RTCPeerConnection.prototype.removeStream = function(stream) {
			var pc = this;
			stream.getTracks().forEach(function(track) {
				var sender = pc.getSenders().find(function(s) {
					return s.track === track;
				});
				if (sender) {
					pc.removeTrack(sender);
				}
			});
		};
	
		RTCPeerConnection.prototype.getSenders = function() {
			return this.transceivers.filter(function(transceiver) {
				return !!transceiver.rtpSender;
			})
			.map(function(transceiver) {
				return transceiver.rtpSender;
			});
		};
	
		RTCPeerConnection.prototype.getReceivers = function() {
			return this.transceivers.filter(function(transceiver) {
				return !!transceiver.rtpReceiver;
			})
			.map(function(transceiver) {
				return transceiver.rtpReceiver;
			});
		};
	
	
		RTCPeerConnection.prototype._createIceGatherer = function(sdpMLineIndex,
				usingBundle) {
			var pc = this;
			if (usingBundle && sdpMLineIndex > 0) {
				return this.transceivers[0].iceGatherer;
			} else if (this._iceGatherers.length) {
				return this._iceGatherers.shift();
			}
			var iceGatherer = new window.RTCIceGatherer({
				iceServers: this._config.iceServers,
				gatherPolicy: this._config.iceTransportPolicy
			});
			Object.defineProperty(iceGatherer, 'state',
					{value: 'new', writable: true}
			);
	
			this.transceivers[sdpMLineIndex].bufferedCandidateEvents = [];
			this.transceivers[sdpMLineIndex].bufferCandidates = function(event) {
				var end = !event.candidate || Object.keys(event.candidate).length === 0;
				// polyfill since RTCIceGatherer.state is not implemented in
				// Edge 10547 yet.
				iceGatherer.state = end ? 'completed' : 'gathering';
				if (pc.transceivers[sdpMLineIndex].bufferedCandidateEvents !== null) {
					pc.transceivers[sdpMLineIndex].bufferedCandidateEvents.push(event);
				}
			};
			iceGatherer.addEventListener('localcandidate',
				this.transceivers[sdpMLineIndex].bufferCandidates);
			return iceGatherer;
		};
	
		// start gathering from an RTCIceGatherer.
		RTCPeerConnection.prototype._gather = function(mid, sdpMLineIndex) {
			var pc = this;
			var iceGatherer = this.transceivers[sdpMLineIndex].iceGatherer;
			if (iceGatherer.onlocalcandidate) {
				return;
			}
			var bufferedCandidateEvents =
				this.transceivers[sdpMLineIndex].bufferedCandidateEvents;
			this.transceivers[sdpMLineIndex].bufferedCandidateEvents = null;
			iceGatherer.removeEventListener('localcandidate',
				this.transceivers[sdpMLineIndex].bufferCandidates);
			iceGatherer.onlocalcandidate = function(evt) {
				if (pc.usingBundle && sdpMLineIndex > 0) {
					// if we know that we use bundle we can drop candidates with
					// ѕdpMLineIndex > 0. If we don't do this then our state gets
					// confused since we dispose the extra ice gatherer.
					return;
				}
				var event = new Event('icecandidate');
				event.candidate = {sdpMid: mid, sdpMLineIndex: sdpMLineIndex};
	
				var cand = evt.candidate;
				// Edge emits an empty object for RTCIceCandidateComplete‥
				var end = !cand || Object.keys(cand).length === 0;
				if (end) {
					// polyfill since RTCIceGatherer.state is not implemented in
					// Edge 10547 yet.
					if (iceGatherer.state === 'new' || iceGatherer.state === 'gathering') {
						iceGatherer.state = 'completed';
					}
				} else {
					if (iceGatherer.state === 'new') {
						iceGatherer.state = 'gathering';
					}
					// RTCIceCandidate doesn't have a component, needs to be added
					cand.component = 1;
					// also the usernameFragment. TODO: update SDP to take both variants.
					cand.ufrag = iceGatherer.getLocalParameters().usernameFragment;
	
					var serializedCandidate = SDPUtils.writeCandidate(cand);
					event.candidate = Object.assign(event.candidate,
							SDPUtils.parseCandidate(serializedCandidate));
	
					event.candidate.candidate = serializedCandidate;
					event.candidate.toJSON = function() {
						return {
							candidate: event.candidate.candidate,
							sdpMid: event.candidate.sdpMid,
							sdpMLineIndex: event.candidate.sdpMLineIndex,
							usernameFragment: event.candidate.usernameFragment
						};
					};
				}
	
				// update local description.
				var sections = SDPUtils.getMediaSections(pc._localDescription.sdp);
				if (!end) {
					sections[event.candidate.sdpMLineIndex] +=
							'a=' + event.candidate.candidate + '\r\n';
				} else {
					sections[event.candidate.sdpMLineIndex] +=
							'a=end-of-candidates\r\n';
				}
				pc._localDescription.sdp =
						SDPUtils.getDescription(pc._localDescription.sdp) +
						sections.join('');
				var complete = pc.transceivers.every(function(transceiver) {
					return transceiver.iceGatherer &&
							transceiver.iceGatherer.state === 'completed';
				});
	
				if (pc.iceGatheringState !== 'gathering') {
					pc.iceGatheringState = 'gathering';
					pc._emitGatheringStateChange();
				}
	
				// Emit candidate. Also emit null candidate when all gatherers are
				// complete.
				if (!end) {
					pc._dispatchEvent('icecandidate', event);
				}
				if (complete) {
					pc._dispatchEvent('icecandidate', new Event('icecandidate'));
					pc.iceGatheringState = 'complete';
					pc._emitGatheringStateChange();
				}
			};
	
			// emit already gathered candidates.
			window.setTimeout(function() {
				bufferedCandidateEvents.forEach(function(e) {
					iceGatherer.onlocalcandidate(e);
				});
			}, 0);
		};
	
		// Create ICE transport and DTLS transport.
		RTCPeerConnection.prototype._createIceAndDtlsTransports = function() {
			var pc = this;
			var iceTransport = new window.RTCIceTransport(null);
			iceTransport.onicestatechange = function() {
				pc._updateIceConnectionState();
				pc._updateConnectionState();
			};
	
			var dtlsTransport = new window.RTCDtlsTransport(iceTransport);
			dtlsTransport.ondtlsstatechange = function() {
				pc._updateConnectionState();
			};
			dtlsTransport.onerror = function() {
				// onerror does not set state to failed by itself.
				Object.defineProperty(dtlsTransport, 'state',
						{value: 'failed', writable: true});
				pc._updateConnectionState();
			};
	
			return {
				iceTransport: iceTransport,
				dtlsTransport: dtlsTransport
			};
		};
	
		// Destroy ICE gatherer, ICE transport and DTLS transport.
		// Without triggering the callbacks.
		RTCPeerConnection.prototype._disposeIceAndDtlsTransports = function(
				sdpMLineIndex) {
			var iceGatherer = this.transceivers[sdpMLineIndex].iceGatherer;
			if (iceGatherer) {
				delete iceGatherer.onlocalcandidate;
				delete this.transceivers[sdpMLineIndex].iceGatherer;
			}
			var iceTransport = this.transceivers[sdpMLineIndex].iceTransport;
			if (iceTransport) {
				delete iceTransport.onicestatechange;
				delete this.transceivers[sdpMLineIndex].iceTransport;
			}
			var dtlsTransport = this.transceivers[sdpMLineIndex].dtlsTransport;
			if (dtlsTransport) {
				delete dtlsTransport.ondtlsstatechange;
				delete dtlsTransport.onerror;
				delete this.transceivers[sdpMLineIndex].dtlsTransport;
			}
		};
	
		// Start the RTP Sender and Receiver for a transceiver.
		RTCPeerConnection.prototype._transceive = function(transceiver,
				send, recv) {
			var params = getCommonCapabilities(transceiver.localCapabilities,
					transceiver.remoteCapabilities);
			if (send && transceiver.rtpSender) {
				params.encodings = transceiver.sendEncodingParameters;
				params.rtcp = {
					cname: SDPUtils.localCName,
					compound: transceiver.rtcpParameters.compound
				};
				if (transceiver.recvEncodingParameters.length) {
					params.rtcp.ssrc = transceiver.recvEncodingParameters[0].ssrc;
				}
				transceiver.rtpSender.send(params);
			}
			if (recv && transceiver.rtpReceiver && params.codecs.length > 0) {
				// remove RTX field in Edge 14942
				if (transceiver.kind === 'video'
						&& transceiver.recvEncodingParameters
						&& edgeVersion < 15019) {
					transceiver.recvEncodingParameters.forEach(function(p) {
						delete p.rtx;
					});
				}
				if (transceiver.recvEncodingParameters.length) {
					params.encodings = transceiver.recvEncodingParameters;
				} else {
					params.encodings = [{}];
				}
				params.rtcp = {
					compound: transceiver.rtcpParameters.compound
				};
				if (transceiver.rtcpParameters.cname) {
					params.rtcp.cname = transceiver.rtcpParameters.cname;
				}
				if (transceiver.sendEncodingParameters.length) {
					params.rtcp.ssrc = transceiver.sendEncodingParameters[0].ssrc;
				}
				transceiver.rtpReceiver.receive(params);
			}
		};
	
		RTCPeerConnection.prototype.setLocalDescription = function(description) {
			var pc = this;
	
			// Note: pranswer is not supported.
			if (['offer', 'answer'].indexOf(description.type) === -1) {
				return Promise.reject(makeError('TypeError',
						'Unsupported type "' + description.type + '"'));
			}
	
			if (!isActionAllowedInSignalingState('setLocalDescription',
					description.type, pc.signalingState) || pc._isClosed) {
				return Promise.reject(makeError('InvalidStateError',
						'Can not set local ' + description.type +
						' in state ' + pc.signalingState));
			}
	
			var sections;
			var sessionpart;
			if (description.type === 'offer') {
				// VERY limited support for SDP munging. Limited to:
				// * changing the order of codecs
				sections = SDPUtils.splitSections(description.sdp);
				sessionpart = sections.shift();
				sections.forEach(function(mediaSection, sdpMLineIndex) {
					var caps = SDPUtils.parseRtpParameters(mediaSection);
					pc.transceivers[sdpMLineIndex].localCapabilities = caps;
				});
	
				pc.transceivers.forEach(function(transceiver, sdpMLineIndex) {
					pc._gather(transceiver.mid, sdpMLineIndex);
				});
			} else if (description.type === 'answer') {
				sections = SDPUtils.splitSections(pc._remoteDescription.sdp);
				sessionpart = sections.shift();
				var isIceLite = SDPUtils.matchPrefix(sessionpart,
						'a=ice-lite').length > 0;
				sections.forEach(function(mediaSection, sdpMLineIndex) {
					var transceiver = pc.transceivers[sdpMLineIndex];
					var iceGatherer = transceiver.iceGatherer;
					var iceTransport = transceiver.iceTransport;
					var dtlsTransport = transceiver.dtlsTransport;
					var localCapabilities = transceiver.localCapabilities;
					var remoteCapabilities = transceiver.remoteCapabilities;
	
					// treat bundle-only as not-rejected.
					var rejected = SDPUtils.isRejected(mediaSection) &&
							SDPUtils.matchPrefix(mediaSection, 'a=bundle-only').length === 0;
	
					if (!rejected && !transceiver.rejected) {
						var remoteIceParameters = SDPUtils.getIceParameters(
								mediaSection, sessionpart);
						var remoteDtlsParameters = SDPUtils.getDtlsParameters(
								mediaSection, sessionpart);
						if (isIceLite) {
							remoteDtlsParameters.role = 'server';
						}
	
						if (!pc.usingBundle || sdpMLineIndex === 0) {
							pc._gather(transceiver.mid, sdpMLineIndex);
							if (iceTransport.state === 'new') {
								iceTransport.start(iceGatherer, remoteIceParameters,
										isIceLite ? 'controlling' : 'controlled');
							}
							if (dtlsTransport.state === 'new') {
								dtlsTransport.start(remoteDtlsParameters);
							}
						}
	
						// Calculate intersection of capabilities.
						var params = getCommonCapabilities(localCapabilities,
								remoteCapabilities);
	
						// Start the RTCRtpSender. The RTCRtpReceiver for this
						// transceiver has already been started in setRemoteDescription.
						pc._transceive(transceiver,
								params.codecs.length > 0,
								false);
					}
				});
			}
	
			pc._localDescription = {
				type: description.type,
				sdp: description.sdp
			};
			if (description.type === 'offer') {
				pc._updateSignalingState('have-local-offer');
			} else {
				pc._updateSignalingState('stable');
			}
	
			return Promise.resolve();
		};
	
		RTCPeerConnection.prototype.setRemoteDescription = function(description) {
			var pc = this;
	
			// Note: pranswer is not supported.
			if (['offer', 'answer'].indexOf(description.type) === -1) {
				return Promise.reject(makeError('TypeError',
						'Unsupported type "' + description.type + '"'));
			}
	
			if (!isActionAllowedInSignalingState('setRemoteDescription',
					description.type, pc.signalingState) || pc._isClosed) {
				return Promise.reject(makeError('InvalidStateError',
						'Can not set remote ' + description.type +
						' in state ' + pc.signalingState));
			}
	
			var streams = {};
			pc.remoteStreams.forEach(function(stream) {
				streams[stream.id] = stream;
			});
			var receiverList = [];
			var sections = SDPUtils.splitSections(description.sdp);
			var sessionpart = sections.shift();
			var isIceLite = SDPUtils.matchPrefix(sessionpart,
					'a=ice-lite').length > 0;
			var usingBundle = SDPUtils.matchPrefix(sessionpart,
					'a=group:BUNDLE ').length > 0;
			pc.usingBundle = usingBundle;
			var iceOptions = SDPUtils.matchPrefix(sessionpart,
					'a=ice-options:')[0];
			if (iceOptions) {
				pc.canTrickleIceCandidates = iceOptions.substr(14).split(' ')
						.indexOf('trickle') >= 0;
			} else {
				pc.canTrickleIceCandidates = false;
			}
	
			sections.forEach(function(mediaSection, sdpMLineIndex) {
				var lines = SDPUtils.splitLines(mediaSection);
				var kind = SDPUtils.getKind(mediaSection);
				// treat bundle-only as not-rejected.
				var rejected = SDPUtils.isRejected(mediaSection) &&
						SDPUtils.matchPrefix(mediaSection, 'a=bundle-only').length === 0;
				var protocol = lines[0].substr(2).split(' ')[2];
	
				var direction = SDPUtils.getDirection(mediaSection, sessionpart);
				var remoteMsid = SDPUtils.parseMsid(mediaSection);
	
				var mid = SDPUtils.getMid(mediaSection) || SDPUtils.generateIdentifier();
	
				// Reject datachannels which are not implemented yet.
				if (rejected || (kind === 'application' && (protocol === 'DTLS/SCTP' ||
						protocol === 'UDP/DTLS/SCTP'))) {
					// TODO: this is dangerous in the case where a non-rejected m-line
					//     becomes rejected.
					pc.transceivers[sdpMLineIndex] = {
						mid: mid,
						kind: kind,
						protocol: protocol,
						rejected: true
					};
					return;
				}
	
				if (!rejected && pc.transceivers[sdpMLineIndex] &&
						pc.transceivers[sdpMLineIndex].rejected) {
					// recycle a rejected transceiver.
					pc.transceivers[sdpMLineIndex] = pc._createTransceiver(kind, true);
				}
	
				var transceiver;
				var iceGatherer;
				var iceTransport;
				var dtlsTransport;
				var rtpReceiver;
				var sendEncodingParameters;
				var recvEncodingParameters;
				var localCapabilities;
	
				var track;
				// FIXME: ensure the mediaSection has rtcp-mux set.
				var remoteCapabilities = SDPUtils.parseRtpParameters(mediaSection);
				var remoteIceParameters;
				var remoteDtlsParameters;
				if (!rejected) {
					remoteIceParameters = SDPUtils.getIceParameters(mediaSection,
							sessionpart);
					remoteDtlsParameters = SDPUtils.getDtlsParameters(mediaSection,
							sessionpart);
					remoteDtlsParameters.role = 'client';
				}
				recvEncodingParameters =
						SDPUtils.parseRtpEncodingParameters(mediaSection);
	
				var rtcpParameters = SDPUtils.parseRtcpParameters(mediaSection);
	
				var isComplete = SDPUtils.matchPrefix(mediaSection,
						'a=end-of-candidates', sessionpart).length > 0;
				var cands = SDPUtils.matchPrefix(mediaSection, 'a=candidate:')
						.map(function(cand) {
							return SDPUtils.parseCandidate(cand);
						})
						.filter(function(cand) {
							return cand.component === 1;
						});
	
				// Check if we can use BUNDLE and dispose transports.
				if ((description.type === 'offer' || description.type === 'answer') &&
						!rejected && usingBundle && sdpMLineIndex > 0 &&
						pc.transceivers[sdpMLineIndex]) {
					pc._disposeIceAndDtlsTransports(sdpMLineIndex);
					pc.transceivers[sdpMLineIndex].iceGatherer =
							pc.transceivers[0].iceGatherer;
					pc.transceivers[sdpMLineIndex].iceTransport =
							pc.transceivers[0].iceTransport;
					pc.transceivers[sdpMLineIndex].dtlsTransport =
							pc.transceivers[0].dtlsTransport;
					if (pc.transceivers[sdpMLineIndex].rtpSender) {
						pc.transceivers[sdpMLineIndex].rtpSender.setTransport(
								pc.transceivers[0].dtlsTransport);
					}
					if (pc.transceivers[sdpMLineIndex].rtpReceiver) {
						pc.transceivers[sdpMLineIndex].rtpReceiver.setTransport(
								pc.transceivers[0].dtlsTransport);
					}
				}
				if (description.type === 'offer' && !rejected) {
					transceiver = pc.transceivers[sdpMLineIndex] ||
							pc._createTransceiver(kind);
					transceiver.mid = mid;
	
					if (!transceiver.iceGatherer) {
						transceiver.iceGatherer = pc._createIceGatherer(sdpMLineIndex,
								usingBundle);
					}
	
					if (cands.length && transceiver.iceTransport.state === 'new') {
						if (isComplete && (!usingBundle || sdpMLineIndex === 0)) {
							transceiver.iceTransport.setRemoteCandidates(cands);
						} else {
							cands.forEach(function(candidate) {
								maybeAddCandidate(transceiver.iceTransport, candidate);
							});
						}
					}
	
					localCapabilities = window.RTCRtpReceiver.getCapabilities(kind);
	
					// filter RTX until additional stuff needed for RTX is implemented
					// in adapter.js
					if (edgeVersion < 15019) {
						localCapabilities.codecs = localCapabilities.codecs.filter(
								function(codec) {
									return codec.name !== 'rtx';
								});
					}
	
					sendEncodingParameters = transceiver.sendEncodingParameters || [{
						ssrc: (2 * sdpMLineIndex + 2) * 1001
					}];
	
					// TODO: rewrite to use http://w3c.github.io/webrtc-pc/#set-associated-remote-streams
					var isNewTrack = false;
					if (direction === 'sendrecv' || direction === 'sendonly') {
						isNewTrack = !transceiver.rtpReceiver;
						rtpReceiver = transceiver.rtpReceiver ||
								new window.RTCRtpReceiver(transceiver.dtlsTransport, kind);
	
						if (isNewTrack) {
							var stream;
							track = rtpReceiver.track;
							// FIXME: does not work with Plan B.
							if (remoteMsid && remoteMsid.stream === '-') {
								// no-op. a stream id of '-' means: no associated stream.
							} else if (remoteMsid) {
								if (!streams[remoteMsid.stream]) {
									streams[remoteMsid.stream] = new window.MediaStream();
									Object.defineProperty(streams[remoteMsid.stream], 'id', {
										get: function() {
											return remoteMsid.stream;
										}
									});
								}
								Object.defineProperty(track, 'id', {
									get: function() {
										return remoteMsid.track;
									}
								});
								stream = streams[remoteMsid.stream];
							} else {
								if (!streams.default) {
									streams.default = new window.MediaStream();
								}
								stream = streams.default;
							}
							if (stream) {
								addTrackToStreamAndFireEvent(track, stream);
								transceiver.associatedRemoteMediaStreams.push(stream);
							}
							receiverList.push([track, rtpReceiver, stream]);
						}
					} else if (transceiver.rtpReceiver && transceiver.rtpReceiver.track) {
						transceiver.associatedRemoteMediaStreams.forEach(function(s) {
							var nativeTrack = s.getTracks().find(function(t) {
								return t.id === transceiver.rtpReceiver.track.id;
							});
							if (nativeTrack) {
								removeTrackFromStreamAndFireEvent(nativeTrack, s);
							}
						});
						transceiver.associatedRemoteMediaStreams = [];
					}
	
					transceiver.localCapabilities = localCapabilities;
					transceiver.remoteCapabilities = remoteCapabilities;
					transceiver.rtpReceiver = rtpReceiver;
					transceiver.rtcpParameters = rtcpParameters;
					transceiver.sendEncodingParameters = sendEncodingParameters;
					transceiver.recvEncodingParameters = recvEncodingParameters;
	
					// Start the RTCRtpReceiver now. The RTPSender is started in
					// setLocalDescription.
					pc._transceive(pc.transceivers[sdpMLineIndex],
							false,
							isNewTrack);
				} else if (description.type === 'answer' && !rejected) {
					transceiver = pc.transceivers[sdpMLineIndex];
					iceGatherer = transceiver.iceGatherer;
					iceTransport = transceiver.iceTransport;
					dtlsTransport = transceiver.dtlsTransport;
					rtpReceiver = transceiver.rtpReceiver;
					sendEncodingParameters = transceiver.sendEncodingParameters;
					localCapabilities = transceiver.localCapabilities;
	
					pc.transceivers[sdpMLineIndex].recvEncodingParameters =
							recvEncodingParameters;
					pc.transceivers[sdpMLineIndex].remoteCapabilities =
							remoteCapabilities;
					pc.transceivers[sdpMLineIndex].rtcpParameters = rtcpParameters;
	
					if (cands.length && iceTransport.state === 'new') {
						if ((isIceLite || isComplete) &&
								(!usingBundle || sdpMLineIndex === 0)) {
							iceTransport.setRemoteCandidates(cands);
						} else {
							cands.forEach(function(candidate) {
								maybeAddCandidate(transceiver.iceTransport, candidate);
							});
						}
					}
	
					if (!usingBundle || sdpMLineIndex === 0) {
						if (iceTransport.state === 'new') {
							iceTransport.start(iceGatherer, remoteIceParameters,
									'controlling');
						}
						if (dtlsTransport.state === 'new') {
							dtlsTransport.start(remoteDtlsParameters);
						}
					}
	
					// If the offer contained RTX but the answer did not,
					// remove RTX from sendEncodingParameters.
					var commonCapabilities = getCommonCapabilities(
						transceiver.localCapabilities,
						transceiver.remoteCapabilities);
	
					var hasRtx = commonCapabilities.codecs.filter(function(c) {
						return c.name.toLowerCase() === 'rtx';
					}).length;
					if (!hasRtx && transceiver.sendEncodingParameters[0].rtx) {
						delete transceiver.sendEncodingParameters[0].rtx;
					}
	
					pc._transceive(transceiver,
							direction === 'sendrecv' || direction === 'recvonly',
							direction === 'sendrecv' || direction === 'sendonly');
	
					// TODO: rewrite to use http://w3c.github.io/webrtc-pc/#set-associated-remote-streams
					if (rtpReceiver &&
							(direction === 'sendrecv' || direction === 'sendonly')) {
						track = rtpReceiver.track;
						if (remoteMsid) {
							if (!streams[remoteMsid.stream]) {
								streams[remoteMsid.stream] = new window.MediaStream();
							}
							addTrackToStreamAndFireEvent(track, streams[remoteMsid.stream]);
							receiverList.push([track, rtpReceiver, streams[remoteMsid.stream]]);
						} else {
							if (!streams.default) {
								streams.default = new window.MediaStream();
							}
							addTrackToStreamAndFireEvent(track, streams.default);
							receiverList.push([track, rtpReceiver, streams.default]);
						}
					} else {
						// FIXME: actually the receiver should be created later.
						delete transceiver.rtpReceiver;
					}
				}
			});
	
			if (pc._dtlsRole === undefined) {
				pc._dtlsRole = description.type === 'offer' ? 'active' : 'passive';
			}
	
			pc._remoteDescription = {
				type: description.type,
				sdp: description.sdp
			};
			if (description.type === 'offer') {
				pc._updateSignalingState('have-remote-offer');
			} else {
				pc._updateSignalingState('stable');
			}
			Object.keys(streams).forEach(function(sid) {
				var stream = streams[sid];
				if (stream.getTracks().length) {
					if (pc.remoteStreams.indexOf(stream) === -1) {
						pc.remoteStreams.push(stream);
						var event = new Event('addstream');
						event.stream = stream;
						window.setTimeout(function() {
							pc._dispatchEvent('addstream', event);
						});
					}
	
					receiverList.forEach(function(item) {
						var track = item[0];
						var receiver = item[1];
						if (stream.id !== item[2].id) {
							return;
						}
						fireAddTrack(pc, track, receiver, [stream]);
					});
				}
			});
			receiverList.forEach(function(item) {
				if (item[2]) {
					return;
				}
				fireAddTrack(pc, item[0], item[1], []);
			});
	
			// check whether addIceCandidate({}) was called within four seconds after
			// setRemoteDescription.
			window.setTimeout(function() {
				if (!(pc && pc.transceivers)) {
					return;
				}
				pc.transceivers.forEach(function(transceiver) {
					if (transceiver.iceTransport &&
							transceiver.iceTransport.state === 'new' &&
							transceiver.iceTransport.getRemoteCandidates().length > 0) {
						console.warn('Timeout for addRemoteCandidate. Consider sending ' +
								'an end-of-candidates notification');
						transceiver.iceTransport.addRemoteCandidate({});
					}
				});
			}, 4000);
	
			return Promise.resolve();
		};
	
		RTCPeerConnection.prototype.close = function() {
			this.transceivers.forEach(function(transceiver) {
				/* not yet
				if (transceiver.iceGatherer) {
					transceiver.iceGatherer.close();
				}
				*/
				if (transceiver.iceTransport) {
					transceiver.iceTransport.stop();
				}
				if (transceiver.dtlsTransport) {
					transceiver.dtlsTransport.stop();
				}
				if (transceiver.rtpSender) {
					transceiver.rtpSender.stop();
				}
				if (transceiver.rtpReceiver) {
					transceiver.rtpReceiver.stop();
				}
			});
			// FIXME: clean up tracks, local streams, remote streams, etc
			this._isClosed = true;
			this._updateSignalingState('closed');
		};
	
		// Update the signaling state.
		RTCPeerConnection.prototype._updateSignalingState = function(newState) {
			this.signalingState = newState;
			var event = new Event('signalingstatechange');
			this._dispatchEvent('signalingstatechange', event);
		};
	
		// Determine whether to fire the negotiationneeded event.
		RTCPeerConnection.prototype._maybeFireNegotiationNeeded = function() {
			var pc = this;
			if (this.signalingState !== 'stable' || this.needNegotiation === true) {
				return;
			}
			this.needNegotiation = true;
			window.setTimeout(function() {
				if (pc.needNegotiation) {
					pc.needNegotiation = false;
					var event = new Event('negotiationneeded');
					pc._dispatchEvent('negotiationneeded', event);
				}
			}, 0);
		};
	
		// Update the ice connection state.
		RTCPeerConnection.prototype._updateIceConnectionState = function() {
			var newState;
			var states = {
				'new': 0,
				closed: 0,
				checking: 0,
				connected: 0,
				completed: 0,
				disconnected: 0,
				failed: 0
			};
			this.transceivers.forEach(function(transceiver) {
				if (transceiver.iceTransport && !transceiver.rejected) {
					states[transceiver.iceTransport.state]++;
				}
			});
	
			newState = 'new';
			if (states.failed > 0) {
				newState = 'failed';
			} else if (states.checking > 0) {
				newState = 'checking';
			} else if (states.disconnected > 0) {
				newState = 'disconnected';
			} else if (states.new > 0) {
				newState = 'new';
			} else if (states.connected > 0) {
				newState = 'connected';
			} else if (states.completed > 0) {
				newState = 'completed';
			}
	
			if (newState !== this.iceConnectionState) {
				this.iceConnectionState = newState;
				var event = new Event('iceconnectionstatechange');
				this._dispatchEvent('iceconnectionstatechange', event);
			}
		};
	
		// Update the connection state.
		RTCPeerConnection.prototype._updateConnectionState = function() {
			var newState;
			var states = {
				'new': 0,
				closed: 0,
				connecting: 0,
				connected: 0,
				completed: 0,
				disconnected: 0,
				failed: 0
			};
			this.transceivers.forEach(function(transceiver) {
				if (transceiver.iceTransport && transceiver.dtlsTransport &&
						!transceiver.rejected) {
					states[transceiver.iceTransport.state]++;
					states[transceiver.dtlsTransport.state]++;
				}
			});
			// ICETransport.completed and connected are the same for this purpose.
			states.connected += states.completed;
	
			newState = 'new';
			if (states.failed > 0) {
				newState = 'failed';
			} else if (states.connecting > 0) {
				newState = 'connecting';
			} else if (states.disconnected > 0) {
				newState = 'disconnected';
			} else if (states.new > 0) {
				newState = 'new';
			} else if (states.connected > 0) {
				newState = 'connected';
			}
	
			if (newState !== this.connectionState) {
				this.connectionState = newState;
				var event = new Event('connectionstatechange');
				this._dispatchEvent('connectionstatechange', event);
			}
		};
	
		RTCPeerConnection.prototype.createOffer = function() {
			var pc = this;
	
			if (pc._isClosed) {
				return Promise.reject(makeError('InvalidStateError',
						'Can not call createOffer after close'));
			}
	
			var numAudioTracks = pc.transceivers.filter(function(t) {
				return t.kind === 'audio';
			}).length;
			var numVideoTracks = pc.transceivers.filter(function(t) {
				return t.kind === 'video';
			}).length;
	
			// Determine number of audio and video tracks we need to send/recv.
			var offerOptions = arguments[0];
			if (offerOptions) {
				// Reject Chrome legacy constraints.
				if (offerOptions.mandatory || offerOptions.optional) {
					throw new TypeError(
							'Legacy mandatory/optional constraints not supported.');
				}
				if (offerOptions.offerToReceiveAudio !== undefined) {
					if (offerOptions.offerToReceiveAudio === true) {
						numAudioTracks = 1;
					} else if (offerOptions.offerToReceiveAudio === false) {
						numAudioTracks = 0;
					} else {
						numAudioTracks = offerOptions.offerToReceiveAudio;
					}
				}
				if (offerOptions.offerToReceiveVideo !== undefined) {
					if (offerOptions.offerToReceiveVideo === true) {
						numVideoTracks = 1;
					} else if (offerOptions.offerToReceiveVideo === false) {
						numVideoTracks = 0;
					} else {
						numVideoTracks = offerOptions.offerToReceiveVideo;
					}
				}
			}
	
			pc.transceivers.forEach(function(transceiver) {
				if (transceiver.kind === 'audio') {
					numAudioTracks--;
					if (numAudioTracks < 0) {
						transceiver.wantReceive = false;
					}
				} else if (transceiver.kind === 'video') {
					numVideoTracks--;
					if (numVideoTracks < 0) {
						transceiver.wantReceive = false;
					}
				}
			});
	
			// Create M-lines for recvonly streams.
			while (numAudioTracks > 0 || numVideoTracks > 0) {
				if (numAudioTracks > 0) {
					pc._createTransceiver('audio');
					numAudioTracks--;
				}
				if (numVideoTracks > 0) {
					pc._createTransceiver('video');
					numVideoTracks--;
				}
			}
	
			var sdp = SDPUtils.writeSessionBoilerplate(pc._sdpSessionId,
					pc._sdpSessionVersion++);
			pc.transceivers.forEach(function(transceiver, sdpMLineIndex) {
				// For each track, create an ice gatherer, ice transport,
				// dtls transport, potentially rtpsender and rtpreceiver.
				var track = transceiver.track;
				var kind = transceiver.kind;
				var mid = transceiver.mid || SDPUtils.generateIdentifier();
				transceiver.mid = mid;
	
				if (!transceiver.iceGatherer) {
					transceiver.iceGatherer = pc._createIceGatherer(sdpMLineIndex,
							pc.usingBundle);
				}
	
				var localCapabilities = window.RTCRtpSender.getCapabilities(kind);
				// filter RTX until additional stuff needed for RTX is implemented
				// in adapter.js
				if (edgeVersion < 15019) {
					localCapabilities.codecs = localCapabilities.codecs.filter(
							function(codec) {
								return codec.name !== 'rtx';
							});
				}
				localCapabilities.codecs.forEach(function(codec) {
					// work around https://bugs.chromium.org/p/webrtc/issues/detail?id=6552
					// by adding level-asymmetry-allowed=1
					if (codec.name === 'H264' &&
							codec.parameters['level-asymmetry-allowed'] === undefined) {
						codec.parameters['level-asymmetry-allowed'] = '1';
					}
	
					// for subsequent offers, we might have to re-use the payload
					// type of the last offer.
					if (transceiver.remoteCapabilities &&
							transceiver.remoteCapabilities.codecs) {
						transceiver.remoteCapabilities.codecs.forEach(function(remoteCodec) {
							if (codec.name.toLowerCase() === remoteCodec.name.toLowerCase() &&
									codec.clockRate === remoteCodec.clockRate) {
								codec.preferredPayloadType = remoteCodec.payloadType;
							}
						});
					}
				});
				localCapabilities.headerExtensions.forEach(function(hdrExt) {
					var remoteExtensions = transceiver.remoteCapabilities &&
							transceiver.remoteCapabilities.headerExtensions || [];
					remoteExtensions.forEach(function(rHdrExt) {
						if (hdrExt.uri === rHdrExt.uri) {
							hdrExt.id = rHdrExt.id;
						}
					});
				});
	
				// generate an ssrc now, to be used later in rtpSender.send
				var sendEncodingParameters = transceiver.sendEncodingParameters || [{
					ssrc: (2 * sdpMLineIndex + 1) * 1001
				}];
				if (track) {
					// add RTX
					if (edgeVersion >= 15019 && kind === 'video' &&
							!sendEncodingParameters[0].rtx) {
						sendEncodingParameters[0].rtx = {
							ssrc: sendEncodingParameters[0].ssrc + 1
						};
					}
				}
	
				if (transceiver.wantReceive) {
					transceiver.rtpReceiver = new window.RTCRtpReceiver(
							transceiver.dtlsTransport, kind);
				}
	
				transceiver.localCapabilities = localCapabilities;
				transceiver.sendEncodingParameters = sendEncodingParameters;
			});
	
			// always offer BUNDLE and dispose on return if not supported.
			if (pc._config.bundlePolicy !== 'max-compat') {
				sdp += 'a=group:BUNDLE ' + pc.transceivers.map(function(t) {
					return t.mid;
				}).join(' ') + '\r\n';
			}
			sdp += 'a=ice-options:trickle\r\n';
	
			pc.transceivers.forEach(function(transceiver, sdpMLineIndex) {
				sdp += writeMediaSection(transceiver, transceiver.localCapabilities,
						'offer', transceiver.stream, pc._dtlsRole);
				sdp += 'a=rtcp-rsize\r\n';
	
				if (transceiver.iceGatherer && pc.iceGatheringState !== 'new' &&
						(sdpMLineIndex === 0 || !pc.usingBundle)) {
					transceiver.iceGatherer.getLocalCandidates().forEach(function(cand) {
						cand.component = 1;
						sdp += 'a=' + SDPUtils.writeCandidate(cand) + '\r\n';
					});
	
					if (transceiver.iceGatherer.state === 'completed') {
						sdp += 'a=end-of-candidates\r\n';
					}
				}
			});
	
			var desc = new window.RTCSessionDescription({
				type: 'offer',
				sdp: sdp
			});
			return Promise.resolve(desc);
		};
	
		RTCPeerConnection.prototype.createAnswer = function() {
			var pc = this;
	
			if (pc._isClosed) {
				return Promise.reject(makeError('InvalidStateError',
						'Can not call createAnswer after close'));
			}
	
			if (!(pc.signalingState === 'have-remote-offer' ||
					pc.signalingState === 'have-local-pranswer')) {
				return Promise.reject(makeError('InvalidStateError',
						'Can not call createAnswer in signalingState ' + pc.signalingState));
			}
	
			var sdp = SDPUtils.writeSessionBoilerplate(pc._sdpSessionId,
					pc._sdpSessionVersion++);
			if (pc.usingBundle) {
				sdp += 'a=group:BUNDLE ' + pc.transceivers.map(function(t) {
					return t.mid;
				}).join(' ') + '\r\n';
			}
			sdp += 'a=ice-options:trickle\r\n';
	
			var mediaSectionsInOffer = SDPUtils.getMediaSections(
					pc._remoteDescription.sdp).length;
			pc.transceivers.forEach(function(transceiver, sdpMLineIndex) {
				if (sdpMLineIndex + 1 > mediaSectionsInOffer) {
					return;
				}
				if (transceiver.rejected) {
					if (transceiver.kind === 'application') {
						if (transceiver.protocol === 'DTLS/SCTP') { // legacy fmt
							sdp += 'm=application 0 DTLS/SCTP 5000\r\n';
						} else {
							sdp += 'm=application 0 ' + transceiver.protocol +
									' webrtc-datachannel\r\n';
						}
					} else if (transceiver.kind === 'audio') {
						sdp += 'm=audio 0 UDP/TLS/RTP/SAVPF 0\r\n' +
								'a=rtpmap:0 PCMU/8000\r\n';
					} else if (transceiver.kind === 'video') {
						sdp += 'm=video 0 UDP/TLS/RTP/SAVPF 120\r\n' +
								'a=rtpmap:120 VP8/90000\r\n';
					}
					sdp += 'c=IN IP4 0.0.0.0\r\n' +
							'a=inactive\r\n' +
							'a=mid:' + transceiver.mid + '\r\n';
					return;
				}
	
				// FIXME: look at direction.
				if (transceiver.stream) {
					var localTrack;
					if (transceiver.kind === 'audio') {
						localTrack = transceiver.stream.getAudioTracks()[0];
					} else if (transceiver.kind === 'video') {
						localTrack = transceiver.stream.getVideoTracks()[0];
					}
					if (localTrack) {
						// add RTX
						if (edgeVersion >= 15019 && transceiver.kind === 'video' &&
								!transceiver.sendEncodingParameters[0].rtx) {
							transceiver.sendEncodingParameters[0].rtx = {
								ssrc: transceiver.sendEncodingParameters[0].ssrc + 1
							};
						}
					}
				}
	
				// Calculate intersection of capabilities.
				var commonCapabilities = getCommonCapabilities(
						transceiver.localCapabilities,
						transceiver.remoteCapabilities);
	
				var hasRtx = commonCapabilities.codecs.filter(function(c) {
					return c.name.toLowerCase() === 'rtx';
				}).length;
				if (!hasRtx && transceiver.sendEncodingParameters[0].rtx) {
					delete transceiver.sendEncodingParameters[0].rtx;
				}
	
				sdp += writeMediaSection(transceiver, commonCapabilities,
						'answer', transceiver.stream, pc._dtlsRole);
				if (transceiver.rtcpParameters &&
						transceiver.rtcpParameters.reducedSize) {
					sdp += 'a=rtcp-rsize\r\n';
				}
			});
	
			var desc = new window.RTCSessionDescription({
				type: 'answer',
				sdp: sdp
			});
			return Promise.resolve(desc);
		};
	
		RTCPeerConnection.prototype.addIceCandidate = function(candidate) {
			var pc = this;
			var sections;
			if (candidate && !(candidate.sdpMLineIndex !== undefined ||
					candidate.sdpMid)) {
				return Promise.reject(new TypeError('sdpMLineIndex or sdpMid required'));
			}
	
			// TODO: needs to go into ops queue.
			return new Promise(function(resolve, reject) {
				if (!pc._remoteDescription) {
					return reject(makeError('InvalidStateError',
							'Can not add ICE candidate without a remote description'));
				} else if (!candidate || candidate.candidate === '') {
					for (var j = 0; j < pc.transceivers.length; j++) {
						if (pc.transceivers[j].rejected) {
							continue;
						}
						pc.transceivers[j].iceTransport.addRemoteCandidate({});
						sections = SDPUtils.getMediaSections(pc._remoteDescription.sdp);
						sections[j] += 'a=end-of-candidates\r\n';
						pc._remoteDescription.sdp =
								SDPUtils.getDescription(pc._remoteDescription.sdp) +
								sections.join('');
						if (pc.usingBundle) {
							break;
						}
					}
				} else {
					var sdpMLineIndex = candidate.sdpMLineIndex;
					if (candidate.sdpMid) {
						for (var i = 0; i < pc.transceivers.length; i++) {
							if (pc.transceivers[i].mid === candidate.sdpMid) {
								sdpMLineIndex = i;
								break;
							}
						}
					}
					var transceiver = pc.transceivers[sdpMLineIndex];
					if (transceiver) {
						if (transceiver.rejected) {
							return resolve();
						}
						var cand = Object.keys(candidate.candidate).length > 0 ?
								SDPUtils.parseCandidate(candidate.candidate) : {};
						// Ignore Chrome's invalid candidates since Edge does not like them.
						if (cand.protocol === 'tcp' && (cand.port === 0 || cand.port === 9)) {
							return resolve();
						}
						// Ignore RTCP candidates, we assume RTCP-MUX.
						if (cand.component && cand.component !== 1) {
							return resolve();
						}
						// when using bundle, avoid adding candidates to the wrong
						// ice transport. And avoid adding candidates added in the SDP.
						if (sdpMLineIndex === 0 || (sdpMLineIndex > 0 &&
								transceiver.iceTransport !== pc.transceivers[0].iceTransport)) {
							if (!maybeAddCandidate(transceiver.iceTransport, cand)) {
								return reject(makeError('OperationError',
										'Can not add ICE candidate'));
							}
						}
	
						// update the remoteDescription.
						var candidateString = candidate.candidate.trim();
						if (candidateString.indexOf('a=') === 0) {
							candidateString = candidateString.substr(2);
						}
						sections = SDPUtils.getMediaSections(pc._remoteDescription.sdp);
						sections[sdpMLineIndex] += 'a=' +
								(cand.type ? candidateString : 'end-of-candidates')
								+ '\r\n';
						pc._remoteDescription.sdp =
								SDPUtils.getDescription(pc._remoteDescription.sdp) +
								sections.join('');
					} else {
						return reject(makeError('OperationError',
								'Can not add ICE candidate'));
					}
				}
				resolve();
			});
		};
	
		RTCPeerConnection.prototype.getStats = function(selector) {
			if (selector && selector instanceof window.MediaStreamTrack) {
				var senderOrReceiver = null;
				this.transceivers.forEach(function(transceiver) {
					if (transceiver.rtpSender &&
							transceiver.rtpSender.track === selector) {
						senderOrReceiver = transceiver.rtpSender;
					} else if (transceiver.rtpReceiver &&
							transceiver.rtpReceiver.track === selector) {
						senderOrReceiver = transceiver.rtpReceiver;
					}
				});
				if (!senderOrReceiver) {
					throw makeError('InvalidAccessError', 'Invalid selector.');
				}
				return senderOrReceiver.getStats();
			}
	
			var promises = [];
			this.transceivers.forEach(function(transceiver) {
				['rtpSender', 'rtpReceiver', 'iceGatherer', 'iceTransport',
						'dtlsTransport'].forEach(function(method) {
							if (transceiver[method]) {
								promises.push(transceiver[method].getStats());
							}
						});
			});
			return Promise.all(promises).then(function(allStats) {
				var results = new Map();
				allStats.forEach(function(stats) {
					stats.forEach(function(stat) {
						results.set(stat.id, stat);
					});
				});
				return results;
			});
		};
	
		// fix low-level stat names and return Map instead of object.
		var ortcObjects = ['RTCRtpSender', 'RTCRtpReceiver', 'RTCIceGatherer',
			'RTCIceTransport', 'RTCDtlsTransport'];
		ortcObjects.forEach(function(ortcObjectName) {
			var obj = window[ortcObjectName];
			if (obj && obj.prototype && obj.prototype.getStats) {
				var nativeGetstats = obj.prototype.getStats;
				obj.prototype.getStats = function() {
					return nativeGetstats.apply(this)
					.then(function(nativeStats) {
						var mapStats = new Map();
						Object.keys(nativeStats).forEach(function(id) {
							nativeStats[id].type = fixStatsType(nativeStats[id]);
							mapStats.set(id, nativeStats[id]);
						});
						return mapStats;
					});
				};
			}
		});
	
		// legacy callback shims. Should be moved to adapter.js some days.
		var methods = ['createOffer', 'createAnswer'];
		methods.forEach(function(method) {
			var nativeMethod = RTCPeerConnection.prototype[method];
			RTCPeerConnection.prototype[method] = function() {
				var args = arguments;
				if (typeof args[0] === 'function' ||
						typeof args[1] === 'function') { // legacy
					return nativeMethod.apply(this, [arguments[2]])
					.then(function(description) {
						if (typeof args[0] === 'function') {
							args[0].apply(null, [description]);
						}
					}, function(error) {
						if (typeof args[1] === 'function') {
							args[1].apply(null, [error]);
						}
					});
				}
				return nativeMethod.apply(this, arguments);
			};
		});
	
		methods = ['setLocalDescription', 'setRemoteDescription', 'addIceCandidate'];
		methods.forEach(function(method) {
			var nativeMethod = RTCPeerConnection.prototype[method];
			RTCPeerConnection.prototype[method] = function() {
				var args = arguments;
				if (typeof args[1] === 'function' ||
						typeof args[2] === 'function') { // legacy
					return nativeMethod.apply(this, arguments)
					.then(function() {
						if (typeof args[1] === 'function') {
							args[1].apply(null);
						}
					}, function(error) {
						if (typeof args[2] === 'function') {
							args[2].apply(null, [error]);
						}
					});
				}
				return nativeMethod.apply(this, arguments);
			};
		});
	
		// getStats is special. It doesn't have a spec legacy method yet we support
		// getStats(something, cb) without error callbacks.
		['getStats'].forEach(function(method) {
			var nativeMethod = RTCPeerConnection.prototype[method];
			RTCPeerConnection.prototype[method] = function() {
				var args = arguments;
				if (typeof args[1] === 'function') {
					return nativeMethod.apply(this, arguments)
					.then(function() {
						if (typeof args[1] === 'function') {
							args[1].apply(null);
						}
					});
				}
				return nativeMethod.apply(this, arguments);
			};
		});
	
		return RTCPeerConnection;
	};
	
	},{"sdp":17}],17:[function(require,module,exports){
	/* eslint-env node */
	'use strict';
	
	// SDP helpers.
	var SDPUtils = {};
	
	// Generate an alphanumeric identifier for cname or mids.
	// TODO: use UUIDs instead? https://gist.github.com/jed/982883
	SDPUtils.generateIdentifier = function() {
		return Math.random().toString(36).substr(2, 10);
	};
	
	// The RTCP CNAME used by all peerconnections from the same JS.
	SDPUtils.localCName = SDPUtils.generateIdentifier();
	
	// Splits SDP into lines, dealing with both CRLF and LF.
	SDPUtils.splitLines = function(blob) {
		return blob.trim().split('\n').map(function(line) {
			return line.trim();
		});
	};
	// Splits SDP into sessionpart and mediasections. Ensures CRLF.
	SDPUtils.splitSections = function(blob) {
		var parts = blob.split('\nm=');
		return parts.map(function(part, index) {
			return (index > 0 ? 'm=' + part : part).trim() + '\r\n';
		});
	};
	
	// returns the session description.
	SDPUtils.getDescription = function(blob) {
		var sections = SDPUtils.splitSections(blob);
		return sections && sections[0];
	};
	
	// returns the individual media sections.
	SDPUtils.getMediaSections = function(blob) {
		var sections = SDPUtils.splitSections(blob);
		sections.shift();
		return sections;
	};
	
	// Returns lines that start with a certain prefix.
	SDPUtils.matchPrefix = function(blob, prefix) {
		return SDPUtils.splitLines(blob).filter(function(line) {
			return line.indexOf(prefix) === 0;
		});
	};
	
	// Parses an ICE candidate line. Sample input:
	// candidate:702786350 2 udp 41819902 8.8.8.8 60769 typ relay raddr 8.8.8.8
	// rport 55996"
	SDPUtils.parseCandidate = function(line) {
		var parts;
		// Parse both variants.
		if (line.indexOf('a=candidate:') === 0) {
			parts = line.substring(12).split(' ');
		} else {
			parts = line.substring(10).split(' ');
		}
	
		var candidate = {
			foundation: parts[0],
			component: parseInt(parts[1], 10),
			protocol: parts[2].toLowerCase(),
			priority: parseInt(parts[3], 10),
			ip: parts[4],
			address: parts[4], // address is an alias for ip.
			port: parseInt(parts[5], 10),
			// skip parts[6] == 'typ'
			type: parts[7]
		};
	
		for (var i = 8; i < parts.length; i += 2) {
			switch (parts[i]) {
				case 'raddr':
					candidate.relatedAddress = parts[i + 1];
					break;
				case 'rport':
					candidate.relatedPort = parseInt(parts[i + 1], 10);
					break;
				case 'tcptype':
					candidate.tcpType = parts[i + 1];
					break;
				case 'ufrag':
					candidate.ufrag = parts[i + 1]; // for backward compability.
					candidate.usernameFragment = parts[i + 1];
					break;
				default: // extension handling, in particular ufrag
					candidate[parts[i]] = parts[i + 1];
					break;
			}
		}
		return candidate;
	};
	
	// Translates a candidate object into SDP candidate attribute.
	SDPUtils.writeCandidate = function(candidate) {
		var sdp = [];
		sdp.push(candidate.foundation);
		sdp.push(candidate.component);
		sdp.push(candidate.protocol.toUpperCase());
		sdp.push(candidate.priority);
		sdp.push(candidate.address || candidate.ip);
		sdp.push(candidate.port);
	
		var type = candidate.type;
		sdp.push('typ');
		sdp.push(type);
		if (type !== 'host' && candidate.relatedAddress &&
				candidate.relatedPort) {
			sdp.push('raddr');
			sdp.push(candidate.relatedAddress);
			sdp.push('rport');
			sdp.push(candidate.relatedPort);
		}
		if (candidate.tcpType && candidate.protocol.toLowerCase() === 'tcp') {
			sdp.push('tcptype');
			sdp.push(candidate.tcpType);
		}
		if (candidate.usernameFragment || candidate.ufrag) {
			sdp.push('ufrag');
			sdp.push(candidate.usernameFragment || candidate.ufrag);
		}
		return 'candidate:' + sdp.join(' ');
	};
	
	// Parses an ice-options line, returns an array of option tags.
	// a=ice-options:foo bar
	SDPUtils.parseIceOptions = function(line) {
		return line.substr(14).split(' ');
	};
	
	// Parses an rtpmap line, returns RTCRtpCoddecParameters. Sample input:
	// a=rtpmap:111 opus/48000/2
	SDPUtils.parseRtpMap = function(line) {
		var parts = line.substr(9).split(' ');
		var parsed = {
			payloadType: parseInt(parts.shift(), 10) // was: id
		};
	
		parts = parts[0].split('/');
	
		parsed.name = parts[0];
		parsed.clockRate = parseInt(parts[1], 10); // was: clockrate
		parsed.channels = parts.length === 3 ? parseInt(parts[2], 10) : 1;
		// legacy alias, got renamed back to channels in ORTC.
		parsed.numChannels = parsed.channels;
		return parsed;
	};
	
	// Generate an a=rtpmap line from RTCRtpCodecCapability or
	// RTCRtpCodecParameters.
	SDPUtils.writeRtpMap = function(codec) {
		var pt = codec.payloadType;
		if (codec.preferredPayloadType !== undefined) {
			pt = codec.preferredPayloadType;
		}
		var channels = codec.channels || codec.numChannels || 1;
		return 'a=rtpmap:' + pt + ' ' + codec.name + '/' + codec.clockRate +
				(channels !== 1 ? '/' + channels : '') + '\r\n';
	};
	
	// Parses an a=extmap line (headerextension from RFC 5285). Sample input:
	// a=extmap:2 urn:ietf:params:rtp-hdrext:toffset
	// a=extmap:2/sendonly urn:ietf:params:rtp-hdrext:toffset
	SDPUtils.parseExtmap = function(line) {
		var parts = line.substr(9).split(' ');
		return {
			id: parseInt(parts[0], 10),
			direction: parts[0].indexOf('/') > 0 ? parts[0].split('/')[1] : 'sendrecv',
			uri: parts[1]
		};
	};
	
	// Generates a=extmap line from RTCRtpHeaderExtensionParameters or
	// RTCRtpHeaderExtension.
	SDPUtils.writeExtmap = function(headerExtension) {
		return 'a=extmap:' + (headerExtension.id || headerExtension.preferredId) +
				(headerExtension.direction && headerExtension.direction !== 'sendrecv'
					? '/' + headerExtension.direction
					: '') +
				' ' + headerExtension.uri + '\r\n';
	};
	
	// Parses an ftmp line, returns dictionary. Sample input:
	// a=fmtp:96 vbr=on;cng=on
	// Also deals with vbr=on; cng=on
	SDPUtils.parseFmtp = function(line) {
		var parsed = {};
		var kv;
		var parts = line.substr(line.indexOf(' ') + 1).split(';');
		for (var j = 0; j < parts.length; j++) {
			kv = parts[j].trim().split('=');
			parsed[kv[0].trim()] = kv[1];
		}
		return parsed;
	};
	
	// Generates an a=ftmp line from RTCRtpCodecCapability or RTCRtpCodecParameters.
	SDPUtils.writeFmtp = function(codec) {
		var line = '';
		var pt = codec.payloadType;
		if (codec.preferredPayloadType !== undefined) {
			pt = codec.preferredPayloadType;
		}
		if (codec.parameters && Object.keys(codec.parameters).length) {
			var params = [];
			Object.keys(codec.parameters).forEach(function(param) {
				if (codec.parameters[param]) {
					params.push(param + '=' + codec.parameters[param]);
				} else {
					params.push(param);
				}
			});
			line += 'a=fmtp:' + pt + ' ' + params.join(';') + '\r\n';
		}
		return line;
	};
	
	// Parses an rtcp-fb line, returns RTCPRtcpFeedback object. Sample input:
	// a=rtcp-fb:98 nack rpsi
	SDPUtils.parseRtcpFb = function(line) {
		var parts = line.substr(line.indexOf(' ') + 1).split(' ');
		return {
			type: parts.shift(),
			parameter: parts.join(' ')
		};
	};
	// Generate a=rtcp-fb lines from RTCRtpCodecCapability or RTCRtpCodecParameters.
	SDPUtils.writeRtcpFb = function(codec) {
		var lines = '';
		var pt = codec.payloadType;
		if (codec.preferredPayloadType !== undefined) {
			pt = codec.preferredPayloadType;
		}
		if (codec.rtcpFeedback && codec.rtcpFeedback.length) {
			// FIXME: special handling for trr-int?
			codec.rtcpFeedback.forEach(function(fb) {
				lines += 'a=rtcp-fb:' + pt + ' ' + fb.type +
				(fb.parameter && fb.parameter.length ? ' ' + fb.parameter : '') +
						'\r\n';
			});
		}
		return lines;
	};
	
	// Parses an RFC 5576 ssrc media attribute. Sample input:
	// a=ssrc:3735928559 cname:something
	SDPUtils.parseSsrcMedia = function(line) {
		var sp = line.indexOf(' ');
		var parts = {
			ssrc: parseInt(line.substr(7, sp - 7), 10)
		};
		var colon = line.indexOf(':', sp);
		if (colon > -1) {
			parts.attribute = line.substr(sp + 1, colon - sp - 1);
			parts.value = line.substr(colon + 1);
		} else {
			parts.attribute = line.substr(sp + 1);
		}
		return parts;
	};
	
	SDPUtils.parseSsrcGroup = function(line) {
		var parts = line.substr(13).split(' ');
		return {
			semantics: parts.shift(),
			ssrcs: parts.map(function(ssrc) {
				return parseInt(ssrc, 10);
			})
		};
	};
	
	// Extracts the MID (RFC 5888) from a media section.
	// returns the MID or undefined if no mid line was found.
	SDPUtils.getMid = function(mediaSection) {
		var mid = SDPUtils.matchPrefix(mediaSection, 'a=mid:')[0];
		if (mid) {
			return mid.substr(6);
		}
	};
	
	SDPUtils.parseFingerprint = function(line) {
		var parts = line.substr(14).split(' ');
		return {
			algorithm: parts[0].toLowerCase(), // algorithm is case-sensitive in Edge.
			value: parts[1]
		};
	};
	
	// Extracts DTLS parameters from SDP media section or sessionpart.
	// FIXME: for consistency with other functions this should only
	//   get the fingerprint line as input. See also getIceParameters.
	SDPUtils.getDtlsParameters = function(mediaSection, sessionpart) {
		var lines = SDPUtils.matchPrefix(mediaSection + sessionpart,
			'a=fingerprint:');
		// Note: a=setup line is ignored since we use the 'auto' role.
		// Note2: 'algorithm' is not case sensitive except in Edge.
		return {
			role: 'auto',
			fingerprints: lines.map(SDPUtils.parseFingerprint)
		};
	};
	
	// Serializes DTLS parameters to SDP.
	SDPUtils.writeDtlsParameters = function(params, setupType) {
		var sdp = 'a=setup:' + setupType + '\r\n';
		params.fingerprints.forEach(function(fp) {
			sdp += 'a=fingerprint:' + fp.algorithm + ' ' + fp.value + '\r\n';
		});
		return sdp;
	};
	
	// Parses a=crypto lines into
	//   https://rawgit.com/aboba/edgertc/master/msortc-rs4.html#dictionary-rtcsrtpsdesparameters-members
	SDPUtils.parseCryptoLine = function(line) {
		var parts = line.substr(9).split(' ');
		return {
			tag: parseInt(parts[0], 10),
			cryptoSuite: parts[1],
			keyParams: parts[2],
			sessionParams: parts.slice(3),
		};
	};
	
	SDPUtils.writeCryptoLine = function(parameters) {
		return 'a=crypto:' + parameters.tag + ' ' +
			parameters.cryptoSuite + ' ' +
			(typeof parameters.keyParams === 'object'
				? SDPUtils.writeCryptoKeyParams(parameters.keyParams)
				: parameters.keyParams) +
			(parameters.sessionParams ? ' ' + parameters.sessionParams.join(' ') : '') +
			'\r\n';
	};
	
	// Parses the crypto key parameters into
	//   https://rawgit.com/aboba/edgertc/master/msortc-rs4.html#rtcsrtpkeyparam*
	SDPUtils.parseCryptoKeyParams = function(keyParams) {
		if (keyParams.indexOf('inline:') !== 0) {
			return null;
		}
		var parts = keyParams.substr(7).split('|');
		return {
			keyMethod: 'inline',
			keySalt: parts[0],
			lifeTime: parts[1],
			mkiValue: parts[2] ? parts[2].split(':')[0] : undefined,
			mkiLength: parts[2] ? parts[2].split(':')[1] : undefined,
		};
	};
	
	SDPUtils.writeCryptoKeyParams = function(keyParams) {
		return keyParams.keyMethod + ':'
			+ keyParams.keySalt +
			(keyParams.lifeTime ? '|' + keyParams.lifeTime : '') +
			(keyParams.mkiValue && keyParams.mkiLength
				? '|' + keyParams.mkiValue + ':' + keyParams.mkiLength
				: '');
	};
	
	// Extracts all SDES paramters.
	SDPUtils.getCryptoParameters = function(mediaSection, sessionpart) {
		var lines = SDPUtils.matchPrefix(mediaSection + sessionpart,
			'a=crypto:');
		return lines.map(SDPUtils.parseCryptoLine);
	};
	
	// Parses ICE information from SDP media section or sessionpart.
	// FIXME: for consistency with other functions this should only
	//   get the ice-ufrag and ice-pwd lines as input.
	SDPUtils.getIceParameters = function(mediaSection, sessionpart) {
		var ufrag = SDPUtils.matchPrefix(mediaSection + sessionpart,
			'a=ice-ufrag:')[0];
		var pwd = SDPUtils.matchPrefix(mediaSection + sessionpart,
			'a=ice-pwd:')[0];
		if (!(ufrag && pwd)) {
			return null;
		}
		return {
			usernameFragment: ufrag.substr(12),
			password: pwd.substr(10),
		};
	};
	
	// Serializes ICE parameters to SDP.
	SDPUtils.writeIceParameters = function(params) {
		return 'a=ice-ufrag:' + params.usernameFragment + '\r\n' +
				'a=ice-pwd:' + params.password + '\r\n';
	};
	
	// Parses the SDP media section and returns RTCRtpParameters.
	SDPUtils.parseRtpParameters = function(mediaSection) {
		var description = {
			codecs: [],
			headerExtensions: [],
			fecMechanisms: [],
			rtcp: []
		};
		var lines = SDPUtils.splitLines(mediaSection);
		var mline = lines[0].split(' ');
		for (var i = 3; i < mline.length; i++) { // find all codecs from mline[3..]
			var pt = mline[i];
			var rtpmapline = SDPUtils.matchPrefix(
				mediaSection, 'a=rtpmap:' + pt + ' ')[0];
			if (rtpmapline) {
				var codec = SDPUtils.parseRtpMap(rtpmapline);
				var fmtps = SDPUtils.matchPrefix(
					mediaSection, 'a=fmtp:' + pt + ' ');
				// Only the first a=fmtp:<pt> is considered.
				codec.parameters = fmtps.length ? SDPUtils.parseFmtp(fmtps[0]) : {};
				codec.rtcpFeedback = SDPUtils.matchPrefix(
					mediaSection, 'a=rtcp-fb:' + pt + ' ')
					.map(SDPUtils.parseRtcpFb);
				description.codecs.push(codec);
				// parse FEC mechanisms from rtpmap lines.
				switch (codec.name.toUpperCase()) {
					case 'RED':
					case 'ULPFEC':
						description.fecMechanisms.push(codec.name.toUpperCase());
						break;
					default: // only RED and ULPFEC are recognized as FEC mechanisms.
						break;
				}
			}
		}
		SDPUtils.matchPrefix(mediaSection, 'a=extmap:').forEach(function(line) {
			description.headerExtensions.push(SDPUtils.parseExtmap(line));
		});
		// FIXME: parse rtcp.
		return description;
	};
	
	// Generates parts of the SDP media section describing the capabilities /
	// parameters.
	SDPUtils.writeRtpDescription = function(kind, caps) {
		var sdp = '';
	
		// Build the mline.
		sdp += 'm=' + kind + ' ';
		sdp += caps.codecs.length > 0 ? '9' : '0'; // reject if no codecs.
		sdp += ' UDP/TLS/RTP/SAVPF ';
		sdp += caps.codecs.map(function(codec) {
			if (codec.preferredPayloadType !== undefined) {
				return codec.preferredPayloadType;
			}
			return codec.payloadType;
		}).join(' ') + '\r\n';
	
		sdp += 'c=IN IP4 0.0.0.0\r\n';
		sdp += 'a=rtcp:9 IN IP4 0.0.0.0\r\n';
	
		// Add a=rtpmap lines for each codec. Also fmtp and rtcp-fb.
		caps.codecs.forEach(function(codec) {
			sdp += SDPUtils.writeRtpMap(codec);
			sdp += SDPUtils.writeFmtp(codec);
			sdp += SDPUtils.writeRtcpFb(codec);
		});
		var maxptime = 0;
		caps.codecs.forEach(function(codec) {
			if (codec.maxptime > maxptime) {
				maxptime = codec.maxptime;
			}
		});
		if (maxptime > 0) {
			sdp += 'a=maxptime:' + maxptime + '\r\n';
		}
		sdp += 'a=rtcp-mux\r\n';
	
		if (caps.headerExtensions) {
			caps.headerExtensions.forEach(function(extension) {
				sdp += SDPUtils.writeExtmap(extension);
			});
		}
		// FIXME: write fecMechanisms.
		return sdp;
	};
	
	// Parses the SDP media section and returns an array of
	// RTCRtpEncodingParameters.
	SDPUtils.parseRtpEncodingParameters = function(mediaSection) {
		var encodingParameters = [];
		var description = SDPUtils.parseRtpParameters(mediaSection);
		var hasRed = description.fecMechanisms.indexOf('RED') !== -1;
		var hasUlpfec = description.fecMechanisms.indexOf('ULPFEC') !== -1;
	
		// filter a=ssrc:... cname:, ignore PlanB-msid
		var ssrcs = SDPUtils.matchPrefix(mediaSection, 'a=ssrc:')
			.map(function(line) {
				return SDPUtils.parseSsrcMedia(line);
			})
			.filter(function(parts) {
				return parts.attribute === 'cname';
			});
		var primarySsrc = ssrcs.length > 0 && ssrcs[0].ssrc;
		var secondarySsrc;
	
		var flows = SDPUtils.matchPrefix(mediaSection, 'a=ssrc-group:FID')
			.map(function(line) {
				var parts = line.substr(17).split(' ');
				return parts.map(function(part) {
					return parseInt(part, 10);
				});
			});
		if (flows.length > 0 && flows[0].length > 1 && flows[0][0] === primarySsrc) {
			secondarySsrc = flows[0][1];
		}
	
		description.codecs.forEach(function(codec) {
			if (codec.name.toUpperCase() === 'RTX' && codec.parameters.apt) {
				var encParam = {
					ssrc: primarySsrc,
					codecPayloadType: parseInt(codec.parameters.apt, 10)
				};
				if (primarySsrc && secondarySsrc) {
					encParam.rtx = {ssrc: secondarySsrc};
				}
				encodingParameters.push(encParam);
				if (hasRed) {
					encParam = JSON.parse(JSON.stringify(encParam));
					encParam.fec = {
						ssrc: primarySsrc,
						mechanism: hasUlpfec ? 'red+ulpfec' : 'red'
					};
					encodingParameters.push(encParam);
				}
			}
		});
		if (encodingParameters.length === 0 && primarySsrc) {
			encodingParameters.push({
				ssrc: primarySsrc
			});
		}
	
		// we support both b=AS and b=TIAS but interpret AS as TIAS.
		var bandwidth = SDPUtils.matchPrefix(mediaSection, 'b=');
		if (bandwidth.length) {
			if (bandwidth[0].indexOf('b=TIAS:') === 0) {
				bandwidth = parseInt(bandwidth[0].substr(7), 10);
			} else if (bandwidth[0].indexOf('b=AS:') === 0) {
				// use formula from JSEP to convert b=AS to TIAS value.
				bandwidth = parseInt(bandwidth[0].substr(5), 10) * 1000 * 0.95
						- (50 * 40 * 8);
			} else {
				bandwidth = undefined;
			}
			encodingParameters.forEach(function(params) {
				params.maxBitrate = bandwidth;
			});
		}
		return encodingParameters;
	};
	
	// parses http://draft.ortc.org/#rtcrtcpparameters*
	SDPUtils.parseRtcpParameters = function(mediaSection) {
		var rtcpParameters = {};
	
		// Gets the first SSRC. Note tha with RTX there might be multiple
		// SSRCs.
		var remoteSsrc = SDPUtils.matchPrefix(mediaSection, 'a=ssrc:')
			.map(function(line) {
				return SDPUtils.parseSsrcMedia(line);
			})
			.filter(function(obj) {
				return obj.attribute === 'cname';
			})[0];
		if (remoteSsrc) {
			rtcpParameters.cname = remoteSsrc.value;
			rtcpParameters.ssrc = remoteSsrc.ssrc;
		}
	
		// Edge uses the compound attribute instead of reducedSize
		// compound is !reducedSize
		var rsize = SDPUtils.matchPrefix(mediaSection, 'a=rtcp-rsize');
		rtcpParameters.reducedSize = rsize.length > 0;
		rtcpParameters.compound = rsize.length === 0;
	
		// parses the rtcp-mux attrіbute.
		// Note that Edge does not support unmuxed RTCP.
		var mux = SDPUtils.matchPrefix(mediaSection, 'a=rtcp-mux');
		rtcpParameters.mux = mux.length > 0;
	
		return rtcpParameters;
	};
	
	// parses either a=msid: or a=ssrc:... msid lines and returns
	// the id of the MediaStream and MediaStreamTrack.
	SDPUtils.parseMsid = function(mediaSection) {
		var parts;
		var spec = SDPUtils.matchPrefix(mediaSection, 'a=msid:');
		if (spec.length === 1) {
			parts = spec[0].substr(7).split(' ');
			return {stream: parts[0], track: parts[1]};
		}
		var planB = SDPUtils.matchPrefix(mediaSection, 'a=ssrc:')
			.map(function(line) {
				return SDPUtils.parseSsrcMedia(line);
			})
			.filter(function(msidParts) {
				return msidParts.attribute === 'msid';
			});
		if (planB.length > 0) {
			parts = planB[0].value.split(' ');
			return {stream: parts[0], track: parts[1]};
		}
	};
	
	// SCTP
	// parses draft-ietf-mmusic-sctp-sdp-26 first and falls back
	// to draft-ietf-mmusic-sctp-sdp-05
	SDPUtils.parseSctpDescription = function(mediaSection) {
		var mline = SDPUtils.parseMLine(mediaSection);
		var maxSizeLine = SDPUtils.matchPrefix(mediaSection, 'a=max-message-size:');
		var maxMessageSize;
		if (maxSizeLine.length > 0) {
			maxMessageSize = parseInt(maxSizeLine[0].substr(19), 10);
		}
		if (isNaN(maxMessageSize)) {
			maxMessageSize = 65536;
		}
		var sctpPort = SDPUtils.matchPrefix(mediaSection, 'a=sctp-port:');
		if (sctpPort.length > 0) {
			return {
				port: parseInt(sctpPort[0].substr(12), 10),
				protocol: mline.fmt,
				maxMessageSize: maxMessageSize
			};
		}
		var sctpMapLines = SDPUtils.matchPrefix(mediaSection, 'a=sctpmap:');
		if (sctpMapLines.length > 0) {
			var parts = SDPUtils.matchPrefix(mediaSection, 'a=sctpmap:')[0]
				.substr(10)
				.split(' ');
			return {
				port: parseInt(parts[0], 10),
				protocol: parts[1],
				maxMessageSize: maxMessageSize
			};
		}
	};
	
	// SCTP
	// outputs the draft-ietf-mmusic-sctp-sdp-26 version that all browsers
	// support by now receiving in this format, unless we originally parsed
	// as the draft-ietf-mmusic-sctp-sdp-05 format (indicated by the m-line
	// protocol of DTLS/SCTP -- without UDP/ or TCP/)
	SDPUtils.writeSctpDescription = function(media, sctp) {
		var output = [];
		if (media.protocol !== 'DTLS/SCTP') {
			output = [
				'm=' + media.kind + ' 9 ' + media.protocol + ' ' + sctp.protocol + '\r\n',
				'c=IN IP4 0.0.0.0\r\n',
				'a=sctp-port:' + sctp.port + '\r\n'
			];
		} else {
			output = [
				'm=' + media.kind + ' 9 ' + media.protocol + ' ' + sctp.port + '\r\n',
				'c=IN IP4 0.0.0.0\r\n',
				'a=sctpmap:' + sctp.port + ' ' + sctp.protocol + ' 65535\r\n'
			];
		}
		if (sctp.maxMessageSize !== undefined) {
			output.push('a=max-message-size:' + sctp.maxMessageSize + '\r\n');
		}
		return output.join('');
	};
	
	// Generate a session ID for SDP.
	// https://tools.ietf.org/html/draft-ietf-rtcweb-jsep-20#section-5.2.1
	// recommends using a cryptographically random +ve 64-bit value
	// but right now this should be acceptable and within the right range
	SDPUtils.generateSessionId = function() {
		return Math.random().toString().substr(2, 21);
	};
	
	// Write boilder plate for start of SDP
	// sessId argument is optional - if not supplied it will
	// be generated randomly
	// sessVersion is optional and defaults to 2
	// sessUser is optional and defaults to 'thisisadapterortc'
	SDPUtils.writeSessionBoilerplate = function(sessId, sessVer, sessUser) {
		var sessionId;
		var version = sessVer !== undefined ? sessVer : 2;
		if (sessId) {
			sessionId = sessId;
		} else {
			sessionId = SDPUtils.generateSessionId();
		}
		var user = sessUser || 'thisisadapterortc';
		// FIXME: sess-id should be an NTP timestamp.
		return 'v=0\r\n' +
				'o=' + user + ' ' + sessionId + ' ' + version +
					' IN IP4 127.0.0.1\r\n' +
				's=-\r\n' +
				't=0 0\r\n';
	};
	
	SDPUtils.writeMediaSection = function(transceiver, caps, type, stream) {
		var sdp = SDPUtils.writeRtpDescription(transceiver.kind, caps);
	
		// Map ICE parameters (ufrag, pwd) to SDP.
		sdp += SDPUtils.writeIceParameters(
			transceiver.iceGatherer.getLocalParameters());
	
		// Map DTLS parameters to SDP.
		sdp += SDPUtils.writeDtlsParameters(
			transceiver.dtlsTransport.getLocalParameters(),
			type === 'offer' ? 'actpass' : 'active');
	
		sdp += 'a=mid:' + transceiver.mid + '\r\n';
	
		if (transceiver.direction) {
			sdp += 'a=' + transceiver.direction + '\r\n';
		} else if (transceiver.rtpSender && transceiver.rtpReceiver) {
			sdp += 'a=sendrecv\r\n';
		} else if (transceiver.rtpSender) {
			sdp += 'a=sendonly\r\n';
		} else if (transceiver.rtpReceiver) {
			sdp += 'a=recvonly\r\n';
		} else {
			sdp += 'a=inactive\r\n';
		}
	
		if (transceiver.rtpSender) {
			// spec.
			var msid = 'msid:' + stream.id + ' ' +
					transceiver.rtpSender.track.id + '\r\n';
			sdp += 'a=' + msid;
	
			// for Chrome.
			sdp += 'a=ssrc:' + transceiver.sendEncodingParameters[0].ssrc +
					' ' + msid;
			if (transceiver.sendEncodingParameters[0].rtx) {
				sdp += 'a=ssrc:' + transceiver.sendEncodingParameters[0].rtx.ssrc +
						' ' + msid;
				sdp += 'a=ssrc-group:FID ' +
						transceiver.sendEncodingParameters[0].ssrc + ' ' +
						transceiver.sendEncodingParameters[0].rtx.ssrc +
						'\r\n';
			}
		}
		// FIXME: this should be written by writeRtpDescription.
		sdp += 'a=ssrc:' + transceiver.sendEncodingParameters[0].ssrc +
				' cname:' + SDPUtils.localCName + '\r\n';
		if (transceiver.rtpSender && transceiver.sendEncodingParameters[0].rtx) {
			sdp += 'a=ssrc:' + transceiver.sendEncodingParameters[0].rtx.ssrc +
					' cname:' + SDPUtils.localCName + '\r\n';
		}
		return sdp;
	};
	
	// Gets the direction from the mediaSection or the sessionpart.
	SDPUtils.getDirection = function(mediaSection, sessionpart) {
		// Look for sendrecv, sendonly, recvonly, inactive, default to sendrecv.
		var lines = SDPUtils.splitLines(mediaSection);
		for (var i = 0; i < lines.length; i++) {
			switch (lines[i]) {
				case 'a=sendrecv':
				case 'a=sendonly':
				case 'a=recvonly':
				case 'a=inactive':
					return lines[i].substr(2);
				default:
					// FIXME: What should happen here?
			}
		}
		if (sessionpart) {
			return SDPUtils.getDirection(sessionpart);
		}
		return 'sendrecv';
	};
	
	SDPUtils.getKind = function(mediaSection) {
		var lines = SDPUtils.splitLines(mediaSection);
		var mline = lines[0].split(' ');
		return mline[0].substr(2);
	};
	
	SDPUtils.isRejected = function(mediaSection) {
		return mediaSection.split(' ', 2)[1] === '0';
	};
	
	SDPUtils.parseMLine = function(mediaSection) {
		var lines = SDPUtils.splitLines(mediaSection);
		var parts = lines[0].substr(2).split(' ');
		return {
			kind: parts[0],
			port: parseInt(parts[1], 10),
			protocol: parts[2],
			fmt: parts.slice(3).join(' ')
		};
	};
	
	SDPUtils.parseOLine = function(mediaSection) {
		var line = SDPUtils.matchPrefix(mediaSection, 'o=')[0];
		var parts = line.substr(2).split(' ');
		return {
			username: parts[0],
			sessionId: parts[1],
			sessionVersion: parseInt(parts[2], 10),
			netType: parts[3],
			addressType: parts[4],
			address: parts[5]
		};
	};
	
	// a very naive interpretation of a valid SDP.
	SDPUtils.isValidSDP = function(blob) {
		if (typeof blob !== 'string' || blob.length === 0) {
			return false;
		}
		var lines = SDPUtils.splitLines(blob);
		for (var i = 0; i < lines.length; i++) {
			if (lines[i].length < 2 || lines[i].charAt(1) !== '=') {
				return false;
			}
			// TODO: check the modifier a bit more.
		}
		return true;
	};
	
	// Expose public methods.
	if (typeof module === 'object') {
		module.exports = SDPUtils;
	}
	
	},{}]},{},[1])(1)
	});
	
// __________________
// getHTMLMediaElement.js

function getHTMLMediaElement(mediaElement, config) {
    config = config || {};

    if (!mediaElement.nodeName || (mediaElement.nodeName.toLowerCase() != 'audio' && mediaElement.nodeName.toLowerCase() != 'video')) {
        if (!mediaElement.getVideoTracks().length) {
            return getAudioElement(mediaElement, config);
        }

        var mediaStream = mediaElement;
        mediaElement = document.createElement(mediaStream.getVideoTracks().length ? 'video' : 'audio');

        try {
            mediaElement.setAttributeNode(document.createAttribute('autoplay'));
            mediaElement.setAttributeNode(document.createAttribute('playsinline'));
        } catch (e) {
            mediaElement.setAttribute('autoplay', true);
            mediaElement.setAttribute('playsinline', true);
        }

        if ('srcObject' in mediaElement) {
            mediaElement.srcObject = mediaStream;
        } else {
            mediaElement[!!navigator.mozGetUserMedia ? 'mozSrcObject' : 'src'] = !!navigator.mozGetUserMedia ? mediaStream : (window.URL || window.webkitURL).createObjectURL(mediaStream);
        }
    }

    if (mediaElement.nodeName && mediaElement.nodeName.toLowerCase() == 'audio') {
        return getAudioElement(mediaElement, config);
    }

    var buttons = config.buttons || ['mute-audio', 'mute-video', 'full-screen', 'volume-slider', 'stop'];
    buttons.has = function(element) {
        return buttons.indexOf(element) !== -1;
    };

    config.toggle = config.toggle || [];
    config.toggle.has = function(element) {
        return config.toggle.indexOf(element) !== -1;
    };

    var mediaElementContainer = document.createElement('div');
    mediaElementContainer.className = 'media-container';

    var mediaControls = document.createElement('div');
    mediaControls.className = 'media-controls';
    // mediaElementContainer.appendChild(mediaControls);

    if (buttons.has('mute-audio')) {
        var muteAudio = document.createElement('div');
        muteAudio.className = 'control ' + (config.toggle.has('mute-audio') ? 'unmute-audio selected' : 'mute-audio');
        mediaControls.appendChild(muteAudio);

        muteAudio.onclick = function() {
            if (muteAudio.className.indexOf('unmute-audio') != -1) {
                muteAudio.className = muteAudio.className.replace('unmute-audio selected', 'mute-audio');
                mediaElement.muted = false;
                mediaElement.volume = 1;
                if (config.onUnMuted) config.onUnMuted('audio');
            } else {
                muteAudio.className = muteAudio.className.replace('mute-audio', 'unmute-audio selected');
                mediaElement.muted = true;
                mediaElement.volume = 0;
                if (config.onMuted) config.onMuted('audio');
            }
        };
    }

    if (buttons.has('mute-video')) {
        var muteVideo = document.createElement('div');
        muteVideo.className = 'control ' + (config.toggle.has('mute-video') ? 'unmute-video selected' : 'mute-video');
        mediaControls.appendChild(muteVideo);

        muteVideo.onclick = function() {
            if (muteVideo.className.indexOf('unmute-video') != -1) {
                muteVideo.className = muteVideo.className.replace('unmute-video selected', 'mute-video');
                mediaElement.muted = false;
                mediaElement.volume = 1;
                mediaElement.play();
                if (config.onUnMuted) config.onUnMuted('video');
            } else {
                muteVideo.className = muteVideo.className.replace('mute-video', 'unmute-video selected');
                mediaElement.muted = true;
                mediaElement.volume = 0;
                mediaElement.pause();
                if (config.onMuted) config.onMuted('video');
            }
        };
    }

    if (buttons.has('take-snapshot')) {
        var takeSnapshot = document.createElement('div');
        takeSnapshot.className = 'control take-snapshot';
        mediaControls.appendChild(takeSnapshot);

        takeSnapshot.onclick = function() {
            if (config.onTakeSnapshot) config.onTakeSnapshot();
        };
    }

    if (buttons.has('stop')) {
        var stop = document.createElement('div');
        stop.className = 'control stop';
        mediaControls.appendChild(stop);

        stop.onclick = function() {
            mediaElementContainer.style.opacity = 0;
            setTimeout(function() {
                if (mediaElementContainer.parentNode) {
                    mediaElementContainer.parentNode.removeChild(mediaElementContainer);
                }
            }, 800);
            if (config.onStopped) config.onStopped();
        };
    }

    var volumeControl = document.createElement('div');
    volumeControl.className = 'volume-control';

    if (buttons.has('record-audio')) {
        var recordAudio = document.createElement('div');
        recordAudio.className = 'control ' + (config.toggle.has('record-audio') ? 'stop-recording-audio selected' : 'record-audio');
				// volumeControl.appendChild(recordAudio);
				

        recordAudio.onclick = function() {
            if (recordAudio.className.indexOf('stop-recording-audio') != -1) {
                recordAudio.className = recordAudio.className.replace('stop-recording-audio selected', 'record-audio');
                if (config.onRecordingStopped) config.onRecordingStopped('audio');
            } else {
                recordAudio.className = recordAudio.className.replace('record-audio', 'stop-recording-audio selected');
                if (config.onRecordingStarted) config.onRecordingStarted('audio');
            }
        };
    }

    if (buttons.has('record-video')) {
        var recordVideo = document.createElement('div');
        recordVideo.className = 'control ' + (config.toggle.has('record-video') ? 'stop-recording-video selected' : 'record-video');
        // volumeControl.appendChild(recordVideo);

        recordVideo.onclick = function() {
            if (recordVideo.className.indexOf('stop-recording-video') != -1) {
                recordVideo.className = recordVideo.className.replace('stop-recording-video selected', 'record-video');
                if (config.onRecordingStopped) config.onRecordingStopped('video');
            } else {
                recordVideo.className = recordVideo.className.replace('record-video', 'stop-recording-video selected');
                if (config.onRecordingStarted) config.onRecordingStarted('video');
            }
        };
    }

    if (buttons.has('volume-slider')) {
        var volumeSlider = document.createElement('div');
        volumeSlider.className = 'control volume-slider';
        // volumeControl.appendChild(volumeSlider);

        var slider = document.createElement('input');
        slider.type = 'range';
        slider.min = 0;
        slider.max = 100;
        slider.value = 100;
        slider.onchange = function() {
            mediaElement.volume = '.' + slider.value.toString().substr(0, 1);
        };
        volumeSlider.appendChild(slider);
    }

    if (buttons.has('full-screen')) {
        var zoom = document.createElement('div');
        zoom.className = 'control ' + (config.toggle.has('zoom-in') ? 'zoom-out selected' : 'zoom-in');

        if (!slider && !recordAudio && !recordVideo && zoom) {
            mediaControls.insertBefore(zoom, mediaControls.firstChild);
        } else {
					// volumeControl.appendChild(zoom);
				}

        zoom.onclick = function() {
            if (zoom.className.indexOf('zoom-out') != -1) {
                zoom.className = zoom.className.replace('zoom-out selected', 'zoom-in');
                exitFullScreen();
            } else {
                zoom.className = zoom.className.replace('zoom-in', 'zoom-out selected');
                launchFullscreen(mediaElementContainer);
            }
        };

        function launchFullscreen(element) {
            if (element.requestFullscreen) {
                element.requestFullscreen();
            } else if (element.mozRequestFullScreen) {
                element.mozRequestFullScreen();
            } else if (element.webkitRequestFullscreen) {
                element.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
            }
        }

        function exitFullScreen() {
            if (document.fullscreen) {
                document.exitFullscreen();
            }

            if (document.mozFullScreen) {
                document.mozCancelFullScreen();
            }

            if (document.webkitIsFullScreen) {
                document.webkitExitFullscreen();
            }
        }

        function screenStateChange(e) {
            if (e.srcElement != mediaElementContainer) return;

            var isFullScreeMode = document.webkitIsFullScreen || document.mozFullScreen || document.fullscreen;

            mediaElementContainer.style.width = (isFullScreeMode ? (window.innerWidth - 20) : config.width) + 'px';
            mediaElementContainer.style.display = isFullScreeMode ? 'block' : 'inline-block';

            if (config.height) {
                mediaBox.style.height = (isFullScreeMode ? (window.innerHeight - 20) : config.height) + 'px';
            }

            if (!isFullScreeMode && config.onZoomout) config.onZoomout();
            if (isFullScreeMode && config.onZoomin) config.onZoomin();

            if (!isFullScreeMode && zoom.className.indexOf('zoom-out') != -1) {
                zoom.className = zoom.className.replace('zoom-out selected', 'zoom-in');
                if (config.onZoomout) config.onZoomout();
            }
            setTimeout(adjustControls, 1000);
        }

        document.addEventListener('fullscreenchange', screenStateChange, false);
        document.addEventListener('mozfullscreenchange', screenStateChange, false);
        document.addEventListener('webkitfullscreenchange', screenStateChange, false);
    }

    if (buttons.has('volume-slider') || buttons.has('full-screen') || buttons.has('record-audio') || buttons.has('record-video')) {
        // mediaElementContainer.appendChild(volumeControl);
    }

    var mediaBox = document.createElement('div');
    mediaBox.className = 'media-box';
    mediaElementContainer.appendChild(mediaBox);

    if (config.title) {
        var h2 = document.createElement('h2');
        h2.innerHTML = config.title;
        h2.setAttribute('style', 'position: absolute;color:white;font-size:17px;text-shadow: 1px 1px black;padding:0;margin:0;text-align: left; margin-top: 10px; margin-left: 10px; display: block; border: 0;line-height:1.5;z-index:1;');
        mediaBox.appendChild(h2);
    }

    mediaBox.appendChild(mediaElement);

    if (!config.width) config.width = (innerWidth / 2) - 50;

    mediaElementContainer.style.width = config.width + 'px';

    if (config.height) {
        mediaBox.style.height = config.height + 'px';
    }

    mediaBox.querySelector('video').style.maxHeight = innerHeight + 'px';

    var times = 0;

    function adjustControls() {
        mediaControls.style.marginLeft = (mediaElementContainer.clientWidth - mediaControls.clientWidth - 2) + 'px';

        if (slider) {
            slider.style.width = (mediaElementContainer.clientWidth / 3) + 'px';
            volumeControl.style.marginLeft = (mediaElementContainer.clientWidth / 3 - 30) + 'px';

            if (zoom) zoom.style['border-top-right-radius'] = '5px';
        } else {
            volumeControl.style.marginLeft = (mediaElementContainer.clientWidth - volumeControl.clientWidth - 2) + 'px';
        }

        volumeControl.style.marginTop = (mediaElementContainer.clientHeight - volumeControl.clientHeight - 2) + 'px';

        if (times < 10) {
            times++;
            setTimeout(adjustControls, 1000);
        } else times = 0;
    }

    if (config.showOnMouseEnter || typeof config.showOnMouseEnter === 'undefined') {
        mediaElementContainer.onmouseenter = mediaElementContainer.onmousedown = function() {
            adjustControls();
            mediaControls.style.opacity = 1;
            volumeControl.style.opacity = 1;
        };

        mediaElementContainer.onmouseleave = function() {
            mediaControls.style.opacity = 0;
            volumeControl.style.opacity = 0;
        };
    } else {
        setTimeout(function() {
            adjustControls();
            setTimeout(function() {
                mediaControls.style.opacity = 1;
                volumeControl.style.opacity = 1;
            }, 300);
        }, 700);
    }

    adjustControls();

    mediaElementContainer.toggle = function(clasName) {
        if (typeof clasName != 'string') {
            for (var i = 0; i < clasName.length; i++) {
                mediaElementContainer.toggle(clasName[i]);
            }
            return;
        }

        if (clasName == 'mute-audio' && muteAudio) muteAudio.onclick();
        if (clasName == 'mute-video' && muteVideo) muteVideo.onclick();

        if (clasName == 'record-audio' && recordAudio) recordAudio.onclick();
        if (clasName == 'record-video' && recordVideo) recordVideo.onclick();

        if (clasName == 'stop' && stop) stop.onclick();

        return this;
    };

    mediaElementContainer.media = mediaElement;

    return mediaElementContainer;
}

// __________________
// getAudioElement.js

function getAudioElement(mediaElement, config) {
    config = config || {};

    if (!mediaElement.nodeName || (mediaElement.nodeName.toLowerCase() != 'audio' && mediaElement.nodeName.toLowerCase() != 'video')) {
        var mediaStream = mediaElement;
        mediaElement = document.createElement('audio');

        try {
            mediaElement.setAttributeNode(document.createAttribute('autoplay'));
            mediaElement.setAttributeNode(document.createAttribute('controls'));
        } catch (e) {
            mediaElement.setAttribute('autoplay', true);
            mediaElement.setAttribute('controls', true);
        }

        if ('srcObject' in mediaElement) {
            mediaElement.mediaElement = mediaStream;
        } else {
            mediaElement[!!navigator.mozGetUserMedia ? 'mozSrcObject' : 'src'] = !!navigator.mozGetUserMedia ? mediaStream : (window.URL || window.webkitURL).createObjectURL(mediaStream);
        }
    }

    config.toggle = config.toggle || [];
    config.toggle.has = function(element) {
        return config.toggle.indexOf(element) !== -1;
    };

    var mediaElementContainer = document.createElement('div');
    mediaElementContainer.className = 'media-container';

    var mediaControls = document.createElement('div');
    mediaControls.className = 'media-controls';
    mediaElementContainer.appendChild(mediaControls);

    var muteAudio = document.createElement('div');
    muteAudio.className = 'control ' + (config.toggle.has('mute-audio') ? 'unmute-audio selected' : 'mute-audio');
    mediaControls.appendChild(muteAudio);

    muteAudio.style['border-top-left-radius'] = '5px';

    muteAudio.onclick = function() {
        if (muteAudio.className.indexOf('unmute-audio') != -1) {
            muteAudio.className = muteAudio.className.replace('unmute-audio selected', 'mute-audio');
            mediaElement.muted = false;
            if (config.onUnMuted) config.onUnMuted('audio');
        } else {
            muteAudio.className = muteAudio.className.replace('mute-audio', 'unmute-audio selected');
            mediaElement.muted = true;
            if (config.onMuted) config.onMuted('audio');
        }
    };

    if (!config.buttons || (config.buttons && config.buttons.indexOf('record-audio') != -1)) {
        var recordAudio = document.createElement('div');
        recordAudio.className = 'control ' + (config.toggle.has('record-audio') ? 'stop-recording-audio selected' : 'record-audio');
        mediaControls.appendChild(recordAudio);

        recordAudio.onclick = function() {
            if (recordAudio.className.indexOf('stop-recording-audio') != -1) {
                recordAudio.className = recordAudio.className.replace('stop-recording-audio selected', 'record-audio');
                if (config.onRecordingStopped) config.onRecordingStopped('audio');
            } else {
                recordAudio.className = recordAudio.className.replace('record-audio', 'stop-recording-audio selected');
                if (config.onRecordingStarted) config.onRecordingStarted('audio');
            }
        };
    }

    var volumeSlider = document.createElement('div');
    volumeSlider.className = 'control volume-slider';
    volumeSlider.style.width = 'auto';
    mediaControls.appendChild(volumeSlider);

    var slider = document.createElement('input');
    slider.style.marginTop = '11px';
    slider.style.width = ' 200px';

    if (config.buttons && config.buttons.indexOf('record-audio') == -1) {
        slider.style.width = ' 241px';
    }

    slider.type = 'range';
    slider.min = 0;
    slider.max = 100;
    slider.value = 100;
    slider.onchange = function() {
        mediaElement.volume = '.' + slider.value.toString().substr(0, 1);
    };
    volumeSlider.appendChild(slider);

    var stop = document.createElement('div');
    stop.className = 'control stop';
    mediaControls.appendChild(stop);

    stop.onclick = function() {
        mediaElementContainer.style.opacity = 0;
        setTimeout(function() {
            if (mediaElementContainer.parentNode) {
                mediaElementContainer.parentNode.removeChild(mediaElementContainer);
            }
        }, 800);
        if (config.onStopped) config.onStopped();
    };

    stop.style['border-top-right-radius'] = '5px';
    stop.style['border-bottom-right-radius'] = '5px';

    var mediaBox = document.createElement('div');
    mediaBox.className = 'media-box';
    mediaElementContainer.appendChild(mediaBox);

    var h2 = document.createElement('h2');
    h2.innerHTML = config.title || 'Audio Element';
    h2.setAttribute('style', 'position: absolute;color: rgb(160, 160, 160);font-size: 20px;text-shadow: 1px 1px rgb(255, 255, 255);padding:0;margin:0;');
    mediaBox.appendChild(h2);

    mediaBox.appendChild(mediaElement);

    mediaElementContainer.style.width = '329px';
    mediaBox.style.height = '90px';

    h2.style.width = mediaElementContainer.style.width;
    h2.style.height = '50px';
    h2.style.overflow = 'hidden';

    var times = 0;

    function adjustControls() {
        mediaControls.style.marginLeft = (mediaElementContainer.clientWidth - mediaControls.clientWidth - 7) + 'px';
        mediaControls.style.marginTop = (mediaElementContainer.clientHeight - mediaControls.clientHeight - 6) + 'px';
        if (times < 10) {
            times++;
            setTimeout(adjustControls, 1000);
        } else times = 0;
    }

    if (config.showOnMouseEnter || typeof config.showOnMouseEnter === 'undefined') {
        mediaElementContainer.onmouseenter = mediaElementContainer.onmousedown = function() {
            adjustControls();
            mediaControls.style.opacity = 1;
        };

        mediaElementContainer.onmouseleave = function() {
            mediaControls.style.opacity = 0;
        };
    } else {
        setTimeout(function() {
            adjustControls();
            setTimeout(function() {
                mediaControls.style.opacity = 1;
            }, 300);
        }, 700);
    }

    adjustControls();

    mediaElementContainer.toggle = function(clasName) {
        if (typeof clasName != 'string') {
            for (var i = 0; i < clasName.length; i++) {
                mediaElementContainer.toggle(clasName[i]);
            }
            return;
        }

        if (clasName == 'mute-audio' && muteAudio) muteAudio.onclick();
        if (clasName == 'record-audio' && recordAudio) recordAudio.onclick();
        if (clasName == 'stop' && stop) stop.onclick();

        return this;
    };

    mediaElementContainer.media = mediaElement;

    return mediaElementContainer;
}

// CodecsHandler.js

var CodecsHandler = (function() {
	function preferCodec(sdp, codecName) {
			var info = splitLines(sdp);

			codecName = codecName.toLowerCase()

			if (!info.videoCodecNumbers) {
					return sdp;
			}

			if (codecName === 'vp8' && info.vp8LineNumber === info.videoCodecNumbers[0]) {
					return sdp;
			}

			if (codecName === 'vp9' && info.vp9LineNumber === info.videoCodecNumbers[0]) {
					return sdp;
			}

			if (codecName === 'h264' && info.h264LineNumber === info.videoCodecNumbers[0]) {
					return sdp;
			}

			sdp = preferCodecHelper(sdp, codecName, info);

			return sdp;
	}

	function preferCodecHelper(sdp, codec, info, ignore) {
			var preferCodecNumber = '';

			if (codec === 'vp8') {
					if (!info.vp8LineNumber) {
							return sdp;
					}
					preferCodecNumber = info.vp8LineNumber;
			}

			if (codec === 'vp9') {
					if (!info.vp9LineNumber) {
							return sdp;
					}
					preferCodecNumber = info.vp9LineNumber;
			}

			if (codec === 'h264') {
					if (!info.h264LineNumber) {
							return sdp;
					}

					preferCodecNumber = info.h264LineNumber;
			}

			var newLine = info.videoCodecNumbersOriginal.split('SAVPF')[0] + 'SAVPF ';

			var newOrder = [preferCodecNumber];

			if (ignore) {
					newOrder = [];
			}

			info.videoCodecNumbers.forEach(function(codecNumber) {
					if (codecNumber === preferCodecNumber) return;
					newOrder.push(codecNumber);
			});

			newLine += newOrder.join(' ');

			sdp = sdp.replace(info.videoCodecNumbersOriginal, newLine);
			return sdp;
	}

	function splitLines(sdp) {
			var info = {};
			sdp.split('\n').forEach(function(line) {
					if (line.indexOf('m=video') === 0) {
							info.videoCodecNumbers = [];
							line.split('SAVPF')[1].split(' ').forEach(function(codecNumber) {
									codecNumber = codecNumber.trim();
									if (!codecNumber || !codecNumber.length) return;
									info.videoCodecNumbers.push(codecNumber);
									info.videoCodecNumbersOriginal = line;
							});
					}

					if (line.indexOf('VP8/90000') !== -1 && !info.vp8LineNumber) {
							info.vp8LineNumber = line.replace('a=rtpmap:', '').split(' ')[0];
					}

					if (line.indexOf('VP9/90000') !== -1 && !info.vp9LineNumber) {
							info.vp9LineNumber = line.replace('a=rtpmap:', '').split(' ')[0];
					}

					if (line.indexOf('H264/90000') !== -1 && !info.h264LineNumber) {
							info.h264LineNumber = line.replace('a=rtpmap:', '').split(' ')[0];
					}
			});

			return info;
	}

	function removeVPX(sdp) {
			var info = splitLines(sdp);

			// last parameter below means: ignore these codecs
			sdp = preferCodecHelper(sdp, 'vp9', info, true);
			sdp = preferCodecHelper(sdp, 'vp8', info, true);

			return sdp;
	}

	function disableNACK(sdp) {
			if (!sdp || typeof sdp !== 'string') {
					throw 'Invalid arguments.';
			}

			sdp = sdp.replace('a=rtcp-fb:126 nack\r\n', '');
			sdp = sdp.replace('a=rtcp-fb:126 nack pli\r\n', 'a=rtcp-fb:126 pli\r\n');
			sdp = sdp.replace('a=rtcp-fb:97 nack\r\n', '');
			sdp = sdp.replace('a=rtcp-fb:97 nack pli\r\n', 'a=rtcp-fb:97 pli\r\n');

			return sdp;
	}

	function prioritize(codecMimeType, peer) {
			if (!peer || !peer.getSenders || !peer.getSenders().length) {
					return;
			}

			if (!codecMimeType || typeof codecMimeType !== 'string') {
					throw 'Invalid arguments.';
			}

			peer.getSenders().forEach(function(sender) {
					var params = sender.getParameters();
					for (var i = 0; i < params.codecs.length; i++) {
							if (params.codecs[i].mimeType == codecMimeType) {
									params.codecs.unshift(params.codecs.splice(i, 1));
									break;
							}
					}
					sender.setParameters(params);
			});
	}

	function removeNonG722(sdp) {
			return sdp.replace(/m=audio ([0-9]+) RTP\/SAVPF ([0-9 ]*)/g, 'm=audio $1 RTP\/SAVPF 9');
	}

	function setBAS(sdp, bandwidth, isScreen) {
			if (!bandwidth) {
					return sdp;
			}

			if (typeof isFirefox !== 'undefined' && isFirefox) {
					return sdp;
			}

			if (isScreen) {
					if (!bandwidth.screen) {
							console.warn('It seems that you are not using bandwidth for screen. Screen sharing is expected to fail.');
					} else if (bandwidth.screen < 300) {
							console.warn('It seems that you are using wrong bandwidth value for screen. Screen sharing is expected to fail.');
					}
			}

			// if screen; must use at least 300kbs
			if (bandwidth.screen && isScreen) {
					sdp = sdp.replace(/b=AS([^\r\n]+\r\n)/g, '');
					sdp = sdp.replace(/a=mid:video\r\n/g, 'a=mid:video\r\nb=AS:' + bandwidth.screen + '\r\n');
			}

			// remove existing bandwidth lines
			if (bandwidth.audio || bandwidth.video) {
					sdp = sdp.replace(/b=AS([^\r\n]+\r\n)/g, '');
			}

			if (bandwidth.audio) {
					sdp = sdp.replace(/a=mid:audio\r\n/g, 'a=mid:audio\r\nb=AS:' + bandwidth.audio + '\r\n');
			}

			if (bandwidth.screen) {
					sdp = sdp.replace(/a=mid:video\r\n/g, 'a=mid:video\r\nb=AS:' + bandwidth.screen + '\r\n');
			} else if (bandwidth.video) {
					sdp = sdp.replace(/a=mid:video\r\n/g, 'a=mid:video\r\nb=AS:' + bandwidth.video + '\r\n');
			}

			return sdp;
	}

	// Find the line in sdpLines that starts with |prefix|, and, if specified,
	// contains |substr| (case-insensitive search).
	function findLine(sdpLines, prefix, substr) {
			return findLineInRange(sdpLines, 0, -1, prefix, substr);
	}

	// Find the line in sdpLines[startLine...endLine - 1] that starts with |prefix|
	// and, if specified, contains |substr| (case-insensitive search).
	function findLineInRange(sdpLines, startLine, endLine, prefix, substr) {
			var realEndLine = endLine !== -1 ? endLine : sdpLines.length;
			for (var i = startLine; i < realEndLine; ++i) {
					if (sdpLines[i].indexOf(prefix) === 0) {
							if (!substr ||
									sdpLines[i].toLowerCase().indexOf(substr.toLowerCase()) !== -1) {
									return i;
							}
					}
			}
			return null;
	}

	// Gets the codec payload type from an a=rtpmap:X line.
	function getCodecPayloadType(sdpLine) {
			var pattern = new RegExp('a=rtpmap:(\\d+) \\w+\\/\\d+');
			var result = sdpLine.match(pattern);
			return (result && result.length === 2) ? result[1] : null;
	}

	function setVideoBitrates(sdp, params) {
			params = params || {};
			var xgoogle_min_bitrate = params.min;
			var xgoogle_max_bitrate = params.max;

			var sdpLines = sdp.split('\r\n');

			// VP8
			var vp8Index = findLine(sdpLines, 'a=rtpmap', 'VP8/90000');
			var vp8Payload;
			if (vp8Index) {
					vp8Payload = getCodecPayloadType(sdpLines[vp8Index]);
			}

			if (!vp8Payload) {
					return sdp;
			}

			var rtxIndex = findLine(sdpLines, 'a=rtpmap', 'rtx/90000');
			var rtxPayload;
			if (rtxIndex) {
					rtxPayload = getCodecPayloadType(sdpLines[rtxIndex]);
			}

			if (!rtxIndex) {
					return sdp;
			}

			var rtxFmtpLineIndex = findLine(sdpLines, 'a=fmtp:' + rtxPayload.toString());
			if (rtxFmtpLineIndex !== null) {
					var appendrtxNext = '\r\n';
					appendrtxNext += 'a=fmtp:' + vp8Payload + ' x-google-min-bitrate=' + (xgoogle_min_bitrate || '228') + '; x-google-max-bitrate=' + (xgoogle_max_bitrate || '228');
					sdpLines[rtxFmtpLineIndex] = sdpLines[rtxFmtpLineIndex].concat(appendrtxNext);
					sdp = sdpLines.join('\r\n');
			}

			return sdp;
	}

	function setOpusAttributes(sdp, params) {
			params = params || {};

			var sdpLines = sdp.split('\r\n');

			// Opus
			var opusIndex = findLine(sdpLines, 'a=rtpmap', 'opus/48000');
			var opusPayload;
			if (opusIndex) {
					opusPayload = getCodecPayloadType(sdpLines[opusIndex]);
			}

			if (!opusPayload) {
					return sdp;
			}

			var opusFmtpLineIndex = findLine(sdpLines, 'a=fmtp:' + opusPayload.toString());
			if (opusFmtpLineIndex === null) {
					return sdp;
			}

			var appendOpusNext = '';
			appendOpusNext += '; stereo=' + (typeof params.stereo != 'undefined' ? params.stereo : '1');
			appendOpusNext += '; sprop-stereo=' + (typeof params['sprop-stereo'] != 'undefined' ? params['sprop-stereo'] : '1');

			if (typeof params.maxaveragebitrate != 'undefined') {
					appendOpusNext += '; maxaveragebitrate=' + (params.maxaveragebitrate || 128 * 1024 * 8);
			}

			if (typeof params.maxplaybackrate != 'undefined') {
					appendOpusNext += '; maxplaybackrate=' + (params.maxplaybackrate || 128 * 1024 * 8);
			}

			if (typeof params.cbr != 'undefined') {
					appendOpusNext += '; cbr=' + (typeof params.cbr != 'undefined' ? params.cbr : '1');
			}

			if (typeof params.useinbandfec != 'undefined') {
					appendOpusNext += '; useinbandfec=' + params.useinbandfec;
			}

			if (typeof params.usedtx != 'undefined') {
					appendOpusNext += '; usedtx=' + params.usedtx;
			}

			if (typeof params.maxptime != 'undefined') {
					appendOpusNext += '\r\na=maxptime:' + params.maxptime;
			}

			sdpLines[opusFmtpLineIndex] = sdpLines[opusFmtpLineIndex].concat(appendOpusNext);

			sdp = sdpLines.join('\r\n');
			return sdp;
	}

	// forceStereoAudio => via webrtcexample.com
	// requires getUserMedia => echoCancellation:false
	function forceStereoAudio(sdp) {
			var sdpLines = sdp.split('\r\n');
			var fmtpLineIndex = null;
			for (var i = 0; i < sdpLines.length; i++) {
					if (sdpLines[i].search('opus/48000') !== -1) {
							var opusPayload = extractSdp(sdpLines[i], /:(\d+) opus\/48000/i);
							break;
					}
			}
			for (var i = 0; i < sdpLines.length; i++) {
					if (sdpLines[i].search('a=fmtp') !== -1) {
							var payload = extractSdp(sdpLines[i], /a=fmtp:(\d+)/);
							if (payload === opusPayload) {
									fmtpLineIndex = i;
									break;
							}
					}
			}
			if (fmtpLineIndex === null) return sdp;
			sdpLines[fmtpLineIndex] = sdpLines[fmtpLineIndex].concat('; stereo=1; sprop-stereo=1');
			sdp = sdpLines.join('\r\n');
			return sdp;
	}

	return {
			removeVPX: removeVPX,
			disableNACK: disableNACK,
			prioritize: prioritize,
			removeNonG722: removeNonG722,
			setApplicationSpecificBandwidth: function(sdp, bandwidth, isScreen) {
					return setBAS(sdp, bandwidth, isScreen);
			},
			setVideoBitrates: function(sdp, params) {
					return setVideoBitrates(sdp, params);
			},
			setOpusAttributes: function(sdp, params) {
					return setOpusAttributes(sdp, params);
			},
			preferVP9: function(sdp) {
					return preferCodec(sdp, 'vp9');
			},
			preferCodec: preferCodec,
			forceStereoAudio: forceStereoAudio
	};
})();

// backward compatibility
window.BandwidthHandler = CodecsHandler;
'use strict';

// Last time updated: 2019-02-20 3:31:30 PM UTC

// _______________
// getStats v1.2.0

// Open-Sourced: https://github.com/muaz-khan/getStats

// --------------------------------------------------
// Muaz Khan     - www.MuazKhan.com
// MIT License   - www.WebRTC-Experiment.com/licence
// --------------------------------------------------

"use strict";var getStats=function(mediaStreamTrack,callback,interval){function getStatsLooper(){getStatsWrapper(function(results){if(results&&results.forEach){results.forEach(function(result){Object.keys(getStatsParser).forEach(function(key){if("function"==typeof getStatsParser[key])try{getStatsParser[key](result)}catch(e){console.error(e.message,e.stack,e)}})});try{peer.iceConnectionState.search(/failed|closed|disconnected/gi)!==-1&&(nomore=!0)}catch(e){nomore=!0}nomore===!0&&(getStatsResult.datachannel&&(getStatsResult.datachannel.state="close"),getStatsResult.ended=!0),getStatsResult.results=results,getStatsResult.audio&&getStatsResult.video&&(getStatsResult.bandwidth.speed=getStatsResult.audio.bytesSent-getStatsResult.bandwidth.helper.audioBytesSent+(getStatsResult.video.bytesSent-getStatsResult.bandwidth.helper.videoBytesSent),getStatsResult.bandwidth.helper.audioBytesSent=getStatsResult.audio.bytesSent,getStatsResult.bandwidth.helper.videoBytesSent=getStatsResult.video.bytesSent),callback(getStatsResult),nomore||void 0!=typeof interval&&interval&&setTimeout(getStatsLooper,interval||1e3)}})}function getStatsWrapper(cb){"undefined"!=typeof window.InstallTrigger||isSafari?peer.getStats(window.mediaStreamTrack||null).then(function(res){var items=[];res.forEach(function(r){items.push(r)}),cb(items)})["catch"](cb):peer.getStats(function(res){var items=[];res.result().forEach(function(res){var item={};res.names().forEach(function(name){item[name]=res.stat(name)}),item.id=res.id,item.type=res.type,item.timestamp=res.timestamp,items.push(item)}),cb(items)})}var browserFakeUserAgent="Fake/5.0 (FakeOS) AppleWebKit/123 (KHTML, like Gecko) Fake/12.3.4567.89 Fake/123.45";!function(that){that&&"undefined"==typeof window&&"undefined"!=typeof global&&(global.navigator={userAgent:browserFakeUserAgent,getUserMedia:function(){}},global.console||(global.console={}),"undefined"!=typeof global.console.log&&"undefined"!=typeof global.console.error||(global.console.error=global.console.log=global.console.log||function(){console.log(arguments)}),"undefined"==typeof document&&(that.document={documentElement:{appendChild:function(){return""}}},document.createElement=document.captureStream=document.mozCaptureStream=function(){var obj={getContext:function(){return obj},play:function(){},pause:function(){},drawImage:function(){},toDataURL:function(){return""}};return obj},that.HTMLVideoElement=function(){}),"undefined"==typeof location&&(that.location={protocol:"file:",href:"",hash:""}),"undefined"==typeof screen&&(that.screen={width:0,height:0}),"undefined"==typeof URL&&(that.URL={createObjectURL:function(){return""},revokeObjectURL:function(){return""}}),"undefined"==typeof MediaStreamTrack&&(that.MediaStreamTrack=function(){}),"undefined"==typeof RTCPeerConnection&&(that.RTCPeerConnection=function(){}),that.window=global)}("undefined"!=typeof global?global:null);var RTCPeerConnection=window.RTCPeerConnection||window.mozRTCPeerConnection||window.webkitRTCPeerConnection;"undefined"==typeof MediaStreamTrack&&(MediaStreamTrack={});var systemNetworkType=((navigator.connection||{}).type||"unknown").toString().toLowerCase(),getStatsResult={encryption:"sha-256",audio:{send:{tracks:[],codecs:[],availableBandwidth:0,streams:0,framerateMean:0,bitrateMean:0},recv:{tracks:[],codecs:[],availableBandwidth:0,streams:0,framerateMean:0,bitrateMean:0},bytesSent:0,bytesReceived:0,latency:0,packetsLost:0},video:{send:{tracks:[],codecs:[],availableBandwidth:0,streams:0,framerateMean:0,bitrateMean:0},recv:{tracks:[],codecs:[],availableBandwidth:0,streams:0,framerateMean:0,bitrateMean:0},bytesSent:0,bytesReceived:0,latency:0,packetsLost:0},bandwidth:{systemBandwidth:0,sentPerSecond:0,encodedPerSecond:0,helper:{audioBytesSent:0,videoBytestSent:0},speed:0},results:{},connectionType:{systemNetworkType:systemNetworkType,systemIpAddress:"192.168.1.2",local:{candidateType:[],transport:[],ipAddress:[],networkType:[]},remote:{candidateType:[],transport:[],ipAddress:[],networkType:[]}},resolutions:{send:{width:0,height:0},recv:{width:0,height:0}},internal:{audio:{send:{},recv:{}},video:{send:{},recv:{}},candidates:{}},nomore:function(){nomore=!0}},getStatsParser={checkIfOfferer:function(result){"googLibjingleSession"===result.type&&(getStatsResult.isOfferer=result.googInitiator)}},isSafari=/^((?!chrome|android).)*safari/i.test(navigator.userAgent),peer=this;if(!(arguments[0]instanceof RTCPeerConnection))throw"1st argument is not instance of RTCPeerConnection.";peer=arguments[0],arguments[1]instanceof MediaStreamTrack&&(mediaStreamTrack=arguments[1],callback=arguments[2],interval=arguments[3]);var nomore=!1;getStatsParser.datachannel=function(result){"datachannel"===result.type&&(getStatsResult.datachannel={state:result.state})},getStatsParser.googCertificate=function(result){"googCertificate"==result.type&&(getStatsResult.encryption=result.googFingerprintAlgorithm),"certificate"==result.type&&(getStatsResult.encryption=result.fingerprintAlgorithm)},getStatsParser.checkAudioTracks=function(result){if("audio"===result.mediaType){var sendrecvType=result.id.split("_").pop();if(result.isRemote===!0&&(sendrecvType="recv"),result.isRemote===!1&&(sendrecvType="send"),sendrecvType){if(getStatsResult.audio[sendrecvType].codecs.indexOf(result.googCodecName||"opus")===-1&&getStatsResult.audio[sendrecvType].codecs.push(result.googCodecName||"opus"),result.bytesSent){var kilobytes=0;getStatsResult.internal.audio[sendrecvType].prevBytesSent||(getStatsResult.internal.audio[sendrecvType].prevBytesSent=result.bytesSent);var bytes=result.bytesSent-getStatsResult.internal.audio[sendrecvType].prevBytesSent;getStatsResult.internal.audio[sendrecvType].prevBytesSent=result.bytesSent,kilobytes=bytes/1024,getStatsResult.audio[sendrecvType].availableBandwidth=kilobytes.toFixed(1),getStatsResult.audio.bytesSent=kilobytes.toFixed(1)}if(result.bytesReceived){var kilobytes=0;getStatsResult.internal.audio[sendrecvType].prevBytesReceived||(getStatsResult.internal.audio[sendrecvType].prevBytesReceived=result.bytesReceived);var bytes=result.bytesReceived-getStatsResult.internal.audio[sendrecvType].prevBytesReceived;getStatsResult.internal.audio[sendrecvType].prevBytesReceived=result.bytesReceived,kilobytes=bytes/1024,getStatsResult.audio.bytesReceived=kilobytes.toFixed(1)}if(result.googTrackId&&getStatsResult.audio[sendrecvType].tracks.indexOf(result.googTrackId)===-1&&getStatsResult.audio[sendrecvType].tracks.push(result.googTrackId),result.googCurrentDelayMs){var kilobytes=0;getStatsResult.internal.audio.prevGoogCurrentDelayMs||(getStatsResult.internal.audio.prevGoogCurrentDelayMs=result.googCurrentDelayMs);var bytes=result.googCurrentDelayMs-getStatsResult.internal.audio.prevGoogCurrentDelayMs;getStatsResult.internal.audio.prevGoogCurrentDelayMs=result.googCurrentDelayMs,getStatsResult.audio.latency=bytes.toFixed(1),getStatsResult.audio.latency<0&&(getStatsResult.audio.latency=0)}if(result.packetsLost){var kilobytes=0;getStatsResult.internal.audio.prevPacketsLost||(getStatsResult.internal.audio.prevPacketsLost=result.packetsLost);var bytes=result.packetsLost-getStatsResult.internal.audio.prevPacketsLost;getStatsResult.internal.audio.prevPacketsLost=result.packetsLost,getStatsResult.audio.packetsLost=bytes.toFixed(1),getStatsResult.audio.packetsLost<0&&(getStatsResult.audio.packetsLost=0)}}}},getStatsParser.checkVideoTracks=function(result){if("video"===result.mediaType){var sendrecvType=result.id.split("_").pop();if(result.isRemote===!0&&(sendrecvType="recv"),result.isRemote===!1&&(sendrecvType="send"),sendrecvType){if(getStatsResult.video[sendrecvType].codecs.indexOf(result.googCodecName||"VP8")===-1&&getStatsResult.video[sendrecvType].codecs.push(result.googCodecName||"VP8"),result.bytesSent){var kilobytes=0;getStatsResult.internal.video[sendrecvType].prevBytesSent||(getStatsResult.internal.video[sendrecvType].prevBytesSent=result.bytesSent);var bytes=result.bytesSent-getStatsResult.internal.video[sendrecvType].prevBytesSent;getStatsResult.internal.video[sendrecvType].prevBytesSent=result.bytesSent,kilobytes=bytes/1024,getStatsResult.video[sendrecvType].availableBandwidth=kilobytes.toFixed(1),getStatsResult.video.bytesSent=kilobytes.toFixed(1)}if(result.bytesReceived){var kilobytes=0;getStatsResult.internal.video[sendrecvType].prevBytesReceived||(getStatsResult.internal.video[sendrecvType].prevBytesReceived=result.bytesReceived);var bytes=result.bytesReceived-getStatsResult.internal.video[sendrecvType].prevBytesReceived;getStatsResult.internal.video[sendrecvType].prevBytesReceived=result.bytesReceived,kilobytes=bytes/1024,getStatsResult.video.bytesReceived=kilobytes.toFixed(1)}if(result.googFrameHeightReceived&&result.googFrameWidthReceived&&(getStatsResult.resolutions[sendrecvType].width=result.googFrameWidthReceived,getStatsResult.resolutions[sendrecvType].height=result.googFrameHeightReceived),result.googFrameHeightSent&&result.googFrameWidthSent&&(getStatsResult.resolutions[sendrecvType].width=result.googFrameWidthSent,getStatsResult.resolutions[sendrecvType].height=result.googFrameHeightSent),result.googTrackId&&getStatsResult.video[sendrecvType].tracks.indexOf(result.googTrackId)===-1&&getStatsResult.video[sendrecvType].tracks.push(result.googTrackId),result.framerateMean){getStatsResult.bandwidth.framerateMean=result.framerateMean;var kilobytes=0;getStatsResult.internal.video[sendrecvType].prevFramerateMean||(getStatsResult.internal.video[sendrecvType].prevFramerateMean=result.bitrateMean);var bytes=result.bytesSent-getStatsResult.internal.video[sendrecvType].prevFramerateMean;getStatsResult.internal.video[sendrecvType].prevFramerateMean=result.framerateMean,kilobytes=bytes/1024,getStatsResult.video[sendrecvType].framerateMean=bytes.toFixed(1)}if(result.bitrateMean){getStatsResult.bandwidth.bitrateMean=result.bitrateMean;var kilobytes=0;getStatsResult.internal.video[sendrecvType].prevBitrateMean||(getStatsResult.internal.video[sendrecvType].prevBitrateMean=result.bitrateMean);var bytes=result.bytesSent-getStatsResult.internal.video[sendrecvType].prevBitrateMean;getStatsResult.internal.video[sendrecvType].prevBitrateMean=result.bitrateMean,kilobytes=bytes/1024,getStatsResult.video[sendrecvType].bitrateMean=bytes.toFixed(1)}if(result.googCurrentDelayMs){var kilobytes=0;getStatsResult.internal.video.prevGoogCurrentDelayMs||(getStatsResult.internal.video.prevGoogCurrentDelayMs=result.googCurrentDelayMs);var bytes=result.googCurrentDelayMs-getStatsResult.internal.video.prevGoogCurrentDelayMs;getStatsResult.internal.video.prevGoogCurrentDelayMs=result.googCurrentDelayMs,getStatsResult.video.latency=bytes.toFixed(1),getStatsResult.video.latency<0&&(getStatsResult.video.latency=0)}if(result.packetsLost){var kilobytes=0;getStatsResult.internal.video.prevPacketsLost||(getStatsResult.internal.video.prevPacketsLost=result.packetsLost);var bytes=result.packetsLost-getStatsResult.internal.video.prevPacketsLost;getStatsResult.internal.video.prevPacketsLost=result.packetsLost,getStatsResult.video.packetsLost=bytes.toFixed(1),getStatsResult.video.packetsLost<0&&(getStatsResult.video.packetsLost=0)}}}},getStatsParser.bweforvideo=function(result){"VideoBwe"===result.type&&(getStatsResult.bandwidth.availableSendBandwidth=result.googAvailableSendBandwidth,getStatsResult.bandwidth.googActualEncBitrate=result.googActualEncBitrate,getStatsResult.bandwidth.googAvailableSendBandwidth=result.googAvailableSendBandwidth,getStatsResult.bandwidth.googAvailableReceiveBandwidth=result.googAvailableReceiveBandwidth,getStatsResult.bandwidth.googRetransmitBitrate=result.googRetransmitBitrate,getStatsResult.bandwidth.googTargetEncBitrate=result.googTargetEncBitrate,getStatsResult.bandwidth.googBucketDelay=result.googBucketDelay,getStatsResult.bandwidth.googTransmitBitrate=result.googTransmitBitrate)},getStatsParser.candidatePair=function(result){if("googCandidatePair"===result.type||"candidate-pair"===result.type||"local-candidate"===result.type||"remote-candidate"===result.type){if("true"==result.googActiveConnection){Object.keys(getStatsResult.internal.candidates).forEach(function(cid){var candidate=getStatsResult.internal.candidates[cid];candidate.ipAddress.indexOf(result.googLocalAddress)!==-1&&(getStatsResult.connectionType.local.candidateType=candidate.candidateType,getStatsResult.connectionType.local.ipAddress=candidate.ipAddress,getStatsResult.connectionType.local.networkType=candidate.networkType,getStatsResult.connectionType.local.transport=candidate.transport),candidate.ipAddress.indexOf(result.googRemoteAddress)!==-1&&(getStatsResult.connectionType.remote.candidateType=candidate.candidateType,getStatsResult.connectionType.remote.ipAddress=candidate.ipAddress,getStatsResult.connectionType.remote.networkType=candidate.networkType,getStatsResult.connectionType.remote.transport=candidate.transport)}),getStatsResult.connectionType.transport=result.googTransportType;var localCandidate=getStatsResult.internal.candidates[result.localCandidateId];localCandidate&&localCandidate.ipAddress&&(getStatsResult.connectionType.systemIpAddress=localCandidate.ipAddress);var remoteCandidate=getStatsResult.internal.candidates[result.remoteCandidateId];remoteCandidate&&remoteCandidate.ipAddress&&(getStatsResult.connectionType.systemIpAddress=remoteCandidate.ipAddress)}if("candidate-pair"===result.type&&result.selected===!0&&result.nominated===!0&&"succeeded"===result.state)var localCandidate=getStatsResult.internal.candidates[result.remoteCandidateId],remoteCandidate=getStatsResult.internal.candidates[result.remoteCandidateId];if("local-candidate"===result.type&&(getStatsResult.connectionType.local.candidateType=result.candidateType,getStatsResult.connectionType.local.ipAddress=result.ipAddress,getStatsResult.connectionType.local.networkType=result.networkType,getStatsResult.connectionType.local.transport=result.mozLocalTransport||result.transport),"remote-candidate"===result.type&&(getStatsResult.connectionType.remote.candidateType=result.candidateType,getStatsResult.connectionType.remote.ipAddress=result.ipAddress,getStatsResult.connectionType.remote.networkType=result.networkType,getStatsResult.connectionType.remote.transport=result.mozRemoteTransport||result.transport),isSafari){var sendrecvType=result.localCandidateId?"send":"recv";if(!sendrecvType)return;if(result.bytesSent){var kilobytes=0;getStatsResult.internal.video[sendrecvType].prevBytesSent||(getStatsResult.internal.video[sendrecvType].prevBytesSent=result.bytesSent);var bytes=result.bytesSent-getStatsResult.internal.video[sendrecvType].prevBytesSent;getStatsResult.internal.video[sendrecvType].prevBytesSent=result.bytesSent,kilobytes=bytes/1024,getStatsResult.video[sendrecvType].availableBandwidth=kilobytes.toFixed(1),getStatsResult.video.bytesSent=kilobytes.toFixed(1)}if(result.bytesReceived){var kilobytes=0;getStatsResult.internal.video[sendrecvType].prevBytesReceived||(getStatsResult.internal.video[sendrecvType].prevBytesReceived=result.bytesReceived);var bytes=result.bytesReceived-getStatsResult.internal.video[sendrecvType].prevBytesReceived;getStatsResult.internal.video[sendrecvType].prevBytesReceived=result.bytesReceived,kilobytes=bytes/1024,getStatsResult.video.bytesReceived=kilobytes.toFixed(1)}if(result.availableOutgoingBitrate){var kilobytes=0;getStatsResult.internal.video[sendrecvType].prevAvailableOutgoingBitrate||(getStatsResult.internal.video[sendrecvType].prevAvailableOutgoingBitrate=result.availableOutgoingBitrate);var bytes=result.availableOutgoingBitrate-getStatsResult.internal.video[sendrecvType].prevAvailableOutgoingBitrate;getStatsResult.internal.video[sendrecvType].prevAvailableOutgoingBitrate=result.availableOutgoingBitrate,kilobytes=bytes/1024,getStatsResult.video.availableOutgoingBitrate=kilobytes.toFixed(1)}if(result.availableIncomingBitrate){var kilobytes=0;getStatsResult.internal.video[sendrecvType].prevAvailableIncomingBitrate||(getStatsResult.internal.video[sendrecvType].prevAvailableIncomingBitrate=result.availableIncomingBitrate);var bytes=result.availableIncomingBitrate-getStatsResult.internal.video[sendrecvType].prevAvailableIncomingBitrate;getStatsResult.internal.video[sendrecvType].prevAvailableIncomingBitrate=result.availableIncomingBitrate,kilobytes=bytes/1024,getStatsResult.video.availableIncomingBitrate=kilobytes.toFixed(1)}}}};var LOCAL_candidateType={},LOCAL_transport={},LOCAL_ipAddress={},LOCAL_networkType={};getStatsParser.localcandidate=function(result){"localcandidate"!==result.type&&"local-candidate"!==result.type||result.id&&(LOCAL_candidateType[result.id]||(LOCAL_candidateType[result.id]=[]),LOCAL_transport[result.id]||(LOCAL_transport[result.id]=[]),LOCAL_ipAddress[result.id]||(LOCAL_ipAddress[result.id]=[]),LOCAL_networkType[result.id]||(LOCAL_networkType[result.id]=[]),result.candidateType&&LOCAL_candidateType[result.id].indexOf(result.candidateType)===-1&&LOCAL_candidateType[result.id].push(result.candidateType),result.transport&&LOCAL_transport[result.id].indexOf(result.transport)===-1&&LOCAL_transport[result.id].push(result.transport),result.ipAddress&&LOCAL_ipAddress[result.id].indexOf(result.ipAddress+":"+result.portNumber)===-1&&LOCAL_ipAddress[result.id].push(result.ipAddress+":"+result.portNumber),result.networkType&&LOCAL_networkType[result.id].indexOf(result.networkType)===-1&&LOCAL_networkType[result.id].push(result.networkType),getStatsResult.internal.candidates[result.id]={candidateType:LOCAL_candidateType[result.id],ipAddress:LOCAL_ipAddress[result.id],portNumber:result.portNumber,networkType:LOCAL_networkType[result.id],priority:result.priority,transport:LOCAL_transport[result.id],timestamp:result.timestamp,id:result.id,type:result.type},getStatsResult.connectionType.local.candidateType=LOCAL_candidateType[result.id],getStatsResult.connectionType.local.ipAddress=LOCAL_ipAddress[result.id],getStatsResult.connectionType.local.networkType=LOCAL_networkType[result.id],getStatsResult.connectionType.local.transport=LOCAL_transport[result.id])};var REMOTE_candidateType={},REMOTE_transport={},REMOTE_ipAddress={},REMOTE_networkType={};getStatsParser.remotecandidate=function(result){"remotecandidate"!==result.type&&"remote-candidate"!==result.type||result.id&&(REMOTE_candidateType[result.id]||(REMOTE_candidateType[result.id]=[]),REMOTE_transport[result.id]||(REMOTE_transport[result.id]=[]),REMOTE_ipAddress[result.id]||(REMOTE_ipAddress[result.id]=[]),REMOTE_networkType[result.id]||(REMOTE_networkType[result.id]=[]),result.candidateType&&REMOTE_candidateType[result.id].indexOf(result.candidateType)===-1&&REMOTE_candidateType[result.id].push(result.candidateType),result.transport&&REMOTE_transport[result.id].indexOf(result.transport)===-1&&REMOTE_transport[result.id].push(result.transport),result.ipAddress&&REMOTE_ipAddress[result.id].indexOf(result.ipAddress+":"+result.portNumber)===-1&&REMOTE_ipAddress[result.id].push(result.ipAddress+":"+result.portNumber),result.networkType&&REMOTE_networkType[result.id].indexOf(result.networkType)===-1&&REMOTE_networkType[result.id].push(result.networkType),getStatsResult.internal.candidates[result.id]={candidateType:REMOTE_candidateType[result.id],ipAddress:REMOTE_ipAddress[result.id],portNumber:result.portNumber,networkType:REMOTE_networkType[result.id],priority:result.priority,transport:REMOTE_transport[result.id],timestamp:result.timestamp,id:result.id,type:result.type},getStatsResult.connectionType.remote.candidateType=REMOTE_candidateType[result.id],getStatsResult.connectionType.remote.ipAddress=REMOTE_ipAddress[result.id],getStatsResult.connectionType.remote.networkType=REMOTE_networkType[result.id],getStatsResult.connectionType.remote.transport=REMOTE_transport[result.id])},getStatsParser.dataSentReceived=function(result){!result.googCodecName||"video"!==result.mediaType&&"audio"!==result.mediaType||(result.bytesSent&&(getStatsResult[result.mediaType].bytesSent=parseInt(result.bytesSent)),result.bytesReceived&&(getStatsResult[result.mediaType].bytesReceived=parseInt(result.bytesReceived)))},getStatsParser.inboundrtp=function(result){if(isSafari&&"inbound-rtp"===result.type){var mediaType=result.mediaType||"audio",sendrecvType=result.isRemote?"recv":"send";if(sendrecvType){if(result.bytesSent){var kilobytes=0;getStatsResult.internal[mediaType][sendrecvType].prevBytesSent||(getStatsResult.internal[mediaType][sendrecvType].prevBytesSent=result.bytesSent);var bytes=result.bytesSent-getStatsResult.internal[mediaType][sendrecvType].prevBytesSent;getStatsResult.internal[mediaType][sendrecvType].prevBytesSent=result.bytesSent,kilobytes=bytes/1024,getStatsResult[mediaType][sendrecvType].availableBandwidth=kilobytes.toFixed(1),getStatsResult[mediaType].bytesSent=kilobytes.toFixed(1)}if(result.bytesReceived){var kilobytes=0;getStatsResult.internal[mediaType][sendrecvType].prevBytesReceived||(getStatsResult.internal[mediaType][sendrecvType].prevBytesReceived=result.bytesReceived);var bytes=result.bytesReceived-getStatsResult.internal[mediaType][sendrecvType].prevBytesReceived;getStatsResult.internal[mediaType][sendrecvType].prevBytesReceived=result.bytesReceived,kilobytes=bytes/1024,getStatsResult[mediaType].bytesReceived=kilobytes.toFixed(1)}}}},getStatsParser.outboundrtp=function(result){if(isSafari&&"outbound-rtp"===result.type){var mediaType=result.mediaType||"audio",sendrecvType=result.isRemote?"recv":"send";if(sendrecvType){if(result.bytesSent){var kilobytes=0;getStatsResult.internal[mediaType][sendrecvType].prevBytesSent||(getStatsResult.internal[mediaType][sendrecvType].prevBytesSent=result.bytesSent);var bytes=result.bytesSent-getStatsResult.internal[mediaType][sendrecvType].prevBytesSent;getStatsResult.internal[mediaType][sendrecvType].prevBytesSent=result.bytesSent,kilobytes=bytes/1024,getStatsResult[mediaType][sendrecvType].availableBandwidth=kilobytes.toFixed(1),getStatsResult[mediaType].bytesSent=kilobytes.toFixed(1)}if(result.bytesReceived){var kilobytes=0;getStatsResult.internal[mediaType][sendrecvType].prevBytesReceived||(getStatsResult.internal[mediaType][sendrecvType].prevBytesReceived=result.bytesReceived);var bytes=result.bytesReceived-getStatsResult.internal[mediaType][sendrecvType].prevBytesReceived;getStatsResult.internal[mediaType][sendrecvType].prevBytesReceived=result.bytesReceived,kilobytes=bytes/1024,getStatsResult[mediaType].bytesReceived=kilobytes.toFixed(1)}}}},getStatsParser.track=function(result){if(isSafari&&"track"===result.type){var sendrecvType=result.remoteSource===!0?"send":"recv";result.frameWidth&&result.frameHeight&&(getStatsResult.resolutions[sendrecvType].width=result.frameWidth,getStatsResult.resolutions[sendrecvType].height=result.frameHeight)}};var SSRC={audio:{send:[],recv:[]},video:{send:[],recv:[]}};getStatsParser.ssrc=function(result){if(result.googCodecName&&("video"===result.mediaType||"audio"===result.mediaType)&&"ssrc"===result.type){var sendrecvType=result.id.split("_").pop();SSRC[result.mediaType][sendrecvType].indexOf(result.ssrc)===-1&&SSRC[result.mediaType][sendrecvType].push(result.ssrc),getStatsResult[result.mediaType][sendrecvType].streams=SSRC[result.mediaType][sendrecvType].length}},getStatsLooper()};"undefined"!=typeof module&&(module.exports=getStats),"function"==typeof define&&define.amd&&define("getStats",[],function(){return getStats});
// BandwidthHandler.js
var BandwidthHandler = (function() {

    function setBAS(sdp, bandwidth, isScreen) {
        if (!!navigator.mozGetUserMedia || !bandwidth) {
            return sdp;
        }

        if (isScreen) {
            if (!bandwidth.screen) {
                console.warn('It seems that you are not using bandwidth for screen. Screen sharing is expected to fail.');
            } else if (bandwidth.screen < 300) {
                console.warn('It seems that you are using wrong bandwidth value for screen. Screen sharing is expected to fail.');
            }
        }

        // if screen; must use at least 300kbs
        if (bandwidth.screen && isScreen) {
            sdp = sdp.replace(/b=AS([^\r\n]+\r\n)/g, '');
            sdp = sdp.replace(/a=mid:video\r\n/g, 'a=mid:video\r\nb=AS:' + bandwidth.screen + '\r\n');
        }

        // remove existing bandwidth lines
        if (bandwidth.audio || bandwidth.video || bandwidth.data) {
            sdp = sdp.replace(/b=AS([^\r\n]+\r\n)/g, '');
        }

        if (bandwidth.audio) {
            sdp = sdp.replace(/a=mid:audio\r\n/g, 'a=mid:audio\r\nb=AS:' + bandwidth.audio + '\r\n');
        }

        if (bandwidth.video) {
            sdp = sdp.replace(/a=mid:video\r\n/g, 'a=mid:video\r\nb=AS:' + (isScreen ? bandwidth.screen : bandwidth.video) + '\r\n');
        }

        return sdp;
    }

    // Find the line in sdpLines that starts with |prefix|, and, if specified,
    // contains |substr| (case-insensitive search).
    function findLine(sdpLines, prefix, substr) {
        return findLineInRange(sdpLines, 0, -1, prefix, substr);
    }

    // Find the line in sdpLines[startLine...endLine - 1] that starts with |prefix|
    // and, if specified, contains |substr| (case-insensitive search).
    function findLineInRange(sdpLines, startLine, endLine, prefix, substr) {
        var realEndLine = endLine !== -1 ? endLine : sdpLines.length;
        for (var i = startLine; i < realEndLine; ++i) {
            if (sdpLines[i].indexOf(prefix) === 0) {
                if (!substr ||
                    sdpLines[i].toLowerCase().indexOf(substr.toLowerCase()) !== -1) {
                    return i;
                }
            }
        }
        return null;
    }

    // Gets the codec payload type from an a=rtpmap:X line.
    function getCodecPayloadType(sdpLine) {
        var pattern = new RegExp('a=rtpmap:(\\d+) \\w+\\/\\d+');
        var result = sdpLine.match(pattern);
        return (result && result.length === 2) ? result[1] : null;
    }

    function setVideoBitrates(sdp, params) {
        params = params || {};
        var xgoogle_min_bitrate = params.min;
				var xgoogle_max_bitrate = params.max;
				var videoCodec = params.codec.toUpperCase() || "VP8"
				
				sdp = CodecsHandler.preferCodec(sdp, videoCodec)

				var sdpLines = sdp.split('\r\n');
				
        var vp8Index = findLine(sdpLines, 'a=rtpmap', `${videoCodec}/90000`);
        var vp8Payload;
        if (vp8Index) {
            vp8Payload = getCodecPayloadType(sdpLines[vp8Index]);
        }

        if (!vp8Payload) {
            return sdp;
        }

        var rtxIndex = findLine(sdpLines, 'a=rtpmap', 'rtx/90000');
        var rtxPayload;
        if (rtxIndex) {
            rtxPayload = getCodecPayloadType(sdpLines[rtxIndex]);
        }

        if (!rtxIndex) {
            return sdp;
        }

        var rtxFmtpLineIndex = findLine(sdpLines, 'a=fmtp:' + rtxPayload.toString());
        if (rtxFmtpLineIndex !== null) {
            var appendrtxNext = '\r\n';
            appendrtxNext += 'a=fmtp:' + vp8Payload + ' x-google-min-bitrate=' + (xgoogle_min_bitrate || '228') + '; x-google-max-bitrate=' + (xgoogle_max_bitrate || '228');
            sdpLines[rtxFmtpLineIndex] = sdpLines[rtxFmtpLineIndex].concat(appendrtxNext);
            sdp = sdpLines.join('\r\n');
        }

        return sdp;
    }

    function setOpusAttributes(sdp, params) {
        params = params || {};

        var sdpLines = sdp.split('\r\n');

        // Opus
        var opusIndex = findLine(sdpLines, 'a=rtpmap', 'opus/48000');
        var opusPayload;
        if (opusIndex) {
            opusPayload = getCodecPayloadType(sdpLines[opusIndex]);
        }

        if (!opusPayload) {
            return sdp;
        }

        var opusFmtpLineIndex = findLine(sdpLines, 'a=fmtp:' + opusPayload.toString());
        if (opusFmtpLineIndex === null) {
            return sdp;
        }

        var appendOpusNext = '';
        appendOpusNext += '; stereo=' + (typeof params.stereo != 'undefined' ? params.stereo : '1');
        appendOpusNext += '; sprop-stereo=' + (typeof params['sprop-stereo'] != 'undefined' ? params['sprop-stereo'] : '1');

        if (typeof params.maxaveragebitrate != 'undefined') {
            appendOpusNext += '; maxaveragebitrate=' + (params.maxaveragebitrate || 128 * 1024 * 8);
        }

        if (typeof params.maxplaybackrate != 'undefined') {
            appendOpusNext += '; maxplaybackrate=' + (params.maxplaybackrate || 128 * 1024 * 8);
        }

        if (typeof params.cbr != 'undefined') {
            appendOpusNext += '; cbr=' + (typeof params.cbr != 'undefined' ? params.cbr : '1');
        }

        if (typeof params.useinbandfec != 'undefined') {
            appendOpusNext += '; useinbandfec=' + params.useinbandfec;
        }

        if (typeof params.usedtx != 'undefined') {
            appendOpusNext += '; usedtx=' + params.usedtx;
        }

        if (typeof params.maxptime != 'undefined') {
            appendOpusNext += '\r\na=maxptime:' + params.maxptime;
        }

        sdpLines[opusFmtpLineIndex] = sdpLines[opusFmtpLineIndex].concat(appendOpusNext);

        sdp = sdpLines.join('\r\n');
        return sdp;
    }

    return {
        setApplicationSpecificBandwidth: function(sdp, bandwidth, isScreen) {
            return setBAS(sdp, bandwidth, isScreen);
        },
        setVideoBitrates: function(sdp, params) {
            return setVideoBitrates(sdp, params);
        },
        setOpusAttributes: function(sdp, params) {
            return setOpusAttributes(sdp, params);
        }
    };
})();

// inspired by ep_comments_page plugin, used and modified copyPasteEvents.js

'use strict';
var _ = require('ep_etherpad-lite/static/js/underscore');
var randomString = require('ep_etherpad-lite/static/js/pad_utils').randomString;

var events = (function events() {

	var padInner = null;

	var getFirstColumnOfSelection = function getFirstColumnOfSelection(line, rep, firstLineOfSelection) {
		return line !== firstLineOfSelection ? 0 : rep.selStart[1];
	};
	
	var getLength = function getLength(line, rep) {
		var nextLine = line + 1;
		var startLineOffset = rep.lines.offsetOfIndex(line);
		var endLineOffset = rep.lines.offsetOfIndex(nextLine);
	
		// lineLength without \n
		var lineLength = endLineOffset - startLineOffset - 1;
	
		return lineLength;
	};
	
	var getLastColumnOfSelection = function getLastColumnOfSelection(line, rep, lastLineOfSelection) {
		var lastColumnOfSelection;
		if (line !== lastLineOfSelection) {
			lastColumnOfSelection = getLength(line, rep); // length of line
		} else {
			lastColumnOfSelection = rep.selEnd[1] - 1; // position of last character selected
		}
		return lastColumnOfSelection;
	};
	
	
	var hasCommentOnLine = function hasCommentOnLine(lineNumber, firstColumn, lastColumn, attributeManager) {
		var foundHeadOnLine = false;
		var headId = null;
		for (var column = firstColumn; column <= lastColumn && !foundHeadOnLine; column++) {
			headId = _.object(attributeManager.getAttributesOnPosition(lineNumber, column)).headingTagId;
			if (headId) {
				foundHeadOnLine = true;
			}
		}
		return { foundHeadOnLine: foundHeadOnLine, headId: headId };
	};
	
	var hasCommentOnMultipleLineSelection = function hasCommentOnMultipleLineSelection(firstLineOfSelection, lastLineOfSelection, rep, attributeManager) {
		var foundLineWithComment = false;
		for (var line = firstLineOfSelection; line <= lastLineOfSelection && !foundLineWithComment; line++) {
			var firstColumn = getFirstColumnOfSelection(line, rep, firstLineOfSelection);
			var lastColumn = getLastColumnOfSelection(line, rep, lastLineOfSelection);
			var hasComment = hasCommentOnLine(line, firstColumn, lastColumn, attributeManager);
			if (hasComment) {
				foundLineWithComment = true;
			}
		}
		return foundLineWithComment;
	};
	
	var hasMultipleLineSelected = function hasMultipleLineSelected(firstLineOfSelection, lastLineOfSelection) {
		return firstLineOfSelection !== lastLineOfSelection;
	};
	
	var hasHeaderOnSelection = function hasHeaderOnSelection() {
		var hasVideoHeader;
		var attributeManager = this.documentAttributeManager;
		var rep = this.rep;
		var firstLineOfSelection = rep.selStart[0];
		var firstColumn = rep.selStart[1];
		var lastColumn = rep.selEnd[1];
		var lastLineOfSelection = rep.selEnd[0];
		var selectionOfMultipleLine = hasMultipleLineSelected(firstLineOfSelection, lastLineOfSelection);
		if (selectionOfMultipleLine) {
			hasVideoHeader = hasCommentOnMultipleLineSelection(firstLineOfSelection, lastLineOfSelection, rep, attributeManager);
		} else {
			hasVideoHeader = hasCommentOnLine(firstLineOfSelection, firstColumn, lastColumn, attributeManager);
		}
		return { hasVideoHeader: hasVideoHeader.foundHeadOnLine, headId: hasVideoHeader.headId, hasMultipleLine: selectionOfMultipleLine };
	};
	
	function getSelectionHtml() {
		var html = '';
		if (typeof window.getSelection !== 'undefined') {
			var sel = padInner.contents()[0].getSelection();
			if (sel.rangeCount) {
				var container = document.createElement('div');
				for (var i = 0, len = sel.rangeCount; i < len; ++i) {
					container.appendChild(sel.getRangeAt(i).cloneContents());
				}
				html = container.innerHTML;
			}
		} else if (typeof document.selection !== 'undefined') {
			if (document.selection.type === 'Text') {
				html = document.selection.createRange().htmlText;
			}
		}
		return html;
	}
	
	function selectionMultipleLine() {
		var rawHtml = getSelectionHtml();
		rawHtml = $('<div></div>').append(rawHtml);
		rawHtml.find(':header span').removeClass(function removeClass(index, css) {
			return (css.match(/\headingTagId_\S+/g) || []).join(' ');
		}).addClass(function addClass(index, css) {
			return 'headingTagId_' + randomString(16) + ' ' + css;
		});
		return rawHtml.html();
	}
	
	function selectionOneLine(headerId) {
		var hTag = padInner.contents().find('.headingTagId_' + headerId).closest(':header').eq(0).prop("tagName").toLowerCase();
		var content = padInner.contents().find('.headingTagId_' + headerId).closest(':header span').removeClass(function(index, css) {
			return (css.match(/\headingTagId_\S+/g) || []).join(' ');
		}).html();
		if(!hTag && !content) return false;
		var rawHtml = $('<div></div>').append('<' + hTag + "><span class='headingTagId_" + randomString(16) + "'>" + content + '</span></' + hTag + '>');
		return rawHtml.html();
	}
	
	var addTextOnClipboard = function addTextOnClipboard(e, aces, inner, removeSelection) {
		padInner = inner;
	
		var selection;
		aces.callWithAce(function callWithAce(ace) {
			selection = ace.ace_hasHeaderOnSelection();
		});
	
		if (selection.hasVideoHeader || selection.hasMultipleLine) {
			var rawHtml;
			if (selection.hasMultipleLine) {
				var htmlSelection = getSelectionHtml();
				rawHtml = selectionMultipleLine(htmlSelection);
			} else {
				if(!selection.headId) return false;
				rawHtml = selectionOneLine(selection.headId);
			}
	
			if (rawHtml) {
				e.originalEvent.clipboardData.setData('text/html', rawHtml);
				e.preventDefault();
				return false;
			}
	
			// if it is a cut event we have to remove the selection
			if (removeSelection) {
				padInner.contents()[0].execCommand('delete');
			}
		}
	};
	
	return Object.freeze({
		addTextOnClipboard,
		hasHeaderOnSelection
	})

})();
(function(a){var r=a.fn.domManip,d="_tmplitem",q=/^[^<]*(<[\w\W]+>)[^>]*$|\{\{\! /,b={},f={},e,p={key:0,data:{}},h=0,c=0,l=[];function g(e,d,g,i){var c={data:i||(d?d.data:{}),_wrap:d?d._wrap:null,tmpl:null,parent:d||null,nodes:[],calls:u,nest:w,wrap:x,html:v,update:t};e&&a.extend(c,e,{nodes:[],parent:d});if(g){c.tmpl=g;c._ctnt=c._ctnt||c.tmpl(a,c);c.key=++h;(l.length?f:b)[h]=c}return c}a.each({appendTo:"append",prependTo:"prepend",insertBefore:"before",insertAfter:"after",replaceAll:"replaceWith"},function(f,d){a.fn[f]=function(n){var g=[],i=a(n),k,h,m,l,j=this.length===1&&this[0].parentNode;e=b||{};if(j&&j.nodeType===11&&j.childNodes.length===1&&i.length===1){i[d](this[0]);g=this}else{for(h=0,m=i.length;h<m;h++){c=h;k=(h>0?this.clone(true):this).get();a.fn[d].apply(a(i[h]),k);g=g.concat(k)}c=0;g=this.pushStack(g,f,i.selector)}l=e;e=null;a.tmpl.complete(l);return g}});a.fn.extend({tmpl:function(d,c,b){return a.tmpl(this[0],d,c,b)},tmplItem:function(){return a.tmplItem(this[0])},template:function(b){return a.template(b,this[0])},domManip:function(d,l,j){if(d[0]&&d[0].nodeType){var f=a.makeArray(arguments),g=d.length,i=0,h;while(i<g&&!(h=a.data(d[i++],"tmplItem")));if(g>1)f[0]=[a.makeArray(d)];if(h&&c)f[2]=function(b){a.tmpl.afterManip(this,b,j)};r.apply(this,f)}else r.apply(this,arguments);c=0;!e&&a.tmpl.complete(b);return this}});a.extend({tmpl:function(d,h,e,c){var j,k=!c;if(k){c=p;d=a.template[d]||a.template(null,d);f={}}else if(!d){d=c.tmpl;b[c.key]=c;c.nodes=[];c.wrapped&&n(c,c.wrapped);return a(i(c,null,c.tmpl(a,c)))}if(!d)return[];if(typeof h==="function")h=h.call(c||{});e&&e.wrapped&&n(e,e.wrapped);j=a.isArray(h)?a.map(h,function(a){return a?g(e,c,d,a):null}):[g(e,c,d,h)];return k?a(i(c,null,j)):j},tmplItem:function(b){var c;if(b instanceof a)b=b[0];while(b&&b.nodeType===1&&!(c=a.data(b,"tmplItem"))&&(b=b.parentNode));return c||p},template:function(c,b){if(b){if(typeof b==="string")b=o(b);else if(b instanceof a)b=b[0]||{};if(b.nodeType)b=a.data(b,"tmpl")||a.data(b,"tmpl",o(b.innerHTML));return typeof c==="string"?(a.template[c]=b):b}return c?typeof c!=="string"?a.template(null,c):a.template[c]||a.template(null,q.test(c)?c:a(c)):null},encode:function(a){return(""+a).split("<").join("&lt;").split(">").join("&gt;").split('"').join("&#34;").split("'").join("&#39;")}});a.extend(a.tmpl,{tag:{tmpl:{_default:{$2:"null"},open:"if($notnull_1){_=_.concat($item.nest($1,$2));}"},wrap:{_default:{$2:"null"},open:"$item.calls(_,$1,$2);_=[];",close:"call=$item.calls();_=call._.concat($item.wrap(call,_));"},each:{_default:{$2:"$index, $value"},open:"if($notnull_1){$.each($1a,function($2){with(this){",close:"}});}"},"if":{open:"if(($notnull_1) && $1a){",close:"}"},"else":{_default:{$1:"true"},open:"}else if(($notnull_1) && $1a){"},html:{open:"if($notnull_1){_.push($1a);}"},"=":{_default:{$1:"$data"},open:"if($notnull_1){_.push($.encode($1a));}"},"!":{open:""}},complete:function(){b={}},afterManip:function(f,b,d){var e=b.nodeType===11?a.makeArray(b.childNodes):b.nodeType===1?[b]:[];d.call(f,b);m(e);c++}});function i(e,g,f){var b,c=f?a.map(f,function(a){return typeof a==="string"?e.key?a.replace(/(<\w+)(?=[\s>])(?![^>]*_tmplitem)([^>]*)/g,"$1 "+d+'="'+e.key+'" $2'):a:i(a,e,a._ctnt)}):e;if(g)return c;c=c.join("");c.replace(/^\s*([^<\s][^<]*)?(<[\w\W]+>)([^>]*[^>\s])?\s*$/,function(f,c,e,d){b=a(e).get();m(b);if(c)b=j(c).concat(b);if(d)b=b.concat(j(d))});return b?b:j(c)}function j(c){var b=document.createElement("div");b.innerHTML=c;return a.makeArray(b.childNodes)}function o(b){return new Function("jQuery","$item","var $=jQuery,call,_=[],$data=$item.data;with($data){_.push('"+a.trim(b).replace(/([\\'])/g,"\\$1").replace(/[\r\t\n]/g," ").replace(/\$\{([^\}]*)\}/g,"{{= $1}}").replace(/\{\{(\/?)(\w+|.)(?:\(((?:[^\}]|\}(?!\}))*?)?\))?(?:\s+(.*?)?)?(\(((?:[^\}]|\}(?!\}))*?)\))?\s*\}\}/g,function(m,l,j,d,b,c,e){var i=a.tmpl.tag[j],h,f,g;if(!i)throw"Template command not found: "+j;h=i._default||[];if(c&&!/\w$/.test(b)){b+=c;c=""}if(b){b=k(b);e=e?","+k(e)+")":c?")":"";f=c?b.indexOf(".")>-1?b+c:"("+b+").call($item"+e:b;g=c?f:"(typeof("+b+")==='function'?("+b+").call($item):("+b+"))"}else g=f=h.$1||"null";d=k(d);return"');"+i[l?"close":"open"].split("$notnull_1").join(b?"typeof("+b+")!=='undefined' && ("+b+")!=null":"true").split("$1a").join(g).split("$1").join(f).split("$2").join(d?d.replace(/\s*([^\(]+)\s*(\((.*?)\))?/g,function(d,c,b,a){a=a?","+a+")":b?")":"";return a?"("+c+").call($item"+a:d}):h.$2||"")+"_.push('"})+"');}return _;")}function n(c,b){c._wrap=i(c,true,a.isArray(b)?b:[q.test(b)?b:a(b).html()]).join("")}function k(a){return a?a.replace(/\\'/g,"'").replace(/\\\\/g,"\\"):null}function s(b){var a=document.createElement("div");a.appendChild(b.cloneNode(true));return a.innerHTML}function m(o){var n="_"+c,k,j,l={},e,p,i;for(e=0,p=o.length;e<p;e++){if((k=o[e]).nodeType!==1)continue;j=k.getElementsByTagName("*");for(i=j.length-1;i>=0;i--)m(j[i]);m(k)}function m(j){var p,i=j,k,e,m;if(m=j.getAttribute(d)){while(i.parentNode&&(i=i.parentNode).nodeType===1&&!(p=i.getAttribute(d)));if(p!==m){i=i.parentNode?i.nodeType===11?0:i.getAttribute(d)||0:0;if(!(e=b[m])){e=f[m];e=g(e,b[i]||f[i],null,true);e.key=++h;b[h]=e}c&&o(m)}j.removeAttribute(d)}else if(c&&(e=a.data(j,"tmplItem"))){o(e.key);b[e.key]=e;i=a.data(j.parentNode,"tmplItem");i=i?i.key:0}if(e){k=e;while(k&&k.key!=i){k.nodes.push(j);k=k.parent}delete e._ctnt;delete e._wrap;a.data(j,"tmplItem",e)}function o(a){a=a+n;e=l[a]=l[a]||g(e,b[e.parent.key+n]||e.parent,null,true)}}}function u(a,d,c,b){if(!a)return l.pop();l.push({_:a,tmpl:d,item:this,data:c,options:b})}function w(d,c,b){return a.tmpl(a.template(d),c,b,this)}function x(b,d){var c=b.options||{};c.wrapped=d;return a.tmpl(a.template(b.tmpl),b.data,c,b.item)}function v(d,c){var b=this._wrap;return a.map(a(a.isArray(b)?b.join(""):b).filter(d||"*"),function(a){return c?a.innerText||a.textContent:a.outerHTML||s(a)})}function t(){var b=this.nodes;a.tmpl(null,null,null,this).insertBefore(b[0]);a(b).remove()}})(jQuery)
'use strict';

var avatarUrl = '../static/plugins/ep_profile_modal/static/img/user.png';

var share = (function textChat() {

	var getUserId = function getUserId() {
		return clientVars.userId || window.pad.getUserId();
	}



	function stopStreaming(stream) {
		if (stream) {
			stream.getTracks().forEach(function stopStream(track) {
				track.stop();
				stream.removeTrack(track);
			});
			stream = null;
		}
	}
	
	var scrollDownToLastChatText = function scrollDownToLastChatText(selector) {
		var $element = $(selector);
		if ($element.length <= 0 || !$element[0]) return true;
		$element.animate({ scrollTop: $element[0].scrollHeight }, { duration: 400, queue: false });
	};

	var getUserFromId = function getUserFromId(userId) {
		if (!window.pad || !window.pad.collabClient) return null;
		var result = window.pad.collabClient.getConnectedUsers().filter(function getUser(user) {
			return user.userId === userId;
		});
		var user = result.length > 0 ? result[0] : null;
		return user;
	};
	
	var slugify = function slugify(text) {
		return text.toString().toLowerCase().trim().replace(/\s+/g, '-') // Replace spaces with -
		.replace(/&/g, '-and-') // Replace & with 'and'
		.replace(/[^\w\-]+/g, '') // Remove all non-word chars
		.replace(/\--+/g, '-') // Replace multiple - with single -
		.replace(/^-+/, '') // Trim - from start of text
		.replace(/-+$/, ''); // Trim - from end of text
	};
	
	var $body_ace_outer = function $body_ace_outer() {
		return $(document).find('iframe[name="ace_outer"]').contents();
	};
	
	var createShareLink = function createShareLink(headingTagId, headerText) {
		return window.location.origin + window.location.pathname + '?header=' + slugify(headerText) + '&headerId=' + headingTagId + '&joinvideo=true';
	};
	
	function addTextChatMessage(msg) {
		var authorClass = 'author-' + msg.userId.replace(/[^a-y0-9]/g, function replace(c) {
			if (c === '.') return '-';
			return 'z' + c.charCodeAt(0) + 'z';
		});
	
		// create the time string
		var minutes = '' + new Date(msg.time).getMinutes();
		var hours = '' + new Date(msg.time).getHours();
		if (minutes.length === 1) minutes = '0' + minutes;
		if (hours.length === 1) hours = '0' + hours;
		var timeStr = hours + ':' + minutes;
	
		var html = "<p data-target='" + msg.target + "' data-id='" + msg.headerId + "' data-authorId='" + msg.userId + "' class='wrtc_text " + msg.headId + ' ' + authorClass + "'><b>" + msg.userName + "</b><span class='time " + authorClass + "'>" + timeStr + '</span> ' + msg.text + '</p>';
	
		$(document).find('#chatbox #chattext').append(html);
		scrollDownToLastChatText('#chatbox #chattext');
	}
	
	var notifyNewUserJoined = function notifyNewUserJoined(target, msg, action) {
		var videoIcon = '<span class="videoIcon"><svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="video" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" class="svg-inline--fa fa-video fa-w-18 fa-2x"><path fill="currentColor" d="M336.2 64H47.8C21.4 64 0 85.4 0 111.8v288.4C0 426.6 21.4 448 47.8 448h288.4c26.4 0 47.8-21.4 47.8-47.8V111.8c0-26.4-21.4-47.8-47.8-47.8zm189.4 37.7L416 177.3v157.4l109.6 75.5c21.2 14.6 50.4-.3 50.4-25.8V127.5c0-25.4-29.1-40.4-50.4-25.8z" class=""></path></svg></span>';
		var textIcon = '<span class="textIcon"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><path fill="currentColor" d="M416 224V64c0-35.3-28.7-64-64-64H64C28.7 0 0 28.7 0 64v160c0 35.3 28.7 64 64 64v54.2c0 8 9.1 12.6 15.5 7.8l82.8-62.1H352c35.3.1 64-28.6 64-63.9zm96-64h-64v64c0 52.9-43.1 96-96 96H192v64c0 35.3 28.7 64 64 64h125.7l82.8 62.1c6.4 4.8 15.5.2 15.5-7.8V448h32c35.3 0 64-28.7 64-64V224c0-35.3-28.7-64-64-64z"></path></svg></span>';
		var btnJoin = "<span class='wrtc_roomLink' data-join='" + target + "' data-action='JOIN' data-id='" + msg.headerId + "' title='Join'>" + msg.headerTitle + '</span>';
	
		var text = action === 'JOIN' ? 'joins' : 'leaves';
	
		if (target === 'VIDEO') {
			var roomCounter = "<span class='userCount'>(" + msg.userCount + '/' + msg.VIDEOCHATLIMIT + ')</span>';
			msg.text = '<span>' + text + '</span>' + videoIcon + btnJoin + roomCounter;
		} else if (target === 'TEXT') {
			msg.text = '<span>' + text + '</span>' + textIcon + btnJoin;
		}
	
		msg.target = target;
	
		addTextChatMessage(msg);
	};
	
	var roomBoxIconActive = function roomBoxIconActive() {
		$body_ace_outer().find('.wbrtc_roomBox').each(function (index, val) {
			var textActive = $(val).attr('data-text');
			var videoActive = $(val).attr('data-video');
			if (textActive || videoActive) {
				$(val).find('.btn_joinChat_chatRoom').addClass('active');
			} else {
				$(val).find('.btn_joinChat_chatRoom').removeClass('active');
			}
		});
	};
	
	var appendUserList = function appendUserList(roomInfo, selector) {
		if (!roomInfo.list) return true;
		var $element = typeof selector === 'string' ? $(document).find(selector) : selector;
		$element.empty();
		roomInfo.list.forEach(function reOrderUserList(el) {
			var userInList = getUserFromId(el.userId) || { colorId: '', name: 'anonymous', userId: '0000000' };
			if (clientVars.ep_profile_list && clientVars.ep_profile_list[el.userId]) {
				avatarUrl = clientVars.ep_profile_list[el.userId].imageUrl || clientVars.ep_profile_list[el.userId].img;
			}
			$element.append('<li data-id=' + el.userId + " style='border-color: " + userInList.colorId + "'><div class='avatar'><img src='" + avatarUrl + "'></div>" + userInList.name + '</li>');
		});
	};
	
	var wrtcStore = {};
	
	var wrtcPubsub = {
		events: {},
		on: function on(eventName, fn) {
			this.events[eventName] = this.events[eventName] || [];
			this.events[eventName].push(fn);
		},
		off: function off(eventName, fn) {
			if (this.events[eventName]) {
				for (var i = 0; i < this.events[eventName].length; i++) {
					if (this.events[eventName][i] === fn) {
						this.events[eventName].splice(i, 1);
						break;
					}
				}
			}
		},
		emit: function emit(eventName) {
			for (var _len = arguments.length, data = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
				data[_key - 1] = arguments[_key];
			}
	
			if (this.events[eventName]) {
				this.events[eventName].forEach(function (fn) {
					fn.apply(undefined, data);
				});
			}
		}
	};
	
	var inlineAvatar = {
		ROOM: function ROOM(headerId, room) {
			var inlineAvatarLimit = clientVars.webrtc.inlineAvatarLimit || 4;
			var $element = $body_ace_outer().find('#wbrtc_avatarCol .' + headerId + ' .wrtc_inlineAvatars');
			$element.find('.avatar').remove();
			$element.parent().css({ left: WRTC_Room.getHeaderRoomX($element.parent()) + 'px' });
			Object.keys(room).forEach(function reOrderUserList(key, index) {
				var userInList = getUserFromId(room[key].userId) || { colorId: '', name: 'anonymous'};
				if(userInList.userId){
					// TODO: If the user is not found, we hangup the user.
					if (clientVars.ep_profile_list && clientVars.ep_profile_list[userInList.userId]) {
						avatarUrl = clientVars.ep_profile_list[userInList.userId].imageUrl || clientVars.ep_profile_list[userInList.userId].img;
					}
					if (index < inlineAvatarLimit) {
						$element.find('.avatarMore').hide();
						$element.append('<div class="avatar" data-id="' + userInList.userId + '"><img src="' + avatarUrl + '"></div>');
					} else {
						$element.find('.avatarMore').show().text('+' + (index + 1 - inlineAvatarLimit));
					}
				}
			});
		},
		TEXT: function TEXT(headerId, room) {
			var $element = $(document).find('#wrtc_textChatWrapper .wrtc_inlineAvatars');
			$element.find('.avatar').remove();
			this.append(room.list, $element);
		},
		VIDEO: function VIDEO(headerId, room) {
			var $element = $(document).find('#werc_toolbar .wrtc_inlineAvatars');
			$element.find('.avatar').remove();
			this.append(room.list, $element);
		},
		append: function appendAvatart(list, $element) {
			var inlineAvatarLimit = clientVars.webrtc.inlineAvatarLimit || 4;
			list.forEach(function reOrderUserList(el, index) {
				var userInList = getUserFromId(el.userId) || { colorId: '', name: 'anonymous'};
				if(userInList.userId){
					if (clientVars.ep_profile_list && clientVars.ep_profile_list[userInList.userId]) {
						avatarUrl = clientVars.ep_profile_list[userInList.userId].imageUrl || clientVars.ep_profile_list[userInList.userId].img;
					}
					if (index < inlineAvatarLimit) {
						$element.find('.avatarMore').hide();
						$element.append('<div class="avatar" data-id="' + userInList.userId + '"><img src="' + avatarUrl + '"></div>');
					} else {
						$element.find('.avatarMore').show().text('+' + (index + 1 - inlineAvatarLimit));
					}
				}
			});
		}
	};
	
	wrtcPubsub.on('update store', function (requestUser, headerId, action, target, roomInfo, callback) {
		if (!requestUser || !headerId || !action || !roomInfo || !target) return false;
	
		if(!wrtcStore[headerId]) wrtcStore[headerId] = {};
		if(!wrtcStore[headerId].USERS) wrtcStore[headerId].USERS = {};
	
		var users = wrtcStore[headerId].USERS;
		wrtcStore[headerId][target] = roomInfo;
		// if(action === "JOIN"){}
		// if(action === "LEAVE"){}
		// remove all users
		users = {};
	
		wrtcStore[headerId].TEXT.list.forEach(function (el) {
			if (!users[el.userId]) users[el.userId] = {};
			users[el.userId] = el;
		});
	
		wrtcStore[headerId].VIDEO.list.forEach(function (el) {
			if (!users[el.userId]) users[el.userId] = {};
			users[el.userId] = el;
		});
	
		inlineAvatar[target](headerId, wrtcStore[headerId][target]);
		inlineAvatar.ROOM(headerId, users);
	
		if (callback) callback(wrtcStore[headerId]);
	});
	
	wrtcPubsub.on('disable room buttons', function disableRoomButtons(headerId, actions, target) {
		var $headingRoom = $body_ace_outer().find('#' + headerId);
	
		var $btnVideo = $headingRoom.find('.btn_icon[data-join="VIDEO"]');
		var $btnText = $headingRoom.find('.btn_icon[data-join="TEXT"]');
		var $btnPlus = $headingRoom.find('.btn_icon[data-join="PLUS"]');
	
		if (target === 'TEXT' || target === 'VIDEO') {
			// disable target and plus buttton
			$headingRoom.find('.btn_icon[data-join="' + target + '"]').prop('disabled', true);
			$btnPlus.prop('disabled', true);
		}
	
		if (target === 'PLUS') {
			// disable all buttons
			$btnText.prop('disabled', true);
			$btnVideo.prop('disabled', true);
			$btnPlus.prop('disabled', true);
		}
	});
	
	wrtcPubsub.on('enable room buttons', function enableRoomButtons(headerId, action, target) {
		var $headingRoom = $body_ace_outer().find('#' + headerId);
		var newAction = action === 'JOIN' ? 'LEAVE' : 'JOIN';
	
		var $btnVideo = $headingRoom.find('.btn_icon[data-join="VIDEO"]');
		var $btnText = $headingRoom.find('.btn_icon[data-join="TEXT"]');
		var $btnPlus = $headingRoom.find('.btn_icon[data-join="PLUS"]');
	
		if (target === 'TEXT' || target === 'VIDEO') {
			// enable target and plus buttton
			$headingRoom.find('.btn_icon[data-join="' + target + '"]').attr({ 'data-action': newAction }).prop('disabled', false);
	
			$btnPlus.attr({ 'data-action': newAction }).prop('disabled', false);
		}
	
		if (target === 'TEXTPLUS') {
			// enable text button
			$btnText.attr({ 'data-action': newAction }).prop('disabled', false);
			$btnVideo.attr({ 'data-action': newAction });
		}
	
		if (target === 'PLUS') {
			// make enable and action toggle all buttons
			$btnText.attr({ 'data-action': newAction }).prop('disabled', false);
			$btnVideo.attr({ 'data-action': newAction }).prop('disabled', false);
			$btnPlus.attr({ 'data-action': newAction }).prop('disabled', false);
		}
	});
	

	return Object.freeze({
		wrtcPubsub,
		wrtcStore,
		appendUserList,
		roomBoxIconActive,
		notifyNewUserJoined,
		createShareLink,
		$body_ace_outer,
		slugify,
		scrollDownToLastChatText,
		getUserFromId,
		getUserId,
		stopStreaming
	})


})();




/* Helper */
var textChat = (function textChat() {
	var socket = null;
	var padId = null;
	var currentRoom = {};
	var $joinBtn = null;

	function createAndAppendMessage(msg) {
		if (!msg || !currentRoom.userId) return true;

		// correct the time
		// msg.time += window.clientTimeOffset;

		var minutes = '' + new Date(msg.time).getMinutes();
		var hours = '' + new Date(msg.time).getHours();
		if (minutes.length === 1) minutes = '0' + minutes;
		if (hours.length === 1) hours = '0' + hours;
		var timeStr = hours + ':' + minutes;

		var userName = $('<b>').text(msg.userName + ': ');
		var tim = $('<span>').attr({ 'class': 'time' }).text(timeStr);

		var text = padutils.escapeHtmlWithClickableLinks(msg.text, "_blank");

		// var urlParams = new URLSearchParams(msg.text.split("?")[1]);

		// if(urlParams.get('id')) {
		// 	var headerId = urlParams.get('id');
		// 	var target = urlParams.get('target');
		// 	var join = urlParams.get('join');
		// 	text = $(text).attr({
		// 		"data-join": join,
		// 		"data-action":"JOIN",
		// 		"data-id": headerId
		// 	}).addClass('btn_roomHandler')
		// }


		var message = $('<p>').attr({
			'data-authorid': msg.author
		}).append(userName).append(tim).append(text);

		$('#wrtc_textChat').append(message);
		share.scrollDownToLastChatText('#wrtc_textChat');
	}

	// function privateNotifyNewUserJoined(target, msg, action) {
	// 	var textIcon = '<span class="textIcon"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><path fill="currentColor" d="M416 224V64c0-35.3-28.7-64-64-64H64C28.7 0 0 28.7 0 64v160c0 35.3 28.7 64 64 64v54.2c0 8 9.1 12.6 15.5 7.8l82.8-62.1H352c35.3.1 64-28.6 64-63.9zm96-64h-64v64c0 52.9-43.1 96-96 96H192v64c0 35.3 28.7 64 64 64h125.7l82.8 62.1c6.4 4.8 15.5.2 15.5-7.8V448h32c35.3 0 64-28.7 64-64V224c0-35.3-28.7-64-64-64z"></path></svg></span>';
	// 	var btnJoin = "<span class='wrtc_roomLink' data-join='" + target + "' data-action='JOIN' data-id='" + msg.headerId + "' title='Join'>" + msg.headerTitle + '</span>';

	// 	var text = action === 'JOIN' ? 'joins' : 'leaves';

	// 	msg.text = '<span>' + text + '</span>' + textIcon + btnJoin;

	// 	msg.target = target;

	// 	createAndAppendMessage(msg);
	// }

	function eventTextChatInput() {
		var keycode = event.keyCode || event.which;
		// when press Enter key
		if (keycode === 13) {
			var textMessage = $(this).val();
			if (!textMessage) return true;
			$(this).val('');
			var user = share.getUserFromId(clientVars.userId);
			if(!user) return true;
			var msg = { text: textMessage, userName: user.name, author: user.userId, time: new Date().getTime() };
			socket.emit('sendTextMessage', padId, currentRoom.headerId, msg, function sendTextMessage(incomMsg) {
				createAndAppendMessage(incomMsg);
			});
		}
	}

	function eventListers() {
		$(document).on('keypress', '#wrtc_textChatInputBox input', eventTextChatInput);

		$(document).on('click', '#wrtc_textChatWrapper .btn_toggle_modal', function click() {
			var action = $(this).attr('data-action');
			var chatBox = $('#wrtc_textChat').innerHeight() + $('#wrtc_textChatInputBox').innerHeight() + 1;

			$(this).find('.fa_arrow-from-top').toggle();
			$(this).find('.fa_arrow-to-top').toggle();

			if (action === 'collapse') {
				$(this).attr({ 'data-action': 'expand' });
				$('#wrtc_textChatWrapper').css({
					transform: 'translate(-50%, ' + chatBox + 'px)'
				});
			} else {
				$(this).attr({ 'data-action': 'collapse' });
				$('#wrtc_textChatWrapper').css({
					transform: 'translate(-50%, 0)'
				});
			}
		});
	}

	function deactivateModal(headerId, roomInfo) {
		var $TextChatWrapper = $(document).find('#wrtc_textChatWrapper');

		$TextChatWrapper.removeClass('active').removeAttr('style');
		$TextChatWrapper.find('#wrtc_textChat p').remove();
		// socket.removeListener('receiveTextMessage:' + headerId);

		var $btn = $(document).find('#wrtc_textChatWrapper .btn_toggle_modal');
		$btn.attr({ 'data-action': 'collapse' });
		$btn.find('.fa_arrow-from-top').toggle();
		$btn.find('.fa_arrow-to-top').toggle();
	}

	function activateModal(headerId, headTitle, userCount, roomInfo) {
		if (!headerId) return false;
		var existTextChat = $(document).find('#wrtc_textChatWrapper');
		if (!existTextChat.length) {
			var textChatBox = $('#wrtc_textChatBox').tmpl({
				headerId: headerId,
				headTitle: headTitle
			});
			$('body').append(textChatBox);
		} else {
			// TODO: change this to template
			existTextChat.attr({ 'data-id': headerId }).find('.textChatToolbar b, .btn_leave').attr({ 'data-id': headerId });
			existTextChat.find('.nd_title b').text(headTitle);
		}

		// for animation pop up
		setTimeout(function setTimeout() {
			$(document).find('#wrtc_textChatWrapper').addClass('active');
		}, 250);

		socket.on('receiveTextMessage:' + headerId, function receiveTextMessage(headingId, msg) {
			if (headingId === headerId) {
				createAndAppendMessage(msg);
			}
		});

		socket.emit('getTextMessages', padId, headerId, {}, function getTextMessages(data) {
			data.forEach(function (el) {
				createAndAppendMessage(el);
			});
		});

		share.appendUserList(roomInfo, '#wrtc_textChatWrapper  #textChatUserModal ul');
	}

	function addUserToRoom(data, roomInfo) {
		if (!data || !data.userId) return true;
		var headerId = data.headerId;
		var $headingRoom = share.$body_ace_outer().find('#' + headerId);
		var headTitle = $headingRoom.find('.wrtc_header b.titleRoom').text();
		var userCount = roomInfo.present;
		$headingRoom.find('.textChatCount').text(userCount);

		var user = share.getUserFromId(data.userId);
		// some user may session does exist but the user info does not available in all over the current pad
		if (!user) return true;

		// TODO: this is not good idea, use global state
		// if incoming user has already in the room don't persuade the request
		var IsUserInRooms = $headingRoom.find(".wrtc_content.textChat ul li[data-id='" + user.userId + "']").text();
		if (IsUserInRooms) return false;

		share.appendUserList(roomInfo, $headingRoom.find('.wrtc_content.textChat ul'));
		share.appendUserList(roomInfo, '#wrtc_textChatWrapper  #textChatUserModal ul');

		// notify, a user join the video-chat room
		// var msg = {
		// 	time: new Date(),
		// 	userId: data.userId || user.userId,
		// 	userName: user.name || data.name || 'anonymous',
		// 	headerId: data.headerId,
		// 	userCount: userCount,
		// 	headerTitle: headTitle
		// };
		// share.notifyNewUserJoined('TEXT', msg, 'JOIN');

		// if (data.headerId === currentRoom.headerId) {
		// 	var privateMsg = {
		// 		userName: user.name,
		// 		author: user.userId,
		// 		headerTitle: headTitle,
		// 		time: new Date().getTime()
		// 	};
		// 	privateNotifyNewUserJoined('TEXT', privateMsg, 'JOIN');
		// }

		// if (data.headerId === currentRoom.headerId && data.userId !== clientVars.userId) {
		// 	$.gritter.add({
		// 		text: '<span class="author-name">' + user.name + '</span>' + 'has joined the text-chat, <b><i> "' + headTitle + '"</b></i>',
		// 		sticky: false,
		// 		time: 3000,
		// 		position: 'center',
		// 		class_name: 'chat-gritter-msg'
		// 	});
		// }

		if (data.userId === clientVars.userId) {
			currentRoom = data;
			$headingRoom.attr({ 'data-text': true });
			share.roomBoxIconActive();
			activateModal(headerId, headTitle, userCount, roomInfo);
			share.wrtcPubsub.emit('enable room buttons', headerId, 'JOIN', $joinBtn);
		}

		share.wrtcPubsub.emit('update store', data, headerId, 'JOIN', 'TEXT', roomInfo, function updateStore() {});
	}

	function removeUserFromRoom(data, roomInfo, target, cb) {
		if (!data || !data.userId) return true;
		var headerId = data.headerId;
		var $headingRoom = share.$body_ace_outer().find('#' + headerId);
		var headTitle = $headingRoom.find('.wrtc_header b.titleRoom').text();

		var userCount = roomInfo.present;
		$headingRoom.find('.textChatCount').text(userCount);

		var $textChatUserList = $headingRoom.find('.wrtc_content.textChat ul');

		share.appendUserList(roomInfo, $textChatUserList);
		share.appendUserList(roomInfo, '#wrtc_textChatWrapper #textChatUserModal ul');

		if (userCount === 0) {
			$textChatUserList.append('<li class="empty">Be the first to join the <button class="btn_joinChat_text" data-action="JOIN" data-id="' + headerId + '" data-join="TEXT"><b>text-chat</b></button></li>');
		}

		// var user = share.getUserFromId(data.userId);

		// notify, a user join the text-chat room
		// var msg = {
		// 	time: new Date(),
		// 	userId: user.userId || data.userId,
		// 	userName: user.name || data.name || 'anonymous',
		// 	headerId: data.headerId,
		// 	userCount: userCount,
		// 	headerTitle: headTitle
		// };
		// share.notifyNewUserJoined('TEXT', msg, 'LEAVE');

		// if (data.headerId === currentRoom.headerId) {
		// 	var privateMsg = {
		// 		userName: user.name,
		// 		author: user.userId,
		// 		headerTitle: headTitle,
		// 		time: new Date().getTime()
		// 	};
		// 	privateNotifyNewUserJoined('TEXT', privateMsg, 'LEAVE');
		// }

		if (data.userId === clientVars.userId) {
			$headingRoom.removeAttr('data-text');
			share.roomBoxIconActive();
			currentRoom = {};
			deactivateModal(data.headerId, roomInfo);
			share.wrtcPubsub.emit('enable room buttons', headerId, 'LEAVE', $joinBtn);
		}

		share.wrtcPubsub.emit('update store', data, headerId, 'LEAVE', 'TEXT', roomInfo, function () {});

		if (cb && typeof cb === 'function') cb();
	}

	function userJoin(headerId, userData, $joinButton) {
		if (!userData || !userData.userId) {
			share.wrtcPubsub.emit('enable room buttons', headerId, 'LEAVE', $joinBtn);
			return false;
		}

		// check if user already in that room
		if (currentRoom && currentRoom.headerId === headerId) {
			share.wrtcPubsub.emit('enable room buttons', headerId, 'LEAVE', $joinBtn);
			return false;
		}

		$joinBtn = $joinButton;

		share.$body_ace_outer().find('button.btn_joinChat_chatRoom').removeClass('active');

		if (!currentRoom.userId) {
			socket.emit('userJoin', padId, userData, 'text', addUserToRoom);
		} else {
			socket.emit('userLeave', padId, currentRoom, 'text', function userLeave(data, roomInfo, target) {
				removeUserFromRoom(data, roomInfo, 'text', function join2newOne() {
					socket.emit('userJoin', padId, userData, 'text', addUserToRoom);
				});
			});
		}
	}

	function userLeave(headerId, userData, $joinButton) {
		$joinBtn = $joinButton;
		socket.emit('userLeave', padId, userData, 'text', removeUserFromRoom);
	}

	function socketBulkUpdateRooms(rooms, info, target) {
		var roomsInfo = {};
		// create a roomInfo for each individual room
		Object.keys(rooms).forEach(function (headerId) {
			var roomInfo = {
				present: rooms[headerId].length,
				list: rooms[headerId]
			};
			roomsInfo[headerId] = roomInfo;
		});

		// bind roomInfo and send user to gateway_userJoin
		Object.keys(rooms).forEach(function (headerId) {
			rooms[headerId].forEach(function (user) {
				addUserToRoom(user, roomsInfo[headerId], 'text');
			});
		});
	}

	function bulkUpdateRooms(hTagList) {
		socket.emit('bulkUpdateRooms', padId, hTagList, 'text', socketBulkUpdateRooms);
	}

	function postAceInit(hook, context, webSocket, docId) {
		socket = webSocket;
		padId = docId || window.pad.getPadId();
		eventListers();
	}

	return {
		postAceInit: postAceInit,
		activateModal: activateModal,
		deactivateModal: deactivateModal,
		userJoin: userJoin,
		userLeave: userLeave,
		removeUserFromRoom: removeUserFromRoom,
		addUserToRoom: addUserToRoom,
		bulkUpdateRooms: bulkUpdateRooms
	};
})();

// module.exports = textChat;
'use strict';
// var share = require('ep_wrtc_heading/static/js/clientShare');

var videoChat = (function videoChat() {
	var socket = null;
	var padId = null;
	var currentRoom = {};
	var localStream = null;
	var VIDEOCHATLIMIT = 0;
	var $joinBtn = null;

	function mediaDevices() {
		navigator.mediaDevices.enumerateDevices().then(function enumerateDevices(data) {
			var videoSettings = localStorage.getItem('videoSettings') || { microphone: null, speaker: null, camera: null };

			if (typeof videoSettings === 'string') {
				videoSettings = JSON.parse(videoSettings);
			}

			var audioInputSelect = document.querySelector('select#audioSource');
			var audioOutputSelect = document.querySelector('select#audioOutput');
			var videoSelect = document.querySelector('select#videoSource');

			for (var i = 0; i !== data.length; ++i) {
				var deviceInfo = data[i];
				var option = document.createElement('option');
				option.value = deviceInfo.deviceId;
				if (deviceInfo.kind === 'audioinput') {
					option.text = deviceInfo.label || 'microphone ' + (audioInputSelect.length + 1);
					if (videoSettings.microphone === deviceInfo.deviceId) option.selected = true;
					// audioInputSelect.appendChild(option);
				} else if (deviceInfo.kind === 'audiooutput') {
					option.text = deviceInfo.label || 'speaker ' + (audioOutputSelect.length + 1);
					if (videoSettings.speaker === deviceInfo.deviceId) option.selected = true;
					// audioOutputSelect.appendChild(option);
				} else if (deviceInfo.kind === 'videoinput') {
					option.text = deviceInfo.label || 'camera ' + (videoSelect.length + 1);
					if (videoSettings.camera === deviceInfo.deviceId) option.selected = true;
					// videoSelect.appendChild(option);
				}
			}
		});
	}

	function stopStreaming(stream, userId) {
		if (stream) {
			stream.getTracks().forEach(function stopStream(track) {
				track.stop();
			});
			stream = null;
		}
	}

	function isUserMediaAvailable() {
		return window.navigator.mediaDevices.getUserMedia({ audio: true, video: true });
	}

	function activateModal() {}

	function deactivateModal() {}

	function removeUserFromRoom(data, roomInfo, cb) {
		if (!data || !roomInfo || !data.userId) return false;
		var headerId = data.headerId;
		var $headingRoom = share.$body_ace_outer().find('#' + headerId);
		var headerTitle = $headingRoom.find('.wrtc_header b.titleRoom').text();
		var $videoChatUserList = $headingRoom.find('.wrtc_content.videoChat ul');

		share.appendUserList(roomInfo, $videoChatUserList);

		var userCount = roomInfo.present;
		$headingRoom.find('.videoChatCount').text(userCount);

		if (userCount === 0) {
			$videoChatUserList.append('<li class="empty">Be the first to join the <button class="btn_joinChat_video" data-action="JOIN" data-id="' + headerId + '" data-join="VIDEO"><b>video-chat</b></button></li>');
		}

		var user = share.getUserFromId(data.userId);

		if(user && data.action !== 'JOIN' && data.action !== 'RELOAD' ){
			// notify, a user join the video-chat room
			var msg = {
				time: new Date(),
				userId: data.userId || user.userId,
				userName: data.name || user.name || 'anonymous',
				headerId: data.headerId,
				userCount: userCount,
				headerTitle: headerTitle,
				VIDEOCHATLIMIT: VIDEOCHATLIMIT
			};
			share.notifyNewUserJoined('VIDEO', msg, 'LEAVE');
		}

		if (data.userId === clientVars.userId) {
			$headingRoom.removeAttr('data-video');
			share.roomBoxIconActive();
			
			window.headerId = null;

			currentRoom = {};

			$('#wrtc_modal').css({
				transform: 'translate(-50%, -100%)',
				opacity: 0
			}).attr({ 'data-active': false });

			WRTC.deactivate(data.userId, data.headerId);
			stopStreaming(localStream);
			localStream = null
			socket.removeListener('receiveTextMessage:' + data.headerId);
		}

		if (cb && typeof cb === 'function') cb();

		share.wrtcPubsub.emit('update store', data, headerId, 'LEAVE', 'VIDEO', roomInfo, function updateStore() {});

		share.wrtcPubsub.emit('enable room buttons', headerId, 'LEAVE', $joinBtn);

		WRTC.userLeave(data.userId)
	}

	function addUserToRoom(data, roomInfo) {
		if (!data || !data.userId) return false;
		var headerId = data.headerId;
		var $headingRoom = share.$body_ace_outer().find('#' + headerId);
		var headerTitle = $headingRoom.find('.wrtc_header b.titleRoom').text();

		var user = share.getUserFromId(data.userId);
		// some user may session does exist but the user info does not available in all over the current pad
		if (!user) return true;

		// TODO: this is not good idea, use global state
		// if incoming user has already in the room don't persuade the request
		var IsUserInRooms = $headingRoom.find(".wrtc_content.videoChat ul li[data-id='" + user.userId + "']").text();
		if (IsUserInRooms) return false;

		var userCount = roomInfo.present;
		$headingRoom.find('.videoChatCount').text(userCount);

		$(document).find('#wrtc_textChatWrapper .textChatToolbar .userCount').text(userCount);

		share.appendUserList(roomInfo, $headingRoom.find('.wrtc_content.videoChat ul'));

		if(data.action == 'JOIN'){
			// notify, a user join the video-chat room
			var msg = {
				time: new Date(),
				userId: data.userId,
				userName: user.name || data.name || 'anonymous',
				headerId: data.headerId,
				userCount: userCount,
				headerTitle: headerTitle,
				VIDEOCHATLIMIT: VIDEOCHATLIMIT
			};

			share.notifyNewUserJoined('VIDEO', msg, 'JOIN');

			// if (data.headerId === currentRoom.headerId && data.userId !== clientVars.userId) {
			// 	$.gritter.add({
			// 		text: '<span class="author-name">' + user.name + '</span>' + 'has joined the video-chat, <b><i> "' + headerTitle + '"</b></i>',
			// 		sticky: false,
			// 		time: 3000,
			// 		position: 'center',
			// 		class_name: 'chat-gritter-msg'
			// 	});
			// }
		}

		if (data.userId === clientVars.userId) {
			$headingRoom.attr({ 'data-video': true });
			share.roomBoxIconActive();

			$('#werc_toolbar p').attr({ 'data-id': data.headerId }).text(headerTitle);
			$("#werc_toolbar .btn_roomHandler").attr({ 'data-id': data.headerId });

			window.headerId = data.headerId;
			WRTC.activate(data.headerId, user.userId);
			currentRoom = data;

			$('#rtcbox').prepend('<h4 class="chatTitle">' + headerTitle + '</h4>');

			$('#wrtc_modal').css({
				transform: 'translate(-50%, 0)',
				opacity: 1
			}).attr({ 'data-active': true });

			share.wrtcPubsub.emit('enable room buttons', headerId, 'JOIN', $joinBtn);

			socket.on('receiveTextMessage:' + headerId, function receiveTextMessage(headingId, msg) {
				var active = $(document).find('#wrtc_textChatWrapper').hasClass('active');
				if (headingId === headerId && !active) {
					textChat.userJoin(headerId, data, 'TEXT');
				}
			});

		}

		share.wrtcPubsub.emit('update store', data, headerId, 'JOIN', 'VIDEO', roomInfo, function updateStore() {});
	}
	
	function createSession(headerId, userInfo, $joinButton) {
		share.$body_ace_outer().find('button.btn_joinChat_chatRoom').removeClass('active');
		$joinBtn = $joinButton;
		// isUserMediaAvailable().then(function joining(stream) {
			localStream = null;

			if (!currentRoom.userId) {
				return socket.emit('userJoin', padId, userInfo, 'video', gateway_userJoin);
			}
			// If the user has already joined the video chat, make suer leave that room then join to the new chat room
			socket.emit('userLeave', padId, currentRoom, 'video', function userLeave(_userData, roomInfo) {
				gateway_userLeave(_userData, roomInfo, function join2newOne() {
					socket.emit('userJoin', padId, userInfo, 'video', gateway_userJoin);
				});
			});
		// })['catch'](function (err) {
		// 	console.error(err);
		// 	share.wrtcPubsub.emit('enable room buttons', headerId, 'LEAVE', $joinBtn);
		// 	socket.emit('userLeave', padId, currentRoom, 'video', function userLeave(_userData, roomInfo) {
		// 		gateway_userLeave(_userData, roomInfo);
		// 	});
		// 	WRTC.showUserMediaError(err);
		// });

	}

	function userJoin(headerId, userInfo, $joinButton) {
		if (!userInfo || !userInfo.userId) {
			share.wrtcPubsub.emit('enable room buttons', headerId, 'LEAVE', $joinBtn);
			return false;
		}

		// check if has user already in that room
		if (currentRoom && currentRoom.headerId === headerId) {
			share.wrtcPubsub.emit('enable room buttons', headerId, 'LEAVE', $joinBtn);
			return false;
		}

		createSession(headerId, userInfo, $joinButton);
	}

	function reloadSession(headerId, userInfo, $joinButton){
		if (!userInfo || !userInfo.userId) {
			share.wrtcPubsub.emit('enable room buttons', headerId, 'LEAVE', $joinBtn);
			return false;
		}

		createSession(headerId, userInfo, $joinButton, 'RELOAD');
	}

	function userLeave(headerId, data, $joinButton) {
		$joinBtn = $joinButton;
		socket.emit('userLeave', padId, data, 'video', gateway_userLeave);
	}

	function reachedVideoRoomSize(roomInfo, showAlert, isBulkUpdate) {
		console.log(VIDEOCHATLIMIT, roomInfo)
		if (roomInfo && roomInfo.present <= VIDEOCHATLIMIT) return true;

		showAlert = showAlert || true;
		if (showAlert && !isBulkUpdate) {
			$.gritter.add({
				title: 'Video chat Limitation',
				text: 'The video-chat room has been reached its limitation. \r\n <br> The size of this video-chat room is ' + VIDEOCHATLIMIT + '.',
				sticky: false,
				class_name: 'error',
				time: '5000'
			});
		}

		return false;
	}

	function socketBulkUpdateRooms(rooms, info, target) {
		var roomsInfo = {};
		// create a roomInfo for each individual room
		Object.keys(rooms).forEach(function makeRoomInfo(headerId) {
			var roomInfo = {
				present: rooms[headerId].length,
				list: rooms[headerId]
			};
			roomsInfo[headerId] = roomInfo;
		});

		// bind roomInfo and send user to gateway_userJoin
		Object.keys(rooms).forEach(function (headerId) {
			rooms[headerId].forEach(function (user) {
				gateway_userJoin(user, roomsInfo[headerId], true);
			});
		});
	}

	function bulkUpdateRooms(hTagList) {
		socket.emit('bulkUpdateRooms', padId, hTagList, 'video', socketBulkUpdateRooms);
	}

	/**
  *
  * @param {Object} data @requires
  * @param {String} data.padId @requires
  * @param {String} data.userId @requires
  * @param {String} data.userName @requires
  * @param {String} data.headerId
  *
  * @param {Object} roomInfo
  * @param {Boolean} showAlert
  * @param {Boolean} bulkUpdate
 *
 *	@returns
  */
	function gateway_userJoin(data, roomInfo, showAlert, bulkUpdate) {
		if (!data) return reachedVideoRoomSize(null, true, false);

		if (data && reachedVideoRoomSize(roomInfo, showAlert, bulkUpdate)) {
			return addUserToRoom(data, roomInfo);
		} else if (bulkUpdate) {
			return addUserToRoom(data, roomInfo);
		}
		return stopStreaming(localStream);
	}

	function gateway_userLeave(data, roomInfo, cb) {
		removeUserFromRoom(data, roomInfo, cb);
	}

	function postAceInit(hook, context, webSocket, docId) {
		socket = webSocket;
		padId = docId || window.pad.getPadId();
		VIDEOCHATLIMIT = clientVars.webrtc.videoChatLimit;

		mediaDevices();
	}

	return {
		postAceInit: postAceInit,
		activateModal: activateModal,
		deactivateModal: deactivateModal,
		userJoin: userJoin,
		userLeave: userLeave,
		gateway_userJoin: gateway_userJoin,
		gateway_userLeave: gateway_userLeave,
		bulkUpdateRooms: bulkUpdateRooms,
		reloadSession: reloadSession
	};
})();

// module.exports = videoChat;


// var share = require('ep_wrtc_heading/static/js/clientShare');
// var textChat = require('ep_wrtc_heading/static/js/textChat');
// var videoChat = require('ep_wrtc_heading/static/js/videoChat');
// new comment so wat?

var WRTC_Room = (function WRTC_Room() {
	var self = null;
	var socket = null;
	var padId = null;
	var VIDEOCHATLIMIT = 0;
	// var $lastJoinButton = null;
	var prefixHeaderId = 'headingTagId_';
	var hElements = "h1,h2,h3,h4,h5,h6,.h1,.h2,.h3,.h4,.h5,.h6";


	function postAceInit(hook, context, webSocket, docId) {
		socket = webSocket;
		padId = docId;
		VIDEOCHATLIMIT = clientVars.webrtc.videoChatLimit;

		socket.on('userJoin', function (data, roomInfo, target) {
			if (target === 'video') {
				videoChat.gateway_userJoin(data, roomInfo, false);
			} else {
				textChat.addUserToRoom(data, roomInfo, target);
			}
		});

		socket.on('userLeave', function (data, roomInfo, target) {
			if (target === 'video') {
				videoChat.gateway_userLeave(data, roomInfo, target);
			} else {
				textChat.removeUserFromRoom(data, roomInfo, target);
			}
		});

		activeEventListener();

		// check if there is a join request in URI queryString
		// TODO: befre check this, the tags must be ready
		setTimeout(function () {
			joinByQueryString();
		}, 500);
	}


	/** --------- Helper --------- */

	function link2Clipboard(text) {
		var $temp = $('<input>');
		$('body').append($temp);
		$temp.val(text).select();
		document.execCommand('copy');
		$temp.remove();
		$.gritter.add({
			title: 'Copied',
			text: 'Join link copied to clip board',
			sticky: false,
			class_name: 'copyLinkToClipboard',
			time: '3000'
		});
	}

	function scroll2Header(headerId) {
		var padContainer = share.$body_ace_outer().find('iframe').contents().find('#innerdocbody');
		padContainer.find('.' + prefixHeaderId + headerId).each(function scrolling() {
			this.scrollIntoView({
				behavior: 'smooth'
			});
		});
	}

	function closeTextChat () {
		$('#wrtc_textChatWrapper .btn_leave').trigger('click');
	}

	function joinChatRoom(headerId, userInfo, target) {
		// textChat.userJoin(headerId, userInfo, 'TEXTPLUS');
		videoChat.userJoin(headerId, userInfo, 'PLUS');
		closeTextChat();
	}
	
	function leaveChatRoom(headerId, userInfo, target) {
		// textChat.userLeave(headerId, userInfo, 'TEXTPLUS');
		videoChat.userLeave(headerId, userInfo, 'PLUS');
		closeTextChat();
	}

	/**
  *
  * @param {string} actions @enum (JOIN|LEAVE)
  * @param {string} headerId
  * @param {string} target @enum (chatRoom|video|text)
  */
	function roomBtnHandler(actions, headerId, target) {
		if(typeof actions !== 'string') {
			actions.preventDefault();
			// actions.stopPropagation();
		}
		headerId = $(this).attr('data-id') || headerId;
		actions = $(this).attr('data-action') || actions;
		target = $(this).attr('data-join') || target;

		if (!headerId || !target ) return true;

		var $joinBtn = $(this);

		var userInfo = {
			padId: clientVars.padId || window.pad.getPadId(),
			userId: clientVars.userId || window.pad.getUserId(),
			userName: clientVars.userName || 'anonymous',
			headerId: headerId,
			target: target,
			action: actions
		};

		share.wrtcPubsub.emit('disable room buttons', headerId, actions, target);

		if (actions === 'JOIN') {
			switch (target) {
				case 'PLUS':
					joinChatRoom(headerId, userInfo, target);
					break;
				case 'VIDEO':
					videoChat.userJoin(headerId, userInfo, target);
					break;
				case 'TEXT':
					textChat.userJoin(headerId, userInfo, target);
					break;
				default:
					return false;
			}
		} else if (actions === 'LEAVE') {
			switch (target) {
				case 'PLUS':
					leaveChatRoom(headerId, userInfo, target);
					break;
				case 'VIDEO':
					videoChat.userLeave(headerId, userInfo, target);
					break;
				case 'TEXT':
					textChat.userLeave(headerId, userInfo, target);
					break;
				default:
					return false;
			}
		} else if(actions === 'RELOAD') {
			videoChat.reloadSession(headerId, userInfo, target, actions);
		} else if(actions === 'SHARELINK') {
			shareRoomsLink(headerId, target);
		}
	}

	function joinByQueryString() {
		var urlParams = new URLSearchParams(window.location.search);
		var headerId = urlParams.get('id');
		var target = urlParams.get('target');
		var join = urlParams.get('join');

		if(!headerId) return true;

		var isHeading = share.$body_ace_outer().find('#' + headerId);

		if(!isHeading.length){
			$.gritter.add({
				title: 'Error',
				text: "The header seems not to exist anymore!",
				time: 3000,
				sticky: false,
				class_name: 'error'
			});
			return false;
		}

		if (headerId) {
			scroll2Header(headerId);
		}
		if (join === 'true') {
			target = target.toUpperCase();
			setTimeout(function makeSureHeadingReady() {
				roomBtnHandler('JOIN', headerId, target);
			}, 700);
		}
	}

	function shareRoomsLink(headId, target) {
		headId = $(this).attr('data-id') || headId;
		target = $(this).attr('data-join') || target;
		var title = share.$body_ace_outer().find('.wbrtc_roomBox.' + headId + ' .titleRoom').text();

		var origin = window.location.origin;
		var pathName = window.location.pathname;
		var link = origin + pathName + '?header=' + share.slugify(title) + '&id=' + headId + '&target=' + target + '&join=true';

		var $temp = $('<input>');
		$('body').append($temp);
		$temp.val(link).select();
		document.execCommand('copy');
		$temp.remove();

		$.gritter.add({
			title: 'Copied',
			text: 'Join link copied to clip board',
			sticky: false,
			class_name: 'copyLinkToClipboard',
			time: '3000'
		});
	}

	function getHeaderRoomY($element) {
		var height = $element.outerHeight();
		var paddingTop = share.$body_ace_outer().find('iframe[name="ace_inner"]').css('padding-top');
		var aceOuterPadding = parseInt(paddingTop, 10);
		var offsetTop = Math.ceil($element.offset().top + aceOuterPadding);
		return offsetTop + height / 2 - 26;
	}

	function getHeaderRoomX($element) {
		var width = $element.outerWidth();
		var paddingLeft = share.$body_ace_outer().find('iframe[name="ace_inner"]').css('padding-left');
		var aceOuterPadding = parseInt(paddingLeft, 10);
		var offsetLeft = Math.ceil(share.$body_ace_outer().find('iframe[name="ace_inner"]').offset().left - aceOuterPadding);
		return offsetLeft - width - 6;
	}

	function activeEventListener() {
		var $wbrtc_roomBox = share.$body_ace_outer();

		$wbrtc_roomBox.on('click', '.wbrtc_roomBox .btn_joinChat_text', roomBtnHandler);
		$wbrtc_roomBox.on('click', '.wbrtc_roomBox .btn_joinChat_video', roomBtnHandler);
		$wbrtc_roomBox.on('click', '.wbrtc_roomBox .btn_joinChat_chatRoom', roomBtnHandler);

		$(document).on('click', '#chattext .wrtc_roomLink', roomBtnHandler);

		$(document).on('click', '#werc_toolbar .btn_roomHandler, .btn_controllers .btn_roomHandler', roomBtnHandler);

		// ep_full_hyperlinks link listner
		$wbrtc_roomBox.on('click', 'a.btn_roomHandler', roomBtnHandler)
		$(document).on('click', 'a.btn_roomHandler', roomBtnHandler)
		// share.$body_ace_outer().on('mouseenter', '.wbrtc_roomBox', function mouseenter() {
		// 	$(this).parent().css({ overflow: 'initial' });
		// 	$(this).addClass('active').find('.wrtc_contentBody').css({ display: 'block' });
		// }).on('mouseleave', '.wbrtc_roomBox', function mouseleave() {
		// 	$(this).parent().css({ overflow: 'hidden' });
		// 	$(this).removeClass('active').find('.wrtc_contentBody').css({ display: 'none' });
		// });

		share.$body_ace_outer().on('click', '.wbrtc_roomBoxFooter > button.btn_share', function click() {
			var headerURI = $(this).find('input').val();
			link2Clipboard(headerURI);
		});

		// share.$body_ace_outer().on('mouseenter', '.wrtc_roomInlineAvatar .avatar', function mouseenter() {
		// 	var id = $(this).parent().parent().attr('id');
		// 	share.$body_ace_outer().find('#' + id + '.wbrtc_roomBox').trigger('mouseenter');
		// }).on('mouseleave', '.wrtc_roomInlineAvatar .avatar', function mouseleave() {
		// 	var id = $(this).parent().parent().attr('id');
		// 	share.$body_ace_outer().find('#' + id + '.wbrtc_roomBox').trigger('mouseleave');
		// });

		$(document).on('click', '#werc_toolbar p, .textChatToolbar b', function click() {
			var headerId = $(this).attr('data-id');
			scroll2Header(headerId);
		});

		$(document).on('click', '#werc_toolbar .btn_enlarge', function click() {
			if (!$(this).attr('active')) return true;

			$(this).toggleClass('large');

			$('#wrtc_modal .video-container .enlarge-btn').each(function trigger() {
				$(this).trigger('click');
			});
		});

		// video interface settings
		$(document).on('click', '#werc_toolbar .btn_videoSetting', function click() {
			var offset = $(this).position();
			var $box = $(document).find('#wrtc_settings');
			var width = $box.outerWidth();
			$box.css({left: offset.left - width  + 'px',top: offset.top + 4 + 'px'}).toggleClass('active');
		});

		
	}

	self = {
		postAceInit: postAceInit,
		getHeaderRoomX: getHeaderRoomX,
		aceSetAuthorStyle: function aceSetAuthorStyle(context) {
			if (context.author) {
				var user = share.getUserFromId(context.author);
				if (user) {
					// sync user info
					share.$body_ace_outer().find(".wrtc_content.textChat ul li[data-id='" + user.userId + "']").css({ 'border-color': user.colorId }).text(user.name);
					share.$body_ace_outer().find(".wrtc_content.videoChat ul li[data-id='" + user.userId + "']").css({ 'border-color': user.colorId }).text(user.name);
				}
			}
		},
		userLeave: function userLeave(context, callback) {
			// Deprecated, we use socket disconnect

			callback();
		},
		bulkUpdateRooms: function bulkUpdateRooms(hTagList) {
			videoChat.bulkUpdateRooms(hTagList);
			textChat.bulkUpdateRooms(hTagList);
		},
		adoptHeaderYRoom: function adoptHeaderYRoom() {
			// Set all video_heading to be inline with their target REP
			var $padOuter = share.$body_ace_outer();
			if (!$padOuter) return;

			$padOuter.find('.wbrtc_roomBox, .wrtc_roomInlineAvatar ').each(function adjustHeaderIconPosition() {
				var $el = $(this);
				var $boxId = $el.attr('id');
				var hClassId = 'headingTagId_' + $boxId;
				var $headingEl = $padOuter.find('iframe').contents().find('#innerdocbody').find('.' + hClassId);

				// if the H tags does not find, remove chatBox
				// TODO: and kick out the user form the chatBox
				if ($headingEl.length <= 0) {
					$el.remove();
					return false;
				}

				if ($el.attr('data-box') === 'avatar') $el.css({ left: getHeaderRoomX($el) + 'px' });
				$el.css({ top: getHeaderRoomY($headingEl) + 'px' });
			});
		},
		findTags: function findTags() {
			var hTagList = [];
			var hTagElements = hElements;
			var hTags = share.$body_ace_outer().find('iframe').contents().find('#innerdocbody').children('div').children(hTagElements);
			var aceInnerOffset = share.$body_ace_outer().find('iframe[name="ace_inner"]').offset();
			var target = share.$body_ace_outer().find('#outerdocbody');
			var newHTagAdded = false;

			$(hTags).each(function createWrtcRoomBox() {
				var $el = $(this);
				// var lineNumber = $el.parent().prevAll().length;
				// var tag = $("#title")[0].tagName.toLowerCase();
				var newY = getHeaderRoomY($el);
				var newX = Math.ceil(aceInnerOffset.left);
				var headingTagId = $el.find('span').attr('class');
				headingTagId = /(?:^| )headingTagId_([A-Za-z0-9]*)/.exec(headingTagId);

				if (!headingTagId) {
					console.warn("[wrtc]: couldn't find headingTagId.")
					return true;
				}

				var data = {
					headingTagId: headingTagId[1],
					// tag: tag,
					positionTop: newY,
					positionLeft: newX,
					headTitle: $el.text(),
					// lineNumber: lineNumber,
					videoChatLimit: VIDEOCHATLIMIT
				};

				if (!share.wrtcStore[data.headingTagId]) share.wrtcStore[data.headingTagId] = { VIDEO: { list: [] }, TEXT: { list: [] }, USERS: {} };

				// if the header does not exists then adde to list
				// otherwise update textHeader
				// TODO: performance issue
				if (target.find('#' + data.headingTagId).length <= 0) {
					var box = $('#wertc_roomBox').tmpl(data);
					target.find('#wbrtc_chatBox').append(box);
					var avatarBox = $('#wertc_inlineAvatar').tmpl(data);
					target.find('#wbrtc_avatarCol').append(avatarBox);
					newHTagAdded = true;
				} else {
					$(document).find('[data-headid=' + data.headingTagId + '].wrtc_text .wrtc_roomLink, #werc_toolbar p[data-id=' + data.headingTagId + ']').text(data.headTitle);
					target.find('.wbrtc_roomBox[id=' + data.headingTagId + '] .titleRoom').text(data.headTitle);
					$(document).find('#wrtc_textChatWrapper[data-id=' + data.headingTagId + '] .nd_title b').text(data.headTitle);
				}

				hTagList.push(data);
			});
			// if a new h tag addedd check all heading again!
			if (newHTagAdded) {
				self.bulkUpdateRooms(hTagList);
				newHTagAdded = false;
			}
		}
	};

	return self;
})();
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
	var connection 


	const initRTConnection = function () {
		


			

		connection = new RTCMultiConnection();

		// by default, socket.io server is assumed to be deployed on your own URL
		// connection.socketURL = '/';

		// comment-out below line if you do not have your own socket.io server
		connection.socketURL = 'https://rtcmulticonnection.herokuapp.com:443/';

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
					ideal: 1280
				},
				height: {
					ideal: 720
				},
				frameRate: 30
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

		connection.videosContainer = $(document).find('#wrtc_modal .videoWrapper');


		connection.onstream = function (event) {
			console.log("1111111")
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
			video.srcObject = event.stream;

			// var width = parseInt(connection.videosContainer.clientWidth / 3) - 20;
			// var mediaElement = getHTMLMediaElement(video, {
			// 	title: event.userid,
			// 	buttons: ['full-screen'],
			// 	width: width,
			// 	showOnMouseEnter: false
			// });

			console.log("okay nowwww")
			connection.videosContainer.append(
				$(video).css({
					width: "180px"
				}).attr({
					id: event.streamid
				})
			)
			// connection.videosContainer.appendChild(

			// );

			// setTimeout(function () {
			// 	mediaElement.media.play();
			// }, 5000);

			// mediaElement.id = event.streamid;

			// to keep room-id in cache
			localStorage.setItem(connection.socketMessageEvent, connection.sessionid);

			// chkRecordConference.parentNode.style.display = 'none';


		};



		connection.onstreamended = function (event) {
			var mediaElement = document.getElementById(event.streamid);
			if (mediaElement) {
				mediaElement.parentNode.removeChild(mediaElement);
			}
		};

		connection.onMediaError = function (e) {
			console.log(e)
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
	}

	function postAceInit(hook, context, webSocket, docId) {
		padId = docId;
		socket = webSocket;

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
		webSocket.on("RTC_MESSAGE", function(context){
			if (context.data.payload.data.headerId === window.headerId) self.receiveMessage(context.data.payload);
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
			if (userId && pc[userId]) {
				gState = "LEAVING"
				self.removeVideoInterface(userId)
				self.hangup(userId, true);
			}

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


 
			if(!connection) initRTConnection()
			console.log("open new room")

			connection.openOrJoin(headerId, function(isRoomCreated, roomid, error) {
				if (connection.isInitiator === true) {
						connection.open(headerId)
				} else {
					connection.join(headerId)
				}
		});
        


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

			console.log(connection.getAllParticipants())
			connection.getAllParticipants().forEach(function(pid) {

					console.log(pid, "====================")
					connection.disconnectWith(pid);
			});




			 // stop all local cameras
			 connection.attachStreams.forEach(function(localStream) {
				 console.log(localStream)
				 if(localStream.type === 'local')	localStream.stop();
					
				});



			 // close socket.io connection
			 connection.closeSocket();





































































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
				.append(`<p class="connectionStatus" style="color: #ffff;position: absolute;padding: 0;">connecting</p>`)
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

			if (!userId) return false;
			var videoId = 'video_' + userId.replace(/\./g, '_');
			var video = $(document).find('#' + videoId)[0];
			if (video) $(video).parent().find('.connectionStatus').text(gState);

			if(!video){
				self.appendNewVideoInterface(userId, stream)
			} else {
				
				if(stream) attachMediaStream(video, stream);
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
				$video.parent().css({ width: videoSizes.large, 'max-height': videoSizes.large });
				$video.css({ width: videoSizes.large, 'max-height': videoSizes.large });
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
			var peer = msg.from; // userId sender
			var data = msg.data;
			var type = data.type;
			// ignore own messages
			if (peer === share.getUserId()) return;
			console.log(peer, "===-===",share.getUserId(), "===", type, new Date().getSeconds())
			
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

				pc[peer].setRemoteDescription(offer)

				.then(function(){
					pc[peer].createAnswer(sdpConstraints)
					.then(function(desc){
						desc.sdp = cleanupSdp(desc.sdp);
						pc[peer].setLocalDescription(desc)
						.then(function(){
							self.sendMessage(peer, { type: 'answer', answer: desc, userId: msg.from, headerId: data.headerId });
						}).catch((err) => logError(err, "offer:setLocalDescription"))
					}).catch((err) => logError(err, "offer:createAnswer"))
				}).catch((err) => logError(err, "offer:setRemoteDescription"))

			} else if (type === 'answer') {
				if (pc[peer]) {
					var answer = new RTCSessionDescription(data.answer);
					pc[peer].setRemoteDescription(answer)
					.then(function () {
						console.log("doooooooooooooononononononononononononoon111", new Date().getSeconds())
					})
					.catch((err) => logError(err, "answer:setRemoteDescription", msg))
				}
			} else if (type === 'icecandidate') {
				if (pc[peer]) {
					if(!data.candidate) return false
					var candidate = new RTCIceCandidate(data.candidate);
					if(!candidate ||!pc[peer].addIceCandidate) return false
					var p = pc[peer].addIceCandidate(candidate);
					if (p) {
						p.then(function () {
							// Do stuff when the candidate is successfully passed to the ICE agent
						console.log("doooooooooooooononononononononononononoon22222", new Date().getSeconds())

						}).catch(function () {
							console.error('Error: Failure during addIceCandidate()');
							// self.receiveMessage(msg)
						});
					}
				}
			} else {
				console.error('unknown server message', data);
			}

		},
		audioVideoInputChange: function audioVideoInputChange() {
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
			notify = arguments.length === 1 ? true : notify;
			console.log("hangUp", userId, notify, headerId)
			if (pc[userId] && userId !== share.getUserId()) {
				self.removeVideoInterface(userId)
				pc[userId].close();
				delete pc[userId];
				if (notify) self.sendMessage(userId, { type: 'hangup', headerId: headerId });
			}
		},
		createPeerConnection: function createPeerConnection(userId, headerId) {
			if (pc[userId]) console.warn('WARNING creating PC connection even though one exists', userId);
			// if((pc[userId])) return false

			pc[userId] = new RTCPeerConnection(pcConfig, pcConstraints);

			pc[userId].onicecandidate = function (event) {
				if (event.candidate) {
					self.appendNewVideoInterface(userId)
					self.sendMessage(userId, {type: 'icecandidate', headerId: headerId, candidate: event.candidate});
				}
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

			if (!pc[userId]) self.createPeerConnection(userId, headerId);
			
			pc[userId].addStream(localStream);

			pc[userId].createOffer(constraints)
			.then(function(desc) {
				desc.sdp = cleanupSdp(desc.sdp);
				return pc[userId].setLocalDescription(desc)
			})
			.then(function (){
				self.sendMessage(userId, { type: 'offer', offer: pc[userId].localDescription, headerId: headerId });			
			}).then(function(){
				
			})
			.catch((err) => logError(err, "call:createOffer"));
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

				socket.emit('getHeaderUserlist', padId, headerId, function(userList){
					userList.forEach(function (userId) {
						if (userId !== share.getUserId() ) {
							if (pc[userId] && gState === "RECONNECTING") {
								self.hangup(userId, null, headerId);
							}
							// make a call, and get streem connection for the other user are in room

							// socket.emit("makeCall", padId, userId, headerId)

							self.call(userId, headerId);
						}
					});
				})
			})
			.catch(function (err) {
				self.showUserMediaError(err);
			});
		}
	};

	// Normalize RTC implementation between browsers
	// var getUserMedia = window.navigator.mediaDevices.getUserMedia
	var attachMediaStream = function attachMediaStream(element, stream) {
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
		console.log(error, functionName, data)
		if(error && error.message.includes("Failed to set remote answer sdp")){
			console.log("Try reconnecting")
			setTimeout(() => {
				console.log("reconnecting...")
				// self.receiveMessage(data)
				gState = "RECONNECTING"
				self.getUserMedia(window.headerId)

				// $(document).find("#wrtc_modal .btn_reload.btn_roomHandler").trigger("click")
			}, 5000);
		}
		
		console.error('WebRTC ERROR:', error);
	}

	self.pc = pc;
	return self;
})();



// Get Start
// action flow
// 1. activate