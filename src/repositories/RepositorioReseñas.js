const { readFile, writeFile, mkdir } = require("node:fs/promises");
const path = require("node:path");
const Reseña = require("../models/Reseña");
const Cancion = require("../models/Cancion");
const { NotFoundError } = require("../utils/errors.js");

class RepositorioReseñas {
    constructor(rutaArchivo) {
        this.ruta = rutaArchivo;
        this.reseñas = [];
        this.proximoId = 1;
    }

    async cargar() {
        try {
            const contenido = await readFile(this.ruta, "utf8");
            if (!contenido.trim()) {
                this.reseñas = [];
                return;
            }
            const data = JSON.parse(contenido) || [];

            this.reseñas = data.map((d) => {
                // Reconstruimos el objeto Cancion si viene almacenado en formato plano
                const c = d.cancion;
                const cancion =
                    c instanceof Cancion
                        ? c
                        : new Cancion({
                              id: c?.id,
                              titulo: c?.titulo,
                              artistas: c?.artistas,
                              album: c?.album,
                              previewUrl: c?.previewUrl,
                              imagen: c?.imagen,
                              duracion: c?.duracion,
                          });

                return new Reseña({
                    id: d.id,
                    cancion,
                    valoracionPropia: d.valoracionPropia,
                    descripcion: d.descripcion,
                    idUsuario: d.idUsuario,
                    fechaPublicado: d.fechaPublicado,
                    cantidadFavoritos: d.cantidadFavoritos,
                });
            });

            this.proximoId =
                Math.max(0, ...this.reseñas.map((r) => Number(r.id) || 0)) + 1;
        } catch (error) {
            if (error.code !== "ENOENT") throw error;
            // Si el archivo no existe, lo inicializamos guardando un array vacío (creará la carpeta automáticamente)
            await this.guardar();
        }
    }

    async guardar() {
        const carpeta = path.dirname(this.ruta);
        await mkdir(carpeta, { recursive: true });
        await writeFile(
            this.ruta,
            JSON.stringify(this.reseñas, null, 2),
            "utf8",
        );
    }

    listar() {
        return this.reseñas;
    }

    async agregar(cancion, valoracionPropia, descripcion, idUsuario) {
        const id = String(this.proximoId++);
        const nuevaReseña = new Reseña({
            id,
            cancion,
            valoracionPropia,
            descripcion,
            idUsuario,
            fechaPublicado: new Date(),
            cantidadFavoritos: 0,
        });

        this.reseñas.push(nuevaReseña);
        await this.guardar();
        return nuevaReseña;
    }

    buscarPorId(id) {
        return this.reseñas.find((r) => String(r.id) === String(id)) || null;
    }

    buscarPorUsuario(idUsuario) {
        return this.reseñas.filter(
            (r) => String(r.idUsuario) === String(idUsuario),
        );
    }

    async actualizar(id, datosNuevos) {
        const index = this.reseñas.findIndex(
            (r) => String(r.id) === String(id),
        );
        if (index === -1) throw new NotFoundError("Reseña inexistente");

        const reseñaActual = this.reseñas[index];

        // Mantenemos el ID original y actualizamos los campos permitidos
        this.reseñas[index] = new Reseña({
            id: reseñaActual.id,
            cancion: datosNuevos.cancion ?? reseñaActual.cancion,
            valoracionPropia:
                datosNuevos.valoracionPropia ?? reseñaActual.valoracionPropia,
            descripcion: datosNuevos.descripcion ?? reseñaActual.descripcion,
            idUsuario: reseñaActual.idUsuario,
            fechaPublicado: reseñaActual.fechaPublicado,
            cantidadFavoritos:
                datosNuevos.cantidadFavoritos ?? reseñaActual.cantidadFavoritos,
        });

        await this.guardar();
        return this.reseñas[index];
    }

    async eliminar(id) {
        const index = this.reseñas.findIndex(
            (r) => String(r.id) === String(id),
        );
        if (index === -1) return false;

        this.reseñas.splice(index, 1);
        await this.guardar();
        return true;
    }
}

module.exports = RepositorioReseñas;
