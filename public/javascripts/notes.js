function Note(xPos, yPos, line, duration, pos, noteValue, isSpace, scalePos, acc) {
	this.xPos = xPos;
	this.noteGroups = new Array();
	this.noteGroups.push(new NoteGroup(yPos, pos, noteValue, scalePos, acc));
	this.line = line;
	this.duration = duration;
	this.pos = pos;
	this.isSpace = isSpace;
	this.width = 30;
}

function NoteGroup(yPos, pos, noteValue, scalePos, acc) {
	this.yPos = yPos;
	this.pos = pos;
	this.noteValue = noteValue;
	this.scalePos = scalePos;
	this.accidental = acc;
	this.hideAcc = true;
}

function placeNote(duration, line, pos, isSpace, newGroup) {
	realPosition = ((line+1) * 144 - 2 ) + pos * 8;
	xPos = Marker.xPos
	var noteValue = 71;
	var scalePos = (pos+3)*-1+7;
	var sP = 7;
	var desc = false;
	var acc = 0;
	for(iPos = 7; iPos!=scalePos;) {
		if(scalePos<iPos) {
			iPos--; sP--; noteValue-=2; desc = true;
		} 
		else {
			iPos++; sP++; noteValue+=2;
		} 

		if(sP>7) sP-=7;
		else if(sP<1) sP+=7;
		
		if(desc && (sP==7 || sP==3)) noteValue++;
		else if(!desc && (sP==1 || sP==4)) noteValue--;
	}
	for(var i = 1; i<=bars[curBar].accidentals; i++) {
		var value = i-1;
		if(bars[curBar].sharpOrFlat==-1) value = 7-i;

		if(sP == accidentalOrder[value]) {
			acc = bars[curBar].sharpOrFlat;
			break;
		}
	}

	for(var i = 0; i<bars[curBar].notes.length; i++) {
		var n=bars[curBar];
		for(var note=0; note<n.notes[i].noteGroups.length; note++) {
			if(pos == n.notes[i].noteGroups[note].pos) {
				acc=n.notes[i].noteGroups[note].accidental;

			}
		}
	}
	

	if(!newGroup) {
		var note = new Note(xPos, realPosition, line, duration, pos, noteValue, isSpace, sP, acc);
		bars[curBar].notes.splice(curNote, 0, note); 
	} else {
		bars[curBar].notes[curNote].noteGroups.push(new NoteGroup(realPosition, pos, noteValue, sP, acc));
	}
}

NoteGroup.prototype.updateAccidental = function(bar, n) {
	for(var i = 1; i<=bars[bar].accidentals; i++) {
		var value = i-1;
		if(bars[bar].sharpOrFlat==-1) value = 7-i;

		if(this.scalePos == accidentalOrder[value] && this.accidental==bars[bar].sharpOrFlat) {
			if(this.hideAcc==false) n.width-=18;
			this.hideAcc=true;
			break;
		}
	}
}