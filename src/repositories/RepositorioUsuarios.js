const { readFile, writeFile } = require("node:fs/promises")
const UsuarioRegular = require("../models/UsuarioRegular")
const Administrador = require("../models/Administrador");

class RepositorioUsuarios {
    constructor(ruta) {
        this.ruta = ruta;
        this.usuarios = [];
        this.proximoId = 1;
    }

    async cargar() {
        try {
            const data = JSON.parse(await readFile(this.ruta, "utf8"));
            this.usuarios = data.map(datos => {
                let user
                if (datos.rol === "administrador") {
                    user = new Administrador(datos.id, datos.username, datos.email, datos.passwordHash)
                } else {
                    user = new UsuarioRegular(datos.id, datos.username, datos.email, datos.passwordHash)
                    user.estaBaneado = datos.estaBaneado
                    user.reseñasFavoritas = datos.reseñasFavoritas
                    user.misReseñas = datos.misReseñas
                    user.seguidos = datos.seguidos
                    user.seguidores = datos.seguidores
                }
                return user
            })
            this.proximoId = Math.max(0, ...this.usuarios.map((usuario) => usuario.id)) + 1;
        } catch (error) {
            if (error.code !== "ENOENT") throw error;
            await this.guardar();
        }
    }

    async guardar() {
        await writeFile(this.ruta, JSON.stringify(this.usuarios, null, 2), "utf8");
    }

    async agregar(username, email, passwordHash, rol) {
        let usuario
        if (rol === "administrador") {
            usuario = new Administrador(this.proximoId++, username, email, passwordHash)
        } else {
            usuario = new UsuarioRegular(this.proximoId++, username, email, passwordHash)
        }
        this.usuarios.push(usuario);
        await this.guardar();
        return usuario;
    }

    listar() {
        return [...this.usuarios];
    }

    buscarPorId(id) {
        return this.usuarios.find(usuario => usuario.id === Number(id));
    }

    buscarPorEmail(email) {
        return this.usuarios.find(usuario => usuario.email === email);
    }

    async actualizar(id, cambios) {
        const anterior = this.buscarPorId(id);
        if (!anterior) throw new Error("Usuario inexistente");
        let actualizado
        if (anterior.rol === "administrador") {
            actualizado = new Administrador(
                anterior.id,
                cambios.username ?? anterior.username,
                cambios.email ?? anterior.email,
                cambios.passwordHash ?? anterior.passwordHash
            )
        } else {
            actualizado = new UsuarioRegular(
                anterior.id,
                cambios.username ?? anterior.username,
                cambios.email ?? anterior.email,
                cambios.passwordHash ?? anterior.passwordHash,
            )
            actualizado.estaBaneado = cambios.estaBaneado ?? anterior.estaBaneado,
            actualizado.reseñasFavoritas = cambios.reseñasFavoritas ?? anterior.reseñasFavoritas,
            actualizado.misReseñas = cambios.misReseñas ?? anterior.misReseñas,
            actualizado.seguidos = cambios.seguidos ?? anterior.seguidos,
            actualizado.seguidores = cambios.seguidores ?? anterior.seguidores
        }
        this.usuarios[this.usuarios.indexOf(anterior)] = actualizado;
        await this.guardar();
        return actualizado;
    }

    async eliminar(id) {
        const usuario = this.buscarPorId(id);
        if (!usuario) return false;
        this.usuarios.splice(this.usuarios.indexOf(usuario), 1);
        await this.guardar();
        return true;
    }
}

module.exports = RepositorioUsuarios;
