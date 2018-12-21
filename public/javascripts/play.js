var playingBar = 0;
var playingNote = 0;
var playingTime = 0;
var tempo = 120;
var savedCanvas = document.getElementById("save");
var playing = false;

function play() {
	playing=true;

	playNotes();
}
var chord;

function playNotes() {
	if(bars.length>0) {
		

		restoreCanvas();
		if(playingBar === bars.length){
			drawMarker(y); playing=false; return;
		}
		var totalTime = bars[playingBar].upperSig/bars[playingBar].lowerSig;
		
		if((playingNote === bars[playingBar].notes.length && playingTime===totalTime)||playingTime>totalTime) {
			playingNote = 0; playingBar++; playingTime=0;
		} 

		if(playingBar === bars.length){
			drawMarker(y); playing=false; return;
		}

		if(playingNote === bars[playingBar].notes.length && playingTime!==totalTime) {
			velocity = (totalTime-playingTime) * (1/((tempo/60))*4);
			playingTime=0;

			var headerPos = bars[playingBar].initPos + 10;
			if(bars[playingBar].changedOrFirstClef) headerPos += 45;
			if(bars[playingBar].changedTimeSig) headerPos+=35;
			if(bars[playingBar].changedAcc || bars[playingBar].firstAcc)headerPos += bars[playingBar].accidentals*18;
			drawHeader(headerPos, bars[playingBar].line);

			playingNote = 0; playingBar++;
			time = setTimeout(playNotes, velocity*1000);
			return;
		}
	
		drawHeader(bars[playingBar].notes[playingNote].xPos, bars[playingBar].line);
		playingTime+=getNoteDuration(bars[playingBar].notes[playingNote]);
		chord = new Array();
		for(n=0; n<bars[playingBar].notes[playingNote].noteGroups.length; n++) {
			chord.push(bars[playingBar].notes[playingNote].noteGroups[n].noteValue + bars[playingBar].notes[playingNote].noteGroups[n].accidental);
		}

		var duration = getNoteDuration(bars[playingBar].notes[playingNote]) * (1/((tempo/60))*4);
		console.log(duration)
		if(!bars[playingBar].notes[playingNote].isSpace) {
			//player.cancelQueue(audioContext);
			player.queueChord(audioContext, audioContext.destination, _tone_0000_FluidR3_GM_sf2_file, 0, chord, duration+duration*1/4);
		}

		playingNote++
		time = setTimeout(playNotes, duration*1000);
		
	}
}