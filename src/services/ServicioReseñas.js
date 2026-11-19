const Cancion = require("../models/Cancion");
const {
    NotFoundError,
    ForbiddenError,
    BadRequestError,
    UnauthorizedError,
} = require("../utils/errors.js");

class ServicioReseñas {
    constructor(repositorioReseñas, repositorioUsuarios, servicioDeezer) {
        this.repositorioReseñas = repositorioReseñas;
        this.repositorioUsuarios = repositorioUsuarios;
        this.servicioDeezer = servicioDeezer;
    }

    async listarReseñas() {
        return this.repositorioReseñas.listar();
    }

    async obtenerReseñaPorId(id, idUsuarioActual) {
        const reseña = this.repositorioReseñas.buscarPorId(id);
        if (!reseña) {
            throw new NotFoundError("Reseña");
        }

        if (this.servicioDeezer && reseña.cancion && reseña.cancion.id) {
            try {
                const datosFrescos =
                    await this.servicioDeezer.obtenerCancionPorId(
                        reseña.cancion.id,
                    );
                if (datosFrescos && datosFrescos.previewUrl) {
                    reseña.cancion.previewUrl = datosFrescos.previewUrl; // se vencia el previewUrl
                    await this.repositorioReseñas.actualizar(id, {
                        cancion: reseña.cancion,
                    });
                }
            } catch (error) {
                throw new NotFoundError(
                    "No se pudo actualizar el audio de la canción desde Deezer.",
                );
            }
        }

        // Agregamos info del autor, favoritos y seguimiento
        let autorInfo = { id: reseña.idUsuario, nombre: "Usuario" };
        let esFavoritaDelUsuario = false;
        let estaSiguiendoAlAutor = false;

        if (this.repositorioUsuarios) {
            const usuario = this.repositorioUsuarios.buscarPorId(
                reseña.idUsuario,
            );
            if (usuario) {
                autorInfo = {
                    id: usuario.id,
                    nombre: usuario.username || "Usuario",
                };
            }

            // Verificamos si el usuario actual marcó esta reseña como favorita
            if (idUsuarioActual) {
                const usuarioActual =
                    this.repositorioUsuarios.buscarPorId(idUsuarioActual);
                if (usuarioActual && usuarioActual.reseñasFavoritas) {
                    esFavoritaDelUsuario = usuarioActual.reseñasFavoritas.some(
                        (favId) => String(favId) === String(id),
                    );
                }
                // Verificamos si sigue al autor
                if (usuarioActual.seguidos) {
                    estaSiguiendoAlAutor = usuarioActual.seguidos.some(
                        (segId) => String(segId) === String(reseña.idUsuario),
                    );
                }
            }
        }

        return {
            ...reseña,
            autor: autorInfo,
            esFavorita: esFavoritaDelUsuario,
            siguiendo: estaSiguiendoAlAutor,
        };
    }

    async obtenerReseñasDeUsuario(idUsuario) {
        return this.repositorioReseñas.buscarPorUsuario(idUsuario);
    }

    async crearReseña(idUsuario, cancionInput, valoracionPropia, descripcion) {
        // 1. Validaciones de negocio usando BadRequestError o UnauthorizedError
        if (!idUsuario) {
            throw new UnauthorizedError(
                "Debe estar autenticado para crear una reseña.",
            );
        }

        const valoracion = Number(valoracionPropia);
        if (isNaN(valoracion) || valoracion < 1 || valoracion > 5) {
            throw new BadRequestError(
                "La valoración propia debe ser un número entre 1 y 5.",
            );
        }

        if (!descripcion || !descripcion.trim()) {
            throw new BadRequestError(
                "La descripción de la reseña no puede estar vacía.",
            );
        }

        if (!cancionInput) {
            throw new BadRequestError(
                "La reseña debe estar asociada a una canción.",
            );
        }

        // 2. Asegurarnos de que el objeto canción sea una instancia válida de Cancion
        let cancionFinal = cancionInput;
        if (!(cancionInput instanceof Cancion)) {
            cancionFinal = new Cancion(
                cancionInput.id,
                cancionInput.titulo,
                cancionInput.artistas,
                cancionInput.album,
                cancionInput.previewUrl,
                cancionInput.imagen,
                cancionInput.duracion,
                cancionInput.fechaLanzamiento,
            );
        }

        // 3. Persistir a través del repositorio
        const nuevaReseña = await this.repositorioReseñas.agregar(
            cancionFinal,
            valoracion,
            descripcion.trim(),
            idUsuario,
        );

        // 4. Agregar reseña al usuario
        if (this.repositorioUsuarios) {
            await this.repositorioUsuarios.agregarReseña(
                idUsuario,
                nuevaReseña.id,
            );
        }

        return nuevaReseña;
    }

    async actualizarReseña(idReseña, idUsuarioActual, datosNuevos) {
        const reseña = await this.obtenerReseñaPorId(idReseña);

        // Validar que el usuario sea el dueño de la reseña
        if (String(reseña.idUsuario) !== String(idUsuarioActual)) {
            throw new ForbiddenError(
                "No tenés permisos para modificar esta reseña.",
            );
        }

        if (datosNuevos.valoracionPropia !== undefined) {
            const val = Number(datosNuevos.valoracionPropia);
            if (isNaN(val) || val < 1 || val > 5) {
                throw new BadRequestError(
                    "La valoración propia debe ser un número entre 1 y 5.",
                );
            }
            datosNuevos.valoracionPropia = val;
        }

        return await this.repositorioReseñas.actualizar(idReseña, datosNuevos);
    }

    async eliminarReseña(idReseña, idUsuarioActual, esAdmin = false) {
        const reseña = await this.obtenerReseñaPorId(idReseña);

        if (String(reseña.idUsuario) !== String(idUsuarioActual) && !esAdmin) {
            throw new ForbiddenError(
                "No tenés permisos para eliminar esta reseña.",
            );
        }

        const resultado = await this.repositorioReseñas.eliminar(idReseña);

        if (this.repositorioUsuarios) {
            if (reseña.idUsuario) {
                await this.repositorioUsuarios.quitarReseña(
                    reseña.idUsuario,
                    idReseña,
                );
            }
            await this.repositorioUsuarios.quitarReseñaFavoritaDeTodos(
                idReseña,
            );
        }

        return resultado;
    }

    async obtenerUltimas(limite = 10) {
        const todas = await this.repositorioReseñas.listar();
        const ultimas = [...todas]
            .sort(
                (a, b) =>
                    new Date(b.fechaPublicado) - new Date(a.fechaPublicado),
            )
            .slice(0, Number(limite));

        if (!this.repositorioUsuarios) {
            return ultimas;
        }

        return ultimas.map((reseña) => {
            const usuario = this.repositorioUsuarios.buscarPorId(
                reseña.idUsuario,
            );
            return {
                ...reseña,
                nombreAutor: usuario?.username || "Anónimo",
            };
        });
    }

    async obtenerPopulares(limite = 10) {
        const todas = await this.repositorioReseñas.listar();
        return [...todas]
            .sort((a, b) => b.cantidadFavoritos - a.cantidadFavoritos)
            .slice(0, Number(limite));
    }
}

module.exports = ServicioReseñas;
