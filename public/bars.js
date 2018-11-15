function Bar(upperSig, lowerSig, changedTimeSig, clef, changedOrFirstClef, xPos, line, cA) {
	this.upperSig = upperSig;
	this.lowerSig = lowerSig;
	this.changedTimeSig = changedTimeSig;
	this.clef = clef;
	this.changedOrFirstClef = changedOrFirstClef;
	this.changedClef = changedOrFirstClef
	this.complete = false;
	//xPos = end of bar
	this.xPos = xPos+40;

	//initPos = start of bar
	this.initPos = xPos;
	this.line = line;
	this.notes = new Array();
	this.sharpOrFlat = -1;
	this.accidentals = 7;
	this.firstAcc;
	this.changedAcc = cA;
}

function newBar(upperSig, lowerSig, cS, clef, cC, xPos, line, cA) {
	//checks if new line(meaning that we have 3 or more bars on the current line)
	if(lines[curLine].bars == 3 && line == 0 || lines[curLine].bars == 4 && line !=0) {
		//if we create a new line, then we check the current one as complete, then initialize the variables.
		lines.push(new Line());
		lines[curLine].complete = true;
		lines[curLine+1].bars++;
		xPos = 8;
		//cC = true;
		line++;
	} else lines[curLine].bars++;

	//creates the new bar and initializes it's xPosition depending on the values.
	var bar = new Bar(upperSig, lowerSig, cS, clef, cC, xPos, line, cA);
	if(cS) {
		xPos+=35
		bar.xPos+= 35;
	} 
	if(cC) {
		xPos += 45;
		bar.xPos+=45;
	}
	if(cA) {
		xPos+=(bar.accidentals)*18;
		bar.xPos += (bar.accidentals)*18;
	}
	

	//we insert the bar in the array at the current position
	bars.splice(curBar, 0, bar);
	
	
	return xPos;
}

function changeTimeSig(upperSig, lowerSig, bar) {
	for(var ibar = bar+1; ibar<bars.length; ibar++) {
		if(bars[ibar].upperSig == bars[bar].upperSig && bars[ibar].lowerSig == bars[bar].lowerSig) {
			bars[ibar].changedTimeSig=true; 
			moveWith(35, 0, ibar);
		} else if(bars[ibar].upperSig == upperSig && bars[ibar].lowerSig == lowerSig) {
			bars[ibar].changedTimeSig=false; 
			moveWith(-35, 0, ibar);
		}
	}

	bars[bar].upperSig = upperSig;
	bars[bar].lowerSig = lowerSig;
	if(bar!=0 && (bars[bar-1].upperSig!=bars[bar].upperSig || bars[bar].lowerSig != bars[bar-1].lowerSig)) {
		if(!bars[bar].changedTimeSig) {
			Marker.xPos+=35;
			//bars[bar].xPos+= 35;
			bars[bar].changedTimeSig=true; 
			moveWith(35, 0, bar);
		}
	} else if(bar!=0 && (bars[bar-1].upperSig==bars[bar].upperSig && bars[bar].lowerSig == bars[bar-1].lowerSig)) {
		if(bars[bar].changedTimeSig) {
			Marker.xPos-=35;
			//bars[bar].xPos-= 35;
			bars[bar].changedTimeSig=false; 
			moveWith(-35, 0, bar);
		}
	}

	generateAll();
}