const path = require("node:path");
const express = require("express");
const session = require("express-session");
const config = require("./config");
const routerAuth = require("./routes/routes.auth");
const routerReseñas = require("./routes/routes.reseñas");
const routerDeezer = require("./routes/routes.deezer");

function createApp(contenedor) {
    const { servicios, middlewares } = contenedor

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

    // carga req.user con el usuario si hay req.session.userId, sino null
    app.use(middlewares.autenticacion.autenticar) 

    app.use("/api/auth", routerAuth(servicios, middlewares.autenticacion))
    app.use("/api/resenas", routerReseñas(servicios.reseñas, middlewares.autenticacion));
    app.use("/api/deezer", routerDeezer(servicios.deezer))

    return app;
}

module.exports = createApp;
