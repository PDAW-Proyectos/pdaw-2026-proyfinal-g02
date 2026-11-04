import { AppError } from '../errors/AppError.js';

export function errorHandler(err, req, res, next) {
  const statusCode = err instanceof AppError ? err.statusCode : 500;
  const message = err.message || 'Ocurrió un error inesperado en el servidor.';

  res.status(statusCode).json({
    status: 'error',
    statusCode,
    message
  });
}