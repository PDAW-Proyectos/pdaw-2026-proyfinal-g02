document.addEventListener("DOMContentLoaded", () => {
    const contenedorResultados = document.querySelector("#contenedor-resultados");
    const linkTopGlobal = document.querySelector("#tab-top-global"); // El botón o solapa de novedades

    async function cargarTopGlobal() {
        try {
            const response = await fetch('/api/deezer/topGlobal');
            if (!response.ok) throw new Error("Error al cargar el top global");

            const canciones = await response.json();

            contenedorResultados.innerHTML = ""; // Limpiamos contenedor

            if (canciones.length === 0) {
                contenedorResultados.innerHTML = `<p class="text-center text-secondary py-4">No hay canciones disponibles.</p>`;
                return;
            }

            // Recorremos las canciones modeladas y armamos las tarjetas
            canciones.forEach(cancion => {
                const tarjetaHTML = `
    <div class="review-card explore-card mb-4 p-3">
        <div class="row align-items-center">
            <!-- Columna para la imagen a la izquierda -->
            <div class="col-auto">
                <div class="img-explorar rounded d-flex align-items-center justify-content-center text-secondary overflow-hidden">
                    <img src="${cancion.imagen || ''}" alt="${cancion.titulo}" class="w-100 h-100 object-fit-cover">
                </div>
            </div>
            
            <!-- Columna para el texto que ocupa el resto y se centra -->
            <div class="col text-center">
                <h5 class="card-title fw-bold mb-1 text-white">${cancion.titulo}</h5>
                <p class="text-secondary small mb-1">${cancion.artistas.join(', ')}</p>
                <p class="text-secondary small mb-1">${cancion.album || 'Álbum desconocido'}</p>
            </div>
        </div>
    </div>
`;

                contenedorResultados.innerHTML += tarjetaHTML;
            });

        } catch (error) {
            console.error("Error:", error);
            contenedorResultados.innerHTML = `<p class="text-center text-danger py-4">Error al conectar con el servidor.</p>`;
        }
    }

    // Si el usuario hace clic en la solapa "Novedades"
    if (linkTopGlobal) {
        linkTopGlobal.addEventListener("click", (e) => {
            e.preventDefault();
            cargarTopGlobal();
        });
    }
});