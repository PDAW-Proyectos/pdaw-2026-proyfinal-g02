const path = require("node:path");
const express = require("express");
const session = require("express-session");
const routerAuth = require("./routes/routes.auth");
const routerReseñas = require("./routes/routes.reseñas");
const routerDeezer = require("./routes/routes.deezer");
const routerUsuarios = require("./routes/routes.usuarios");
const { errorHandler, notFoundHandler } = require('./middlewares/errorHandler.js');
const logger = require('./utils/logger.js');
const requestContext = require("./middlewares/requestContext.js");


function createApp(contenedor) {
    const { config, servicios, middlewares } = contenedor

    const app = express();
    
    app.use(requestContext(logger));
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
    app.set('trust proxy', 1);

    // carga req.user con el usuario si hay req.session.userId, sino null
    app.use(middlewares.autenticacion.autenticar) 

    app.use("/api/auth", routerAuth(servicios, middlewares.autenticacion))
    app.use("/api/resenas", routerReseñas(servicios, middlewares.autenticacion));
    app.use("/api/deezer", routerDeezer(servicios.deezer))
    app.use("/api/usuarios", routerUsuarios(servicios.usuarios, middlewares))

    app.use(notFoundHandler);
    app.use(errorHandler(logger, { exposeStack: !config.production }));

    return app;
}

module.exports = createApp;
