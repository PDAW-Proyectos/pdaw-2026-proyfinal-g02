const Cancion = require("../models/Cancion");

class ServicioDeezer {
    async buscarCanciones(termino) {
        if (!termino || typeof termino !== "string" || !termino.trim()) {
            return [];
        }

        try {
            const url = `https://api.deezer.com/search?q=${encodeURIComponent(termino.trim())}`;
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error("Error al comunicarse con la API de Deezer.");
            }

            const data = await response.json();
            
            // Deezer devuelve los resultados dentro de la propiedad 'data'
            if (!data.data || !Array.isArray(data.data)) {
                return [];
            }

            // Mapeamos cada resultado con Cancion.fromDeezer
            return data.data.map((track) => Cancion.fromDeezer(track));
        } catch (error) {
            console.error("Error en ServicioDeezer.buscarCanciones:", error);
            throw new Error("No se pudo realizar la búsqueda en este momento.");
        }
    }

    async obtenerCancionPorId(id) {
        if (!id) return null;

        try {
            const url = `https://api.deezer.com/track/${id}`;
            const response = await fetch(url);
            
            if (!response.ok) return null;

            const track = await response.json();
            if (!track || !track.id) return null;

            return Cancion.fromDeezer(track);
        } catch (error) {
            console.error("Error en ServicioDeezer.obtenerCancionPorId:", error);
            return null;
        }
    }
}

module.exports = ServicioDeezer;