
const API_URL = "http://localhost:8000/api/app"; 

const handleResponse = async (response) => {
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Error en la solicitud");
    }
    return response.json();
};

async function loadEstudiantes(filters = {}) {
    try {
        const queryString = new URLSearchParams(filters).toString();
        const response = await fetch(`${API_URL}/estudiantes?${queryString}`);
        const data = await handleResponse(response);
        renderEstudiantes(data.estudiantes);
        renderResumen(data.resumen);
    } catch (error) {
        alert("Error al cargar estudiantes: " + error.message);
    }
}

function renderEstudiantes(estudiantes) {
    const tablaEstudiantes = document.getElementById("tabla-estudiantes");
    if (!tablaEstudiantes) {
        console.error("No se encontró el contenedor de estudiantes.");
        return;
    }
    tablaEstudiantes.innerHTML = estudiantes
        .map(
            (e) => `
            <tr>
                <td>${e.cod}</td>
                <td>${e.nombres}</td>
                <td>${e.email}</td>
                <td>${e.nota_definitiva}</td>
                <td>${e.estado}</td>
                <td>
                    <button onclick="editEstudiante('${e.cod}')">Editar</button>
                    <button onclick="deleteEstudiante('${e.cod}')">Eliminar</button>
                    <button onclick="selectEstudiante('${e.cod}', '${e.nombres}', '${e.email}')">Seleccionar</button>
                </td>
            </tr>
            `
        )
        .join("");
}

async function loadNotas(codEstudiante) {
    try {
        const response = await fetch(`http://localhost:8000/api/estudiantes/${cod}/notas`);
        const data = await response.json();

        renderNotas(data.notas);

        renderResumenNotas(data.resumen);
    } catch (error) {
        console.error("Error al cargar las notas:", error);
        alert("No se pudieron cargar las notas.");
    }
}

function selectEstudiante(cod, nombres, email) {
    document.getElementById("info-codigo").textContent = cod;
    document.getElementById("info-nombre").textContent = nombres;
    document.getElementById("info-email").textContent = email;

    loadNotas(cod);
}
 
function renderResumen(resumen) {
    document.getElementById("total-aprobados").textContent = resumen.aprobados;
    document.getElementById("total-perdidos").textContent = resumen.reprobados;
    document.getElementById("total-sin-notas").textContent = resumen.sin_notas;
}

async function createEstudiante(estudiante) {
    try {
        const response = await fetch(`${API_URL}/estudiante`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "Accept": "application/json" },
            body: JSON.stringify(estudiante),
        });
        const data = await handleResponse(response);
        alert("Estudiante registrado exitosamente");

        await loadEstudiantes();
    } catch (error) {
        alert("Error al registrar estudiante: " + error.message);
    }
}


function addEstudianteToTable(estudiante) {
    const tablaEstudiantes = document.getElementById("tabla-estudiantes");
    const fila = `
        <tr>
            <td>${estudiante.cod}</td>
            <td>${estudiante.nombres}</td>
            <td>${estudiante.email}</td>
            <td>${estudiante.nota_definitiva || 'N/A'}</td>
            <td>${estudiante.estado || 'N/A'}</td>
            <td>
                <button onclick="editEstudiante('${estudiante.cod}')">Editar</button>
                <button onclick="deleteEstudiante('${estudiante.cod}')">Eliminar</button>
            </td>
        </tr>
    `;
    tablaEstudiantes.insertAdjacentHTML('beforeend', fila);
}


