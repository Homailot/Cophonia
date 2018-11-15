function getSum(bar) {
	sum = 0;

	for(note = 0; note < bars[bar].notes.length; note++) {
		sum += bars[bar].notes[note].duration;
	}

	return sum;
}

function moveWith(offset, note, bar) {
	lockedLine = bars[bar].line
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

function changeTimeSig() {
	openHTMLDialog([])
}

function openHTMLDialog(contents) {
	if(document.getElementById("dialog")) {
		var dc = document.getElementById("dialogContainer");
		dc.removeChild(dc.childNodes[0]);
		return;
	} 
	var dialog = document.createElement('div');
	var height = 0;
	var minHeight = 200;
	dialog.style.width= '600px';
	dialog.style.minHeight = '200px';

	for(content = 0; content < contents.length; content++) {
		height += content.style.height;
	}

	if(height<minHeight) height = minHeight;
	dialog.style.height = height + 'px';
	dialog.style.zIndex = 5;
	dialog.style.position = 'absolute';
	dialog.style.border = "1px solid black"
	dialog.className = "rounded-top"
	dialog.id = "dialog";
	dialog.style.top = (window.innerHeight/2 - height/2-50) + 'px';
	dialog.style.left = (window.innerWidth/2- 300) + 'px';

	document.getElementById("dialogContainer").appendChild(dialog);
}