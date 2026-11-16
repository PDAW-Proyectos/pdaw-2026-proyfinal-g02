export async function cargarUltimasReseñas() {
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
            colDiv.className = "col-md-4 mb-4"; // Añadí mb-4 para separar las filas si hay varias

            // Formateamos la fecha o calculamos antigüedad de forma sencilla
            const fechaFormateada = new Date(reseña.fechaPublicado).toLocaleDateString("es-AR", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric"
            });

            // Manejo seguro de artistas (si es array u objeto según venga de Deezer/modelo)
            const artistasStr = Array.isArray(reseña.cancion.artistas) 
                ? reseña.cancion.artistas.join(", ") 
                : (reseña.cancion.artistas || "Artista desconocido");

            colDiv.innerHTML = `
                <div class="review-card mb-4">
                <div class="row align-items-center">

                    <div
                        class="col-3 text-center d-flex flex-column justify-content-around py-2">
                    </div>

                    <div class="col-9">
                        <div class="d-flex justify-content-between align-items-start mb-2">
                            <div class="d-flex align-items-center gap-3">
                                <div
                                    class="rounded-circle d-flex align-items-center justify-content-center fw-bold review-avatar-icon">
                                    <i class="bi bi-music-note-beamed fs-5"></i>
                                </div>
                                <div>
                                    <h5 class="card-title mb-0 fw-bold">${reseña.cancion.titulo}</h5>
                                    <small class="text-secondary">${artistasStr}s</small>
                                </div>
                            </div>
                            <span class="genre-tag bg-warning text-dark">Pop</span>
                        </div>

                        <div class="my-2">
                            <span class="fs-4 fw-bold text-white">★ ${reseña.valoracionPropia}.0</span>
                        </div>

                        <p class="mb-3 review-desc">
                            ${reseña.descripcion}
                        </p>

                        <div
                            class="d-flex justify-content-between align-items-center pt-2 border-top review-border-top">
                            <small class="text-secondary">Fecha de publicacion: ${fechaFormateada}</small>
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

export async function cargarReseñasPopulares() {
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