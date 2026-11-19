import { checkAuthStatus, inicializarAuth } from "./auth.js";
import { cargarFooter } from "./footer.js";
import { cargarNavbar } from "./navbar.js";

document.addEventListener("DOMContentLoaded", async () => {
    cargarFooter();
    const user = await checkAuthStatus();
    let mostrar = true;
    if (user && user.rol === "administrador") {
        mostrar = false;
    }
    cargarNavbar(user, { mostrarBuscador: mostrar });
    inicializarAuth();

    cargarPortadaTopGlobales();
    cargarUltimasReseñas(user);
});

async function cargarPortadaTopGlobales() {
    const contenedor = document.getElementById("portadas-container");
    if (!contenedor) return;

    try {
        const respuesta = await fetch("/api/deezer/topGlobal");
        if (!respuesta.ok) throw new Error("No se pudo obtener el top global");

        const canciones = await respuesta.json();
        const cancionesSeleccionadas = canciones.slice(0, 6);

        contenedor.innerHTML = cancionesSeleccionadas
            .map((cancion) => {
                const titulo = cancion.titulo || "";
                const href = `/explorar.html?q=${encodeURIComponent(titulo)}`;

                return `
                    <a href="${href}" class="d-inline-block text-decoration-none" title="Explorar ${titulo}">
                        <img
                            src="${cancion.imagen}"
                            alt="${titulo}"
                            class="poster-item"
                        >
                    </a>
                `;
            })
            .join("");
    } catch (error) {
        console.error("Error al cargar las portadas dinámicas", error);
    }
}

function _obtenerArtistasIndex(cancion) {
    if (Array.isArray(cancion?.artistas)) return cancion.artistas.join(", ");
    return cancion?.artistas || "Artista desconocido";
}

function _obtenerAutorHtmlIndex(reseña) {
    const nombreAutor = reseña.nombreAutor || "Anónimo";
    const id = reseña.idUsuario;
    if (id === undefined || id === null) {
        return `<strong class="text-light">${nombreAutor}</strong>`;
    }
    return `<a href="/resenas.html?id=${id}" class="text-light text-decoration-none fw-bold link-success">${nombreAutor}</a>`;
}

function _obtenerBadgePropiaIndex(reseña, user) {
    const id = reseña.idUsuario;
    const esPropia = Boolean(user) && id !== undefined && id !== null && String(user.id) === String(id);
    if (!esPropia) return "";

    return `
        <span class="badge bg-success bg-opacity-25 text-success border border-success px-2 py-1 rounded-pill">
            <i class="fa-solid fa-user-check me-1"></i> Tu reseña
        </span>
    `;
}

function _crearElementoResenaIndex(reseña, user) {
    const colDiv = document.createElement("div");
    colDiv.className = "col-12 mb-4";

    const fechaFormateada = new Date(reseña.fechaPublicado).toLocaleDateString("es-AR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });

    const cancion = reseña.cancion || {};
    const artistasStr = _obtenerArtistasIndex(cancion);
    const imagenCancion = cancion.imagen || "/img/default-album.jpg";
    const albumHtml = cancion.album
        ? `<span class="text-white ms-2">|</span> <span class="text-light ms-2">Álbum: ${cancion.album}</span>`
        : "";
    const autorHtml = _obtenerAutorHtmlIndex(reseña);
    const badgeTuReseña = _obtenerBadgePropiaIndex(reseña, user);

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
                            <h4 class="card-title mb-1 fw-bold text-light">${cancion.titulo || "Canción sin título"}</h4>
                            <p class="text-secondary mb-2 fs-6"><i class="fa-solid fa-microphone-lines me-2 text-success"></i>${artistasStr}${albumHtml}</p>
                        </div>
                        <div class="fs-4 fw-bold text-warning bg-black px-3 py-1 rounded-pill border border-secondary">
                            ★ ${reseña.valoracionPropia}
                        </div>
                    </div>

                    <p class="mb-3 review-desc text-white-55 fst-italic">
                        "${reseña.descripcion}"
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

    return colDiv;
}

async function cargarUltimasReseñas(user) {
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
            container.appendChild(_crearElementoResenaIndex(reseña, user));
        });
    } catch (error) {
        console.error("Error:", error);
        container.innerHTML = `<p class="text-danger text-center py-4">Ocurrió un error al cargar las reseñas.</p>`;
    }
}