function Note(xPos, yPos, line, duration, pos, noteValue, isSpace, scalePos, acc) {
	this.xPos = xPos;
	this.noteGroups = [];
	this.noteGroups.push(new NoteGroup(yPos, pos, noteValue, scalePos, acc));
	this.line = line;
	this.duration = duration;
	this.pos = pos;
	this.isSpace = isSpace;
	this.accWidth=0;
	this.width = 30;
	this.dots=0;
	this.inverted=false;
	this.fullRest=false;
}

function NoteGroup(yPos, pos, noteValue, scalePos, acc) {
	this.yPos = yPos;
	this.pos = pos;
	this.noteValue = noteValue;
	this.scalePos = scalePos;
	this.accidental = acc;
	this.hideAcc = true;
	this.accIsOffset=1;
	this.tiedTo=false;
	this.tiesTo=false;
}

function getNoteValue(scalePos, sP, noteValue) {
	var desc=false;
	for(var iPos = 7; iPos!==scalePos;) {
		if(scalePos<iPos) {
			iPos--; sP--; noteValue-=2; desc = true;
		} else {
			iPos++; sP++; noteValue+=2;
		} 

		if(sP>7) sP-=7;
		else if(sP<1) sP+=7;
		
		if(desc && (sP===7 || sP===3)) noteValue++;
		else if(!desc && (sP===1 || sP===4)) noteValue--;
	}

	return noteValue;
}

function getAccidentalFromBar(bars, barP, sP, acc, pos) {
	var note;
	var found=false;
	for(i = 0; i<bars[barP].notes.length; i++) {
		var n=bars[barP];
		for(note=0; note<n.notes[i].noteGroups.length; note++) {
			if(pos === n.notes[i].noteGroups[note].pos) {
				acc=n.notes[i].noteGroups[note].accidental;
				found = true;
			}
		}
	}

	if(found) return acc;

	for(var i = 1; i<=bars[barP].accidentals; i++) {
		var value = i-1;
		if(bars[barP].sharpOrFlat===-1) value = 7-i;

		if(sP === accidentalOrder[value]) {
			acc = bars[barP].sharpOrFlat;
			break;
		}
	}

	return acc;
}

function placeNote(args) { // eslint-disable-line no-unused-vars
	var realPosition = ((args.line+1) * 144 - 2 ) + pos * 8;
	if(args.isSpace) realPosition=((args.line+1) * 144) - 48;
	var xPos = Marker.xPos;
	var noteValue = 71;
	if(args.iPage==1)noteValue-=12;
	var pos = args.pos;
	var scalePos = (pos+3)*-1+7;
	var sP = 7;
	var barP = args.bar;
	var noteP = args.note;
	var note;
	var lBars = iPages[args.iPage].bars;
	var acc = 0;
	
	noteValue = getNoteValue(scalePos, sP, noteValue);

	acc = getAccidentalFromBar(lBars, barP, sP, acc, pos);
	if(markers[uIndex].extended && args.bar===curBar && args.note===curNote && args.iPage===curIPage) {
		markers[uIndex].extended=false;
	}
	
	
	if(!args.newGroup) {
		note = new Note(xPos, realPosition, args.line, args.duration, pos, noteValue, args.isSpace, sP, acc);
		if(args.fullRest) {
			note.fullRest=true;
			note.duration=1;
		}
		lBars[barP].notes.splice(noteP, 0, note); 
	} else {
		lBars[barP].notes[noteP].noteGroups.push(new NoteGroup(realPosition, pos, noteValue, sP, acc));
		var noteGroupOrder=orderNoteGroup(lBars[barP].notes[noteP]);
		lBars[barP].notes[noteP].noteGroups=noteGroupOrder;
	}
	note = lBars[barP].notes[noteP];
	var inverse;
	for(var nG=0; nG<note.noteGroups.length; nG++) {
		if(nG===0) inverse = note.noteGroups[0].pos;
		else if(Math.abs(note.noteGroups[nG].pos - (-3)) > Math.abs(inverse - (-3))) {
			inverse = note.noteGroups[nG].pos;
		}
	}
	
	if(inverse<-3) {
		note.inverted=true;
	} else {
		note.inverted=false;
	}
	sendAndUpdateMarker();
}

NoteGroup.prototype.updateAccidental = function(bar, n, j, bars) {
	determineAccFromBar(bars[bar], null, this, 0);
	determineAccFromNotes(bars[bar], null, this, j);

	getAccWidth(j, bars[bar]);
};

function hideAccidental(nG, hide) {
	if(hide) {

		nG.hideAcc=true;
	} else {

		nG.hideAcc=false;
	}
}

