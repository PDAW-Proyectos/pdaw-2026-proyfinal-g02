import { logoutUser } from "./auth.js";

export function cargarNavbar(user = null) {
    const contenedorAuth = document.querySelector(".auth-actions");
    if (!contenedorAuth) return;

    if (user) {
        contenedorAuth.innerHTML = `
            <div class="d-flex align-items-center gap-3">
                <span class="text-light small">Hola, <strong id="usernameDisplay"></strong></span>
                <button id="logoutBtn" class="btn btn-outline-danger btn-sm">Salir</button>
            </div>
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