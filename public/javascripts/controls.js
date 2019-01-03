var ctrlPress = false;
var tPress=false;


//a more fitting name would be place/remove pause
function deleteNote() {
	//only deletes a note if it exists
	if(curNote < bars[curBar].notes.length) {
		var isSpace = bars[curBar].notes[curNote].isSpace;

		if(!isSpace) {
			var nGD=null;
			for(var nG=0; nG<bars[curBar].notes[curNote].noteGroups.length; nG++) {
				if(bars[curBar].notes[curNote].noteGroups[nG].pos===y+2) {
					nGD=nG;
				}
			}
			if(nGD===null) return;
			
	
			//deletes the note
			var objNG=bars[curBar].notes[curNote].noteGroups[nGD];
			if(objNG.tiesTo!=null) {
				objNG.tiesTo.objNG.tiedTo=null;
			} 
			if(objNG.tiedTo!=null) {
				objNG.tiedTo.objNG.tiesTo=null;
			}
			bars[curBar].notes[curNote].noteGroups.splice(nGD, 1);

			if(bars[curBar].notes[curNote].noteGroups.length===0) {
				bars[curBar].notes.splice(curNote, 1);
				//if it was a note, it replaces it with a pause (hence the "true")
				setMarker(true, false);
			}
		} else {
			bars[curBar].notes.splice(curNote, 1);
			if(curNote !== 0) {
				curNote--;
			} 
		}

		
	} else setMarker(true, false);
	
	//says the bar is not extended
	extended = false;
}

function deleteTie() {
	var objNG = null;
	for(var nG=0; nG<bars[curBar].notes[curNote].noteGroups.length; nG++) {
		if(bars[curBar].notes[curNote].noteGroups[nG].pos===y+2) {
			objNG = bars[curBar].notes[curNote].noteGroups[nG];
			break;
		}
	}

	if(objNG!==null) {
		if(objNG.tiesTo!==null) {
			objNG.tiesTo.objNG.tiedTo=null;
			objNG.tiesTo=null;
		} else if(objNG.tiedTo!=null) {
			objNG.tiedTo.objNG.tiesTo=null;
			objNG.tiedTo=null;
		}
	}
}

function deleteBar() {
	//only deletes a bar if it isn"t the first one
	var line = bars[curBar].line;
	if(curBar > 0) {

		//removes the bar from the current array and effectively deletes it
		bars.splice(curBar, 1);
		curBar--;
		curNote = 0;

		//moves all bars after the current one back.
		moveBars(curBar, false, line);

		lines[curLine].bars -=1;
		if(lines[curLine].bars===0) lines.splice(curLine, 1);
		
		if(lines[lines.length-1].complete || lines[lines.length-1].overflown) {
			lines[lines.length-1].changedComplete = true;
		} 

		//if the bar before is not in the curentLine then the current line is decreased.
		if(bars[curBar].line !== curLine) {
			curLine--;
		} 
	}
}

