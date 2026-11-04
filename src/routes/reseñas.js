import { Router } from 'express';
import { ValidationError } from '../errors/AppError.js';

const router = Router();

// Simulamos una base de datos en memoria para arrancar
let reseñasMemoria = [];

// GET: Obtener todas las reseñas de canciones
router.get('/', (req, res) => {
  res.json(reseñasMemoria);
});

// POST: Crear una nueva reseña
router.post('/', (req, res, next) => {
  try {
    const { tituloCancion, artista, rating, reseña } = req.body;

    // Validamos que estén todos los campos obligatorios
    if (!tituloCancion || !artista || !rating || !reseña) {
      throw new ValidationError('Todos los campos son obligatorios para publicar la reseña.');
    }

    if (rating < 1 || rating > 5) {
      throw new ValidationError('El puntaje (rating) debe ser un número entre 1 y 5.');
    }

    const nuevaReseña = {
      id: Date.now().toString(),
      tituloCancion,
      artista,
      rating: Number(rating),
      reseña,
      username: 'fabricio', 
      createdAt: new Date().toISOString()
    };

    reseñasMemoria.unshift(nuevaReseña);
    res.status(201).json(nuevaReseña);

  } catch (err) {
    next(err); 
  }
});

export default router;