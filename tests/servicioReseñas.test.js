const ServicioReseñas = require("../src/services/ServicioReseñas");
const RepositorioReseñas = require("../src/repositories/RepositorioReseñas");
const Cancion = require("../src/models/Cancion");
const { crearCarpetaTemporal } = require("../src/utils/utilidades");

describe("Servicio de Reseñas - Lógica de Negocio", () => {
    let servicio;
    let repositorio;
    let cancionEjemplo;

    beforeEach(async () => {
        const ruta = await crearCarpetaTemporal();
        repositorio = new RepositorioReseñas(ruta);
        await repositorio.cargar();
        
        servicio = new ServicioReseñas(repositorio);

        cancionEjemplo = new Cancion(
            "track123",
            "Get Lucky",
            ["Daft Punk"],
            "Random Access Memories",
            "https://preview",
            "https://imagen",
            240
        );
    });

    test("Debería crear una reseña exitosamente si los datos son válidos", async () => {
        const reseñaCreada = await servicio.crearReseña("user1", cancionEjemplo, 4, "Muy buen tema");

        expect(reseñaCreada).toBeDefined();
        expect(reseñaCreada.valoracionPropia).toBe(4);
        expect(repositorio.listar().length).toBe(1);
    });

    test("Debería lanzar error si el usuario no está autenticado", async () => {
        await expect(
            servicio.crearReseña(null, cancionEjemplo, 5, "Buenardo")
        ).rejects.toThrow("Debe estar autenticado para crear una reseña.");
    });

    test("Debería lanzar error si la valoración está fuera del rango 1-5", async () => {
        await expect(
            servicio.crearReseña("user1", cancionEjemplo, 6, "Exagerada")
        ).rejects.toThrow("La valoración propia debe ser un número entre 1 y 5.");

        await expect(
            servicio.crearReseña("user1", cancionEjemplo, 0, "Inválida")
        ).rejects.toThrow("La valoración propia debe ser un número entre 1 y 5.");
    });

    test("Debería lanzar error si la descripción está vacía", async () => {
        await expect(
            servicio.crearReseña("user1", cancionEjemplo, 3, "   ")
        ).rejects.toThrow("La descripción de la reseña no puede estar vacía.");
    });

    test("Debería permitir actualizar la reseña solo si el usuario es el dueño", async () => {
        const creada = await servicio.crearReseña("user1", cancionEjemplo, 3, "Normal");

        // Intento de actualizar por usuario ajeno
        await expect(
            servicio.actualizarReseña(creada.id, "user2", { valoracionPropia: 5 })
        ).rejects.toThrow("No tenés permisos para modificar esta reseña.");

        // Actualización exitosa por el dueño
        const actualizado = await servicio.actualizarReseña(creada.id, "user1", { descripcion: "Actualizado" });
        expect(actualizado.descripcion).toBe("Actualizado");
    });

    test("Debería permitir eliminar la reseña al dueño o a un administrador", async () => {
        const creada = await servicio.crearReseña("user1", cancionEjemplo, 5, "A borrar");

        // Usuario ajeno sin ser admin falla
        await expect(
            servicio.eliminarReseña(creada.id, "user2", false)
        ).rejects.toThrow("No tenés permisos para eliminar esta reseña.");

        // Administrador puede borrar aunque no sea el dueño
        const borradoAdmin = await servicio.eliminarReseña(creada.id, "user99", true);
        expect(borradoAdmin).toBe(true);
    });
});