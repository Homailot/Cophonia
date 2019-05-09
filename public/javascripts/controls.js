var ctrlPress = false;
var tPress = false;


//a more fitting name would be place/remove pause
function deleteNote(args) {
	var bars = iPages[args.iPage].bars;
	var information = {
		iPage: args.iPage,
		bar: args.bar, note: args.note, duration: args.duration,
		line: args.line, pos: args.y, isSpace: true, newGroup: false
	};
	//only deletes a note if it exists
	if (args.note < bars[args.bar].notes.length) {
		var isSpace = bars[args.bar].notes[args.note].isSpace;

		if (!isSpace) {
			var nGD = null;
			for (var nG = 0; nG < bars[args.bar].notes[args.note].noteGroups.length; nG++) {
				if (bars[args.bar].notes[args.note].noteGroups[nG].pos === args.y) {
					nGD = nG;
				}
			}
			if (nGD === null) nGD = 0;


			//deletes the note
			var objNG = bars[args.bar].notes[args.note].noteGroups[nGD];
			var result;
			if (objNG.tiesTo !== false) {
				result = getTied(bars, args.bar, args.note + 1, objNG);
				result.tiesToNG.tiedTo = false;
			}
			if (objNG.tiedTo !== false) {
				result = getTied(bars, args.bar, args.note - 1, objNG);
				result.tiesToNG.tiesTo = false;
			}
			if (selectedNotes[0] && selectedNotes[0].iPage === args.iPage && selectedNotes[0].bar === args.bar && selectedNotes[0].note === args.note && selectedNotes[0].pos == args.y) {
				delete selectedNotes[0];
			}
			bars[args.bar].notes[args.note].noteGroups.splice(nGD, 1);

			if (bars[args.bar].notes[args.note].noteGroups.length === 0) {
				bars[args.bar].notes.splice(args.note, 1);
				//if it was a note, it replaces it with a pause (hence the "true")

				placeNote(information);

			}
			selectNote(curNote, curBar, curIPage, y);
		} else {
			bars[args.bar].notes.splice(args.note, 1);
			delete selectedNotes[0];
			if (args.note !== 0 && args.note == curNote && args.iPage == curIPage && args.bar === curBar) {
				curNote--;
				selectNote(curNote, curBar, curIPage, y);
			}
		}


	} else {
		placeNote(information);
	}

	//says the bar is not extended

	sendAndUpdateMarker();
}



function keepChangedAtt(bars, bar) {
	if (bar + 1 < bars.length) {
		if (bar - 1 >= 0) {
			checkTimeSig(bars, bar + 1, bars[bar - 1].upperSig, bars[bar - 1].lowerSig);
			checkKey(bars, bar + 1, bars[bar - 1].accidentals, bars[bar - 1].sharpOrFlat);
		} else {
			if (bars[bar + 1].accidentals.length !== 0) {
				bars[bar + 1].changedAcc = true;
			}
			bars[bar + 1].changedTimeSig = true;
		}
	}
}

function deleteBar(args) {
	var bars = iPages[args.iPage].bars;
	var lines = iPages[args.iPage].lines;
	var tBar = args.bar;
	//only deletes a bar if it isn"t the first one
	var line = bars[args.bar].line;
	if (bars.length !== 1) {
		keepChangedAtt(bars, args.bar);

		if(bars[args.bar-1]) {
			var lastNote = bars[args.bar-1].notes.length-1;

			for (var nG = 0; nG < bars[args.bar-1].notes[lastNote].noteGroups.length; nG++) {
				var objNG = bars[args.bar-1].notes[lastNote].noteGroups[nG];
				if (objNG.tiesTo !== false) {
					objNG.tiesTo = false;
				}
			}
		}
		

		//removes the bar from the current array and effectively deletes it
		bars.splice(args.bar, 1);
		if (selectedNotes[0] && selectedNotes[0].bar >= args.bar && selectedNotes[0].iPage === args.iPage) {
			delete selectedNotes[0];
		}


		lines[args.line].bars -= 1;

		//moves all bars after the current one back.
		moveBars(bars, args.bar, line);


		if (lines[args.line].bars === 0) lines.splice(args.line, 1);
		if (curIPage === args.iPage) {
			if (curBar >= bars.length) {
				curBar--;
				tBar--;
			}


			if (curBar === args.bar) {
				markers[uIndex].extended = false;
				curNote = 0;
			}

			selectNote(curNote, curBar, curIPage, y);
		}


		//if the bar before is not in the curentLine then the current line is decreased.
		if (line !== 0 && args.iPage === curIPage && curBar === tBar && bars[tBar].line < curLine) {
			curLine--;
		}

	}

	sendAndUpdateMarker();
}

