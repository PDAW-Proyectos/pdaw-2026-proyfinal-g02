class Artista {
    constructor(id, nombre, imagen = "", canciones = []) {
        this.id = id;
        this.nombre = nombre;
        this.imagen = imagen;
        this.canciones = canciones;
    }
}

module.exports = Artista;
