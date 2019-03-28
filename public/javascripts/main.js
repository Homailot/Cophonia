var instr=null; // eslint-disable-line no-unused-vars
var AudioContextFunc = window.AudioContext || window.webkitAudioContext;
var audioContext = new AudioContextFunc();
var player=new WebAudioFontPlayer();

function changeInstrument(path,name){
	player.loader.startLoad(audioContext, path, name);
	player.loader.waitLoad(function () {
		instr=window[name];
	});
}

window.onload = function () {
	changeInstrument("https://surikov.github.io/webaudiofontdata/sound/0000_FluidR3_GM_sf2_file.js","_tone_0000_FluidR3_GM_sf2_file");

	setTimeout(startConn,200);
};



var c = document.getElementById("principal");
var ctx = c.getContext("2d");
c.width = window.innerWidth - 50;
c.height = window.innerHeight - 20;
ctx.translate(0.5, 0.5);
var lastPos = 180;
y=0;
var iPages = [];
var curIPage=0;
var bars = []; // eslint-disable-line no-unused-vars
var lines = []; // eslint-disable-line no-unused-vars
var savedBars = []; // eslint-disable-line no-unused-vars
var curBar = 0; // eslint-disable-line no-unused-vars
var curNote = 0; // eslint-disable-line no-unused-vars
var staffN = 1; // eslint-disable-line no-unused-vars
var curDuration = 0.5; // eslint-disable-line no-unused-vars
var curLine = 0; // eslint-disable-line no-unused-vars
var extended = false; // eslint-disable-line no-unused-vars
var markers=[];

var time = []; // eslint-disable-line no-unused-vars
var scrollValue=0; // eslint-disable-line no-unused-vars
var accidentalOrder = [4, 1, 5, 2, 6, 3, 7]; // eslint-disable-line no-unused-vars

function start() {
	console.log(uIndex);
	lines.push(new Line());
	lines[0].yOffset=0;
	iPages.push(new InstrumentPage());
	bars=iPages[curIPage].bars;
	iPages[curIPage].lines=lines;
	var args = {
		upperSig: 4,
		lowerSig: 4,
		cS: true,
		clef: 0,
		cC: false,
		iPage: curIPage,
		bar: curBar,
		line: curLine, 
		curLine:curLine,
		cA: false,
		acc: 0,
		sof: 0
	};
	newBar(args);
	
	var mInformation = {
		functionName: "sendMarker",
		args: {
		},
		generate: false
	};
	sendData(JSON.stringify(mInformation));
	var lInformation = {
		functionName: "newMarker",
		args: {
			index: uIndex,
			bar: curBar,
			note: curNote,
			line: curLine,
			iPage: curIPage,
			y: y
		},
		generate: true
	}
	sendData(JSON.stringify(lInformation));
	newMarker(lInformation.args);

	generateAll();
}