function moveLeft() {
	//if the note isn"t the first, it places the marker at the note before
	if (curNote > 0) {
		curNote--;


		//if the bar was extended, it de-extends it.
		if (markers[uIndex].extended) {

			markers[uIndex].extended = false;
			generateAll();

			return;
		}
		// eslint-disable-next-line brace-style
	}
	//if it was the first and the current bar also isn"t
	else if (curBar - 1 >= 0) {
		//moves back the current line if the bar before is on a different line.
		if (bars[curBar - 1].line !== curLine) curLine--;

		if (bars[curBar].notes.length === 0) {
			var information = {
				functionName: "placeNote",
				args: {
					iPage: curIPage,
					bar: curBar, note: 0, duration: 1,
					line: curLine, pos: 0, isSpace: true, newGroup: false, fullRest: true
				},
				generate: true
			};
			placeNote(information.args);
			sendData(JSON.stringify(information));
			generateAll();
		} else {
			fillBar({ bar: curBar });
		}
		curBar--;
		curNote = bars[curBar].notes.length - 1;
		if (curNote < 0) curNote = 0;
	}
	selectNote(curNote, curBar, curIPage, y);

	restoreCanvas();
	drawSelected();
	sendAndUpdateMarker();
	drawMarker({ headerOffset: iPages[curIPage].headerOffset });
}

function insertBar(args) {
	var bars=iPages[args.iPage].bars;
	var lastNote = bars[args.bar].notes.length-1;

	for (var nG = 0; nG < bars[args.bar].notes[lastNote].noteGroups.length; nG++) {
		var objNG = bars[args.bar].notes[lastNote].noteGroups[nG];
		if (objNG.tiesTo !== false) {
			result = getTied(bars, args.bar, lastNote + 1, objNG);
			result.tiesToNG.tiedTo = false;
			objNG.tiesTo = false;
		}
	}

	var information = {
		args: {
			upperSig: bars[args.bar].upperSig,
			lowerSig: bars[args.bar].lowerSig,
			cS: false,
			clef: 0,
			cC: false,
			iPage: args.iPage,
			bar: args.bar+1,
			line: args.line,
			curLine: args.line,
			cA: false,
			acc: bars[args.bar].accidentals,
			sof: bars[args.bar].sharpOrFlat,
			rested: true
		}
	};
	newBar(information.args);
	if(curBar>=args.bar+1 && curIPage==args.iPage) {
		curNote=0;
	}
	if(selectedNotes[0] && selectedNotes[0].bar >=args.bar  && curIPage==args.iPage) {
		delete selectedNotes[0];
	}
	//sendData(JSON.stringify(information));
}

