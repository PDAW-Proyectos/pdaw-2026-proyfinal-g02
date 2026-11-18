import { checkAuthStatus, inicializarAuth } from "./auth.js";
import { cargarNavbar } from "./navbar.js";

document.addEventListener("DOMContentLoaded", async () => {
    const user = await checkAuthStatus();
    cargarNavbar(user);
    inicializarAuth();

    const contenedor = document.querySelector(".favorites-container");

    if (!user) {
        contenedor.innerHTML = `
            <div class="text-center text-warning py-5">
                <h3>Debes iniciar sesión para ver tus reseñas.</h3>
            </div>`;
        return;
    }

    await cargarMisResenas(user.id);
});

async function cargarMisResenas(idUsuario) {
    const contenedor = document.querySelector(".favorites-container");

    try {
        const respuesta = await fetch(`/api/resenas/usuario/${idUsuario}`);
        
        if (!respuesta.ok) throw new Error("No se pudieron cargar tus reseñas.");

        const reseñas = await respuesta.json();

        if (!reseñas || reseñas.length === 0) {
            contenedor.innerHTML = `
                <p class="text-center text-secondary py-4">Aún no has creado ninguna reseña.</p>`;
            return;
        }

        contenedor.innerHTML = reseñas.map(reseña => {
            const imagenCancion = reseña.cancion?.imagen || reseña.imagen || '';
            const artistasStr = Array.isArray(reseña.cancion?.artistas) 
                ? reseña.cancion.artistas.join(', ') 
                : (reseña.cancion?.artistas || reseña.artista || 'Artista desconocido');
            const albumNombre = reseña.cancion?.album || reseña.album || 'Álbum desconocido';
            const tituloCancion = reseña.cancion?.titulo || reseña.titulo || 'Canción sin título';
            const valoracion = reseña.valoracionPropia || reseña.rating || '0';
            const descripcion = reseña.descripcion || reseña.comentario || '';
            
            const fechaFormateada = reseña.fechaPublicado 
                ? new Date(reseña.fechaPublicado).toLocaleDateString() 
                : (reseña.tiempo || 'hace un momento');

            return `
                <div class="review-card mb-4 p-4 rounded-4 bg-dark border border-secondary text-light shadow-sm" data-id="${reseña.id}">
                    <div class="row align-items-center g-4">
                        <!-- Portada del álbum -->
                        <div class="col-md-3 text-center">
                            <img src="${imagenCancion}" alt="Portada del álbum" class="img-fluid rounded-3 shadow" style="width: 130px; height: 130px; object-fit: cover;">
                        </div>

                        <!-- Información y contenido de la reseña -->
                        <div class="col-md-9">
                            <div class="d-flex justify-content-between align-items-start mb-1">
                                <div>
                                    <h4 class="card-title mb-1 fw-bold text-light">${tituloCancion}</h4>
                                    <p class="text-secondary mb-2 fs-6">
                                        <i class="fa-solid fa-microphone-lines me-2 text-success"></i>${artistasStr} 
                                        <span class="text-muted ms-2">|</span> 
                                        <span class="text-light ms-2">${albumNombre}</span>
                                    </p>
                                </div>
                                <div class="fs-4 fw-bold text-warning bg-black px-3 py-1 rounded-pill border border-secondary">
                                    ★ ${valoracion}.0
                                </div>
                            </div>

                            <p class="mb-3 review-desc text-white-55 fst-italic">
                                "${descripcion}"
                            </p>

                            <div class="d-flex justify-content-between align-items-center pt-3 border-top border-secondary">
                                <small class="text-muted">
                                    <i class="fa-regular fa-calendar me-1"></i> Publicado el ${fechaFormateada}
                                </small>
                                <div class="d-flex gap-2">
                                    <!-- Botón Editar -->
                                    <button class="btn btn-outline-primary btn-sm px-3 py-1 fw-semibold btn-editar" data-id="${reseña.id}" aria-label="Editar reseña">
                                        <i class="bi bi-pencil-fill me-1"></i> Editar
                                    </button>
                                    <!-- Botón Eliminar -->
                                    <button class="btn btn-outline-danger btn-sm px-3 py-1 fw-semibold btn-eliminar" data-id="${reseña.id}" aria-label="Eliminar reseña">
                                        <i class="bi bi-trash-fill me-1"></i> Eliminar
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join("");

        configurarAcciones();

    } catch (error) {
        console.error("Error:", error);
        contenedor.innerHTML = `
            <p class="text-center text-danger py-4">Ocurrió un error al cargar tus reseñas.</p>`;
    }
}

    document.querySelectorAll(".btn-editar").forEach(btn => {
        btn.addEventListener("click", (e) => {
            const idReseña = e.currentTarget.getAttribute("data-id");
            alert(`Editar reseña con ID: ${idReseña}`);
        });
    });


function configurarAcciones() {
    document.querySelectorAll(".btn-eliminar").forEach(btn => {
        btn.addEventListener("click", async (e) => {
            const idReseña = e.currentTarget.getAttribute("data-id");
            
            if (confirm("¿Estás seguro de que querés eliminar esta reseña?")) {
                try {
                    const respuesta = await fetch(`/api/resenas/${idReseña}`, {
                        method: "DELETE"
                    });

                    if (respuesta.ok) {
                        const tarjeta = document.querySelector(`.review-card[data-id="${idReseña}"]`);
                        if (tarjeta) tarjeta.remove();
                    } else {
                        alert("No se pudo eliminar la reseña.");
                    }
                } catch (err) {
                    console.error("Error al eliminar:", err);
                }
            }
        });
    });

    document.querySelectorAll(".btn-editar").forEach(btn => {
        btn.addEventListener("click", (e) => {
            const idReseña = e.currentTarget.getAttribute("data-id");
            alert(`Editar reseña con ID: ${idReseña}`);
        });
    });
}