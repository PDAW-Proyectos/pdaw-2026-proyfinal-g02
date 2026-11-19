const {
    NotFoundError,
    ForbiddenError,
    BadRequestError,
    ConflictError,
} = require("../utils/errors.js");
const bcrypt = require("bcryptjs");
class ServicioUsuarios {
    constructor(repositorioUsuarios, repositorioReseñas) {
        this.repositorioUsuarios = repositorioUsuarios;
        this.repositorioReseñas = repositorioReseñas;
    }

    listarTodos() {
        const usuarios = this.repositorioUsuarios.listar();
        return usuarios.map((u) => this._formatearUsuarioSeguro(u));
    }

    obtenerPorId(id) {
        const usuario = this.repositorioUsuarios.buscarPorId(id);
        if (!usuario) {
            throw new NotFoundError("Usuario");
        }
        return this._formatearUsuarioSeguro(usuario);
    }

    async actualizar(id, cambios, usuarioLogueado) {
        const usuario = this.repositorioUsuarios.buscarPorId(id);
        if (!usuario) {
            throw new NotFoundError("Usuario");
        }

        // Regla de negocio: Solo el propio usuario o un administrador pueden modificar
        if (
            Number(usuarioLogueado.id) !== Number(id) &&
            usuarioLogueado.rol !== "administrador"
        ) {
            throw new ForbiddenError(
                "No tienes permisos para modificar este usuario.",
            );
        }

        // Evitar que un usuario común se cambie el rol a administrador a sí mismo
        if (cambios.rol && usuarioLogueado.rol !== "administrador") {
            throw new ForbiddenError("No puedes cambiar tu propio rol.");
        }

        const datosParaActualizar = { ...cambios };
        const todosLosUsuarios = this.repositorioUsuarios.listar
            ? await this.repositorioUsuarios.listar()
            : [];

        if (datosParaActualizar.username !== undefined) {
            const nuevoUsername = String(datosParaActualizar.username).trim();
            if (nuevoUsername.length < 3) {
                throw new BadRequestError(
                    "El nombre de usuario debe tener al menos 3 caracteres.",
                );
            }

            const usernameOcupado = todosLosUsuarios.some(
                (u) =>
                    Number(u.id) !== Number(id) &&
                    String(u.username || "").toLowerCase() ===
                        nuevoUsername.toLowerCase(),
            );
            if (usernameOcupado) {
                throw new ConflictError(
                    "Ese nombre de usuario ya está en uso.",
                );
            }

            datosParaActualizar.username = nuevoUsername;
        }

        if (datosParaActualizar.email !== undefined) {
            const nuevoEmail = String(datosParaActualizar.email)
                .trim()
                .toLowerCase();
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(nuevoEmail)) {
                throw new BadRequestError(
                    "El correo electrónico no tiene un formato válido.",
                );
            }

            const emailOcupado = todosLosUsuarios.some(
                (u) =>
                    Number(u.id) !== Number(id) &&
                    String(u.email || "").toLowerCase() === nuevoEmail,
            );
            if (emailOcupado) {
                throw new ConflictError(
                    "Ese correo electrónico ya está en uso.",
                );
            }

            datosParaActualizar.email = nuevoEmail;
        }

        if (datosParaActualizar.password !== undefined) {
            const nuevaPassword = String(datosParaActualizar.password).trim();
            if (nuevaPassword.length < 6) {
                throw new BadRequestError(
                    "La contraseña debe tener al menos 6 caracteres.",
                );
            }
            datosParaActualizar.passwordHash = await bcrypt.hash(
                nuevaPassword,
                12,
            );
            delete datosParaActualizar.password;
        }

        const usuarioActualizado = await this.repositorioUsuarios.actualizar(
            id,
            datosParaActualizar,
        );
        return this._formatearUsuarioSeguro(usuarioActualizado);
    }

    async cambiarEstadoBan(id, estaBaneado) {
        const usuario = this.repositorioUsuarios.buscarPorId(id);
        if (!usuario) {
            throw new NotFoundError("Usuario");
        }

        const usuarioActualizado = await this.repositorioUsuarios.actualizar(
            id,
            { estaBaneado },
        );
        return this._formatearUsuarioSeguro(usuarioActualizado);
    }

    async eliminar(id, usuarioLogueado) {
        const usuario = this.repositorioUsuarios.buscarPorId(id);
        if (!usuario) {
            throw new NotFoundError("Usuario");
        }

        // Regla de negocio: Solo el dueño o un admin pueden eliminar
        if (
            Number(usuarioLogueado.id) !== Number(id) &&
            usuarioLogueado.rol !== "administrador"
        ) {
            throw new ForbiddenError(
                "No tienes permisos para eliminar este usuario.",
            );
        }

        return await this.repositorioUsuarios.eliminar(id);
    }

    async seguir(idSeguidor, idSeguido) {
        if (Number(idSeguidor) === Number(idSeguido)) {
            throw new BadRequestError("No podés seguirte a vos mismo.");
        }
        return await this.repositorioUsuarios.seguirUsuario(
            idSeguidor,
            idSeguido,
        );
    }

    async dejarDeSeguir(idSeguidor, idSeguido) {
        if (Number(idSeguidor) === Number(idSeguido)) {
            throw new BadRequestError(
                "No podés dejar de seguirte a vos mismo.",
            );
        }
        return await this.repositorioUsuarios.dejarDeSeguirUsuario(
            idSeguidor,
            idSeguido,
        );
    }

    async agregarFavorita(idUsuarioLogueado, idReseña) {
        if (!idReseña) {
            throw new BadRequestError(
                "Debe proporcionar una ID de reseña válida.",
            );
        }

        const reseña = this.repositorioReseñas.buscarPorId(idReseña);
        if (!reseña) {
            throw new NotFoundError("Reseña");
        }

        if (String(reseña.idUsuario) === String(idUsuarioLogueado)) {
            throw new ConflictError(
                "No podés agregar tu propia reseña a favoritas.",
            );
        }

        const usuarioActual =
            this.repositorioUsuarios.buscarPorId(idUsuarioLogueado);
        const yaEraFavorita = usuarioActual.reseñasFavoritas?.some(
            (id) => String(id) === String(idReseña),
        );

        const usuarioActualizado =
            await this.repositorioUsuarios.agregarReseñaFavorita(
                idUsuarioLogueado,
                idReseña,
            );

        if (!yaEraFavorita) {
            reseña.modificarCantidadFavoritos(1);
            await this.repositorioReseñas.guardar();
        }

        return this._formatearUsuarioSeguro(usuarioActualizado);
    }

    async quitarFavorita(idUsuarioLogueado, idReseña) {
        const usuarioActualizado =
            await this.repositorioUsuarios.quitarReseñaFavorita(
                idUsuarioLogueado,
                idReseña,
            );
        const reseña = this.repositorioReseñas.buscarPorId(idReseña);
        if (reseña) {
            reseña.modificarCantidadFavoritos(-1);
            await this.repositorioReseñas.guardar();
        }
        return this._formatearUsuarioSeguro(usuarioActualizado);
    }

    // Método auxiliar privado para limpiar datos sensibles
    _formatearUsuarioSeguro(usuario) {
        return {
            id: usuario.id,
            username: usuario.username,
            email: usuario.email,
            rol: usuario.rol,
            estaBaneado: usuario.estaBaneado ?? false,
            misReseñas: usuario.misReseñas || [],
            reseñasFavoritas: usuario.reseñasFavoritas || [],
            seguidores: usuario.seguidores || [],
            seguidos: usuario.seguidos || [],
        };
    }
}

module.exports = ServicioUsuarios;
