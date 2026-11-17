const { AppError, BadRequestError, NotFoundError } = require("../utils/errors.js");

function normalize(error) {
    if (error instanceof AppError) {
        return error;
    }
    if (error.type === "entity.parse.failed") {
        return new BadRequestError("El JSON enviado no es válido");
    }
    return null;
}

function notFoundHandler(req, res, next) {
    next(new NotFoundError(`Ruta no encontrada: ${req.originalUrl}`));
}

function errorHandler(logger, { exposeStack = false } = {}) {
    return (err, req, res, next) => {
        if (res.headersSent) {
            return next(err);
        }

        const known = normalize(err);
        const status = known?.status ?? 500;

        const contexto = {
            requestId: req.id,
            status
        };

        if (status >= 500) {
            logger.error(err.message, {
                ...contexto,
                stack: err.stack
            });
        } else {
            logger.warn(known.message, contexto);
        }

        return res
            .status(status)
            .type("application/problem+json")
            .json({
                type: "about:blank",
                title: known?.title ?? "Error interno",
                status,
                detail: known?.message ?? "Ocurrió un error inesperado.",
                instance: req.originalUrl,
                requestId: req.id,
                ...(known?.details && { errores: known.details }),
                ...(exposeStack && !known && { stack: err.stack })
            });
    };
}

module.exports = {
    notFoundHandler,
    errorHandler
}