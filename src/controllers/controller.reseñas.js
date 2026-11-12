function crearResenasController(servicioReseñas) {
    return {
        listar: async (req, res) => {
            try {
                const reseñas = await servicioReseñas.listarReseñas();
                res.json(reseñas);
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        },

        crear: async (req, res) => {
            try {
                const idUsuario = req.user?.id;
                const { cancion, valoracionPropia, descripcion } = req.body;

                const nuevaReseña = await servicioReseñas.crearReseña(
                    idUsuario,
                    cancion,
                    valoracionPropia,
                    descripcion
                );

                res.status(201).json(nuevaReseña);
            } catch (error) {
                res.status(400).json({ error: error.message });
            }
        },

        actualizar: async (req, res) => {
            try {
                const idReseña = req.params.id;
                const idUsuarioActual = req.user?.id;
                const datosNuevos = req.body;

                const reseñaActualizada = await servicioReseñas.actualizarReseña(
                    idReseña,
                    idUsuarioActual,
                    datosNuevos
                );

                res.json(reseñaActualizada);
            } catch (error) {
                const status = error.message.includes("permisos") ? 403 : 400;
                res.status(status).json({ error: error.message });
            }
        },

        eliminar: async (req, res) => {
            try {
                const idReseña = req.params.id;
                const idUsuarioActual = req.user?.id;
                const esAdmin = req.user?.esAdmin || false;

                await servicioReseñas.eliminarReseña(idReseña, idUsuarioActual, esAdmin);
                res.json({ mensaje: "Reseña eliminada correctamente." });
            } catch (error) {
                const status = error.message.includes("permisos") ? 403 : 400;
                res.status(status).json({ error: error.message });
            }
        }
    };
}

module.exports = crearResenasController;