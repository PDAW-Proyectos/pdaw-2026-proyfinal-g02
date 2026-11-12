const contenedor = require("./container");
const createApp = require("./app");

async function iniciarServidor() {
    try {
        await contenedor.inicializarContenedor();

        createApp(contenedor).listen(contenedor.config.port, () => {
            console.log(
                `Escuchando en http://localhost:${contenedor.config.port}`,
            );
        });
    } catch (error) {
        console.error("Error al iniciar el servidor:", error);
        process.exit(1);
    }
}

iniciarServidor();
