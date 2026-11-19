import { checkAuthStatus, inicializarAuth } from "./auth.js";
import { cargarFooter } from "./footer.js";
import { cargarNavbar } from "./navbar.js";

let seguidoresActuales = [];
let seguidosActuales = [];

document.addEventListener("DOMContentLoaded", async () => {
    cargarFooter()
    const user = await checkAuthStatus();
    if (!user) {
        window.location.href = "/index.html";
        return;
    }

    let mostrar = true;
    if (user && user.rol === "administrador") {
        mostrar = false;
    }
    cargarNavbar(user, { mostrarBuscador: mostrar });

    const esAdmin = user.rol === "administrador";
    const columnaActividad = document.getElementById("columna-actividad");
    if (columnaActividad) {
        columnaActividad.classList.toggle("d-none", esAdmin);
    }

    inicializarAuth();
    inicializarEventosListasSociales();

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

        seguidoresActuales = Array.isArray(datosUsuario.seguidores) ? datosUsuario.seguidores : [];
        seguidosActuales = Array.isArray(datosUsuario.seguidos) ? datosUsuario.seguidos : [];

        document.getElementById("count-mis-resenas").textContent = datosUsuario.misReseñas ? datosUsuario.misReseñas.length : 0;
        document.getElementById("count-favs").textContent = datosUsuario.reseñasFavoritas ? datosUsuario.reseñasFavoritas.length : 0;
        document.getElementById("count-seguidores").textContent = seguidoresActuales.length;
        document.getElementById("count-seguidos").textContent = seguidosActuales.length;
    } catch (error) {
        console.error("Error al cargar perfil:", error);
    }
}

function inicializarEventosListasSociales() {
    const itemSeguidores = document.getElementById("item-seguidores");
    const itemSeguidos = document.getElementById("item-seguidos");

    if (itemSeguidores) {
        itemSeguidores.addEventListener("click", () => {
            abrirModalListaUsuarios("Seguidores", seguidoresActuales, "Todavía nadie sigue a esta cuenta.");
        });
    }

    if (itemSeguidos) {
        itemSeguidos.addEventListener("click", () => {
            abrirModalListaUsuarios("Seguidos", seguidosActuales, "Todavía no seguís a ningún usuario.");
        });
    }
}

async function abrirModalListaUsuarios(titulo, lista, mensajeVacio) {
    const modalEl = document.getElementById("listaUsuariosModal");
    const tituloEl = document.getElementById("listaUsuariosModalLabel");
    const cuerpoEl = document.getElementById("cuerpo-lista-usuarios");
    if (!modalEl || !tituloEl || !cuerpoEl) return;

    tituloEl.textContent = titulo;
    cuerpoEl.innerHTML = `<p class="text-secondary text-center py-3 mb-0">Cargando usuarios...</p>`;

    const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
    modal.show();

    if (!Array.isArray(lista) || lista.length === 0) {
        cuerpoEl.innerHTML = `<p class="text-secondary text-center py-3 mb-0">${mensajeVacio}</p>`;
        return;
    }

    const usuariosResueltos = await Promise.all(
        lista.map(async (item) => {
            if (item && typeof item === "object") {
                const id = item.id ?? item._id;
                const nombre = item.username || item.nombre || `Usuario #${id}`;
                return { id, nombre };
            }

            const id = item;
            try {
                const res = await fetch(`/api/usuarios/${id}`);
                if (!res.ok) return { id, nombre: `Usuario #${id}` };
                const u = await res.json();
                return { id: u.id ?? id, nombre: u.username || u.nombre || `Usuario #${id}` };
            } catch {
                return { id, nombre: `Usuario #${id}` };
            }
        })
    );

    cuerpoEl.innerHTML = `
        <div class="list-group list-group-flush">
            ${usuariosResueltos
                .map(
                    (u) => `
                <a href="/resenas.html?id=${u.id}" class="list-group-item list-group-item-action bg-dark text-light border-secondary d-flex justify-content-between align-items-center py-3">
                    <span class="fw-semibold">
                        <i class="fa-regular fa-user me-2 text-success"></i>${u.nombre}
                    </span>
                    <span class="badge bg-success bg-opacity-25 text-success border border-success rounded-pill">
                        Ver reseñas <i class="fa-solid fa-arrow-right ms-1"></i>
                    </span>
                </a>
            `
                )
                .join("")}
        </div>
    `;
}

const editarCampoModal = document.getElementById("editarCampoModal");
const formEditarCampo = document.getElementById("form-editar-campo");
const inputValor = document.getElementById("valor-input");
const inputNombreCampo = document.getElementById("nombre-campo");
const labelDinamico = document.getElementById("label-dinamico");
const modalTitulo = document.getElementById("editarCampoModalLabel");

if (editarCampoModal) {
    editarCampoModal.addEventListener("show.bs.modal", (event) => {
        const button = event.relatedTarget;
        const campo = button.getAttribute("data-campo");

        inputNombreCampo.value = campo;
        inputValor.value = "";
        inputValor.removeAttribute("minlength");
        inputValor.removeAttribute("maxlength");

        if (campo === "usuario") {
            modalTitulo.textContent = "Cambiar nombre de usuario";
            labelDinamico.textContent = "Nuevo nombre de usuario";
            inputValor.type = "text";
            inputValor.autocomplete = "username";
            inputValor.placeholder = "tu_usuario";
            inputValor.minLength = 3;
            inputValor.maxLength = 20;
            inputValor.value = document.getElementById("input-usuario").value;
        } else if (campo === "email") {
            modalTitulo.textContent = "Cambiar correo electrónico";
            labelDinamico.textContent = "Nuevo correo electrónico";
            inputValor.type = "email";
            inputValor.autocomplete = "email";
            inputValor.placeholder = "tu@correo.com";
            inputValor.value = document.getElementById("input-email").value;
        } else if (campo === "password") {
            modalTitulo.textContent = "Cambiar contraseña";
            labelDinamico.textContent = "Nueva contraseña";
            inputValor.type = "password";
            inputValor.autocomplete = "new-password";
            inputValor.placeholder = "mínimo 6 caracteres";
            inputValor.minLength = 6;
        }
    });

    formEditarCampo.addEventListener("submit", async (e) => {
        e.preventDefault();

        const campoModificado = inputNombreCampo.value;
        const nuevoValor = inputValor.value.trim();

        if (campoModificado === "usuario" && nuevoValor.length < 3) {
            alert("El usuario debe tener al menos 3 caracteres.");
            return;
        }
        if (campoModificado === "email") {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(nuevoValor)) {
                alert("Por favor, ingresá un correo electrónico válido.");
                return;
            }
        }
        if (campoModificado === "password" && nuevoValor.length < 6) {
            alert("La contraseña debe tener al menos 6 caracteres.");
            return;
        }

        try {
            const user = await checkAuthStatus();
            if (!user) return;

            let campoAEnviar = campoModificado;
            if (campoModificado === "usuario") {
                campoAEnviar = "username";
            }

            const respuesta = await fetch(`/api/usuarios/${user.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ [campoAEnviar]: nuevoValor }),
            });

            const data = await respuesta.json();
            if (!respuesta.ok) throw new Error(data.error || "No se pudo actualizar la información.");

            alert("¡Cambios guardados con éxito!");

            const modalInstance = bootstrap.Modal.getOrCreateInstance(editarCampoModal);
            modalInstance.hide();

            await cargarDatosPerfil(user.id);
        } catch (error) {
            console.error("Error al actualizar:", error);
            alert(error.message);
        }
    });
}