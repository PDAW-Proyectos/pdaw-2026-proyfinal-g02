const { readFile, writeFile, mkdir } = require("node:fs/promises");
const path = require("node:path")
const UsuarioRegular = require("../models/UsuarioRegular");
const Administrador = require("../models/Administrador");

class RepositorioUsuarios {
    constructor(ruta) {
        this.ruta = ruta;
        this.usuarios = [];
        this.proximoId = 1;
    }

    async cargar() {
        try {
            const contenido = await readFile(this.ruta, "utf8");
            if (!contenido.trim()) {
                this.usuarios = [];
                return;
            }
            const data = JSON.parse(contenido) || [];
            this.usuarios = data.map((datos) => {
                let user;
                if (datos.rol === "administrador") {
                    user = new Administrador(datos.id, datos.username, datos.email, datos.passwordHash);
                } else {
                    user = new UsuarioRegular(datos.id, datos.username, datos.email, datos.passwordHash);
                    user.estaBaneado = datos.estaBaneado ?? false;
                    user.reseñasFavoritas = datos.reseñasFavoritas ?? [];
                    user.misReseñas = datos.misReseñas ?? [];
                    user.seguidos = datos.seguidos ?? [];
                    user.seguidores = datos.seguidores ?? [];
                }
                return user;
            });
            this.proximoId = Math.max(0, ...this.usuarios.map((u) => u.id)) + 1;
        } catch (error) {
            if (error.code !== "ENOENT") throw error;
            await this.guardar();
        }
    }

    async guardar() {
        const carpeta = path.dirname(this.ruta);
        await mkdir(carpeta, { recursive: true });
        await writeFile(this.ruta, JSON.stringify(this.usuarios, null, 2), "utf8");
    }

    async agregar(username, email, passwordHash, rol = "usuario") {
        const id = this.proximoId++;
        let usuario;
        if (rol === "administrador") {
            usuario = new Administrador(id, username, email, passwordHash);
        } else {
            usuario = new UsuarioRegular(id, username, email, passwordHash);
        }
        this.usuarios.push(usuario);
        await this.guardar();
        return usuario;
    }

    listar() {
        return this.usuarios;
    }

    buscarPorId(id) {
        return this.usuarios.find((u) => u.id === Number(id)) || null;
    }

    buscarPorEmail(email) {
        return this.usuarios.find((u) => u.email === email) || null;
    }

    buscarPorUsername(username) {
        return this.usuarios.find((u) => u.username === username) || null;
    }

    async actualizar(id, cambios) {
        const usuario = this.buscarPorId(id);
        if (!usuario) throw new Error("Usuario inexistente");
        if (cambios.username !== undefined) usuario.username = cambios.username;
        if (cambios.email !== undefined) usuario.email = cambios.email;
        if (cambios.passwordHash !== undefined) usuario.passwordHash = cambios.passwordHash;
        if (cambios.estaBaneado !== undefined && usuario.rol === "usuario") {
            usuario.estaBaneado = cambios.estaBaneado;
        }
        await this.guardar();
        return usuario;
    }

    async eliminar(id) {
        const usuario = this.buscarPorId(id);
        if (!usuario) return false;
        this.usuarios = this.usuarios.filter((u) => u.id !== Number(id));
        await this.guardar();
        return true;
    }

    async agregarReseña(idUsuario, idReseña) {
        const usuario = this.buscarPorId(idUsuario);
        if (!usuario) {
            throw new Error("Usuario inexistente");
        }

        if (!usuario.misReseñas) {
            usuario.misReseñas = [];
        }

        if (!usuario.misReseñas.includes(idReseña)) {
            usuario.misReseñas.push(idReseña);
            await this.guardar(); 
        }

        return usuario;
    }

    async quitarReseña(idUsuario, idReseña) {
        const usuario = this.buscarPorId(idUsuario);
        if (!usuario) {
            throw new Error("Usuario inexistente");
        }

        if (usuario.misReseñas) {
            usuario.misReseñas = usuario.misReseñas.filter(
                (id) => String(id) !== String(idReseña)
            );
            await this.guardar(); 
        }

        return usuario;
    }
}

module.exports = RepositorioUsuarios;