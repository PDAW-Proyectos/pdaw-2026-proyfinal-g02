export async function checkAuthStatus() {
    try {
        const response = await fetch("/api/auth/me", { method: "GET" });
        if (!response.ok) return null;

        const data = await response.json();
        if (data.user) {
            return data.user;
        }
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

export function setearAuthForms() {
    const loginForm = document.getElementById("loginForm");
    const registerForm = document.getElementById("registerForm");
    const loginModalElement = document.getElementById("loginModal");
    const registerModalElement = document.getElementById("registerModal");

    const loginModal = loginModalElement 
        ? (bootstrap.Modal.getInstance(loginModalElement) || new bootstrap.Modal(loginModalElement))
        : null;
        
    const registerModal = registerModalElement 
        ? (bootstrap.Modal.getInstance(registerModalElement) || new bootstrap.Modal(registerModalElement))
        : null;

    if (registerForm) {
        registerForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const username = document.getElementById("registerUsername").value.trim();
            const email = document.getElementById("registerEmail").value.trim();
            const password = document.getElementById("registerPassword").value;

            // validaciones
            if (username.length < 3) {
                alert("El usuario debe tener al menos 3 caracteres.");
                return;
            }
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                alert("Por favor, ingresá un correo electrónico válido.");
                return;
            }
            if (password.length < 6) {
                alert("La contraseña debe tener al menos 6 caracteres.");
                return;
            }

            try {
                const response = await fetch("/api/auth/register", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ username, email, password }),
                });
                const data = await response.json();
                if (!response.ok) throw new Error(data.error || "Error al registrar.");

                alert("¡Registro exitoso! Por favor, iniciá sesión.");
                registerForm.reset();
                if (registerModal) registerModal.hide();
                if (loginModal) loginModal.show();
            } catch (error) {
                console.error("Error en registro:", error);
                alert(error.message);
            }
        });
    }

    if (loginForm) {
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
                if (loginModal) loginModal.hide();

                if (data.user && data.user.role === "admin") {
                    window.location.href = "/"; // acomodar a la que quiera
                } else {
                    window.location.href = "/"; // acomodar a la que quiera
                }
            } catch (error) {
                console.error("Error en login:", error);
                alert(error.message);
            }
        });
    }
}