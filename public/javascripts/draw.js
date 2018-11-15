function drawStaff(line, end, start, color) {
	ctx.beginPath(); 
	ctx.lineWidth = 1;
	ctx.strokeStyle = color;
	baseY = line * 144;

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

function drawFigure(note) {
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

		return;
	}
	if(note.noteGroups.length>1) {
		var inv = note.noteGroups[0];
		var farthest;

		for(n=1; n<note.noteGroups.length; n++) {
			if(Math.abs(inv.pos - (-3)) < Math.abs(note.noteGroups[n].pos - (-3))) inv = note.noteGroups[n];
		}
		farthest=inv;
		for(n=0; n<note.noteGroups.length; n++) {
			if(Math.abs(inv.pos - note.noteGroups[n].pos)>Math.abs(farthest.pos - inv.pos)) farthest = note.noteGroups[n];
		}

		drawHead(note, inv.pos);
		for(n=0; n<note.noteGroups.length; n++) {
			note.noteGroups[n].yPos = ((note.line+1) * 144 - 2 ) + note.noteGroups[n].pos * 8 -14;
			drawExtraStaff(note.xPos, note.noteGroups[n].pos-2, note.line);
			var height = Math.abs(note.noteGroups[n].yPos - farthest.yPos) + 4;
			if(note.noteGroups[n].pos != farthest.pos) drawStem(note, height+2, inv.pos, n);
			else  drawStem(note, 32, inv.pos, n)
		}

		ctx.save();
		ctx.translate(note.xPos+19, farthest.yPos);
		ctx.font = "69px Musicaf";

		if(inv.pos<-3) {
			ctx.rotate(Math.PI);
			ctx.translate(17, -14);
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

		if(text!= "") ctx.fillText(text, 0, 0)

		ctx.restore();
	} else {
		note.noteGroups[0].yPos = ((note.line+1) * 144 - 2 ) + note.noteGroups[0].pos * 8 - 14;
		drawExtraStaff(note.xPos, note.noteGroups[0].pos-2, note.line);


		ctx.save();
		ctx.translate(note.xPos, note.noteGroups[0].yPos);
		ctx.font = "69px Musicaf";

		if(note.noteGroups[0].pos<-3) {
			ctx.rotate(Math.PI);
			ctx.translate(-20, -15);
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

		ctx.fillText(text, 0, 0)

		ctx.restore();	
	}
	
}

function drawStem(note, height, inverse, noteGroup) {
	ctx.beginPath();

	ctx.save();
	ctx.translate(note.xPos-1, note.noteGroups[noteGroup].yPos+10);
	ctx.strokeStyle = "#000000";
	ctx.lineWidth = 2;
	//height+=2;

	if(inverse < -3) {
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
	for(n = 0; n<note.noteGroups.length; n++) {
		drawExtraStaff(note.xPos, note.noteGroups[n].pos-2, note.line);
		note.noteGroups[n].yPos = ((note.line+1) * 144 - 2 ) + note.noteGroups[n].pos * 8 - 14;

		ctx.save();
		ctx.translate(note.xPos, note.noteGroups[n].yPos);
		ctx.font = "69px Musicaf";

		if(inverse<-3) {
			ctx.rotate(Math.PI);
			ctx.translate(-20, -15);
		}

		if(note.duration<=0.25) ctx.fillText("\uD834\uDD58", 0, 0);
		else if(note.duration == 0.5) ctx.fillText("\uD834\uDD57", 0, 0);
		else if(note.duration == 1) ctx.fillText("\uD834\uDD5D", 0, 0);
		ctx.restore();
	}
}

function drawBeam(xStart, yStart, xEnd, yEnd) {
	ctx.beginPath(); 
	ctx.strokeStyle = "#000000";
	ctx.lineWidth = 5;

	ctx.moveTo(xStart, yStart);
	ctx.lineTo(xEnd, yEnd);
	ctx.stroke();
}

function drawMarker(y) {
	if(curNote == 0) {
		Marker.xPos = bars[curBar].initPos+10;

		if(bars[curBar].changedTimeSig) Marker.xPos +=35
		if(bars[curBar].changedOrFirstClef) Marker.xPos += 45
		if(bars[curBar].changedAcc || bars[curBar].firstAcc) {
			Marker.xPos += (bars[curBar].accidentals) * 18;
		}

	}
	else if(!extended) {
		Marker.xPos = bars[curBar].notes[curNote].xPos;
	}
	drawExtraStaff(Marker.xPos, y, curLine);

	ctx.beginPath();
	ctx.lineWidth = 1;
	ctx.strokeStyle = "#000000";
	ctx.globalAlpha = 0.2;
	ctx.fillStyle = '#00FF3C'
	ctx.fillRect(Marker.xPos, ((curLine+1)*144) + y * 8 - 5, 20, 26);
	ctx.rect(Marker.xPos, ((curLine+1)*144) + y * 8 - 5, 20, 26);
	ctx.globalAlpha = 1;
	ctx.stroke();
}

function drawHeader(x, line) {
	ctx.beginPath();

	ctx.lineWidth=2;
	ctx.strokeStyle = "#0505FF";
	ctx.moveTo(x+11, ((line+1)*144) - 90);
	ctx.lineTo(x+11, ((line+1)*144) + 30);
	ctx.stroke();
	ctx.globalAlpha=1;
}

function drawBar(bar, color) {
	ctx.fillStyle = "#000000"
	timePos = bar.initPos
	
	if(bar.changedOrFirstClef) {
		drawClef(bar.clef, bar.initPos, bar.line);

		timePos += 45;
	}
	var accidentalSum = bar.accidentals;
	for(var i = 1; i<=accidentalSum; i++) {
		var acc = i-1;
		if(bar.sharpOrFlat==-1) acc = 7-i
		if(bar.firstAcc || bar.changedAcc) drawAccidental(timePos+(i-1)*18, bar.sharpOrFlat, acc, bar.line);
	}

	timePos+=(accidentalSum) * 18 + 4;
	if(bar.changedTimeSig) {
		ctx.font = "48px Calibri";
		texto = bar.upperSig;
		ctx.fillText(texto, timePos, (bar.line*144) + 111);
		texto = bar.lowerSig;
		ctx.fillText(texto, timePos, (bar.line*144) + 144)
	}

	ctx.beginPath();
	ctx.strokeStyle = color;
	ctx.lineWidth = 2;
	baseY = bar.line * 144;

	ctx.moveTo(bar.xPos, baseY + 80);
	ctx.lineTo(bar.xPos, baseY + 144);
	ctx.stroke();
}

function drawAccidental(pos, acc, note, line) {
	var text = "";
	var offset;
	switch(note) {
		case 0:
			if(acc==-1) offset = 136;
			else offset = 80;
			break;
		case 1:
			offset = 104;
			break;
		case 2:
			if(acc == -1) offset = 128;
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

	switch(acc) {
		case 1:
			text = "\u266F"; break;
		case -1:
			text = "\u266D";
			offset -= 6;
			break;
		default:
			text = ""; break;
	}

	ctx.font = "80px Musicaf";
	ctx.fillText(text, pos, (line*144)+offset)
}

function drawExtraStaff(x, y, rLine) {
	if(y <= -11) {
		for(line = -11; line>=y; line-=2) {
			ctx.beginPath();
			ctx.lineWidth = 1;
			ctx.strokeStyle = "#000000";
			ctx.moveTo(x-5, ((rLine+1)*144) + line * 8 + 9);
			ctx.lineTo(x+25, ((rLine+1)*144) + line * 8 + 9);
			ctx.stroke();
		}
	} else if(y>=1) {
		for(line = 1; line<=y; line+=2) {
			ctx.beginPath();
			ctx.lineWidth = 1;
			ctx.strokeStyle = "#000000";
			ctx.moveTo(x-5, ((rLine+1)*144) + line * 8 + 9);
			ctx.lineTo(x+25, ((rLine+1)*144) + line * 8 + 9);
			ctx.stroke();
		}
	}
}