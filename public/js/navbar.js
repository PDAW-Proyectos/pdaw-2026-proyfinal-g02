import { logoutUser } from "./auth.js";

export function cargarNavbar(user = null, opciones = {}) {
    const header = document.getElementById("main-navbar");
    if (!header) return;

    const rutaActual = window.location.pathname;
    const mostrarBuscador = opciones.mostrarBuscador ?? true;


    // let linksHTML = ``;
    let linksHTML = `
        <li class="nav-item">
            <a class="nav-link text-light ${rutaActual.endsWith('index.html') || rutaActual === '/' ? 'active fw-bold' : ''}" href="/index.html">Inicio</a>
        </li>
        <li class="nav-item">
            <a class="nav-link text-light ${rutaActual.endsWith('explorar.html') ? 'active fw-bold' : ''}" href="/explorar.html">Explorar</a>
        </li>
    `;

    if (user) {
        if (user.rol === "administrador") {
            linksHTML += `
                <li class="nav-item">
                    <a class="nav-link text-light ${rutaActual.endsWith('panelAdmin.html') ? 'active fw-bold' : ''}" href="/panelAdmin.html">Panel Admin</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link text-light ${rutaActual.endsWith('perfil.html') ? 'active fw-bold' : ''}" href="/perfil.html">Perfil</a>
                </li>
            `;
        } else {
            linksHTML += `
                <li class="nav-item">
                    <a class="nav-link text-light ${rutaActual.endsWith('resenas.html') ? 'active fw-bold' : ''}" href="/resenas.html">Mis Reseñas</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link text-light ${rutaActual.endsWith('favoritas.html') ? 'active fw-bold' : ''}" href="/favoritas.html">Favoritas</a>
                </li>
                <li class="nav-item">
                <a class="nav-link text-light ${rutaActual.endsWith('perfil.html') ? 'active fw-bold' : ''}" href="/perfil.html">Perfil</a>
                </li>
            `;
        }
    }

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
                    ${mostrarBuscador ? `
                        <div class="search-container">
                            <input type="text" id="searchInput" placeholder="Buscar canciones..." class="form-control search-input" />
                        </div>
                    ` : ''}
                    
                    <!-- Zona de sesión -->
                    <div class="auth-actions d-flex align-items-center gap-2"></div>
                </div>
            </div>
        </div>
    `;

    const searchInput = header.querySelector("#searchInput");

    if (searchInput) {
        searchInput.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                e.preventDefault();
                const termino = searchInput.value.trim();
                if (termino !== "") {
                    window.location.href = `/explorar.html?q=${encodeURIComponent(termino)}`;
                }
            }
        });
    }

    const contenedorAuth = header.querySelector(".auth-actions");

    if (user) {
        contenedorAuth.innerHTML = `
            <span class="text-light small">Hola, <strong id="usernameDisplay"></strong></span>
            <button id="logoutBtn" class="btn btn-outline-danger btn-sm">Salir</button>
        `;
        document.getElementById("usernameDisplay").textContent = user.username;
        document.getElementById("logoutBtn").addEventListener("click", logoutUser);
    } else {
        contenedorAuth.innerHTML = `
            <button class="btn btn-link text-light text-decoration-none" data-bs-toggle="modal" data-bs-target="#loginModal">
                Iniciar sesión <i class="fa-regular fa-user ms-1"></i>
            </button>
            <button class="btn btn-brand btn-sm px-3" data-bs-toggle="modal" data-bs-target="#registerModal">
                Registrarse
            </button>
        `;
    }
}