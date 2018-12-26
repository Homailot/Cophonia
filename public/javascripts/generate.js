function unStretch(line) {
	if(lines[line].changedComplete) {
		lines[line].changedComplete = false;
		lines[line].complete=false;
	}
		
	var startPos;
	if(line === 0) {
		startPos = 180;
	} 
	else {
		startPos = 8;
	}

	for(var bar = 0; bar<bars.length; bar++) {
		if(bars[bar].line === line){
			bars[bar].initPos = startPos;
			startPos += 10;

			if(bars[bar].changedTimeSig) {
				startPos+=35;
			} 
			if(bars[bar].changedOrFirstClef) {
				startPos+=45;
			} 
			if(bars[bar].firstAcc || bars[bar].changedAcc) {
				startPos+=(bars[bar].accidentals+bars[bar].naturals.length)*18;
			}
			var maxDots;
			var hasAcc;
			if(bars[bar].notes.length>0) {
				for(note = 0; note<bars[bar].notes.length; note++) {
					maxDots=bars[bar].notes[note].dots;
					hasAcc=false;

					for(nG=0; nG<bars[bar].notes[note].noteGroups.length; nG++) {
						var objNG = bars[bar].notes[note].noteGroups[nG];
						if(objNG.hideAcc===false) {
							hasAcc=true;
						}
						
					}
					startPos+=5;
					if(hasAcc) startPos+=bars[bar].notes[note].accWidth;
					bars[bar].notes[note].xPos = startPos;
					
					startPos+=40+maxDots*10;
				}
				if(curBar===bar && extended) {
					Marker.xPos=startPos;
					startPos+=40;
				} 
			} else startPos+=40;
			bars[bar].xPos = startPos

			if(bars[bar].xPos >= c.width) {
				lines[bars[bar].line].overflown = true;
			} 
		}
	}
}

function checkAcc(note) {
	for(nG=0; nG<note.noteGroups.length; nG++) {
		if(!note.noteGroups[nG].hideAcc) return true;
	}

	return false;
}

function getSpace(line) {
	var fullSpaceWidth, spaces;
	var totalWidth = c.width-8;
	var objectWidth = 0;
	var nObjects = 0;
	var objectsWidth = [];
	var firstBar = true;

	if(line===0) {
		totalWidth -= 172;
	}

	for(var bar = 0; bar<bars.length; bar++) {
		if(bars[bar].line === line) {
			var startWidth = 5;
			if(bars[bar].changedAcc || bars[bar].firstAcc) startWidth+=(bars[bar].accidentals+bars[bar].naturals.length)*18
			if(bars[bar].changedOrFirstClef || bars[bar].changedClef) startWidth+=45;
			if(bars[bar].changedTimeSig) startWidth+=35;
			if(bars[bar].notes.length===0) startWidth+=40;

			objectsWidth.push(startWidth);
			objectWidth+=startWidth;
			if(!firstBar) nObjects++;
			firstBar = false;

			if(bars[bar].notes.length>0) {
				var noteW = bars[bar].notes[0].width;
				if(checkAcc(bars[bar].notes[0])) noteW+=bars[bar].notes[0].accWidth;
				objectsWidth.push(noteW);
				objectWidth+=noteW;

				for(var note = 1; note<bars[bar].notes.length; note++) {
					noteW = bars[bar].notes[note].width;
					noteW+=bars[bar].notes[note].accWidth;

					objectsWidth.push(noteW);
					objectWidth+=noteW;

					nObjects++;
				}	
			}	

			if(bar === curBar && extended) {
				objectsWidth.push(30);
				objectWidth+=30;
				nObjects++;
			}
		}
	}
	spaces=nObjects+1;
	fullSpaceWidth=totalWidth-objectWidth;
	spaceWidth = fullSpaceWidth/spaces;


	return {sw: spaceWidth, ow: objectsWidth};
}

function stretch(line) {
	//we only stretch if the line is complete or if it overflows the canvas
	if(((lines[line].complete || (bars[curBar].xPos > c.width && curLine === line)) && !lines[line].changedComplete) || lines[line].overflown) {
		var spaceWidth;
		var objectsWidth = [];
		var thisPos = 8;
		if(line===0) {
			thisPos = 180;
		}
		
		var result=getSpace(line);
		objectsWidth=result.ow;
		spaceWidth=result.sw;

		var objectIndex = 0;
		for(var bar = 0; bar<bars.length; bar++) {
			if(bars[bar].line === line) {
				bars[bar].initPos=thisPos;
				thisPos+=objectsWidth[objectIndex];
				objectIndex++;

				if(bars[bar].notes.length>0) {
					bars[bar].notes[0].xPos = (thisPos+bars[bar].notes[0].accWidth);
					thisPos+=objectsWidth[objectIndex];
					objectIndex++;

					for(var note = 1; note<bars[bar].notes.length; note++) {
						thisPos+=spaceWidth;
						bars[bar].notes[note].xPos = (thisPos+bars[bar].notes[note].accWidth)
						
						thisPos+=objectsWidth[objectIndex];
						objectIndex++;
					}
				}

				if(bar===curBar && extended) {
					thisPos+=spaceWidth;
					Marker.xPos = thisPos+objectsWidth[objectIndex]/2;
					thisPos+=objectsWidth[objectIndex];
					objectIndex++;
				}

				if(spaceWidth<0) { 
					bars[bar].xPos = thisPos+10; thisPos+=spaceWidth; 
				} else { 
					thisPos+=spaceWidth; 
					bars[bar].xPos = thisPos; 
				}
			}
		}
	}
}

