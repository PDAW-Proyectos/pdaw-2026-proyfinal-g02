const Usuario = require("./Usuario");

class UsuarioRegular extends Usuario {
    constructor(id, username, email, passwordHash) {
        super(id, username, email, passwordHash, "usuario");
        this.estaBaneado = false;
        this.reseñasFavoritas = [];
        this.misReseñas = [];
        this.seguidos = [];
        this.seguidores = [];
    }
}

module.exports = UsuarioRegular;
