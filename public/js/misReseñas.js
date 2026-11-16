import { setearAuthForms, checkAuthStatus } from "./auth.js";
import { cargarNavbar } from "./navbar.js";

document.addEventListener("DOMContentLoaded", async () => {
    const user = await checkAuthStatus();
    cargarNavbar(user);
    setearAuthForms();

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

        contenedor.innerHTML = reseñas.map(resena => `
            <div class="review-card mb-4" data-id="${resena.id}">
                <div class="row align-items-center">

                    <!-- Columna de Botones (Acciones) -->
                    <div class="col-3 text-center d-flex flex-column justify-content-around py-2">
                        <div class="mb-3">
                            <small class="d-block text-secondary mb-1">Eliminar</small>
                            <button class="btn btn-link p-0 text-decoration-none btn-eliminar" data-id="${resena.id}" aria-label="Eliminar reseña">
                                <span class="rounded-circle bg-danger text-white d-inline-flex align-items-center justify-content-center btn-acciones">
                                    <i class="bi bi-x-lg"></i>
                                </span>
                            </button>
                        </div>
                        <div>
                            <small class="d-block text-secondary mb-1">Editar</small>
                            <button class="btn btn-link p-0 text-decoration-none btn-editar" data-id="${resena.id}" aria-label="Editar reseña">
                                <span class="rounded-circle bg-primary text-white d-inline-flex align-items-center justify-content-center btn-acciones">
                                    <i class="bi bi-pencil-fill"></i>
                                </span>
                            </button>
                        </div>
                    </div>

                    <!-- Columna de Contenido de la Reseña -->
                    <div class="col-9">
                        <div class="d-flex justify-content-between align-items-start mb-2">
                            <div class="d-flex align-items-center gap-3">
                                <div class="rounded-circle d-flex align-items-center justify-content-center fw-bold review-avatar-icon">
                                    <i class="bi bi-music-note-beamed fs-5"></i>
                                </div>
                                <div>
                                    <h5 class="card-title mb-0 fw-bold">${resena.cancion?.titulo || resena.titulo || 'Canción'}</h5>
                                    <small class="text-secondary">${resena.cancion?.artistas || resena.artista || 'Artista'}</small>
                                </div>
                            </div>
                            <span class="genre-tag bg-success text-light">${resena.cancion?.genero || resena.genero || 'Pop'}</span>
                        </div>

                        <div class="my-2">
                            <span class="fs-4 fw-bold text-white">★ ${resena.valoracionPropia || resena.rating || '0'}</span>
                        </div>

                        <p class="mb-3 review-desc">
                            "${resena.descripcion || resena.comentario || ''}"
                        </p>

                        <div class="d-flex justify-content-between align-items-center pt-2 border-top review-border-top">
                            <small class="text-secondary">${resena.tiempo || 'hace un momento'}</small>
                        </div>
                    </div>

                </div>
            </div>
        `).join("");

        configurarAcciones();

    } catch (error) {
        console.error("Error:", error);
        contenedor.innerHTML = `
            <p class="text-center text-danger py-4">Ocurrió un error al cargar tus reseñas.</p>`;
    }
}

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

    // Configurar botón editar (puedes redirigir a un modal o vista de edición)
    document.querySelectorAll(".btn-editar").forEach(btn => {
        btn.addEventListener("click", (e) => {
            const idReseña = e.currentTarget.getAttribute("data-id");
            alert(`Editar reseña con ID: ${idReseña}`);
        });
    });
}