//this function will stretch the completed bars
function stretchBars() {
	for(var line = 0; line<lines.length; line++) {
		//this is the unstretch block of the code
		unStretch(line);
		
		stretch(line);
	}
}

function updateFirstBars(bar, lineChange) {
	var objBar = bars[bar];

	if(objBar.line !== lineChange) {
		lineChange++;
		if(!objBar.changedOrFirstClef) {
			objBar.changedOrFirstClef = true;
		}
		if(!objBar.changedAcc && !objBar.firstAcc) {
			objBar.firstAcc = true;
		}
		
	} else {
		if(objBar.changedOrFirstClef && !objBar.changedClef) {
			objBar.changedOrFirstClef = false;
		}
		if(objBar.firstAcc && !objBar.changedAcc) {
			objBar.firstAcc = false;
		}
	}

	return lineChange;
}

function checkBarCompletion(bar) {
	var objBar = bars[bar];
	var objLine = lines[objBar.line];
	
	if(objLine.bars===4 || (objLine.bars===3 && bars[bar].line === 0)) {
		objLine.complete=true;
	}
	
	else if(bars[bar].xPos >= c.width) {
		objLine.overflown = true;
	} else {
		if(objLine.overflown) {
			objLine.changedComplete=true;
		} 
		objLine.overflown = false;	
	}
}

function getBeamGroups(bar) {
	var beamGroups = new Array();
	var objBar = bars[bar];

	//we just say we are going to create a new group so that we don't create unecessary groups
	sum = getSum(bar);
	var newGroup=true;

	//sigSum is the sum of each group, each group has a consistent duration, so we need to know the sum
	var sigSum = 0;
	for(var note = 0; note< objBar.notes.length; note++) { 
		var objNote = objBar.notes[note];
		//add to the sum
		sigSum+=getNoteDuration(objNote);
		//if the bar is compound it makes the bar duration 3 times the lower signature
		mult = 1;
		if(objBar.upperSig === 6 || objBar.upperSig === 9 || objBar.upperSig === 12) mult = 3;

		//we only create a new group if newGroup = true and if the note has lower duration than a quarter note
		if(getNoteDuration(objNote) >= 0.25 || objNote.isSpace) {
			drawFigure(objNote);
			//if the notes is quarter note or higher it creates a new group
			newGroup = true;
		} else {
			//if we are creating a new group it creates it
			if(newGroup) {
				beamGroups.push(new Array());

				newGroup = false;
			}

			beamGroups[beamGroups.length-1].push(objNote);
		}

		//this just resets the sum if it is lower than the defined duration
		while(sigSum >= 1/objBar.lowerSig * mult) {
			sigSum -= 1/objBar.lowerSig * mult;

			//again, just says that we are making a new group
			newGroup = true;
		}
	}

	return beamGroups;
}

function getFarthest(beamGroups, group, note, farthest) {
	var objNote = beamGroups[group][note];

	if(Math.abs(farthest - (-3))<Math.abs(objNote.pos - (-3))) {
		return objNote.pos;
	} else return farthest;

}

function getShortest(beamGroups, group, note, shortest) {
	if(note === 0) shortest =beamGroups[group][note].duration
	else if(beamGroups[group][note].duration < shortest) shortest = beamGroups[group][note].duration

	return shortest;
}

function getDirection(beamGroups, group) {
	var asc=false;
	var desc=false;

	//this block compares the first and last notes of the group, this will define if the beam ascends or descends
	var interval;
	var biggestInterval;
	var big;
	var pos1;
	var pos2;
	var notes = beamGroups[group].length;

	for(n=0; n<beamGroups[group][0].noteGroups.length; n++) {
		for(n2=0; n2<beamGroups[group][notes-1].noteGroups.length; n2++) {
			big = false;

			interval = Math.abs(beamGroups[group][0].noteGroups[n].pos - beamGroups[group][notes-1].noteGroups[n2].pos);
			if(n===0 && n2 === 0) big=true;
			else if(interval > biggestInterval) big=true;

			if(big) {
				biggestInterval = interval;
				pos1 = beamGroups[group][0].noteGroups[n].pos;
				pos2 = beamGroups[group][notes-1].noteGroups[n2].pos;
			}
		}
	}
	if(pos1 > pos2) asc= true;
	else if(pos1 < pos2) desc = true;

	return {asc: asc, desc: desc}
}