async function updateEstudiante(cod, estudiante) {
    try {
        const response = await fetch(`${API_URL}/estudiante/${cod}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json", "Accept": "application/json" },
            body: JSON.stringify(estudiante),
        });
        await handleResponse(response);
        alert("Estudiante actualizado exitosamente");
        await loadEstudiantes();
    } catch (error) {
        alert("Error al actualizar estudiante: " + error.message);
    }
}

function addEstudianteToTable(estudiante) {
    const tablaEstudiantes = document.getElementById("tabla-estudiantes");
    if (!tablaEstudiantes) {
        console.error("No se encontró el contenedor de estudiantes.");
        return;
    }
    const fila = `
        <tr>
            <td>${estudiante.cod}</td>
            <td>${estudiante.nombres}</td>
            <td>${estudiante.email}</td>
            <td>${estudiante.nota_definitiva || 'N/A'}</td>
            <td>${estudiante.estado || 'N/A'}</td>
            <td>
                <button onclick="editEstudiante('${estudiante.cod}')">Editar</button>
                <button onclick="deleteEstudiante('${estudiante.cod}')">Eliminar</button>
            </td>
        </tr>
    `;
    tablaEstudiantes.insertAdjacentHTML('beforeend', fila);
}


async function deleteEstudiante(cod) {
    if (!confirm("¿Estás seguro de eliminar este estudiante?")) return;
    try {
        const response = await fetch(`${API_URL}/estudiante/${cod}`, {
            method: "DELETE",
            headers: { "Accept": "application/json" },
        });
        await handleResponse(response);
        alert("Estudiante eliminado exitosamente");
        await loadEstudiantes();
    } catch (error) {
        alert("Error al eliminar estudiante: " + error.message);
    }
}

function editEstudiante(cod) {
    const estudiante = Array.from(
        document.querySelectorAll(`#tabla-estudiantes tr`)
    ).find((row) => row.children[0].textContent === cod);

    if (estudiante) {
        document.getElementById("cod").value = estudiante.children[0].textContent;
        document.getElementById("nombres").value =
            estudiante.children[1].textContent;
        document.getElementById("email").value =
            estudiante.children[2].textContent;
    }
}

async function saveEstudiante() {
    const cod = document.getElementById("cod").value;
    const nombres = document.getElementById("nombres").value;
    const email = document.getElementById("email").value;

    const estudiante = { cod, nombres, email };

    if (cod) {
        await updateEstudiante(cod, estudiante);
    } else {
        await createEstudiante(estudiante);
    }

    document.getElementById("form-estudiante").reset();
}
async function saveNota() {
    const actividad = document.getElementById("actividad").value;
    const nota = document.getElementById("nota").value;

    const codEstudiante = document.getElementById("info-codigo").textContent;

    if (!codEstudiante) {
        alert("Por favor, selecciona un estudiante antes de añadir una nota.");
        return;
    }

    const nuevaNota = {
        actividad,
        nota,
        codEstudiante,
    };

    try {
        const response = await fetch(`${API_URL}/notas`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
            },
            body: JSON.stringify(nuevaNota),
        });
        await handleResponse(response);
        alert("Nota registrada exitosamente");
        await loadNotas(codEstudiante);
        document.getElementById("form-nota").reset();
    } catch (error) {
        alert("Error al registrar la nota: " + error.message);
    }
}



function renderNotas(notas) {
    const tbody = document.getElementById("tabla-notas-body");
    tbody.innerHTML = ""; 

    notas.forEach((nota) => {
        const tr = document.createElement("tr");

        const rangoClass = getNotaRangoClass(nota.nota);

        tr.innerHTML = `
            <td>${nota.actividad}</td>
            <td class="${rangoClass}">${nota.nota}</td>
            <td>
                <button onclick="editNota(${nota.id})">Editar</button>
                <button onclick="deleteNota(${nota.id})">Eliminar</button>
            </td>
        `;

        tbody.appendChild(tr);
    });
}

function getNotaRangoClass(nota) {
    if (nota < 3) return "nota-baja";
    if (nota >= 3) return "nota-alta";
    return "";
}

function renderResumenNotas(resumen) {
    document.getElementById("notas-bajas").textContent = resumen.notas_bajas;
    document.getElementById("notas-altas").textContent = resumen.notas_altas;
}


function applyFilterEstudiantes() {
    const codigo = document.getElementById("filtro-codigo").value;
    const nombre = document.getElementById("filtro-nombre").value;
    const email = document.getElementById("filtro-email").value;
    const estado = document.getElementById("filtro-estado").value;

    const filters = { codigo, nombre, email, estado };
    loadEstudiantes(filters);
}

document.addEventListener("DOMContentLoaded", () => {
    loadEstudiantes();
});
