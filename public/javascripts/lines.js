function Line() {
	this.bars = 0;
	this.complete = false;
	this.changedComplete = false;
	this.overflown = false;
	this.yOffset=0;
}

function LineFunction(pointAX, pointAY, pointBX, pointBY) {
	this.m = (pointAY-pointBY) / (pointAX - pointBX);
	this.b = pointAY - this.m * pointAX;
}
