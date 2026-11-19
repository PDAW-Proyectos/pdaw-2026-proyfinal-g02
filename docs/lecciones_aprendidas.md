# Lecciones Aprendidas

## 1. Integración de APIs externas

* **Desacoplar el proveedor externo:** Encapsular las consultas a Deezer en una clase de servicio (`ServicioDeezer`) y transformar sus respuestas a un modelo propio (`Cancion`) evitó que los cambios o estructuras del JSON externo impactaran directamente en las vistas y controladores.
* **Contemplar respuestas vacías y errores silenciosos:** Aprendimos que una búsqueda sin coincidencias (`[]`) no es un error del servidor, sino un estado válido que debe comunicarse de forma clara en la interfaz, y que las APIs externas pueden devolver mensajes de error incluso con códigos HTTP exitosos.

## 2. Organización modular en el *frontend* y consistencia visual

* **Reutilización de componentes con ES Modules:** Dividir la lógica del cliente en módulos específicos (`navbar.js`, `footer.js`, `auth.js`, `modalReseña.js`) facilitó mantener un comportamiento uniforme entre distintas vistas (`index.html`, `explorar.html`, etc.) sin duplicar código.
* **Cuidar el contexto de carga entre vistas:** Comprobamos que compartir scripts dinámicos exige verificar también que todas las páginas carguen las mismas hojas de estilo, fuentes e íconos en el mismo orden y validen la existencia de elementos del DOM antes de manipularlos.

## 3. Arquitectura por capas

* **Separación de responsabilidades:** Si bien al principio nos costó acostumbrarnos a dividir la lógica, mantener bien delimitadas las rutas, controladores, servicios y modelos simplificó mucho la depuración de errores, evitó duplicar código y facilitó trabajar en paralelo entre el *backend* y el *frontend* sin pisarnos.

## 4. Trabajo colaborativo y documentación

* **Comunicación y definición temprana del alcance:** Este fue uno de los puntos que más nos costó. La poca comunicación durante las primeras semanas, sumada a un cambio de idea inicial del proyecto, nos generó retrasos respecto a los tiempos de entrega de la cátedra. Aprendimos la importancia de definir el alcance desde el arranque y mantener una sincronización constante en el equipo.
* **Documentar en paralelo al desarrollo:** Debido a la falta de tiempo sobre el cierre, gran parte de la documentación tuvo que completarse de forma acelerada, lo que pudo dejar algunos puntos con menor nivel de detalle o claridad. Como aprendizaje, entendimos que documentar decisiones, *endpoints* y avances de forma continua durante el desarrollo evita cuellos de botella en las entregas finales.