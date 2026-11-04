const regenerate = (req) =>
    new Promise((ok, fail) =>
        req.session.regenerate((e) => (e ? fail(e) : ok())),
    );

const destroy = (req) =>
    new Promise((ok, fail) => req.session.destroy((e) => (e ? fail(e) : ok())));

function crearControladorAuth(servicio) {
    async function register(req, res) {
        const { username, email, password, rol = "usuario" } = req.body ?? {};
        
        if (
            !username || username.trim() === "" ||
            !email || email.trim() === "" ||
            !password || password.trim() === ""
        ) {
            return res.status(400).json({ error: "Todos los campos son obligatorios" });
        }

        try {
            const usuario = await servicio.registrarUsuario(
                username.trim(),
                email.trim(),
                password,
                rol,
            );
            return res.status(201).json(usuario);
        } catch (error) {
            return res.status(400).json({ error: error.message });
        }
    }

    async function login(req, res) {
        const { email, password } = req.body ?? {};
        
        if (!email || !email.trim() || !password) {
            return res.status(401).json({ error: "Credenciales inválidas" });
        }

        try {
            // Esto puede devolver null (credenciales incorrectas) o lanzar error (si está baneado)
            const usuario = await servicio.iniciarSesion(email.trim(), password);
            if (!usuario) {
                return res.status(401).json({ error: "Credenciales inválidas" });
            }

            await regenerate(req);
            req.session.userId = usuario.id; // Guardamos el ID en la sesión

            return res.status(200).json({ 
                message: "Inicio de sesión exitoso", 
                user: usuario 
            });
        } catch (error) {
            // Atrapa el error de cuenta suspendida u otros fallos de negocio
            return res.status(403).json({ error: error.message });
        }
    }

    async function logout(req, res) {
        try {
            await destroy(req);
            res.clearCookie("connect.sid").status(204).end();
        } catch (error) {
            res.status(500).json({ error: "Error al cerrar sesión" });
        }
    }

    function me(req, res) {
        if (!req.user) {
            return res.status(401).json({ authenticated: false, message: "No hay sesión activa" });
        }
        res.json({ authenticated: true, user: req.user });
    }

    return { register, login, logout, me };
}

module.exports = crearControladorAuth;