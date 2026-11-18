function crearControladorUsuarios(servicioUsuarios) {
    
    return {
        async listarTodos(req, res, next) {
            try {
                const usuarios = servicioUsuarios.listarTodos();
                res.json(usuarios);
            } catch (error) {
                next(error);
            }
        },

        async obtenerPorId(req, res, next) {
            try {
                const { id } = req.params;
                const usuario = servicioUsuarios.obtenerPorId(id);
                res.json(usuario);
            } catch (error) {
                next(error);
            }
        },

        async actualizar(req, res, next) {
            try {
                const { id } = req.params;
                const usuarioActualizado = await servicioUsuarios.actualizar(id, req.body, req.user);
                res.json({
                    mensaje: "Usuario actualizado con éxito",
                    usuario: usuarioActualizado
                });
            } catch (error) {
                next(error);
            }
        },

        async cambiarEstadoBan(req, res, next) {
            try {
                const { id } = req.params;
                const { estaBaneado } = req.body;
                const usuarioActualizado = await servicioUsuarios.cambiarEstadoBan(id, estaBaneado);
                res.json({
                    mensaje: `Usuario ${usuarioActualizado.estaBaneado ? "baneado" : "desbaneado"} correctamente.`,
                    usuario: usuarioActualizado
                });
            } catch (error) {
                next(error);
            }
        },

        async eliminar(req, res, next) {
            try {
                const { id } = req.params;
                await servicioUsuarios.eliminar(id, req.user);
                res.json({ mensaje: "Usuario eliminado correctamente." });
            } catch (error) {
                next(error);
            }
        },

        async seguir(req, res, next) {
            try {
                const { id: idTarget } = req.params; // A quién quiero seguir
                const idLogueado = req.user.id;      // Quién está haciendo la acción
                
                await servicioUsuarios.seguir(idLogueado, idTarget);
                res.json({ mensaje: "Ahora seguís a este usuario con éxito." });
            } catch (error) {
                next(error);
            }
        },

        async dejarDeSeguir(req, res, next) {
            try {
                const { id: idTarget } = req.params;
                const idLogueado = req.user.id;
                
                await servicioUsuarios.dejarDeSeguir(idLogueado, idTarget);
                res.json({ mensaje: "Dejaste de seguir a este usuario." });
            } catch (error) {
                next(error);
            }
        },

        async agregarFavorita(req, res, next) {
            try {
                const { idReseña } = req.params;
                const usuarioActualizado = await servicioUsuarios.agregarFavorita(req.user.id, idReseña);
                res.json({
                    mensaje: "Reseña agregada a favoritas con éxito.",
                    usuario: usuarioActualizado
                });
            } catch (error) {
                next(error);
            }
        },

        async quitarFavorita(req, res, next) {
            try {
                const { idReseña } = req.params;
                const usuarioActualizado = await servicioUsuarios.quitarFavorita(req.user.id, idReseña);
                res.json({
                    mensaje: "Reseña eliminada de favoritas.",
                    usuario: usuarioActualizado
                });
            } catch (error) {
                next(error);
            }
        }
    };
}

module.exports = crearControladorUsuarios;