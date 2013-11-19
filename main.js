// JavaScript Document TO DO: DRAG COURSES

var page = document.getElementById("page"), // get div element covering whole page, for mouse and touch events
stage = document.getElementById("stage"), // get canvas element and context
ctx = stage.getContext("2d");
ctx.scale(2, 2); // scale back to full dimensions after oversampling and reduction

var listaCursos = []; // base de datos todos los cursos
var semestres = []; // array guarda arrays que son listas de cursos de cada semestre

var biologia = true; // toggle to show classes
var microbio = true;

var btnBiologia = { X : 15, Y : 20, hitRadius : 15 }; // botones de programa, toggle on-off
var btnMicrobio = { X : 15, Y : 40, hitRadius : 15 };

// Appearance
var boxWidth = 150;
var boxHeight = 30;
var spacerX = 50;
var spacerY = 30;
var lineWidth = 6;

function cursoNuevo(curso) { // construye ícono del curso
	if ( (curso.programa === "-") || (biologia && (curso.programa === "biologia") ) || (microbio && curso.programa === "microbiologia" ) ) { // Mostrar solo materias de los programas escogidos
		curso.show = true;
		semestres[curso.semestre].push(curso); // añade curso a lista de su semestre
		semestres[curso.semestre].creditos = (Number(semestres[curso.semestre].creditos) + Number(curso.creditos)); // añadir creditos
		curso.fila = semestres[curso.semestre].length; // guarda posición del curso en su semestre
		curso.X = (boxWidth+spacerX)*(curso.semestre-0.5); // ref coordinates
		curso.Y = (boxHeight+spacerY)*(curso.fila+1.5);
		curso.hitRadius = 15;
	}
	else {
		//console.log(curso.codigo);
		curso.show = false;
	}
}

function findPrerreq(curso) {
	if (curso.prerrequisitos !== "-") {
		var prerreqArr = curso.prerrequisitos.split(", "); // break prerrequisitos string into array of prerreq
		for (var i=0; i<prerreqArr.length; i++) { // for every prerreq
			var prerreq = prerreqArr[i];
			for (var j=0; j<listaCursos.length; j++) { // loop through all courses
				var otroCurso = listaCursos[j];
				if (prerreq === otroCurso.codigo) { // compare each prerreq to each codigo in listaCursos
					if (otroCurso.show) {
						ctx.lineWidth = lineWidth;  // draw line from prerreq to current course
						ctx.lineCap = 'round';
						ctx.lineJoin = 'round';
						ctx.strokeStyle = "#990000";
						ctx.beginPath();
						var dif = Math.abs(otroCurso.semestre-curso.semestre);
						if (dif === 0) { // si estan en el mismo semestre, alertar
							alert (otroCurso.nombre + " es prerrequisito de " + curso.nombre + " y no pueden estar en el mismo semestre.");
						}
						else if (dif === 1) { // si estan a un semestre de distancia, dibujar linea normal
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
					else {
						alert("El curso " + curso.codigo + " tiene como prerrequisito al curso " + otroCurso.codigo);
					}
				}
			}
		}
	}
}

function findCorreq(curso) {
	if (curso.correquisitos !== "-") {
		var correqArr = curso.correquisitos.split(", "); // break prerrequisitos string into array of prerreq
		for (var i=0; i<correqArr.length; i++) { // for every prerreq
			var correq = correqArr[i];
			for (var j=0; j<listaCursos.length; j++) { // loop through all courses
				var otroCurso = listaCursos[j];
				if (correq === otroCurso.codigo) { // compare each prerreq to each codigo in listaCursos
					if (otroCurso.show) { // if correquisito is displayed
						ctx.lineWidth = lineWidth;  // draw line from prerreq to current course
						ctx.lineCap = 'round';
						ctx.strokeStyle = "#000099";
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
					else { // si no se muestra el correquisito, avisar
						alert("El curso " + curso.codigo + " tiene como correquisito al curso " + otroCurso.codigo);
					}
				}
			}
		}
	}
}

function render() {
	ctx.fillStyle = "#FFFFFF";
	ctx.fillRect(0, 0, stage.width, stage.height);
	for (var i=0; i<listaCursos.length; i++) {
		var curso = listaCursos[i];
		if (curso.show) {
			
			switch (Number(curso.semestral)) { // Different colors show primer semestre, segundo semestre, or anual
				case 0:
					ctx.fillStyle = "#33AA00"; // anual is green
					break;
				case 1:
					ctx.fillStyle = "#FF0000"; // semestre 1 is red
					break;
				case 2:
					ctx.fillStyle = "#0044EE"; // semestre 2 is blue
					break;
			}
			
			findPrerreq(curso); // draw prerrequisito lines
			findCorreq(curso); // draw correquisito lines
			ctx.fillRect(curso.X-boxWidth/2, curso.Y-boxHeight/2, boxWidth, boxHeight); // dibuja rectangulo
			ctx.fillStyle = '#000000';
			ctx.textAlign = 'center';
			ctx.font = 'bold 10pt Arial';
			ctx.fillText(curso.nombre, curso.X, curso.Y+lineWidth); // escribe nombre
		}
	}
	
	// dibuja botones de toggle biologia y microbiologia
	//ctx.fillRect(btnBiologia.X-10, btnBiologia.Y-10, 20, 20); // dibuja rectangulo
	ctx.fillStyle = '#000000';
	ctx.textAlign = 'left';
	ctx.font = 'bold 12pt Arial';
	if (biologia) {
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
	
	// dibujar semestres y créditos
	ctx.textAlign = 'center';
	ctx.font = '11pt Arial';
	for (var j=0; j<semestres.length; j++) { // añade un array dentro de semestres para cada semestre
		ctx.fillText("Semestre " + (j+1), (boxWidth+spacerX)*(j+0.5), (boxHeight+spacerY*2)+lineWidth); // escribe semestre
		ctx.fillText("Créditos: " + semestres[(j+1)].creditos, (boxWidth+spacerX)*(j+0.5), (boxHeight+spacerY*2.5)+lineWidth); // escribe semestre
	}
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
	var rect = stage.getBoundingClientRect();
	var clickX = e.clientX - rect.left; // find real coord
	var clickY = e.clientY - rect.top;
	if (hitTest(btnBiologia, clickX-80, clickY)) {
		biologia = !biologia; // toggle biologia courses
		//alert("toggle bio");
		init();
	}
	else if (hitTest(btnMicrobio, clickX-80, clickY)) {
		microbio = !microbio; // toggle microbiologia courses
		//alert("toggle microbio");
		init();
	}
	else { // display course info
		for (var i=0; i<listaCursos.length; i++) {
			if (hitTest(listaCursos[i], clickX, clickY)) {
				alert("Nombre: " + listaCursos[i].nombre + ". Código: " + listaCursos[i].codigo);
			}
		}
	}
}

function init() { // re draw everything
	semestres = [];
	
	for (var i=0; i<8; i++) { // añade un array dentro de semestres para cada semestre
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
	Tabletop.init({ // http://www.mikeball.us/blog/using-google-spreadsheets-and-tabletop-js-as-a-web-application-back-end
		key: '0AihSbOSqv8G9dDR4WUZUWHRyRE9HSGhmR3NlT2NBVHc', // remember spreadshee must be published to web
		callback: showInfo,
		simpleSheet: true 
	});
	
	function showInfo(data, tabletop) {
		listaCursos = data; // save spreadsheet to js
		if (listaCursos.length > 1) {
			init();
		}
		else {
			alert("Error: no pude encontrar la lista de cursos");
		}
	}
	
	stage.addEventListener("click", clickHandler, false); // click handler
}

preload();