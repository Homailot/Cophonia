//this is the main update function
function generateAll() {
	var accSum = 0;
	lineChange = -1;
	for(bar = 0; bar<bars.length; bar++) {
		if(bars[bar].xPos >= c.width) {
			lines[bars[bar].line].overflown = true;
		} else {
			lines[bars[bar].line].overflown = false;
		}
		if(bars[bar].line != lineChange) {
			lineChange++;
			if(!bars[bar].changedOrFirstClef) {
				bars[bar].changedOrFirstClef = true;
				moveWith(45, 0, bar);
			}
			if(!bars[bar].changedAcc && !bars[bar].firstAcc) {
				bars[bar].firstAcc = true;
				accSum+=bars[bar].accidentals*18;
				moveWith(accSum+10, 0, bar);
			}
			
		} else {
			if(bars[bar].changedOrFirstClef && !bars[bar].changedClef) {
				bars[bar].changedOrFirstClef = false;
				moveWith(-45, 0, bar);
			}
			if(bars[bar].firstAcc && !bars[bar].changedAcc) {
				bars[bar].firstAcc = false;
				accSum+=bars[bar].accidentals*18;
				moveWith(-accSum, 0, bar);
			}
		} 
	}

	//this function will define the x positions of the streched bars
	stretchBars();

	//this will clear everything on the canvas
	ctx.clearRect(0, 0, c.width, 100000);
	groupChange = false;
	
	for(bar = 0; bar < bars.length; bar++) {
		//the beamGroups define the groups of eigth plus notes to be grouped with beams
		beamGroups = new Array();
		//we just say we are going to create a new group so that we don't create unecessary groups
		newGroup = true;
		sum = getSum(bar);

		//sets the color to red if the sum is wrong
		if(curBar!=bar && sum!=bars[curBar].upperSig/bars[curBar].lowerSig) color = "#FF0000";
		else color = "#000000"

		//draws the staff for this bar, and then the bar itself
		drawStaff(bars[bar].line, bars[bar].initPos, bars[bar].xPos, color);
		drawBar(bars[bar], color);

		//sigSum is the sum of each group, each group has a consistent duration, so we need to know the sum
		sigSum = 0;
		for(note = 0; note< bars[bar].notes.length; note++) { 
			//add to the sum
			sigSum+=bars[bar].notes[note].duration;
			//if the bar is compound it makes the bar duration 3 times the lower signature
			mult = 1;
			if(bars[bar].upperSig == 6 || bars[bar].upperSig == 9 || bars[bar].upperSig == 12) mult = 3;

			//this just resets the sum if it is lower than the defined duration
			while(sigSum > 1/bars[bar].lowerSig * mult) {
				sigSum -= 1/bars[bar].lowerSig * mult;

				//again, just says that we are making a new group
				newGroup = true;
			}

			//we only create a new group if newGroup = true and if the note has lower duration than a quarter note
			if(bars[bar].notes[note].duration > 0.125 || bars[bar].notes[note].isSpace) {
				drawFigure(bars[bar].notes[note]);
				//if the notes is quarter note or higher it creates a new group
				newGroup = true;
			} else {
				//if we are creating a new group it creates it
				if(newGroup) {
					beamGroups.push(new Array());

					newGroup = false;
				}

				beamGroups[beamGroups.length-1].push(bars[bar].notes[note]);
			}
		}

		//finally we go through each group to draw the beams
		for(group = 0; group < beamGroups.length; group++) {
			notes = beamGroups[group].length;
			asc = false;
			desc = false;

			//we only draw a beam if there are more than one note
			if(notes>=2) {
				//this loop checks which note is the farthest from the center line. that note will define if the beam is upside down
				for(note = 0; note < notes; note++) {
					for(n=0; n<beamGroups[group][note].noteGroups.length; n++) {
						if(note==0 && n==0) inverse = beamGroups[group][note].pos;
						else if(Math.abs(beamGroups[group][note].noteGroups[n].pos - (-3)) > Math.abs(inverse - (-3))) {
							inverse = beamGroups[group][note].noteGroups[n].pos;
						}
					}

					if(note == 0) shortest = beamGroups[group][note].duration
					else if(beamGroups[group][note].duration < shortest) shortest = beamGroups[group][note].duration
				}

				//this block compares the first and last notes of the group, this will define if the beam ascends or descends
				var interval;
				var biggestInterval;
				var big;
				var pos1;
				var pos2;
				for(n=0; n<beamGroups[group][0].noteGroups.length; n++) {
					for(n2=0; n2<beamGroups[group][notes-1].noteGroups.length; n2++) {
						big = false;

						interval = Math.abs(beamGroups[group][0].noteGroups[n].pos - beamGroups[group][notes-1].noteGroups[n2].pos);
						if(n==0 && n2 == 0) big=true;
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

				//we define the x positions of the beam, making some adjustments if the beam is inverted
				xStart = beamGroups[group][0].xPos+14;
				xEnd = beamGroups[group][notes-1].xPos+16;
				var beamOffset=-38;
				var mult=-1
				if(inverse < -3) {
					xStart-=10;
					xEnd -=10;
					beamOffset=48;
					mult=1;
				}
				yStart = 0;
				var proceed = false;

				for(note = 0; note < beamGroups[group].length; note++) {
					drawHead(beamGroups[group][note], inverse);
					//finally, we define the y pos of the beam. in this case we check for the note farthest away from all the others, so that the beam isn't drawn on top of the head
					for(n=0; n<beamGroups[group][note].noteGroups.length; n++) {
						proceed = false;

						if(inverse<-3) {
							if((note == 0 && n==0) || beamGroups[group][note].noteGroups[n].yPos+beamOffset >= yStart ) proceed = true;
						} else if((note == 0 && n==0)|| beamGroups[group][note].noteGroups[n].yPos+beamOffset <= yStart ) proceed = true;
						if(proceed) {
							yStart = beamGroups[group][note].noteGroups[n].yPos+beamOffset;
							switch(shortest) {
								case 0.0625:
									yStart+=10*mult; break;
								case 0.03125:
									yStart+=20*mult; break;
							}
						}
					}  
				}

				//defines the y ending of the beam, depending if it is ascending or descending
				if(asc) yEnd = yStart - 10;
				else if(desc) yEnd = yStart + 10;
				else yEnd = yStart;
				//here, we get the length of each note's stem and draw it
				line = new LineFunction(xStart, yStart, xEnd, yEnd);

				//finally, we draw the beam
				drawBeam(xStart, yStart, xEnd, yEnd);
				startBeam = new Array(-1, -1);
				endBeam = new Array(-1, -1);

				for(note = 0; note<beamGroups[group].length; note++) {
					xP = getYFromX(line.m, line.b, beamGroups[group][note].xPos+16);
					case1=false;
					case2=false;

					for(n=0; n<beamGroups[group][note].noteGroups.length; n++) {
						height = Math.abs(beamGroups[group][note].noteGroups[n].yPos - xP);

						drawStem(beamGroups[group][note], height, inverse, n);
					}

					if(beamGroups[group][note].duration <= 0.0625) {
						if(startBeam[0] == -1) startBeam[0] = beamGroups[group][note].xPos+15
						if(startBeam[0] != -1 && note+1<beamGroups[group].length && beamGroups[group][note+1].duration > 0.0625) endBeam[0] = beamGroups[group][note].xPos+15
					}
					if(beamGroups[group][note].duration == 0.03125) {
						if(startBeam[1] == -1) startBeam[1] = beamGroups[group][note].xPos+15;
						if(startBeam[1] != -1 && note+1<beamGroups[group].length && beamGroups[group][note+1].duration > 0.03125) endBeam[1] = beamGroups[group][note].xPos+15
					}

					if(note==beamGroups[group].length-1) {
						if(startBeam[1]!=-1) endBeam[1] = beamGroups[group][note].xPos+15;
						if(startBeam[0]!=-1)  endBeam[0] = beamGroups[group][note].xPos+15;
					}

					if(endBeam[0]!=-1) {
						if(startBeam[0] == endBeam[0]) {
							if(note+1<beamGroups[group].length) endBeam[0] = (beamGroups[group][note+1].xPos - beamGroups[group][note].xPos)/2 + beamGroups[group][note].xPos + 15
							else endBeam[0] = (beamGroups[group][note].xPos - beamGroups[group][note-1].xPos)/2 + beamGroups[group][note-1].xPos +15		
						}

						m=1
						if(inverse < -3) {
							startBeam[0]-=10;
							endBeam[0] -=10;
							m = -1
						}

						yStart = getYFromX(line.m, line.b+10*m, startBeam[0]);
						yEnd = getYFromX(line.m, line.b+10*m, endBeam[0]);

						drawBeam(startBeam[0], yStart, endBeam[0], yEnd);
						startBeam[0] =-1; endBeam[0] = -1;
					}
					if(endBeam[1]!=-1) {
						if(startBeam[1] == endBeam[1]) {
							if(note+1<beamGroups[group].length) endBeam[1] = (beamGroups[group][note+1].xPos - beamGroups[group][note].xPos)/2 + beamGroups[group][note].xPos + 15
							else endBeam[1] = (beamGroups[group][note].xPos - beamGroups[group][note-1].xPos)/2 + beamGroups[group][note-1].xPos +15		
						}

							m=1
						if(inverse < -3) {
							startBeam[1]-=10;
							endBeam[1] -=10;
							m = -1
						}
						yStart = getYFromX(line.m, line.b+20*m, startBeam[1]);
						yEnd = getYFromX(line.m, line.b+20*m, endBeam[1]);

						drawBeam(startBeam[1], yStart, endBeam[1], yEnd);
						startBeam[1]=-1; endBeam[1] = -1;
					}
					
				}
			} else drawFigure(beamGroups[group][0])
		}
	}

	saveCanvas();
	drawMarker(y);
}

//problema remove note!

//this function will stretch the completed bars
function stretchBars() {
	for(line = 0; line<lines.length; line++) {
		//this is the unstretch block of the code
		if(lines[line].changedComplete) {
			console.log("ee");
			lines[line].changedComplete = false;
			var startPos;
			if(line == 0) startPos = 180;
			else startPos = 8;

			for(bar = 0; bar<bars.length; bar++) {
				if(bars[bar].line == line){
					bars[bar].initPos = startPos;
					startPos += 10;

					if(bars[bar].changedTimeSig) startPos+=35
					if(bars[bar].changedOrFirstClef) startPos+=45
					if(bars[bar].firstAcc || bars[bar].changedAcc) {
						startPos+=bars[bar].accidentals*18
					}
				
					if(bars[bar].notes.length>0) {
						bars[bar].notes[0].xPos = startPos;				 

						for(note = 1; note<bars[bar].notes.length; note++) {
							bars[bar].notes[note].xPos = bars[bar].notes[note-1].xPos + 40;
							startPos+=40;
						}
					}
					startPos+=40
					bars[bar].xPos = startPos
				}
			}

			lines[line].complete = false;
		}
		//we only stretch if the line is complete or if it overflows the canvas
		if(((lines[line].complete || (bars[curBar].xPos > c.width && curLine == line)) && !lines[line].changedComplete) || lines[line].overflown) {
			firstBar = true;

			//size is the total xSize of the line, add is how much to the right the line is offset, spaces is the number of things to be stretched
			n=0;
			if(line == 0) {
				size = (c.width-190);
				add = 190;
				spaces = lines[line].bars;
			} 
			else {
				spaces = lines[line].bars;
				add = 10;
				size = c.width-10;
			}

			//if the bar is extended then we have one more thing to stretch
			if(curLine == line && extended) spaces +=1
			
			//foreach bar in that line.
			for(bar = 0; bar < bars.length; bar++) {
				if(bars[bar].line == line) {
					//we add a space per note in the bar.
					if(bars[bar].notes.length>1) spaces+=bars[bar].notes.length-1;
					if(bar+1<bars.length && bars[bar+1].line != line) break;
				}
			}

			//foreach bar in the line
			for(bar = 0; bar<bars.length; bar++)  {
				if(bars[bar].line == line) {
					//we only change the init position if the bar is not the first of the line.
					if(n!=0)bars[bar].initPos = (n)/spaces * size + add;
					n++;	

					for(note = 0; note< bars[bar].notes.length; note++) {
						//the first note is just simply put a bit ahead the initial position of the bar, the rest are stretched.
						if(note == 0) {
							bars[bar].notes[note].xPos = bars[bar].initPos + 10;
							size -=10; add+=10;
							if(bars[bar].changedTimeSig) {
								bars[bar].notes[note].xPos+=35
								size -=35; add+=35;
							} 
							if(bars[bar].changedOrFirstClef){
								bars[bar].notes[note].xPos+= 45
								size -=45; add+=45;
							} 
							if(bars[bar].changedAcc || bars[bar].firstAcc) {
								bars[bar].notes[note].xPos+=bars[bar].accidentals*18;
								size-=bars[bar].accidentals*18; add+=bars[bar].accidentals*18;
							}
							
							continue;
						}
						bars[bar].notes[note].xPos = n/(spaces) * size + add;
						n++;
					}
					//we also stretch the marker's position
					if(bar == curBar && extended) {
						Marker.xPos = n/spaces * size + add;
						n++;
					}


					bars[bar].xPos = n/spaces * size + add;
				}
			}
		}
	}
}