//"use strict";

var uIndex = 0;
var tempIndex;
// This client receives a message
var peerConnLocal = [];
var peerConnRemote;
var dataChannel = [];

var configuration = {
	"iceServers": [{
		"urls": "stun:stun.l.google.com:19302"
	}]
};

var isInitiator;
var clientIdG;
var idToRespond;
var curIndex;
var started = false;
var colors = ["#00FF3C", "#C50F1F", "#0037DA", "#881798", "#3A96DD", "#CCCCCC", "#767676", "#C19C00"];

var socket;
function waitStart() {
	var starting = false;

	for (var channel in dataChannel) {
		starting = true;

		if (dataChannel[channel].readyState !== "open") {
			setTimeout(function () { waitStart(); }, 300);
			starting = false;
			return;
		}
	}

	if (starting) {
		start(false);
		started = true;
	}
}

function startConn() {
	peerConnLocal = [];
	dataChannel = [];
	markers = [];
	if (window.room === undefined) window.room = prompt("Enter room name:");

	if (room !== "") {
		socket.emit("create or join", room);
		//console.log("Attempted to create or  join room", room);
	}
}

document.addEventListener('DOMContentLoaded', function () {
	socket=io.connect();

	socket.on("getRoom", function () {
		setTimeout(startConn, 200);
	});

	

	socket.on("ipaddr", function (ipaddr) {
		//console.log("Server IP address is: " + ipaddr);
		// updateRoomURL(ipaddr);
	});

	socket.on("created", function (room, clientId) {
		//console.log("Created room", room, "- my client ID is", clientId);
		isInitiator = true;
		clientIdG = clientId;
		uIndex = clientId;
		start(true);
		started = true;
	});

	socket.on("joined", function (idToSend, room, clientId, index) {
		//console.log("This peer has joined room", room, "with client ID", clientId);
		isInitiator = false;
		uIndex = clientId;
		createPeerConnectionLocal(idToSend, isInitiator, configuration);
		clientIdG = clientId;
	});

	socket.on("reload", function (room) {
		console.log("reloading");
		peerConnLocal = [];
		dataChannel = [];
		markers = [];
		socket.emit("create or join", room);
	});

	socket.on("start", function () {

		setTimeout(function () { waitStart(); }, 300);
	});

	socket.on("full", function (room) {
		alert("Room " + room + " is full. We will create a new room for you.");
		window.location.hash = "";
		window.location.reload();
	});

	socket.on("ready", function (room, socketId) {
		//console.log("Socket is ready");
		createPeerConnectionRemote(isInitiator, configuration, socketId);
	});

	socket.on("disconnect", function () {
		console.log("disconnected");
	});

	socket.on("log", function (array) {
		//console.log.apply(console, array);
	});

	socket.on("message", function (message) {
		//console.log("Client received message:", message);
		signalingMessageCallbackLocal(message);
	});
}, false); 

function sendMessage(message) {
	socket.emit("broadcast", message, window.room);
}

function sendPrivateMessage(message) {
	socket.emit("private", message);
}

function iceSuccess() {

}
function signalingMessageCallbackLocal(message, dest) {
	if (message.type === "offer") {
		//console.log("Got offer. Sending answer to peer.");
		peerConnLocal[message.sId].setRemoteDescription(message.desc).then(function () { }, logError);
		peerConnLocal[message.sId].createAnswer().then(onRemoteSessionCreated.bind(null, message.sId), logError);

	} else if (message.type === "answer") {
		//console.log("Got answer.");
		peerConnLocal[message.sId].setRemoteDescription(message.desc).then(function () { },
			logError);

	} else if (message.type === "candidate") {
		peerConnLocal[message.sId].addIceCandidate(new RTCIceCandidate({
			candidate: message.candidate,
			sdpMid: message.mid,
			sdpMLineIndex: message.label
		}));
	}
}
function createPeerConnectionRemote(isInitiator, config, id) {
	peerConnLocal[id] = new RTCPeerConnection(config);

	peerConnLocal[id].onicecandidate = function (event) {
		//console.log("icecandidate event:", event);
		if (event.candidate) {
			sendPrivateMessage({
				type: "candidate",
				label: event.candidate.sdpMLineIndex,
				mid: event.candidate.sdpMid,
				candidate: event.candidate.candidate,
				id: id,
				sId: clientIdG
			});
		}
	};

	peerConnLocal[id].oniceconnectionstatechange = function (ev) {

		if (peerConnLocal[id].iceConnectionState === 'disconnected' || peerConnLocal[id].iceConnectionState === 'failed') {
			delete markers[id];
			peerConnLocal[id].close();

			generateAll();
		} else if (peerConnLocal[id].iceConnectionState === 'closed') {
			if (dataChannel[id]) {
				dataChannel[id].close();
			} else {
				delete peerConnLocal[id];
				//tryReload();
			}
		}
	};

	//console.log("Creating Data Channel");
	peerConnLocal[id].ondatachannel = function (event) {
		// console.log("ondatachannel:", event.channel);
		dataChannel[id] = event.channel;
		onDataChannelCreated(id);
	};
}

