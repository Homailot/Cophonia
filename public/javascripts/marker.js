function Marker(bar, note, line) {
	this.xPos = 0;
	this.bar = bar;
	this.note = note;
	this.line = line;
	this.extended = false;
	this.iPage;
	this.y = y;
}

function setMarkerXPos(bar, note, lBars, def, ext, page) {
	var xPos;
	if(note === 0) {
		xPos = lBars[bar].initPos+10;

		if(lBars[bar].changedTimeSig) {
			xPos +=35;
			if(lBars[bar].upperSig.length>1 || lBars[bar].lowerSig.length>1) {
				xPos+=15;
			}
		}
		if(lBars[bar].changedOrFirstClef) xPos += 45;
		if(lBars[bar].changedAcc || lBars[bar].firstAcc) {
			xPos += (lBars[bar].accidentals+lBars[bar].naturals.length)*18;
		}
		if(lBars[bar].notes.length>0) {
			xPos=(lBars[bar].notes[0].xPos);
		}
	}else if(!ext) {
		if(lBars[bar].notes[note]!==undefined){
			xPos = lBars[bar].notes[note].xPos;
		} else {
			return def;
		}
	} else if(ext) {
		if(curNote===note && page===curIPage && bar===curBar) xPos = def;
		else xPos = lBars[bar].notes[lBars[bar].notes.length-1].xPos;
	}
	return xPos;
}

function newMarker(args) {
	var marker = new Marker(args.bar, args.note, args.line);
	marker.iPage = args.iPage;
	marker.extended=args.extended;
	var page = iPages[args.iPage];
	var lBars = page.bars;
	marker.xPos = setMarkerXPos(args.bar, args.note, lBars, marker.xPos, args.extended, args.iPage);
	marker.y = args.y;
	markers[args.index]=marker;
	console.log(args.index+ "created!" +  markers[args.index]);
}

function updateMarker(args) {
	markers[args.index].bar = args.bar; 
	markers[args.index].note = args.note; 
	markers[args.index].line = args.line;
	markers[args.index].iPage = args.iPage; 
	markers[args.index].y  = args.y;
	markers[args.index].extended = args.extended;

	markers[args.index].xPos = setMarkerXPos(args.bar, args.note, iPages[args.iPage].bars, markers[args.index].xPos, args.extended, args.iPage);
}

function sendMarker() {
	console.log(markers[uIndex].extended);
	var mInformation = {
		functionName: "newMarker",
		args: {
			index: uIndex,
			bar: markers[uIndex].bar,
			note: markers[uIndex].note,
			line: markers[uIndex].line,
			iPage: markers[uIndex].iPage,
			y: markers[uIndex].y,
			extended: markers[uIndex].extended
		},
		generate: true
	}
	sendData(JSON.stringify(mInformation));
}

function sendAndUpdateMarker() {
	var mInformation = {
		functionName: "updateMarker",
		args: {
			index: uIndex,
			bar: curBar,
			note: curNote,
			line: curLine,
			iPage: curIPage,
			y: y,
			extended: markers[uIndex].extended
		},
		generate: true
	}
	sendData(JSON.stringify(mInformation));
	updateMarker(mInformation.args);
}

function updateCurMarker() {
	var mInformation = {
		functionName: "updateMarker",
		args: {
			index: uIndex,
			bar: curBar,
			note: curNote,
			line: curLine,
			iPage: curIPage,
			extended: markers[uIndex].extended,
			y: y
		},
		generate: true
	}
	updateMarker(mInformation.args);
}

function updateAllXMarkers() {
	for(var marker in markers) {
		// if(markers[marker].extended && iPages[markers[marker].iPage].bars[markers[marker].bar].notes[markers[marker].note]!==undefined) {
		// 	markers[marker].extended=false;
		// } 
		markers[marker].xPos=setMarkerXPos(markers[marker].bar, markers[marker].note, iPages[markers[marker].iPage].bars, markers[marker].xPos, markers[marker].extended, markers[marker].iPage);
	
	}
}