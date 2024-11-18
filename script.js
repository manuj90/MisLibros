const formulario = document.getElementById('form-libro');
const listaLibros = document.getElementById('lista-libros');
const btnSubmit = formulario.querySelector("button[type='submit']");
const inputTitulo = document.getElementById('titulo');
const inputAutor = document.getElementById('autor');
const inputFecha = document.getElementById('fecha');
const btnOrdenarTitulo = document.querySelector('.ordenarTitulo');
const btnOrdenarAutor = document.querySelector('.ordenarAutor');
const btnOrdenarFecha = document.querySelector('.ordenarFecha');
const btnBorrarTodos = document.querySelector('.borrarTodos');

let librosGuardados = JSON.parse(localStorage.getItem('libros')) || [];

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

let libros = combinarLibros(librosIniciales, librosGuardados);
let editando = false;
let indiceEdicion = null;
let ordenAscendente = false;

function ordenarPorFechaDescendente(lista) {
	return lista.sort((a, b) => {
		const dateA = new Date(a.fecha || '1000-01-01');
		const dateB = new Date(b.fecha || '1000-01-01');
		return dateB - dateA;
	});
}

function normalizarTexto(texto) {
	return texto
		.toLowerCase()
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.trim()
		.replace(/\s+/g, ' ');
}

function combinarLibros(iniciales, guardados) {
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

function libroExiste(lista, libro) {
	return lista.some(
		(item) =>
			normalizarTexto(item.titulo) === normalizarTexto(libro.titulo) &&
			normalizarTexto(item.autor) === normalizarTexto(libro.autor)
	);
}

function formatearFecha(fecha) {
	return fecha ? fecha.split('-').reverse().join('/') : '';
}

function renderizarLibros() {
	listaLibros.innerHTML = '';
	libros.forEach((libro, index) => {
		const li = document.createElement('li');
		li.className = 'list-group-item book-item';
		const fechaFormateada = formatearFecha(libro.fecha);

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
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pencil-fill" viewBox="0 0 16 16">
                        <path d="M12.854.146a.5.5 0 0 0-.707 0L10.5 1.793 14.207 5.5l1.647-1.646a.5.5 0 0 0 0-.708zm.646 6.061L9.793 2.5 3.293 9H3.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.207zm-7.468 7.468A.5.5 0 0 1 6 13.5V13h-.5a.5.5 0 0 1-.5-.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.5-.5V10h-.5a.5.5 0 0 1-.175-.032l-.179.178a.5.5 0 0 0-.11.168l-2 5a.5.5 0 0 0 .65.65l5-2a.5.5 0 0 0 .168-.11z"/>
                    </svg>
                </button>
                <button class="btn btn-danger btn-sm" onclick="eliminarLibro(${index})" aria-label="Eliminar libro">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash-fill" viewBox="0 0 16 16">
                        <path d="M2.5 1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1H3v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4h.5a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1zm3 4a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5M8 5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7A.5.5 0 0 1 8 5m3 .5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 1 0"/>
                    </svg>
                </button>
            </div>
        `;
		listaLibros.appendChild(li);
	});
}

function ordenarPorTitulo() {
	libros.sort((a, b) => a.titulo.localeCompare(b.titulo, 'es'));
	renderizarLibros();
}

function ordenarPorAutor() {
	libros.sort((a, b) => a.autor.localeCompare(b.autor, 'es'));
	renderizarLibros();
}

function toggleOrdenFecha() {
	ordenAscendente = !ordenAscendente;
	libros.sort((a, b) => {
		const dateA = new Date(a.fecha || '1000-01-01');
		const dateB = new Date(b.fecha || '1000-01-01');
		return ordenAscendente ? dateA - dateB : dateB - dateA;
	});
	renderizarLibros();
}

function borrarTodosLosLibros() {
	if (confirm('¿Estás seguro de que quieres borrar todos los libros?')) {
		libros = [];
		localStorage.removeItem('libros');
		renderizarLibros();
	}
}

function manejarFormulario(event) {
	event.preventDefault();
	const titulo = inputTitulo.value.trim();
	const autor = inputAutor.value.trim();
	const fecha = inputFecha.value;

	if (!titulo || !autor) {
		alert('Por favor, completa todos los campos obligatorios.');
		return;
	}

	const nuevoLibro = { titulo, autor, fecha };

	if (editando) {
		actualizarLibro(titulo, autor, fecha);
	} else {
		const libroIndex = libros.findIndex(
			(libro) =>
				normalizarTexto(libro.titulo) === normalizarTexto(titulo) &&
				normalizarTexto(libro.autor) === normalizarTexto(autor)
		);

		if (libroIndex !== -1) {
			if (confirm('Este libro ya existe. ¿Deseas actualizar su información?')) {
				libros[libroIndex] = nuevoLibro;
			}
		} else {
			libros.push(nuevoLibro);
			ordenarPorFechaDescendente(libros);
		}
	}

	guardarLibros();
	renderizarLibros();
	resetearFormulario();
}

function actualizarLibro(titulo, autor, fecha) {
	libros[indiceEdicion] = { titulo, autor, fecha };
	editando = false;
	indiceEdicion = null;
	btnSubmit.textContent = 'Agregar Libro';
	ordenarPorFechaDescendente(libros);
}

function eliminarLibro(index) {
	libros.splice(index, 1);
	guardarLibros();
	renderizarLibros();
}

function editarLibro(index) {
	const libro = libros[index];
	inputTitulo.value = libro.titulo;
	inputAutor.value = libro.autor;
	inputFecha.value = libro.fecha;
	btnSubmit.textContent = 'Actualizar Libro';
	editando = true;
	indiceEdicion = index;
}

function resetearFormulario() {
	formulario.reset();
	editando = false;
	indiceEdicion = null;
	btnSubmit.textContent = 'Agregar Libro';
}

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

formulario.addEventListener('submit', manejarFormulario);
ordenarPorFechaDescendente(libros);
btnOrdenarTitulo.addEventListener('click', ordenarPorTitulo);
btnOrdenarAutor.addEventListener('click', ordenarPorAutor);
btnOrdenarFecha.addEventListener('click', toggleOrdenFecha);
btnBorrarTodos.addEventListener('click', borrarTodosLosLibros);
renderizarLibros();
