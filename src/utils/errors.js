class AppError extends Error {
    constructor(message, options = {}) {
        const {
            status = 500,
            title = "Error interno",
            details,
            cause
        } = options;
        super(message, { cause });
        this.name = this.constructor.name;
        Object.assign(this, { status, title, details });
    }
}

class ValidationError extends Error {
    constructor(message = "Una validación interna causó un error") {
        super(message);
        this.name = this.constructor.name;
    }
}

class BadRequestError extends AppError {
    constructor(message = "Solicitud incorrecta", details) {
        super(message, {
            status: 400,
            title: "Solicitud incorrecta",
            details
        });
    }
}

class UnauthorizedError extends AppError {
    constructor(message = "No autenticado") {
        super(message, {
            status: 401,
            title: "No autorizado"
        });
    }
}

class ForbiddenError extends AppError {
    constructor(message = "No tenés permisos para realizar esta operación") {
        super(message, {
            status: 403,
            title: "Acceso prohibido"
        });
    }
}

class NotFoundError extends AppError {
    constructor(what = "Recurso") {
        let message = what;
        if (!what.includes("encontrado") && !what.includes("inexistente")) {
            message = `${what} no encontrado.`;
        }
        super(message, {
            status: 404,
            title: "No encontrado"
        });
    }
}

class ConflictError extends AppError {
    constructor(message = "Conflicto con el estado actual del recurso") {
        super(message, {
            status: 409,
            title: "Conflicto"
        });
    }
}

class ExternalServiceError extends AppError {
    constructor(service, cause) {
        super(`Servicio ${service} no disponible`, {
            status: 502,
            title: "Error en servicio externo",
            cause
        });
    }
}

module.exports = {
    AppError,
    ValidationError,
    BadRequestError,
    UnauthorizedError,
    ForbiddenError,
    NotFoundError,
    ConflictError,
    ExternalServiceError
};