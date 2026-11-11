const RepositorioReseñas = require("../src/repositories/RepositorioReseñas");
const Cancion = require("../src/models/Cancion");
const { crearCarpetaTemporal } = require("../src/utils/utilidades");

describe("Repositorio de Reseñas - CRUD y Persistencia", () => {
    let repositorio;
    let repo2;
    let cancionEjemplo;

    beforeEach(async () => {
        const ruta = await crearCarpetaTemporal();    
        repositorio = new RepositorioReseñas(ruta);
        repo2 = new RepositorioReseñas(ruta);
        const c = {
            id: "track123",
            titulo: "Bohemian Rhapsody",
            artistas: ["Queen"],
            album: "A Night at the Opera",
            previewUrl: "https://preview.url",
            imagen: "https://imagen.url",
            duracion: 354
        }
        cancionEjemplo = new Cancion(c.id, c.titulo, c.artistas, c.album, c.previewUrl, c.imagen, c.duracion, c.fechaLanzamiento);
        
    });

    test("Debería asignar IDs crecientes a partir de 1 al agregar reseñas", async () => {
        await repositorio.agregar(cancionEjemplo, 5, "Obra maestra", "usuario1");
        await repositorio.agregar(cancionEjemplo, 4, "Muy buena", "usuario2");
        
        const lista = repositorio.listar();
        expect(lista[0].id).toBe("1");
        expect(lista[1].id).toBe("2");
    });
    
    test("Debería guardar y cargar correctamente las reseñas desde el archivo físico", async () => {
        await repositorio.agregar(cancionEjemplo, 5, "Increíble tema", "usuario1");
        
        await repo2.cargar();
        const listaRepo2 = repo2.listar();
        console.log(listaRepo2);
        
        expect(listaRepo2.length).toBe(1);
        expect(listaRepo2[0].id).toBe("1");
        expect(listaRepo2[0].descripcion).toBe("Increíble tema");
        // Verifica que la canción interna se haya reconstruido correctamente como instancia
        expect(listaRepo2[0].cancion.titulo).toBe("Bohemian Rhapsody");
    });
    
    test("Debería buscar reseñas correctamente por ID y por Usuario", async () => {
        await repositorio.agregar(cancionEjemplo, 5, "Reseña uno", "usuarioA");
        await repositorio.agregar(cancionEjemplo, 4, "Reseña dos", "usuarioA");
        await repositorio.agregar(cancionEjemplo, 3, "Reseña tres", "usuarioB");

        const porId = repositorio.buscarPorId("1");
        const porUsuarioA = repositorio.buscarPorUsuario("usuarioA");
        const noExiste = repositorio.buscarPorId("99");

        expect(porId).toBeDefined();
        expect(porId.id).toBe("1");
        expect(porUsuarioA.length).toBe(2);
        expect(noExiste).toBeNull();
    });

    test("Debería actualizar los datos correctamente respetando el ID y el usuario original", async () => {
        await repositorio.agregar(cancionEjemplo, 3, "Comentario inicial", "usuario1");

        await repositorio.updateReseña || await repositorio.actualizar("1", { 
            valoracionPropia: 5,
            descripcion: "Comentario actualizado",
            cantidadFavoritos: 10
        });

        const actualizado = repositorio.buscarPorId("1");
        expect(actualizado.id).toBe("1");
        expect(actualizado.idUsuario).toBe("usuario1"); // No debe cambiar
        expect(actualizado.valoracionPropia).toBe(5);
        expect(actualizado.descripcion).toBe("Comentario actualizado");
        expect(actualizado.cantidadFavoritos).toBe(10);
    });

    test("Debería lanzar error al intentar actualizar una reseña inexistente", async () => {
        await expect(
            repositorio.actualizar("999", { descripcion: "Prueba" })
        ).rejects.toThrow("Reseña inexistente");
    });

    test("Debería eliminar una reseña por ID correctamente", async () => {
        await repositorio.agregar(cancionEjemplo, 5, "A borrar", "usuario1");
        
        const eliminadoOk = await repositorio.eliminar("1");
        const eliminadoFalso = await repositorio.eliminar("999");

        expect(eliminadoOk).toBe(true);
        expect(eliminadoFalso).toBe(false);
        expect(repositorio.listar().length).toBe(0);
    });
});