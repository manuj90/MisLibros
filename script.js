//Se delcaran las variables y constantes que se van a utilizar en el código
const formulario = document.getElementById('form-libro'); //Se obtiene el formulario
const listaLibros = document.getElementById('lista-libros'); //Se obtiene la lista de libros
const btnSubmit = formulario.querySelector("button[type='submit']"); //Se obtiene el botón de submit
const inputTitulo = document.getElementById('titulo'); //Se obtiene el input de título
const inputAutor = document.getElementById('autor'); //Se obtiene el input de autor
const inputFecha = document.getElementById('fecha'); //Se obtiene el input de fecha
const btnOrdenarTitulo = document.querySelector('.ordenarTitulo'); //Se obtiene el botón de ordenar por título
const btnOrdenarAutor = document.querySelector('.ordenarAutor'); //Se obtiene el botón de ordenar por autor
const btnOrdenarFecha = document.querySelector('.ordenarFecha'); //Se obtiene el botón de ordenar por fecha
const btnBorrarTodos = document.querySelector('.borrarTodos'); //Se obtiene el botón de borrar todos los libros

let librosGuardados = JSON.parse(localStorage.getItem('libros')) || [];

//Se declaran los libros iniciales
const librosIniciales = [
	{
		titulo: 'Cien Años de Soledad',
		autor: 'Gabriel García Márquez',
		fecha: '1967-05-30'
	},
	{
		titulo: 'Don Quijote de la Mancha',
		autor: 'Miguel de Cervantes',
		fecha: '1605-01-16'
	},
	{ titulo: 'El Aleph', autor: 'Jorge Luis Borges', fecha: '1949-09-15' }
];

//Se combinan los libros iniciales con los guardados
let libros = combinarLibros(librosIniciales, librosGuardados);
//Se declaran las variables que se van a utilizar en el código
let editando = false; //Variable para saber si se está editando un libro
let indiceEdicion = null; //Variable para guardar el índice del libro que se está editando
let ordenAscendente = false; //Variable para saber si se está ordenando de forma ascendente o descendente

//Se declaran las funciones que se van a utilizar en el código
//Función para ordenar los libros por fecha de forma descendente
function ordenarPorFechaDescendente(lista) {
	return lista.sort((a, b) => {
		const dateA = new Date(a.fecha || '1000-01-01');
		const dateB = new Date(b.fecha || '1000-01-01');
		return dateB - dateA;
	});
}

//Función para normalizar el texto
function normalizarTexto(texto) {
	return texto
		.toLowerCase()
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.trim()
		.replace(/\s+/g, ' ');
}

//Función para combinar los libros
function combinarLibros(iniciales, guardados) {
	//Se combinan los libros iniciales con los guardados
	const libroCombinados = [...iniciales, ...guardados].reduce(
		(unique, libro) => {
			const libroIndex = unique.findIndex(
				(item) =>
					normalizarTexto(item.titulo) === normalizarTexto(libro.titulo) &&
					normalizarTexto(item.autor) === normalizarTexto(libro.autor)
			);

			if (libroIndex === -1) {
				unique.push(libro);
			} else {
				unique[libroIndex] = libro;
			}

			return unique;
		},
		[]
	);

	return ordenarPorFechaDescendente(libroCombinados);
}

//Función para saber si un libro existe
function libroExiste(lista, libro) {
	return lista.some(
		(item) =>
			normalizarTexto(item.titulo) === normalizarTexto(libro.titulo) &&
			normalizarTexto(item.autor) === normalizarTexto(libro.autor)
	);
}

//Función para formatear la fecha
function formatearFecha(fecha) {
	return fecha ? fecha.split('-').reverse().join('/') : '';
}

//Función para renderizar los libros
function renderizarLibros() {
	listaLibros.innerHTML = '';
	libros.forEach((libro, index) => {
		const li = document.createElement('li');
		li.className = 'list-group-item book-item';
		const fechaFormateada = formatearFecha(libro.fecha);
		//Se crea el contenido de cada libro
		li.innerHTML = `
            <div class="book-content">
                <div class="book-info">
                    <strong class="book-title">${libro.titulo}</strong>
                    <span class="book-author">${libro.autor}</span>
                    <small class="text-muted book-date">(${fechaFormateada})</small>
                </div>
            </div>
            <div class="book-actions">
                <button class="btn btn-warning btn-sm" onclick="editarLibro(${index})" aria-label="Editar libro">
                    <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-danger btn-sm" onclick="eliminarLibro(${index})" aria-label="Eliminar libro">
                   <i class="bi bi-trash3"></i>
                </button>
            </div>
        `;
		listaLibros.appendChild(li);
	});
}

