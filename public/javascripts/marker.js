function Marker(bar, note, line) {
	this.xPos = 0;
	this.bar = bar;
	this.note = note;
	this.line = line;
	this.extended = false;
	this.iPage;
	this.y = y;
}

function setMarkerXPos(bar, note, lBars, def) {
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
	}else if(!extended || (extended && bar!=curBar)) {
		xPos = lBars[bar].notes[note].xPos;
	} else if(!extended && note>=lBars[bar].notes.length || extended) {
		return def;
	}
	return xPos;
}

function newMarker(args) {
	var marker = new Marker(args.bar, args.note, args.line);
	marker.iPage = args.iPage;
	var page = iPages[args.iPage];
	var lBars = page.bars;

	marker.xPos = setMarkerXPos(args.bar, args.note, lBars, markers.xPos);
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

	markers[args.index].xPos = setMarkerXPos(args.bar, args.note, iPages[args.iPage].bars, markers[args.index].xPos);
}

function sendMarker() {
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
			extended: extended
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
			y: y
		},
		generate: true
	}
	updateMarker(mInformation.args);
}

function updateAllXMarkers() {
	markers.forEach(function(marker) {
		marker.xPos=setMarkerXPos(marker.bar, marker.note, iPages[marker.iPage].bars, marker.xPos);
	});
}