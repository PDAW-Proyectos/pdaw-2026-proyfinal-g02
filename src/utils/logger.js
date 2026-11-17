const SENSITIVE = new Set(['password', 'passwordhash', 'token', 'authorization', 'cookie', 'secret']);

function redact(value) {
    if (Array.isArray(value)) return value.map(redact);
    if (value && typeof value === 'object' && value !== null) {
        return Object.fromEntries(
            Object.entries(value).map(([k, v]) => [
                k,
                SENSITIVE.has(k.toLowerCase()) ? '[OCULTO]' : redact(v)
            ])
        );
    }
    return value;
}

const LOG_LEVELS = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3
};

const currentLevel = LOG_LEVELS[process.env.LOG_LEVEL?.toLowerCase()] ?? LOG_LEVELS.info;

function log(level, msg, meta = {}) {
    if (LOG_LEVELS[level] < currentLevel) return;

    const evento = {
        level,
        time: new Date().toISOString(),
        msg,
        ...redact(meta)
    };

    console.log(JSON.stringify(evento));
}

const logger = {
    debug: (msg, meta) => log('debug', msg, meta),
    info: (msg, meta) => log('info', msg, meta),
    warn: (msg, meta) => log('warn', msg, meta),
    error: (msg, meta) => log('error', msg, meta)
};

module.exports = logger;