function getYStart(beamGroups, group, inverse, shortest) {
	var beamOffset=-33;
	var mult=-1
	if(inverse) {
		beamOffset=53;
		mult=1;
	}
	var proceed = false;
	var yStart=0;

	for(var note = 0; note < beamGroups[group].length; note++) {
		drawHead(beamGroups[group][note], inverse);
		//finally, we define the y pos of the beam. in this case we check for the note farthest away from all the others, so that the beam isn't drawn on top of the head
		for(n=0; n<beamGroups[group][note].noteGroups.length; n++) {
			proceed = false;

			if(inverse) {
				if((note === 0 && n===0) || beamGroups[group][note].noteGroups[n].yPos+beamOffset >= yStart ) proceed = true;
			} else if((note === 0 && n===0)|| beamGroups[group][note].noteGroups[n].yPos+beamOffset <= yStart ) proceed = true;
			if(proceed) {
				yStart = beamGroups[group][note].noteGroups[n].yPos+beamOffset;
				switch(shortest){
					case 0.0625:
						yStart+=10*mult;
						break;
					case 0.03125:
						yStart+=20*mult;
						break;
				}
			}
		} 		
	}

	return yStart;
}

function getYEnd(yStart, asc, desc) {
	var yEnd=0;
	//defines the y ending of the beam, depending if it is ascending or descending
	if(asc) yEnd = yStart - 10;
	else if(desc) yEnd = yStart + 10;
	else yEnd = yStart;

	return yEnd;
}

function defineStem(beamGroups, group, note, line, inverse) {
	var xP = getYFromX(line.m, line.b, beamGroups[group][note].xPos+16);

	for(n=0; n<beamGroups[group][note].noteGroups.length; n++) {
		var height = Math.abs(beamGroups[group][note].noteGroups[n].yPos - xP);
		
		drawStem(beamGroups[group][note], height, inverse, n);
	}
}

function getBeamLimits(beamGroups, group, note, startBeam, endBeam) {
	var durations=[0.0625, 0.03125];

	for(beam=0; beam<2; beam++) {
		if(beamGroups[group][note].duration <= durations[beam]) {
			if(startBeam[beam] === -1) startBeam[beam] = beamGroups[group][note].xPos+15;
			if(startBeam[beam] !== -1 && note+1<beamGroups[group].length && beamGroups[group][note+1].duration > durations[beam]) endBeam[beam] = beamGroups[group][note].xPos+15
		}
	}
	
	
	if(note===beamGroups[group].length-1) {
		if(startBeam[1]!==-1) endBeam[1] = beamGroups[group][note].xPos+15;
		if(startBeam[0]!==-1)  endBeam[0] = beamGroups[group][note].xPos+15;
	}
}

function defineSmallBeams(beamGroups, group, note, startBeam, endBeam, beam) {
	if(startBeam[beam] === endBeam[beam]) {
		if(note!==0 && note+1<beamGroups[group].length) {
			if(beamGroups[group][note+1].duration<=beamGroups[group][note-1].duration) endBeam[beam] = (beamGroups[group][note+1].xPos - beamGroups[group][note].xPos)/2 + beamGroups[group][note].xPos + 15
			else if (beamGroups[group][note+1].duration>beamGroups[group][note-1].duration) endBeam[beam] = (beamGroups[group][note].xPos - beamGroups[group][note-1].xPos)/2 + beamGroups[group][note-1].xPos +15	
		} 
		else if(note===0){
			endBeam[beam] = (beamGroups[group][note+1].xPos - beamGroups[group][note].xPos)/2 + beamGroups[group][note].xPos + 15
		}
		else endBeam[beam] = (beamGroups[group][note].xPos - beamGroups[group][note-1].xPos)/2 + beamGroups[group][note-1].xPos +15		
	}
}

function defineLowerBeams(beamGroups, group, line, inverse) {
	var startBeam = new Array(-1, -1);
	var endBeam = new Array(-1, -1);

	for(var note = 0; note<beamGroups[group].length; note++) {
		defineStem(beamGroups, group, note, line, inverse);

		getBeamLimits(beamGroups, group, note, startBeam, endBeam);

		for(var beam = 0; beam<2; beam++) {
			if(endBeam[beam]!==-1) {
				defineSmallBeams(beamGroups, group, note, startBeam, endBeam, beam);

				m=1
				if(inverse) {
					startBeam[beam]-=10;
					endBeam[beam] -=10;
					m = -1
				}

				yStart = getYFromX(line.m, line.b+10*(beam+1)*m, startBeam[beam]);
				yEnd = getYFromX(line.m, line.b+10*(beam+1)*m, endBeam[beam]);

				drawBeam(startBeam[beam], yStart, endBeam[beam], yEnd);
				startBeam[beam] =-1; endBeam[beam] = -1;
			}
		}
		
	}
}