function moveRight(createBar) {
	var upperSig = bars[curBar].upperSig;
	var lowerSig = bars[curBar].lowerSig;
	var acc = bars[curBar].accidentals;
	var sof = bars[curBar].sharpOrFlat;
	var sum = getSum(bars, curBar);
	var gen = false;

	//if we"ve reached the end, meaning the bar was extended or when the sum of the duration of the notes matches the time signature
	if (curNote === bars[curBar].notes.length || (sum === bars[curBar].upperSig / bars[curBar].lowerSig && curNote + 1 === bars[curBar].notes.length)) {
		//if it was extended, it de-extends

		if (markers[uIndex].extended) {

			markers[uIndex].extended = false;
			gen = true;
		}

		//creates a new bar if there are no more bars
		if (bars[curBar].notes.length === 0) {
			var lInformation = {
				functionName: "placeNote",
				args: {
					iPage: curIPage,
					bar: curBar, note: 0, duration: 1,
					line: curLine, pos: 0, isSpace: true, newGroup: false, fullRest: true
				},
				generate: true
			};
			gen = true;
			placeNote(lInformation.args);
			sendData(JSON.stringify(lInformation));
		} else {
			fillBar({ bar: curBar });
		}
		curBar++;
		curNote = 0;


		if (curBar === bars.length) {
			var information = {
				functionName: "newBar",
				args: {
					upperSig: upperSig,
					lowerSig: lowerSig,
					cS: false,
					clef: 0,
					cC: false,
					iPage: curIPage,
					bar: curBar,
					line: curLine,
					curLine: curLine,
					cA: false,
					acc: acc,
					sof: sof,
					rested: true
				},
				generate: true
			};
			newBar(information.args); gen = true;
			sendData(JSON.stringify(information));
		}

		//changes the current line if the current bar is in another line
		if (bars[curBar].line !== curLine) curLine++;
		selectNote(curNote, curBar, curIPage, y);
		sendAndUpdateMarker();
		if (gen) generateAll();
		else {
			restoreCanvas();
			drawSelected();
			drawMarker({ headerOffset: iPages[curIPage].headerOffset });
		}

	} else {
		//if we are at the last note, we extend the bar before we move on to the next bar
		if (curNote + 1 === bars[curBar].notes.length) {
			//this moves the marker right, effectively when the line isn"t complete
			var maxDots = 0;
			for (var n = 0; n < bars[curBar].notes[curNote].noteGroups.length; n++) {
				if (bars[curBar].notes[curNote].noteGroups[n].dots > maxDots) maxDots = bars[curBar].notes[curNote].noteGroups[n].dots;
			}
			Marker.xPos += (maxDots * 10);

			//this extends the bar, in other words, it pushes everything forward so the marker can be placed

			markers[uIndex].extended = true;
			delete selectedNotes[0];

			curNote++;
			sendAndUpdateMarker();
			generateAll();
			// eslint-disable-next-line brace-style
		}
		//if we are just moving to next note, we place the marker in the same position as the next one
		else if (curNote + 1 <= bars[curBar].notes.length) {
			Marker.xPos = bars[curBar].notes[curNote + 1].xPos;

			curNote++;
			selectNote(curNote, curBar, curIPage, y);
			restoreCanvas();
			drawSelected();
			sendAndUpdateMarker();
			drawMarker({ headerOffset: iPages[curIPage].headerOffset });
		}
	}
}

//inserts a beat in the form of a rest
function insertBeat(args) {
	var bars = iPages[args.iPage].bars;
	var note = args.note;
	//so that we don"t place a beat after we have extended, we check if the bar is extended
	if (!args.extended) {
		//if we aren"t at the first note of the bar or if we aren"t at the last note, the markers moves forward and everything with it
		if (bars[args.bar].notes[note] && getSum(bars, args.bar) + curDuration <= bars[args.bar].upperSig / bars[args.bar].lowerSig) {
			for (var nG = 0; nG < bars[args.bar].notes[args.note].noteGroups.length; nG++) {
				var objNG = bars[args.bar].notes[args.note].noteGroups[nG];
				if (objNG.tiesTo !== false) {
					result = getTied(bars, args.bar, args.note + 1, objNG);
					result.tiesToNG.tiedTo = false;
					objNG.tiesTo = false;
				}
			}
			if (curNote == args.note && curIPage == args.iPage) curNote++;
			note++;
		}
		//places the pause
		var information = {
			functionName: "placeNote",
			args: {
				iPage: args.iPage,
				bar: args.bar, note: note, duration: args.duration,
				line: args.line, pos: args.y, isSpace: true, newGroup: false
			},
			generate: false
		};
		placeNote(information.args);
		sendAndUpdateMarker();

		selectNote(curNote, curBar, curIPage, y);
	}
}

//y is the y position of the marker
function changePitch(pitch) {
	//this defines the y boundaries of the marker
	y += pitch;
	if (y > 6) y = 6;
	if (y < -17) y = -17;
	selectNote(curNote, curBar, curIPage, y);

	restoreCanvas();
	drawSelected();
	sendAndUpdateMarker();
	drawMarker({ headerOffset: iPages[curIPage].headerOffset });
}

