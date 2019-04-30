function Bar() {
	this.upperSig = 4;
	this.lowerSig = 4;
	this.changedTimeSig = false;
	this.clef = 1;
	this.changedOrFirstClef = false;
	this.changedClef = false;
	this.complete = false;
	//xPos = end of bar
	this.xPos = 0;

	//initPos = start of bar
	this.initPos = 0;
	this.line = 0;
	this.notes = [];
	this.sharpOrFlat = 0;
	this.accidentals = 0;
	this.naturals = [];
	this.naturalOrder=0;
	this.firstAcc;
	this.changedAcc = false;
}

function newBar(args) { // eslint-disable-line no-unused-vars
	args.line = checkLineOverflow(args.curLine, iPages[args.iPage].lines, args.bar);
	//creates the new bar and initializes it's xPosition depending on the values.
	var bar = new Bar();	
	bar.upperSig = args.upperSig;
	bar.lowerSig=args.lowerSig;
	bar.changedTimeSig = args.cS;
	bar.clef = args.clef;
	bar.changedOrFirstClef = args.cC;
	bar.changedClef= args.cC;
	bar.xPos=0;
	bar.line = args.line;
	bar.changedAcc=args.cA;
	bar.accidentals=args.acc;
	bar.sharpOrFlat=args.sof;

	var lbars = iPages[args.iPage].bars;
	//we insert the bar in the array at the current position
	
	lbars.splice(args.bar, 0, bar);
	if(args.rested) {
		var information = {
			iPage: args.iPage,
			bar: args.bar, note:0, duration: 1,
			line: args.line, pos: 0, isSpace: true, newGroup: false, fullRest: true
		};
		placeNote(information);
	}
}

function checkLineOverflow(line, lines, bar) {
	var numBars=0;
	var lastBar;
	var returnLine=line;
		
	for(var lineI=0; lineI<lines.length; lineI++) {
		if(lines[lineI].bars===lines[lineI].maxBars) {
			lines[lineI].complete = true;
			if(lineI===line && bar-numBars>=lines[lineI].maxBars) {
				returnLine++;
			} else if(lineI>=line) {
				lastBar = numBars+lines[lineI].maxBars-1;

				bars[lastBar].line++;
				setNoteLines(bars, lastBar);
			}

			if(lineI===lines.length-1) {
				lines.push(new Line());
	
				lines[lines.length-1].bars++;
				lines[lines.length-1].yOffset=0;
				break;
			} 
		} else {
			lines[lineI].bars++;
		}

		numBars+=lines[lineI].bars;
	}

	return returnLine;
}

function checkTimeSig(bars, ibar, upperSig, lowerSig) {
	if(bars[ibar].upperSig !== upperSig || bars[ibar].lowerSig !== lowerSig) {
		bars[ibar].changedTimeSig=true;
		
	} else if(bars[ibar].upperSig === upperSig && bars[ibar].lowerSig === lowerSig) {
		bars[ibar].changedTimeSig=false;
		
	}
}

function changeTimeSig(args) { // eslint-disable-line no-unused-vars
	var bars=iPages[args.iPage].bars;

	for(var ibar = args.bar+1; ibar<bars.length; ibar++) {
		checkTimeSig(bars, ibar, args.upperSig, args.lowerSig);
		break;
	}

	bars[args.bar].upperSig = args.upperSig;
	bars[args.bar].lowerSig = args.lowerSig;
	if(args.bar!==0 && (bars[args.bar-1].upperSig!==bars[args.bar].upperSig || bars[args.bar].lowerSig !== bars[args.bar-1].lowerSig)) {
		if(!bars[args.bar].changedTimeSig) {
			bars[args.bar].changedTimeSig=true;
		}
	} else if(args.bar!==0 && (bars[args.bar-1].upperSig===bars[args.bar].upperSig && bars[args.bar].lowerSig === bars[args.bar-1].lowerSig)) {
		if(bars[args.bar].changedTimeSig) {
			bars[args.bar].changedTimeSig=false;
		}
	}

	moveExtraNotes(args);

	generateAll();
}

function moveExtraNotes(args) {
	var bars=iPages[args.iPage].bars;
	var newBarI=args.bar;
	var newNoteI=0;
	var maxDuration = bars[args.bar].upperSig/bars[args.bar].lowerSig;
	var noteDuration;
	var durationAcum=0;
	var movedNote;
	var checkMarker=false;
	var oldNote=0;

	for(var note=0; note<bars[args.bar].notes.length; note++) {
		noteDuration = getNoteDuration(bars[args.bar].notes[note]);
		durationAcum+=noteDuration;
		if(durationAcum>maxDuration) {
			movedNote = bars[args.bar].notes.splice(note, 1);
			note--;
			newBarI++;
			newNoteI=0;
			durationAcum=noteDuration;
			
			var inf = {
				upperSig: args.upperSig,
				lowerSig: args.lowerSig,
				cS: false,
				clef: 0,
				cC: false,
				iPage: args.iPage,
				bar: newBarI,
				line: bars[newBarI-1].line, 
				curLine: bars[newBarI-1].line,
				cA: false,
				acc: bars[newBarI-1].accidentals,
				sof:  bars[newBarI-1].sharpOrFlat
			};
			newBar(inf);
			bars[newBarI].notes.push(movedNote[0]);
			

			checkMarker=true;
		} else if(newBarI>args.bar) {
			movedNote = bars[args.bar].notes.splice(note, 1);
			note--;
			bars[newBarI].notes.push(movedNote[0]);
			newNoteI++;

			checkMarker=true;
		}

		if(checkMarker) {
			if(curIPage===args.iPage && curBar===args.bar && curNote===oldNote) {
				curBar=newBarI;
				curNote=newNoteI;
				curLine=bars[newBarI].line;
			}
			setNoteLines(bars, newBarI);
			checkMarker=false;
		}
		oldNote++;
	}

	if(args.bar===newBarI) {
		fillBar({bar: args.bar});
	}
}

