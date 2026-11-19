import { logoutUser } from "./auth.js";

function _itemNav(rutaActual, archivo, href, texto) {
    const esActivo =
        archivo === "index.html"
            ? rutaActual.endsWith("index.html") || rutaActual === "/"
            : rutaActual.endsWith(archivo);
    const claseActiva = esActivo ? "active fw-bold" : "";

    return `
        <li class="nav-item">
            <a class="nav-link text-light ${claseActiva}" href="${href}">${texto}</a>
        </li>
    `;
}

function _obtenerLinksNavbar(user, rutaActual) {
    const base =
        _itemNav(rutaActual, "index.html", "/index.html", "Inicio") +
        _itemNav(rutaActual, "explorar.html", "/explorar.html", "Explorar");

    if (!user) return base;

    if (user.rol === "administrador") {
        return (
            _itemNav(rutaActual, "index.html", "/index.html", "Inicio") +
            _itemNav(rutaActual, "panelAdmin.html", "/panelAdmin.html", "Panel Admin") +
            _itemNav(rutaActual, "miPerfil.html", "/miPerfil.html", "Perfil")
        );
    }

    return (
        base +
        _itemNav(rutaActual, "resenas.html", "/resenas.html", "Reseñas") +
        _itemNav(rutaActual, "favoritas.html", "/favoritas.html", "Favoritas") +
        _itemNav(rutaActual, "miPerfil.html", "/miPerfil.html", "Perfil")
    );
}

function _obtenerBuscadorHTML(mostrarBuscador) {
    if (!mostrarBuscador) return "";

    return `
        <div class="search-container">
            <input type="text" id="searchInput" placeholder="Buscar canciones..." class="form-control search-input" />
        </div>
    `;
}

function _configurarBuscadorNavbar(header) {
    const searchInput = header.querySelector("#searchInput");
    if (!searchInput) return;

    searchInput.addEventListener("keydown", (e) => {
        if (e.key !== "Enter") return;
        e.preventDefault();
        const termino = searchInput.value.trim();
        if (termino) {
            window.location.href = `/explorar.html?q=${encodeURIComponent(termino)}`;
        }
    });
}

function _renderizarAccionesAuth(header, user) {
    const contenedorAuth = header.querySelector(".auth-actions");
    if (!contenedorAuth) return;

    if (!user) {
        contenedorAuth.innerHTML = `
            <button class="btn btn-link text-light text-decoration-none" data-bs-toggle="modal" data-bs-target="#loginModal">
                Iniciar sesión <i class="fa-regular fa-user ms-1"></i>
            </button>
            <button class="btn btn-brand btn-sm px-3" data-bs-toggle="modal" data-bs-target="#registerModal">
                Registrarse
            </button>
        `;
        return;
    }

    contenedorAuth.innerHTML = `
        <span class="text-light small">Hola, <strong id="usernameDisplay"></strong></span>
        <button id="logoutBtn" class="btn btn-outline-danger btn-sm">Salir</button>
    `;
    document.getElementById("usernameDisplay").textContent = user.username;
    document.getElementById("logoutBtn").addEventListener("click", logoutUser);
}

export function cargarNavbar(user = null, opciones = {}) {
    const header = document.getElementById("main-navbar");
    if (!header) return;

    const rutaActual = window.location.pathname;
    const mostrarBuscador = opciones.mostrarBuscador ?? true;
    const linksHTML = _obtenerLinksNavbar(user, rutaActual);
    const buscadorHTML = _obtenerBuscadorHTML(mostrarBuscador);

    header.className = "navbar navbar-custom navbar-expand-lg px-4 py-3";
    header.innerHTML = `
        <div class="container">
            <a class="navbar-brand text-light fw-bold fs-3" href="/index.html">Beatácora</a>

            <button class="navbar-toggler border-secondary" type="button" data-bs-toggle="collapse" data-bs-target="#navbarContent">
                <span class="navbar-toggler-icon"></span>
            </button>

            <div class="collapse navbar-collapse" id="navbarContent">
                <!-- Links a la izquierda -->
                <ul class="navbar-nav me-auto mb-2 mb-lg-0 ms-lg-3 gap-2">
                    ${linksHTML}
                </ul>

                <!-- Bloque derecho: Buscador y Auth juntos -->
                <div class="d-flex align-items-center gap-3 ms-lg-auto my-2 my-lg-0">
                    ${buscadorHTML}

                    <!-- Zona de sesión -->
                    <div class="auth-actions d-flex align-items-center gap-2"></div>
                </div>
            </div>
        </div>
    `;

    _configurarBuscadorNavbar(header);
    _renderizarAccionesAuth(header, user);
}