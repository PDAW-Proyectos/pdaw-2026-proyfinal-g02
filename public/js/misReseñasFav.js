import { setearAuthForms, checkAuthStatus } from "./auth.js";
import { cargarNavbar } from "./navbar.js";

document.addEventListener("DOMContentLoaded", async () => {
    const user = await checkAuthStatus();
    cargarNavbar(user);
    setearAuthForms();

    const contenedor = document.getElementById("favoritos-container");

    if (!user) {
        contenedor.innerHTML = `
            <div class="text-center text-warning py-5">
                <h3>Debes iniciar sesión para ver tus reseñas favoritas.</h3>
            </div>`;
        return;
    }

    await cargarReseñasFavoritas();
});

async function cargarReseñasFavoritas() {
    const contenedor = document.getElementById("favoritos-container");

    try {
        const respuesta = await fetch("/api/favoritas/:idReseña");
        
        if (!respuesta.ok) throw new Error("No se pudieron cargar las reseñas favoritas.");

        const favoritas = await respuesta.json();

        if (!favoritas || favoritas.length === 0) {
            contenedor.innerHTML = `
                <p class="text-center text-secondary py-4">Aún no tenés reseñas marcadas como favoritas.</p>`;
            return;
        }

        contenedor.innerHTML = favoritas.map(resena => `
            <div class="review-card mb-4" data-id="${resena.id}">
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
                    
                    <button class="btn btn-link p-0 text-decoration-none btn-favorito" data-id="${resena.id}" aria-label="Quitar de favoritas">
                        <i class="bi bi-heart-fill fs-5 text-danger"></i>
                    </button>
                </div>
            </div>
        `).join("");


        configurarBotonesFavoritos();

    } catch (error) {
        console.error("Error al obtener favoritas:", error);
        contenedor.innerHTML = `
            <p class="text-center text-danger py-4">Ocurrió un error al cargar tus reseñas favoritas.</p>`;
    }
}

function configurarBotonesFavoritos() {
    document.querySelectorAll(".btn-favorito").forEach(btn => {
        btn.addEventListener("click", async (e) => {
            const idReseña = e.currentTarget.getAttribute("data-id");
            
            try {
                const respuesta = await fetch(`/api/resenas/favoritas/${idReseña}`, {
                    method: "DELETE"
                });

                if (respuesta.ok) {
                    const tarjeta = document.querySelector(`.review-card[data-id="${idReseña}"]`);
                    if (tarjeta) tarjeta.remove();
                }
            } catch (err) {
                console.error("Error al actualizar favoritos:", err);
            }
        });
    });
}