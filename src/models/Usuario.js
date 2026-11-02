class Usuario {
    constructor(username, email, passwordHash, rol = "usuario") {
        this.username = username
        this.email = email
        this.passwordHash = passwordHash
        this.rol = rol
    }
}

module.exports = Usuario