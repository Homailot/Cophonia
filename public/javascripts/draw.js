function drawStaff(line, end, start) { // eslint-disable-line no-unused-vars
	ctx.beginPath(); 
	ctx.lineWidth = 1;
	ctx.strokeStyle = "#939393";
	var baseY = line * 144;

	ctx.moveTo(start, baseY + 80);
	ctx.lineTo(end, baseY + 80);
	ctx.stroke();

	ctx.beginPath(); 
	ctx.moveTo(start,baseY + 96);
	ctx.lineTo(end, baseY + 96);
	ctx.stroke();

	ctx.beginPath(); 
	ctx.moveTo(start, baseY + 112);
	ctx.lineTo(end, baseY + 112);
	ctx.stroke();

	ctx.beginPath(); 
	ctx.moveTo(start, baseY + 128);
	ctx.lineTo(end, baseY + 128);
	ctx.stroke();

	ctx.beginPath(); 
	ctx.moveTo(start, baseY + 144);
	ctx.lineTo(end, baseY + 144);
	ctx.stroke();
}

function drawClef(clef, xPos, line) {
	if(clef === 0) {
		var texto = "\uD834\uDD1E"; //sol
		ctx.font = "100px Musicaf";
		ctx.fillText(texto, xPos+70, (line + 1) * 144);
	}
}

function drawFigure(note) { // eslint-disable-line no-unused-vars
	var turned=false;
	var text;
	if(note.isSpace) {
		switch(note.duration) {
		case 1: text = "\uD834\uDD3B"; break;
		case 0.5: text = "\uD834\uDD3C"; break;
		case 0.25: text = "\uD834\uDD3D"; break;
		case 0.125: text = "\uD834\uDD3E"; break;
		case 0.0625: text = "\uD834\uDD3F"; break;
		case 0.03125: text = "\uD834\uDD40"; break;
		}
		ctx.font = "69px Musicaf";
		ctx.fillText(text, note.xPos, ((note.line+1)*144)-8-26 );

		drawDot(note, false);
		drawTies(note, turned);
		return;
	}
	if(note.noteGroups.length>1) {
		var inv = note.noteGroups[0];
		var farthest;

		for(var n=1; n<note.noteGroups.length; n++) {
			if(Math.abs(inv.pos - (-3)) < Math.abs(note.noteGroups[n].pos - (-3))) inv = note.noteGroups[n];
		}
		farthest=inv;
		for(var n2=0; n2<note.noteGroups.length; n2++) {
			if(Math.abs(inv.pos - note.noteGroups[n2].pos)>Math.abs(farthest.pos - inv.pos)) farthest = note.noteGroups[n2];
		}

		drawHead(note, note.inverted);
		for(n=0; n<note.noteGroups.length; n++) {
			note.noteGroups[n].yPos = ((note.line+1) * 144 - 2 ) + note.noteGroups[n].pos * 8 -14;
			drawExtraStaff(note.xPos, note.noteGroups[n].pos-2, note.line);
			var height = Math.abs(note.noteGroups[n].yPos - farthest.yPos) + 4;
			if(note.noteGroups[n].pos !== farthest.pos) drawStem(note, height+2, note.inverted, n);
			else  drawStem(note, 32, note.inverted, n);
		}

		ctx.save();
		ctx.translate(note.xPos+19, farthest.yPos);
		ctx.font = "69px Musicaf";

		if(inv.pos<-3) {
			ctx.rotate(Math.PI);
			ctx.translate(17, -14);
			turned=true;
		}

		switch(note.duration) {
		case 1: text = ""; break;
		case 0.5: text = ""; break;
		case 0.25: text = ""; break;
		case 0.125: text = "\uD834\uDD6E"; break;
		case 0.0625: text = "\uD834\uDD6F"; break;
		case 0.03125: text = "\uD834\uDD70"; break;
		default: text = ""; break;
		}

		if(text!== "") ctx.fillText(text, 0, 0);
		

		ctx.restore();
		drawDot(note, turned);
		drawTies(note, turned);
	} else {
		note.noteGroups[0].yPos = ((note.line+1) * 144 - 2 ) + note.noteGroups[0].pos * 8 - 14;
		drawExtraStaff(note.xPos, note.noteGroups[0].pos-2, note.line);

		drawNoteAccidental(note, m);
		ctx.save();
		ctx.translate(note.xPos, note.noteGroups[0].yPos);
		ctx.font = "69px Musicaf";

		var m=1;
		if(note.inverted) {
			ctx.rotate(Math.PI);
			ctx.translate(-20, -15);
			turned=true;
			m=-1;
		}

		switch(note.duration) {
		case 1: text = "\uD834\uDD5D"; break;
		case 0.5: text = "\uD834\uDD5E"; break;
		case 0.25: text = "\uD834\uDD5F"; break;
		case 0.125: text = "\uD834\uDD60"; break;
		case 0.0625: text = "\uD834\uDD61"; break;
		case 0.03125: text = "\uD834\uDD62"; break;
		default: text = "\uD834\uDD5F"; break;
		}

		ctx.fillText(text, 0, 0);

		

		ctx.restore();	
		drawDot(note, turned);
		drawTies(note, turned);
	}	
}

