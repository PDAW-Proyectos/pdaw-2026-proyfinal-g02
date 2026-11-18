# Guía de uso
Beatácora · [http://localhost:3000] · v1.0.0

## ¿Para quién es?
Beatácora es un sitio web donde los usuarios pueden llevar un registro de las canciones que escuchan mediante reseñas con valoraciones y compartirlo con la comunidad.

## Primeros pasos
1. Levantá el servidor local ejecutando en la terminal :
                        "npm install" 
                        "cp .env.example .env" 
                        "npm run dev."
    Luego abrí `http://localhost:3000` en tu navegador.
2. En la pantalla principal ya podés explorar el feed de reseñas recientes o populares sin necesidad de configurar nada previo.
3.  **Acceso de prueba:** Al iniciar el servidor se crean automáticamente las siguientes cuentas para probar todas las funciones:
   * **Admin de prueba:** `admin@admin.com` / Contraseña: `123456`
   * **Usuario de prueba:** `usuario@usuario.com` / Contraseña: `123456`

## Tareas principales

### Explorar canciones, escuchar vistas previas y generar reseñas
1. Dirigite a la sección de **Explorar** (o utilizá la barra de búsqueda en la parte superior).
2. Buscá el título de una canción.
3. Hacé clic en el botón de **Reseñar** en la tarjeta de la canción y ahi te abre un modal para escuchar un fragmento de vista previa del audio directamente desde el navegador.

* **Si algo sale mal:**
  * *"No se encontraron resultados para tu búsqueda"*: Verificá que el nombre de la canción o del artista esté bien escrito o probá con una palabra clave más corta.
  * *ExternalServiceError*: Algunas canciones del catálogo externo pueden no tener un fragmento de vista previa disponible; probá con otro tema de la lista.