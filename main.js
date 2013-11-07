// JavaScript Document

var page = document.getElementById("page"), // get div element covering whole page, for mouse and touch events
stage = document.getElementById("stage"), // get canvas element and context
ctx = stage.getContext("2d");
stage.width = 5000;
stage.height = window.innerHeight*0.9;

var listaCursos = []; // base de datos todos los cursos
var semestres = []; // array guarda arrays que son listas de cursos de cada semestre
for (var i=0; i<8; i++) { // añade arrays para cada semestre
	var nuevoSemestre = [];
	semestres.push(nuevoSemestre);
}
var biologia = false; // toggle to show classes
var microbio = false;

function cursoNuevo(curso) { // construye ícono del curso	
	if ( (curso.programa === "-") || (biologia && curso.programa === "biologia" ) || (microbio && curso.programa === "microbiologia") ) { // Mostrar solo materias de los programas escogidos
		semestres[curso.semestre].push(curso); // añade curso a lista de su semestre
		curso.fila = semestres[curso.semestre].length; // guarda posición del curso en su semestre
		curso.X = 200*curso.semestre; // ref coordinates
		curso.Y = 50*curso.fila;
		
		switch (Number(curso.semestral)) {
			case 0:
				ctx.fillStyle = "#33AA00";
				break;
			case 1:
				ctx.fillStyle = "#FF0000";
				break;
			case 2:
				ctx.fillStyle = "#0044EE";
				break;
		}
		ctx.fillRect(curso.X-75, curso.Y-18, 150, 30); // dibuja rectangulo
		ctx.fillStyle = '#000000';
		ctx.textAlign = 'center';
		ctx.font = 'bold 10pt Arial';
		ctx.fillText(curso.nombre, curso.X, curso.Y); // escribe nombre
	}
}

function preload() { // load db before init
	Tabletop.init({ // http://www.mikeball.us/blog/using-google-spreadsheets-and-tabletop-js-as-a-web-application-back-end
		key: '0AihSbOSqv8G9dDR4WUZUWHRyRE9HSGhmR3NlT2NBVHc', // remember spreadshee must be published to web
		callback: showInfo,
		simpleSheet: true 
	});
	
	function showInfo(data, tabletop) {
		listaCursos = data; // save spreadsheet to js
		console.log(listaCursos);
		init();
	}
}

function init() {
	for (var i=0; i<listaCursos.length; i++) { // crea cada curso en listaCursos
		cursoNuevo(listaCursos[i]);
	}
}

preload();