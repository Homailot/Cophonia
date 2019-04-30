function getSum(bar) { // eslint-disable-line no-unused-vars
	var sum = 0;

	for(var note = 0; note < bars[bar].notes.length; note++) {
		sum += getNoteDuration(bars[bar].notes[note]);
	}

	return sum;
}

function moveWith(offset, note, bar) { // eslint-disable-line no-unused-vars
	var lockedLine = bars[bar].line;
	if(bars[bar].line === lockedLine) bars[bar].xPos += offset;

	for(note; note < bars[bar].notes.length; note++) {
		if(bars[bar].line === lockedLine)bars[bar].notes[note].xPos += offset;
	}

	moveNext(offset, note, bar, lockedLine);
}

function moveNext(offset, note, bar, line) {
	for(bar+=1; bar < bars.length; bar++) {
		if(bars[bar].line === line) {
			bars[bar].xPos += offset;
			bars[bar].initPos += offset;

			for(note = 0; note < bars[bar].notes.length; note++) {
				bars[bar].notes[note].xPos += offset;
			}
		} 		
	}
}

function getYFromX(m, b, x) { // eslint-disable-line no-unused-vars
	return m*x+b;
}

function moveBars(bars, bar, line) { // eslint-disable-line no-unused-vars
	var movingLine = line;

	for(bar=bar; bar < bars.length; bar++) {
		var note;
		if(bars[bar].line !== movingLine) {
			movingLine++;
			lines[bars[bar].line].bars -= 1;
			if(lines[bars[bar].line].bars === 0) lines.splice(bars[bar].line, 1);
			bars[bar].line-=1;
			lines[bars[bar].line].bars +=1; 
			for(note = 0; note < bars[bar].notes.length; note++) {
				bars[bar].notes[note].line-=1;
			}
		} 
	}
}

function saveCanvas() { // eslint-disable-line no-unused-vars
	savedCanvas.width = c.width;
	savedCanvas.height = c.height;
	savedCanvas.ctx = savedCanvas.getContext("2d");
	savedCanvas.ctx.translate(0, 0);
	savedCanvas.ctx.drawImage(c, 0, 0);
}

function markerOutOfBounds() {  // eslint-disable-line no-unused-vars
	if(curBar>=bars.length) {
		curBar = bars.length-1;
	}

	if(curLine>=lines.length) {
		curLine = lines.length-1;
	}
}

function restoreCanvas() { // eslint-disable-line no-unused-vars
	ctx.clearRect(0, 0, c.width, 100000);
	ctx.drawImage(savedCanvas, -0.5, -0.5+scrollValue);
}