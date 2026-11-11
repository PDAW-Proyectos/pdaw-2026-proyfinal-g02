class Cancion {
    constructor(id, titulo, artistas = [], album = "", previewURL = "", imagen = "", duracion = 0, fechaLanzamiento = null) {
        this.id = id,
        this.titulo = titulo,
        this.artistas = artistas,
        this.album = album,
        this.previewURL = previewURL,
        this.imagen = imagen,
        this.duracion = duracion,
        this.fechaLanzamiento = fechaLanzamiento ? (fechaLanzamiento instanceof Date ? fechaLanzamiento : new Date(fechaLanzamiento)) : null
    }
}

module.exports = Cancion