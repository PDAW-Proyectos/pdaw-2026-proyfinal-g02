async function crearUsuariosSemilla(servicioAuth, logger) {
    const usuarios = [
        ["admin", "admin@admin.com", "admin123", "administrador"],
        ["pepe", "pepe@gmail.com", "pepe123", "usuario"],
        ["juan", "juan@gmail.com", "juan123", "usuario"],
    ];

    let usuarioModelo = null;

    for (const [username, email, password, rol] of usuarios) {
        try {
            const creado = await servicioAuth.registrarUsuario(
                username,
                email,
                password,
                rol,
            );
            if (rol === "usuario") usuarioModelo = creado;
        } catch (error) {
            logger?.info?.(`Semilla omitida (${email}): ${error.message}`);
        }
    }

    return usuarioModelo;
}

async function crearResenasSemilla(servicioResenas, usuarioModelo, logger) {
    if (!usuarioModelo) return;

    const existentes = await servicioResenas.listarReseñas();
    if (Array.isArray(existentes) && existentes.length > 0) return;

    const canciones = [
        {
            id: "66609426",
            titulo: "Get Lucky (Radio Edit - feat. Pharrell Williams and Nile Rodgers)",
            artistas: ["Daft Punk"],
            album: "Get Lucky (Radio Edit - feat. Pharrell Williams and Nile Rodgers)",
            previewUrl:
                "https://cdnt-preview.dzcdn.net/api/1/1/1/b/f/0/1bf80a82992903ff685ba1b7275223f8.mp3?hdnea=exp=1795073586~acl=/api/1/1/1/b/f/0/1bf80a82992903ff685ba1b7275223f8.mp3*~data=user_id=0,application_id=42~hmac=afa717d1f8bd63903038b6c978788f2274e3e6858c7dbcea24f353f3ca4a2e2d",
            imagen: "https://cdn-images.dzcdn.net/images/cover/bc49adb87758e0c8c4e508a9c5cce85d/250x250-000000-80-0-0.jpg",
            duracion: 248,
        },
        {
            id: "127673047",
            titulo: "I Miss You",
            artistas: ["blink-182"],
            album: "blink-182",
            previewUrl:
                "https://cdnt-preview.dzcdn.net/api/1/1/7/f/0/0/7f072cdec829e7ee0f74d73f685bbc92.mp3?hdnea=exp=1795074928~acl=/api/1/1/7/f/0/0/7f072cdec829e7ee0f74d73f685bbc92.mp3*~data=user_id=0,application_id=42~hmac=3ea56ad1f8bc4e81882ef0fef7040f71e20eba5d7af2b468481846e560848a17",
            imagen: "https://cdn-images.dzcdn.net/images/cover/1eb33a9229dc458e5c45a84f10d3a215/250x250-000000-80-0-0.jpg",
            duracion: 227,
        },
        {
            id: "127673047",
            titulo: "I Miss You",
            artistas: ["blink-182"],
            album: "blink-182",
            previewUrl:
                "https://cdnt-preview.dzcdn.net/api/1/1/7/f/0/0/7f072cdec829e7ee0f74d73f685bbc92.mp3?hdnea=exp=1795074928~acl=/api/1/1/7/f/0/0/7f072cdec829e7ee0f74d73f685bbc92.mp3*~data=user_id=0,application_id=42~hmac=3ea56ad1f8bc4e81882ef0fef7040f71e20eba5d7af2b468481846e560848a17",
            imagen: "https://cdn-images.dzcdn.net/images/cover/1eb33a9229dc458e5c45a84f10d3a215/250x250-000000-80-0-0.jpg",
            duracion: 227,
        },
    ];

    for (const cancion of canciones) {
        try {
            await servicioResenas.crearReseña(
                usuarioModelo.id,
                cancion,
                5,
                "Reseña precargada.",
            );
        } catch (error) {
            logger?.warn?.(`Reseña semilla omitida: ${error.message}`);
        }
    }
}

async function precargarDatosIniciales({
    servicioAuth,
    servicioResenas,
    logger,
}) {
    const usuarioModelo = await crearUsuariosSemilla(servicioAuth, logger);
    await crearResenasSemilla(servicioResenas, usuarioModelo, logger);
}

module.exports = { precargarDatosIniciales };
