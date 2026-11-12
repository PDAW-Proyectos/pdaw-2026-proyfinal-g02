const { Router } = require('express');
const crearResenasController = require("../controllers/controller.reseñas");

module.exports = function (servicioReseñas, middlewareAutenticacion) {
    const router = Router();
    const resenasCtrl = crearResenasController(servicioReseñas);

    // Rutas públicas
    router.get("/", resenasCtrl.listar);
    router.get("/usuario/:idUsuario", resenasCtrl.listarPorUsuario);
    router.get("/ultimas", resenasCtrl.listarUltimas);
    router.get("/populares", resenasCtrl.listarPopulares);

    // Rutas protegidas
    router.post("/", middlewareAutenticacion.requiereAutenticacion, resenasCtrl.crear);
    router.put("/:id", middlewareAutenticacion.requiereAutenticacion, resenasCtrl.actualizar);
    router.delete("/:id", middlewareAutenticacion.requiereAutenticacion, resenasCtrl.eliminar);

    return router;
};