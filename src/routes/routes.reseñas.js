const { Router } = require('express');
const crearResenasController = require("../controllers/controller.reseñas");

module.exports = function (servicioReseñas, middlewareAutenticacion) {
    const router = Router();
    const resenasCtrl = crearResenasController(servicioReseñas);

    // Rutas públicas
    router.get("/", resenasCtrl.listar);

    // Rutas protegidas
    router.post("/", middlewareAutenticacion.requiereAutenticacion, resenasCtrl.crear);
    router.put("/:id", middlewareAutenticacion.requiereAutenticacion, resenasCtrl.actualizar);
    router.delete("/:id", middlewareAutenticacion.requiereAutenticacion, resenasCtrl.eliminar);

    return router;
};