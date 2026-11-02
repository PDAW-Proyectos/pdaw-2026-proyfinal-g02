const regenerate = (req) =>
    new Promise((ok, fail) =>
        req.session.regenerate((e) => (e ? fail(e) : ok())),
    );

const destroy = (req) =>
    new Promise((ok, fail) => req.session.destroy((e) => (e ? fail(e) : ok())));

function crearControladorAuth(servicio) {
    async function register(req, res) {
        const { username, email, password, rol = "usuario" } = req.body ?? {};
        // hacer validaciones
        if (
            username.trim() === "" ||
            email.trim() === "" ||
            password.trim() === ""
        ) {
            return res.status(400).json({ error: "Credenciales inválidas" });
        }

        // si todo ok registrar usuario
        let usuario
        try {
            usuario = await servicio.registrarUsuario(
                username,
                email,
                password,
                rol,
            );
        } catch (error) {
            return res.status(400).json({ error: error.message });
        }

        res.status(201).json(usuario);
    }

    async function login(req, res) {
        const { email, password } = req.body ?? {};
        // hacer validaciones
        if (!email.trim() || !password) {
            return res.status(401).json({ error: "Credenciales inválidas" });
        }

        // si todo ok iniciar sesion
        const usuario = await servicio.iniciarSesion(email, password); // devuelve null si falla
        if (!usuario) {
            return res.status(401).json({ error: "Credenciales inválidas" });
        }

        await regenerate(req);
        req.session.userId = usuario.id;

        res.status(200).json(usuario);
    }

    async function logout(req, res) {
        await destroy(req);
        res.clearCookie("connect.sid").status(204).end();
    }

    function me(req, res) {
        res.json({ user: req.user });
    }

    return { register, login, logout, me };
}

module.exports = crearControladorAuth;