function checkKey(bars, ibar, accidentals, sharpOrFlat) {
	if(bars[ibar].accidentals !== accidentals && bars[ibar].sharpOrFlat !== sharpOrFlat) {
		bars[ibar].changedAcc=true;
		//bars[ibar].naturals= bars[bar].accidentals-bars[ibar].accidentals;
	} else if(bars[ibar].accidentals === accidentals && bars[ibar].sharpOrFlat === sharpOrFlat) {
		bars[ibar].changedAcc=false;
		//bars[ibar].naturals=0;
	} 
}

function changeKey(args) { // eslint-disable-line no-unused-vars
	var bars= iPages[args.iPage].bars;

	if(bars[args.bar].accidentals!==args.accidentals || bars[args.bar].sharpOrFlat!==args.sharpOrFlat) {
		for(var ibar=args.bar+1; ibar<bars.length; ibar++) {
			bars[ibar].naturals = setNaturals(args.accidentals, args.sharpOrFlat, bars[ibar].accidentals, bars[ibar].sharpOrFlat);
			bars[ibar].naturalOrder = args.sharpOrFlat;

			checkKey(bars, ibar, args.accidentals, args.sharpOrFlat);

			break;
		}

		var naturals = [];
		if(args.bar!==0) {
			naturals = setNaturals(bars[args.bar-1].accidentals, bars[args.bar-1].sharpOrFlat, args.accidentals, args.sharpOrFlat);
			bars[args.bar].naturalOrder = bars[args.bar-1].sharpOrFlat;
		} 

		if(args.bar!==0 && (bars[args.bar-1].accidentals===args.accidentals && bars[args.bar-1].sharpOrFlat === args.sharpOrFlat)) {
			if(bars[args.bar].changedAcc) {
				bars[args.bar].changedAcc=false;
			}
		} else if(args.bar!==0 && (bars[args.bar-1].accidentals!==args.accidentals || bars[args.bar-1].sharpOrFlat !== args.sharpOrFlat)) {
			bars[args.bar].changedAcc=true;
			
		} else {
			bars[args.bar].changedAcc=true;
		}

		bars[args.bar].accidentals = args.accidentals;
		bars[args.bar].sharpOrFlat = args.sharpOrFlat;
		bars[args.bar].naturals = naturals;
		

		for(var note = 0; note<bars[args.bar].notes.length; note++) {
			for(var noteG=0; noteG<bars[args.bar].notes[note].noteGroups.length; noteG++) {
				updateAccidental(args.bar, bars[args.bar].notes[note].noteGroups[noteG], note, bars);
			}
		}
	}
	

	generateAll();
}

function setNaturals(oldAcc, oldSof, newBarAcc, newSof) {
	var naturals=[];

	for(var i = 1; i<=oldAcc; i++) {
		var order = i;
		if(oldSof===-1) order = 8-i;

		if((order<(8-newBarAcc) && newSof===-1) || (order>newBarAcc && newSof===1) || newSof===0) {
			naturals.push(order);
		}
	}

	return naturals;
}

function fillBar(args) {
	var totalTime = getSum(bars, args.bar);
	var requiredTime = bars[args.bar].upperSig/bars[args.bar].lowerSig;
	var difference;
	var restsToAdd=[];
	var duration = 1;
	var sum=0;
	if(totalTime===requiredTime) return;

	for(note=0; note<bars[args.bar].notes.length; note++) {
		sum+=getNoteDuration(bars[args.bar].notes[note]);
		while(sum>=1/bars[args.bar].lowerSig) {
			sum-=1/bars[args.bar].lowerSig;
		}
	}
	difference=1/bars[args.bar].lowerSig-sum;
	var aux = difference;

	while(aux>0) {
		if(duration<=aux) {
			restsToAdd.push(duration);
			aux-=duration;
		}

		duration/=2;
	}
	totalTime+=difference;
	restsToAdd.sort();

	while(totalTime<requiredTime) {
		restsToAdd.push(1/bars[args.bar].lowerSig);
		totalTime+=1/bars[args.bar].lowerSig;
	}

	addRests(restsToAdd);
	
	generateAll();
}

function addRests(rests) {
	for(var rest=0; rest<rests.length; rest++) {
		var information = {functionName: "placeNote", 
			args: {
				iPage: curIPage,
				bar: curBar, note:bars[curBar].notes.length, duration: rests[rest],
				line: curLine, pos: y+2, isSpace: true, newGroup: false
			},
			generate:true
		};
		placeNote(information.args);
		sendData(JSON.stringify(information));
	}
}