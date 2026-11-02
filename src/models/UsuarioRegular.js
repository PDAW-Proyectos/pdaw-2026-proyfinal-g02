const Usuario = require("./Usuario")

class UsuarioRegular extends Usuario {
    constructor(username, email, passwordHash) {
        super(username, email, passwordHash, "usuario")
        this.estaBaneado = false
        this.reseñasFavoritas = []
        this.misReseñas = []
        this.seguidos = []
        this.seguidores = []
    }

    // agregarReseñaAFavoritas(id): void
    agregarReseñaAFavoritas(id){
        const favorita = this.reseñasFavoritas.find(r => r === id)
        if (favorita) return
        this.reseñasFavoritas.push(id)
    }

    // eliminarReseñaDeFavoritas(id): void
    eliminarReseñaDeFavoritas(id){
        const filtrado = this.reseñasFavoritas.filter(r => r !== id)
        this.reseñasFavoritas = filtrado
    }

    // agregarReseña(Reseña): void
    agregarReseña(id){
        const hecha = this.misReseñas.find(r => r === id)
        if (hecha) return
        this.misReseñas.push(id)
    }

    // eliminarReseña(id): void
    eliminarReseña(id){
        const filtrado = this.misReseñas.filter(r => r !== id)
        this.misReseñas = filtrado
    }

    // seguirUsuario(id): void
    seguirUsuario(id){
        const seguido = this.seguidos.find(seguido => seguido === id)
        if (seguido) return
        this.seguidos.push(id)
    }

    // dejarDeSeguirUsuario(id): void
    dejarDeSeguirUsuario(id){
        const filtrado = this.seguidos.filter(seguido => seguido !== id)
        this.seguidos = filtrado
    }

    // agregarSeguidor(id): void
    agregarSeguidor(id){
        const seguidor = this.seguidores.find(seguidor => seguidor === id)
        if (seguidor) return
        this.seguidores.push(id)
    }

    // eliminarSeguidor(id): void
    eliminarSeguidor(id){
        const filtrado = this.seguidores.filter(seguidor => seguidor !== id)
        this.seguidores = filtrado
    }

    // bannearUsuario(): boolean
    toggleBan(){
        this.estaBaneado = !this.estaBaneado
        return this.estaBaneado
    }
}

module.exports = UsuarioRegular