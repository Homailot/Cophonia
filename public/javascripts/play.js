var playingBar = [];
var playingNote = [];
var playingTime = [];
var tempo = 120;
var savedCanvas = document.getElementById("save"); // eslint-disable-line no-unused-vars
var playing = []; // eslint-disable-line no-unused-vars
var hOffset=0;
var playLine=0;
var headerPos = -1;

function play() { // eslint-disable-line no-unused-vars
	playing=true;
	playingBar=[];
	playingNote=[];
	playingTime=[];
	time = [];
	playing = [];
	playLine=0;
	headerPos=-1;
	hOffset=0;

	for(var i = 0; i<iPages.length; i++) {
		playingBar.push(0);
		playingNote.push(0);
		playingTime.push(0);
		playing.push(true);
		
		playNotes(iPages[i].bars, i);
	}
	
}

function playNotes(bars, page) {
	if(bars.length>0) {
		if(page===curIPage) restoreCanvas();
		if(playingBar[page] === bars.length){
			if(page===curIPage) drawMarker(y); 
			playing[page]=false; return;
		}
		var totalTime = bars[playingBar[page]].upperSig/bars[playingBar[page]].lowerSig;
		
		//if we've reached the end of the bar or if the note's duration exceeds the bar's duration, we go on to the next bar
		if((playingNote[page] === bars[playingBar[page]].notes.length && playingTime[page]===totalTime)||playingTime[page]>totalTime) {
			playingNote[page] = 0; playingBar[page]++; playingTime[page]=0;
		} 

		if(playingBar[page] === bars.length){
			if(page===curIPage) drawMarker(y);
			playing[page]=false; return;
		}

		//set the vertical offsets for the marker that follows along
		if(bars[playingBar[page]].line===playLine) {
			playLine++;
			hOffset+=lines[bars[playingBar[page]].line].yOffset;
		}

		//if we've reached the end of the bar, but the bar's time isn't complete we await until it is.
		if(playingNote[page] === bars[playingBar[page]].notes.length && playingTime[page]!==totalTime) {
			var velocity = (totalTime-playingTime[page]) * (1/((tempo/60))*4);
			playingTime[page]=0;

			if( bars[playingBar[page]].notes.length===0) {
				headerPos=bars[playingBar[page]].initPos + 10;
				if(bars[playingBar[page]].changedOrFirstClef) headerPos += 45;
				if(bars[playingBar[page]].changedTimeSig) headerPos+=35;
				if(bars[playingBar[page]].changedAcc || bars[playingBar[page]].firstAcc)headerPos += bars[playingBar[page]].accidentals*18;
			}
			if(page===curIPage) hOffset = drawHeader(headerPos, bars[playingBar[page]].line, hOffset);

			playingNote[page] = 0; playingBar[page]++;
			time[page] = setTimeout(function() {
				playNotes(bars, page);
			}, velocity*1000);
			return;
		}
		if(page===curIPage) {
			headerPos=bars[playingBar[page]].notes[playingNote[page]].xPos;
			drawHeader(bars[playingBar[page]].notes[playingNote[page]].xPos, bars[playingBar[page]].line, hOffset);
		}
		
		var getD = getNoteDuration(bars[playingBar[page]].notes[playingNote[page]]);
		var nDuration;
		//if the note's duration is bigger than the duration until the end of the bar, then we only await the time to completion
		if(playingTime[page]+getD>totalTime) {
			nDuration = (getD-(playingTime[page]+getD-totalTime)) * (1/(tempo/60)*4);
		} else {
			nDuration = getD  * (1/((tempo/60))*4);
		}
		playingTime[page]+=getD;
		
		var chords = getChords(bars, playingBar[page], playingNote[page]);
		
		
		if(!bars[playingBar[page]].notes[playingNote[page]].isSpace) {
			//player.cancelQueue(audioContext);
			for(var ch = 0; ch<chords.length; ch++) {
				
				var d = chords[ch].duration+chords[ch].duration*1/4;
				console.log(chords[ch].chord);
				player.queueChord(audioContext, audioContext.destination, _tone_0000_FluidR3_GM_sf2_file, 0, chords[ch].chord, d);
			}
			
		}

		playingNote[page]++;
		time[page] = setTimeout(function() {
			playNotes(bars, page);
		}, nDuration*1000);
		
	}
}

function getChords(bars, playingBar, playingNote) {
	var chords = [];
	var duration = 0;
	//foreach note in the current note group we will get the chords to play
	for(var n=0; n<bars[playingBar].notes[playingNote].noteGroups.length; n++) {
		var chord = [];
		//if the note is tied to another, it will be already on a chord, so it will be skipped
		if(bars[playingBar].notes[playingNote].noteGroups[n].tiedTo!==null) continue;
		
		//we add the note to a temporary chord
		console.log(bars[playingBar].notes[playingNote].noteGroups[n].accidental)
		chord.push(bars[playingBar].notes[playingNote].noteGroups[n].noteValue + bars[playingBar].notes[playingNote].noteGroups[n].accidental);
		
		//if the note is tied to another, the duration of the chord will be calculated as the full tie group duration
		if(bars[playingBar].notes[playingNote].noteGroups[n].tiesTo!==null) {
			var objNG = {objNote: bars[playingBar].notes[playingNote], objNG: bars[playingBar].notes[playingNote].noteGroups[n]};
			duration = getTieDuration(objNG, duration)  * (1/((tempo/60))*4);
		
		//if not, the note duration will be used
		} else {
			duration = getNoteDuration(bars[playingBar].notes[playingNote]) * (1/((tempo/60))*4);
		}

		//gets the index of the chord of the same duration we got from the last instructions
		var index = getIndexOfChord(chords, duration);

		//we add a new chord or update an old one
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