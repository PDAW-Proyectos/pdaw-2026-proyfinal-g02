class Reseña {
    constructor(id, cancion, valoracionPropia, descripcion, idUsuario, fechaPublicado = new Date(), cantidadFavoritos = 0) {
        this.id = id;
        this.cancion = cancion;
        this.valoracionPropia = valoracionPropia;
        this.descripcion = descripcion;
        this.fechaPublicado = fechaPublicado instanceof Date ? fechaPublicado : new Date(fechaPublicado);
        this.cantidadFavoritos = cantidadFavoritos;
        this.idUsuario = idUsuario;
    }

    modificarCantidadFavoritos(cantidad) {
        this.cantidadFavoritos += cantidad;
        if (this.cantidadFavoritos < 0) {
            this.cantidadFavoritos = 0; // no puede ser menor que cero
        }
        return this.cantidadFavoritos;
    }
}

module.exports = Reseña;