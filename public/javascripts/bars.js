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
	args.line = checkLineOverflow(args.curLine, iPages[args.iPage].lines);
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
}

function checkLineOverflow(line, lines) {
	//checks if new line(meaning that we have 3 or more bars on the current line)
	if( lines[line].bars === 3 && line === 0 ||  lines[line].bars === 4 && line !==0) {
		//if we create a new line, then we check the current one as complete, then initialize the variables.
		lines.push(new Line());
		lines[line].complete = true;
		lines[line+1].bars++;
		lines[line+1].yOffset=0;
		//cC = true;
		line++;
	} else {
		lines[line].bars++;
	}

	return line;
}


function changeTimeSig(upperSig, lowerSig, bar) { // eslint-disable-line no-unused-vars
	for(var ibar = bar+1; ibar<bars.length; ibar++) {
		if(bars[ibar].upperSig === bars[bar].upperSig && bars[ibar].lowerSig === bars[bar].lowerSig) {
			bars[ibar].changedTimeSig=true;
			break;
		} else if(bars[ibar].upperSig === upperSig && bars[ibar].lowerSig === lowerSig) {
			bars[ibar].changedTimeSig=false;
			break;
		}
	}

	bars[bar].upperSig = upperSig;
	bars[bar].lowerSig = lowerSig;
	if(bar!==0 && (bars[bar-1].upperSig!==bars[bar].upperSig || bars[bar].lowerSig !== bars[bar-1].lowerSig)) {
		if(!bars[bar].changedTimeSig) {
			Marker.xPos+=35;
			//bars[bar].xPos+= 35;
			bars[bar].changedTimeSig=true;
		}
	} else if(bar!==0 && (bars[bar-1].upperSig===bars[bar].upperSig && bars[bar].lowerSig === bars[bar-1].lowerSig)) {
		if(bars[bar].changedTimeSig) {
			Marker.xPos-=35;
			//bars[bar].xPos-= 35;
			bars[bar].changedTimeSig=false;
		}
	}

	generateAll();
}

function changeKey(accidentals, sharpOrFlat, bar) { // eslint-disable-line no-unused-vars
	if(bars[bar].accidentals!==accidentals || bars[bar].sharpOrFlat!==sharpOrFlat) {
		for(var ibar=bar+1; ibar<bars.length; ibar++) {
			bars[ibar].naturals = setNaturals(accidentals, sharpOrFlat, bars[ibar].accidentals, bars[ibar].sharpOrFlat);
			bars[ibar].naturalOrder = sharpOrFlat;

			if(bars[ibar].accidentals === bars[bar].accidentals && bars[ibar].sharpOrFlat === bars[bar].sharpOrFlat) {
				bars[ibar].changedAcc=true;
				//bars[ibar].naturals= bars[bar].accidentals-bars[ibar].accidentals;
			} else if(bars[ibar].accidentals === accidentals && bars[ibar].sharpOrFlat === sharpOrFlat) {
				bars[ibar].changedAcc=false;
				//bars[ibar].naturals=0;
			} 

			break;
		}

		var naturals = [];
		if(bar!==0) {
			naturals = setNaturals(bars[bar-1].accidentals, bars[bar-1].sharpOrFlat, accidentals, sharpOrFlat);
			bars[bar].naturalOrder = bars[bar-1].sharpOrFlat;
		} 

		if(bar!==0 && (bars[bar-1].accidentals===accidentals && bars[bar-1].sharpOrFlat === sharpOrFlat)) {
			if(bars[bar].changedAcc) {
				bars[bar].changedAcc=false;
			}
		} else if(bar!==0 && (bars[bar-1].accidentals!==accidentals || bars[bar-1].sharpOrFlat !== sharpOrFlat)) {
			bars[bar].changedAcc=true;
			
		} else {
			bars[bar].changedAcc=true;
		}

		bars[bar].accidentals = accidentals;
		bars[bar].sharpOrFlat = sharpOrFlat;
		bars[bar].naturals = naturals;
		

		for(var note = 0; note<bars[bar].notes.length; note++) {
			for(var noteG=0; noteG<bars[bar].notes[note].noteGroups.length; noteG++) {
				bars[bar].notes[note].noteGroups[noteG].updateAccidental(bar, bars[bar].notes[note], note);
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