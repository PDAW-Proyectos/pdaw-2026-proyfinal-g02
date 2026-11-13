import { setearAuthForms, checkAuthStatus } from "./auth.js";
import { cargarNavbar } from "./navbar.js";

document.addEventListener("DOMContentLoaded", async() => {
    const user = await checkAuthStatus();
    cargarNavbar(user);
    setearAuthForms();

    cargarReseñasPopulares();
    cargarUltimasReseñas();
});

async function cargarReseñasPopulares() {
    const grid = document.getElementById('popular-reviews-grid');
    if (!grid) return; 

    try {
        const response = await fetch('/api/resenas/populares?limit=3');
        if (!response.ok) throw new Error('Error al obtener reseñas populares');
        
        const reseñas = await response.json();

        if (reseñas && reseñas.length > 0) {
            grid.innerHTML = reseñas.map(item => `
                <div class="col-4 col-md-3">
                    <a href="/reseña.html?id=${item.id}" class="album-card">
                        <img src="${item.cancion?.imagen || item.portadaUrl || '/img/default-album.jpg'}" alt="Portada del álbum" loading="lazy">
                    </a>
                </div>
            `).join('');
        }
    } catch (error) {
        console.error('No se pudieron cargar las reseñas populares:', error);
    }
}