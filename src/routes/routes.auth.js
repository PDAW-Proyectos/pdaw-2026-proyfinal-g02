const { Router } = require('express');
const crearControladorAuth = require("../controllers/controller.auth")

function routerAuth(servicios, middlewareAutenticacion) {
  const {auth} = servicios
  const {requiereAutenticacion} = middlewareAutenticacion  

  const router = Router();
  const controladorAuth = crearControladorAuth(auth);

  router.post('/register', controladorAuth.register);
  router.post('/login', controladorAuth.login);
  router.post('/logout', controladorAuth.logout);
  router.get('/me', requiereAutenticacion, controladorAuth.me);

  return router;
};

module.exports = routerAuth