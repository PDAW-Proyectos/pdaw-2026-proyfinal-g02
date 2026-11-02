# Beatácora

> Beatácora es un sitio web donde los usuarios pueden llevar un registro de las canciones que escuchan mediante reseñas con valoraciones y compartirlo con la comunidad.

Proyecto del equipo **[Grupo-02]** para *7513 · Proyecto de Desarrollo de Aplicaciones Web*
(Tecnicatura Universitaria en Programación Web y Móvil — DCIC — UNS).

## Ficha del proyecto

| Aspecto                     | Descripción                                    |
| --------------------------- | ---------------------------------------------  |
| Problema                    | Llevar un registro de canciones escuchadas     |
| Usuarios                    | Personas que disfruten de la música            |
| Funcionalidades núcleo      | 1. Crear reseña de canción                     |
|                             | 2. Valorar cancion                             |
|                             | 3. Buscar artistas y canciones para valorar    |
| Reglas de negocio           | 1. Valoracion del 1 al 5                       |
|                             | 2. Una reseña por canción                      |
|                             | 3. No se puede dar like a reseñas propias      |
| API externa                 | Deezer API (https://developers.deezer.com/api). Uso: obtener información de canciones, artistas y albumes |

## Equipo y roles del sprint actual

| Integrante      | Usuario de GitHub   | Rol en el sprint     |
| ----------      | -----------------   | -------------------- |
| Martín Becchio  |  tinchobecchio      | Repositorio          |
| Santiago Gómez  |  santigomez89       | Calidad              |
| Fabricio Armeni |  FabriArmeni        | Referente de producto|
|                 |                     | Facilitación         |


## Cómo ejecutar el proyecto

```bash
npm install
cp .env.example .env
npm run dev
```

## Cómo ejecutar las pruebas

```bash
npm test
```

## Documentación

- Diagramas y wireframes: [`docs/`](docs/)
- Acuerdos de trabajo y convenciones: [`CONTRIBUTING.md`](CONTRIBUTING.md)
- Riesgos: [`docs/riesgos.md`](docs/riesgos.md)
- Contrato de la API: https://developers.deezer.com/guidelines

## Endpoints

| Método | Endpoint | Descripción | Código de Éxito | Códigos de Error |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Registra un nuevo usuario (regular o administrador) mediante ServicioAuth. | **201 Created** | `400`, `500` |
| `POST` | `/api/auth/login` | Inicia sesión validando credenciales y generando sesión. | **200 OK** | `400`, `401`, `500` |
| `GET` | `/api/usuarios` | Obtiene el listado completo de usuarios del repositorio. | **200 OK** | `500` |
| `GET` | `/api/usuarios/:id` | Busca y devuelve un usuario específico por su ID. | **200 OK** | `404`, `500` |
| `PUT` | `/api/usuarios/:id` | Actualiza los datos o atributos de un usuario existente. | **200 OK** | `400`, `404`, `500` |
| `DELETE` | `/api/usuarios/:id` | Elimina un usuario del sistema. | **204 No Content** | `404`, `500` |

## Uso de herramientas de IA

Registrar aquí qué herramientas se usaron, para qué tareas y qué se adoptó de sus propuestas.

| Fecha | Herramienta | Tarea | Qué se adoptó y por qué |
| ----- | ----------- | ----- | ----------------------- |
|       |             |       |                         |
