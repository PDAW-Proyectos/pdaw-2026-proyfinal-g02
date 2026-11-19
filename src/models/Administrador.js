const Usuario = require("./Usuario");

class Administrador extends Usuario {
    constructor({ id, username, email, passwordHash } = {}) {
        super({
            id,
            username,
            email,
            passwordHash,
            rol: "administrador",
        });
    }
}

module.exports = Administrador;