function drawTies(note, turned) { // eslint-disable-line no-unused-vars
	for(var nG=0; nG<note.noteGroups.length; nG++) {
		if(note.noteGroups[nG].tiesTo!=null) {
			var xCenter = (note.xPos+10+note.noteGroups[nG].tiesTo.objNote.xPos)/2;
			var yCenter = note.noteGroups[nG].yPos+15;
			var radius = note.noteGroups[nG].tiesTo.objNote.xPos-xCenter;
			var startAngle = 0.125*Math.PI;
			var endAngle = 0.875*Math.PI;
			//if(no)
			
			ctx.beginPath();
			ctx.strokeStyle="#000000";
			ctx.lineWidth=2;
			ctx.ellipse(xCenter, yCenter, radius, 10, 0, startAngle, endAngle, false);
			ctx.stroke();
		}
	}
}

function writeDots(note) {
	ctx.font = "80px Musicaf";

	for(var dot=0; dot<note.dots; dot++) {
		ctx.fillText("\uD834\uDD6D", 0, 0);
		ctx.translate(10, 0);
	}
}

function placeDots(note, noteGroupOrder, ngo, isSpace, occupied, inv) {
	if(ngo!==0 && occupied) {
		writeDots(note);

		ctx.translate(-note.dots*10, -16);
	} else {
		ctx.restore();
		ctx.save();

		ctx.translate(note.xPos+25, noteGroupOrder[ngo].yPos);
		if(!isSpace) {
			if(inv) ctx.translate(0, -8);
			else ctx.translate(0, +8);
		} 

		writeDots(note);

		ctx.translate(-note.dots*10, -16);
	}
	
}

function determineDots(allocatedSpaces, note, noteGroupOrder, ngo, inv) {
	
	var isSpace, space, occupied=false;
	//positions that are divided by 2 are on spaces
	if(noteGroupOrder[ngo].pos%2===0) isSpace=true;
	else isSpace=false;

	if(isSpace) {
		space = noteGroupOrder[ngo].pos/2;
	} else {
		if(inv) space = (noteGroupOrder[ngo].pos-1)/2;
		else space = (noteGroupOrder[ngo].pos+1)/2;
	}
	for(var s=0; s<allocatedSpaces.length; s++) {
		if(space===allocatedSpaces[s]) {
			occupied=true;
			space-=1;
		} else if(occupied) {
			break;
		}
	}

	placeDots(note, noteGroupOrder, ngo, isSpace, occupied, inv);
	allocatedSpaces.push(space);
}

