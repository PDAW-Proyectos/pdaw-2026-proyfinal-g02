import { checkAuthStatus, inicializarAuth } from "./auth.js";
import { cargarNavbar } from "./navbar.js";

document.addEventListener("DOMContentLoaded", async () => {
    const user = await checkAuthStatus();
    cargarNavbar(user, { mostrarBuscador: false });
    inicializarAuth();

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

// Listener global para cuando se abre el modal de reseñas
const resenaModal = document.getElementById('resenaModal');
if (resenaModal) {
    resenaModal.addEventListener('show.bs.modal', (event) => {
        const button = event.relatedTarget; // El botón "Reseñar" que se clickeó

        // Extraemos los datos de los atributos data-*
        const id = button.getAttribute('data-id');
        const titulo = button.getAttribute('data-titulo');
        const artistas = button.getAttribute('data-artistas');
        const imagen = button.getAttribute('data-imagen');
        const preview = button.getAttribute('data-preview');
        const album = button.getAttribute('data-album');

        // Rellenamos los elementos visuales del modal
        document.getElementById('modalCancionId').value = id;
        document.getElementById('modalCancionTitulo').textContent = titulo;
        document.getElementById('modalCancionArtista').textContent = `${artistas} — ${album}`;
        document.getElementById('modalCancionImg').src = imagen || '/img/default-album.jpg';
        
        // Configuramos y cargamos el reproductor de audio
        const audioElement = document.getElementById('modalAudioPreview');
        if (preview) {
            audioElement.src = preview;
            audioElement.style.display = 'block';
        } else {
            audioElement.src = '';
            audioElement.style.display = 'none';
        }
        
        // Limpiamos el formulario anterior
        document.getElementById('resenaFormModal').reset();
        document.getElementById('modalCancionId').value = id; // reasignamos el hidden que se borra con reset
    });

    // Pausar el audio automáticamente si cierran el modal
    resenaModal.addEventListener('hidden.bs.modal', () => {
        const audioElement = document.getElementById('modalAudioPreview');
        audioElement.pause();
        audioElement.currentTime = 0;
    });
}

// Manejar el envío (submit) del formulario de reseña desde el modal
const resenaFormModal = document.getElementById('resenaFormModal');
if (resenaFormModal) {
    resenaFormModal.addEventListener('submit', async (e) => {
        e.preventDefault();

        const cancionId = document.getElementById('modalCancionId').value;
        const valoracionPropia = parseInt(document.getElementById('modalValoracion').value);
        const descripcion = document.getElementById('modalDescripcion').value.trim();

        try {
            const response = await fetch('/api/resenas', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ cancionId, valoracionPropia, descripcion })
            });

            const data = await response.json();
            console.log(data)
            if (!response.ok) throw new Error(data.error || 'Error al guardar la reseña.');

            alert('¡Reseña publicada con éxito!');
            
            // Cerramos el modal usando Bootstrap
            const modalInstance = bootstrap.Modal.getInstance(resenaModal);
            modalInstance.hide();

        } catch (error) {
            console.error('Error:', error);
            alert(error.message);
        }
    });
}