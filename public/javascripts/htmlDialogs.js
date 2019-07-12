function changeTimeSigPop(bar) { // eslint-disable-line no-unused-vars
	var form = document.createElement("form");
	form.classList.add("m-3");

	var formDiv = document.createElement("div");
	formDiv.classList.add("form-group");

	var sigSel = document.createElement("select");
	sigSel.classList.add("form-control");
	sigSel.id = "upperSig";

	var label = document.createElement("label");
	label.innerHTML = "Número de batidas:";
	label.for = "upperSig";
	formDiv.appendChild(label);
	var option;

	for (var num = 1; num <= 32; num++) {
		option = document.createElement("option");
		option.innerHTML = num;
		option.value = num;
		if(bars[bar].upperSig === num) option.selected=true;
		sigSel.appendChild(option);
	}

	form.style.height = "auto";
	formDiv.appendChild(sigSel);
	form.appendChild(formDiv);

	formDiv = document.createElement("div");
	formDiv.classList.add("form-group");

	sigSel = document.createElement("select");
	sigSel.classList.add("form-control");
	sigSel.id = "lowerSig";

	label = document.createElement("label");
	label.innerHTML = "Duração das batidas:";
	label.for = "lowerSig";
	formDiv.appendChild(label);

	for (var nums = 1; nums <= 32; nums *= 2) {
		option = document.createElement("option");
		option.innerHTML = nums;
		option.value = nums;
		if(bars[bar].lowerSig === nums) option.selected=true;
		sigSel.appendChild(option);
	}

	var p = document.createElement("p");
	p.innerHTML = "Cuidado, esta operação pode apagar algumas notas no compasso selecionado!";

	formDiv.appendChild(sigSel);
	formDiv.appendChild(p);
	form.appendChild(formDiv);

	var submitButton = document.createElement("input");
	submitButton.type = "button";
	submitButton.classList.add("btn");
	submitButton.value = "Confirmar";
	submitButton.addEventListener("click", function () {
		var upperOptions = document.getElementById("upperSig").options;
		var lowerOptions = document.getElementById("lowerSig").options;
		var upperSelected = document.getElementById("upperSig").selectedIndex;
		var lowerSelected = document.getElementById("lowerSig").selectedIndex;

		inf = {
			functionName: "changeTimeSig",
			args: {
				iPage: curIPage,
				upperSig: parseInt(upperOptions[upperSelected].text),
				lowerSig: parseInt(lowerOptions[lowerSelected].text),
				bar: bar
			},
			generate: false
		};
		changeTimeSig(inf.args);
		sendData(JSON.stringify(inf));

		var dc = document.getElementById("dialogContainer");
		dc.removeChild(dc.childNodes[0]);
	});

	form.appendChild(submitButton);

	openHTMLDialog([form]);
}

