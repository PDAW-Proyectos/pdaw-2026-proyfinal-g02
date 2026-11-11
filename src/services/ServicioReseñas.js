const Reseña = require("../models/Reseña");
const Cancion = require("../models/Cancion");

class ServicioReseñas {
    constructor(repositorioReseñas, servicioDeezer = null) {
        this.repositorioReseñas = repositorioReseñas;
        this.servicioDeezer = servicioDeezer;
    }

    async listarReseñas() {
        return this.repositorioReseñas.listar();
    }

    async obtenerReseñaPorId(id) {
        const reseña = this.repositorioReseñas.buscarPorId(id);
        if (!reseña) {
            throw new Error("La reseña solicitada no existe.");
        }
        return reseña;
    }

    async obtenerReseñasDeUsuario(idUsuario) {
        return this.repositorioReseñas.buscarPorUsuario(idUsuario);
    }

    async crearReseña(idUsuario, cancionInput, valoracionPropia, descripcion) {
        // 1. Validaciones de negocio
        if (!idUsuario) {
            throw new Error("Debe estar autenticado para crear una reseña.");
        }

        const valoracion = Number(valoracionPropia);
        if (isNaN(valoracion) || valoracion < 1 || valoracion > 5) {
            throw new Error("La valoración propia debe ser un número entre 1 y 5.");
        }

        if (!descripcion || !descripcion.trim()) {
            throw new Error("La descripción de la reseña no puede estar vacía.");
        }

        if (!cancionInput) {
            throw new Error("La reseña debe estar asociada a una canción.");
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
                cancionInput.fechaLanzamiento
            );
        }

        // 3. Persistir a través del repositorio
        const nuevaReseña = await this.repositorioReseñas.agregar(
            cancionFinal,
            valoracion,
            descripcion.trim(),
            idUsuario
        );

        return nuevaReseña;
    }

    async actualizarReseña(idReseña, idUsuarioActual, datosNuevos) {
        const reseña = await this.obtenerReseñaPorId(idReseña);

        // Validar que el usuario sea el dueño de la reseña
        if (String(reseña.idUsuario) !== String(idUsuarioActual)) {
            throw new Error("No tenés permisos para modificar esta reseña.");
        }

        if (datosNuevos.valoracionPropia !== undefined) {
            const val = Number(datosNuevos.valoracionPropia);
            if (isNaN(val) || val < 1 || val > 5) {
                throw new Error("La valoración propia debe ser un número entre 1 y 5.");
            }
            datosNuevos.valoracionPropia = val;
        }

        return await this.repositorioReseñas.actualizar(idReseña, datosNuevos);
    }

    async eliminarReseña(idReseña, idUsuarioActual, esAdmin = false) {
        const reseña = await this.obtenerReseñaPorId(idReseña);

        // Permite borrar al dueño o a un administrador
        if (String(reseña.idUsuario) !== String(idUsuarioActual) && !esAdmin) {
            throw new Error("No tenés permisos para eliminar esta reseña.");
        }

        return await this.repositorioReseñas.eliminar(idReseña);
    }
}

module.exports = ServicioReseñas;