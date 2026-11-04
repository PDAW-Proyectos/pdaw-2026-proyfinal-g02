const config = require("./config");
const autenticacion = require("./middlewares/autenticacion");
const RepositorioUsuarios = require("./repositories/RepositorioUsuarios")
const ServicioAuth = require("./services/servicioAuth")

const repositorios = {
    usuarios: new RepositorioUsuarios(config.rutaUsuarios)
};

(async() => await repositorios.usuarios.cargar())(); //cargar el repositorio con los datos del archivo

const servicios = {
    auth: new ServicioAuth(repositorios.usuarios)
}

const middlewares = {
    autenticacion: autenticacion(repositorios.usuarios)
}

module.exports = { config, repositorios, servicios, middlewares }