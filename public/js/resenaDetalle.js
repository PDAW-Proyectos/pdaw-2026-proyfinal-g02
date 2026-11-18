import { checkAuthStatus, inicializarAuth } from "./auth.js";
import { cargarNavbar } from "./navbar.js";

document.addEventListener("DOMContentLoaded", async () => {
    // 1. Inicializamos autenticación y navbar
    const user = await checkAuthStatus();
    cargarNavbar(user, { mostrarBuscador: true });
    inicializarAuth();

    // 2. Leemos el ID de la reseña desde los parámetros de la URL (?id=...)
    const params = new URLSearchParams(window.location.search);
    const reseñaId = params.get("id");

    const contenedor = document.getElementById("detalleResenaContainer");

    if (!reseñaId) {
        contenedor.innerHTML = `
            <div class="alert alert-danger text-center" role="alert">
                No se especificó ninguna reseña para mostrar.
            </div>
        `;
        return;
    }

    // 3. Consultamos al backend por el detalle de la reseña
    try {
        const response = await fetch(`/api/resenas/${reseñaId}`);
        
        if (!response.ok) {
            throw new Error("No se pudo encontrar la reseña solicitada.");
        }

        const reseña = await response.json();
        renderizarDetalleReseña(reseña, contenedor);

    } catch (error) {
        console.error("Error:", error);
        contenedor.innerHTML = `
            <div class="alert alert-dark border border-secondary text-center text-danger py-4" role="alert">
                <i class="bi bi-exclamation-triangle fs-3 mb-2 d-block"></i>
                Ocurrió un error al cargar la reseña o la misma ya no existe.
            </div>
        `;
    }
});

function renderizarDetalleReseña(reseña, contenedor) {
    // Formatear fecha
    const fechaFormateada = new Date(reseña.fechaPublicado).toLocaleDateString("es-AR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });

    // Manejo de artistas
    const artistasStr = Array.isArray(reseña.cancion?.artistas) 
        ? reseña.cancion.artistas.join(", ") 
        : (reseña.cancion?.artistas || "Artista desconocido");

    const imagenCancion = reseña.cancion?.imagen || '/img/default-album.jpg';
    const previewUrl = reseña.cancion?.previewUrl;

    contenedor.innerHTML = `
        <div class="card bg-dark border border-secondary rounded-4 shadow-lg text-light p-4 p-md-5">
            <!-- Cabecera con Canción y Artista -->
            <div class="row align-items-center g-4 mb-4">
                <div class="col-md-4 text-center">
                    <img src="${imagenCancion}" alt="Portada del álbum" class="img-fluid rounded-4 shadow" style="width: 180px; height: 180px; object-fit: cover;">
                </div>
                <div class="col-md-8">
                    <span class="badge bg-success bg-opacity-25 text-success border border-success mb-2 px-3 py-1 rounded-pill">Bitácora Musical</span>
                    <h1 class="fw-bold mb-1 display-6 text-white">${reseña.cancion?.titulo || "Canción sin título"}</h1>
                    <p class="text-secondary fs-5 mb-2"><i class="fa-solid fa-microphone me-2 text-success"></i>${artistasStr}</p>
                    <p class="text-muted small mb-0"><i class="fa-solid fa-compact-disc me-2"></i>Álbum: ${reseña.cancion?.album || "Desconocido"}</p>
                </div>
            </div>

            <!-- Reproductor de Audio (Deezer Preview) -->
            ${previewUrl ? `
                <div class="mb-4 p-3 bg-black rounded-3 border border-secondary">
                    <p class="text-secondary small mb-2"><i class="fa-solid fa-volume-high me-1 text-warning"></i> Escuchá un fragmento:</p>
                    <audio controls class="w-100" style="height: 40px;">
                        <source src="${previewUrl}" type="audio/mpeg">
                        Tu navegador no soporta el elemento de audio.
                    </audio>
                </div>
            ` : ''}

            <!-- Valoración y Descripción / Opinión -->
            <div class="mb-4">
                <div class="d-flex align-items-center gap-2 mb-3">
                    <div class="fs-4 fw-bold text-warning bg-black px-3 py-1 rounded-pill border border-secondary">
                        ★ ${reseña.valoracionPropia}.0
                    </div>
                    <span class="text-secondary small">Valoración personal</span>
                </div>

                <h5 class="text-light fw-semibold mb-2">Opinión de la bitácora:</h5>
                <div class="p-4 bg-black bg-opacity-50 rounded-3 border border-secondary text-white-50 fst-italic fs-5">
                    "${reseña.descripcion}"
                </div>
            </div>

            <!-- Metadatos, Autor y Botones de Acción -->
            <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center pt-3 border-top border-secondary text-muted small gap-3">
                <div class="d-flex align-items-center flex-wrap gap-2">
                    <span><i class="fa-regular fa-calendar me-1"></i> ${fechaFormateada}</span>
                    <span>•</span>
                    <span>Por <strong class="text-light">${reseña.autor?.nombre || 'Anónimo'}</strong></span>
                    <button id="btnSeguir" class="btn btn-outline-light btn-sm ms-2 py-1 px-3 rounded-pill" data-usuario-id="${reseña.autor?.id}">
                        <i class="fa-solid fa-user-plus me-1 text-success"></i> Seguir
                    </button>
                </div>
                <div>
                    <button id="btnFavorito" class="btn btn-outline-warning btn-sm py-1 px-3 rounded-pill">
                        <i class="fa-regular fa-star me-1"></i> Favorita (<span id="contadorFavoritos">${reseña.cantidadFavoritos || 0}</span>)
                    </button>
                </div>
            </div>
        </div>
    `;

    // Adjuntar interactividad a los botones recién creados
    configurarAccionesDetalle(reseña.id);
}

function configurarAccionesDetalle(reseñaId) {
    const btnSeguir = document.getElementById("btnSeguir");
    if (btnSeguir) {
        btnSeguir.addEventListener("click", () => {
            // Lógica para seguir al usuario (puedes conectarla con tu endpoint de backend)
            alert("¡Ahora seguís a este usuario!");
            btnSeguir.innerHTML = `<i class="fa-solid fa-check me-1 text-success"></i> Siguiendo`;
            btnSeguir.classList.remove("btn-outline-light");
            btnSeguir.classList.add("btn-success", "text-white");
        });
    }

    const btnFavorito = document.getElementById("btnFavorito");
    if (btnFavorito) {
        btnFavorito.addEventListener("click", () => {
            // Lógica para marcar como favorita (puedes conectarla con tu endpoint de favoritos)
            const contador = document.getElementById("contadorFavoritos");
            let actual = parseInt(contador.textContent);
            contador.textContent = actual + 1;
            btnFavorito.innerHTML = `<i class="fa-solid fa-star me-1 text-warning"></i> Favorita (<span id="contadorFavoritos">${actual + 1}</span>)`;
            btnFavorito.classList.remove("btn-outline-warning");
            btnFavorito.classList.add("btn-warning", "text-dark");
        });
    }
}