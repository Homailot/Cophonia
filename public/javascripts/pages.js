function InstrumentPage() {  // eslint-disable-line no-unused-vars
	this.bars=[];
	this.lines=[];
	this.lines.push(new Line());
	this.instrument=null;
    
	var line = 0;
	for(var bar=0; bar<bars.length; bar++) {
		line = checkLineOverflow(line, this.lines);
        
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
		
		this.bars.push(newBar);
	}
}