function changeKeyPop(bar) { // eslint-disable-line no-unused-vars
	var form = document.createElement("form");
	form.classList.add("m-3");

	var formDiv = document.createElement("div");
	formDiv.classList.add("form-group");

	var keySel = document.createElement("select");
	keySel.classList.add("form-control");
	keySel.id = "keySel";

	var label = document.createElement("label");
	label.innerHTML = "Armação de clave:";
	label.for = "keySel";
	formDiv.appendChild(label);

	var option = document.createElement("option");
	option.innerHTML = "Cb (bbbbbbb)";
	option.value = "7:-1";
	keySel.appendChild(option);

	option = document.createElement("option");
	option.innerHTML = "Gb (bbbbbb)";
	option.value = "6:-1";
	keySel.appendChild(option);

	option = document.createElement("option");
	option.innerHTML = "Db (bbbbb)";
	option.value = "5:-1";
	keySel.appendChild(option);

	option = document.createElement("option");
	option.innerHTML = "Ab (bbbb)";
	option.value = "4:-1";
	keySel.appendChild(option);

	option = document.createElement("option");
	option.innerHTML = "Eb (bbb)";
	option.value = "3:-1";
	keySel.appendChild(option);

	option = document.createElement("option");
	option.innerHTML = "Bb (bb)";
	option.value = "2:-1";
	keySel.appendChild(option);

	option = document.createElement("option");
	option.innerHTML = "F (b)";
	option.value = "1:-1";
	keySel.appendChild(option);

	option = document.createElement("option");
	option.innerHTML = "C";
	option.value = "0:0";
	keySel.appendChild(option);

	option = document.createElement("option");
	option.innerHTML = "G (#)";
	option.value = "1:1";
	keySel.appendChild(option);

	option = document.createElement("option");
	option.innerHTML = "D (##)";
	option.value = "2:1";
	keySel.appendChild(option);

	option = document.createElement("option");
	option.innerHTML = "A (###)";
	option.value = "3:1";
	keySel.appendChild(option);

	option = document.createElement("option");
	option.innerHTML = "E (####)";
	option.value = "4:1";
	keySel.appendChild(option);

	option = document.createElement("option");
	option.innerHTML = "B (#####)";
	option.value = "5:1";
	keySel.appendChild(option);

	option = document.createElement("option");
	option.innerHTML = "F# (######)";
	option.value = "6:1";
	keySel.appendChild(option);

	option = document.createElement("option");
	option.innerHTML = "C# (#######)";
	option.value = "7:1";
	keySel.appendChild(option);

	formDiv.appendChild(keySel);
	form.appendChild(formDiv);

	var submitButton = document.createElement("input");
	submitButton.type = "button";
	submitButton.classList.add("btn");
	submitButton.value = "Confirmar";
	submitButton.addEventListener("click", function () {
		var index = document.getElementById("keySel").selectedIndex;
		var options = document.getElementById("keySel").options;
		var value = options[index].value;
		var accidentals = parseInt(value.substring(0, 1));
		var sharpOrFlat = parseInt(value.substring(2));

		inf = {
			functionName: "changeKey",
			args: {
				iPage: curIPage,
				accidentals: accidentals,
				sharpOrFlat: sharpOrFlat,
				bar: bar
			},
			generate: false
		};
		changeKey(inf.args);
		sendData(JSON.stringify(inf));

		var dc = document.getElementById("dialogContainer");
		dc.removeChild(dc.childNodes[0]);
	});

	form.appendChild(submitButton);

	openHTMLDialog([form]);
}

function addCollaborator() { // eslint-disable-line no-unused-vars
	var form = document.createElement("form");
	form.classList.add("m-3");

	var formDiv = document.createElement("div");
	formDiv.classList.add("form-group");

	var colabText = document.createElement("input");
	colabText.classList.add("form-control");
	colabText.id = "colab";
	colabText.addEventListener("load", function() {
	});

	var label = document.createElement("label");
	label.innerHTML = "Nome do colaborador:";
	label.for = "colab";
	formDiv.appendChild(label);

	form.style.height = "auto";
	formDiv.appendChild(colabText);
	form.appendChild(formDiv);

	var submitButton = document.createElement("input");
	submitButton.type = "button";
	submitButton.classList.add("btn");
	submitButton.value = "Confirmar";
	submitButton.addEventListener("click", function () {
		var userName = document.getElementById("colab").value;

		socket.emit("add collab", userName, songId);

		// var dc = document.getElementById("dialogContainer");
		// dc.removeChild(dc.childNodes[0]);
	});

	form.appendChild(submitButton);

	openHTMLDialog([form]);
}


function showMessage(message) { // eslint-disable-line no-unused-vars
	var dc = document.getElementById("dialogContainer");

	if(dc.childNodes.length>0) {
		dc.removeChild(dc.childNodes[0]);
	}
	var form = document.createElement("form");
	form.classList.add("m-3");

	var formDiv = document.createElement("div");
	formDiv.classList.add("form-group");

	var label = document.createElement("p");
	label.innerHTML = message;
	formDiv.appendChild(label);

	form.style.height = "auto";
	form.appendChild(formDiv);

	var submitButton = document.createElement("input");
	submitButton.type = "button";
	submitButton.classList.add("btn");
	submitButton.value = "OK";
	submitButton.addEventListener("click", function () {
		if (document.getElementById("dialog")) {
			var dc = document.getElementById("dialogContainer");
			dc.removeChild(dc.childNodes[0]);
		}
	});

	form.appendChild(submitButton);

	openHTMLDialog([form]);
}