function getNote(note, y) {
	//see if we are on a note, and selects the note if we are on one.
	var n = null;
	for(var noteGroup=0; noteGroup<note.noteGroups.length; noteGroup++) {
		if(note.noteGroups[noteGroup].pos===y+2) {
			
			n=note.noteGroups[noteGroup];
			break;
		}
	}

	return n;
}

function determineAccFromBar(bar, note, n, j) {  // eslint-disable-line no-unused-vars
	//if the value was changed then we need to verify if we have to show the accidental figure or not
	hideAccidental(n, false);
	//first we check based on the bar's accidentals
	if(bar.accidentals===0 && n.accidental===0) {
		hideAccidental(n, true);
	}
	for(var i = 1; i<=bar.accidentals; i++) {
		var value = i-1;
		if(bar.sharpOrFlat===-1) value = 7-i;

		if((n.scalePos === accidentalOrder[value] && n.accidental===bar.sharpOrFlat)) {
			hideAccidental(n, true);
			break;
		} else if(n.scalePos === accidentalOrder[value] && n.accidental!==bar.sharpOrFlat) {
			hideAccidental(n, false);
			break;
		}

		if(n.accidental!==0) {
			hideAccidental(n, false);
		} else {
			hideAccidental(n, true);
		}
	}
}

function determineAccFromNotes(bar, note, n, j) {
	//then, we verify for the notes before. Afterwards, we check the notes after it, and change them accordingly.
	for(var i = 0; i<bar.notes.length; i++) {
		for(var noteGroup=0; noteGroup<bar.notes[i].noteGroups.length; noteGroup++) {
			var subjectPlace;
			if(i > j) {
				subjectPlace = bar.notes[i].noteGroups[noteGroup];
				
			} else if(i < j) {
				subjectPlace = n;
			} else continue;

			if(n.pos === bar.notes[i].noteGroups[noteGroup].pos) {
				if(bar.notes[i].noteGroups[noteGroup].accidental!==n.accidental) {
					hideAccidental(subjectPlace, false);
					if(i>j) {
						n=bar.notes[i].noteGroups[noteGroup];
					} 
				} else {
					hideAccidental(subjectPlace, true);
				}
			}

			if(i>j) {
				getAccWidth(i, bar);	
			}
		}
	}
}

function changeAccidental(args) { // eslint-disable-line no-unused-vars
	var bar = iPages[args.iPage].bars[args.bar];
	
	if(args.note<bar.notes.length && !bar.notes[args.note].isSpace) {
		var n = getNote(bar.notes[args.note], args.y);

		//if we found a note then
		if(n!==null) {
			
			//we change it's value
			n.accidental += args.value;
			if(n.accidental>1) n.accidental=1;
			else if(n.accidental<-1) n.accidental=-1;
			else {
				determineAccFromBar(bar,null, n, args.note);

				determineAccFromNotes(bar,null, n, args.note);
			}

			getAccWidth(args.note, bar);
		}
	}
}

function determineAccLocation(objNote, objGroup, maxLength, nG) {
	var curLength=0;
	while(curLength<objGroup.length) {
		if(objNote.noteGroups[nG].pos-objGroup[curLength].pos<=5) {
			curLength++;		
		} else {
			objNote.noteGroups[nG].accIsOffset=curLength+1;

			objGroup[curLength]=objNote.noteGroups[nG];

			break;
		}
	}
	if(curLength>maxLength) {
		maxLength=curLength;
		objNote.noteGroups[nG].accIsOffset=curLength+1;
		objGroup.push(objNote.noteGroups[nG]);
	}

	return maxLength;
}

function getAccWidth(note, bar) {
	var objNote = bar.notes[note];
	var maxLength=-1;
	var objGroup=[];
	objNote.accWidth=0;
	
	for(var nG=objNote.noteGroups.length-1; nG>=0; nG--) {
		if(objGroup.length===0 && objNote.noteGroups[nG].hideAcc===false) {
			objNote.noteGroups[nG].accIsOffset=1;
			objGroup.push(objNote.noteGroups[nG]);
			maxLength=0;
			continue;
		} else if(objGroup.length===0 || objNote.noteGroups[nG].hideAcc) {
			objNote.noteGroups[nG].accIsOffset=1;
			continue;
		}

		maxLength = determineAccLocation(objNote, objGroup, maxLength, nG);
	}
	if(note.inverted && note.noteGroups.length>1) objNote.accWidth+=15;
	if(objGroup.length !== 0) objNote.accWidth+=(objGroup.length*18);
}

