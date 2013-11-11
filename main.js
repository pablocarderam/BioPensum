// JavaScript Document

var page = document.getElementById("page"), // get div element covering whole page, for mouse and touch events
stage = document.getElementById("stage"), // get canvas element and context
ctx = stage.getContext("2d");
ctx.scale(2,2); // scale back to full dimensions after oversampling and reduction

var listaCursos = []; // base de datos todos los cursos
var semestres = []; // array guarda arrays que son listas de cursos de cada semestre
for (var i=0; i<8; i++) { // añade un array dentro de semestres para cada semestre
	var nuevoSemestre = [];
	semestres.push(nuevoSemestre);
}
var biologia = true; // toggle to show classes TO DO: button
var microbio = true;

function cursoNuevo(curso) { // construye ícono del curso	
	if ( (curso.programa === "-") || (biologia && curso.programa === "biologia" ) || (microbio && curso.programa === "microbiologia") ) { // Mostrar solo materias de los programas escogidos
		semestres[curso.semestre].push(curso); // añade curso a lista de su semestre
		curso.fila = semestres[curso.semestre].length; // guarda posición del curso en su semestre
		curso.X = 200*curso.semestre; // ref coordinates
		curso.Y = 75*curso.fila;
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
					//console.log(otroCurso.codigo); 
					ctx.lineWidth = 6;  // draw line from prerreq to current course
					ctx.lineCap = 'round';
					ctx.lineJoin = 'round';
					ctx.strokeStyle = "#990000";
					ctx.beginPath();
					var dif = Math.abs(otroCurso.semestre-curso.semestre);
					if (dif === 0) { // si estan en el mismo semestre, alertar
						alert (otroCurso.nombre + " es prerrequisito de " + curso.nombre + " y no pueden estar en el mismo semestre.");
					}
					else if (dif === 1) { // si estan a un semestre de distancia, dibujar linea normal
						ctx.moveTo(otroCurso.X + 80, otroCurso.Y - 3);
						ctx.lineTo(curso.X - 80, curso.Y - 3);
					}
					else { // si están a más de un semestre de distancia, 
						ctx.moveTo(otroCurso.X + 80, otroCurso.Y - 3); // dibujar línea hacia a bajo,
						ctx.lineTo(otroCurso.X + 80, otroCurso.Y + 35);
						ctx.lineTo(curso.X - 130, otroCurso.Y + 35); // luego linea que pase entre los otros cursos,
						ctx.lineTo(curso.X - 80, curso.Y - 3); // luego linea normal
					}
					
					ctx.stroke();
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
					//console.log(otroCurso.codigo); 
					ctx.lineWidth = 6;  // draw line from prerreq to current course
					ctx.lineCap = 'round';
					ctx.strokeStyle = "#000099";
					ctx.beginPath();
					if (otroCurso.Y > curso.Y) {
						ctx.moveTo(otroCurso.X, otroCurso.Y - 24);
						ctx.lineTo(curso.X, curso.Y + 18);
					}
					else {
						ctx.moveTo(otroCurso.X, otroCurso.Y + 18);
						ctx.lineTo(curso.X, curso.Y - 24);
					}
					ctx.stroke();
				}
			}
		}
	}
}

function render() {
	for (var i=0; i<listaCursos.length; i++) {
		var curso = listaCursos[i];
		
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
		ctx.fillRect(curso.X-75, curso.Y-18, 150, 30); // dibuja rectangulo
		ctx.fillStyle = '#000000';
		ctx.textAlign = 'center';
		ctx.font = 'bold 10pt Arial';
		ctx.fillText(curso.nombre, curso.X, curso.Y); // escribe nombre
	}
}

function init() {
	for (var i=0; i<listaCursos.length; i++) { // crea cada curso en listaCursos
		cursoNuevo(listaCursos[i]);
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
		//console.log(listaCursos);
		init();
	}
}

preload();