function showConf(message,id) { // eslint-disable-line no-unused-vars
	var dc = document.getElementById("dialogContainer");

	if(dc.childNodes.length>0) {
		dc.removeChild(dc.childNodes[0]);
	}
	var form = document.createElement("form");
	form.classList.add("m-3");

	var formDiv = document.createElement("div");
	formDiv.classList.add("form-group");

	var label = document.createElement("p");
	label.innerHTML = message;
	formDiv.appendChild(label);

	form.style.height = "auto";
	form.appendChild(formDiv);

	var submitButton = document.createElement("input");
	submitButton.type = "button";
	submitButton.classList.add("btn");
	submitButton.value = "Sim";
	submitButton.addEventListener("click", function () {
		if (document.getElementById("dialog")) {
			var dc = document.getElementById("dialogContainer");
			dc.removeChild(dc.childNodes[0]);
		}

		document.forms["form"+id].submit();
	});

	var rejectButton = document.createElement("input");
	rejectButton.type = "button";
	rejectButton.style = "margin-left: 20px;";
	rejectButton.classList.add("btn");
	rejectButton.value = "Não";
	rejectButton.addEventListener("click", function () {
		if (document.getElementById("dialog")) {
			var dc = document.getElementById("dialogContainer");
			dc.removeChild(dc.childNodes[0]);
		}
	});


	form.appendChild(submitButton);
	form.appendChild(rejectButton);

	openHTMLDialog([form]);
}

function openHTMLDialog(contents) {
	if (document.getElementById("dialog")) {
		var dc = document.getElementById("dialogContainer");
		dc.removeChild(dc.childNodes[0]);
		return;
	}
	var dialog = document.createElement("div");
	dialog.style.width = "600px";
	//dialog.style.minHeight = '200px';

	for (var content = 0; content < contents.length; content++) {
		dialog.appendChild(contents[content]);
	}

	dialog.style.zIndex = 5;
	dialog.style.position = "fixed";
	dialog.style.backgroundColor = "#3d373e";
	dialog.style.color = "white";
	dialog.classList.add("rounded-top");
	dialog.classList.add("shadow");
	dialog.id = "dialog";
	dialog.style.top = window.innerHeight + "px";
	dialog.style.left = (window.innerWidth / 2 - 300) + "px";

	document.getElementById("dialogContainer").appendChild(dialog);


	document.getElementById("dialog").style.height = document.getElementById("dialog").scrollHeight + "px";
	slideElement(document.getElementById("dialog"));

	if(document.getElementById("colab")) document.getElementById("colab").focus();
}

var curContent;

function slideElement(content) {
	curContent = content;

	setTimeout(moveElement, 4);
}

function moveElement() {
	curContent.style.top = (window.innerHeight - curContent.scrollHeight) + "px";
}

function menuDuration(menu, isShortcut) {
	if (playing) return;
	if (document.getElementById("dialog")) {
		var dc = document.getElementById("dialogContainer");
		dc.removeChild(dc.childNodes[0]);
	}
	for (var b = 0; b <= 3; b++) {
		document.getElementById("bar" + b).classList.remove("focus");
	}
	barTool = false;

	for (var m = 0; m <= 6; m++) {
		if (menu === m) {
			if (gDurations[m] === curDuration && insertionTool) {
				document.getElementById("duration" + m).classList.remove("focus");
				insertionTool = false;
				return;
			}
			document.getElementById("duration" + m).classList.add("focus");
			insertionTool = true;
		} else {
			document.getElementById("duration" + m).classList.remove("focus");
		}
	}
	curDuration = gDurations[menu];
	

	if (!selectedNotes[0]) return;

	var inf = {
		functionName: "changeDuration",
		args: {
			note: selectedNotes[0].note,
			duration: curDuration,
			iPage: curIPage,
			bar: selectedNotes[0].bar
		},
		generate: false
	};
	changeDuration(inf.args);
	sendData(JSON.stringify(inf));
}

function menuAccidental(value) {
	if (playing) return;
	if (!selectedNotes[0]) return;

	var inf = {
		functionName: "changeAccidental",
		args: {
			bar: selectedNotes[0].bar,
			note: selectedNotes[0].note,
			y: selectedNotes[0].pos,
			value: value,
			iPage: curIPage
		},
		generate: true
	};
	changeAccidental(inf.args);
	var audioContext = new AudioContextFunc();
	changeInstrumentQuick("https://surikov.github.io/webaudiofontdata/sound/0001_FluidR3_GM_sf2_file.js", "_tone_0001_FluidR3_GM_sf2_file", audioContext, curBar, curNote);

	sendData(JSON.stringify(inf));

	generateAll();
}

function menuDot() {
	if (playing) return;
	if (!selectedNotes[0]) return;

	var inf = {
		functionName: "augment",
		args: {
			bar: selectedNotes[0].bar,
			note: selectedNotes[0].note,
			value: 1,
			iPage: curIPage
		},
		generate: true
	};
	if (ctrlPress) {
		inf.args.value = -1;
	}
	augment(inf.args);
	sendData(JSON.stringify(inf));

	generateAll();
}

