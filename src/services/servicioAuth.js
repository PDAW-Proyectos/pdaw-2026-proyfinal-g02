const bcrypt = require("bcryptjs");

class ServicioAuth {
    constructor(repositorio) {
        this.repositorio = repositorio;
    }

    async registrarUsuario(username, email, password, rol) {
        // validaciones de los inputs (longitud, etc). Lanzar error de validacion si hay.

        // email y username deben ser unicos. Lanzar error de regla de negocio
        const existeEmail = await this.repositorio.buscarPorEmail(email)
        const existeUsername = await this.repositorio.buscarPorUsername(username)
        if(existeEmail || existeUsername) {
            throw new Error("El usuario ya se encuentra registrado")
        }

        // hashear pass
        let passwordHash = await bcrypt.hash(password, 12);

        // si todo ok, registro usuario
        return await this.repositorio.agregar(
            username,
            email,
            passwordHash,
            rol,
        );
    }

    async iniciarSesion(email, password) {
        // buscar usuario
        let usuario = this.repositorio.buscarPorEmail(email);
        if (!usuario) return null;

        // comparar contraseñas
        const esValida = this.repositorio.verificarPass(usuario.id, password);
        if (!esValida) return null;

        return usuario;
    }
}

module.exports = ServicioAuth;
