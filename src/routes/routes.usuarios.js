const { Router } = require('express');
const crearControladorUsuarios = require("../controllers/controller.usuarios");

function routerUsuarios(servicioUsuarios, middlewares) {
    const { requiereAutenticacion, soloAdmin } = middlewares.autenticacion;
    const router = Router();
    const controlador = crearControladorUsuarios(servicioUsuarios);

    // Rutas protegidas
    router.get("/", requiereAutenticacion, soloAdmin, controlador.listarTodos);
    router.get("/:id", requiereAutenticacion, controlador.obtenerPorId);
    router.put("/:id", requiereAutenticacion, controlador.actualizar);
    router.patch("/:id/ban", requiereAutenticacion, soloAdmin, controlador.cambiarEstadoBan);
    router.delete("/:id", requiereAutenticacion, controlador.eliminar);

    return router;
}

module.exports = routerUsuarios;