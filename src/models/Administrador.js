const Usuario = require("./Usuario")

class Administrador extends Usuario {
    constructor(id, username, email, passwordHash){
        super(id, username, email, passwordHash, "administrador")
    }
}

module.exports = Administrador