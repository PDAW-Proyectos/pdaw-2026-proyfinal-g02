const bcrypt = require('bcryptjs');

class ServicioAuth {
    constructor(repositorio){
        this.repositorio = repositorio
    }

    async registrarUsuario(username, email, password, rol) {
        // validaciones de los inputs (longitud, etc). Lanzar error de validacion si hay.
        
        // email y username deben ser unicos. Lanzar error de regla de negocio
        
        // hashear pass
        let passwordHash = await bcrypt.hash(password, 12)

        // si todo ok, registro usuario
        return await this.repositorio.agregar(username, email, passwordHash, rol)
    }

    async iniciarSesion(email, password) {
        let usuario = this.repositorio.buscarPorEmail(email)
        if (!usuario) {
            // si no existe: error autenticacion, credenciales invalidas
            return 
        }

        // comparar contraseñas
        const esValida = await bcrypt.compare(password, usuario.passwordHash)

        if (!esValida) {
            // error autenticacion, credenciales invalidas
            return
        }

        return this.alPublico(usuario)
    }

    alPublico(usuario){
        // capaz haya que agregarle los otros atributos de usuario regular
        const {id, username, email, rol} = usuario
        return {id, username, email, rol} 
    }
}

module.exports = ServicioAuth