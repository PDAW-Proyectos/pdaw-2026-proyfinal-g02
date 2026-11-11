class Cancion {
    constructor(id, titulo, artistas = [], album = "", previewUrl = "", imagen = "", duracion = 0, fechaLanzamiento = null) {
        this.id = String(id || "");
        this.titulo = titulo || "";
        this.artistas = artistas;
        this.album = album;
        this.previewUrl = previewUrl;
        this.imagen = imagen;
        this.duracion = duracion;
        this.fechaLanzamiento = fechaLanzamiento ? new Date(fechaLanzamiento) : null;
    }

    static fromDeezer(trackData) {
        return new Cancion(
            trackData.id,
            trackData.title,
            trackData.artist ? [trackData.artist.name] : [],
            trackData.album ? trackData.album.title : "",
            trackData.preview || "",
            trackData.album && trackData.album.cover_medium ? trackData.album.cover_medium : "",
            trackData.duration || 0,
            null
        );
    }
}

module.exports = Cancion