function moveLeft() {
	//if the note isn"t the first, it places the marker at the note before
	if(curNote > 0) {
		Marker.xPos = bars[curBar].notes[curNote-1].xPos;
		curNote--;
		restoreCanvas();
		drawMarker(y);

		//if the bar was extended, it de-extends it.
		if(extended) {

			extended = false;
			generateAll();
		}
	// eslint-disable-next-line brace-style
	} 
	//if it was the first and the current bar also isn"t
	else if(curBar-1 >= 0) {
		//moves back the current line if the bar before is on a different line.
		if(bars[curBar-1].line!==curLine) curLine--;
		
		var notes = bars[curBar-1].notes.length;

		//if the bar before has no notes, then the marker is placed at the start of the bar.
		if(notes === 0) {
			Marker.xPos = bars[curBar-1].initPos+10;
			if(bars[curBar-1].changedTimeSig) Marker.xPos +=35;
			if(bars[curBar-1].changedOrFirstClef) Marker.xPos += 45;

		// eslint-disable-next-line brace-style
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
	var upperSig = bars[curBar].upperSig;
	var lowerSig = bars[curBar].lowerSig;
	var acc = bars[curBar].accidentals;
	var sof = bars[curBar].sharpOrFlat;
	var sum = getSum(curBar);
	var gen = false;

	//if we"ve reached the end, meaning the bar was extended or when the sum of the duration of the notes matches the time signature
	if(curNote===bars[curBar].notes.length || (sum === bars[curBar].upperSig/bars[curBar].lowerSig && curNote+1===bars[curBar].notes.length)) {
		//if it was extended, it de-extends
		if(extended) {

			extended = false;
			gen = true;
		}

		//creates a new bar if there are no more bars
		curBar++;
		curNote = 0;

		if(curBar === bars.length){
			newBar(upperSig, lowerSig, false, 0, false, bars[curBar-1].xPos, curLine, false, acc, sof); gen = true;
		} 

		//finally, it sets the marker at the start of the next bar
		Marker.xPos = bars[curBar].initPos + 10;
		if(bars[curBar].changedTimeSig) Marker.xPos +=45;
		if(bars[curBar].changedOrFirstClef) Marker.xPos += 35;

		//changes the current line if the current bar is in another line
		if(bars[curBar].line !== curLine) curLine++;	
		if(gen) generateAll();
		else {
			restoreCanvas();
			drawMarker(y);
		}
	} else {
		//if we are at the last note, we extend the bar before we move on to the next bar
		if(curNote+1===bars[curBar].notes.length) {
			//this moves the marker right, effectively when the line isn"t complete
			Marker.xPos += 40;
			var maxDots=0;
			for(var n=0; n<bars[curBar].notes[curNote].noteGroups.length; n++) {
				if(bars[curBar].notes[curNote].noteGroups[n].dots>maxDots) maxDots=bars[curBar].notes[curNote].noteGroups[n].dots;
			}
			Marker.xPos+=(maxDots*10);
			
			//this extends the bar, in other words, it pushes everything forward so the marker can be placed
			
			extended = true;

			curNote++;
			generateAll();
		// eslint-disable-next-line brace-style
		} 
		//if we are just moving to next note, we place the marker in the same position as the next one
		else if(curNote+1 <= bars[curBar].notes.length) {
			Marker.xPos = bars[curBar].notes[curNote+1].xPos;

			curNote++;
			restoreCanvas();
			drawMarker(y);
		} 
	} 
}

//inserts a beat in the form of a rest
function insertBeat() {
	//so that we don"t place a beat after we have extended, we check if the bar is extended
	if(!extended) {
		//if we aren"t at the first note of the bar or if we aren"t at the last note, the markers moves forward and everything with it
		if((curNote!==0 || curNote < bars[curBar].notes.length)) {
			for(var nG=0; nG<bars[curBar].notes[curNote].noteGroups.length; nG++) {
				var objNG = bars[curBar].notes[curNote].noteGroups[nG];
				if(objNG.tiesTo!==null) {
					objNG.tiesTo.objNG.tiedTo=null;
					objNG.tiesTo=null;
				}
			}
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
		y+=pitch;
	}
	

	restoreCanvas();
	drawMarker(y);
}

function changeDuration(note, duration) {
	//if we are over a note, it changes it"s duration
	if(note>=0 && bars[curBar].notes.length > note) {
		bars[curBar].notes[note].duration = duration;

		generateAll();
	}
}

function setMarker(isSpace, newGroup) {
	placeNote(curDuration, curLine, y+2, isSpace, newGroup);

	generateAll();
}

document.addEventListener("keydown", function(event) {
	//simple code that checks what key was pressed and executes a function
	if(!playing) {
		var dc = document.getElementById("dialogContainer");
		if(dc.childNodes.length>0) dc.removeChild(dc.childNodes[0]);
		switch(event.key) {
		case "+":
			changeAccidental(bars[curBar], bars[curBar].notes[curNote], y, 1, curNote);

			generateAll();
			break;
		case "-":
			changeAccidental(bars[curBar], bars[curBar].notes[curNote], y, -1, curNote);

			generateAll();
			break;
			
		}
		switch(event.code) {
		case "Period":
			if(ctrlPress) augment(curBar, curNote, y, -1);
			else augment(curBar, curNote, y, 1);

			generateAll();
			break;
		case "Enter":
			//check to see if the current note the marker is on is a pause, if it is, it deletes it
			if(curNote < bars[curBar].notes.length) {
				if(!bars[curBar].notes[curNote].isSpace) {
					for(var n = 0; n<bars[curBar].notes[curNote].noteGroups.length; n++) {
						if(bars[curBar].notes[curNote].noteGroups[n].pos === y+2) return;
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
		case "Backspace":
			deleteNote();
				
			generateAll();
			break;
		case "Space":
			insertBeat();

			generateAll();
			break;
		case "Delete":
			if(ctrlPress) {
				deleteBar();

				generateAll();
			} else if(tPress) {
				deleteTie();

				generateAll();
			}
				
			break;
		case "ArrowRight":
			if(tPress) {
				tieBeat(curBar, curNote, curNote+1, y);

				generateAll();
			} else {
				moveRight();
			}

							
			event.preventDefault();
			break;
		case "ArrowLeft":
			if(tPress) {
				tieBeat(curBar, curNote, curNote-1, y);

				generateAll();
			} else {
				moveLeft();
			}

				
			event.preventDefault();
			break;
		case "ArrowUp":
			changePitch(-1);
			event.preventDefault();
				
			break;
		case "ArrowDown":
			changePitch(1);
			event.preventDefault();
			break;
		case "Digit1":
			curDuration = 1;
			changeDuration(curNote, curDuration);
			break;
		case "Digit2":
			curDuration = 0.5;
			changeDuration(curNote, curDuration);
			break;
		case "Digit3":
			curDuration = 0.25;
			changeDuration(curNote, curDuration);
			break;
		case "Digit4":
			curDuration = 0.125;
			changeDuration(curNote, curDuration);
			break;
		case "Digit5":
			curDuration = 0.0625;
			changeDuration(curNote, curDuration);
			break;
		case "Digit6":
			curDuration = 0.03125;
			changeDuration(curNote, curDuration);
			break;
		case "KeyK":
			if(ctrlPress) {
				changeKeyPop(curBar);
			}else {
				playingBar = 0;
				playingNote = 0;
				playingTime = 0;

				clearTimeout(time);
				play();
			}
				
			break;
		case "KeyT":
			if(ctrlPress) {
				changeTimeSigPop(curBar);
			} else {
				tPress=true;
			}


			break;
		case "ShiftLeft":
		case "ShiftRight":
			event.preventDefault();
			ctrlPress = true;
			break;
		}
	} else {
		switch(event.code) {
		case "KeyK":
			clearTimeout(time);
			restoreCanvas(); playing=false;
			break;
		case "ShiftLeft":
		case "ShiftRight":
			ctrlPress = true;
			break;
			
		}
	}
});

document.addEventListener("keyup", function(event) {
	switch(event.code) {
	case "ShiftLeft":
	case "ShiftRight":
		ctrlPress = false;
		break;
	case "KeyT":
		tPress=false;
	}
});

document.addEventListener("mousewheel", function(event) {
	if(!playing) {
		var distance = -event.deltaY*0.2;
		
		if(scrollValue+event.deltaY*0.2<0) {
			distance= (scrollValue);

			scrollValue=0;
		} else scrollValue += event.deltaY*0.2;
		ctx.translate(0, distance);
		
		generateAll();
		
	}
	event.preventDefault();
});