function menuTie() {
	if (playing) return;
	if (!selectedNotes[0]) return;

	var n = getNote(bars[selectedNotes[0].bar].notes[selectedNotes[0].note], y);
	var inf;

	if (n !== -1 && bars[selectedNotes[0].bar].notes[selectedNotes[0].note].noteGroups[n].tiesTo !== false) {
		inf = {
			functionName: "deleteTie",
			args: {
				iPage: curIPage,
				note: selectedNotes[0].note,
				bar: selectedNotes[0].bar,
				y: selectedNotes[0].pos
			},
			generate: true
		};

		deleteTie(inf.args);
	} else {
		inf = {
			functionName: "tieBeat",
			args: {
				iPage: curIPage,
				note: selectedNotes[0].note,
				tieTo: selectedNotes[0].note + 1,
				bar: selectedNotes[0].bar,
				y: selectedNotes[0].pos
			},
			generate: true
		};

		tieBeat(inf.args);
	}

	sendData(JSON.stringify(inf));

	generateAll();
}

function menuDeleteNote() {
	if (playing) return;
	if (!selectedNotes[0]) return;

	var inf = {
		functionName: "deleteNote",
		args: {
			bar: selectedNotes[0].bar,
			note: selectedNotes[0].note,
			iPage: curIPage,
			duration: bars[selectedNotes[0].bar].notes[selectedNotes[0].note].duration,
			line: curLine,
			y: selectedNotes[0].pos + 2
		},
		generate: true
	};
	deleteNote(inf.args);
	var audioContext = new AudioContextFunc();
	changeInstrumentQuick("https://surikov.github.io/webaudiofontdata/sound/0001_FluidR3_GM_sf2_file.js", "_tone_0001_FluidR3_GM_sf2_file", audioContext, curBar, curNote);

	sendData(JSON.stringify(inf));


	generateAll();
}

function menuInsert() {
	if (playing) return;
	if (!selectedNotes[0]) return;

	var inf = {
		functionName: "insertBeat",
		args: {
			iPage: curIPage,
			bar: selectedNotes[0].bar, note: selectedNotes[0].note, duration: curDuration,
			line: curLine, y: selectedNotes[0].pos + 2
		},
		generate: true
	};

	insertBeat(inf.args);
	sendData(JSON.stringify(inf));
	generateAll();
}

function menuAdd(menu) {
	if (document.getElementById("dialog")) {
		var dc = document.getElementById("dialogContainer");
		dc.removeChild(dc.childNodes[0]);
	}
	if (playing) return;
	for (var m = 0; m <= 6; m++) {
		document.getElementById("duration" + m).classList.remove("focus");
	}
	insertionTool = false;

	for (var b = 0; b <= 4; b++) {
		if (menu === b) {
			if (barFunction === b && barTool) {
				document.getElementById("bar" + b).classList.remove("focus");
				barTool = false;
				return;
			}
			document.getElementById("bar" + b).classList.add("focus");
			barTool = true;
		} else {
			document.getElementById("bar" + b).classList.remove("focus");
		}
	}
	

	barFunction = menu;
}

function menuPlay() {
	if (!playing) {

		if(timeTimeout) clearTimeout(timeTimeout);
		var audioContext = new AudioContextFunc();
		changeInstrument(audioContext, 0);

	} else {
		if(timeTimeout) clearTimeout(timeTimeout);
		restoreCanvas(); playing = false;
		drawSelected();
		generateAll();
	}
}

function menuIPage(skip) {
	if (curIPage + skip < iPages.length && curIPage + skip >= 0) curIPage += skip;
	curNote = 0;
	bars = iPages[curIPage].bars;
	lines = iPages[curIPage].lines;

	if (curBar >= bars.length) {
		curBar = bars.length - 1;
	}
	delete selectedNotes[0];
	selectNote(curNote, curBar, curIPage, y);

	markerOutOfBounds();
	sendAndUpdateMarker();

	if(playing) {
		hOffset = iPages[curIPage].headerOffset;
		for (var b = 0; b <= bars[curBar].line; b++) {
			hOffset += lines[b].yOffset;
		}
	}

	generateAll();
}

