const contenedor = require("./container");
const createApp = require("./app");
const logger = require("./utils/logger");

async function iniciarServidor() {
    try {
        await contenedor.inicializarContenedor();

        const server = createApp(contenedor).listen(contenedor.config.port, () => {
            logger.info(`Servidor escuchando en el puerto ${contenedor.config.port}`);
        });

        process.on('unhandledRejection', (reason) => {
            logger.error('promesa rechazada sin manejar', { reason: String(reason) });
        });

        process.on('uncaughtException', (err) => {
            logger.error('excepción no capturada', { stack: err.stack });
            process.exit(1);
        });

        process.on('SIGTERM', () => {
            logger.info('apagado ordenado');
            server.close(() => {
                process.exit(0);
            });
        });

    } catch (error) {
        logger.error("Error al iniciar el servidor:", { stack: error.stack });
        process.exit(1);
    }
}

iniciarServidor();