//Función para ordenar los libros por título
function ordenarPorTitulo() {
	libros.sort((a, b) => a.titulo.localeCompare(b.titulo, 'es'));
	renderizarLibros();
}

//Función para ordenar los libros por autor
function ordenarPorAutor() {
	libros.sort((a, b) => a.autor.localeCompare(b.autor, 'es'));
	renderizarLibros();
}

//Función para cambiar el orden de los libros por fecha
function toggleOrdenFecha() {
	ordenAscendente = !ordenAscendente;
	libros.sort((a, b) => {
		const dateA = new Date(a.fecha || '1000-01-01');
		const dateB = new Date(b.fecha || '1000-01-01');
		return ordenAscendente ? dateA - dateB : dateB - dateA;
	});
	renderizarLibros();
}

//Función para borrar todos los libros
function borrarTodosLosLibros() {
	if (confirm('¿Estás seguro de que quieres borrar todos los libros?')) {
		libros = [];
		localStorage.removeItem('libros');
		renderizarLibros();
	}
}

//Se declara la función para manejar el formulario
function manejarFormulario(event) {
	//Se previene el comportamiento por defecto del formulario
	event.preventDefault();
	const titulo = inputTitulo.value.trim();
	const autor = inputAutor.value.trim();
	const fecha = inputFecha.value;

	//Se valida que los campos obligatorios no estén vacíos
	if (!titulo || !autor) {
		alert('Por favor, completa todos los campos obligatorios.');
		return;
	}

	const nuevoLibro = { titulo, autor, fecha }; //Se crea un nuevo libro

	if (editando) {
		actualizarLibro(titulo, autor, fecha); //Se actualiza el libro
	} else {
		const libroIndex = libros.findIndex(
			(libro) =>
				normalizarTexto(libro.titulo) === normalizarTexto(titulo) &&
				normalizarTexto(libro.autor) === normalizarTexto(autor) //Se busca si el libro ya existe
		);

		if (libroIndex !== -1) {
			if (confirm('Este libro ya existe. ¿Deseas actualizar su información?')) {
				libros[libroIndex] = nuevoLibro;
			}
		} else {
			libros.push(nuevoLibro); //Se añade el libro al array de libros
			ordenarPorFechaDescendente(libros); //Se ordenan los libros por fecha de forma descendente
		}
	}

	guardarLibros();
	renderizarLibros();
	resetearFormulario();
}

//Se declara la función para actualizar un libro
function actualizarLibro(titulo, autor, fecha) {
	libros[indiceEdicion] = { titulo, autor, fecha };
	editando = false;
	indiceEdicion = null;
	btnSubmit.textContent = 'Agregar Libro';
	ordenarPorFechaDescendente(libros);
}

//Se declaran la funcion para eliminar un libro
function eliminarLibro(index) {
	libros.splice(index, 1);
	guardarLibros();
	renderizarLibros();
}

//Se declara la función para editar un libro
function editarLibro(index) {
	const libro = libros[index];
	inputTitulo.value = libro.titulo;
	inputAutor.value = libro.autor;
	inputFecha.value = libro.fecha;
	btnSubmit.textContent = 'Actualizar Libro';
	editando = true;
	indiceEdicion = index;
}

//Se declara la función para resetear el formulario una vez enviado o editado el libro
function resetearFormulario() {
	formulario.reset();
	editando = false;
	indiceEdicion = null;
	btnSubmit.textContent = 'Agregar Libro';
}

//Se declara la función para guardar los libros
function guardarLibros() {
	const librosAGuardar = libros.filter(
		(libro) =>
			!librosIniciales.some(
				(inicial) =>
					inicial.titulo === libro.titulo && inicial.autor === libro.autor
			)
	);
	localStorage.setItem('libros', JSON.stringify(librosAGuardar));
}

//Se declaran los eventos que se van a utilizar en el código
formulario.addEventListener('submit', manejarFormulario); //Se añade el evento submit al formulario
ordenarPorFechaDescendente(libros); //Se ordenan los libros por fecha de forma descendente
btnOrdenarTitulo.addEventListener('click', ordenarPorTitulo); //Se añade el evento click al botón de ordenar por título
btnOrdenarAutor.addEventListener('click', ordenarPorAutor); //Se añade el evento click al botón de ordenar por autor
btnOrdenarFecha.addEventListener('click', toggleOrdenFecha); //Se añade el evento click al botón de ordenar por fecha
btnBorrarTodos.addEventListener('click', borrarTodosLosLibros); //Se añade el evento click al botón de borrar todos los libros
renderizarLibros(); //Se renderizan los libros
