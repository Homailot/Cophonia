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
	if( lines[line].bars === lines[line].maxBars) {
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

function checkTimeSig(bars, ibar, upperSig, lowerSig) {
	if(bars[ibar].upperSig !== upperSig && bars[ibar].lowerSig !== lowerSig) {
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
	if(args.bar!==0 && (bars[args.bar-1].args.upperSig!==bars[args.bar].args.upperSig || bars[args.bar].args.lowerSig !== bars[args.bar-1].args.lowerSig)) {
		if(!bars[args.bar].changedTimeSig) {
			bars[args.bar].changedTimeSig=true;
		}
	} else if(args.bar!==0 && (bars[args.bar-1].args.upperSig===bars[args.bar].args.upperSig && bars[args.bar].args.lowerSig === bars[args.bar-1].args.lowerSig)) {
		if(bars[args.bar].changedTimeSig) {
			bars[args.bar].changedTimeSig=false;
		}
	}

	generateAll();
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
				bars[args.bar].notes[note].noteGroups[noteG].updateAccidental(args.bar, bars[args.bar].notes[note], note, bars);
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