var playingBar = 0;
var playingNote = 0;
var playingTime = 0;
var tempo = 120;
var savedCanvas = document.getElementById("save"); // eslint-disable-line no-unused-vars
var playing = false; // eslint-disable-line no-unused-vars
var hOffset=0;
var playLine=0;
var headerPos = -1;

function play() { // eslint-disable-line no-unused-vars
	playing=true;
	playLine=0;
	headerPos=-1;
	hOffset=0;

	playNotes();
}

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

		if(bars[playingBar].line===playLine) {
			playLine++;
			hOffset+=lines[bars[playingBar].line].yOffset;
		}

		if(playingNote === bars[playingBar].notes.length && playingTime!==totalTime) {
			var velocity = (totalTime-playingTime) * (1/((tempo/60))*4);
			playingTime=0;

			if( bars[playingBar].notes.length===0) {
				headerPos=bars[playingBar].initPos + 10;
				if(bars[playingBar].changedOrFirstClef) headerPos += 45;
				if(bars[playingBar].changedTimeSig) headerPos+=35;
				if(bars[playingBar].changedAcc || bars[playingBar].firstAcc)headerPos += bars[playingBar].accidentals*18;
			}
			hOffset = drawHeader(headerPos, bars[playingBar].line, hOffset);

			playingNote = 0; playingBar++;
			time = setTimeout(playNotes, velocity*1000);
			return;
		}
		headerPos=bars[playingBar].notes[playingNote].xPos;
		drawHeader(bars[playingBar].notes[playingNote].xPos, bars[playingBar].line, hOffset);
		var nDuration = getNoteDuration(bars[playingBar].notes[playingNote]) * (1/((tempo/60))*4);
		playingTime+=getNoteDuration(bars[playingBar].notes[playingNote]);
		var chords = getChords(playingBar, playingNote);
		
		
		if(!bars[playingBar].notes[playingNote].isSpace) {
			//player.cancelQueue(audioContext);
			for(var ch = 0; ch<chords.length; ch++) {
				var d = chords[ch].duration+chords[ch].duration*1/4;
				player.queueChord(audioContext, audioContext.destination, _tone_0000_FluidR3_GM_sf2_file, 0, chords[ch].chord, d);
			}
			
		}

		playingNote++;
		time = setTimeout(playNotes, nDuration*1000);
		
	}
}

function getChords(playingBar, playingNote) {
	var chords = new Array();
	var duration = 0;
	for(var n=0; n<bars[playingBar].notes[playingNote].noteGroups.length; n++) {
		var chord = new Array();
		if(bars[playingBar].notes[playingNote].noteGroups[n].tiedTo!==null) continue;
		
		chord.push(bars[playingBar].notes[playingNote].noteGroups[n].noteValue + bars[playingBar].notes[playingNote].noteGroups[n].accidental);
		if(bars[playingBar].notes[playingNote].noteGroups[n].tiesTo!==null) {
			var objNG = {objNote: bars[playingBar].notes[playingNote], objNG: bars[playingBar].notes[playingNote].noteGroups[n]};
			duration = getTieDuration(objNG, duration)  * (1/((tempo/60))*4);
		} else {
			duration = getNoteDuration(bars[playingBar].notes[playingNote]) * (1/((tempo/60))*4);
		}

		var index = getIndexOfChord(chords, duration);
		if(index===-1) {
			chords.push({chord: chord, duration: duration});
		} else {
			chords[index].chord.push(bars[playingBar].notes[playingNote].noteGroups[n].noteValue + bars[playingBar].notes[playingNote].noteGroups[n].accidental);
		}
	}

	return chords;
}

function getIndexOfChord(chords, duration) {
	for(var ch = 0; ch<chords.length; ch++) {
		if(chords[ch].duration===duration) {
			return ch;
		}
	}

	return -1;
}

function getTieDuration(objNG, duration) {
	if(objNG.objNG.tiesTo===null) {
		duration=getNoteDuration(objNG.objNote);
	} else {
		duration+=getTieDuration(objNG.objNG.tiesTo, duration)+getNoteDuration(objNG.objNote);
	}
	

	return duration;
}