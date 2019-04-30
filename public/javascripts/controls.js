var ctrlPress = false;
var tPress=false;


//a more fitting name would be place/remove pause
function deleteNote(args) {
	var bars = iPages[args.iPage].bars;
	var information = {
		iPage: args.iPage,
		bar: args.bar, note:args.note, duration: args.duration,
		line: args.line, pos: args.y, isSpace: true, newGroup: false
	};
	//only deletes a note if it exists
	if(args.note < bars[args.bar].notes.length) {
		var isSpace = bars[args.bar].notes[args.note].isSpace;

		if(!isSpace) {
			var nGD=null;
			for(var nG=0; nG<bars[args.bar].notes[args.note].noteGroups.length; nG++) {
				if(bars[args.bar].notes[args.note].noteGroups[nG].pos===args.y) {
					nGD=nG;
				}
			}
			if(nGD===null) return;
			
	
			//deletes the note
			var objNG=bars[args.bar].notes[args.note].noteGroups[nGD];
			var result;
			if(objNG.tiesTo!==false) {
				result = getTied(bars, args.bar, args.note+1, objNG);
				result.tiesToNG.tiedTo=false;
			} 
			if(objNG.tiedTo!==false) {
				result = getTied(bars, args.bar, args.note-1, objNG);
				result.tiesToNG.tiesTo=false;
			}
			bars[args.bar].notes[args.note].noteGroups.splice(nGD, 1);

			if(bars[args.bar].notes[args.note].noteGroups.length===0) {
				bars[args.bar].notes.splice(args.note, 1);
				//if it was a note, it replaces it with a pause (hence the "true")
				
				placeNote(information);
			}
		} else {
			bars[args.bar].notes.splice(args.note, 1);
			if(args.note !== 0 && args.note==curNote && args.iPage == curIPage && args.bar===curBar) {
				curNote--;
			} 
		}

		
	} else {
		placeNote(information);
	}
	
	//says the bar is not extended
	markers[uIndex].extended = false;
	sendAndUpdateMarker();
}



function keepChangedAtt(bars, bar) {
	if(bar+1<bars.length) {
		if(bar-1>=0) {
			checkTimeSig(bars, bar+1, bars[bar-1].upperSig, bars[bar-1].lowerSig);
			checkKey(bars, bar+1, bars[bar-1].accidentals, bars[bar-1].sharpOrFlat);
		} else {
			if(bars[bar+1].accidentals.length!==0) {
				bars[bar+1].changedAcc=true;
			}
			bars[bar+1].changedTimeSig=true;
		}
	}
}

function deleteBar(args) {
	var bars = iPages[args.iPage].bars;
	var lines = iPages[args.iPage].lines;
	var tBar = args.bar;
	//only deletes a bar if it isn"t the first one
	var line = bars[args.bar].line;
	if(bars.length!==1) {
		keepChangedAtt(bars, args.bar);
		
		//removes the bar from the current array and effectively deletes it
		bars.splice(args.bar, 1);
		

		lines[args.line].bars -=1;

		//moves all bars after the current one back.
		moveBars(bars, args.bar, line);

		
		if(lines[args.line].bars===0) lines.splice(args.line, 1);
		if(curIPage===args.iPage && curBar>=bars.length) {
			curBar--;
			tBar--;
		}
		if(curBar===args.bar) {
			markers[uIndex].extended=false;
			curNote=0;
		} 

		//if the bar before is not in the curentLine then the current line is decreased.
		if(line!==0 && args.iPage===curIPage && curBar===tBar && bars[tBar].line < curLine) {
			curLine--;
		} 
	}

	sendAndUpdateMarker();
}

function moveLeft() {
	//if the note isn"t the first, it places the marker at the note before
	if(curNote > 0) {
		curNote--;
		restoreCanvas();
		sendAndUpdateMarker();
		drawMarker({headerOffset: iPages[curIPage].headerOffset});

		//if the bar was extended, it de-extends it.
		if(markers[uIndex].extended) {

			markers[uIndex].extended = false;
			generateAll();
		}
	// eslint-disable-next-line brace-style
	} 
	//if it was the first and the current bar also isn"t
	else if(curBar-1 >= 0) {
		//moves back the current line if the bar before is on a different line.
		if(bars[curBar-1].line!==curLine) curLine--;

		if(bars[curBar].notes.length===0) {
			var information = {
				functionName: "placeNote",
				args: {
					iPage: curIPage,
					bar: curBar, note:0, duration: 1,
					line: curLine, pos: 0, isSpace: true, newGroup: false, fullRest: true
				},
				generate:true
			};
			placeNote(information.args);
			sendData(JSON.stringify(information));
			generateAll();
		} else {
			fillBar({bar: curBar});
		}
		curBar--;
		curNote = bars[curBar].notes.length-1;
		if(curNote < 0) curNote = 0;
		
		restoreCanvas();
		sendAndUpdateMarker();
		drawMarker({headerOffset: iPages[curIPage].headerOffset});
	}
}

