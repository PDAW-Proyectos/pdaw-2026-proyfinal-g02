import { checkAuthStatus, inicializarAuth } from "./auth.js";
import { cargarNavbar } from "./navbar.js";

document.addEventListener("DOMContentLoaded", async() => {
    const user = await checkAuthStatus();
    cargarNavbar(user, {mostrarBuscador: false});
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

        const todosLosUsuarios = await respuesta.json();
        
        const usuarios = todosLosUsuarios.filter(user => user.rol !== "administrador");

        if (usuarios.length === 0) {
            contenedor.innerHTML = `<p class="text-secondary text-center py-4">No hay usuarios registrados.</p>`;
            return;
        }

        contenedor.innerHTML = usuarios.map(user => {
            const cantidadReseñas = user.misReseñas?.length || 0;
            const estaBaneado = user.estaBaneado || false;    

        return `
        <div class="review-card mb-3 d-flex justify-content-between align-items-center">
                <div class="d-flex align-items-center gap-4">
                    <div
                        class="rounded-circle d-flex align-items-center justify-content-center fw-bold review-avatar-icon">
                        <i class="bi bi-person-fill fs-5"></i>
                    </div>
                    <span class="fw-bold text-white">${user.username}</span>
                    <a href="/usuario/${user.id}" class="text-secondary text-decoration-underline">Reseñas: (${cantidadReseñas})</a>
                </div>
                <button class="btn btn-sm ${estaBaneado ? 'btn-danger' : 'btn-warning'} btn-banear" 
                        data-id="${user.id}" 
                        data-baneado="${estaBaneado}">
                    <i class="fa-solid fa-ban me-1"></i> ${estaBaneado ? 'Desbanear' : 'Banear'}
                </button>
                <button class="btn btn-link p-0 text-decoration-none eliminar-usuario" data-userid="${user.id}" aria-label="Eliminar">
                    <span class="rounded-circle bg-danger text-white d-inline-flex align-items-center justify-content-center btn-acciones">
                        <i class="bi bi-x-lg"></i>
                    </span>
                </button>
            </div>
        `}).join('');

        inicializarAccionesUsuarios();


    } catch (error) {
        console.error("Error: ", error);
        contenedor.innerHTML = `<p class= "text-danger text-center py-4">Ocurrió un error al cargar los usuarios.</p>`;
    }
}

async function inicializarAccionesUsuarios(){
    const contenedor = document.getElementById("usuarios-container");

    contenedor.querySelectorAll(".eliminar-usuario").forEach(btn => {
        btn.addEventListener("click", async (e) => {

            const targetBtn = e.target.closest(".eliminar-usuario");
            const userId = targetBtn.getAttribute("data-userid");
            console.log("ID capturado para eliminar:", userId);

            const confirmado = confirm("¿Estas seguro que deseas eliminar a este usuario?");
            if (!confirmado) return;

            try {
                const respuesta = await fetch(`/api/usuarios/${userId}`,{ 
                    method: "DELETE"
                });
                if (!respuesta.ok) {
                    throw new Error("No se puede eliminar al usuario desde el servidor");
                }
                cargarUsuarios();
            }catch (error) {
                console.error("Error: ", error);
                alert("Ocurrió un error al intentar eliminar el usuario");
            }
        });
    });

    contenedor.querySelectorAll(".btn-banear").forEach(btn => {
        btn.addEventListener("click", async (e) => {
            const targetBtn = e.target.closest(".btn-banear");
            const userId = targetBtn.getAttribute("data-id");

            const estadoActual = targetBtn.getAttribute("data-baneado") === 'true';
            const nuevoEstado = !estadoActual;


            await banearUsuario(userId, nuevoEstado);
        });
    });
}




async function banearUsuario(id, estaBaneado){
    try{
        const respuesta = await fetch(`/api/usuarios/${id}/ban`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ estaBaneado })
        });
        if (respuesta.ok) {
            cargarUsuarios();
        }
    }catch (error) {
        console.error("Error al banear el usuario", error);
    }
}