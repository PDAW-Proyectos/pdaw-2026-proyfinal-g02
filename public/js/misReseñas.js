import { checkAuthStatus, inicializarAuth } from "./auth.js";
import { cargarFooter } from "./footer.js";
import { cargarNavbar } from "./navbar.js";

document.addEventListener("DOMContentLoaded", async () => {
    cargarFooter();
    const user = await checkAuthStatus();
    cargarNavbar(user, { mostrarBuscador: true });
    inicializarAuth();

    const contenedor = document.querySelector(".favorites-container");
    if (!contenedor) return;

    const params = new URLSearchParams(window.location.search);
    const idParam = params.get("id");

    // Si no viene ?id=... en la URL, usamos el usuario logueado
    const idObjetivo = idParam || user?.id;

    if (!idObjetivo) {
        contenedor.innerHTML = `
            <div class="text-center text-warning py-5">
                <h3>Debés iniciar sesión para ver tus reseñas.</h3>
            </div>`;
        return;
    }

    const esPropia = Boolean(user) && String(user.id) === String(idObjetivo);
    const esAdmin = user?.rol === "administrador";
    const mostrarBotonSeguir = !esPropia && !esAdmin;

    const tituloPagina = document.querySelector("h1");
    if (tituloPagina) {
        tituloPagina.textContent = esPropia ? "Mis reseñas" : "Reseñas del usuario";
    }

    await cargarResenasUsuario(idObjetivo, {
        user,
        esPropia,
        mostrarBotonSeguir,
        tituloPagina,
    });
});

async function cargarResenasUsuario(
    idUsuario,
    { user, esPropia, mostrarBotonSeguir, tituloPagina },
) {
    const contenedor = document.querySelector(".favorites-container");

    try {
        contenedor.innerHTML = `<p class="text-center text-secondary py-4">Cargando reseñas...</p>`;

        const respuesta = await fetch(`/api/resenas/usuario/${idUsuario}`);
        if (!respuesta.ok) throw new Error("No se pudieron cargar las reseñas.");

        const reseñas = await respuesta.json();

        const nombreUsuario =
            reseñas?.[0]?.nombreAutor ||
            reseñas?.[0]?.autor?.username ||
            reseñas?.[0]?.autor?.nombre ||
            (esPropia ? (user?.username || user?.nombre) : null) ||
            `Usuario #${idUsuario}`;

        const textoTitulo = esPropia ? "Mis reseñas" : `Reseñas de ${nombreUsuario}`;
        document.title = `${textoTitulo} - Beatácora`;

        if (tituloPagina) {
            renderizarCabeceraTitulo(tituloPagina, textoTitulo, {
                mostrarBotonSeguir,
                idUsuario,
                user,
            });
        }

        if (!reseñas || reseñas.length === 0) {
            contenedor.innerHTML = `
                <p class="text-center text-secondary py-4">
                    ${esPropia ? "Aún no creaste ninguna reseña." : `${nombreUsuario} aún no tiene reseñas publicadas.`}
                </p>`;
            return;
        }

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

            const nombreAutor = reseña.nombreAutor || nombreUsuario;
            const idAutor = reseña.idUsuario ?? idUsuario;
            const autorHtml =
                idAutor !== undefined && idAutor !== null
                    ? `<a href="/resenas.html?id=${idAutor}" class="text-light text-decoration-none fw-bold link-success">${nombreAutor}</a>`
                    : `<strong class="text-light">${nombreAutor}</strong>`;

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

    } catch (error) {
        console.error("Error:", error);
        contenedor.innerHTML = `
            <p class="text-center text-danger py-4">Ocurrió un error al cargar las reseñas.</p>`;
    }
}

function renderizarCabeceraTitulo(tituloEl, textoTitulo, { mostrarBotonSeguir, idUsuario, user }) {
    if (!mostrarBotonSeguir) {
        tituloEl.className = "text-center fw-bold mb-5";
        tituloEl.textContent = textoTitulo;
        return;
    }

    let siguiendo = Array.isArray(user?.seguidos)
        ? user.seguidos.some((segId) => String(segId) === String(idUsuario))
        : false;

    const claseSeguir = siguiendo ? "btn-success text-white" : "btn-outline-light";
    const textoSeguir = siguiendo ? "Siguiendo" : "Seguir";
    const iconoSeguir = siguiendo ? "fa-solid fa-check" : "fa-solid fa-user-plus";

    tituloEl.className = "d-flex flex-wrap justify-content-center align-items-center gap-3 fw-bold mb-5";
    tituloEl.innerHTML = `
        <span>${textoTitulo}</span>
        <button id="btnSeguirUsuario" class="btn ${claseSeguir} btn-sm py-2 px-3 rounded-pill" data-usuario-id="${idUsuario}">
            <i class="${iconoSeguir} me-1"></i> ${textoSeguir}
        </button>
    `;

    const btnSeguir = document.getElementById("btnSeguirUsuario");
    if (!btnSeguir) return;

    btnSeguir.addEventListener("click", async () => {
        if (!user) {
            mostrarAlerta("Debés iniciar sesión para seguir a otros usuarios.", "aviso");
            return;
        }

        try {
            const metodo = siguiendo ? "DELETE" : "POST";
            const response = await fetch(`/api/usuarios/${idUsuario}/seguir`, {
                method: metodo,
                headers: { "Content-Type": "application/json" },
            });

            if (!response.ok) {
                throw new Error("No se pudo actualizar el estado de seguimiento.");
            }

            siguiendo = !siguiendo;
            if (siguiendo) {
                btnSeguir.innerHTML = `<i class="fa-solid fa-check me-1"></i> Siguiendo`;
                btnSeguir.classList.remove("btn-outline-light");
                btnSeguir.classList.add("btn-success", "text-white");
            } else {
                btnSeguir.innerHTML = `<i class="fa-solid fa-user-plus me-1"></i> Seguir`;
                btnSeguir.classList.remove("btn-success", "text-white");
                btnSeguir.classList.add("btn-outline-light");
            }
        } catch (error) {
            console.error("Error al seguir/dejar de seguir:", error);
            mostrarAlerta("Ocurrió un error al procesar la acción.", "error");
        }
    });
}