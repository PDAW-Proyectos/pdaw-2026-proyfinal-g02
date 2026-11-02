function autenticacion(repositorio) {
    //
    async function autenticar(req, res, next) {
        req.user = req.session.userId
            ? await repositorio.buscarPorId(req.session.userId)
            : null;
        next();
    }

    async function requiereAutenticacion(req, res, next) {
        req.user
            ? next()
            : res.status(401).json({ error: "Es necesario iniciar sesión" });
    }
    
    return { autenticar, requiereAutenticacion };
}

module.exports = autenticacion