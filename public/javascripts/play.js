var t = 0;
var score = [];
var loading=0;

var instruments = {
	"piano": {
		name: "Piano",
		var: 7
	},
	"eGuitar": {
		name: "Guitarra Elétrica",
		var: 336
	},
	"guitar": {
		name: "Guitarra",
		var: 262
	},
	"bass": {
		name: "Baixo Elétrico",
		var: 377
	}
};

var totalOffset;
var tempo = 120;
var savedCanvas = document.getElementById("save"); // eslint-disable-line no-unused-vars
var playing = false; // eslint-disable-line no-unused-vars
var hOffset = 0;
var playLine = 0;
var headerPos = -1;
var timeTimeout;

function playBack(audioContext, playingBar, playingNote, page) {
	//foreach note in the current note group we will get the chords to play
	var chord = [];
	if (!bars[playingBar].notes[playingNote] || bars[playingBar].notes[playingNote].isSpace) return;
	var duration = 1;
	for (var n = 0; n < bars[playingBar].notes[playingNote].noteGroups.length; n++) {
		//we add the note to a temporary chord
		var value = bars[playingBar].notes[playingNote].noteGroups[n].noteValue;
		var sP = bars[playingBar].notes[playingNote].noteGroups[n].scalePos;
		if (bars[playingBar].clef === 2) {
			value -= 20;
			if ((sP >= 6 && sP < 8) || (sP >= 2 && sP < 4)) value -= 1;
		}
		//if(page==1) value+=12;
		chord.push(value + bars[playingBar].notes[playingNote].noteGroups[n].accidental);
	}
	var instrument = player.loader.instrumentInfo(instruments[iPages[page].instrument].var).variable;
	console.log(instrument);
	player.queueChord(audioContext, audioContext.destination, window[instrument], 0, chord, duration);
}

// function play(context) { // eslint-disable-line no-unused-vars
// 	playing = true;
// 	playingBar = [];
// 	playingNote = [];
// 	playingTime = [];
// 	time = [];
// 	playing = [];
// 	if (selectedNotes[0]) {
// 		playLine = bars[selectedNotes[0].bar].line + 1;
// 	} else {
// 		playLine = 0;
// 	}

// 	headerPos = -1;
// 	hOffset = 0;
// 	tempo = SheetDocument.tempo;
// 	totalOffset = c.height - 120;
// 	ctx.translate(0, scrollValue);
// 	generateAll();
// 	scrollValue = 0;

// 	for (var i = 0; i < iPages.length; i++) {
// 		if (selectedNotes[0]) {
// 			playingBar.push(selectedNotes[0].bar);
// 		} else {
// 			playingBar.push(0);
// 		}

// 		playingNote.push(0);
// 		playingTime.push(0);
// 		playing.push(true);
// 		if (i === curIPage) {
// 			hOffset = iPages[curIPage].headerOffset;
// 			for (var b = 0; selectedNotes[0] && b <= bars[selectedNotes[0].bar].line; b++) {
// 				hOffset += lines[b].yOffset;
// 			}
// 		}
// 		playNotes(iPages[i].bars, i, context);
// 	}

// }


function play(context) { // eslint-disable-line no-unused-vars
	score = [];
	playing=true;
	t = 0;

	if (selectedNotes[0]) {
		playLine = bars[selectedNotes[0].bar].line + 1;
	} else {
		playLine = 0;
	}

	headerPos = -1;
	hOffset = 0;
	tempo = SheetDocument.tempo;
	totalOffset = c.height - 120;
	ctx.translate(0, scrollValue);
	generateAll();
	scrollValue = 0;
	var time = 0;
	var playingBar;

	if (selectedNotes[0]) {
		playingBar = selectedNotes[0].bar;
		time = getInitTime(iPages[selectedNotes[0].iPage].bars, playingBar);
	} else {
		playingBar = 0;
	}

	for (var i = 0; i < iPages.length; i++) {
		if (i === curIPage) {
			hOffset = iPages[curIPage].headerOffset;
			for (var b = 0; selectedNotes[0] && b <= bars[selectedNotes[0].bar].line; b++) {
				hOffset += lines[b].yOffset;
			}
		}

		getAllNotes(iPages[i].bars, time, i);
	}
	t=0;
	restoreCanvas();
	playNotes(context);

}

