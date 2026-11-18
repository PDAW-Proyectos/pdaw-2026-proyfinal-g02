import { checkAuthStatus, inicializarAuth } from "./auth.js";
import { cargarNavbar } from "./navbar.js";

document.addEventListener("DOMContentLoaded", async() => {
    const user = await checkAuthStatus();
    cargarNavbar(user, {mostrarBuscador: true});
    inicializarAuth()

    cargarReseñasPopulares();
    cargarUltimasReseñas();
});

async function cargarReseñasPopulares() {
    const grid = document.getElementById('popular-reviews-grid');
    if (!grid) return; 

    try {
        const response = await fetch('/api/resenas/populares?limit=3');
        if (!response.ok) throw new Error('Error al obtener reseñas populares');
        
        const reseñas = await response.json();

        if (reseñas && reseñas.length > 0) {
            grid.innerHTML = reseñas.map(item => `
                <div class="col-4 col-md-3">
                    <a href="/reseña.html?id=${item.id}" class="album-card">
                        <img src="${item.cancion?.imagen || item.portadaUrl || '/img/default-album.jpg'}" alt="Portada del álbum" loading="lazy">
                    </a>
                </div>
            `).join('');
        }
    } catch (error) {
        console.error('No se pudieron cargar las reseñas populares:', error);
    }
}

async function cargarUltimasReseñas() {
    const container = document.querySelector("#reviewsContainer");
    
    if (!container) return;

    try {
        container.innerHTML = `<p class="text-secondary text-center py-4">Cargando últimas reseñas...</p>`;

        const respuesta = await fetch("/api/resenas/ultimas?limit=6");
        
        if (!respuesta.ok) {
            throw new Error("No se pudieron cargar las reseñas.");
        }

        const reseñas = await respuesta.json();

        if (reseñas.length === 0) {
            container.innerHTML = `<p class="text-secondary text-center py-4">Todavía no hay reseñas publicadas. ¡Sé el primero en crear una!</p>`;
            return;
        }

        container.innerHTML = "";

        reseñas.forEach((reseña) => {
            const colDiv = document.createElement("div");
            colDiv.className = "col-12 mb-4";

            const fechaFormateada = new Date(reseña.fechaPublicado).toLocaleDateString("es-AR", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric"
            });

            const artistasStr = Array.isArray(reseña.cancion?.artistas) 
                ? reseña.cancion.artistas.join(", ") 
                : (reseña.cancion?.artistas || "Artista desconocido");

            const imagenCancion = reseña.cancion?.imagen || '/img/default-album.jpg';
            const albumNombre = reseña.cancion?.album ? `Álbum: ${reseña.cancion.album}` : "";

            colDiv.innerHTML = `
                <div class="review-card mb-4 p-4 rounded-4 bg-dark border border-secondary text-light shadow-sm">
                    <div class="row align-items-center g-4">
                        <!-- Portada del álbum -->
                        <div class="col-md-3 text-center">
                            <img src="${imagenCancion}" alt="Portada del álbum" class="img-fluid rounded-3 shadow" style="width: 130px; height: 130px; object-fit: cover;">
                        </div>

                        <!-- Información y contenido de la reseña -->
                        <div class="col-md-9">
                            <div class="d-flex justify-content-between align-items-start mb-1">
                                <div>
                                    <h4 class="card-title mb-1 fw-bold text-light">${reseña.cancion?.titulo || "Canción sin título"}</h4>
                                    <p class="text-secondary mb-2 fs-6"><i class="fa-solid fa-microphone-lines me-2 text-success"></i>${artistasStr} <span class="text-white ms-2">|</span> <span class="text-light ms-2">${albumNombre}</span></p>
                                </div>
                                <div class="fs-4 fw-bold text-warning bg-black px-3 py-1 rounded-pill border border-secondary">
                                    ★ ${reseña.valoracionPropia}
                                </div>
                            </div>

                            <p class="mb-3 review-desc text-white-55 fst-italic">
                                "${reseña.descripcion}"
                            </p>

                            <div class="d-flex justify-content-between align-items-center pt-3 border-top border-secondary">
                                <small class="text-white"><i class="fa-regular fa-calendar me-1"></i> Publicado el ${fechaFormateada}</small>
                                <a href="/reseña.html?id=${reseña.id}" class="btn btn-brand btn-sm px-4 py-2 fw-semibold shadow-sm">
                                    Ver reseña completa <i class="fa-solid fa-arrow-right ms-1"></i>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            container.appendChild(colDiv);
        });

    } catch (error) {
        console.error("Error:", error);
        container.innerHTML = `<p class="text-danger text-center py-4">Ocurrió un error al cargar las reseñas.</p>`;
    }
}