function temporaryChangePitch(pitch) {
	y += pitch;
	if (y > 6) y = 6;
	if (y < -17) y = -17;

	updateCurMarker();
}

function changeDuration(args) {
	//if we are over a note, it changes it"s duration
	var bars = iPages[args.iPage].bars;

	if (args.note >= 0 && bars[args.bar].notes.length > args.note) {
		var initDuration = bars[args.bar].notes[args.note].duration;
		var initFullRest = bars[args.bar].notes[args.note].fullRest;

		bars[args.bar].notes[args.note].duration = args.duration;
		bars[args.bar].notes[args.note].fullRest = false;
		var sum = getSum(bars, args.bar);
		if (sum > bars[args.bar].upperSig / bars[args.bar].lowerSig) {
			bars[args.bar].notes[args.note].duration = initDuration;
			bars[args.bar].notes[args.note].fullRest = initFullRest;
		} else {
			for (var d = 0; d < gDurations.length; d++) {
				if (gDurations[d] === args.duration) {
					if (bars[args.bar].notes[args.note].dots > dots[d]) {
						bars[args.bar].notes[args.note].dots = dots[d];
					}
					break;
				}
			}
		}

		generateAll();
	}
}

function setMarkerAndSend(isSpace, newGroup) {
	var information = {
		functionName: "placeNote",
		args: {
			iPage: curIPage,
			bar: curBar, note: curNote, duration: curDuration,
			line: curLine, pos: y + 2, isSpace: isSpace, newGroup: newGroup
		},
		generate: true
	};
	placeNote(information.args);
	sendData(JSON.stringify(information));
	selectNote(curNote, curBar, curIPage, y);
	generateAll();
}

function setMarker(isSpace, newGroup) {
	var information = {
		functionName: "placeNote",
		args: {
			iPage: curIPage,
			bar: curBar, note: curNote, duration: curDuration,
			line: curLine, pos: y + 2, isSpace: isSpace, newGroup: newGroup
		},
		generate: true
	};
	placeNote(information.args);
	sendAndUpdateMarker();
	generateAll();
}

function checkPlay() {
	for (var i = 0; i < playing.length; i++) {
		if (playing[i] === true) return true;
	}

	return false;
}

function addIPage(args) {
	iPages.push(new InstrumentPage());
}

function enterNotes() {
	//check to see if the current note the marker is on is a pause, if it is, it deletes it
	if (curNote < bars[curBar].notes.length) {
		if (!bars[curBar].notes[curNote].isSpace) {
			for (var n = 0; n < bars[curBar].notes[curNote].noteGroups.length; n++) {
				if (bars[curBar].notes[curNote].noteGroups[n].pos === y + 2) {
					unselectNote();
					return;

				}
			}

			setMarkerAndSend(false, true);

			return;
		}
	}
	var lastNote = bars[curBar].notes.length-1;

	for (var nG = 0; nG < bars[curBar].notes[lastNote].noteGroups.length; nG++) {
		var objNG = bars[curBar].notes[lastNote].noteGroups[nG];
		if (objNG.tiesTo !== false) {
			result = getTied(bars, curBar, lastNote + 1, objNG);
			result.tiesToNG.tiedTo = false;
			objNG.tiesTo = false;
		}
	}

	setMarkerAndSend(false, false);
}

function recieveIPage(args) {
	iPages.push(args.iPage);
}

