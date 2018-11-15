var newGroup = false;
var ctrlPress = false;
document.addEventListener('keydown', function(event) {
	//simple code that checks what key was pressed and executes a function
	if(!playing) {
		switch(event.code) {
			case 'Enter':
				newGroup = false;

				//check to see if the current note the marker is on is a pause, if it is, it deletes it
				if(curNote < bars[curBar].notes.length) {
					if(!bars[curBar].notes[curNote].isSpace) {
						for(n = 0; n<bars[curBar].notes[curNote].noteGroups.length; n++) {
							if(bars[curBar].notes[curNote].noteGroups[n].pos == y+2) return;
						}
						
						setMarker(false, true);
						generateAll();
						return;
					}
					if(bars[curBar].notes[curNote].isSpace) bars[curBar].notes.splice(curNote, 1);
				} 
				extended = false;
				setMarker(false, false);
				
				generateAll();
				break;
			case 'Backspace':
				deleteNote();
				
				generateAll();
				break;
			case 'Space':
			 	insertBeat();

			 	generateAll();
				break;
			case 'Delete':
				if(ctrlPress) {
					deleteBar();

					generateAll();
				}
				
				break;
			case 'ArrowRight':
				moveRight();

							
				event.preventDefault();
				break;
			case 'ArrowLeft':
				moveLeft();

				
				event.preventDefault();
				break;
			case 'ArrowUp':
				changePitch(-1);
				event.preventDefault();
				
				break;
			case 'ArrowDown':
				changePitch(1)
				event.preventDefault();
				break;
			case 'Digit1':
				curDuration = 1;
				changeDuration(curNote, curDuration);
				break;
			case 'Digit2':
				curDuration = 0.5;
				changeDuration(curNote, curDuration);
				break;
			case 'Digit3':
				curDuration = 0.25;
				changeDuration(curNote, curDuration);
				break;
			case 'Digit4':
				curDuration = 0.125;
				changeDuration(curNote, curDuration);
				break;
			case 'Digit5':
				curDuration = 0.0625;
				changeDuration(curNote, curDuration);
				break;
			case 'Digit6':
				curDuration = 0.03125;
				changeDuration(curNote, curDuration);
				break;
			case 'KeyK':
				playingBar = 0;
				playingNote = 0;
				playingTime = 0;
				clearTimeout(time)
				play();
				break;
			case 'KeyT':
				if(ctrlPress) {
					changeTimeSigPop(curBar);
				}

				break;
			case 'ShiftLeft':
			case 'ShiftRight':
				ctrlPress = true;
				break;
		}
	} else {
		switch(event.code) {
			case 'KeyK':
				clearTimeout(time);
				restoreCanvas(); playing=false;
				break;
		}
	}
})

document.addEventListener("keyup", function(event) {
	switch(event.code) {
		case 'ShiftLeft':
		case 'ShiftRight':
			ctrlPress = false;
			break;
	}
})

document.addEventListener("mousewheel", function(event) {
	if(!playing) {
		var distance = -event.deltaY*0.2;
		
		if(scrollValue+event.deltaY*0.2<0) {
			distance= (scrollValue);

			scrollValue=0;
		} else scrollValue += event.deltaY*0.2;
		ctx.translate(0, distance);
		
		generateAll()
		
	}
	event.preventDefault();
})

//a more fitting name would be place/remove pause
function deleteNote() {
	//only deletes a note if it exists
	if(curNote < bars[curBar].notes.length) {
		isSpace = bars[curBar].notes[curNote].isSpace;

		//deletes the note
		var diff = bars[curBar].notes[curNote].xPos;
		bars[curBar].notes.splice(curNote, 1);

		if(!isSpace) {
			//if it was a note, it replaces it with a pause (hence the 'true')
			setMarker(true, false);
		} else {
			//if it was a pause, it moves everything back by 40 px.
			if(curNote != 0) {
				diff-=bars[curBar].notes[curNote-1].xPos;
				moveWith(-diff, curNote, curBar)
				Marker.xPos = bars[curBar].notes[curNote-1].xPos;
				curNote--;
			} 

			var lastBar = 0;
			for(line = 0; line<lines.length; line++)  {
				lastBar+=lines[line].bars;
				if(line == curLine) break;
			}

			if(lines[curLine].overflown && bars[lastBar-1].xPos<c.width) {
				lines[curLine].changedComplete = true;
			}
		}

		
	} else setMarker(true, false);
	
	//says the bar is not extended
	extended = false;
}

function deleteBar() {
	//only deletes a bar if it isn't the first one
	var line = bars[curBar].line
	if(curBar > 0) {

		//if a note exists on the bar before, it places the marker on it
		if(bars[curBar-1].notes.length > 0) Marker.xPos = bars[curBar-1].notes[0].xPos;
		else {

			//if not it just places it on the bar's starting position
			Marker.xPos = bars[curBar-1].initPos;
			//if(bars[curBar-1].changedTimeSig) Marker.xPos +=35
			//if(bars[curBar-1].changedOrFirstClef) Marker.xPos += 45	
		} 

		//removes the bar from the current array and effectively deletes it
		bars.splice(curBar, 1);
		curBar--;
		curNote = 0;

		//moves all bars after the current one back.
		moveBars(curBar, false, line);

		lines[curLine].bars -=1
		if(lines[curLine].bars==0) lines.splice(curLine, 1);
		
		if(lines[lines.length-1].complete || lines[lines.length-1].overflown) {
			lines[lines.length-1].changedComplete = true;
		} 

		//if the bar before is not in the curentLine then the current line is decreased.
		if(bars[curBar].line != curLine) {
			curLine--;
		} 
	}
}

