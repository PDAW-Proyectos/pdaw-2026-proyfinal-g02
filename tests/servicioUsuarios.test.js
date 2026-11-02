const RepositorioUsuarios = require("../src/repositories/RepositorioUsuarios");
const ServicioUsuarios = require("../src/services/servicioUsuarios");
const { crearCarpetaTemporal } = require("../src/utils/utilidades");


describe("Servicio usuarios", () => {
    let repositorio
    let servicio

    beforeEach(async() => {
        const ruta = await crearCarpetaTemporal()     
        repositorio = new RepositorioUsuarios(ruta);
        servicio = new ServicioUsuarios(repositorio)
    })

    test("Registrar usuario", async() => {
        await servicio.registrarUsuario("pepito","pepito@gmail.com","asdf1234","usuario");
        expect(repositorio.listar()[0].id).toBe(1);
        expect(repositorio.buscarPorId(1).id).toBe(1);
    });

    test("Iniciar sesión", async() => {
        await servicio.registrarUsuario("pepito","pepito@gmail.com","asdf1234","usuario");
        const usuario = await servicio.iniciarSesion("pepito@gmail.com","asdf1234")
        expect(usuario.id).toBe(1);
        expect(repositorio.listar()[0].passwordHash).not.toBe("asdf1234"); // contra hasheada
    });
    
    
})