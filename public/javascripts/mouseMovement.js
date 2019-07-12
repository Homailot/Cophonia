function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top + scrollValue
    };
}

var MouseSelection = function () {
    this.note = null;
    this.bar = null;
    this.iPage = null;
    this.pos = null;
};

function selectNote(note, bar, iPage, pos) {
    if(playing) return;
    if (!iPages[iPage].bars[bar].notes[note]) return;
    if (getNote(iPages[iPage].bars[bar].notes[note], pos) === -1 && !iPages[iPage].bars[bar].notes[note].isSpace) {
        if (selectedNotes[0]) return;
        else {
            pos = iPages[iPage].bars[bar].notes[note].noteGroups[0].pos - 2;
        }

    }

    selectedNotes[0] = new MouseSelection();
    selectedNotes[0].note = note;
    selectedNotes[0].bar = bar;
    selectedNotes[0].iPage = iPage;
    selectedNotes[0].pos = pos;


}


function checkMousePosition(evt) {
    if(playing) return;

    var mousePosition = getMousePos(c, evt);

    if (mousePosition.x > markers[uIndex].xPos + 20) {
        mouseRight(mousePosition);
        sendAndUpdateMarker();

    } else if (mousePosition.x < markers[uIndex].xPos) {
        mouseLeft(mousePosition);
        sendAndUpdateMarker();
    }

    mouseVertical(mousePosition);
}

function getClosestNote(x, bar) {
    var note;
    if(bars[bar].notes.length===0) return 0;
    var lowerBound = 0, upperBound = bars[bar].notes.length - 1, middlePos = (upperBound + lowerBound) / 2 >> 0;
    while (lowerBound <= upperBound) {

        if (bars[bar].notes[middlePos].xPos > x) {
            upperBound = middlePos - 1;

        } else if (bars[bar].notes[middlePos].xPos < x) {
            lowerBound = middlePos + 1;

        } else return middlePos;
        middlePos = (upperBound + lowerBound) / 2 >> 0;
    }
    if (upperBound < 0) {
        upperBound = 0;
    }
    if (lowerBound >= bars[bar].notes.length) {
        lowerBound = bars[bar].notes.length - 1;
    }

    return Math.abs(bars[bar].notes[lowerBound].xPos - x) < Math.abs(bars[bar].notes[upperBound].xPos - x) ? lowerBound : upperBound;
}

function mouseRight(mousePosition) {
    for (; curBar + 1 < bars.length && bars[curBar].xPos < mousePosition.x && bars[curBar + 1].line === curLine; curBar++ , curNote = 0, markers[uIndex].extended = false) {
        if (bars[curBar].notes.length === 0) {
			var information = {
				functionName: "placeNote",
				args: {
					iPage: curIPage,
					bar: curBar, note: 0, duration: 1,
					line: curLine, pos: 0, isSpace: true, newGroup: false, fullRest: true
				},
				generate: true
			};
			placeNote(information.args);
			sendData(JSON.stringify(information));
			generateAll();
		} else {
            fillBar({ bar: curBar });
        }
    }

    if (bars[curBar].notes.length === 0) return;
    var note = getClosestNote(mousePosition.x, curBar);
    curNote = note;

    var diff = Math.abs(bars[curBar].notes[curNote].xPos - mousePosition.x) > Math.abs(bars[curBar].xPos - mousePosition.x);
    if (curNote + 1 >= bars[curBar].notes.length) {
        if (diff && getSum(bars, curBar) < bars[curBar].upperSig / bars[curBar].lowerSig) {
            curNote++;

            if (!markers[uIndex].extended) {
                markers[uIndex].extended = true;
            }
        } else if (!diff) {
            markers[uIndex].extended = false;
        }
        updateCurMarker();
        generateAll();
        return;
    }

    restoreCanvas();
    drawSelected();
    updateCurMarker();
    drawMarker({ headerOffset: iPages[curIPage].headerOffset });
}

