const config = require("./config");
const autenticacion = require("./middlewares/autenticacion");
const RepositorioUsuarios = require("./repositories/RepositorioUsuarios")
const RepositorioReseñas = require("./repositories/RepositorioReseñas")
const ServicioAuth = require("./services/servicioAuth")
const ServicioReseñas = require("./services/ServicioReseñas")
const ServicioDeezer = require("./services/ServicioDeezer")

const repositorios = {
    usuarios: new RepositorioUsuarios(config.rutaUsuarios),
    reseñas: new RepositorioReseñas(config.rutaReseñas)
};

const servicios = {
    auth: new ServicioAuth(repositorios.usuarios),
    deezer: new ServicioDeezer,
    reseñas: new ServicioReseñas(repositorios.reseñas, repositorios.usuarios),
}

const middlewares = {
    autenticacion: autenticacion(repositorios.usuarios)
}

// Función para inicializar la persistencia antes de arrancar la app
async function inicializarContenedor() {
    await repositorios.usuarios.cargar();
    await repositorios.reseñas.cargar();
}

module.exports = { config, repositorios, servicios, middlewares, inicializarContenedor }