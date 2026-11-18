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



const editarCampoModal = document.getElementById('editarCampoModal');
const formEditarCampo = document.getElementById('form-editar-campo');
const inputValor = document.getElementById('valor-input');
const inputNombreCampo = document.getElementById('nombre-campo');
const labelDinamico = document.getElementById('label-dinamico');
const modalTitulo = document.getElementById('editarCampoModalLabel');

if (editarCampoModal) {
    editarCampoModal.addEventListener('show.bs.modal', (event) => {
        const button = event.relatedTarget;
        const campo = button.getAttribute('data-campo');

        inputNombreCampo.value = campo;
        inputValor.value = "";
        inputValor.removeAttribute("minlength");

        if (campo === 'usuario') {
            modalTitulo.textContent = "Cambiar nombre de usuario";
            labelDinamico.textContent = "Nuevo nombre de usuario";
            inputValor.type = "text";
            inputValor.placeholder = "tu_usuario";
            inputValor.minLength = 3;
            inputValor.maxLength = 20;
            inputValor.value = document.getElementById("input-usuario").value;
        } else if (campo === 'email') {
            modalTitulo.textContent = "Cambiar correo electrónico";
            labelDinamico.textContent = "Nuevo correo electrónico";
            inputValor.type = "email";
            inputValor.placeholder = "tu@correo.com";
            inputValor.value = document.getElementById("input-email").value;
        } else if (campo === 'password') {
            modalTitulo.textContent = "Cambiar contraseña";
            labelDinamico.textContent = "Nueva contraseña";
            inputValor.type = "password";
            inputValor.placeholder = "mínimo 6 caracteres";
            inputValor.minLength = 6;
        }
    });

    formEditarCampo.addEventListener('submit', async (e) => {
        e.preventDefault();

        const campoModificado = inputNombreCampo.value;
        const nuevoValor = inputValor.value.trim();

        if (campoModificado === 'usuario' && nuevoValor.length < 3) {
            alert("El usuario debe tener al menos 3 caracteres.");
            return;
        }
        if (campoModificado === 'email') {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(nuevoValor)) {
                alert("Por favor, ingresá un correo electrónico válido.");
                return;
            }
        }
        if (campoModificado === 'password' && nuevoValor.length < 6) {
            alert("La contraseña debe tener al menos 6 caracteres.");
            return;
        }

        try {
            const user = await checkAuthStatus();
            if (!user) return;

            let campoAEnviar = campoModificado;
            if (campoModificado === 'usuario') {
                campoAEnviar = 'username';
            }

            const respuesta = await fetch(`/api/usuarios/${user.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ [campoAEnviar]: nuevoValor })
            });

            const data = await respuesta.json();
            if (!respuesta.ok) throw new Error(data.error || 'No se pudo actualizar la información.');

            alert('¡Cambios guardados con éxito!');
            
            const modalInstance = bootstrap.Modal.getInstance(editarCampoModal);
            modalInstance.hide();


            cargarDatosPerfil(user.id);

        } catch (error) {
            console.error('Error al actualizar:', error);
            alert(error.message);
        }
    });
}