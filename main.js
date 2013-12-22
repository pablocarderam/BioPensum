// JavaScript Document

var page = document.getElementById("page"), // get div element covering whole page, for mouse and touch events
stage = document.getElementById("stage"), // get canvas element and context
ctx = stage.getContext("2d");
ctx.scale(1.5, 1.5); // scale back to full dimensions after oversampling and reduction TO DO: check mobile compatibility

var listaCursos = []; // base de datos todos los cursos
var semestres = []; // array guarda arrays que son listas de cursos de cada semestre

var biologia = true; // toggle to show courses
var microbio = true;
var electivas = true; // TO DO: get rid of electivas button?

var btnBiologia = { X : 15, Y : 20, hitRadius : 15 }; // botones de programa y electivas, toggle on-off TO DO: QUITAR BOTON ELECTIVAS, MAKE ARRAY OF BUTTONS?
var btnMicrobio = { X : 15, Y : 40, hitRadius : 15 };
var btnElectivas = { X : 15, Y : 60, hitRadius : 15 };
var btnReset = { X : 250, Y : 30, hitRadius : 15 };

var numSemestres = 10; // guarda el numero de semestres. TO DO: Añadir interactividad. 

var rect = stage.getBoundingClientRect(); // for getting mouse event coordinates
var grab = false; // for dragging courses
var grabbed = false; // prevents clickHandler firing every time a course is dragged
var cursoSelec = {}; // guarda al curso seleccionado
var newFrame = true; // prevents from rendering too quickly

// Appearance
var boxWidth = 150;
var boxHeight = 30;
var spacerX = 50;
var spacerY = 30;
var lineWidth = 4;
var frameRate = 24;

function cursoNuevo(curso) { // construye ícono del curso
	if ( ((curso.programa === "") || (biologia && (curso.programa === "biologia") ) || (microbio && curso.programa === "microbiologia" )) && !(!electivas && (curso.semestre === "electiva")) && !(curso.remove)) { // Mostrar solo materias de los programas escogidos TO DO: make this if block the else block
		curso.show = true; // show curso
		if (curso.semestre === "electiva") { // si es electiva, poner al final
			curso.semestre = 10;
		}
		semestres[curso.semestre].push(curso); // añade curso a lista de su semestre
		semestres[curso.semestre].creditos = (Number(semestres[curso.semestre].creditos) + Number(curso.creditos)); // añadir creditos
		curso.fila = semestres[curso.semestre].length; // guarda posición del curso en su semestre
		curso.X = (boxWidth+spacerX)*(curso.semestre-0.5); // ref coordinates
		curso.Y = (boxHeight+spacerY)*(curso.fila+1.5);
		curso.hitRadius = 15; // for hit testing
	}
	else {
		curso.show = false; // if not, hide curso TO DO: Switch if and else block to simplify conditional
	}
}

function findPrerreq(curso) {
	if (curso.prerrequisitos !== "") { // if curso has prerequisites
		var prerreqArr = curso.prerrequisitos.split(", "); // break prerrequisitos string into array of prerreq
		for (var i=0; i<prerreqArr.length; i++) { // for every prerreq
			var prerreq = prerreqArr[i];
			for (var j=0; j<listaCursos.length; j++) { // loop through all courses
				var otroCurso = listaCursos[j];
				if (prerreq === otroCurso.codigo) { // compare each prerreq to each codigo in listaCursos
					if (otroCurso.show) { // if prerequisite is showing
						ctx.lineWidth = lineWidth;  // draw line from prerreq to current course
						ctx.lineCap = 'round';
						ctx.lineJoin = 'round';
						ctx.strokeStyle = "#DD0000"; // red lines
						ctx.beginPath();
						var dif = curso.semestre-otroCurso.semestre; // stores distance in semesters
						if (!grab) {
							if (dif < 1) { // si estan en el mismo semestre, alertar
								alert (otroCurso.nombre + " es prerrequisito de " + curso.nombre + " y no pueden estar en el mismo semestre.");
							}
						}
						if (dif === 1) { // si estan a un semestre de distancia, dibujar linea normal
							ctx.moveTo(otroCurso.X + boxWidth/2 + lineWidth, otroCurso.Y);
							ctx.lineTo(curso.X - boxWidth/2 - lineWidth, curso.Y);
						}
						else { // si están a más de un semestre de distancia, 
							ctx.moveTo(otroCurso.X + boxWidth/2 + lineWidth, otroCurso.Y);
							ctx.lineTo(otroCurso.X + boxWidth/2 + lineWidth, otroCurso.Y + (boxHeight+spacerY)/2); // dibujar línea hacia a bajo,
							ctx.lineTo(curso.X - boxWidth/2 - spacerX, otroCurso.Y + (boxHeight+spacerY)/2); // luego linea que pase entre los otros cursos,
							ctx.lineTo(curso.X - boxWidth/2 - lineWidth, curso.Y); // luego linea normal
						}
						
						ctx.stroke();
					}
					else { // if prerequsite hidden
						alert("El curso " + curso.nombre + " tiene como prerrequisito al curso " + otroCurso.nombre);
					}
				}
			}
		}
	}
}

