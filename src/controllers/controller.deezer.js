function crearDeezerController(servicioDeezer) {
    return {
        buscar: async (req, res, next) => {
            try {
                const termino = req.query.q;
                const canciones = await servicioDeezer.buscarCanciones(termino);
                res.json(canciones);
            } catch (error) {
                next(error);
            }
        },
        topGlobal: async (req, res) => {
            try {
                const canciones = await servicioDeezer.obtenerTopGlobal();
                res.json(canciones);
            } catch (error) {
                next(error)
            }
        }
    };
}

module.exports = crearDeezerController;