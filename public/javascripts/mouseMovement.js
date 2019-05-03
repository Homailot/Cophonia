function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return {
      x: evt.clientX - rect.left,
      y: evt.clientY - rect.top + scrollValue
    };
}

var Mouse = {
    lastRight: 0,
    lastLeft: 0,
};


function checkMousePosition(evt) {
    var mousePosition = getMousePos(c, evt);
    console.log(mousePosition.y);

    if(mousePosition.x>=markers[uIndex].xPos && mousePosition.x<=markers[uIndex].xPos+20) {
        Mouse.lastLeft=markers[uIndex].xPos+20;
		Mouse.lastRight=markers[uIndex].xPos;
    }

    if(mousePosition.x>markers[uIndex].xPos+20 && mousePosition.x>=Mouse.lastLeft) {
        Mouse.lastRight=markers[uIndex].xPos+20;
        mouseRight();
       
    } else if(mousePosition.x<markers[uIndex].xPos && mousePosition.x<=Mouse.lastRight) {
        Mouse.lastLeft=markers[uIndex].xPos;
        mouseLeft();
    }

    mouseVertical(mousePosition);
}

function mouseRight() {
    if(curBar+1<bars.length && bars[curBar].line!==bars[curBar+1].line && (curNote+1>bars[curBar].notes.length || bars[curBar].notes.length===0)) {
        return;
    }
    if(curBar+1<bars.length || curNote+1<=bars[curBar].notes.length) {
        moveRight(false);
    }
    
}

function mouseLeft() {
    if(curBar-1>=0 && bars[curBar].line!=bars[curBar-1].line) return;
    moveLeft();
}

function mouseVertical(mousePosition) {
    var v=0;
    var ogLine=curLine;

    while(true) {
        if(mousePosition.y>markers[uIndex].yPos+26) v=1;
        else if(mousePosition.y<markers[uIndex].yPos) v=-1;
        else break;

        temporaryChangePitch(v);

        if(markers[uIndex].y===6) {
            if(lines[curLine+1] && calculateYLine(curLine+1, iPages[curIPage].headerOffset)+(curLine+1)*144<mousePosition.y) {
                moveMouseToLine(1, mousePosition);
            } else break;

            if(bars[curBar].line===ogLine) break;

            ogLine=bars[curBar].line;
        } else if(markers[uIndex].y===-17) {
            if(lines[curLine-1] && calculateYLine(curLine-1, iPages[curIPage].headerOffset)+(curLine)*144>mousePosition.y) {
                moveMouseToLine(-1, mousePosition);
            } else break;

            if(bars[curBar].line===ogLine) break;

            ogLine=bars[curBar].line;
        }
    }
    
    if(v!==0) {
        restoreCanvas();
	    sendAndUpdateMarker();
	    drawMarker({ headerOffset: iPages[curIPage].headerOffset });
    }
}

function moveMouseToLine(direction, mousePosition) {
    for(var bar=curBar+direction; bar>=0 && bar<bars.length; bar+=direction) {
        if(bars[bar].line!==curLine && bars[bar].initPos<=mousePosition.x && bars[bar].xPos>=mousePosition.x){
            curNote=0;
            curBar=bar;
            curLine=bars[bar].line;
            break;
        }
    }

    updateCurMarker();
}

function clickMouse() {
    enterNotes();
}