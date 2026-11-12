const { Router } = require('express');
const crearDeezerController = require("../controllers/controller.deezer");

function routerDeezer(servicioDeezer) {
    const router = Router();
    const deezerCtrl = crearDeezerController(servicioDeezer);

    // Endpoint: GET /api/deezer/buscar?q=termino
    router.get("/buscar", deezerCtrl.buscar);

    return router;
}

module.exports = routerDeezer;