function drawDot(note, inv) {
	if(note.dots>0) {
		if(note.isSpace) {
			ctx.save();
			ctx.translate(note.xPos+25, note.noteGroups[0].yPos);
			
			writeDots(note);
			
		}else{
			var noteGroupOrder=note.noteGroups;
			var allocatedSpaces=[];
	
			ctx.save();
			for(var ngo=0; ngo<noteGroupOrder.length ; ngo++) {
				determineDots(allocatedSpaces, note, noteGroupOrder, ngo, inv);
			}
			ctx.restore();
		}
	}
	ctx.restore();
}

function orderNoteGroup(note) { // eslint-disable-line no-unused-vars
	var noteGroupOrder=[];
	var firstN=true;
	for(var n=0; n<note.noteGroups.length; n++) {
		var objN = note.noteGroups[n];

		if(firstN) {
			noteGroupOrder.push(objN);
			firstN=false;
			continue;
			
		}
		for(var ngo=0; ngo<noteGroupOrder.length; ngo++) {
			if(noteGroupOrder[ngo].pos<objN.pos) {
				noteGroupOrder.splice(ngo, 0, objN);
				break;
			}

			if(ngo===noteGroupOrder.length-1) {
				noteGroupOrder.push(objN);
				break;
			}
		}
	}

	return noteGroupOrder;
}

function drawNoteAccidental(n, m) {
	for(var nG=n.noteGroups.length-1; nG>=0; nG--) {
		ctx.save();
		var objNG = n.noteGroups[nG];
		

		if(objNG.hideAcc===false) {
			ctx.translate(n.xPos, objNG.yPos);

			if(m===-1) {
				ctx.translate(+15, +15);
				ctx.rotate(Math.PI);
			}
	
			ctx.translate(-18*objNG.accIsOffset, 0);
			if(n.inverted && n.noteGroups.length>1) ctx.translate(-15, 0);
			var offset=10;
			var text;
			switch(objNG.accidental) {
			case 1:
				text = "\u266F";
				break;
			case -1:
				text = "\u266D";
				offset -= 6;
				break;
			case 0:
				text = "\u266E";
				break;
			default:
				text = ""; break;
			}
	
			ctx.font = "80px Musicaf";
			ctx.fillText(text, 0, offset);
		}
		ctx.restore();
	}
	
	ctx.restore();
}

function drawStem(note, height, inverse, noteGroup) {
	ctx.beginPath();

	ctx.save();
	ctx.translate(note.xPos-1, note.noteGroups[noteGroup].yPos+10);
	ctx.strokeStyle = "#000000";
	ctx.lineWidth = 2;
	//height+=2;

	if(inverse) {
		ctx.rotate(Math.PI);
		ctx.translate(-21, 6);
		height -= 12;
	} 
	
	if(note.duration<=0.5) {
		ctx.moveTo(+16,-4);
		ctx.lineTo(+16, -height-2-8);
		ctx.stroke();
	}
	
	ctx.restore();

}

function drawHead(note, inverse) {
	var noteGroupOrder=note.noteGroups;
	var faceRight=false;
	var adjacent=false;
	drawNoteAccidental(note, inverse);
	for(var n = 0; n<noteGroupOrder.length; n++) {
		
		drawExtraStaff(note.xPos, noteGroupOrder[n].pos-2, note.line);
		noteGroupOrder[n].yPos = ((note.line+1) * 144 - 2 ) +  noteGroupOrder[n].pos * 8 - 14;

		ctx.save();
		ctx.translate(note.xPos,  noteGroupOrder[n].yPos);
		ctx.font = "69px Musicaf";

		var m=1;
		if(inverse) {
			ctx.rotate(Math.PI);
			ctx.translate(-20, -15);
			m=-1;
		}
		
		if(n+1<noteGroupOrder.length) {
			if(noteGroupOrder[n+1].pos-noteGroupOrder[n].pos===-1) {
				if(!adjacent) {
					faceRight=false;
					adjacent=true;
				}

				faceRight=arrangeNote(faceRight, m);
			} else {
				if(adjacent) {
					arrangeNote(faceRight, m);

					adjacent=false;
					faceRight=false;
				}
			}
		} else {
			if(adjacent) {
				arrangeNote(faceRight, m);

				adjacent=false;
				faceRight=false;
			}
		}

		if(note.duration<=0.25) ctx.fillText("\uD834\uDD58", 0, 0);
		else if(note.duration === 0.5) ctx.fillText("\uD834\uDD57", 0, 0);
		else if(note.duration === 1) ctx.fillText("\uD834\uDD5D", 0, 0);
		
		
		ctx.restore();
	}
}