function createPeerConnectionLocal(id, isInitiator, config) {
	//console.log("Creating Peer connection as initiator?", isInitiator, "config:",
	//	config);
	peerConnLocal[id] = new RTCPeerConnection(config);
	// peerConnRemote = new RTCPeerConnection(config);

	// send any ice candidates to the other peer
	peerConnLocal[id].onicecandidate = function (event) {
		//console.log("icecandidate event:", event);
		if (event.candidate) {
			sendPrivateMessage({
				type: "candidate",
				label: event.candidate.sdpMLineIndex,
				mid: event.candidate.sdpMid,
				candidate: event.candidate.candidate,
				id: id,
				sId: clientIdG
			});
		}
	};

	peerConnLocal[id].oniceconnectionstatechange = function (ev) {

		if (peerConnLocal[id].iceConnectionState === 'disconnected' || peerConnLocal[id].iceConnectionState === 'failed') {
			delete markers[id];
			peerConnLocal[id].close();

			generateAll();
		} else if (peerConnLocal[id].iceConnectionState === 'closed') {
			if (dataChannel[id]) {
				dataChannel[id].close();
				//tryReload();
			} else {
				delete peerConnLocal[id];
				//tryReload();
			}
		}
	};


	// var i = dataChannel.push( peerConnLocal[id].createDataChannel("musicTransfer"))-1;
	// onDataChannelCreated(dataChannel[i]);
	dataChannel[id] = peerConnLocal[id].createDataChannel("musicTransfer");
	onDataChannelCreated(id);

	peerConnLocal[id].createOffer().then(onLocalSessionCreated.bind(null, id), logError);
}

// function createPeerConnectionRemote(isInitiator, config) {
// 	//console.log("Creating Peer connection as initiator?", isInitiator, "config:",
// 	//	config);


// 	// send any ice candidates to the other peer




// }

function onLocalSessionCreated(index, desc) {
	//console.log("local session created:", desc);

	sendPrivateMessage({
		type: "offer",
		desc: desc,
		sId: clientIdG,
		id: index
	});
	peerConnLocal[index].setLocalDescription(desc);
	// peerConnRemote.setRemoteDescription(desc);
	// //     function () {
	// // 	//console.log("sending local desc:", peerConn.localDescription);
	// // 	sendMessage(peerConnLocal.localDescription);
	// // }, logError);
	// peerConnRemote.createAnswer().then(onRemoteSessionCreated, logError);
}

function onRemoteSessionCreated(index, desc) {
	peerConnLocal[index].setLocalDescription(desc);
	sendPrivateMessage({
		type: "answer",
		desc: desc,
		sId: clientIdG,
		id: index
	});
}

function onDataChannelCreated(channel) {
	//console.log("onDataChannelCreated:", channel);

	dataChannel[channel].onopen = function () {

	};

	dataChannel[channel].onclose = function () {
		delete dataChannel[channel];
		delete peerConnLocal[channel];
	};

	dataChannel[channel].onmessage = function (event) {
		//apply corresponding function
		receiveData(event);
	};
}

function tryReload() {
	var cnt = 0;
	console.log("Socket is connected? " + socket.connected);

	if (socket.connected === false) {
		setTimeout(tryReload, 200);
		console.log("trying to reconnect");
		return;
	}

	for (var c in peerConnLocal) {
		cnt++;
	}

	if (cnt === 0) {
		socket.emit("check offline", room, 0);
	}
}

function receiveData(ev) {
	var information = JSON.parse(ev.data);
	window[information.functionName](information.args);
	if (information.generate) generateAll();
}

function sendData(jsonFunction) {
	for (var channel in dataChannel) {
		if (!dataChannel[channel]) {
			logError("Connection has not been initiated. " +
				"Get two peers in the same room first");
			return;
		} else if (dataChannel[channel].readyState === "closed") {
			//alert("Connection was lost. Peer closed the connection.");
			delete markers[channel];
			return;
		}

		dataChannel[channel].send(jsonFunction);
	}
}

function sendDataTo(jsonFunction, channel) {
	if (!dataChannel[channel]) {
		logError("Connection has not been initiated. " +
			"Get two peers in the same room first");
		return;
	} else if (dataChannel[channel].readyState === "closed") {
		//logError("Connection was lost. Peer closed the connection.");
		return;
	}
	dataChannel[channel].send(jsonFunction);
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

