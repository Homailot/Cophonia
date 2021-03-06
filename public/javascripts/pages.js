function InstrumentPage() {  // eslint-disable-line no-unused-vars
	this.bars=[];
	this.lines=[];
	this.lines.push(new Line());
	this.lines[0].maxBars=3;
	this.instrument="piano";
	this.loadedInstrument=null;
	this.headerOffset=0;
    
	var line = 0;
	for(var bar=0; bar<bars.length; bar++) {
		line = checkLineOverflow(line, this.lines, bar);
        
		var newBar=new Bar();
		newBar.changedTimeSig=bars[bar].changedTimeSig;
		newBar.upperSig = bars[bar].upperSig;
		newBar.lowerSig=bars[bar].lowerSig;
		newBar.clef=bars[bar].clef;
		newBar.complete=bars[bar].complete;
		newBar.line=line;
		newBar.naturalOrder=bars[bar].naturalOrder;
		newBar.naturals=bars[bar].naturals;
		newBar.sharpOrFlat=bars[bar].sharpOrFlat;
		newBar.accidentals=bars[bar].accidentals;
		newBar.changedAcc=bars[bar].changedAcc;
		newBar.changedClef=bars[bar].changedClef;
		newBar.changedOrFirstClef=bars[bar].changedOrFirstClef;
		
		var note = new Note(0, 0, line, 1, 0, 0, true, 0,0);
		note.fullRest=true;

		newBar.notes.push(note);
		
		
		this.bars.push(newBar);
	}
}

var SheetDocument = {
	name: "Untitled",
	album: "Unknown",
	tempo: 120
};

function changePageInstrument(args) {
	iPages[args.page].instrument = args.instrument;
}