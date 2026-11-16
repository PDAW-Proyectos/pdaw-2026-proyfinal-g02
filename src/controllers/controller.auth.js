const { BadRequestError, UnauthorizedError } = require("../utils/errors.js");

const regenerate = (req) =>
    new Promise((ok, fail) =>
        req.session.regenerate((e) => (e ? fail(e) : ok())),
    );

const destroy = (req) =>
    new Promise((ok, fail) => req.session.destroy((e) => (e ? fail(e) : ok())));

function crearControladorAuth(servicio) {
    async function register(req, res, next) {
        try {
            const { username, email, password, rol = "usuario" } = req.body ?? {};
            
            if (
                !username || username.trim() === "" ||
                !email || email.trim() === "" ||
                !password || password.trim() === ""
            ) {
                throw new BadRequestError("Todos los campos son obligatorios");
            }

            const usuario = await servicio.registrarUsuario(
                username.trim(),
                email.trim(),
                password,
                rol,
            );
            return res.status(201).json(usuario);
        } catch (error) {
            next(error);
        }
    }

    async function login(req, res, next) {
        try {
            const { email, password } = req.body ?? {};
            
            if (!email || !email.trim() || !password) {
                throw new UnauthorizedError("Credenciales inválidas");
            }

            const usuario = await servicio.iniciarSesion(email.trim(), password);
            if (!usuario) {
                throw new UnauthorizedError("Credenciales inválidas");
            }

            await regenerate(req);
            req.session.userId = usuario.id;

            return res.status(200).json({ 
                message: "Inicio de sesión exitoso", 
                user: usuario 
            });
        } catch (error) {
            next(error);
        }
    }

    async function logout(req, res, next) {
        try {
            await destroy(req);
            res.clearCookie("connect.sid").status(204).end();
        } catch (error) {
            next(error);
        }
    }

    function me(req, res, next) {
        try {
            if (!req.user) {
                throw new UnauthorizedError("No hay sesión activa");
            }
            res.json({ authenticated: true, user: req.user });
        } catch (error) {
            next(error);
        }
    }

    return { register, login, logout, me };
}

module.exports = crearControladorAuth;