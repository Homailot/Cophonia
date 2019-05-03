function Line() { // eslint-disable-line no-unused-vars
	this.bars = 0;
	this.complete = false;
	this.changedComplete = false;
	this.overflown = false;
	this.yOffset=0;
	this.maxBars=4;
}

function LineFunction(pointAX, pointAY, pointBX, pointBY) { // eslint-disable-line no-unused-vars
	this.m = (pointAY-pointBY) / (pointAX - pointBX);
	this.b = pointAY - this.m * pointAX;
}

function calculateYLine(lineTo, headerOffset) {
	var yOffset=0;
	for(var line = 0; line<=lineTo; line++) {
		yOffset+=lines[line].yOffset;
	}
	yOffset+=headerOffset;

	return yOffset;
}