function arrangeNote(faceRight, m) {
	if(m===-1) {
		ctx.translate(0, 0);
	}

	if(!faceRight) {
		ctx.translate(-2, 0);
		faceRight=true;
	} else {
		ctx.translate(12, 0);
		faceRight=false;
	}

	return faceRight;
}

function drawBeam(xStart, yStart, xEnd, yEnd) {// eslint-disable-line no-unused-vars
	ctx.beginPath(); 
	ctx.strokeStyle = "#000000";
	ctx.lineWidth = 5;

	ctx.moveTo(xStart, yStart);
	ctx.lineTo(xEnd, yEnd);
	ctx.stroke();
}

function drawMarker(y) {// eslint-disable-line no-unused-vars
	if(curNote === 0) {
		Marker.xPos = bars[curBar].initPos+10;

		if(bars[curBar].changedTimeSig) {
			Marker.xPos +=35;
			if(bars[curBar].upperSig.length>1 || bars[curBar].lowerSig.length>1) {
				Marker.xPos+=15;
			}
		}
		if(bars[curBar].changedOrFirstClef) Marker.xPos += 45;
		if(bars[curBar].changedAcc || bars[curBar].firstAcc) {
			Marker.xPos += (bars[curBar].accidentals+bars[curBar].naturals.length)*18;
		}
		if(bars[curBar].notes.length>0) {
			Marker.xPos=(bars[curBar].notes[0].xPos);
		}

	} else if(!extended) {
		Marker.xPos = bars[curBar].notes[curNote].xPos;
	}

	var yOffset=0;
	for(var line = 0; line<=curLine; line++) {
		yOffset+=lines[line].yOffset;
	}
	ctx.translate(0, yOffset);
	drawExtraStaff(Marker.xPos, y, curLine, yOffset);

	ctx.beginPath();
	ctx.lineWidth = 1;
	ctx.strokeStyle = "#000000";
	ctx.globalAlpha = 0.2;
	ctx.fillStyle = "#00FF3C";
	
	ctx.fillRect(Marker.xPos, ((curLine+1)*144) + y * 8 - 5, 20, 26);
	ctx.rect(Marker.xPos, ((curLine+1)*144) + y * 8 - 5, 20, 26);
	ctx.globalAlpha = 1;
	ctx.stroke();
	ctx.translate(0, -yOffset);
}

function drawHeader(x, line, offset) { // eslint-disable-line no-unused-vars
	ctx.beginPath();

	ctx.lineWidth=2;
	ctx.strokeStyle = "#0505FF";
	ctx.moveTo(x+11, ((line+1)*144)+offset - 90);
	ctx.lineTo(x+11, ((line+1)*144)+offset + 30);
	ctx.stroke();
	ctx.globalAlpha=1;

	return offset;
}

