function escapeXml(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");
}

function _formatearArtistasXml(cancion) {
    if (Array.isArray(cancion.artistas)) {
        return cancion.artistas.join(", ");
    }
    return cancion.artistas || "";
}

function _construirCancionXml(cancion) {
    const artistas = _formatearArtistasXml(cancion);
    return `
        <cancion id="${escapeXml(cancion.id || "")}">
            <titulo>${escapeXml(cancion.titulo || "")}</titulo>
            <artistas>${escapeXml(artistas)}</artistas>
            <album>${escapeXml(cancion.album || "")}</album>
        </cancion>`;
}

function serializeResenaXml(r) {
    const cancion = r?.cancion || {};

    return `
    <resena id="${escapeXml(r?.id)}">
        <idUsuario>${escapeXml(r?.idUsuario)}</idUsuario>
        <nombreAutor>${escapeXml(r?.nombreAutor || "")}</nombreAutor>
        <valoracionPropia>${escapeXml(r?.valoracionPropia)}</valoracionPropia>
        <fechaPublicado>${escapeXml(r?.fechaPublicado)}</fechaPublicado>
        <descripcion>${escapeXml(r?.descripcion)}</descripcion>${_construirCancionXml(cancion)}
    </resena>`;
}

function serializeResenasXml(reseñas = []) {
    const lista = Array.isArray(reseñas) ? reseñas : [reseñas];
    const items = lista.map(serializeResenaXml).join("");
    return `<?xml version="1.0" encoding="UTF-8"?>\n<resenas>${items}\n</resenas>`;
}

module.exports = {
    escapeXml,
    serializeResenaXml,
    serializeResenasXml,
};