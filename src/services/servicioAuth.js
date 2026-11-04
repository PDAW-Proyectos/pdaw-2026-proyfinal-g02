const bcrypt = require("bcryptjs");

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

    async registrarUsuario(username, email, password, rol = "usuario") {
        // validaciones
        if (!username || typeof username !== "string" || username.trim().length < 3) {
            throw new Error("El nombre de usuario debe tener al menos 3 caracteres.");
        }
        if (username.trim().length > 20) {
            throw new Error("El nombre de usuario no puede superar los 20 caracteres.");
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email || !emailRegex.test(email.trim())) {
            throw new Error("El formato del correo electrónico no es válido.");
        }

        if (!password || password.length < 6) {
            throw new Error("La contraseña debe tener al menos 6 caracteres.");
        }

        const cleanUsername = username.trim();
        const cleanEmail = email.trim().toLowerCase();

        // que sean unicos el username y el email
        const existeEmail = this.repositorio.buscarPorEmail(cleanEmail);
        const existeUsername = this.repositorio.buscarPorUsername(cleanUsername);
        
        if (existeEmail || existeUsername) {
            throw new Error("El usuario o correo ya se encuentra registrado.");
        }

        const passwordHash = await bcrypt.hash(password, 12);
        const usuario = await this.repositorio.agregar(cleanUsername, cleanEmail, passwordHash, rol);
        
        return this._toPublic(usuario);
    }

    async iniciarSesion(email, password) {
        if (!email || !password) {
            throw new Error("Todos los campos son obligatorios.");
        }

        const usuario = this.repositorio.buscarPorEmail(email.trim().toLowerCase());
        if (!usuario) return null; // Credenciales inválidas

        if (usuario.estaBaneado) {
            throw new Error("Tu cuenta se encuentra suspendida.");
        }

        const esValida = await bcrypt.compare(password, usuario.passwordHash);
        if (!esValida) return null; // Credenciales inválidas

        return this._toPublic(usuario);
    }
}

module.exports = ServicioAuth;