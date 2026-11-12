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

//cargar los repositorios con los datos de los archivos
(async() => {
    await repositorios.usuarios.cargar()
    await repositorios.reseñas.cargar()
})()

const servicios = {
    auth: new ServicioAuth(repositorios.usuarios),
    deezer: new ServicioDeezer,
    reseñas: new ServicioReseñas(repositorios.reseñas, this.deezer),
}

const middlewares = {
    autenticacion: autenticacion(repositorios.usuarios)
}

module.exports = { config, repositorios, servicios, middlewares }