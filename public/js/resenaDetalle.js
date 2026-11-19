import { checkAuthStatus, inicializarAuth } from "./auth.js";
import { inicializarModalReseña } from "./modalReseña.js";
import { cargarNavbar } from "./navbar.js";

document.addEventListener("DOMContentLoaded", async () => {
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

function renderizarDetalleReseña(reseña, contenedor, user) {
    // Formatear fecha
    const fechaFormateada = new Date(reseña.fechaPublicado).toLocaleDateString(
        "es-AR",
        {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        },
    );

    // Manejo de artistas
    const artistasStr = Array.isArray(reseña.cancion?.artistas)
        ? reseña.cancion.artistas.join(", ")
        : reseña.cancion?.artistas || "Artista desconocido";

    const imagenCancion = reseña.cancion?.imagen || "/img/default-album.jpg";
    const previewUrl = reseña.cancion?.previewUrl;

    // Autor y enlace a su perfil/reseñas
    const idAutor = reseña.autor?.id ?? reseña.idUsuario;
    const nombreAutor = reseña.autor?.nombre || reseña.nombreAutor || "Anónimo";
    const autorHtml =
        idAutor !== undefined && idAutor !== null
            ? `<a href="/resenas.html?id=${idAutor}" class="text-light text-decoration-none fw-bold link-success">${nombreAutor}</a>`
            : `<strong class="text-light">${nombreAutor}</strong>`;

    // Verificamos si el backend nos indicó que ya es favorita y si ya sigue al usuario
    const esFavoritaInicial = reseña.esFavorita || false;
    const siguiendoInicial = reseña.siguiendo || false;

    // Clases dinámicas según el estado inicial
    const claseFavorito = esFavoritaInicial
        ? "btn-warning text-dark"
        : "btn-outline-warning";
    const iconoFavorito = esFavoritaInicial ? "fa-solid" : "fa-regular";

    // Clases dinámicas para Seguir
    const claseSeguir = siguiendoInicial
        ? "btn-success text-white"
        : "btn-outline-light";
    const textoSeguir = siguiendoInicial ? "Siguiendo" : "Seguir";
    const iconoSeguir = siguiendoInicial
        ? "fa-solid fa-check"
        : "fa-solid fa-user-plus";

    // Verificamos roles y permisos
    const esSuPropiaReseña = user && idAutor && String(user.id) === String(idAutor);
    const esAdmin = user && user.rol === "administrador";

    // El administrador y el dueño pueden eliminar
    const puedeEliminar = esSuPropiaReseña || esAdmin;

    // Solo el dueño ve el botón de Editar (el admin solo modera/elimina)
    const accionesPropietarioHtml = esSuPropiaReseña ? `
        <button class="btn btn-outline-warning btn-sm py-1 px-3 rounded-pill" 
            data-bs-toggle="modal" 
            data-bs-target="#resenaModal"
            data-modo="editar"
            data-resena-id="${reseña.id}"
            data-valoracion="${reseña.valoracionPropia}"
            data-descripcion="${reseña.descripcion}"
            data-titulo="${reseña.cancion?.titulo || ""}"
            data-artistas="${artistasStr}"
            data-imagen="${reseña.cancion?.imagen || ""}"
            data-preview="${previewUrl || ""}">
            <i class="fa-solid fa-pen me-1"></i> Editar
        </button>
    ` : "";

    // El botón de eliminar se muestra si es dueño O si es admin
    const botonEliminarHtml = puedeEliminar ? `
        <button id="btnEliminarResena" class="btn btn-outline-danger btn-sm py-1 px-3 rounded-pill">
            <i class="fa-solid fa-trash-can me-1"></i> Eliminar
        </button>
    ` : "";

    // Badge de "Tu reseña" solo si es tuya, "Modo Administrador" si sos el admin
    const badgeDerechaHtml = esSuPropiaReseña ? `
        <span class="badge bg-success bg-opacity-25 text-success border border-success px-3 py-2 rounded-pill">
            <i class="fa-solid fa-user-check me-1"></i> Tu reseña
        </span>
    ` : (esAdmin ? `
        <span class="badge bg-danger bg-opacity-25 text-danger border border-danger px-3 py-2 rounded-pill">
            <i class="fa-solid fa-shield-halved me-1"></i> Modo Administrador
        </span>
    ` : "");

    // Botón de seguir: No se muestra si es su propia reseña O si es admin
    const botonSeguirHtml = (esSuPropiaReseña || esAdmin) ? "" : `
        <button id="btnSeguir" class="btn ${claseSeguir} btn-sm ms-2 py-1 px-3 rounded-pill" data-usuario-id="${idAutor}">
            <i class="${iconoSeguir} me-1"></i> ${textoSeguir}
        </button>
    `;

    // Botón de reseñar: No se muestra si es su propia reseña O si es admin
    const botonReseñarHtml = (!esSuPropiaReseña && !esAdmin && user) ? `
        <button class="btn btn-outline-success btn-sm py-1 px-3 rounded-pill" 
            data-bs-toggle="modal" 
            data-bs-target="#resenaModal"
            data-id="${reseña.cancion?.id || ""}"
            data-titulo="${reseña.cancion?.titulo || ""}"
            data-artistas="${artistasStr}"
            data-imagen="${reseña.cancion?.imagen || ""}"
            data-preview="${reseña.cancion?.previewUrl || ""}"
            data-album="${reseña.cancion?.album || ""}">
            <i class="fa-solid fa-pen-nib me-1"></i> Reseñar esta canción
        </button>
    ` : "";

    // Botón de favoritos
    const deshabilitarFavorito = esSuPropiaReseña || esAdmin;
    const claseBotonFav = deshabilitarFavorito
        ? "btn-outline-secondary text-muted opacity-50"
        : claseFavorito;
    const atributoDisabled = deshabilitarFavorito ? "disabled aria-disabled='true'" : "";
    const tooltipPropio = esSuPropiaReseña ? "No podés agregar tu propia reseña a favoritos" : (esAdmin ? "Los administradores no usan favoritos" : "");
    const botonFavoritoHtml = `
        <button id="btnFavorito" class="btn ${claseBotonFav} btn-sm py-1 px-3 rounded-pill" ${atributoDisabled} title="${tooltipPropio}">
            <i class="${iconoFavorito} fa-star me-1"></i> Favorita (<span id="contadorFavoritos">${reseña.cantidadFavoritos || 0}</span>)
        </button>
    `;

    contenedor.innerHTML = `
        <div class="card bg-dark border border-secondary rounded-4 shadow-lg text-light p-4 p-md-5">
            <!-- Cabecera con Canción, Artista y Badge arriba a la derecha -->
            <div class="d-flex flex-column flex-md-row justify-content-between align-items-start gap-4 mb-4">
                <div class="d-flex align-items-center gap-4">
                    <img src="${imagenCancion}" alt="Portada del álbum" class="img-fluid rounded-4 shadow" style="width: 130px; height: 130px; object-fit: cover;">
                    <div>
                        <h1 class="fw-bold mb-1 display-6 text-white">${reseña.cancion?.titulo || "Canción sin título"}</h1>
                        <p class="text-secondary fs-5 mb-2"><i class="fa-solid fa-microphone me-2 text-success"></i>${artistasStr}</p>
                        <p class="text-muted small mb-0"><i class="fa-solid fa-compact-disc me-2"></i>Álbum: ${reseña.cancion?.album || "Desconocido"}</p>
                    </div>
                </div>
                <div>
                    ${badgeDerechaHtml}
                </div>
            </div>

            <!-- Reproductor de Audio (Deezer Preview) -->
            ${
                previewUrl
                    ? `
                <div class="mb-4 p-3 bg-black rounded-3 border border-secondary">
                    <p class="text-secondary small mb-2"><i class="fa-solid fa-volume-high me-1 text-warning"></i> Escuchá un fragmento:</p>
                    <audio controls class="w-100" style="height: 40px;">
                        <source src="${previewUrl}" type="audio/mpeg">
                        Tu navegador no soporta el elemento de audio.
                    </audio>
                </div>
            `
                    : ""
            }

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
                    ${accionesPropietarioHtml}
                    ${botonEliminarHtml}
                    ${botonReseñarHtml}
                    ${botonFavoritoHtml}
                </div>
            </div>
        </div>
    `;

    configurarAccionesDetalle(
        reseña.id,
        idAutor,
        user,
        esFavoritaInicial,
        siguiendoInicial,
        reseña.cancion,
    );
}

function configurarAccionesDetalle(
    reseñaId,
    autorId,
    user,
    esFavoritaInicial = false,
    siguiendoInicial = false,
    cancion = null,
) {
    // 1. Lógica del botón Seguir
    const btnSeguir = document.getElementById("btnSeguir");
    let siguiendo = siguiendoInicial;

    if (btnSeguir && autorId) {
        btnSeguir.addEventListener("click", async () => {
            if (!user) {
                alert("Debés iniciar sesión para seguir a otros usuarios.");
                return;
            }

            try {
                const metodo = siguiendo ? "DELETE" : "POST";
                const response = await fetch(
                    `/api/usuarios/${autorId}/seguir`,
                    {
                        method: metodo,
                        headers: { "Content-Type": "application/json" },
                    },
                );

                if (!response.ok)
                    throw new Error(
                        "No se pudo actualizar el estado de seguimiento.",
                    );

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
                alert("Ocurrió un error al procesar la acción.");
            }
        });
    }

    // 2. Lógica del botón Favoritas
    const btnFavorito = document.getElementById("btnFavorito");
    let esFavorita = esFavoritaInicial;

    if (btnFavorito) {
        btnFavorito.addEventListener("click", async () => {
            if (!user) {
                alert(
                    "Debés iniciar sesión para agregar reseñas a tus favoritas.",
                );
                return;
            }

            const esSuPropiaReseña = autorId && String(user.id) === String(autorId);
            if (esSuPropiaReseña) {
                alert("No podés agregar tu propia reseña a favoritos.");
                return;
            }

            if (user && user.rol === "administrador") {
                alert("Los administradores no pueden agregar reseñas a favoritos.");
                return;
            }

            try {
                const metodo = esFavorita ? "DELETE" : "POST";
                const response = await fetch(
                    `/api/usuarios/favoritas/${reseñaId}`,
                    {
                        method: metodo,
                        headers: { "Content-Type": "application/json" },
                    },
                );

                if (!response.ok)
                    throw new Error("No se pudo actualizar las favoritas.");

                esFavorita = !esFavorita;
                const contador = document.getElementById("contadorFavoritos");
                let actual = parseInt(contador.textContent);

                const nuevoTotal = esFavorita
                    ? actual + 1
                    : Math.max(0, actual - 1);
                contador.textContent = nuevoTotal;

                if (esFavorita) {
                    btnFavorito.innerHTML = `<i class="fa-solid fa-star me-1"></i> Favorita (<span id="contadorFavoritos">${nuevoTotal}</span>)`;
                    btnFavorito.classList.remove("btn-outline-warning");
                    btnFavorito.classList.add("btn-warning", "text-dark");
                } else {
                    btnFavorito.innerHTML = `<i class="fa-regular fa-star me-1"></i> Favorita (<span id="contadorFavoritos">${nuevoTotal}</span>)`;
                    btnFavorito.classList.remove("btn-warning", "text-dark");
                    btnFavorito.classList.add("btn-outline-warning");
                }
            } catch (error) {
                console.error("Error al modificar favoritas:", error);
                alert("Ocurrió un error al actualizar tus favoritas.");
            }
        });
    }

    // 3. Lógica del botón "Reseñar esta canción"
    const btnReseñar = document.getElementById("btnReseñarCancion");
    if (btnReseñar && cancion) {
        btnReseñar.addEventListener("click", () => {
            const modalElement = document.getElementById("modalCrearReseña");
            if (modalElement) {
                const inputCancionId =
                    document.getElementById("cancionIdInput");
                if (inputCancionId) inputCancionId.value = cancion.id;

                const modal = new bootstrap.Modal(modalElement);
                modal.show();
            } else {
                console.error(
                    "No se encontró el modal de creación de reseñas en esta vista.",
                );
            }
        });
    }

    // 4. Lógica del botón Eliminar Reseña (Solo para el propietario o admin)
    const btnEliminar = document.getElementById("btnEliminarResena");
    if (btnEliminar) {
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
                    throw new Error(
                        data.error || "No se pudo eliminar la reseña.",
                    );
                }

                alert("Reseña eliminada con éxito.");
                window.location.href = "/explorar.html";
            } catch (error) {
                console.error("Error al eliminar la reseña:", error);
                alert(error.message);
            }
        });
    }
}