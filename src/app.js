import { api, ApiError } from '../services/api.js';

const statusContainer = document.querySelector('#status-container');
const listaReseñas = document.querySelector('#lista-reseñas');
const template = document.querySelector('#template-reseña');

// Función principal para cargar y renderizar las reseñas
export async function cargarReseñas() {
  // 1. Estado: CARGANDO
  statusContainer.textContent = 'Cargando las últimas reseñas...';
  listaReseñas.replaceChildren(); 

  try {
    // Petición a la API usando el cliente que creaste
    const reseñas = await api('/api/reseñas');

    // 2. Estado: VACÍO (si no hay reseñas cargadas)
    if (!reseñas || reseñas.length === 0) {
      statusContainer.textContent = 'Aún no hay reseñas cargadas. ¡Sé el primero en calificar un álbum!';
      return;
    }

    // 3. Estado: ÉXITO (limpiar mensaje y renderizar elementos con textContent)
    statusContainer.textContent = ''; 

    const items = reseñas.map(reseñas => {
      const clone = template.content.cloneNode(true);

      // Asignación segura con textContent (previene XSS)
      clone.querySelector('.titulo-cancion').textContent = reseñas.albumTitle;
      clone.querySelector('.nombre-artista').textContent = reseñas.artist;
      clone.querySelector('.valoracion-estrellas').textContent = `★ ${reseñas.rating}/5`;
      clone.querySelector('.texto-reseña').textContent = reseñas.comment;
      clone.querySelector('.author-cancion').textContent = `Por @${reseñas.username}`;

      return clone;
    });

    // Reemplaza todo el contenido de una sola vez
    listaReseñas.replaceChildren(...items);

  } catch (err) {
    // 4. Estado: ERROR (manejar problemas de red o del servidor)
    if (err instanceof ApiError) {
      statusContainer.textContent = `Error al obtener las reseñas: ${err.message}`;
    } else {
      statusContainer.textContent = 'Ocurrió un fallo inesperado al cargar la lista.';
    }
  }
}


const form = document.querySelector('#template-reseña');

if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault(); 

    const formData = new FormData(form);
    const nuevaReseña = {
      tituloCancion: formData.get('tituloCancion'),
      artista: formData.get('artista'),
      rating: Number(formData.get('rating')),
      reseña: formData.get('reseña')
    };

    try {
      
      await api('/api/reseñas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuevaReseña)
      });

      
      form.reset();
      alert('¡Reseña publicada con éxito!');
      
     
      cargarReseñas();

    } catch (err) {
     
      if (err instanceof ApiError) {
        alert(`No se pudo publicar: ${err.message}`);
      } else {
        alert('Ocurrió un error inesperado al enviar la reseña.');
      }
    }
  });
}