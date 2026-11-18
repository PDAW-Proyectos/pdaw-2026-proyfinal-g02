import { checkAuthStatus, inicializarAuth } from "./auth.js";
import { cargarNavbar } from "./navbar.js";

document.addEventListener("DOMContentLoaded", async() => {
    const user = await checkAuthStatus();
    cargarNavbar(user, {mostrarBuscador: true});
    inicializarAuth()

    cargarDatosPerfil(userLogueado);
    });

    async function cargarDatosPerfil(userLogueado) {
    const contenedor = document.getElementById("perfil-container");
    
    // Revisar si viene un ?id=... en la URL (por si se visita el perfil de otro usuario)
    const params = new URLSearchParams(window.location.search);
    const idBuscado = params.get("id") || userLogueado?.id;

    if (!idBuscado) {
        contenedor.innerHTML = `<p class="text-center text-warning my-4">Tenés que iniciar sesión para ver tu perfil.</p>`;
        return;
    }

    try {
        const respuesta = await fetch(`/api/usuarios/${idBuscado}`);
        if (!respuesta.ok) throw new Error("No se pudo obtener el perfil del usuario.");

        const perfil = await respuesta.json();

        document.getElementById("perfil-username").textContent = perfil.username || perfil.nombre || "Usuario";
        document.getElementById("perfil-reseñas-propias").textContent = perfil.reseñasPropias ?? perfil.reseñas?.length ?? 0;
        document.getElementById("perfil-reseñas-guardadas").textContent = perfil.reseñasGuardadas ?? perfil.favoritas?.length ?? 0;

        // Formatear fecha (DD/MM/AAAA)
        if (perfil.fechaCreacion || perfil.createdAt) {
            const fecha = new Date(perfil.fechaCreacion || perfil.createdAt);
            document.getElementById("perfil-fecha-creacion").textContent = fecha.toLocaleDateString("es-AR");
        } else {
            document.getElementById("perfil-fecha-creacion").textContent = "Desconocida";
        }

    } catch (error) {
        console.error("Error cargando perfil:", error);
        contenedor.innerHTML = `<p class="text-danger text-center my-4">Ocurrió un error al cargar el perfil.</p>`;
    }
}