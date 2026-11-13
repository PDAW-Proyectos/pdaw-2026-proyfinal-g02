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
    router.delete("/:id", requiereAutenticacion, controlador.eliminar);
    router.patch("/:id/ban", requiereAutenticacion, soloAdmin, controlador.cambiarEstadoBan);
    router.post("/:id/seguir", requiereAutenticacion, controlador.seguir);
    router.delete("/:id/seguir", requiereAutenticacion, controlador.dejarDeSeguir);

    router.post("/favoritas/:idReseña", requiereAutenticacion, controlador.agregarFavorita);
    router.delete("/favoritas/:idReseña", requiereAutenticacion, controlador.quitarFavorita);

    return router;
}

module.exports = routerUsuarios;