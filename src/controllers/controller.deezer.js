function crearDeezerController(servicioDeezer) {
    return {
        buscar: async (req, res) => {
            try {
                const termino = req.query.q;
                const canciones = await servicioDeezer.buscarCanciones(termino);
                res.json(canciones);
            } catch (error) {
                next(error);
            }
        }
    };
}

module.exports = crearDeezerController;