function getInitTime(bars, bar) {
	var cNote = 0;
	var cBar = 0;
	var time = 0;

	while (cBar < bar && bar < bars.length) {
		var totalTime = bars[cBar].upperSig / bars[cBar].lowerSig;

		var getD = getNoteDuration(bars[cBar].notes[cNote]);
		if (bars[cBar].notes[cNote].fullRest) getD = totalTime;
		time += getD;

		cNote++;

		if ((cNote === bars[cBar].notes.length)) {
			cNote = 0; cBar++;
		}
	}

	return time;
}

function getPosition(bars, time) {
	var cTime = 0;
	var cNote = 0;
	var cBar = 0;

	while (time > cTime && cBar < bars.length) {
		var totalTime = bars[cBar].upperSig / bars[cBar].lowerSig;

		var getD = getNoteDuration(bars[cBar].notes[cNote]);
		if (bars[cBar].notes[cNote].fullRest) getD = totalTime;
		cTime += getD;

		cNote++;
		if ((cNote === bars[cBar].notes.length)) {
			cNote = 0; cBar++;
		}
	}

	return { bar: cBar, note: cNote, time: cTime };
}

function getAllNotes(bars, time, page) {
	var result = getPosition(bars, time);
	var cNote = result.note;
	var cBar = result.bar;
	var cTime = result.time;

	while (cBar < bars.length) {
		var totalTime = bars[cBar].upperSig / bars[cBar].lowerSig;

		var getD = getNoteDuration(bars[cBar].notes[cNote]);
		if (bars[cBar].notes[cNote].fullRest) getD = totalTime;

		getChords(bars, cBar, cNote, cTime, page);
		cTime += getD;
		cNote++;

		//if we've reached the end of the bar or if the note's duration exceeds the bar's duration, we go on to the next bar
		if (cNote === bars[cBar].notes.length) {
			cNote = 0; cBar++;
		}
	}
}

function getLocation(t) {
	var w = 0;
	for (; w < score[t].where.length; w++) {
		if (score[t].where[w].page === curIPage) {
			return w;
		}
	}

	return -1;
}

function playNotes(audioContext) {
	if(t==score.length) {
			restoreCanvas();
			drawMarker({ headerOffset: iPages[curIPage].headerOffset });
			playing=false;
		return;
	} else if(t+1<score.length){
		var getD = score[t + 1].time - score[t].time;
		var nDuration = getD * ((60 / tempo) * 4);

		timeTimeout=setTimeout(function () {
			t++;
			playNotes(audioContext);
		}, nDuration * 1000);
	}
	

	
	var result = getLocation(t);
	var cNote;
	var cBar;
	if (result != -1) {
		cNote = score[t].where[result].note;
		cBar = score[t].where[result].bar;
		curBar=cBar;
	}

	//set the vertical offsets for the marker that follows along
	if (result != -1 && bars[cBar].line === playLine) {
		playLine++;
		hOffset += lines[bars[cBar].line].yOffset;
	}
	//player.cancelQueue(audioContext);
	for (var ch = 0; ch < score[t].chords.length; ch++) {
		var d = score[t].chords[ch].duration;
		player.queueChord(audioContext, audioContext.destination, window[instruments[score[t].chords[ch].instrument].loaded], 0, score[t].chords[ch].chord, d);
	}

	if (result != -1) {
		restoreCanvas();
		headerPos = bars[cBar].notes[cNote].xPos;
		var update = false;

		while (((bars[cBar].line + 1) * 144 + hOffset - 30) > totalOffset) {
			scrollValue += c.height - 200;
			totalOffset += c.height - 200;
			ctx.translate(0, -(c.height - 200));
			update = true;

		}
		if (update) {
			generateAll();
			saveCanvas();
		}

		drawHeader(bars[cBar].notes[cNote].xPos, bars[cBar].line, hOffset);
	}

	if (t+1===score.length) {
		restoreCanvas();
		drawMarker({ headerOffset: iPages[curIPage].headerOffset });
		playing=false;
	}

}


