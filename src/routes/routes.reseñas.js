const { Router } = require('express');
const crearResenasController = require("../controllers/controller.reseñas");

module.exports = function (servicios, middlewareAutenticacion) {
    const router = Router();
    const resenasCtrl = crearResenasController(servicios.reseñas, servicios.deezer);

    // Rutas públicas
    router.get("/", resenasCtrl.listar);
    router.get("/usuario/:idUsuario", resenasCtrl.listarPorUsuario);
    router.get("/ultimas", resenasCtrl.listarUltimas);
    router.get("/populares", resenasCtrl.listarPopulares);
    router.get('/:id', resenasCtrl.obtenerPorId);

    // Rutas protegidas
    router.post("/", middlewareAutenticacion.requiereAutenticacion, resenasCtrl.crear);
    router.put("/:id", middlewareAutenticacion.requiereAutenticacion, resenasCtrl.actualizar);
    router.delete("/:id", middlewareAutenticacion.requiereAutenticacion, resenasCtrl.eliminar);

    return router;
};