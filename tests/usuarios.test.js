const Administrador = require("../src/models/Administrador")
const Usuario = require("../src/models/Usuario")
const UsuarioRegular = require("../src/models/UsuarioRegular")

describe("Modulos de usuarios", () => {
    test("Crear un usuario", () => {
        const nuevo = new Usuario(1, "pepito", "pepito@gmail.com", "1234asdf", "usuario")
        expect(nuevo.id).toBe(1)
        expect(nuevo.username).toBe("pepito")
        expect(nuevo.email).toBe("pepito@gmail.com")
        expect(nuevo.passwordHash).toBe("1234asdf")
        expect(nuevo.rol).toBe("usuario")
    })

    test("Crear un administrador", () => {
        const nuevo = new Administrador(2, "pepito", "pepito@gmail.com", "1234asdf")
        expect(nuevo.id).toBe(2)
        expect(nuevo.username).toBe("pepito")
        expect(nuevo.email).toBe("pepito@gmail.com")
        expect(nuevo.passwordHash).toBe("1234asdf")
        expect(nuevo.rol).toBe("administrador")
    })

    test("Crear un usuario regular", () => {
        const nuevo = new UsuarioRegular(3, "pepito", "pepito@gmail.com", "1234asdf")
        expect(nuevo.id).toBe(3)
        expect(nuevo.username).toBe("pepito")
        expect(nuevo.email).toBe("pepito@gmail.com")
        expect(nuevo.passwordHash).toBe("1234asdf")
        expect(nuevo.rol).toBe("usuario")
        expect(nuevo.estaBaneado).toBe(false)
        expect(nuevo.reseñasFavoritas).toEqual([])
        expect(nuevo.misReseñas).toEqual([])
        expect(nuevo.seguidos).toEqual([])
        expect(nuevo.seguidores).toEqual([])
    })
})