class Cancion {
    constructor(id, titulo, artistas = [], album = "", previewUrl = "", imagen = "", duracion = 0) {
        this.id = String(id || "");
        this.titulo = titulo || "";
        this.artistas = artistas;
        this.album = album;
        this.previewUrl = previewUrl;
        this.imagen = imagen;
        this.duracion = duracion;
    }

    static fromDeezer(trackData) {
        return new Cancion(
            trackData.id,
            trackData.title,
            trackData.artist ? [trackData.artist.name] : [],
            trackData.album ? trackData.album.title : "",
            trackData.preview || "",
            trackData.album && trackData.album.cover_medium ? trackData.album.cover_medium : "",
            trackData.duration || 0
        );
    }
}

module.exports = Cancion