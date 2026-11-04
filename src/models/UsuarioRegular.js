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

    agregarReseñaAFavoritas(id) {
        if (!id) return false;
        if (this.reseñasFavoritas.includes(id)) return false;
        this.reseñasFavoritas.push(id);
        return true;
    }

    eliminarReseñaDeFavoritas(id) {
        const index = this.reseñasFavoritas.indexOf(id);
        if (index === -1) return false;
        this.reseñasFavoritas = this.reseñasFavoritas.filter((r) => r !== id);
        return true;
    }

    agregarReseña(id) {
        if (!id) return false;
        if (this.misReseñas.includes(id)) return false;
        this.misReseñas.push(id);
        return true;
    }

    eliminarReseña(id) {
        const initialLength = this.misReseñas.length;
        this.misReseñas = this.misReseñas.filter(r => r !== id);
        return this.misReseñas.length < initialLength; // Retorna true si efectivamente se borró
    }

    seguirUsuario(id) {
        if (!id) return false;
        if (id === this.id) {
            throw new Error("No podés seguirte a vos mismo.");
        }
        if (this.seguidos.includes(id)) return false; // Ya lo sigue
        this.seguidos.push(id);
        return true;
    }

    dejarDeSeguirUsuario(id) {
        const initialLength = this.seguidos.length;
        this.seguidos = this.seguidos.filter(seguido => seguido !== id);
        return this.seguidos.length < initialLength;
    }

    agregarSeguidor(id) {
        if (!id) return false;
        if (id === this.id) return false; // Nadie puede ser su propio seguidor
        if (this.seguidores.includes(id)) return false;
        this.seguidores.push(id);
        return true;
    }

    eliminarSeguidor(id) {
        const initialLength = this.seguidores.length;
        this.seguidores = this.seguidores.filter(seguidor => seguidor !== id);
        return this.seguidores.length < initialLength;
    }

    toggleBan() {
        this.estaBaneado = !this.estaBaneado;
        return this.estaBaneado;
    }
}

module.exports = UsuarioRegular;
