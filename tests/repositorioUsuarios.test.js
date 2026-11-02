const RepositorioUsuarios = require("../src/repositories/RepositorioUsuarios")
const { crearCarpetaTemporal } = require("../src/utils/utilidades");

describe("Repositorio de usuarios - CRUD", () => {
    let repositorio
    let repo2

    beforeEach(async() => {
        const ruta = await crearCarpetaTemporal()     
        repositorio = new RepositorioUsuarios(ruta);
        repo2 = new RepositorioUsuarios(ruta)
    })

    test("agregar asigna ids crecientes a partir de 1", async() => {
        await repositorio.agregar("pepito","pepito@gmail.com","asdf1234","administrador");
        await repositorio.agregar("juan","juan@gmail.com","asdf1234","usuario");
        expect(repositorio.listar()[0].id).toBe(1);
        expect(repositorio.listar()[1].id).toBe(2);
    });
    
    test("guarda y carga los datos en el archivo", async() => {
        await repositorio.agregar("pepito","pepito@gmail.com","asdf1234","administrador");
        await repositorio.agregar("juan","juan@gmail.com","asdf1234","usuario");
        await repo2.cargar()
        expect(repo2.listar()[0].id).toBe(1);
        expect(repo2.listar()[1].id).toBe(2);
    });
    
    test("busca usuarios por id", async() => {
        await repositorio.agregar("pepito","pepito@gmail.com","asdf1234","administrador");
        await repositorio.agregar("juan","juan@gmail.com","asdf1234","usuario");
        expect(repositorio.buscarPorId(1).id).toBe(1);
    });

    test("actualiza los cambios correctamente", async() => {
        await repositorio.agregar("pepito","pepito@gmail.com","asdf1234","usuario");

        repositorio.actualizar(1, { 
            id: 8,
            username: "pepeArgento",
            email: "pepon@gmail.com", 
            passwordHash: "asdfasdf2323",
            estaBaneado: true
        })

        expect(repositorio.buscarPorId(1).id).toBe(1); // respeta el id 
        expect(repositorio.buscarPorId(1).username).toBe("pepeArgento");
        expect(repositorio.buscarPorId(1).email).toBe("pepon@gmail.com");
        expect(repositorio.buscarPorId(1).passwordHash).toBe("asdfasdf2323");
        expect(repositorio.buscarPorId(1).estaBaneado).toBe(true);
    });

    test("elimina usuarios por id", async() => {
        await repositorio.agregar("pepito","pepito@gmail.com","asdf1234","administrador");
        await repositorio.eliminar(1)
        expect(repositorio.listar().length).toBe(0);
    });
})