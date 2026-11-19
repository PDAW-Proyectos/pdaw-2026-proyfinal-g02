const { NotFoundError, BadRequestError } = require("../utils/errors");
const { serializeResenasXml } = require("../utils/xml");

function solicitaXml(req) {
    if (req.query?.formato === "xml") return true;
    const formatoAceptado = req.accepts(["json", "xml"]);
    return formatoAceptado === "xml";
}

function enviarRespuesta(req, res, datos) {
    if (solicitaXml(req)) {
        res.type("application/xml; charset=utf-8").send(serializeResenasXml(datos));
        return;
    }
    res.json(datos);
}

function crearResenasController(servicioReseñas, servicioDeezer) {
    return {
        listar: async (req, res, next) => {
            try {
                const reseñas = await servicioReseñas.listarReseñas();
                enviarRespuesta(req, res, reseñas);
            } catch (error) {
                next(error);
            }
        },

        listarPorUsuario: async (req, res, next) => {
            try {
                const { idUsuario } = req.params;
                const reseñas = await servicioReseñas.obtenerReseñasDeUsuario(idUsuario);
                enviarRespuesta(req, res, reseñas);
            } catch (error) {
                next(error);
            }
        },

        crear: async (req, res, next) => {
            try {
                const idUsuario = req.user?.id;
                const { cancionId, valoracionPropia, descripcion } = req.body;

                if (!cancionId) {
                    throw new BadRequestError("El ID de la canción es obligatorio.");
                }

                const cancionObjeto = await servicioDeezer.obtenerCancionPorId(cancionId);

                if (!cancionObjeto) {
                    throw new NotFoundError("No se encontró la canción en Deezer.");
                }

                const nuevaReseña = await servicioReseñas.crearReseña(
                    idUsuario,
                    cancionObjeto,
                    valoracionPropia,
                    descripcion,
                );

                res.status(201).json(nuevaReseña);
            } catch (error) {
                next(error);
            }
        },

        actualizar: async (req, res, next) => {
            try {
                const idReseña = req.params.id;
                const idUsuarioActual = req.user?.id;
                const datosNuevos = req.body;

                const reseñaActualizada = await servicioReseñas.actualizarReseña(
                    idReseña,
                    idUsuarioActual,
                    datosNuevos,
                );

                res.json(reseñaActualizada);
            } catch (error) {
                next(error);
            }
        },

        eliminar: async (req, res, next) => {
            try {
                const idReseña = req.params.id;
                const idUsuarioActual = req.user?.id;
                const esAdmin = req.user?.rol === "administrador" || req.user?.esAdmin || false;

                await servicioReseñas.eliminarReseña(
                    idReseña,
                    idUsuarioActual,
                    esAdmin,
                );
                res.json({ mensaje: "Reseña eliminada correctamente." });
            } catch (error) {
                next(error);
            }
        },

        listarUltimas: async (req, res, next) => {
            try {
                const limite = req.query.limit || 10;
                const ultimas = await servicioReseñas.obtenerUltimas(limite);
                enviarRespuesta(req, res, ultimas);
            } catch (error) {
                next(error);
            }
        },

        listarPopulares: async (req, res, next) => {
            try {
                const limite = req.query.limit || 10;
                const populares = await servicioReseñas.obtenerPopulares(limite);
                enviarRespuesta(req, res, populares);
            } catch (error) {
                next(error);
            }
        },

        obtenerPorId: async (req, res, next) => {
            try {
                const { id } = req.params;
                const idUsuarioActual = req.user ? req.user.id : null;
                const reseña = await servicioReseñas.obtenerReseñaPorId(id, idUsuarioActual);
                if (!reseña) {
                    throw new NotFoundError("No se encontró la reseña solicitada.");
                }
                enviarRespuesta(req, res, reseña);
            } catch (error) {
                next(error);
            }
        },
    };
}

module.exports = crearResenasController;