function findCorreq(curso) {
	if (curso.correquisitos !== "") {
		var correqArr = curso.correquisitos.split(", "); // break prerrequisitos string into array of prerreq
		for (var i=0; i<correqArr.length; i++) { // for every prerreq
			var correq = correqArr[i];
			for (var j=0; j<listaCursos.length; j++) { // loop through all courses
				var otroCurso = listaCursos[j];
				if (correq === otroCurso.codigo) { // compare each prerreq to each codigo in listaCursos
					if (otroCurso.show) { // if correquisito is displayed
						ctx.lineWidth = lineWidth;  // draw line from prerreq to current course
						ctx.lineCap = 'round';
						ctx.strokeStyle = "#000099"; // blue lines
						ctx.beginPath();
						if (otroCurso.Y > curso.Y) {
							ctx.moveTo(otroCurso.X, otroCurso.Y - boxHeight/2 - lineWidth);
							ctx.lineTo(curso.X, curso.Y + boxHeight/2 + lineWidth);
						}
						else {
							ctx.moveTo(otroCurso.X, otroCurso.Y + boxHeight/2 + lineWidth);
							ctx.lineTo(curso.X, curso.Y - boxHeight/2 - lineWidth);
						}
						ctx.stroke();
					}
					else if (!grab) { // si no se muestra el correquisito, avisar
						alert("El curso " + curso.nombre + " tiene como correquisito al curso " + otroCurso.nombre);
					}
				}
			}
		}
	}
}

function render() {
	if (newFrame) {
		ctx.fillStyle = "#FFFFFF";
		ctx.fillRect(0, 0, stage.width, stage.height); // erase stage. don't use stage.width = stage.width method because it messes with oversampling resolution effect
		for (var i=0; i<listaCursos.length; i++) { // for every course
			var curso = listaCursos[i];
			if (curso.show) { // if course is showing
				switch (Number(curso.semestral)) { // Different colors show primer semestre, segundo semestre, or anual
					case 0:
						ctx.fillStyle = "#33AA00"; // anual is green
						break;
					case 1:
						ctx.fillStyle = "#FF0000"; // semestre 1 is red
						break;
					case 2:
						ctx.fillStyle = "#0099EE"; // semestre 2 is blue
						break;
				}
				
				findPrerreq(curso); // draw prerrequisito lines
				findCorreq(curso); // draw correquisito lines
				ctx.fillRect(curso.X-boxWidth/2, curso.Y-boxHeight/2, boxWidth, boxHeight); // dibuja rectangulo
				ctx.fillStyle = '#000000';
				ctx.textAlign = 'center';
				ctx.font = 'bold 8pt Arial';
				ctx.fillText(curso.nombre, curso.X, curso.Y+lineWidth); // escribe nombre curso
			}
		}
		
		// dibuja botones de toggle biologia y microbiologia
		//ctx.fillRect(btnBiologia.X-10, btnBiologia.Y-10, 20, 20); // dibuja rectangulo
		ctx.fillStyle = '#000000';
		ctx.textAlign = 'left';
		ctx.font = 'bold 12pt Arial';
		if (biologia) { //toggle buttons
			ctx.fillText("Quitar cursos biologia", btnBiologia.X, btnBiologia.Y+lineWidth); // escribe nombre
		}
		else {
			ctx.fillText("Mostrar cursos biologia", btnBiologia.X, btnBiologia.Y+lineWidth); // escribe nombre
		}
		
		if (microbio) {
			ctx.fillText("Quitar cursos microbiologia", btnMicrobio.X, btnMicrobio.Y+lineWidth); // escribe nombre
		}
		else {
			ctx.fillText("Mostrar cursos microbiologia", btnMicrobio.X, btnMicrobio.Y+lineWidth); // escribe nombre
		}
		/*
		if (electivas) {
			ctx.fillText("Quitar cursos electivos", btnElectivas.X, btnElectivas.Y+lineWidth); // escribe nombre
		}
		else {
			ctx.fillText("Mostrar cursos electivos", btnMicrobio.X, btnElectivas.Y+lineWidth); // escribe nombre
		}*/
		
		// dibujar semestres y créditos
		ctx.textAlign = 'center';
		ctx.font = '11pt Arial';
		for (var j=1; j<semestres.length; j++) { // añade un array dentro de semestres para cada semestre
			ctx.fillText("Semestre " + j, (boxWidth+spacerX)*(j-0.5), (boxHeight+spacerY*2)+lineWidth); // escribe semestre
			ctx.fillText("Créditos: " + semestres[j].creditos, (boxWidth+spacerX)*(j-0.5), (boxHeight+spacerY*2.5)+lineWidth); // escribe semestre
		}
		
		ctx.fillStyle = '#FF0000'; // dibujar botón reset 
		ctx.textAlign = 'left';
		ctx.font = 'bold 20pt Arial';
		ctx.fillText("RESET!", btnReset.X, btnReset.Y+lineWidth);
		
		newFrame = false; // set newFrame to false, don't allow new render
		var timer = setTimeout(function(){timerFunc()},1000/frameRate); // start timer to either set newFrame to true or to render again
	}
	else {
		var tryAgainTimer = setTimeout(function(){tryAgain()},1000/frameRate); // start timer to either set newFrame to true or to render again
	}
}

