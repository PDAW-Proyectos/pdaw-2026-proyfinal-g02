import { checkAuthStatus, inicializarAuth } from "./auth.js";
import { cargarFooter } from "./footer.js";
import { cargarNavbar } from "./navbar.js";

document.addEventListener("DOMContentLoaded", async () => {
    cargarFooter()
    const user = await checkAuthStatus();
    cargarNavbar(user, { mostrarBuscador: true });
    inicializarAuth();

    const contenedor = document.querySelector(".favorites-container");
    if (!contenedor) return;

    if (!user) {
        contenedor.innerHTML = `
            <div class="text-center text-warning py-5">
                <h3>Debés iniciar sesión para ver tus reseñas favoritas.</h3>
            </div>`;
        return;
    }

    await cargarFavoritas(user);
});

async function cargarFavoritas(user) {
    const contenedor = document.querySelector(".favorites-container");

    try {
        contenedor.innerHTML = `<p class="text-center text-secondary py-4">Cargando reseñas favoritas...</p>`;

        const idsFavoritas = Array.isArray(user.reseñasFavoritas)
            ? user.reseñasFavoritas.map(Number)
            : [];

        if (idsFavoritas.length === 0) {
            contenedor.innerHTML = `
                <p class="text-center text-secondary py-4">
                    Aún no agregaste ninguna reseña a favoritas.
                </p>`;
            return;
        }

        const respuesta = await fetch("/api/resenas");
        if (!respuesta.ok) throw new Error("No se pudieron cargar las reseñas.");

        const data = await respuesta.json();
        const todas = Array.isArray(data) ? data : (data.resenas || []);

        const filtradoFavoritas = todas.filter((reseña) =>
            idsFavoritas.includes(Number(reseña.id))
        );

        if (filtradoFavoritas.length === 0) {
            contenedor.innerHTML = `
                <p class="text-center text-secondary py-4">
                    No se encontraron reseñas favoritas disponibles.
                </p>`;
            return;
        }

        renderizar(filtradoFavoritas, contenedor, user);
    } catch (error) {
        console.error("Error:", error);
        contenedor.innerHTML = `
            <p class="text-center text-danger py-4">Ocurrió un error al cargar las reseñas favoritas.</p>`;
    }
}

function renderizar(reseñas, contenedor, user) {
    contenedor.innerHTML = reseñas.map((reseña) => {
        const imagenCancion = reseña.cancion?.imagen || reseña.imagen || "/img/default-album.jpg";
        const artistasStr = Array.isArray(reseña.cancion?.artistas)
            ? reseña.cancion.artistas.join(", ")
            : (reseña.cancion?.artistas || reseña.artista || "Artista desconocido");
        const albumNombre = reseña.cancion?.album ? `Álbum: ${reseña.cancion.album}` : "";
        const tituloCancion = reseña.cancion?.titulo || reseña.titulo || "Canción sin título";
        const valoracion = reseña.valoracionPropia ?? reseña.rating ?? "-";
        const descripcion = reseña.descripcion || reseña.comentario || "";

        const fechaFormateada = reseña.fechaPublicado
            ? new Date(reseña.fechaPublicado).toLocaleDateString("es-AR", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric"
            })
            : (reseña.tiempo || "hace un momento");

        const nombreAutor = reseña.nombreAutor || reseña.autor?.username || reseña.autor?.nombre || "Usuario";
        const idAutor = reseña.idUsuario ?? reseña.autor?.id;
        const autorHtml =
            idAutor !== undefined && idAutor !== null
                ? `<a href="/resenas.html?id=${idAutor}" class="text-light text-decoration-none fw-bold link-success">${nombreAutor}</a>`
                : `<strong class="text-light">${nombreAutor}</strong>`;

        const esPropia = Boolean(user) && String(user.id) === String(idAutor);
        const badgeTuReseña = esPropia ? `
            <span class="badge bg-success bg-opacity-25 text-success border border-success px-2 py-1 rounded-pill">
                <i class="fa-solid fa-user-check me-1"></i> Tu reseña
            </span>
        ` : "";

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
                                    ${albumNombre ? `<span class="text-white ms-2">|</span> <span class="text-light ms-2">${albumNombre}</span>` : ""}
                                </p>
                            </div>
                            <div class="fs-4 fw-bold text-warning bg-black px-3 py-1 rounded-pill border border-secondary">
                                ★ ${valoracion}
                            </div>
                        </div>

                        <p class="mb-3 review-desc text-white-55 fst-italic">
                            "${descripcion}"
                        </p>

                        <div class="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center pt-3 border-top border-secondary gap-2">
                            <div class="d-flex align-items-center flex-wrap gap-2 small text-white">
                                <span><i class="fa-regular fa-calendar me-1"></i> Publicado el ${fechaFormateada}</span>
                                <span class="text-secondary">•</span>
                                <span>Por ${autorHtml}</span>
                                ${badgeTuReseña}
                            </div>
                            <a href="/reseña.html?id=${reseña.id}" class="btn btn-brand btn-sm px-4 py-2 fw-semibold shadow-sm">
                                Ver reseña completa <i class="fa-solid fa-arrow-right ms-1"></i>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join("");
}