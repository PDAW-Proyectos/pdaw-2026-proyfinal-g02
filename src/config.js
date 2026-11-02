require('dotenv').config();
const path = require('node:path');

module.exports = {
    port: Number(process.env.PORT) || 3000,
    sessionSecret: process.env.SESSION_SECRET || "secreto-para-desarrollo",
    production: process.env.PRODUCTION === true || false,
    rutaUsuarios: path.join(__dirname, ".." ,"data", "usuarios.json")
}