function timerFunc() {
	newFrame = true; // set to true
}

function tryAgain() {
	newFrame = true; // set to true
	render();
}

function hitTest(obj, x, y) {  // tests against stage coordinates
	if (getDistance(obj.X, obj.Y, x, y) < obj.hitRadius) { 
		return true;
	} 
	else { 
		return false;
	}
}

function getDistance(x1, y1, x2, y2) { // find distance between two points
	var dist = Math.round(Math.sqrt(Math.pow((x1 - x2)/5.5, 2) + Math.pow(y1 - y2, 2))); //altered x coordinates to make buttons wide
	return dist;
}

function clickHandler(e) { // click
	console.log("click");
	if (!grabbed) { // if not tiggered by a drag event
		var clickX = e.pageX - rect.left; // find real coord
		var clickY = e.pageY - rect.top;
		if (hitTest(btnBiologia, clickX-80, clickY)) { // if btnBiologia clicked
			biologia = !biologia; // toggle biologia courses
			init();
		}
		else if (hitTest(btnMicrobio, clickX-80, clickY)) { // if microbiologia clicked
			microbio = !microbio; // toggle microbiologia courses
			init();
		}
		/*else if (hitTest(btnElectivas, clickX-80, clickY)) { // if electivas clicked TO DO: get rid of this?
			electivas = !electivas; // toggle microbiologia courses
			//alert("toggle microbio");
			init();
		}*/
		else if (hitTest(btnReset, clickX-80, clickY)) { // if reset clicked
			stage.removeEventListener("click", clickHandler, false); // remove all event listeners
			stage.removeEventListener("mousedown", downHandler, false);
			stage.removeEventListener("mouseup", upHandler, false);
			stage.removeEventListener("mousemove", mouseMov, false);
			stage.removeEventListener("touchstart", downHandler, false);
			stage.removeEventListener("touchend", upHandler, false);
			stage.removeEventListener("touchmove", mouseMov, false);
			preload(); // reload spreadsheet
		}
		else { // display course info
			for (var i=0; i<listaCursos.length; i++) { // for every course
				if (hitTest(listaCursos[i], clickX, clickY) && (listaCursos[i].show)) { // if course clicked
					var r = confirm("Nombre: " + listaCursos[i].nombre + ". \nCódigo: " + listaCursos[i].codigo + ". \nPrerrequisitos: " + listaCursos[i].prerrequisitos + ". \nCreditos: " + listaCursos[i].creditos + "\n Quieres quitar este curso?"); // display course info
					if (r) { // if user says it's ok to remove course
						listaCursos[i].remove = true; // remove course
						init(); // redraw everything
					}
					break; // stop looking for other clicked courses in this click
				}
			}
		}
	}
	else { // if triggered by a drag event
		grabbed = false; // do nothing and set grabbed to false
	}
}

