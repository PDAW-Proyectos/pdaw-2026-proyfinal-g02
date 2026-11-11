class Album {
    constructor(id, nombre, portada = "", artistas = [], canciones = []) {
        this.id = id;
        this.nombre = nombre;
        this.portada = portada;
        this.artistas = artistas;
        this.canciones = canciones;
    }
}

module.exports = Album;
