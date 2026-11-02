const path = require("node:path");
const express = require("express");
const session = require("express-session");
const config = require("./config");

function createApp(contenedor) {
    // const { repositorios, servicios } = contenedor

    const app = express();
    app.use(express.static(path.join(__dirname, "..", "public")));
    app.use(express.json());
    app.use(
        session({
            name: "connect.sid",
            secret: config.sessionSecret,
            resave: false,
            saveUninitialized: false,
            cookie: {
                httpOnly: true,
                sameSite: "lax",
                secure: config.production,
                maxAge: 60 * 60 * 1000,
            },
        }),
    );

    return app;
}

module.exports = createApp;
