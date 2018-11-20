window.onload = function () {
	var instrumentName= "acoustic_grand_piano"

	MIDI.loadPlugin({
		soundfontUrl: '/FluidR3_GM/',
		instrument: instrumentName,
		onprogress: function(state, progress) {
			console.log(state, progress);
		},
		onsuccess: function() {
			var delay = 0; // play one note every quarter second
			var note = 70; // the MIDI note
			var velocity = 127; // how hard the note hits
			MIDI.programChange(0, MIDI.GM.byName[instrumentName].number);

		}
	});

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