document.addEventListener("keydown", function (event) {
	//simple code that checks what key was pressed and executes a function
	var inf;
	if (!checkPlay()) {
		var dc = document.getElementById("dialogContainer");
		if (dc.childNodes.length > 0) dc.removeChild(dc.childNodes[0]);
		switch (event.key) {
			case "+":
				menuAccidental(1);
				break;
			case "-":
				menuAccidental(-1);
				break;

		}
		switch (event.code) {
			case "Period":
				menuDot();
				break;
			case "Enter":
				event.preventDefault();
				if (insertionTool) {
					enterNotes();
				} else if (bars[curBar].notes[curNote]) {
					unselectNote();
				}


				break;
			case "Backspace":
				event.preventDefault();
				menuDeleteNote();
				break;
			case "Space":
				event.preventDefault();
				menuInsert();
				break;
			case "Delete":
				if (ctrlPress) {
					inf = {
						functionName: "deleteBar",
						args: {
							iPage: curIPage,
							bar: curBar,
							line: curLine,
						},
						generate: true
					};

					deleteBar(inf.args);

					sendData(JSON.stringify(inf));

					generateAll();
				} else if (tPress) {
					if (!selectedNotes[0]) break;

					inf = {
						functionName: "deleteTie",
						args: {
							iPage: curIPage,
							note: selectedNotes[0].note,
							bar: selectedNotes[0].bar,
							y: selectedNotes[0].pos
						},
						generate: true
					};

					deleteTie(inf.args);
					sendData(JSON.stringify(inf));

					generateAll();
				}

				break;
			case "ArrowRight":
				if (tPress) {
					if (!selectedNotes[0]) break;

					inf = {
						functionName: "tieBeat",
						args: {
							iPage: curIPage,
							note: selectedNotes[0].note,
							tieTo:  selectedNotes[0].note + 1,
							bar: selectedNotes[0].bar,
							y: selectedNotes[0].pos
						},
						generate: true
					};

					tieBeat(inf.args);
					sendData(JSON.stringify(inf));

					generateAll();
				} else if (ctrlPress) {
					menuIPage(1);
				} else {
					moveRight(true);
				}


				event.preventDefault();
				break;
			case "ArrowLeft":
				if (tPress) {
					if (!selectedNotes[0]) break;

					inf = {
						functionName: "tieBeat",
						args: {
							iPage: curIPage,
							note: selectedNotes[0].note,
							tieTo: selectedNotes[0].note - 1,
							bar: selectedNotes[0].bar,
							y: selectedNotes[0].pos
						},
						generate: true
					};

					tieBeat(inf.args);
					sendData(JSON.stringify(inf));

					generateAll();
				} else if (ctrlPress) {
					menuIPage(-1);
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
				menuDuration(0, true);
				break;
			case "Digit2":
				menuDuration(1, true);
				break;
			case "Digit3":
				menuDuration(2, true);
				break;
			case "Digit4":
				menuDuration(3, true);
				break;
			case "Digit5":
				menuDuration(4, true);
				break;
			case "Digit6":
				menuDuration(5, true);
				break;
			case "Digit7": {
				menuDuration(6, true);
				break;
			}
			case "KeyN":
				if (ctrlPress) {
					menuNewIPage();
				}

				break;
			case "KeyK":
				if (ctrlPress) {
					changeKeyPop(curBar);
				} else {
					playingBar = 0;
					playingNote = 0;
					playingTime = 0;

					for (var i = 0; i < time.length; i++) {
						clearTimeout(time[i]);
					}
					var audioContext = new AudioContextFunc();
					changeInstrument("https://surikov.github.io/webaudiofontdata/sound/0000_FluidR3_GM_sf2_file.js", "_tone_0000_FluidR3_GM_sf2_file", audioContext);

				}

				break;
			case "KeyT":
				if (ctrlPress) {
					fillBar({ bar: curBar });
					changeTimeSigPop(curBar);
				} else {
					tPress = true;
				}


				break;
			case "ShiftLeft":
			case "ShiftRight":
				event.preventDefault();
				ctrlPress = true;
				break;
		}
	} else {
		switch (event.code) {
			case "KeyK":
				for (var j = 0; j < time.length; j++) {
					clearTimeout(time[j]);
				}
				restoreCanvas(); playing = false;
				drawSelected();
				generateAll();
				break;
			case "ShiftLeft":
			case "ShiftRight":
				ctrlPress = true;
				break;

		}
	}
});

document.addEventListener("keyup", function (event) {
	switch (event.code) {
		case "ShiftLeft":
		case "ShiftRight":
			ctrlPress = false;
			break;
		case "KeyT":
			tPress = false;
	}
});

document.addEventListener("mousewheel", function (event) {
	if (!checkPlay()) {
		var distance = -event.deltaY * 0.2;

		if (scrollValue + event.deltaY * 0.2 < 0) {
			distance = (scrollValue);

			scrollValue = 0;
		} else scrollValue += event.deltaY * 0.2;
		ctx.translate(0, distance);

		generateAll();

	}
});