function moveLeft() {
	//if the note isn't the first, it places the marker at the note before
	if(curNote > 0) {
		Marker.xPos = bars[curBar].notes[curNote-1].xPos
		curNote--;
		restoreCanvas();
		drawMarker(y);

		//if the bar was extended, it de-extends it.
		if(extended) {
			moveWith(-40, curNote+1, curBar);

			extended = false;
			generateAll();
		}
	} 
	//if it was the first and the current bar also isn't
	else if(curBar-1 >= 0) {
		//moves back the current line if the bar before is on a different line.
		if(bars[curBar-1].line!=curLine) curLine--;
		
		notes = bars[curBar-1].notes.length

		//if the bar before has no notes, then the marker is placed at the start of the bar.
		if(notes == 0) {
			Marker.xPos = bars[curBar-1].initPos+10;
			if(bars[curBar-1].changedTimeSig) Marker.xPos +=35
			if(bars[curBar-1].changedOrFirstClef) Marker.xPos += 45

		} 
		//if it does, it places the marker at the position of the last note of that bar
		else Marker.xPos = bars[curBar-1].notes[notes-1].xPos;

		curBar--;
		curNote = bars[curBar].notes.length-1;
		if(curNote < 0) curNote = 0;
		restoreCanvas();
		drawMarker(y);
	}
}

function moveRight() {
	upperSig = bars[curBar].upperSig;
	lowerSig = bars[curBar].lowerSig;
	sum = getSum(curBar);
	var gen = false;

	//if we've reached the end, meaning the bar was extended or when the sum of the duration of the notes matches the time signature
	if(curNote==bars[curBar].notes.length || (sum == bars[curBar].upperSig/bars[curBar].lowerSig && curNote+1==bars[curBar].notes.length)) {
		//if it was extended, it de-extends
		if(extended) {
			moveWith(-40, curNote+1, curBar);

			extended = false;
			gen = true;
		}

		//creates a new bar if there are no more bars
		curBar++;
		curNote = 0;

		if(curBar == bars.length){
			newBar(upperSig, lowerSig, false, 0, false, bars[curBar-1].xPos, curLine, false); gen = true;
		} 

		//finally, it sets the marker at the start of the next bar
		Marker.xPos = bars[curBar].initPos + 10;
		if(bars[curBar].changedTimeSig) Marker.xPos +=45
		if(bars[curBar].changedOrFirstClef) Marker.xPos += 35

		//changes the current line if the current bar is in another line
		if(bars[curBar].line != curLine) curLine++;	
		if(gen) generateAll();
		else {
			restoreCanvas();
			drawMarker(y);
		}
	} else {
		//if we are at the last note, we extend the bar before we move on to the next bar
		if(curNote+1==bars[curBar].notes.length) {
			//this moves the marker right, effectively when the line isn't complete
			Marker.xPos += 40;
			
			//this extends the bar, in other words, it pushes everything forward so the marker can be placed
			if(!lines[curLine].complete)moveWith(40, curNote+1, curBar);
			extended = true;

			curNote++
			generateAll();
		} 
		//if we are just moving to next note, we place the marker in the same position as the next one
		else if(curNote+1 <= bars[curBar].notes.length) {
			Marker.xPos = bars[curBar].notes[curNote+1].xPos;

			curNote++
			restoreCanvas();
			drawMarker(y);
		} 
	} 
}

//inserts a beat in the form of a rest
function insertBeat() {
	//so that we don't place a beat after we have extended, we check if the bar is extended
	if(!extended) {
		//if we aren't at the first note of the bar or if we aren't at the last note, the markers moves forward and everything with it
		if((curNote!=0 || curNote < bars[curBar].notes.length)) {
			Marker.xPos += 40;
			moveWith(40, curNote+1, curBar);
			curNote++;
		}
		
		//places the pause
		setMarker(true, false);
		Marker.xPos = bars[curBar].notes[curNote].xPos;
	}
	
}

//y is the y position of the marker
function changePitch(pitch) {
	//this defines the y boundaries of the marker
	if(y+pitch <= 6 && y+pitch >=-17){
		y+=pitch
	}
	

	restoreCanvas();
	drawMarker(y);
}

function changeDuration(note, duration) {
	//if we are over a note, it changes it's duration
	if(note>=0 && bars[curBar].notes.length > note) {
		bars[curBar].notes[note].duration = duration;

		generateAll();
	}
}

function setMarker(isSpace, newGroup) {
	placeNote(curDuration, curLine, y+2, isSpace, newGroup);

	generateAll();
}