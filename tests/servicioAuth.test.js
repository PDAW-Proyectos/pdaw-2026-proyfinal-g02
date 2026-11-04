const RepositorioUsuarios = require("../src/repositories/RepositorioUsuarios");
const ServicioAuth = require("../src/services/servicioAuth");
const { crearCarpetaTemporal } = require("../src/utils/utilidades");

describe("Servicio de Autenticación y Usuarios", () => {
    let repositorio;
    let servicio;

    beforeEach(async () => {
        const ruta = await crearCarpetaTemporal();    
        repositorio = new RepositorioUsuarios(ruta);
        await repositorio.cargar();
        servicio = new ServicioAuth(repositorio);
    });

    describe("Registro de usuarios", () => {
        test("Debería registrar un usuario correctamente y hashear su contraseña", async () => {
            const usuario = await servicio.registrarUsuario("martin", "martin@gmail.com", "password123", "usuario");
            
            expect(usuario).toBeDefined();
            expect(usuario.id).toBe(1);
            expect(usuario.username).toBe("martin");
            expect(usuario.email).toBe("martin@gmail.com");
            expect(usuario.passwordHash).toBeUndefined(); // No expone el hash

            // Verificamos que el repositorio guardó la instancia con el password hasheado
            const guardado = repositorio.buscarPorId(1);
            expect(guardado.passwordHash).not.toBe("password123");
        });

        test("Debería fallar si el nombre de usuario es menor a 3 caracteres", async () => {
            await expect(
                servicio.registrarUsuario("ma", "martin@gmail.com", "password123", "usuario")
            ).rejects.toThrow("El nombre de usuario debe tener al menos 3 caracteres.");
        });

        test("Debería fallar si el formato del correo electrónico es inválido", async () => {
            await expect(
                servicio.registrarUsuario("martin", "correo-invalido", "password123", "usuario")
            ).rejects.toThrow("El formato del correo electrónico no es válido.");
        });

        test("Debería fallar si la contraseña tiene menos de 6 caracteres", async () => {
            await expect(
                servicio.registrarUsuario("martin", "martin@gmail.com", "123", "usuario")
            ).rejects.toThrow("La contraseña debe tener al menos 6 caracteres.");
        });

        test("Debería fallar si el correo o el nombre de usuario ya están registrados", async () => {
            await servicio.registrarUsuario("martin", "martin@gmail.com", "password123", "usuario");

            // Intento con el mismo email
            await expect(
                servicio.registrarUsuario("otro", "martin@gmail.com", "password123", "usuario")
            ).rejects.toThrow("El usuario o correo ya se encuentra registrado.");

            // Intento con el mismo username
            await expect(
                servicio.registrarUsuario("martin", "otro@gmail.com", "password123", "usuario")
            ).rejects.toThrow("El usuario o correo ya se encuentra registrado.");
        });
    });

    describe("Inicio de sesión", () => {
        beforeEach(async () => {
            await servicio.registrarUsuario("martin", "martin@gmail.com", "password123", "usuario");
        });

        test("Debería iniciar sesión exitosamente con credenciales válidas", async () => {
            const usuario = await servicio.iniciarSesion("martin@gmail.com", "password123");
            
            expect(usuario).toBeDefined();
            expect(usuario.id).toBe(1);
            expect(usuario.email).toBe("martin@gmail.com");
        });

        test("Debería retornar null si la contraseña es incorrecta", async () => {
            const usuario = await servicio.iniciarSesion("martin@gmail.com", "clave-erronea");
            expect(usuario).toBeNull();
        });

        test("Debería retornar null si el correo no existe", async () => {
            const usuario = await servicio.iniciarSesion("noexiste@gmail.com", "password123");
            expect(usuario).toBeNull();
        });

        test("Debería lanzar error si un usuario baneado intenta iniciar sesión", async () => {
            // Simulamos el baneo alterando la propiedad en la instancia
            const instancia = repositorio.buscarPorId(1);
            instancia.estaBaneado = true;

            await expect(
                servicio.iniciarSesion("martin@gmail.com", "password123")
            ).rejects.toThrow("Tu cuenta se encuentra suspendida.");
        });
    });
});