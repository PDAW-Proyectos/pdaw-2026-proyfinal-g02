const { mkdtemp } = require("node:fs/promises")
const { tmpdir } = require("node:os")
const { join } = require("node:path")

const crearCarpetaTemporal = async() => {
    const carpeta = await mkdtemp(join(tmpdir(), "usuarios-"));
    return join(carpeta, "usuarios.json");
}

module.exports = { crearCarpetaTemporal }