function crearControladorUsuarios(servicioUsuarios) {
    
    return {
        async listarTodos(req, res) {
            try {
                const usuarios = servicioUsuarios.listarTodos();
                res.json(usuarios);
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        },

        async obtenerPorId(req, res) {
            try {
                const { id } = req.params;
                const usuario = servicioUsuarios.obtenerPorId(id);
                res.json(usuario);
            } catch (error) {
                const status = error.message.includes("no encontrado") ? 404 : 500;
                res.status(status).json({ error: error.message });
            }
        },

        async actualizar(req, res) {
            try {
                const { id } = req.params;
                const usuarioActualizado = await servicioUsuarios.actualizar(id, req.body, req.user);
                res.json({
                    mensaje: "Usuario actualizado con éxito",
                    usuario: usuarioActualizado
                });
            } catch (error) {
                const status = error.message.includes("permisos") ? 403 : 400;
                res.status(status).json({ error: error.message });
            }
        },

        async cambiarEstadoBan(req, res) {
            try {
                const { id } = req.params;
                const { estaBaneado } = req.body;
                const usuarioActualizado = await servicioUsuarios.cambiarEstadoBan(id, estaBaneado);
                res.json({
                    mensaje: `Usuario ${usuarioActualizado.estaBaneado ? "baneado" : "desbaneado"} correctamente.`,
                    usuario: usuarioActualizado
                });
            } catch (error) {
                res.status(400).json({ error: error.message });
            }
        },

        async eliminar(req, res) {
            try {
                const { id } = req.params;
                await servicioUsuarios.eliminar(id, req.user);
                res.json({ mensaje: "Usuario eliminado correctamente." });
            } catch (error) {
                const status = error.message.includes("permisos") ? 403 : 500;
                res.status(status).json({ error: error.message });
            }
        },

        async seguir(req, res) {
            try {
                const { id: idTarget } = req.params; // A quién quiero seguir
                const idLogueado = req.user.id;      // Quién está haciendo la acción
                
                await servicioUsuarios.seguir(idLogueado, idTarget);
                res.json({ mensaje: "Ahora seguís a este usuario con éxito." });
            } catch (error) {
                res.status(400).json({ error: error.message });
            }
        },

        async dejarDeSeguir(req, res) {
            try {
                const { id: idTarget } = req.params;
                const idLogueado = req.user.id;
                
                await servicioUsuarios.dejarDeSeguir(idLogueado, idTarget);
                res.json({ mensaje: "Dejaste de seguir a este usuario." });
            } catch (error) {
                res.status(400).json({ error: error.message });
            }
        }
    };
}

module.exports = crearControladorUsuarios;