function getSum(bar) {
	var sum = 0;

	for(note = 0; note < bars[bar].notes.length; note++) {
		sum += getNoteDuration(bars[bar].notes[note]);
	}

	return sum;
}

function moveWith(offset, note, bar) {
	var lockedLine = bars[bar].line
	if(bars[bar].line == lockedLine) bars[bar].xPos += offset;

	for(note; note < bars[bar].notes.length; note++) {
		if(bars[bar].line == lockedLine)bars[bar].notes[note].xPos += offset;
	}

	moveNext(offset, note, bar, lockedLine);
}

function moveNext(offset, note, bar, line) {
	movingLine = curLine

	for(bar+=1; bar < bars.length; bar++) {
		if(bars[bar].line == line) {
			bars[bar].xPos += offset;
			bars[bar].initPos += offset;

			for(note = 0; note < bars[bar].notes.length; note++) {
				bars[bar].notes[note].xPos += offset;
			}
		} 		
	}
}

function getYFromX(m, b, x) {
	return m*x+b;
}

function moveBars(bar, forward, line) {
	var movingLine = line;

	for(bar=bar+1; bar < bars.length; bar++) {

		if(bars[bar].line != movingLine) {
			movingLine++;
			lines[bars[bar].line].bars -= 1;
			if(lines[bars[bar].line].bars == 0) lines.splice(bars[bar].line, 1);
			bars[bar].line-=1;
			lines[bars[bar].line].bars +=1; 
			for(note = 0; note < bars[bar].notes.length; note++) {
				bars[bar].notes[note].line-=1;
			}
		} else {
			difference = bars[bar].initPos

			if(bars[bar-1].line != movingLine) {
				startPos = 8;
				bars[bar].xPos = bars[bar].xPos-difference +  startPos;
				bars[bar].initPos = startPos;
				//startPos+=45
			} 
			else {
				startPos = bars[bar-1].xPos
				bars[bar].xPos = bars[bar].xPos-difference +  startPos;			
				bars[bar].initPos = startPos;
			} 
			for(note = 0; note< bars[bar].notes.length; note++) {
				bars[bar].notes[note].xPos = bars[bar].notes[note].xPos-difference + startPos
			}
		}
	}
}

function saveCanvas() {
	savedCanvas.width = c.width;
	savedCanvas.height = c.height;
	savedCanvas.ctx = savedCanvas.getContext("2d");
	savedCanvas.ctx.translate(0, 0);
	savedCanvas.ctx.drawImage(c, 0, 0);
}

function restoreCanvas() {
	ctx.clearRect(0, 0, c.width, 100000)
	ctx.drawImage(savedCanvas, -0.5, -0.5+scrollValue);
}