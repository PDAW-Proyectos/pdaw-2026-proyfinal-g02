const { randomUUID } = require("node:crypto");

function requestContext(logger) {
    return (req, res, next) => {
        req.id = req.get('X-Request-Id') || randomUUID();
        res.set('X-Request-Id', req.id); // Viaja en la respuesta para el cliente/frontend
        
        const start = Date.now();
        
        res.on('finish', () => {
            logger.info('solicitud', {
                requestId: req.id,
                method: req.method,
                url: req.originalUrl,
                status: res.statusCode,
                ms: Date.now() - start,
            });
        });
        
        next();
    };
}

module.exports = requestContext;