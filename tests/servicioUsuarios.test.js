const ServicioUsuarios = require('../src/services/ServicioUsuarios');

describe('ServicioUsuarios', () => {
    let servicio;
    let repositorioUsuariosMock;
    let repositorioReseñasMock;

    beforeEach(() => {
        // Creamos mocks completos para ambos repositorios
        repositorioUsuariosMock = {
            listar: jest.fn(),
            buscarPorId: jest.fn(),
            actualizar: jest.fn(),
            eliminar: jest.fn(),
            agregarReseñaFavorita: jest.fn(),
            quitarReseñaFavorita: jest.fn()
        };

        repositorioReseñasMock = {
            buscarPorId: jest.fn(),
            guardar: jest.fn()
        };

        // Inyectamos ambos mocks en el servicio
        servicio = new ServicioUsuarios(repositorioUsuariosMock, repositorioReseñasMock);
    });

    test('listarTodos debe retornar los usuarios formateados de forma segura (sin contraseñas)', () => {
        const usuariosFalsos = [
            { id: 1, username: 'martin', email: 'martin@mail.com', rol: 'usuario', passwordHash: 'hashsecreto' },
            { id: 2, username: 'admin', email: 'admin@mail.com', rol: 'administrador', passwordHash: 'otrohash' }
        ];

        repositorioUsuariosMock.listar.mockReturnValue(usuariosFalsos);

        const resultado = servicio.listarTodos();

        expect(resultado).toHaveLength(2);
        expect(resultado[0]).not.toHaveProperty('passwordHash');
        expect(resultado[0].username).toBe('martin');
        expect(resultado[1].rol).toBe('administrador');
    });

    test('obtenerPorId debe retornar el usuario si existe', () => {
        const usuarioFalso = { id: 1, username: 'martin', email: 'martin@mail.com', rol: 'usuario' };
        repositorioUsuariosMock.buscarPorId.mockReturnValue(usuarioFalso);

        const resultado = servicio.obtenerPorId(1);

        expect(resultado.id).toBe(1);
        expect(resultado.username).toBe('martin');
    });

    test('obtenerPorId debe lanzar un error si el usuario no existe', () => {
        repositorioUsuariosMock.buscarPorId.mockReturnValue(null);

        expect(() => servicio.obtenerPorId(99)).toThrow("Usuario no encontrado.");
    });

    test('actualizar debe permitir al propio usuario modificar sus datos', async () => {
        const usuarioFalso = { id: 1, username: 'martin', rol: 'usuario' };
        repositorioUsuariosMock.buscarPorId.mockReturnValue(usuarioFalso);
        repositorioUsuariosMock.actualizar.mockResolvedValue({ id: 1, username: 'martinActualizado', rol: 'usuario' });

        const usuarioLogueado = { id: 1, rol: 'usuario' };
        const resultado = await servicio.actualizar(1, { username: 'martinActualizado' }, usuarioLogueado);

        expect(resultado.username).toBe('martinActualizado');
        expect(repositorioUsuariosMock.actualizar).toHaveBeenCalledWith(1, { username: 'martinActualizado' });
    });

    test('actualizar debe denegar el acceso si un usuario intenta modificar a otro sin ser admin', async () => {
        const usuarioFalso = { id: 1, username: 'martin', rol: 'usuario' };
        repositorioUsuariosMock.buscarPorId.mockReturnValue(usuarioFalso);

        const usuarioLogueado = { id: 2, rol: 'usuario' }; // Otro usuario común

        await expect(
            servicio.actualizar(1, { username: 'hackeado' }, usuarioLogueado)
        ).rejects.toThrow("No tienes permisos para modificar este usuario.");
    });

    test('cambiarEstadoBan debe actualizar el estado de baneo correctamente', async () => {
        const usuarioFalso = { id: 1, username: 'martin', estaBaneado: false };
        repositorioUsuariosMock.buscarPorId.mockReturnValue(usuarioFalso);
        repositorioUsuariosMock.actualizar.mockResolvedValue({ id: 1, username: 'martin', estaBaneado: true });

        const resultado = await servicio.cambiarEstadoBan(1, true);

        expect(resultado.estaBaneado).toBe(true);
        expect(repositorioUsuariosMock.actualizar).toHaveBeenCalledWith(1, { estaBaneado: true });
    });

    test('eliminar debe permitir a un administrador borrar cualquier usuario', async () => {
        const usuarioFalso = { id: 5, username: 'spam', rol: 'usuario' };
        repositorioUsuariosMock.buscarPorId.mockReturnValue(usuarioFalso);
        repositorioUsuariosMock.eliminar.mockResolvedValue(true);

        const adminLogueado = { id: 99, rol: 'administrador' };
        const resultado = await servicio.eliminar(5, adminLogueado);

        expect(resultado).toBe(true);
        expect(repositorioUsuariosMock.eliminar).toHaveBeenCalledWith(5);
    });

    test('agregarFavorita debe registrar la reseña en el usuario e incrementar los favoritos de la reseña', async () => {
        const usuarioFalso = { id: 1, username: 'martin', reseñasFavoritas: [] };
        const reseñaFalsa = { 
            id: 10, 
            cantidadFavoritos: 2, 
            modificarCantidadFavoritos: jest.fn().mockReturnValue(3) 
        };

        repositorioUsuariosMock.agregarReseñaFavorita.mockResolvedValue({ ...usuarioFalso, reseñasFavoritas: [10] });
        repositorioReseñasMock.buscarPorId.mockReturnValue(reseñaFalsa);

        const resultado = await servicio.agregarFavorita(1, 10);

        expect(resultado.reseñasFavoritas).toContain(10);
        expect(reseñaFalsa.modificarCantidadFavoritos).toHaveBeenCalledWith(1);
        expect(repositorioReseñasMock.guardar).toHaveBeenCalled();
    });

    test('quitarFavorita debe eliminar la reseña del usuario y decrementar los favoritos de la reseña', async () => {
        const usuarioFalso = { id: 1, username: 'martin', reseñasFavoritas: [10] };
        const reseñaFalsa = { 
            id: 10, 
            cantidadFavoritos: 3, 
            modificarCantidadFavoritos: jest.fn().mockReturnValue(2) 
        };

        repositorioUsuariosMock.quitarReseñaFavorita.mockResolvedValue({ ...usuarioFalso, reseñasFavoritas: [] });
        repositorioReseñasMock.buscarPorId.mockReturnValue(reseñaFalsa);

        const resultado = await servicio.quitarFavorita(1, 10);

        expect(resultado.reseñasFavoritas).not.toContain(10);
        expect(reseñaFalsa.modificarCantidadFavoritos).toHaveBeenCalledWith(-1);
        expect(repositorioReseñasMock.guardar).toHaveBeenCalled();
    });
});