function getChords(bars, playingBar, playingNote, time, page) {
	var duration = 0;
	var ft = true;
	//foreach note in the current note group we will get the chords to play
	for (var n = 0; n < bars[playingBar].notes[playingNote].noteGroups.length; n++) {
		var chord = [];
		duration = 0;
		//if the note is tied to another, it will be already on a chord, so it will be skipped
		if (bars[playingBar].notes[playingNote].noteGroups[n].tiedTo !== false) continue;

		//we add the note to a temporary chord
		var value = bars[playingBar].notes[playingNote].noteGroups[n].noteValue;
		var sP = bars[playingBar].notes[playingNote].noteGroups[n].scalePos;
		if (bars[playingBar].clef === 2) {
			value -= 20;
			if ((sP >= 6 && sP < 8) || (sP >= 2 && sP < 4)) value -= 1;
		}
		//if(page==1) value+=12;
		chord.push(value + bars[playingBar].notes[playingNote].noteGroups[n].accidental);

		//if the note is tied to another, the duration of the chord will be calculated as the full tie group duration
		if (bars[playingBar].notes[playingNote].noteGroups[n].tiesTo !== false) {
			var objNG = { objNote: bars[playingBar].notes[playingNote], objNG: bars[playingBar].notes[playingNote].noteGroups[n] };
			duration = getTieDuration(bars, playingBar, playingNote, objNG, duration) * (1 / ((tempo / 60)) * 4);

			//if not, the note duration will be used
		} else {
			duration = getNoteDuration(bars[playingBar].notes[playingNote]) * (1 / ((tempo / 60)) * 4);
		}

		//gets the index of the chord of the same duration we got from the last instructions
		var index = getIndexOfChord(duration, time, iPages[page].instrument);

		if (bars[playingBar].notes[playingNote].isSpace) {
			if (index.chordI === -2) {
				score.splice(index.timeI, 0, { time: time, where: [], chords: [] });
			} 
		} else {

			//we add a new chord or update an old one
			if (index.chordI === -2) {
				score.splice(index.timeI, 0, { time: time, where: [], chords: [{ chord: chord, duration: duration, instrument: iPages[page].instrument }] });
			} else if (index.chordI === -1) {
				score[index.timeI].chords.push({ chord: chord, duration: duration, instrument: iPages[page].instrument });

			} else {
				score[index.timeI].chords[index.chordI].chord.push(value + bars[playingBar].notes[playingNote].noteGroups[n].accidental);
			}
		}

		if (ft) {
			ft = false;
			score[index.timeI].where.push({ page: page, note: playingNote, bar: playingBar });
		}
	}
}

function getIndexOfChord(duration, time, instrument) {
	var gotTime = false;

	for (t = 0; t < score.length; t++) {
		if (score[t].time == time) {
			gotTime = true;
			break;
		} else if (score[t].time > time) {
			return { timeI: t, chordI: -2 };
		}
	}

	if (gotTime) {
		var chords = score[t].chords;

		for (var ch = 0; ch < chords.length; ch++) {
			if (chords[ch].duration === duration && chords[ch].instrument === instrument ) {
				return { timeI: t, chordI: ch };
			}
		}

		return { timeI: t, chordI: -1 };
	}


	return { timeI: t, chordI: -2 };
}

function getTieDuration(bars, bar, note, objNG, duration) {
	var result;
	if (objNG.objNG.tiesTo === false) {
		duration = getNoteDuration(objNG.objNote) * 1.2;
	} else {
		result = getTied(bars, bar, note + 1, objNG.objNG);
		duration += getTieDuration(bars, result.barTo, result.noteTo, { objNote: result.tiesTo, objNG: result.tiesToNG }, duration) + getNoteDuration(objNG.objNote);
	}


	return duration;
}