var instr=null;
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
	changeInstrument('https://surikov.github.io/webaudiofontdata/sound/0000_FluidR3_GM_sf2_file.js','_tone_0000_FluidR3_GM_sf2_file');

	setTimeout(start,200);
};



var c = document.getElementById("principal");
var ctx = c.getContext("2d");
c.width = window.innerWidth - 50
c.height = window.innerHeight - 20
ctx.translate(0.5, 0.5);
lastPos = 180;
y=0;
var bars = new Array();
var lines = new Array();
var savedBars = new Array();
var curBar = 0;
var curNote = 0;
var staffN = 1;
var curDuration = 0.5;
var curLine = 0;
var extended = false;
var Marker = {
	xPos: 0
}
var time = null;
var scrollValue=0;
var accidentalOrder = [4, 1, 5, 2, 6, 3, 7]

function start() {
	lines.push(new Line());
	newBar(4, 4, true, 0, false, lastPos, 0, false, 0, 0);
	//+10 que initPos
	//35 + 45 + 10
	//Marker.xPos = bars[curBar].initPos + 90;
	generateAll();
}