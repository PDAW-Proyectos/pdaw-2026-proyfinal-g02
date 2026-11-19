import { checkAuthStatus, inicializarAuth } from "./auth.js";
import { cargarFooter } from "./footer.js";
import { inicializarModalReseña } from "./modalReseña.js";
import { cargarNavbar } from "./navbar.js";

document.addEventListener("DOMContentLoaded", async () => {
    cargarFooter();
    // 1. Inicializamos autenticación y navbar
    const user = await checkAuthStatus();
    cargarNavbar(user, { mostrarBuscador: true });
    inicializarAuth();
    inicializarModalReseña();

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
        renderizarDetalleReseña(reseña, contenedor, user);
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

function _formatearFechaDetalle(fechaPublicado) {
    return new Date(fechaPublicado).toLocaleDateString("es-AR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

function _obtenerArtistasDetalle(cancion) {
    if (Array.isArray(cancion?.artistas)) return cancion.artistas.join(", ");
    return cancion?.artistas || "Artista desconocido";
}

function _obtenerAutorDetalle(reseña) {
    const idAutor = reseña.autor?.id ?? reseña.idUsuario;
    const nombreAutor = reseña.autor?.nombre || reseña.nombreAutor || "Anónimo";
    const autorHtml = (idAutor !== undefined && idAutor !== null)
        ? `<a href="/resenas.html?id=${idAutor}" class="text-light text-decoration-none fw-bold link-success">${nombreAutor}</a>`
        : `<strong class="text-light">${nombreAutor}</strong>`;

    return { idAutor, autorHtml };
}

function _obtenerPermisosDetalle(user, idAutor) {
    const esSuPropiaReseña = Boolean(user && idAutor && String(user.id) === String(idAutor));
    const esAdmin = Boolean(user && user.rol === "administrador");
    return {
        esSuPropiaReseña,
        esAdmin,
        puedeEliminar: esSuPropiaReseña || esAdmin,
    };
}

function _construirBadgeDerecha(esSuPropiaReseña, esAdmin) {
    if (esSuPropiaReseña) {
        return `
            <span class="badge bg-success bg-opacity-25 text-success border border-success px-3 py-2 rounded-pill">
                <i class="fa-solid fa-user-check me-1"></i> Tu reseña
            </span>
        `;
    }
    if (esAdmin) {
        return `
            <span class="badge bg-danger bg-opacity-25 text-danger border border-danger px-3 py-2 rounded-pill">
                <i class="fa-solid fa-shield-halved me-1"></i> Modo Administrador
            </span>
        `;
    }
    return "";
}

function _construirBotonSeguirHtml(idAutor, siguiendoInicial, ocultar) {
    if (ocultar) return "";

    const claseSeguir = siguiendoInicial ? "btn-success text-white" : "btn-outline-light";
    const textoSeguir = siguiendoInicial ? "Siguiendo" : "Seguir";
    const iconoSeguir = siguiendoInicial ? "fa-solid fa-check" : "fa-solid fa-user-plus";

    return `
        <button id="btnSeguir" class="btn ${claseSeguir} btn-sm ms-2 py-1 px-3 rounded-pill" data-usuario-id="${idAutor}">
            <i class="${iconoSeguir} me-1"></i> ${textoSeguir}
        </button>
    `;
}

function _construirBotonResenarHtml(reseña, artistasStr, permisos, user) {
    if (permisos.esSuPropiaReseña || permisos.esAdmin || !user) return "";

    const cancion = reseña.cancion || {};
    return `
        <button class="btn btn-outline-success btn-sm py-1 px-3 rounded-pill" 
            data-bs-toggle="modal" 
            data-bs-target="#resenaModal"
            data-id="${cancion.id || ""}"
            data-titulo="${cancion.titulo || ""}"
            data-artistas="${artistasStr}"
            data-imagen="${cancion.imagen || ""}"
            data-preview="${cancion.previewUrl || ""}"
            data-album="${cancion.album || ""}">
            <i class="fa-solid fa-pen-nib me-1"></i> Reseñar esta canción
        </button>
    `;
}

function _construirBotonFavoritoHtml(reseña, esFavoritaInicial, permisos) {
    const deshabilitar = permisos.esSuPropiaReseña || permisos.esAdmin;
    const claseInicial = esFavoritaInicial ? "btn-warning text-dark" : "btn-outline-warning";
    const claseBotonFav = deshabilitar ? "btn-outline-secondary text-muted opacity-50" : claseInicial;
    const iconoFavorito = esFavoritaInicial ? "fa-solid" : "fa-regular";
    const atributoDisabled = deshabilitar ? "disabled aria-disabled='true'" : "";
    const tooltipPropio = permisos.esSuPropiaReseña
        ? "No podés agregar tu propia reseña a favoritos"
        : (permisos.esAdmin ? "Los administradores no usan favoritos" : "");

    return `
        <button id="btnFavorito" class="btn ${claseBotonFav} btn-sm py-1 px-3 rounded-pill" ${atributoDisabled} title="${tooltipPropio}">
            <i class="${iconoFavorito} fa-star me-1"></i> Favorita (<span id="contadorFavoritos">${reseña.cantidadFavoritos || 0}</span>)
        </button>
    `;
}

function _construirAccionesInferiores(reseña, artistasStr, permisos, user) {
    const cancion = reseña.cancion || {};
    const accionesPropietarioHtml = permisos.esSuPropiaReseña ? `
        <button class="btn btn-outline-warning btn-sm py-1 px-3 rounded-pill" 
            data-bs-toggle="modal" 
            data-bs-target="#resenaModal"
            data-modo="editar"
            data-resena-id="${reseña.id}"
            data-valoracion="${reseña.valoracionPropia}"
            data-descripcion="${reseña.descripcion}"
            data-titulo="${cancion.titulo || ""}"
            data-artistas="${artistasStr}"
            data-imagen="${cancion.imagen || ""}"
            data-preview="${cancion.previewUrl || ""}">
            <i class="fa-solid fa-pen me-1"></i> Editar
        </button>
    ` : "";

    const botonEliminarHtml = permisos.puedeEliminar ? `
        <button id="btnEliminarResena" class="btn btn-outline-danger btn-sm py-1 px-3 rounded-pill">
            <i class="fa-solid fa-trash-can me-1"></i> Eliminar
        </button>
    ` : "";

    const botonReseñarHtml = _construirBotonResenarHtml(reseña, artistasStr, permisos, user);
    const botonFavoritoHtml = _construirBotonFavoritoHtml(reseña, Boolean(reseña.esFavorita), permisos);

    return `${accionesPropietarioHtml}${botonEliminarHtml}${botonReseñarHtml}${botonFavoritoHtml}`;
}

function _construirAudioPreviewHtml(previewUrl) {
    if (!previewUrl) return "";
    return `
        <div class="mb-4 p-3 bg-black rounded-3 border border-secondary">
            <p class="text-secondary small mb-2"><i class="fa-solid fa-volume-high me-1 text-warning"></i> Escuchá un fragmento:</p>
            <audio controls class="w-100" style="height: 40px;">
                <source src="${previewUrl}" type="audio/mpeg">
                Tu navegador no soporta el elemento de audio.
            </audio>
        </div>
    `;
}

function renderizarDetalleReseña(reseña, contenedor, user) {
    const cancion = reseña.cancion || {};
    const fechaFormateada = _formatearFechaDetalle(reseña.fechaPublicado);
    const artistasStr = _obtenerArtistasDetalle(cancion);
    const imagenCancion = cancion.imagen || "/img/default-album.jpg";
    const { idAutor, autorHtml } = _obtenerAutorDetalle(reseña);
    const permisos = _obtenerPermisosDetalle(user, idAutor);
    const esFavoritaInicial = Boolean(reseña.esFavorita);
    const siguiendoInicial = Boolean(reseña.siguiendo);

    const badgeDerechaHtml = _construirBadgeDerecha(permisos.esSuPropiaReseña, permisos.esAdmin);
    const botonSeguirHtml = _construirBotonSeguirHtml(
        idAutor,
        siguiendoInicial,
        permisos.esSuPropiaReseña || permisos.esAdmin,
    );
    const accionesInferioresHtml = _construirAccionesInferiores(reseña, artistasStr, permisos, user);
    const audioPreviewHtml = _construirAudioPreviewHtml(cancion.previewUrl);

    contenedor.innerHTML = `
        <div class="card bg-dark border border-secondary rounded-4 shadow-lg text-light p-4 p-md-5">
            <!-- Cabecera con Canción, Artista y Badge arriba a la derecha -->
            <div class="d-flex flex-column flex-md-row justify-content-between align-items-start gap-4 mb-4">
                <div class="d-flex align-items-center gap-4">
                    <img src="${imagenCancion}" alt="Portada del álbum" class="img-fluid rounded-4 shadow" style="width: 130px; height: 130px; object-fit: cover;">
                    <div>
                        <h1 class="fw-bold mb-1 display-6 text-white">${cancion.titulo || "Canción sin título"}</h1>
                        <p class="text-secondary fs-5 mb-2"><i class="fa-solid fa-microphone me-2 text-success"></i>${artistasStr}</p>
                        <p class="text-muted small mb-0"><i class="fa-solid fa-compact-disc me-2"></i>Álbum: ${cancion.album || "Desconocido"}</p>
                    </div>
                </div>
                <div>
                    ${badgeDerechaHtml}
                </div>
            </div>

            ${audioPreviewHtml}

            <!-- Valoración y Descripción / Opinión -->
            <div class="mb-4">
                <div class="d-flex align-items-center gap-2 mb-3">
                    <div class="fs-4 fw-bold text-warning bg-black px-3 py-1 rounded-pill border border-secondary">
                        ★ ${reseña.valoracionPropia}
                    </div>
                    <span class="text-secondary small">Valoración personal</span>
                </div>

                <h5 class="text-light fw-semibold mb-2">Opinión de la bitácora:</h5>
                <div class="p-4 bg-black bg-opacity-50 rounded-3 border border-secondary text-white-50 fst-italic fs-5">
                    "${reseña.descripcion}"
                </div>
            </div>

            <!-- Metadatos, Autor y Botones de Acción Inferiores -->
            <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center pt-3 border-top border-secondary text-muted small gap-3">
                <div class="d-flex align-items-center flex-wrap gap-2">
                    <span><i class="fa-regular fa-calendar me-1"></i> ${fechaFormateada}</span>
                    <span>•</span>
                    <span>Por ${autorHtml}</span>
                    ${botonSeguirHtml}
                </div>
                <div class="d-flex align-items-center flex-wrap gap-2 justify-content-md-end">
                    ${accionesInferioresHtml}
                </div>
            </div>
        </div>
    `;

    configurarAccionesDetalle(reseña.id, idAutor, user, {
        esFavoritaInicial,
        siguiendoInicial,
        cancion: reseña.cancion,
    });
}

function _configurarBotonSeguir(autorId, user, siguiendoInicial) {
    const btnSeguir = document.getElementById("btnSeguir");
    if (!btnSeguir || !autorId) return;

    let siguiendo = siguiendoInicial;
    btnSeguir.addEventListener("click", async () => {
        if (!user) {
            mostrarAlerta("Debés iniciar sesión para seguir a otros usuarios.", "aviso");
            return;
        }

        try {
            const metodo = siguiendo ? "DELETE" : "POST";
            const response = await fetch(`/api/usuarios/${autorId}/seguir`, {
                method: metodo,
                headers: { "Content-Type": "application/json" },
            });

            if (!response.ok) {
                throw new Error("No se pudo actualizar el estado de seguimiento.");
            }

            siguiendo = !siguiendo;
            if (siguiendo) {
                btnSeguir.innerHTML = `<i class="fa-solid fa-check me-1 text-success"></i> Siguiendo`;
                btnSeguir.classList.remove("btn-outline-light");
                btnSeguir.classList.add("btn-success", "text-white");
            } else {
                btnSeguir.innerHTML = `<i class="fa-solid fa-user-plus me-1 text-success"></i> Seguir`;
                btnSeguir.classList.remove("btn-success", "text-white");
                btnSeguir.classList.add("btn-outline-light");
            }
        } catch (error) {
            console.error("Error al seguir/dejar de seguir:", error);
            mostrarAlerta("Ocurrió un error al procesar la acción.", "error");
        }
    });
}

function _validarClickFavorito(user, autorId) {
    if (!user) {
        mostrarAlerta("Debés iniciar sesión para agregar reseñas a tus favoritas.", "aviso");
        return false;
    }
    if (autorId && String(user.id) === String(autorId)) {
        mostrarAlerta("No podés agregar tu propia reseña a favoritos.", "aviso");
        return false;
    }
    if (user.rol === "administrador") {
        mostrarAlerta("Los administradores no pueden agregar reseñas a favoritos.", "aviso");
        return false;
    }
    return true;
}

function _actualizarUIFavorito(btnFavorito, esFavorita, nuevoTotal) {
    const contador = document.getElementById("contadorFavoritos");
    if (contador) contador.textContent = nuevoTotal;

    const icono = esFavorita ? "fa-solid" : "fa-regular";
    btnFavorito.innerHTML = `<i class="${icono} fa-star me-1"></i> Favorita (<span id="contadorFavoritos">${nuevoTotal}</span>)`;
    btnFavorito.classList.toggle("btn-warning", esFavorita);
    btnFavorito.classList.toggle("text-dark", esFavorita);
    btnFavorito.classList.toggle("btn-outline-warning", !esFavorita);
}

function _configurarBotonFavorito(reseñaId, autorId, user, esFavoritaInicial) {
    const btnFavorito = document.getElementById("btnFavorito");
    if (!btnFavorito) return;

    let esFavorita = esFavoritaInicial;
    btnFavorito.addEventListener("click", async () => {
        if (!_validarClickFavorito(user, autorId)) return;

        try {
            const metodo = esFavorita ? "DELETE" : "POST";
            const response = await fetch(`/api/usuarios/favoritas/${reseñaId}`, {
                method: metodo,
                headers: { "Content-Type": "application/json" },
            });

            if (!response.ok) throw new Error("No se pudo actualizar las favoritas.");

            esFavorita = !esFavorita;
            const actual = parseInt(document.getElementById("contadorFavoritos")?.textContent || "0", 10);
            const nuevoTotal = esFavorita ? actual + 1 : Math.max(0, actual - 1);
            _actualizarUIFavorito(btnFavorito, esFavorita, nuevoTotal);
        } catch (error) {
            console.error("Error al modificar favoritas:", error);
            mostrarAlerta("Ocurrió un error al actualizar tus favoritas.", "error");
        }
    });
}

function _configurarBotonResenar(cancion) {
    const btnReseñar = document.getElementById("btnReseñarCancion");
    if (!btnReseñar || !cancion) return;

    btnReseñar.addEventListener("click", () => {
        const modalElement = document.getElementById("modalCrearReseña");
        if (!modalElement) {
            console.error("No se encontró el modal de creación de reseñas en esta vista.");
            return;
        }

        const inputCancionId = document.getElementById("cancionIdInput");
        if (inputCancionId) inputCancionId.value = cancion.id;

        const modal = new bootstrap.Modal(modalElement);
        modal.show();
    });
}

function _configurarBotonEliminar(reseñaId) {
    const btnEliminar = document.getElementById("btnEliminarResena");
    if (!btnEliminar) return;

    btnEliminar.addEventListener("click", async () => {
        const confirmado = confirm(
            "¿Estás seguro de que querés eliminar esta reseña? Esta acción no se puede deshacer.",
        );
        if (!confirmado) return;

        try {
            const response = await fetch(`/api/resenas/${reseñaId}`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
            });

            if (!response.ok) {
                const data = await response.json().catch(() => ({}));
                throw new Error(data.error || "No se pudo eliminar la reseña.");
            }

            mostrarAlerta("Reseña eliminada con éxito.", "exito");
            window.location.href = "/explorar.html";
        } catch (error) {
            console.error("Error al eliminar la reseña:", error);
            mostrarAlerta(error.message, "error");
        }
    });
}

function configurarAccionesDetalle(reseñaId, autorId, user, opciones = {}) {
    const {
        esFavoritaInicial = false,
        siguiendoInicial = false,
        cancion = null,
    } = opciones;

    _configurarBotonSeguir(autorId, user, siguiendoInicial);
    _configurarBotonFavorito(reseñaId, autorId, user, esFavoritaInicial);
    _configurarBotonResenar(cancion);
    _configurarBotonEliminar(reseñaId);
}