function upHandler(e) { // set grab false when mouseUp
	var newSemestre = Math.floor(cursoSelec.X/(boxWidth+spacerX) + 1); // determine new semester based on course's X location
	if (newSemestre < 1) { // if new semester is 0 or something
		newSemestre = 1; // set it to 1
	}
	grab = false; // grab ends (grabbed stays true to stop clickEvent from triggering)
	cursoSelec.semestre = newSemestre; // set new semester
	cursoSelec = {}; // empty selected course
	init(); // redraw
}

function downHandler(e) { // start grab
	var clickX = e.pageX - rect.left; // find real coord
	var clickY = e.pageY - rect.top;
	for (var i=0; i<listaCursos.length; i++) { // for every course
		if (hitTest(listaCursos[i], clickX, clickY)) { // if course dragged
			grab = true; // real variable
			cursoSelec = listaCursos[i]; // set selected course to this course
		}
	}
}

function mouseMov(e) { // store mouse coord
	if (grab) { // if dragging a course
		grabbed = true; // 'fake'var, sets to false in clickHandler
		var mouseX = e.pageX - rect.left; // find real coord
		var mouseY = e.pageY - rect.top;
		cursoSelec.X = mouseX; // set course's coordinates to mouse's
		cursoSelec.Y = mouseY;
		render(); // redraw (just redraw, no need to reorganize semester arrays with init() )
	}
	else { // if not dragging a course
		grabbed = false; // makes sure grabbed is false, in case clickHandler misses it
	}
}

function touchUp(e) { // set grab false when mouseUp
	upHandler(e);
}

function touchDown(e) { // start drag
	downHandler(e);
}

function touchMov(e) {
	if (grab) {
		e.preventDefault();
		mouseMov(e);
	}
}

function init() { // re draw everything
	semestres = []; // empty semestres so as to not have duplicate courses
	
	for (var i=0; i<(numSemestres+1); i++) { // añade un array dentro de semestres para cada semestre
		var nuevoSemestre = [];
		nuevoSemestre.creditos = 0;
		semestres.push(nuevoSemestre);
	}
	for (var j=0; j<listaCursos.length; j++) { // crea cada curso en listaCursos
		cursoNuevo(listaCursos[j]);
	}
	
	render(); // render all cursos and lines
}

function preload() { // load db before init
	ctx.fillStyle = "#FFFFFF";
	ctx.fillRect(0, 0, stage.width, stage.height); // erase stage, don't use stage.width = stage.width method because it messes with oversampling resolution effect
	
	ctx.fillStyle = '#000000'; // dibujar botón reset 
	ctx.textAlign = 'left';
	ctx.font = 'bold 20pt Arial';
	ctx.fillText("Calentando motores...", 100, 100); // escribe preloader	
	
	Tabletop.init({ // http://www.mikeball.us/blog/using-google-spreadsheets-and-tabletop-js-as-a-web-application-back-end
		key: '0AihSbOSqv8G9dDR4WUZUWHRyRE9HSGhmR3NlT2NBVHc', // remember spreadshee must be published to web
		callback: showInfo,
		simpleSheet: true 
	});
	
	stage.addEventListener("click", clickHandler, false); // event handlers
	stage.addEventListener("mousedown", downHandler, false);
	stage.addEventListener("mouseup", upHandler, false);
	stage.addEventListener("mousemove", mouseMov, false);
	stage.addEventListener("touchstart", touchDown, false);
	stage.addEventListener("touchend", touchUp, false);
	stage.addEventListener("touchmove", touchMov, false);
	
	function showInfo(data, tabletop) {
		listaCursos = data; // save spreadsheet to js
		if (listaCursos.length > 1) {
			init();
		}
		else {
			alert("Error: no pude encontrar la lista de cursos. Escríbele al programador de porquería que me diseñó: p.cardenas10@uniandes.edu.co");
		}
	}
	
	
}

preload();