# Registro de Decisiones de Arquitectura (ADR)

## ADR-1: Delegar el catálogo musical y los audios a la API externa de Deezer

* **Estado:** Aceptada
* **Contexto:** La aplicación necesitaba contar con un catálogo amplio de canciones, portadas y fragmentos de audio reproducibles sin gestionar almacenamiento multimedia propio ni licencias de distribución.
* **Decisión:** No alojar archivos MP3 ni cargar una base de datos manual de canciones, sino consultar el catálogo y las vistas previas de 30 segundos desde la API pública de Deezer a través de una clase de servicio dedicada en el *backend* (`ServicioDeezer`).
* **Alternativas descartadas:**
  * *Carga manual de canciones y audios locales:* Descartada por alto costo de mantenimiento, tamaño de repositorio y restricciones de derechos de autor.
  * *Consumo directo desde el navegador:* Descartada por problemas de CORS y por acoplar las vistas al formato de respuesta de un tercero.
* **Consecuencias:** Definió el modelo propio `Cancion`, simplificó la gestión multimedia y evitó problemas de CORS, aunque requirió mapear el JSON externo, contemplar búsquedas sin resultados (`[]`) y respetar el límite de tráfico de la API (50 peticiones cada 5 segundos).

---

## ADR-2: Arquitectura por capas en el *backend* con persistencia en archivos JSON

* **Estado:** Aceptada
* **Contexto:** Se requería organizar el servidor en Node.js y Express de forma mantenible para trabajar en equipo y permitir que cualquier integrante levantara el entorno sin configuraciones complejas.
* **Decisión:** Estructurar el *backend* separando responsabilidades en **Rutas → Controladores → Servicios → Repositorios/Modelos**, persistiendo usuarios, reseñas y favoritos en archivos `.json` locales en lugar de montar un motor de base de datos externo.
* **Alternativas descartadas:**
  * *Base de datos relacional o NoSQL (MySQL, PostgreSQL, MongoDB):* Descartada para evitar dependencias de instalación o servicios externos en el entorno de desarrollo y evaluación.
  * *Lógica concentrada en las rutas de Express:* Descartada por dificultar el mantenimiento, las pruebas y el trabajo en paralelo.
* **Consecuencias:** Ordenó la estructura de carpetas del servidor y permitió ejecutar el proyecto localmente con un simple `npm start`, asumiendo como compromiso que la persistencia en archivos resulta adecuada para el alcance académico pero no escalaría a alta concurrencia en producción.

---

## ADR-3: *Frontend* multipágina modular con JavaScript nativo (ES Modules) y Bootstrap

* **Estado:** Aceptada
* **Contexto:** La interfaz necesitaba múltiples vistas (`index.html`, `explorar.html`, perfil, etc.) con elementos compartidos como la barra de navegación, el pie de página, el estado de sesión y el modal de reseñas.
* **Decisión:** Construir distintas vistas HTML estáticas apoyadas en Bootstrap para el diseño responsivo y dividir la lógica del cliente en módulos nativos de JavaScript (`navbar.js`, `footer.js`, `auth.js`, `modalReseña.js`).
* **Alternativas descartadas:**
  * *Frameworks SPA (React, Vue):* Descartados para evitar curvas de aprendizaje adicionales y herramientas de compilación (*bundlers*) fuera del alcance de la materia.
  * *Scripts monolíticos duplicados por página:* Descartados por generar repetición de código e inconsistencias entre vistas.
* **Consecuencias:** Permitió reutilizar componentes de interfaz y centralizar la lógica de autenticación y reseñas sin herramientas de compilación, exigiendo únicamente mantener consistentes las hojas de estilo y validar los elementos del DOM disponibles en cada vista.