const contenedor = require('./container');
const createApp = require('./app');

createApp(contenedor).listen(contenedor.config.port, () => {
  console.log(`Escuchando en http://localhost:${contenedor.config.port}`);
});