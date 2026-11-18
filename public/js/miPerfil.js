import { checkAuthStatus, inicializarAuth } from "./auth.js";
import { cargarNavbar } from "./navbar.js";

document.addEventListener("DOMContentLoaded", async () => {
    const user = await checkAuthStatus();
    if (!user) {
        window.location.href = "/login.html";
        return;
    }

    cargarNavbar(user, { mostrarBuscador: true });
    inicializarAuth();

    
    await cargarDatosPerfil(user.id);
});

async function cargarDatosPerfil(userId) {
    try {
        const respuesta = await fetch(`/api/usuarios/${userId}`);
        if (!respuesta.ok) throw new Error("No se pudo obtener la información del perfil.");

        const datosUsuario = await respuesta.json();

        document.getElementById("input-usuario").value = datosUsuario.username || "";
        document.getElementById("input-email").value = datosUsuario.email || "";

        const divBan = document.getElementById("estado-ban");
        if (datosUsuario.estaBaneado) {
            divBan.textContent = "Cuenta Baneada";
            divBan.className = "p-2 rounded bg-danger text-white fw-bold text-center";
        } else {
            divBan.textContent = "Cuenta Activa";
            divBan.className = "p-2 rounded bg-success text-white fw-bold text-center";
        }

        document.getElementById("count-mis-resenas").textContent = datosUsuario.misReseñas ? datosUsuario.misReseñas.length : 0;
        document.getElementById("count-favs").textContent = datosUsuario.reseñasFavoritas ? datosUsuario.reseñasFavoritas.length : 0;
        document.getElementById("count-seguidores").textContent = datosUsuario.seguidores ? datosUsuario.seguidores.length : 0;
        document.getElementById("count-seguidos").textContent = datosUsuario.seguidos ? datosUsuario.seguidos.length : 0;

    } catch (error) {
        console.error("Error al cargar perfil:", error);
    }
}