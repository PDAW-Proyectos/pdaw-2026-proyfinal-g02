const Cancion = require("../models/Cancion");
const { ExternalServiceError } = require("../utils/errors.js");

class ServicioDeezer {
    async buscarCanciones(termino) {
        if (!termino || typeof termino !== "string" || !termino.trim()) {
            return [];
        }

        try {
            const url = `https://api.deezer.com/search?q=${encodeURIComponent(termino.trim())}`;
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new ExternalServiceError("Deezer");
            }

            const data = await response.json();
            
            // Deezer devuelve los resultados dentro de la propiedad 'data'
            if (!data.data || !Array.isArray(data.data)) {
                return [];
            }

            // Mapeamos cada resultado con Cancion.fromDeezer
            return data.data.map((track) => Cancion.fromDeezer(track));
        } catch (error) {
            if (error.name && error.name.includes('Error')) {
                throw error;
            }
            throw new ExternalServiceError("Deezer", error);
        }
    }

    async obtenerCancionPorId(id) {
        if (!id) return null;

        try {
            const url = `https://api.deezer.com/track/${id}`;
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new ExternalServiceError("Deezer");
            }

            const track = await response.json();
            if (!track || !track.id) return null;

            return Cancion.fromDeezer(track);
        } catch (error) {
            if (error.name && error.name.includes('ExternalServiceError')) {
                throw error;
            }
            throw new ExternalServiceError("Deezer", error);
        }
    }
}

module.exports = ServicioDeezer;