function menuNewIPage() {
	addIPage();
	curIPage = iPages.length - 1;
	inf = {
		functionName: "recieveIPage",
		args: {
			iPage: iPages[curIPage]
		},
		generate: false
	};
	sendData(JSON.stringify(inf));
	curNote = 0;
	bars = iPages[curIPage].bars;
	lines = iPages[curIPage].lines;
	selectNote(curNote, curBar, curIPage, y);
	sendAndUpdateMarker();

	generateAll();
}

function deleteIPage(args) {
	if(iPages.length===1) return;

	iPages.splice(args.page, 1);
	if(curIPage===args.page) {
		if(curIPage-1>=0) curIPage--;
		else if(curIPage+1<iPages.length) curIPage++;
	}
	curNote = 0;
	bars = iPages[curIPage].bars;
	lines = iPages[curIPage].lines;
	if (curBar >= bars.length) {
		curBar = bars.length - 1;
	}
	delete selectedNotes[0];
	selectNote(curNote, curBar, curIPage, y);

	markerOutOfBounds();
	sendAndUpdateMarker();

	generateAll();
}

function menuDeleteIPage() {
	
	var inf= {
		functionName: "deleteIPage",
		args: {
			page: curIPage
		},
		generate: false
	};
	deleteIPage(inf.args);

	sendData(JSON.stringify(inf));
}

function changeClefPop(bar) {
	var form = document.createElement("form");
	form.classList.add("m-3");

	var formDiv = document.createElement("div");
	formDiv.classList.add("form-group");

	var sigSel = document.createElement("select");
	sigSel.classList.add("form-control");
	sigSel.id = "upperSig";

	var label = document.createElement("label");
	label.innerHTML = "Clave do compasso:";
	label.for = "upperSig";
	formDiv.appendChild(label);
	var option;

	option = document.createElement("option");
	option.innerHTML = "Clave de Sol (&nbsp; &nbsp;𝄞) 2ª linha";
	option.value = 0;
	sigSel.appendChild(option);

	option = document.createElement("option");
	option.innerHTML = "Clave de Fá (&nbsp; &nbsp;𝄢) 4ª linha";
	option.value = 2;
	sigSel.appendChild(option);

	form.style.height = "auto";
	formDiv.appendChild(sigSel);
	form.appendChild(formDiv);

	var submitButton = document.createElement("input");
	submitButton.type = "button";
	submitButton.classList.add("btn");
	submitButton.value = "Confirmar";
	submitButton.addEventListener("click", function () {
		var upperOptions = document.getElementById("upperSig").options;
		var upperSelected = document.getElementById("upperSig").selectedIndex;

		inf = {
			functionName: "changeClef",
			args: {
				bar: bar,
				iPage: curIPage,
				clef: parseInt(upperOptions[upperSelected].value)
			},
			generate: false
		};
		changeClef(inf.args);
		sendData(JSON.stringify(inf));

		var dc = document.getElementById("dialogContainer");
		dc.removeChild(dc.childNodes[0]);
	});

	form.appendChild(submitButton);

	openHTMLDialog([form]);
}

function menuChangeInstrument(page) {
	var form = document.createElement("form");
	form.classList.add("m-3");

	var formDiv = document.createElement("div");
	formDiv.classList.add("form-group");

	var sigSel = document.createElement("select");
	sigSel.classList.add("form-control");
	sigSel.id = "upperSig";

	var label = document.createElement("label");
	label.innerHTML = "Instrumento da partitura:";
	label.for = "upperSig";
	formDiv.appendChild(label);
	var option;

	for(var instrument in instruments) {
		option = document.createElement("option");
		option.innerHTML = instruments[instrument].name;
		option.value = instrument;
		sigSel.appendChild(option);
	}

	form.style.height = "auto";
	formDiv.appendChild(sigSel);
	form.appendChild(formDiv);

	var submitButton = document.createElement("input");
	submitButton.type = "button";
	submitButton.classList.add("btn");
	submitButton.value = "Confirmar";
	submitButton.addEventListener("click", function () {
		var upperOptions = document.getElementById("upperSig").options;
		var upperSelected = document.getElementById("upperSig").selectedIndex;

		

		inf = {
			functionName: "changePageInstrument",
			args: {
				page: page,
				instrument: upperOptions[upperSelected].value
			},
			generate: false
		};
		changePageInstrument(inf.args);
		sendData(JSON.stringify(inf));

		var dc = document.getElementById("dialogContainer");
		dc.removeChild(dc.childNodes[0]);
	});

	form.appendChild(submitButton);

	openHTMLDialog([form]);
}