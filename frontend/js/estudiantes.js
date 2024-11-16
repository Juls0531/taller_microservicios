const API_BASE = 'http://127.0.0.1:8000/api/app/';

let estudiantes = [];
let notas = [];
let estudianteSeleccionado = null;


async function cargarEstudiantes() {
    try {
        const response = await fetch(`${API_BASE}estudiantes`);
        estudiantes = await response.json();
        actualizarTablaEstudiantes();
    } catch (error) {
        console.error('Error al cargar estudiantes:', error);
        alert('No se pudo cargar la lista de estudiantes.');
    }
}


async function guardarEstudiante(event) {
    event.preventDefault();
    const id = document.getElementById('estudiante-id').value;
    const nombre = document.getElementById('nombre').value;
    const email = document.getElementById('email').value;
    const telefono = document.getElementById('telefono').value;

    const datos = { nombre, email, telefono };

    try {
        const response = id
            ? await fetch(`${API_BASE}estudiante/${id}`, {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(datos),
              })
            : await fetch(`${API_BASE}estudiante`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(datos),
              });

        if (response.ok) {
            cargarEstudiantes();
            document.getElementById('form-estudiante').reset();
        } else {
            const error = await response.json();
            alert(`Error: ${error.message}`);
        }
    } catch (error) {
        console.error('Error al guardar estudiante:', error);
        alert('Ocurrió un error al intentar guardar el estudiante.');
    }
}


async function eliminarEstudiante(id) {
    if (confirm('¿Estás seguro de eliminar este estudiante?')) {
        try {
            const response = await fetch(`${API_BASE}estudiante/${id}`, { method: 'DELETE' });
            if (response.ok) {
                cargarEstudiantes();
            } else {
                const error = await response.json();
                alert(`Error: ${error.message}`);
            }
        } catch (error) {
            console.error('Error al eliminar estudiante:', error);
            alert('Ocurrió un error al intentar eliminar el estudiante.');
        }
    }
}


function editarEstudiante(id) {
    const estudiante = estudiantes.find(est => est.id === id);
    document.getElementById('estudiante-id').value = estudiante.id;
    document.getElementById('nombre').value = estudiante.nombre;
    document.getElementById('email').value = estudiante.email;
    document.getElementById('telefono').value = estudiante.telefono;
}


function seleccionarEstudiante(id) {
    estudianteSeleccionado = estudiantes.find(est => est.id === id);
    cargarNotas(estudianteSeleccionado.id);
}


async function cargarNotas(idEstudiante) {
    try {
        const response = await fetch(`${API_BASE}notas`);
        const todasNotas = await response.json();
        notas = todasNotas.filter(nota => nota.id_estudiante === idEstudiante);
        actualizarTablaNotas();
    } catch (error) {
        console.error('Error al cargar notas:', error);
        alert('No se pudo cargar las notas del estudiante.');
    }
}


async function guardarNota(event) {
    event.preventDefault();
    const id = document.getElementById('nota-id').value;
    const asignatura = document.getElementById('asignatura').value;
    const nota = parseFloat(document.getElementById('nota').value);

    const datos = { id_estudiante: estudianteSeleccionado.id, asignatura, nota };

    try {
        const response = id
            ? await fetch(`${API_BASE}nota/${id}`, {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(datos),
              })
            : await fetch(`${API_BASE}nota`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(datos),
              });

        if (response.ok) {
            cargarNotas(estudianteSeleccionado.id);
            document.getElementById('form-nota').reset();
        } else {
            const error = await response.json();
            alert(`Error: ${error.message}`);
        }
    } catch (error) {
        console.error('Error al guardar nota:', error);
        alert('Ocurrió un error al intentar guardar la nota.');
    }
}


async function eliminarNota(id) {
    if (confirm('¿Estás seguro de eliminar esta nota?')) {
        try {
            const response = await fetch(`${API_BASE}nota/${id}`, { method: 'DELETE' });
            if (response.ok) {
                cargarNotas(estudianteSeleccionado.id);
            } else {
                const error = await response.json();
                alert(`Error: ${error.message}`);
            }
        } catch (error) {
            console.error('Error al eliminar nota:', error);
            alert('Ocurrió un error al intentar eliminar la nota.');
        }
    }
}

function editarNota(id) {
    const nota = notas.find(n => n.id === id);
    document.getElementById('nota-id').value = nota.id;
    document.getElementById('asignatura').value = nota.asignatura;
    document.getElementById('nota').value = nota.nota;
}


function actualizarTablaEstudiantes() {
    tablaEstudiantes.innerHTML = '';
    estudiantes.forEach(est => {
        const fila = `
            <tr>
                <td>${est.nombre}</td>
                <td>${est.email}</td>
                <td>${est.telefono}</td>
                <td>
                    <button onclick="editarEstudiante(${est.id})">Editar</button>
                    <button onclick="eliminarEstudiante(${est.id})">Eliminar</button>
                    <button onclick="seleccionarEstudiante(${est.id})">Notas</button>
                </td>
            </tr>
        `;
        tablaEstudiantes.innerHTML += fila;
    });
}


function actualizarTablaNotas() {
    tablaNotas.innerHTML = '';
    notas.forEach(nota => {
        const fila = `
            <tr>
                <td>${nota.asignatura}</td>
                <td>${nota.nota}</td>
                <td>
                    <button onclick="editarNota(${nota.id})">Editar</button>
                    <button onclick="eliminarNota(${nota.id})">Eliminar</button>
                </td>
            </tr>
        `;
        tablaNotas.innerHTML += fila;
    });
}


document.getElementById('form-estudiante').addEventListener('submit', guardarEstudiante);
document.getElementById('form-nota').addEventListener('submit', guardarNota);
cargarEstudiantes();
