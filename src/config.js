require('dotenv').config();
const path = require('node:path');

const env = process.env.NODE_ENV || 'development';
const production = env === 'production';
const missing = [];

function required(name, devDefault) {
    if (process.env[name]) return process.env[name];
    if (production) {
        missing.push(name);
        return undefined;
    }
    return devDefault;
}

const config = {
    env,
    port: Number(process.env.PORT) || 3000,
    sessionSecret: required('SESSION_SECRET', 'secreto-para-desarrollo'),
    production,
    rutaUsuarios: path.join(__dirname, '..', 'data', 'usuarios.json'),
    rutaReseñas: path.join(__dirname, '..', 'data', 'reseñas.json'),
};

if (missing.length > 0) {
    throw new Error(`Faltan variables de entorno obligatorias: ${missing.join(', ')}`);
}

module.exports = Object.freeze(config);