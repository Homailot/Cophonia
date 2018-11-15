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

function changeTimeSigPop(bar) {
	var form = document.createElement('form');
	form.classList.add('m-3');

	var formDiv = document.createElement('div');
	formDiv.classList.add('form-group')

	var sigSel = document.createElement('select');
	sigSel.classList.add('form-control');
	sigSel.id = "upperSig";

	var label = document.createElement('label');
	label.innerHTML="Upper Number:"
	label.for="upperSig";
	formDiv.appendChild(label)

	for(var num = 1; num<=32; num++) {
		var option = document.createElement('option');
		option.innerHTML = num;
		option.value=num;
		sigSel.appendChild(option);
	}

	form.style.height="auto";
	formDiv.appendChild(sigSel);
	form.appendChild(formDiv);

	formDiv = document.createElement('div');
	formDiv.classList.add('form-group')

	sigSel = document.createElement('select');
	sigSel.classList.add('form-control');
	sigSel.id = "lowerSig";

	label = document.createElement('label');
	label.innerHTML="Lower Number:"
	label.for="lowerSig";
	formDiv.appendChild(label)

	for(var num=1; num<=32; num*=2) {
		option = document.createElement('option');
		option.innerHTML = num;
		option.value=num;
		sigSel.appendChild(option);
	}

	formDiv.appendChild(sigSel);
	form.appendChild(formDiv);
	
	var submitButton = document.createElement('input');
	submitButton.type = "button";
	submitButton.classList.add("btn");
	submitButton.classList.add("btn-primary");
	submitButton.value = "Confirm";
	submitButton.addEventListener("click", function() {
		var upperOptions = document.getElementById("upperSig").options;
		var lowerOptions = document.getElementById("lowerSig").options;
		var upperSelected = document.getElementById("upperSig").selectedIndex;
		var lowerSelected = document.getElementById("lowerSig").selectedIndex;

		changeTimeSig(upperOptions[upperSelected].text, lowerOptions[lowerSelected].text, bar);

		var dc = document.getElementById("dialogContainer");
		dc.removeChild(dc.childNodes[0]);
	})

	form.appendChild(submitButton)

	openHTMLDialog([form])
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
	//dialog.style.minHeight = '200px';

	for(content = 0; content < contents.length; content++) {
		height += contents[content].scrollHeight;
		dialog.appendChild(contents[content])
	}
	
	dialog.style.zIndex = 5;
	dialog.style.position = 'absolute';
	dialog.style.backgroundColor = "#F9F7F7"
	dialog.classList.add("rounded-top");
	dialog.classList.add("shadow");
	dialog.id = "dialog";
	dialog.style.bottom = "0px"
	dialog.style.top = (window.innerHeight)+'px'
	dialog.style.left = (window.innerWidth/2- 300) + 'px';

	document.getElementById("dialogContainer").appendChild(dialog);


	document.getElementById("dialog").style.height = document.getElementById("dialog").scrollHeight+'px';
	slideElement(document.getElementById("dialog"), false);
}

var curContent;
var distance;
var position;
var curPosition;
var removeC;

function slideElement(content, remove) {
	curContent = content;
	position = window.innerHeight-content.scrollHeight;
	distance = (position-window.innerHeight)/50;
	removeC = remove;
	curPosition = window.innerHeight;

	
	setTimeout(moveElement, 4)
}

function moveElement() {
	curPosition+=distance;
	curContent.style.top=curPosition+'px';

	if(curPosition<=position) return;
	setTimeout(moveElement, 4)
}