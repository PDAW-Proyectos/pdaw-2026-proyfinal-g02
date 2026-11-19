// modalReseña.js
export function inicializarModalReseña() {
    const resenaModal = document.getElementById('resenaModal');
    if (!resenaModal) return;

    // resenaModal.addEventListener('show.bs.modal', (event) => {
    //     const button = event.relatedTarget;
    //     if (!button) return;

    //     const modo = button.getAttribute('data-modo'); // 'editar' o null (crear)
    //     const titulo = button.getAttribute('data-titulo');
    //     const artistas = button.getAttribute('data-artistas');
    //     const imagen = button.getAttribute('data-imagen');
    //     const preview = button.getAttribute('data-preview');
    //     const album = button.getAttribute('data-album');

    //     // Textos y elementos visuales comunes de la canción
    //     document.getElementById('modalCancionTitulo').textContent = titulo;
    //     document.getElementById('modalCancionArtista').textContent = `${artistas} ${album ? '— ' + album : ''}`;
    //     document.getElementById('modalCancionImg').src = imagen || '/img/default-album.jpg';

    //     const audioElement = document.getElementById('modalAudioPreview');
    //     if (preview) {
    //         audioElement.src = preview;
    //         audioElement.style.display = 'block';
    //     } else {
    //         audioElement.src = '';
    //         audioElement.style.display = 'none';
    //     }

    //     // Identificamos el título del modal y el formulario
    //     const modalTitle = resenaModal.querySelector('.modal-title');
    //     const form = document.getElementById('resenaFormModal');

    //     if (modo === 'editar') {
    //         // Modo Edición
    //         modalTitle.innerHTML = `<i class="fa-solid fa-pen text-warning me-2"></i>Editar Bitácora`;
            
    //         const resenaId = button.getAttribute('data-resena-id');
    //         const valoracion = button.getAttribute('data-valoracion');
    //         const descripcion = button.getAttribute('data-descripcion');

    //         // Rellenamos con los datos actuales
    //         document.getElementById('modalValoracion').value = valoracion;
    //         document.getElementById('modalDescripcion').value = descripcion;
            
    //         // Guardamos el ID de la reseña en el formulario para usarlo al enviar
    //         form.dataset.modo = 'editar';
    //         form.dataset.resenaId = resenaId;
    //     } else {
    //         // Modo Creación (por defecto)
    //         modalTitle.innerHTML = `<i class="fa-solid fa-pen-nib text-success me-2"></i>Escribir Bitácora`;
    //         form.reset();
            
    //         const idCancion = button.getAttribute('data-id');
    //         document.getElementById('modalCancionId').value = idCancion;
            
    //         delete form.dataset.modo;
    //         delete form.dataset.resenaId;
    //     }
    // });

    resenaModal.addEventListener('show.bs.modal', (event) => {
        const button = event.relatedTarget;
        if (!button) return;

        const modo = button.getAttribute('data-modo');
        const titulo = button.getAttribute('data-titulo');
        const artistas = button.getAttribute('data-artistas');
        const imagen = button.getAttribute('data-imagen');
        const preview = button.getAttribute('data-preview'); // <--- Capturamos el preview

        // Textos comunes
        document.getElementById('modalCancionTitulo').textContent = titulo;
        document.getElementById('modalCancionArtista').textContent = artistas;
        document.getElementById('modalCancionImg').src = imagen || '/img/default-album.jpg';

        // 🎵 Configuración del reproductor de audio (para que aparezca siempre)
        const audioElement = document.getElementById('modalAudioPreview');
        if (preview) {
            audioElement.src = preview;
            audioElement.style.display = 'block';
        } else {
            audioElement.src = '';
            audioElement.style.display = 'none';
        }

        const modalTitle = resenaModal.querySelector('.modal-title');
        const form = document.getElementById('resenaFormModal');

        if (modo === 'editar') {
            modalTitle.innerHTML = `<i class="fa-solid fa-pen text-warning me-2"></i>Editar Bitácora`;
            
            const resenaId = button.getAttribute('data-resena-id');
            const valoracion = button.getAttribute('data-valoracion');
            const descripcion = button.getAttribute('data-descripcion');

            document.getElementById('modalValoracion').value = valoracion;
            document.getElementById('modalDescripcion').value = descripcion;
            
            form.dataset.modo = 'editar';
            form.dataset.resenaId = resenaId;
        } else {
            modalTitle.innerHTML = `<i class="fa-solid fa-pen-nib text-success me-2"></i>Escribir Bitácora`;
            form.reset();
            
            const idCancion = button.getAttribute('data-id');
            document.getElementById('modalCancionId').value = idCancion;
            
            delete form.dataset.modo;
            delete form.dataset.resenaId;
        }
    });

    resenaModal.addEventListener('hidden.bs.modal', () => {
        const audioElement = document.getElementById('modalAudioPreview');
        audioElement.pause();
        audioElement.currentTime = 0;
    });

    // Envío del formulario (maneja tanto POST como PUT)
    const resenaFormModal = document.getElementById('resenaFormModal');
    if (resenaFormModal && !resenaFormModal.dataset.listenerAgregado) {
        resenaFormModal.dataset.listenerAgregado = "true";

        resenaFormModal.addEventListener('submit', async (e) => {
            e.preventDefault();

            const esEdicion = resenaFormModal.dataset.modo === 'editar';
            const valoracionPropia = parseInt(document.getElementById('modalValoracion').value);
            const descripcion = document.getElementById('modalDescripcion').value.trim();

            let url = '/api/resenas';
            let method = 'POST';
            let bodyData = {};

            if (esEdicion) {
                const resenaId = resenaFormModal.dataset.resenaId;
                url = `/api/resenas/${resenaId}`;
                method = 'PUT'; // o PATCH según tu backend
                bodyData = { valoracionPropia, descripcion };
            } else {
                const cancionId = document.getElementById('modalCancionId').value;
                bodyData = { cancionId, valoracionPropia, descripcion };
            }

            try {
                const response = await fetch(url, {
                    method: method,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(bodyData)
                });

                const data = await response.json();
                if (!response.ok) throw new Error(data.error || 'Error al procesar la reseña.');

                alert(esEdicion ? '¡Reseña actualizada con éxito!' : '¡Reseña publicada con éxito!');
                
                const modalInstance = bootstrap.Modal.getInstance(resenaModal);
                modalInstance.hide();
                window.location.reload(); // Recarga para ver los cambios reflejados
            } catch (error) {
                console.error('Error:', error);
                alert(error.message);
            }
        });
    }
}