function augment(args) { // eslint-disable-line no-unused-vars
	var bars = iPages[args.iPage].bars;
	
	if(args.note<bars[args.bar].notes.length) {
		var objNote = bars[args.bar].notes[args.note];
		objNote.dots+=args.value;
		if(objNote.dots<0) objNote.dots=0;
		else if(objNote.dots>3) objNote.dots=3;
		else if(args.value>0) {
			objNote.width+=10;
		} else {
			objNote.width-=10;
		}
	}
}

function getNoteDuration(note) { // eslint-disable-line no-unused-vars
	var duration = note.duration;
	var lastDuration = duration;
	for(var dot=0; dot<note.dots; dot++) {
		lastDuration=lastDuration*1/2;
		duration+=lastDuration;
	}

	return duration;
}

function tieBeat(args) { // eslint-disable-line no-unused-vars
	var bars = iPages[args.iPage].bars;
	var barTo=args.bar;
	var tieTo=args.tieTo;
	if(args.tieTo>=bars[args.bar].notes.length) {
		barTo=args.bar+1;
		tieTo=0;

		if(barTo<bars.length)  {
			if(bars[barTo].notes.length===0) return;
		} else {
			return;
		}
	} else if(args.tieTo<0) {
		barTo=args.bar-1;

		if(barTo>=0) {
			if(bars[barTo].notes.length===0) return;

			
			tieTo=bars[barTo].notes.length-1;
		} else {
			return;
		}
	}
	if(bars[args.bar].notes[args.note].isSpace && !bars[barTo].notes[tieTo].isSpace ||
		!bars[args.bar].notes[args.note].isSpace && bars[barTo].notes[tieTo].isSpace) return;
	var objNoteS;
	var objNoteE;
	var objBarS, objBarE;

	if((args.bar!==barTo && barTo>args.bar) || (args.bar===barTo && args.note<tieTo)) {
		objNoteS=bars[args.bar].notes[args.note];
		objNoteE=bars[barTo].notes[tieTo];
		objBarS=bars[args.bar];
		objBarE=bars[barTo];
	} else {
		objNoteS=bars[barTo].notes[tieTo];
		objNoteE=bars[args.bar].notes[args.note];
		objBarE=bars[args.bar];
		objBarS=bars[barTo];
	}
	
	var objNG=null;
	var objDest=null;

	for(var nG = 0; nG<objNoteS.noteGroups.length; nG++) {
		if(objNoteS.noteGroups[nG].pos===args.y+2) {
			objNG=objNoteS.noteGroups[nG];
			break;
		}
	}
	
	for(nG=0; nG<objNoteE.noteGroups.length; nG++) {
		if(objNoteE.noteGroups[nG].pos===args.y+2) {
			objDest=objNoteE.noteGroups[nG];
			break;
		}
	}

	if(objNG!==null && objDest!==null) {
		objNG.tiesTo=true;
		objDest.tiedTo=true;
	}
}

function deleteTie(args) {
	var bars = iPages[args.iPage].bars;
	var objNG = null;
	for(var nG=0; nG<bars[args.bar].notes[args.note].noteGroups.length; nG++) {
		if(bars[args.bar].notes[args.note].noteGroups[nG].pos===args.y+2) {
			objNG = bars[args.bar].notes[args.note].noteGroups[nG];
			break;
		}
	}
	var result = null;

	if(objNG!==null) {
		if(objNG.tiesTo!==false) {
			result = getTied(bars, args.bar, args.note+1, objNG);
			result.tiesToNG.tiedTo=false;
			objNG.tiesTo=false;
		} else if(objNG.tiedTo!=false) {
			result = getTied(bars, args.bar, args.note-1, objNG);
			result.tiesToNG.tiesTo=false;
			objNG.tiedTo=false;
		}
	}
}

function getTied(bars, bar, note, objNG) {
	var tiesTo = bars[bar].notes[note];
	var barTo = bar;
	var noteTo = note+1;
	var tiesToNG;
	if(note>=bars[bar].notes.length && bar+1<bars.length) {
		tiesTo = bars[bar+1].notes[0];
		barTo++;
		noteTo=0;
	} else if(note<0 && bar-1>=0) {
		tiesTo = bars[bar-1].notes[bars[bar-1].notes.length-1];
		barTo--;
		noteTo=bars[bar-1].notes.length-1;
	}
	for(var nGTo = 0; nGTo< tiesTo.noteGroups.length; nGTo++) {
		if(tiesTo.noteGroups[nGTo].y===objNG.y) {
			tiesToNG=tiesTo.noteGroups[nGTo];
			break;
		}
	}

	return {tiesTo: tiesTo, barTo: barTo, tiesToNG:tiesToNG, noteTo: noteTo};
}