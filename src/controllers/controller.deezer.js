function crearDeezerController(servicioDeezer) {
    return {
        buscar: async (req, res) => {
            try {
                const termino = req.query.q;
                const canciones = await servicioDeezer.buscarCanciones(termino);
                res.json(canciones);
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        },
        topGlobal: async (req, res) => {
            try {
                const canciones = await servicioDeezer.obtenerTopGlobal();
                res.json(canciones);
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        }
    };
}

module.exports = crearDeezerController;