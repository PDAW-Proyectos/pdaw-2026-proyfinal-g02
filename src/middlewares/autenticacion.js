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
    
    function soloAdmin(req, res, next) {
    if (!req.user) {
        return res.status(401).json({ error: "No autenticado." });
    }

    if (req.user.rol !== "administrador") {
        return res.status(403).json({ error: "Acceso denegado. Se requiere rol de administrador." });
    }

    next();
}
    
    return { autenticar, requiereAutenticacion, soloAdmin };
}

module.exports = autenticacion