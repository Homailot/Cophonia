function changeTimeSigPop(bar) { // eslint-disable-line no-unused-vars
	var form = document.createElement("form");
	form.classList.add("m-3");

	var formDiv = document.createElement("div");
	formDiv.classList.add("form-group");

	var sigSel = document.createElement("select");
	sigSel.classList.add("form-control");
	sigSel.id = "upperSig";

	var label = document.createElement("label");
	label.innerHTML="Upper Number:";
	label.for="upperSig";
	formDiv.appendChild(label);
	var option;

	for(var num = 1; num<=32; num++) {
		option = document.createElement("option");
		option.innerHTML = num;
		option.value=num;
		sigSel.appendChild(option);
	}

	form.style.height="auto";
	formDiv.appendChild(sigSel);
	form.appendChild(formDiv);

	formDiv = document.createElement("div");
	formDiv.classList.add("form-group");

	sigSel = document.createElement("select");
	sigSel.classList.add("form-control");
	sigSel.id = "lowerSig";

	label = document.createElement("label");
	label.innerHTML="Lower Number:";
	label.for="lowerSig";
	formDiv.appendChild(label);

	for(var nums=1; nums<=32; nums*=2) {
		option = document.createElement("option");
		option.innerHTML = nums;
		option.value=nums;
		sigSel.appendChild(option);
	}

	var p = document.createElement("p");
	p.innerHTML="Warning, this operation may delete some notes on the measures selected";

	formDiv.appendChild(sigSel);
	formDiv.appendChild(p);	
	form.appendChild(formDiv);
	
	var submitButton = document.createElement("input");
	submitButton.type = "button";
	submitButton.classList.add("btn");
	submitButton.classList.add("btn-primary");
	submitButton.value = "Confirm";
	submitButton.addEventListener("click", function() {
		var upperOptions = document.getElementById("upperSig").options;
		var lowerOptions = document.getElementById("lowerSig").options;
		var upperSelected = document.getElementById("upperSig").selectedIndex;
		var lowerSelected = document.getElementById("lowerSig").selectedIndex;

		inf = {
			functionName: "changeTimeSig",
			args: {
				iPage: curIPage,
				upperSig: upperOptions[upperSelected].text,
				lowerSig: lowerOptions[lowerSelected].text,
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
	label.innerHTML="Key Signature:";
	label.for="keySel";
	formDiv.appendChild(label);

	var option = document.createElement("option");
	option.innerHTML = "Cb (bbbbbbb)";
	option.value="7:-1";
	keySel.appendChild(option);

	option = document.createElement("option");
	option.innerHTML = "Gb (bbbbbb)";
	option.value="6:-1";
	keySel.appendChild(option);

	option = document.createElement("option");	
	option.innerHTML = "Db (bbbbb)";
	option.value="5:-1";
	keySel.appendChild(option);

	option = document.createElement("option");	
	option.innerHTML = "Ab (bbbb)";
	option.value="4:-1";
	keySel.appendChild(option);

	option = document.createElement("option");	
	option.innerHTML = "Eb (bbb)";
	option.value="3:-1";
	keySel.appendChild(option);

	option = document.createElement("option");	
	option.innerHTML = "Bb (bb)";
	option.value="2:-1";
	keySel.appendChild(option);

	option = document.createElement("option");	
	option.innerHTML = "F (b)";
	option.value="1:-1";
	keySel.appendChild(option);

	option = document.createElement("option");	
	option.innerHTML = "C";
	option.value="0:0";
	keySel.appendChild(option);

	option = document.createElement("option");	
	option.innerHTML = "G (#)";
	option.value="1:1";
	keySel.appendChild(option);

	option = document.createElement("option");	
	option.innerHTML = "D (##)";
	option.value="2:1";
	keySel.appendChild(option);

	option = document.createElement("option");	
	option.innerHTML = "A (###)";
	option.value="3:1";
	keySel.appendChild(option);

	option = document.createElement("option");	
	option.innerHTML = "E (####)";
	option.value="4:1";
	keySel.appendChild(option);

	option = document.createElement("option");	
	option.innerHTML = "B (#####)";
	option.value="5:1";
	keySel.appendChild(option);

	option = document.createElement("option");	
	option.innerHTML = "F# (######)";
	option.value="6:1";
	keySel.appendChild(option);

	option = document.createElement("option");	
	option.innerHTML = "C# (#######)";
	option.value="7:1";
	keySel.appendChild(option);

	formDiv.appendChild(keySel);
	form.appendChild(formDiv);

	var submitButton = document.createElement("input");
	submitButton.type = "button";
	submitButton.classList.add("btn");
	submitButton.classList.add("btn-primary");
	submitButton.value = "Confirm";
	submitButton.addEventListener("click", function() {
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


function openHTMLDialog(contents) {
	if(document.getElementById("dialog")) {
		var dc = document.getElementById("dialogContainer");
		dc.removeChild(dc.childNodes[0]);
		return;
	} 
	var dialog = document.createElement("div");
	dialog.style.width= "600px";
	//dialog.style.minHeight = '200px';

	for(var content = 0; content < contents.length; content++) {
		dialog.appendChild(contents[content]);
	}
	
	dialog.style.zIndex = 5;
	dialog.style.position = "fixed";
	dialog.style.backgroundColor = "#F9F7F7";
	dialog.classList.add("rounded-top");
	dialog.classList.add("shadow");
	dialog.id = "dialog";
	dialog.style.top = window.innerHeight+"px";
	dialog.style.left = (window.innerWidth/2- 300) + "px";

	document.getElementById("dialogContainer").appendChild(dialog);


	document.getElementById("dialog").style.height = document.getElementById("dialog").scrollHeight+"px";
	slideElement(document.getElementById("dialog"));
}

var curContent;

function slideElement(content) {
	curContent = content;

	setTimeout(moveElement, 4);
}

function moveElement() {
	curContent.style.top=(window.innerHeight-curContent.scrollHeight)+"px";
}