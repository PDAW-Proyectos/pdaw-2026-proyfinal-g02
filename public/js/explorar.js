document.addEventListener("DOMContentLoaded", () => {
    cargarTopGlobal();
});

async function cargarTopGlobal() {
    const contenedor = document.getElementById("contenedor-resultados");
    
    try {
        const response = await fetch('/api/deezer/topGlobal');
        if (!response.ok) throw new Error("Error al cargar el top global");

        const canciones = await response.json();
        renderizarCanciones(canciones);
    } catch (error) {
        console.error(error);
        contenedor.innerHTML = `<p class="text-center text-danger">No se pudo cargar la música en este momento.</p>`;
    }
}

function renderizarCanciones(canciones) {
    const contenedor = document.getElementById("contenedor-resultados");
    contenedor.innerHTML = "";

    if (canciones.length === 0) {
        contenedor.innerHTML = `<p class="text-center text-secondary">No se encontraron canciones.</p>`;
        return;
    }

    canciones.forEach(cancion => {
       const tarjetaHTML = `
            <div class="review-card explore-card mb-4 p-3 d-flex align-items-center">
                <div class="img-explorar rounded overflow-hidden flex-shrink-0 me-4">
                    <img src="${cancion.imagen || ''}" alt="${cancion.titulo}" class="w-100 h-100 object-fit-cover">
                </div>
        
                <div class="flex-grow-1 text-center">
                    <h5 class="card-title fw-bold mb-1 text-white">${cancion.titulo}</h5>
                    <p class="text-secondary small mb-1">${cancion.artistas.join(', ')}</p>
                    <p class="text-secondary small mb-1">${cancion.album || 'Álbum desconocido'}</p>
                </div>
            </div>
        `;

        contenedor.innerHTML += tarjetaHTML;
    });
}
