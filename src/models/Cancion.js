function extractArtists(trackData) {
    if (trackData.artist?.name) {
        return [trackData.artist.name];
    }
    return [];
}

class Cancion {
    constructor({
        id,
        titulo,
        artistas = [],
        album = "",
        previewUrl = "",
        imagen = "",
        duracion = 0,
    } = {}) {
        this.id = String(id ?? "");
        this.titulo = titulo ?? "";
        this.artistas = artistas;
        this.album = album;
        this.previewUrl = previewUrl;
        this.imagen = imagen;
        this.duracion = duracion;
    }

    static fromDeezer(trackData) {
        const data = trackData ?? {};
        return new Cancion({
            id: data.id,
            titulo: data.title,
            artistas: extractArtists(data),
            album: data.album?.title ?? "",
            previewUrl: data.preview ?? "",
            imagen: data.album?.cover_medium ?? "",
            duracion: data.duration ?? 0,
        });
    }
}

module.exports = Cancion;