function defineBeams(beamGroups) {
	//finally we go through each group to draw the beams
	for(var group = 0; group < beamGroups.length; group++) {
		var notes = beamGroups[group].length;
		var asc = false;
		var desc = false;

		//we only draw a beam if there are more than one note
		if(notes>=2) {
			var inverse;
			var shortest;
			var farthest=beamGroups[group][0].pos;

			//this loop checks which note is the farthest from the center line. that note will define if the beam is upside down
			for(var note = 0; note < notes; note++) {
				farthest=getFarthest(beamGroups, group, note, farthest);
			
				shortest=getShortest(beamGroups, group, note, shortest);

				if(inverse) drawDot(beamGroups[group][note], true);
				else drawDot(beamGroups[group][note], false);
			}

			var result = getDirection(beamGroups, group);
			asc=result.asc;
			desc=result.desc;	

			//we define the x positions of the beam, making some adjustments if the beam is inverted
			var xStart = beamGroups[group][0].xPos+14;
			var xEnd = beamGroups[group][notes-1].xPos+16;
			
			if(farthest<-3) {
				xStart-=10;
				xEnd -=10;
				inverse=true;
			} else {
				inverse=false;
			}
			var yStart = getYStart(beamGroups, group, inverse, shortest);
			var yEnd = getYEnd(yStart, asc, desc);
			
			//here, we get the length of each note's stem and draw it
			var line = new LineFunction(xStart, yStart, xEnd, yEnd);

			//finally, we draw the beam
			drawBeam(xStart, yStart, xEnd, yEnd);

			defineLowerBeams(beamGroups, group, line, inverse);
			
		} else drawFigure(beamGroups[group][0])
	}
}

function getExtremes(line) {
	var highest=null;
	var lowest=null;

	for(var bar=0; bar<bars.length; bar++) {
		if(bars[bar].line===line) {
			for(var note=0; note<bars[bar].notes.length; note++) {
				for(var nG=0; nG<bars[bar].notes[note].noteGroups.length; nG++) {
					var nGObj = bars[bar].notes[note].noteGroups[nG];

					if(highest===null) highest = nGObj.pos;
					else if(nGObj.pos<highest) highest=nGObj.pos;

					if(lowest===null) lowest = nGObj.pos;
					else if(nGObj.pos>lowest) lowest=nGObj.pos;
				}
			}
		} 
	}

	return {highest: highest, lowest: lowest};
}

//this is the main update function
function generateAll() {
	var lineChange = -1;
	var totalYOffset = 0;
	var changedYOff=false;

	for(var line = 0; line<lines.length; line++) {
		var result = getExtremes(line);
		var highest = result.highest;
		var lowest = result.lowest;
		if(!changedYOff) lines[line].yOffset=0;
		changedYOff=false;

		if(highest<=-6) {
			lines[line].yOffset+=(Math.abs(highest + 6) + 1 ) * 10;
		} 

		if(lowest>=0 && line+1<lines.length) {
			lines[line+1].yOffset=(Math.abs(lowest) + 1 ) * 10;
			changedYOff=true;
		}
	}

	for(var bar = 0; bar<bars.length; bar++) {
		lineChange = updateFirstBars(bar, lineChange);
		
		checkBarCompletion(bar);
	}

	//this function will define the x positions of the streched bars
	stretchBars();

	//this will clear everything on the canvas
	ctx.clearRect(0, 0, c.width, 100000);
	var groupChange = false;
	
	var firstLine=0;
	for(var bar = 0; bar < bars.length; bar++) {
		//the beamGroups define the groups of eigth plus notes to be grouped with beams
		var beamGroups = new Array();
		

		//sets the color to red if the sum is wrong
		var color="";
		if(curBar!==bar && sum!==bars[curBar].upperSig/bars[curBar].lowerSig) {
			color = "#FF0000";
		}
		else {
			color = "#000000";
		} 
		
		if(firstLine===bars[bar].line) {
			ctx.translate(0, lines[bars[bar].line].yOffset);
			totalYOffset+=lines[bars[bar].line].yOffset;
			firstLine++;
		}
		//draws the staff for this bar, and then the bar itself
		drawStaff(bars[bar].line, bars[bar].initPos, bars[bar].xPos, color);
		drawBar(bars[bar], color);

		beamGroups = getBeamGroups(bar);
		defineBeams(beamGroups);
	}

	saveCanvas();
	ctx.translate(0, -totalYOffset);
	drawMarker(y);
}