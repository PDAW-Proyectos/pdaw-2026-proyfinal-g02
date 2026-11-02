const Usuario = require("./Usuario")

class Administrador extends Usuario {
    constructor(username, email, passwordHash){
        super(username, email, passwordHash, "administrador")
    }
}

module.exports = Administrador