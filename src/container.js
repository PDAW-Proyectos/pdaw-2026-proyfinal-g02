const config = require("./config")
const RepositorioUsuarios = require("./repositories/RepositorioUsuarios")
const ServicioAuth = require("./services/servicioAuth")

const repositorios = {
    usuarios: new RepositorioUsuarios(config.rutaUsuarios)
}

const servicios = {
    auth: new ServicioAuth(repositorios.usuarios)
}

module.exports = { config, repositorios, servicios }