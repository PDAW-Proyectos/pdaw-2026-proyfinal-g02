const bcrypt = require("bcryptjs");
const {
    BadRequestError,
    ConflictError,
    ForbiddenError,
} = require("../utils/errors.js");

class ServicioAuth {
    constructor(repositorio) {
        this.repositorio = repositorio;
    }

    _toPublic(usuario) {
        if (!usuario) return null;
        return {
            id: usuario.id,
            username: usuario.username,
            email: usuario.email,
            rol: usuario.rol,
            estaBaneado: usuario.estaBaneado ?? false,
            reseñasFavoritas: usuario.reseñasFavoritas ?? [],
            misReseñas: usuario.misReseñas ?? [],
            seguidos: usuario.seguidos ?? [],
            seguidores: usuario.seguidores ?? [],
        };
    }

    _validarDatosRegistro(username, email, password) {
        if (
            !username ||
            typeof username !== "string" ||
            username.trim().length < 3
        ) {
            throw new BadRequestError(
                "El nombre de usuario debe tener al menos 3 caracteres.",
            );
        }
        if (username.trim().length > 20) {
            throw new BadRequestError(
                "El nombre de usuario no puede superar los 20 caracteres.",
            );
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email || !emailRegex.test(email.trim())) {
            throw new BadRequestError(
                "El formato del correo electrónico no es válido.",
            );
        }

        if (!password || password.length < 6) {
            throw new BadRequestError(
                "La contraseña debe tener al menos 6 caracteres.",
            );
        }
    }

    _verificarDisponibilidad(cleanUsername, cleanEmail) {
        const existeEmail = this.repositorio.buscarPorEmail(cleanEmail);
        const existeUsername =
            this.repositorio.buscarPorUsername(cleanUsername);

        if (existeEmail || existeUsername) {
            throw new ConflictError(
                "El usuario o correo ya se encuentra registrado.",
            );
        }
    }

    async registrarUsuario(username, email, password, rol = "usuario") {
        this._validarDatosRegistro(username, email, password);

        const cleanUsername = username.trim();
        const cleanEmail = email.trim().toLowerCase();

        this._verificarDisponibilidad(cleanUsername, cleanEmail);

        const passwordHash = await bcrypt.hash(password, 12);
        const usuario = await this.repositorio.agregar(
            cleanUsername,
            cleanEmail,
            passwordHash,
            rol,
        );

        return this._toPublic(usuario);
    }

    async iniciarSesion(email, password) {
        if (!email || !password) {
            throw new BadRequestError("Todos los campos son obligatorios.");
        }

        const usuario = this.repositorio.buscarPorEmail(
            email.trim().toLowerCase(),
        );
        if (!usuario) {
            return null;
        }

        if (usuario.estaBaneado) {
            throw new ForbiddenError("Tu cuenta se encuentra suspendida.");
        }

        const esValida = await bcrypt.compare(password, usuario.passwordHash);
        if (!esValida) {
            return null;
        }

        return this._toPublic(usuario);
    }
}

module.exports = ServicioAuth;