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
            contenedor.innerHTML = `
                <tr>
                    <td colspan="4" class="text-center text-secondary py-4">
                        No hay usuarios registrados.
                    </td>
                </tr>`;
            return;
        }

        contenedor.innerHTML = usuarios.map(user => {
            const cantidadReseñas = user.misReseñas?.length || 0;
            const estaBaneado = user.estaBaneado || false;    

        return `
            <tr>
                <td>
                    <div class="d-flex align-items-center gap-3">
                        <div class="rounded-circle d-flex align-items-center justify-content-center fw-bold review-avatar-icon" style="width: 36px; height: 36px;">
                            <i class="bi bi-person-fill"></i>
                        </div>
                        <span class="fw-bold text-white flex-grow-1 text-center pe-4">${user.username}</span>
                    </div>
                </td>
                <td class="text-secondary text-center">
                    ${user.email || 'Sin email'}
                </td>
                <td class="text-center">
                    <a href="resenas.html?id=${user.id}" class="badge bg-secondary text-light text-decoration-none px-3 py-2 btn-ver-reseñas">
                        Ver reseñas
                    </a>
                </td>
                <td class="text-center">
                    <div class="d-inline-flex align-items-center gap-2">
                        <button class="btn btn-sm ${estaBaneado ? 'btn-danger' : 'btn-warning'} text-dark fw-bold btn-banear" 
                                data-id="${user.id}" 
                                data-baneado="${estaBaneado}">
                            <i class="fa-solid fa-ban me-1"></i> ${estaBaneado ? 'Desbanear' : 'Banear'}
                        </button>
                        <button class="btn btn-sm btn-outline-danger eliminar-usuario" 
                                data-userid="${user.id}" 
                                title="Eliminar usuario"
                                aria-label="Eliminar">
                            <i class="bi bi-trash-fill"></i>
                        </button>
                    </div>
                </td>
            </tr>
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

            const confirmado = confirm("¿Estas seguro que deseas eliminar a este usuario?");
            if (!confirmado) return;

            try {
                const respuesta = await fetch(`/api/usuarios/${userId}`,{ 
                    method: "DELETE"
                });
                
                if (!respuesta.ok) {
                    throw new Error("No se puede eliminar al usuario desde el servidor");
                }
                alert("Usuario eliminado correctamente");
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


            await banearUsuario(userId, estadoActual);
        });
    });
}




async function banearUsuario(id, estaBaneado){
    try{
        const nuevoEstado = !estaBaneado;

        const respuesta = await fetch(`/api/usuarios/${id}/ban`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ estaBaneado: nuevoEstado })
        });
        if (!respuesta.ok) {
            throw new Error("No se pudo actualizar el estado del usuario");
        }

        const mensaje = nuevoEstado ? "Usuario baneado con éxito" : "Usuario desbaneado correctamente";
        alert(mensaje);
        cargarUsuarios();
    }catch (error) {
        console.error("Error al banear el usuario", error);
        alert("Ocurrió un error al intentar cambiar el estado del usuario");
    }
}