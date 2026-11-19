export async function checkAuthStatus() {
    try {
        const response = await fetch("/api/auth/me", { method: "GET" });
        if (!response.ok) return null;

        const data = await response.json();
        if (data.user) {
            return data.user;
        }
        return null;
    } catch (error) {
        console.error("No se pudo verificar la sesión:", error);
        return null;
    }
}

export async function logoutUser() {
    try {
        const response = await fetch("/api/auth/logout", { method: "POST" });
        if (response.ok) {
            window.location.href = "/";
        }
    } catch (err) {
        console.error("Error al cerrar sesión", err);
    }
}

export function requiereRol(user, rol) {
    if (!user || user.rol !== rol) {
        window.location.href = "/";
        return false;
    }
    return true;
} // en cada vista que requiera un rol: if (!requiereRol(user, 'administrador')) return;

function _inyectarModalesAuth() {
    if (document.getElementById("loginModal") || document.getElementById("registerModal")) {
        return;
    }

    const modalesHTML = `
        <!-- ================= MODAL DE INICIO DE SESIÓN ================= -->
        <div class="modal fade" id="loginModal" tabindex="-1" aria-labelledby="loginModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content p-3">
                    <div class="modal-header border-0">
                        <h5 class="modal-title fw-bold" id="loginModalLabel">Iniciar Sesión en Beatácora</h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"
                            aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <form id="loginForm">
                            <div class="mb-3">
                                <label for="loginEmail" class="form-label text-secondary small">Correo electrónico</label>
                                <input type="email" class="form-control search-input" id="loginEmail" required
                                    placeholder="tu@correo.com" autocomplete="email">
                            </div>
                            <div class="mb-3">
                                <label for="loginPassword" class="form-label text-secondary small">Contraseña</label>
                                <input type="password" class="form-control search-input" id="loginPassword" required
                                    placeholder="••••••••" autocomplete="current-password">
                            </div>
                            <button type="submit" class="btn btn-brand w-100 mt-3 py-2">Entrar</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>

        <!-- ================= MODAL DE REGISTRO ================= -->
        <div class="modal fade" id="registerModal" tabindex="-1" aria-labelledby="registerModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content p-3">
                    <div class="modal-header border-0">
                        <h5 class="modal-title fw-bold" id="registerModalLabel">Crear una cuenta</h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"
                            aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <form id="registerForm">
                            <div class="mb-3">
                                <label for="registerUsername" class="form-label text-secondary small">Nombre de usuario</label>
                                <input type="text" class="form-control search-input" id="registerUsername" required
                                    placeholder="tu_usuario" minlength="3" maxlength="20" autocomplete="username">
                            </div>
                            <div class="mb-3">
                                <label for="registerEmail" class="form-label text-secondary small">Correo electrónico</label>
                                <input type="email" class="form-control search-input" id="registerEmail" required
                                    placeholder="tu@correo.com" autocomplete="email">
                            </div>
                            <div class="mb-3">
                                <label for="registerPassword" class="form-label text-secondary small">Contraseña</label>
                                <input type="password" class="form-control search-input" id="registerPassword" required
                                    minlength="6" placeholder="mínimo 6 caracteres" autocomplete="new-password">
                            </div>
                            <button type="submit" class="btn btn-brand w-100 mt-3 py-2">Registrarse</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML("beforeend", modalesHTML);
}

function _configurarFocoModal(modalElement, inputId) {
    if (!modalElement || modalElement.dataset.focusAttached) return;
    modalElement.dataset.focusAttached = "true";
    modalElement.addEventListener("shown.bs.modal", () => {
        document.getElementById(inputId)?.focus();
    });
}

function _obtenerInstanciaModal(modalElement) {
    if (!modalElement) return null;
    return bootstrap.Modal.getInstance(modalElement) || new bootstrap.Modal(modalElement);
}

function _validarDatosRegistro(username, email, password) {
    if (username.length < 3) {
        mostrarAlerta("El usuario debe tener al menos 3 caracteres.", "error");
        return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        mostrarAlerta("Por favor, ingresá un correo electrónico válido.", "error");
        return false;
    }
    if (password.length < 6) {
        mostrarAlerta("La contraseña debe tener al menos 6 caracteres.", "error");
        return false;
    }
    return true;
}

function _configurarEnvioRegistro(registerForm, registerModal, loginModal) {
    if (!registerForm || registerForm.dataset.listenerAttached) return;
    registerForm.dataset.listenerAttached = "true";

    registerForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const username = document.getElementById("registerUsername").value.trim();
        const email = document.getElementById("registerEmail").value.trim();
        const password = document.getElementById("registerPassword").value;

        if (!_validarDatosRegistro(username, email, password)) return;

        try {
            const response = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, email, password }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || "Error al registrar.");

            mostrarAlerta("¡Registro exitoso! Por favor, iniciá sesión.", "exito");
            registerForm.reset();
            registerModal?.hide();
            loginModal?.show();
        } catch (error) {
            console.error("Error en registro:", error);
            mostrarAlerta(error.message, "error");
        }
    });
}

function _configurarEnvioLogin(loginForm, loginModal) {
    if (!loginForm || loginForm.dataset.listenerAttached) return;
    loginForm.dataset.listenerAttached = "true";

    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const email = document.getElementById("loginEmail").value.trim();
        const password = document.getElementById("loginPassword").value;

        try {
            const response = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || "Credenciales inválidas.");

            loginForm.reset();
            loginModal?.hide();

            const destino = data.user?.rol === "administrador" ? "/panelAdmin.html" : "/explorar.html";
            window.location.href = destino;
        } catch (error) {
            console.error("Error en login:", error);
            mostrarAlerta(error.message, "error");
        }
    });
}

export function inicializarAuth() {
    _inyectarModalesAuth();

    const loginForm = document.getElementById("loginForm");
    const registerForm = document.getElementById("registerForm");
    const loginModalElement = document.getElementById("loginModal");
    const registerModalElement = document.getElementById("registerModal");

    _configurarFocoModal(loginModalElement, "loginEmail");
    _configurarFocoModal(registerModalElement, "registerUsername");

    const loginModal = _obtenerInstanciaModal(loginModalElement);
    const registerModal = _obtenerInstanciaModal(registerModalElement);

    _configurarEnvioRegistro(registerForm, registerModal, loginModal);
    _configurarEnvioLogin(loginForm, loginModal);
}