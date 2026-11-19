import { checkAuthStatus, inicializarAuth } from "./auth.js";
import { inicializarModalReseña } from "./modalReseña.js";
import { cargarNavbar } from "./navbar.js";

document.addEventListener("DOMContentLoaded", async () => {
    const user = await checkAuthStatus();
    cargarNavbar(user, { mostrarBuscador: false });
    inicializarAuth();
    inicializarModalReseña()

    const inputBuscar = document.getElementById("input-buscar");
    const params = new URLSearchParams(window.location.search);
    const terminoUrl = params.get("q");

    // 1. Si se accedió con un parámetro de búsqueda en la URL, lo buscamos
    if (terminoUrl) {
        inputBuscar.value = terminoUrl;
        buscarCanciones(terminoUrl);
    } else {
        // Si entró de forma normal, cargamos el top global
        cargarTopGlobal();
    }

    // 2. Permitir buscar escribiendo en el input de la misma vista y presionando Enter
    if (inputBuscar) {
        inputBuscar.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                e.preventDefault();
                const termino = inputBuscar.value.trim();
                
                if (termino !== "") {
                    // Actualizamos la URL sin recargar la página para mantener la prolijidad
                    window.history.pushState({}, "", `/explorar.html?q=${encodeURIComponent(termino)}`);
                    buscarCanciones(termino);
                } else {
                    // Si borra todo y da enter, volvemos al top global
                    window.history.pushState({}, "", `/explorar.html`);
                    cargarTopGlobal();
                }
            }
        });
    }
});

// Cargar el Top Global
async function cargarTopGlobal() {
    const contenedor = document.getElementById("contenedor-resultados");
    contenedor.innerHTML = `<p class="text-center text-secondary py-4">Cargando música destacada...</p>`;
    
    try {
        const response = await fetch('/api/deezer/topGlobal');
        if (!response.ok) throw new Error("Error al cargar el top global");

        const canciones = await response.json();
        renderizarCanciones(canciones);
    } catch (error) {
        console.error(error);
        contenedor.innerHTML = `<p class="text-center text-danger py-4">No se pudo cargar la música en este momento.</p>`;
    }
}

// Buscar canciones contra el backend/Deezer
async function buscarCanciones(termino) {
    const contenedor = document.getElementById("contenedor-resultados");
    contenedor.innerHTML = `<p class="text-center text-secondary py-4">Buscando "${termino}"...</p>`;

    try {
        const response = await fetch(`/api/deezer/buscar?q=${encodeURIComponent(termino)}`);
        if (!response.ok) throw new Error("Error al buscar canciones");

        const data = await response.json();
        // Aseguramos que maneje tanto si devuelve un array directo como un objeto con propiedad data
        const canciones = Array.isArray(data) ? data : (data.data || []);
        
        renderizarCanciones(canciones);
    } catch (error) {
        console.error(error);
        contenedor.innerHTML = `<p class="text-center text-danger py-4">Ocurrió un error al realizar la búsqueda.</p>`;
    }
}

// Renderizar las tarjetas en el DOM
function renderizarCanciones(canciones) {
    const contenedor = document.getElementById("contenedor-resultados");
    contenedor.innerHTML = "";

    if (!canciones || canciones.length === 0) {
        contenedor.innerHTML = `<p class="text-center text-secondary py-4">No se encontraron canciones para tu búsqueda.</p>`;
        return;
    }

    canciones.forEach(cancion => {
        const artistas = Array.isArray(cancion.artistas) 
            ? cancion.artistas.join(', ') 
            : (cancion.artistas || 'Artista desconocido');

        const tarjetaHTML = `
            <div class="review-card explore-card mb-4 p-3 d-flex align-items-center justify-content-between bg-dark border border-secondary rounded-4 text-light">
                <div class="d-flex align-items-center">
                    <div class="img-explorar rounded-3 overflow-hidden flex-shrink-0 me-4 shadow-sm" style="width: 80px; height: 80px;">
                        <img src="${cancion.imagen || '/img/default-album.jpg'}" alt="${cancion.titulo}" class="w-100 h-100 object-fit-cover">
                    </div>
            
                    <div>
                        <h5 class="card-title fw-bold mb-1 text-white">${cancion.titulo}</h5>
                        <p class="text-secondary small mb-1"><i class="fa-solid fa-microphone me-1"></i> ${artistas}</p>
                        <p class="text-muted small mb-0"><i class="fa-solid fa-compact-disc me-1"></i> ${cancion.album || 'Álbum desconocido'}</p>
                    </div>
                </div>

                <div class="ms-3">
                    <button class="btn btn-outline-light btn-sm px-3 py-2 btn-abrir-resena" 
                        data-bs-toggle="modal" 
                        data-bs-target="#resenaModal"
                        data-id="${cancion.id}"
                        data-titulo="${cancion.titulo}"
                        data-artistas="${artistas}"
                        data-imagen="${cancion.imagen || ''}"
                        data-preview="${cancion.previewUrl || ''}"
                        data-album="${cancion.album || ''}">
                        <i class="bi bi-star me-1 text-warning"></i> Reseñar
                    </button>
                </div>
            </div>
        `;

        contenedor.innerHTML += tarjetaHTML;
    });
}