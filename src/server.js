import express from 'express';
import cors from 'cors';
import reseñasRouter from './routes/reseñas.js';
import { errorHandler } from './middlewares/errorHandler.js';

const app = express();

// Middlewares esenciales
app.use(cors());
app.use(express.json());

// Montamos las rutas de la API bajo el prefijo /api/reseñas
app.use('/api/reseñas', reseñasRouter);

// Middleware global de errores
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});