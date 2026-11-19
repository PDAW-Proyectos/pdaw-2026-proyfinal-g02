const config = require("./config");
const logger = require("./utils/logger");
const autenticacion = require("./middlewares/autenticacion");
const RepositorioUsuarios = require("./repositories/RepositorioUsuarios");
const RepositorioReseñas = require("./repositories/RepositorioReseñas");
const ServicioAuth = require("./services/servicioAuth");
const ServicioReseñas = require("./services/ServicioReseñas");
const ServicioDeezer = require("./services/ServicioDeezer");
const ServicioUsuarios = require("./services/ServicioUsuarios");
const { precargarDatosIniciales } = require("./utils/seed");

const repositorios = {
    usuarios: new RepositorioUsuarios(config.rutaUsuarios),
    reseñas: new RepositorioReseñas(config.rutaReseñas),
};

const instanciaDeezer = new ServicioDeezer()
const servicios = {
    auth: new ServicioAuth(repositorios.usuarios),
    deezer: instanciaDeezer,
    reseñas: new ServicioReseñas(repositorios.reseñas, repositorios.usuarios, instanciaDeezer),
    usuarios: new ServicioUsuarios(repositorios.usuarios, repositorios.reseñas),
};

const middlewares = {
    autenticacion: autenticacion(repositorios.usuarios),
};

// Función para inicializar la persistencia antes de arrancar la app
async function inicializarContenedor() {
    await repositorios.usuarios.cargar();
    await repositorios.reseñas.cargar();
    await precargarDatosIniciales({
    servicioAuth: servicios.auth,
    servicioResenas: servicios.reseñas,
    logger,
});
}

module.exports = {
    config,
    repositorios,
    servicios,
    middlewares,
    inicializarContenedor,
};
