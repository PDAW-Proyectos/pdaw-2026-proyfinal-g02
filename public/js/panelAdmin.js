import { checkAuthStatus, inicializarAuth } from "./auth.js";
import { cargarNavbar } from "./navbar.js";

document.addEventListener("DOMContentLoaded", async() => {
    const user = await checkAuthStatus();
    cargarNavbar(user, {mostrarBuscador: true});
    inicializarAuth()

    cargarUsuarios();
});

export async function cargarUsuarios(){
    const contenedor = document.getElementById('usuarios-container');

    if (!contenedor) return;

    try {
        contenedor.innerHTML = `<p class="text-secondary text-center py-4">Cargando usuarios...</p>`;

        const respuesta = await fetch("api/usuarios");

        if (!respuesta.ok) {
            throw new Error("No se pudieron cargar los usuarios.");
        }
        
        const usuarios = await respuesta.json();

        if (usuarios.length === 0) {
            contenedor.innerHTML = `<p class="text-secondary text-center py-4">No hay usuarios registrados.</p>`;
            return;
        }

        contenedor.innerHTML = usuarios.map(user => {
            const cantidadReseñas = user.misReseñas?.length || 0;    

        return `
        <div class="review-card mb-3 d-flex justify-content-between align-items-center">
                <div class="d-flex align-items-center gap-4">
                    <div
                        class="rounded-circle d-flex align-items-center justify-content-center fw-bold review-avatar-icon">
                        <i class="bi bi-person-fill fs-5"></i>
                    </div>
                    <span class="fw-bold text-white">${user.username}</span>
                    <a href="#" class="text-secondary text-decoration-underline">Reseñas: (${cantidadReseñas})</a>
                </div>
                <button class="btn btn-link p-0 text-decoration-none" aria-label="Editar">
                    <span
                        class="rounded-circle bg-text text-white d-inline-flex align-items-center justify-content-center btn-acciones">
                        <i class="bi bi-x-lg"></i>
                    </span>
                </button>

                <button class="btn btn-link p-0 text-decoration-none" aria-label="Eliminar">
                    <span
                        class="rounded-circle bg-danger text-white d-inline-flex align-items-center justify-content-center btn-acciones">
                        <i class="bi bi-x-lg"></i>
                    </span>
                </button>
            </div>
        `}).join('');
    } catch (error) {
        console.error("Error: ", error);
        contenedor.innerHTML = `<p class= "text-danger text-center py-4">Ocurrió un error al cargar los usuarios.</p>`;
    }
}