function moveRight() {
	var upperSig = bars[curBar].upperSig;
	var lowerSig = bars[curBar].lowerSig;
	var acc = bars[curBar].accidentals;
	var sof = bars[curBar].sharpOrFlat;
	var sum = getSum(bars, curBar);
	var gen = false;

	//if we"ve reached the end, meaning the bar was extended or when the sum of the duration of the notes matches the time signature
	if(curNote===bars[curBar].notes.length || (sum === bars[curBar].upperSig/bars[curBar].lowerSig && curNote+1===bars[curBar].notes.length)) {
		//if it was extended, it de-extends
		if(markers[uIndex].extended) {

			markers[uIndex].extended = false;
			gen = true;
		}

		//creates a new bar if there are no more bars
		if(bars[curBar].notes.length===0) {
			var lInformation = {
				functionName: "placeNote",
				args: {
					iPage: curIPage,
				bar: curBar, note:0, duration: 1,
				line: curLine, pos: 0, isSpace: true, newGroup: false, fullRest: true
				},
				generate:true
			};
			gen=true;
			placeNote(lInformation.args);
			sendData(JSON.stringify(lInformation));
		} else {
			fillBar({bar: curBar});
		}
		curBar++;
		curNote = 0;

		if(curBar === bars.length){
			var information = {functionName: "newBar", 
				args: {
					upperSig: upperSig,
					lowerSig: lowerSig,
					cS: false,
					clef: 0,
					cC: false,
					iPage: curIPage,
					bar: curBar,
					line: curLine, 
					curLine:curLine,
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
		if(bars[curBar].line !== curLine) curLine++;	

		sendAndUpdateMarker();
		if(gen) generateAll();
		else {
			restoreCanvas();
			drawMarker({headerOffset: iPages[curIPage].headerOffset});
		}
		
	} else {
		//if we are at the last note, we extend the bar before we move on to the next bar
		if(curNote+1===bars[curBar].notes.length) {
			//this moves the marker right, effectively when the line isn"t complete
			var maxDots=0;
			for(var n=0; n<bars[curBar].notes[curNote].noteGroups.length; n++) {
				if(bars[curBar].notes[curNote].noteGroups[n].dots>maxDots) maxDots=bars[curBar].notes[curNote].noteGroups[n].dots;
			}
			Marker.xPos+=(maxDots*10);
			
			//this extends the bar, in other words, it pushes everything forward so the marker can be placed
			
			markers[uIndex].extended = true;

			curNote++;
			sendAndUpdateMarker();
			generateAll();
		// eslint-disable-next-line brace-style
		} 
		//if we are just moving to next note, we place the marker in the same position as the next one
		else if(curNote+1 <= bars[curBar].notes.length) {
			Marker.xPos = bars[curBar].notes[curNote+1].xPos;

			curNote++;
			restoreCanvas();
			sendAndUpdateMarker();
			drawMarker({headerOffset: iPages[curIPage].headerOffset});
		} 
	} 
}

//inserts a beat in the form of a rest
function insertBeat(args) {
	var bars = iPages[args.iPage].bars;
	var note = args.note;
	//so that we don"t place a beat after we have extended, we check if the bar is extended
	if(!args.extended) {
		//if we aren"t at the first note of the bar or if we aren"t at the last note, the markers moves forward and everything with it
		if((args.note!==0 || args.note < bars[args.bar].notes.length)) {
			for(var nG=0; nG<bars[args.bar].notes[args.note].noteGroups.length; nG++) {
				var objNG = bars[args.bar].notes[args.note].noteGroups[nG];
				if(objNG.tiesTo!==false) {
					result = getTied(bars, args.bar, args.note+1, objNG);
					result.tiesToNG.tiedTo=false;
					objNG.tiesTo=false;
				}
			}
			if(curNote==args.note && curIPage == args.iPage) curNote++;
			note++;
		}
		//places the pause
		var information = {
			functionName: "placeNote", 
			args: {
				iPage: args.iPage,
				bar: args.bar, note:note, duration: args.duration,
				line: args.line, pos: args.y, isSpace: true, newGroup: false
			},
			generate:false
		};
		placeNote(information.args);
		sendAndUpdateMarker();
	}
}

//y is the y position of the marker
function changePitch(pitch) {
	//this defines the y boundaries of the marker
	if(y+pitch <= 6 && y+pitch >=-17){
		y+=pitch;
	}
	

	restoreCanvas();
	sendAndUpdateMarker();
	drawMarker({headerOffset: iPages[curIPage].headerOffset});
}

function changeDuration(args) {
	//if we are over a note, it changes it"s duration
	var bars = iPages[args.iPage].bars;

	if(args.note>=0 && bars[args.bar].notes.length > args.note) {
		var initDuration = bars[args.bar].notes[args.note].duration;

		bars[args.bar].notes[args.note].duration = args.duration;
		var sum = getSum(bars, args.bar);
		if(sum>bars[args.bar].upperSig/bars[args.bar].lowerSig) {
			bars[args.bar].notes[args.note].duration=initDuration;
		}
		if(bars[args.bar].notes[args.note].fullRest)  {
			bars[args.bar].notes[args.note].fullRest=false;
		}

		generateAll();
	}
}

function setMarkerAndSend(isSpace, newGroup) {
	var information = {functionName: "placeNote", 
		args: {
			iPage: curIPage,
			bar: curBar, note:curNote, duration: curDuration,
			line: curLine, pos: y+2, isSpace: isSpace, newGroup: newGroup
		},
		generate:true
	};
	placeNote(information.args);
	sendData(JSON.stringify(information));
	generateAll();
}

function setMarker(isSpace, newGroup) {
	var information = {functionName: "placeNote", 
		args: {
			iPage: curIPage,
			bar: curBar, note:curNote, duration: curDuration,
			line: curLine, pos: y+2, isSpace: isSpace, newGroup: newGroup
		},
		generate:true
	};
	placeNote(information.args);
	sendAndUpdateMarker();
	generateAll();
}

function checkPlay() {
	for(var i = 0; i<playing.length; i++) {
		if(playing[i]===true) return true;
	}

	return false;
}

function addIPage(args) {
	iPages.push(new InstrumentPage());	
}

function recieveIPage(args) {
	iPages.push(args.iPage);
}

document.addEventListener("keydown", function(event) {
	//simple code that checks what key was pressed and executes a function
	var inf;
	if(!checkPlay()) {
		var dc = document.getElementById("dialogContainer");
		if(dc.childNodes.length>0) dc.removeChild(dc.childNodes[0]);
		switch(event.key) {
		case "+":
			inf = {
				functionName: "changeAccidental",
				args: {
					bar: curBar,
					note: curNote,
					y: y,
					value: 1,
					iPage: curIPage
				},
				generate: true
			};
			changeAccidental(inf.args);
			sendData(JSON.stringify(inf));

			generateAll();
			break;
		case "-":
		inf = {
			functionName: "changeAccidental",
			args: {
				bar: curBar,
				note: curNote,
				y: y,
				value: -1,
				iPage: curIPage
			},
			generate: true
		};
		changeAccidental(inf.args);
		sendData(JSON.stringify(inf));

			generateAll();
			break;
			
		}
		switch(event.code) {
		case "Period":
			inf = {
				functionName: "augment",
				args: {
					bar: curBar,
					note: curNote,
					value: 1,
					iPage: curIPage
				},
				generate: true
			};
			if(ctrlPress) {
				inf.args.value=-1;
			}
			augment(inf.args);
			sendData(JSON.stringify(inf));

			generateAll();
			break;
		case "Enter":
			//check to see if the current note the marker is on is a pause, if it is, it deletes it
			if(curNote < bars[curBar].notes.length) {
				if(!bars[curBar].notes[curNote].isSpace) {
					for(var n = 0; n<bars[curBar].notes[curNote].noteGroups.length; n++) {
						if(bars[curBar].notes[curNote].noteGroups[n].pos === y+2) return;
					}
						
					setMarkerAndSend(false, true);
					generateAll();
					return;
				}
			} 
			

			// markers[uIndex].extended = false;
			// for(var marker in markers) {
			// 	if(markers[marker].extended && curBar===markers[marker].bar && curNote===markers[marker].note && curIPage===markers[marker].page) {
			// 		markers[marker].extended=false;	
			// 		console.log("teste");
			// 	} 
			// }
			setMarkerAndSend(false, false);
				
			generateAll();
			break;
		case "Backspace":
			inf= {
				functionName: "deleteNote",
				args: {
					bar: curBar,
					note: curNote,
					iPage:curIPage,
					duration: curDuration,
					line: curLine,
					y: y+2
				}, 
				generate: true
			};
			deleteNote(inf.args);
			sendData(JSON.stringify(inf));
			
				
			generateAll();
			break;
		case "Space":
			inf = {
				functionName: "insertBeat",
				args: {
					iPage: curIPage,
					bar: curBar, note:curNote, duration: curDuration,
					line: curLine, y: y+2
				},
				generate: true
			};

			insertBeat(inf.args);
			sendData(JSON.stringify(inf));
			generateAll();
			break;
		case "Delete":
			if(ctrlPress) {
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
			} else if(tPress) {
				inf = {
					functionName: "deleteTie",
					args: {
						iPage: curIPage,
						note: curNote,
						bar: curBar,
						y: y
					},
					generate: true
				};
				
				deleteTie(inf.args);
				sendData(JSON.stringify(inf));

				generateAll();
			}
				
			break;
		case "ArrowRight":
			if(tPress) {
				inf = {
					functionName: "tieBeat",
					args: {
						iPage: curIPage,
						note: curNote,
						tieTo: curNote+1,
						bar: curBar,
						y: y
					},
					generate: true
				};
				
				tieBeat(inf.args);
				sendData(JSON.stringify(inf));

				generateAll();
			} else if(ctrlPress) {
				if(curIPage+1<iPages.length) curIPage++;
				curNote=0;
				bars=iPages[curIPage].bars;
				lines=iPages[curIPage].lines;

				markerOutOfBounds();
				sendAndUpdateMarker();

				generateAll();
			} else {
				moveRight();
			}

							
			event.preventDefault();
			break;
		case "ArrowLeft":
			if(tPress) {
				inf = {
					functionName: "tieBeat",
					args: {
						iPage: curIPage,
						note: curNote,
						tieTo: curNote-1,
						bar: curBar,
						y: y
					},
					generate: true
				};
				
				tieBeat(inf.args);
				sendData(JSON.stringify(inf));

				generateAll();
			} else if(ctrlPress) {
				if(curIPage-1>=0) curIPage--;
				curNote=0;
				bars=iPages[curIPage].bars;
				lines=iPages[curIPage].lines;

				markerOutOfBounds();
				sendAndUpdateMarker();

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
			inf = {
				functionName: "changeDuration",
				args: {
					note: curNote,
					duration: curDuration,
					iPage: curIPage,
					bar: curBar	
				},
				generate: false
			};
			changeDuration(inf.args);
			sendData(JSON.stringify(inf));
			break;
		case "Digit2":
			curDuration = 0.5;
			inf = {
				functionName: "changeDuration",
				args: {
					note: curNote,
					duration: curDuration,
					iPage: curIPage,
					bar: curBar		
				},
				generate: false
			};
			changeDuration(inf.args);
			sendData(JSON.stringify(inf));
			break;
		case "Digit3":
			curDuration = 0.25;
			inf = {
				functionName: "changeDuration",
				args: {
					note: curNote,
					duration: curDuration,
					iPage: curIPage,
					bar: curBar		
				},
				generate: false
			};
			changeDuration(inf.args);
			sendData(JSON.stringify(inf));
			break;
		case "Digit4":
			curDuration = 0.125;
			inf = {
				functionName: "changeDuration",
				args: {
					note: curNote,
					duration: curDuration,
					iPage: curIPage,bar: curBar		
				},
				generate: false
			};
			changeDuration(inf.args);
			sendData(JSON.stringify(inf));
			break;
		case "Digit5":
			curDuration = 0.0625;
			inf = {
				functionName: "changeDuration",
				args: {
					note: curNote,
					duration: curDuration,
					iPage: curIPage,
					bar: curBar		
				},
				generate: false
			};
			changeDuration(inf.args);
			sendData(JSON.stringify(inf));
			break;
		case "Digit6":
			curDuration = 0.03125;
			inf = {
				functionName: "changeDuration",
				args: {
					note: curNote,
					duration: curDuration,
					iPage: curIPage	,
					bar: curBar		
				},
				generate: false
			};
			changeDuration(inf.args);
			sendData(JSON.stringify(inf));
			break;
		case "KeyN":
			if(ctrlPress) {
				addIPage();
				curIPage=iPages.length-1;
				inf = {
					functionName: "recieveIPage",
					args: {
						iPage: iPages[curIPage]
					},
					generate:false
				};
				sendData(JSON.stringify(inf));
				curNote=0;
				bars=iPages[curIPage].bars;
				lines=iPages[curIPage].lines;
				sendAndUpdateMarker();
			}
			
			generateAll();
			break;
		case "KeyK":
			if(ctrlPress) {
				changeKeyPop(curBar);
			}else {
				playingBar = 0;
				playingNote = 0;
				playingTime = 0;
				
				for(var i=0; i<time.length; i++) {
					clearTimeout(time[i]);
				}
				var audioContext = new AudioContextFunc();
				changeInstrument("https://surikov.github.io/webaudiofontdata/sound/0000_FluidR3_GM_sf2_file.js","_tone_0000_FluidR3_GM_sf2_file", audioContext);
				
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
			for(var j=0; j<time.length; j++) {
				clearTimeout(time[j]);
			}
			restoreCanvas(); playing=false;
			generateAll();
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
	if(!checkPlay()) {
		var distance = -event.deltaY*0.2;
		
		if(scrollValue+event.deltaY*0.2<0) {
			distance= (scrollValue);

			scrollValue=0;
		} else scrollValue += event.deltaY*0.2;
		ctx.translate(0, distance);
		
		generateAll();
		
	}
});