function mouseLeft(mousePosition) {
    if (curBar === 0 && curNote === 0 && !markers[uIndex].extended) return;
    for (; curBar - 1 >= 0 && bars[curBar].initPos > mousePosition.x && bars[curBar - 1].line === curLine; curBar-- , curNote = 0) {
        if (bars[curBar].notes.length === 0) {
			var information = {
				functionName: "placeNote",
				args: {
					iPage: curIPage,
					bar: curBar, note: 0, duration: 1,
					line: curLine, pos: 0, isSpace: true, newGroup: false, fullRest: true
				},
				generate: true
			};
			placeNote(information.args);
			sendData(JSON.stringify(information));
			generateAll();
		} else {
            fillBar({ bar: curBar });
        }
    }
    var note = getClosestNote(mousePosition.x, curBar);

    if (bars[curBar].notes.length!==0 && Math.abs(markers[uIndex].xPos - mousePosition.x) > Math.abs(bars[curBar].notes[note].xPos - mousePosition.x) && markers[uIndex].extended) {
        markers[uIndex].extended = false;

        curNote = note;

        updateCurMarker();
        generateAll();
        return;
    }

    if (markers[uIndex].extended) return;

    curNote = note;


    restoreCanvas();
    drawSelected();
    updateCurMarker();
    drawMarker({ headerOffset: iPages[curIPage].headerOffset });
}

function mouseVertical(mousePosition) {
    var v = 0;
    var ogLine = curLine;

    while (true) {
        if (mousePosition.y > markers[uIndex].yPos + 20) v = 1;
        else if (mousePosition.y < markers[uIndex].yPos + 6) v = -1;
        else break;

        temporaryChangePitch(v);

        if (markers[uIndex].y === 6) {
            if (lines[curLine + 1] && calculateYLine(curLine + 1, iPages[curIPage].headerOffset) + (curLine + 1) * 144 < mousePosition.y) {
                moveMouseToLine(1, mousePosition);
            } else break;

            if (bars[curBar].line === ogLine) break;

            ogLine = bars[curBar].line;
            curNote = getClosestNote(mousePosition.x, curBar);
            markers[uIndex].extended = false;
        } else if (markers[uIndex].y === -17) {
            if (lines[curLine - 1] && calculateYLine(curLine - 1, iPages[curIPage].headerOffset) + (curLine) * 144 > mousePosition.y) {
                moveMouseToLine(-1, mousePosition);
            } else break;

            if (bars[curBar].line === ogLine) break;

            ogLine = bars[curBar].line;
            curNote = getClosestNote(mousePosition.x, curBar);
            markers[uIndex].extended = false;
        }
    }

    if (v !== 0) {
        restoreCanvas();
        drawSelected();
        sendAndUpdateMarker();
        drawMarker({ headerOffset: iPages[curIPage].headerOffset });
    }
}

function moveMouseToLine(direction, mousePosition) {
    for (var bar = curBar + direction; bar >= 0 && bar < bars.length; bar += direction) {
        if (bars[bar].line !== curLine && bars[bar].initPos <= mousePosition.x && bars[bar].xPos >= mousePosition.x) {
            curNote = 0;
            fillBar({ bar: curBar });
            curBar = bar;
            curLine = bars[bar].line;
            break;
        }
    }

    updateCurMarker();
}

function clickMouse() {
    if(playing) return; 
    
    if (insertionTool) {
        enterNotes();

        var audioContext = new AudioContextFunc();
        changeInstrumentQuick(audioContext, curIPage, curBar, curNote);
       
    } else if (barTool) {
        executeBarFunctions();
    } else if (bars[curBar].notes[curNote]) {
        unselectNote();
    }
}

function executeBarFunctions() {
    var information;
    if (barFunction === 0) {
        information = {
            functionName: "insertBar",
            args: {
                bar: curBar,
                iPage: curIPage,
                line: curLine
            },
            generate: true
            
        };

        insertBar(information.args);
        sendData(JSON.stringify(information));
    } else if(barFunction===1) {
        inf = {
            functionName: "deleteBar",
            args: {
                iPage: curIPage,
                bar: curBar,
                line: curLine,
            },
            generate: true
        };

        deleteBar(inf.args);

        sendData(JSON.stringify(inf));
    } else if(barFunction===2) {
        fillBar({ bar: curBar });
		changeTimeSigPop(curBar);
    } else if(barFunction===3) {
        changeKeyPop(curBar);
    } else if(barFunction===4) {
        changeClefPop(curBar);
    }

    generateAll();
}

function unselectNote() {
    if (selectedNotes[0] && selectedNotes[0].bar === curBar && selectedNotes[0].note === curNote && selectedNotes[0].pos === y) {
        delete selectedNotes[0];
    } else {
        selectNote(curNote, curBar, curIPage, y);
        var audioContext = new AudioContextFunc();
        changeInstrumentQuick(audioContext, curIPage, curBar, curNote);

    }   

    restoreCanvas();
    drawSelected();
    drawMarker({ headerOffset: iPages[curIPage].headerOffset });
}
