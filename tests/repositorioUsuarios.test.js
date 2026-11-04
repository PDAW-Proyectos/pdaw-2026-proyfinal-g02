const RepositorioUsuarios = require("../src/repositories/RepositorioUsuarios");
const { crearCarpetaTemporal } = require("../src/utils/utilidades");

describe("Repositorio de Usuarios - CRUD y Persistencia", () => {
    let repositorio;
    let repo2;
    let ruta;

    beforeEach(async () => {
        ruta = await crearCarpetaTemporal();    
        repositorio = new RepositorioUsuarios(ruta);
        repo2 = new RepositorioUsuarios(ruta);
    });

    test("Debería asignar IDs crecientes a partir de 1 al agregar usuarios", async () => {
        await repositorio.agregar("pepito", "pepito@gmail.com", "asdf1234", "administrador");
        await repositorio.agregar("juan", "juan@gmail.com", "asdf1234", "usuario");
        
        expect(repositorio.listar()[0].id).toBe(1);
        expect(repositorio.listar()[1].id).toBe(2);
    });
    
    test("Debería guardar y cargar correctamente los datos desde el archivo físico", async () => {
        await repositorio.agregar("pepito", "pepito@gmail.com", "asdf1234", "administrador");
        await repositorio.agregar("juan", "juan@gmail.com", "asdf1234", "usuario");
        
        await repo2.cargar();
        
        expect(repo2.listar().length).toBe(2);
        expect(repo2.listar()[0].id).toBe(1);
        expect(repo2.listar()[1].username).toBe("juan");
    });
    
    test("Debería buscar usuarios de forma correcta por ID, Email y Username", async () => {
        await repositorio.agregar("pepito", "pepito@gmail.com", "asdf1234", "administrador");
        
        const porId = repositorio.buscarPorId(1);
        const porEmail = repositorio.buscarPorEmail("pepito@gmail.com");
        const porUsername = repositorio.buscarPorUsername("pepito");
        const noExiste = repositorio.buscarPorId(99);

        expect(porId).toBeDefined();
        expect(porId.id).toBe(1);
        expect(porEmail.username).toBe("pepito");
        expect(porUsername.email).toBe("pepito@gmail.com");
        expect(noExiste).toBeNull();
    });

    test("Debería actualizar los datos correctamente y proteger el ID", async () => {
        await repositorio.agregar("pepito", "pepito@gmail.com", "asdf1234", "usuario");

        await repositorio.actualizar(1, { 
            id: 8, // Intento malicioso o accidental de cambiar el ID
            username: "pepeArgento",
            email: "pepon@gmail.com", 
            passwordHash: "asdfasdf2323",
            estaBaneado: true
        });

        const actualizado = repositorio.buscarPorId(1);
        expect(actualizado.id).toBe(1); // El ID original se respeta
        expect(actualizado.username).toBe("pepeArgento");
        expect(actualizado.email).toBe("pepon@gmail.com");
        expect(actualizado.estaBaneado).toBe(true);
    });

    test("Debería lanzar un error al intentar actualizar un usuario inexistente", async () => {
        await expect(
            repositorio.actualizar(999, { username: "nuevo" })
        ).rejects.toThrow("Usuario inexistente");
    });

    test("Debería eliminar un usuario por ID correctamente", async () => {
        await repositorio.agregar("pepito", "pepito@gmail.com", "asdf1234", "administrador");
        
        const eliminadoOk = await repositorio.eliminar(1);
        const eliminadoFalso = await repositorio.eliminar(999);

        expect(eliminadoOk).toBe(true);
        expect(eliminadoFalso).toBe(false);
        expect(repositorio.listar().length).toBe(0);
    });
});