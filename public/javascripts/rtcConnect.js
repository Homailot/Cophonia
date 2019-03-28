"use strict";

var uIndex = 0;
var tempIndex;
// This client receives a message
var peerConn;
var dataChannel;

var configuration = {
	"iceServers": [{
		"urls": "stun:stun.l.google.com:19302"
	}]
};

var isInitiator;

var socket = io.connect();
function startConn() {
	window.room = prompt("Enter room name:");

	if (room !== "") {
		socket.emit("create or join", room);
		//console.log("Attempted to create or  join room", room);
	}


}

socket.on("ipaddr", function (ipaddr) {
	//console.log("Server IP address is: " + ipaddr);
	// updateRoomURL(ipaddr);
});

socket.on("created", function (room, clientId) {
	//console.log("Created room", room, "- my client ID is", clientId);
	isInitiator = true;
	start();
});

socket.on("joined", function (room, clientId, index) {
	//console.log("This peer has joined room", room, "with client ID", clientId);
	isInitiator = false;
	uIndex = index;
	createPeerConnection(isInitiator, configuration);
	setTimeout(waitForOpen, 200);
});

function waitForOpen() {
	if(dataChannel==null || dataChannel.readyState!="open") {
		setTimeout(waitForOpen, 200);
	} else if(dataChannel!=null && dataChannel.readyState==="open") {
		start();
	}
}

socket.on("full", function (room) {
	alert("Room " + room + " is full. We will create a new room for you.");
	window.location.hash = "";
	window.location.reload();
});

socket.on("ready", function () {
	//console.log("Socket is ready");
	createPeerConnection(isInitiator, configuration);
});

socket.on("log", function (array) {
	//console.log.apply(console, array);
});

socket.on("message", function (message) {
	//console.log("Client received message:", message);
	signalingMessageCallback(message);
});

function sendMessage(message) {
	//console.log("Client sending message: ", message);
	socket.emit("message", message);
}



function signalingMessageCallback(message) {
	if (message.type === "offer") {
		//console.log("Got offer. Sending answer to peer.");
		peerConn.setRemoteDescription(new RTCSessionDescription(message), function () { },
			logError);
		peerConn.createAnswer(onLocalSessionCreated, logError);

	} else if (message.type === "answer") {
		//console.log("Got answer.");
		peerConn.setRemoteDescription(new RTCSessionDescription(message), function () { },
			logError);

	} else if (message.type === "candidate") {
		peerConn.addIceCandidate(new RTCIceCandidate({
			candidate: message.candidate
		}));

	}
}

function createPeerConnection(isInitiator, config) {
	//console.log("Creating Peer connection as initiator?", isInitiator, "config:",
	//	config);
	peerConn = new RTCPeerConnection(config);

	// send any ice candidates to the other peer
	peerConn.onicecandidate = function (event) {
		//console.log("icecandidate event:", event);
		if (event.candidate) {
			sendMessage({
				type: "candidate",
				label: event.candidate.sdpMLineIndex,
				id: event.candidate.sdpMid,
				candidate: event.candidate.candidate
			});
		} else {
			//console.log("End of candidates.");
		}
	};

	if (isInitiator) {
		//console.log("Creating Data Channel");
		dataChannel = peerConn.createDataChannel("sendDataChannel");
		onDataChannelCreated(dataChannel);

		//console.log("Creating an offer");
		peerConn.createOffer(onLocalSessionCreated, logError);
	} else {
		peerConn.ondatachannel = function (event) {
			//console.log("ondatachannel:", event.channel);
			dataChannel = event.channel;
			onDataChannelCreated(dataChannel);
		};
	}
}

function onLocalSessionCreated(desc) {
	//console.log("local session created:", desc);
	peerConn.setLocalDescription(desc, function () {
		//console.log("sending local desc:", peerConn.localDescription);
		sendMessage(peerConn.localDescription);
	}, logError);
}

function onDataChannelCreated(channel) {
	//console.log("onDataChannelCreated:", channel);

	channel.onopen = function () {
		//console.log("CHANNEL opened!!!");

	};

	channel.onclose = function () {
        //console.log("Channel closed.");
        console.log("teste");
	};

	channel.onmessage = function () {
		//apply corresponding function
		receiveData(event);
	};
}

function receiveData(e) {
	var information = JSON.parse(e.data);
	window[information.functionName](information.args);
	if (information.generate) generateAll();
}

function sendData(jsonFunction) {
	if (!dataChannel) {
		logError("Connection has not been initiated. " +
            "Get two peers in the same room first");
		return;
	} else if (dataChannel.readyState === "closed") {
		//logError("Connection was lost. Peer closed the connection.");
		return;
	}

	dataChannel.send(jsonFunction);
}

function show() {
	Array.prototype.forEach.call(arguments, function (elem) {
		elem.style.display = null;
	});
}

function hide() {
	Array.prototype.forEach.call(arguments, function (elem) {
		elem.style.display = "none";
	});
}

function randomToken() {
	return Math.floor((1 + Math.random()) * 1e16).toString(16).substring(1);
}

function logError(err) {
	if (!err) return;
	if (typeof err === "string") {
		console.warn(err);
	} else {
		console.warn(err.toString(), err);
	}
}
