const Administrador = require("../src/models/Administrador");
const Usuario = require("../src/models/Usuario");
const UsuarioRegular = require("../src/models/UsuarioRegular");

describe("Modelos de Usuarios", () => {
    describe("Clase Base: Usuario", () => {
        test("Debería crear una instancia de Usuario con sus propiedades correctas", () => {
            const usuario = new Usuario(1, "pepito", "pepito@gmail.com", "hash123", "usuario");
            
            expect(usuario.id).toBe(1);
            expect(usuario.username).toBe("pepito");
            expect(usuario.email).toBe("pepito@gmail.com");
            expect(usuario.passwordHash).toBe("hash123");
            expect(usuario.rol).toBe("usuario");
        });
    });

    describe("Clase Derivada: Administrador", () => {
        test("Debería crear un Administrador con rol fijo 'administrador'", () => {
            const admin = new Administrador(2, "admin_user", "admin@gmail.com", "hash456");
            
            expect(admin.id).toBe(2);
            expect(admin.username).toBe("admin_user");
            expect(admin.email).toBe("admin@gmail.com");
            expect(admin.passwordHash).toBe("hash456");
            expect(admin.rol).toBe("administrador");
        });
    });

    describe("Clase Derivada: UsuarioRegular", () => {
        let usuarioReg;

        beforeEach(() => {
            usuarioReg = new UsuarioRegular(3, "regular_user", "regular@gmail.com", "hash789");
        });

        test("Debería crear un UsuarioRegular con valores iniciales por defecto", () => {
            expect(usuarioReg.id).toBe(3);
            expect(usuarioReg.username).toBe("regular_user");
            expect(usuarioReg.email).toBe("regular@gmail.com");
            expect(usuarioReg.passwordHash).toBe("hash789");
            expect(usuarioReg.rol).toBe("usuario");
            expect(usuarioReg.estaBaneado).toBe(false);
            expect(usuarioReg.reseñasFavoritas).toEqual([]);
            expect(usuarioReg.misReseñas).toEqual([]);
            expect(usuarioReg.seguidos).toEqual([]);
            expect(usuarioReg.seguidores).toEqual([]);
        });

    //     test("Debería gestionar correctamente las reseñas favoritas (agregar y evitar duplicados)", () => {
    //         const agregado1 = usuarioReg.agregarReseñaAFavoritas(101);
    //         const agregado2 = usuarioReg.agregarReseñaAFavoritas(102);
    //         const duplicado = usuarioReg.agregarReseñaAFavoritas(101); // Ya existe

    //         expect(agregado1).toBe(true);
    //         expect(agregado2).toBe(true);
    //         expect(duplicado).toBe(false);
    //         expect(usuarioReg.reseñasFavoritas).toEqual([101, 102]);

    //         // Eliminar reseña de favoritas
    //         const eliminado = usuarioReg.eliminarReseñaDeFavoritas(101);
    //         expect(eliminado).toBe(true);
    //         expect(usuarioReg.reseñasFavoritas).toEqual([102]);
    //     });

    //     test("Debería gestionar el sistema de seguidores y seguidos (con validación de autoseguimiento)", () => {
    //         // Intentar seguirse a sí mismo debe lanzar error
    //         expect(() => {
    //             usuarioReg.seguirUsuario(3);
    //         }).toThrow("No podés seguirte a vos mismo.");

    //         // Seguir a otro usuario con éxito
    //         const seguidoOk = usuarioReg.seguirUsuario(10);
    //         expect(seguidoOk).toBe(true);
    //         expect(usuarioReg.seguidos).toContain(10);

    //         // Intentar seguir al mismo usuario de nuevo (idempotencia / duplicado)
    //         const seguidoDuplicado = usuarioReg.seguirUsuario(10);
    //         expect(seguidoDuplicado).toBe(false);

    //         // Dejar de seguir
    //         const dejadoDeSeguir = usuarioReg.dejarDeSeguirUsuario(10);
    //         expect(dejadoDeSeguir).toBe(true);
    //         expect(usuarioReg.seguidos).not.toContain(10);
    //     });

    //     test("Debería alternar el estado de baneo correctamente con toggleBan", () => {
    //         expect(usuarioReg.estaBaneado).toBe(false);
            
    //         const estado1 = usuarioReg.toggleBan();
    //         expect(estado1).toBe(true);
    //         expect(usuarioReg.estaBaneado).toBe(true);

    //         const estado2 = usuarioReg.toggleBan();
    //         expect(estado2).toBe(false);
    //         expect(usuarioReg.estaBaneado).toBe(false);
    //     });
    });
});