function drawBar(bar, color) { // eslint-disable-line no-unused-vars
	ctx.fillStyle = "#000000";
	var timePos = bar.initPos;
	
	if(bar.changedOrFirstClef) {
		drawClef(bar.clef, bar.initPos, bar.line);

		timePos += 45;
	}
	var accidentalSum = bar.accidentals;
	var acc;
	for(var i = 0; i<bar.naturals.length; i++) {
		acc = bar.naturals[i]-1;
		if(bar.firstAcc || bar.changedAcc) drawAccidental(timePos+(i)*18, bar.naturalOrder, acc, bar.line, 0);
	}
	if(bar.firstAcc || bar.changedAcc) timePos+=(bar.naturals.length) * 18;
	for(var i2 = 1; i2<=accidentalSum; i2++) {
		acc = i2-1;
		if(bar.sharpOrFlat===-1) acc = 7-i2;
		if(bar.firstAcc || bar.changedAcc) drawAccidental(timePos+(i2-1)*18, bar.sharpOrFlat, acc, bar.line, bar.sharpOrFlat);
	}

	if(bar.firstAcc || bar.changedAcc) timePos+=(accidentalSum) * 18;
	timePos+=10;
	if(bar.changedTimeSig) {
		ctx.font = "60px BravuraF";
		if(bar.upperSig.length>1 || bar.lowerSig.length>1) {
			timePos+=5;
		}

		if(bar.upperSig.length>1) {
			ctx.fillText(unescape("%u"+"E08"+bar.upperSig[0]), timePos-11, (bar.line*144) + 95);
			ctx.fillText(unescape("%u"+"E08"+bar.upperSig[1]), timePos+11, (bar.line*144) + 95);
		} else {
			ctx.fillText(unescape("%u"+"E08"+bar.upperSig), timePos, (bar.line*144) + 95);
		}
		
		if(bar.lowerSig.length>1) {
			ctx.fillText(unescape("%u"+"E08"+bar.lowerSig[0]), timePos-11, (bar.line*144) + 128);
			ctx.fillText(unescape("%u"+"E08"+bar.lowerSig[1]), timePos+11, (bar.line*144) + 128);
		} else {
			ctx.fillText(unescape("%u"+"E08"+bar.lowerSig), timePos, (bar.line*144) + 128);
		}
		
	}

	ctx.beginPath();
	ctx.strokeStyle = color;
	ctx.lineWidth = 2;
	var baseY = bar.line * 144;

	ctx.moveTo(bar.xPos, baseY + 80);
	ctx.lineTo(bar.xPos, baseY + 144);
	ctx.stroke();
}

function drawAccidental(pos, acc, note, line, sof) {
	var text = "";
	var offset;
	switch(note) {
	case 0:
		if(acc===-1) offset = 136;
		else offset = 80;
		break;
	case 1:
		offset = 104;
		break;
	case 2:
		if(acc === -1) offset = 128;
		else offset = 72;
		break; 
	case 3:
		offset = 96;
		break;
	case 4:
		offset = 120;
		break;
	case 5:
		offset = 88;
		break;
	case 6:
		offset = 112;
		break;

	}

	switch(sof) {
	case 1:
		text = "\u266F"; break;
	case -1:
		text = "\u266D";
		offset -= 6;
		break;
	case 0:
		text = "\u266E";
		break;
	default:
		text = ""; break;
	}

	ctx.font = "80px Musicaf";
	ctx.fillText(text, pos, (line*144)+offset);
}

function drawExtraStaff(x, y, rLine) {
	var line;
	if(y <= -11) {
		for(line = -11; line>=y; line-=2) {
			ctx.beginPath();
			ctx.lineWidth = 1;
			ctx.strokeStyle = "#939393";
			ctx.moveTo(x-5, ((rLine+1)*144) + line * 8 + 9);
			ctx.lineTo(x+25, ((rLine+1)*144) + line * 8 + 9);
			ctx.stroke();
		}
	} else if(y>=1) {
		for(line = 1; line<=y; line+=2) {
			ctx.beginPath();
			ctx.lineWidth = 1;
			ctx.strokeStyle = "#939393";
			ctx.moveTo(x-5, ((rLine+1)*144) + line * 8 + 9);
			ctx.lineTo(x+25, ((rLine+1)*144) + line * 8 + 9);
			ctx.stroke();
		}
	}
}