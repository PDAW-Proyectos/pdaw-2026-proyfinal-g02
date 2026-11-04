class Usuario {
    constructor(id, username, email, passwordHash, rol = "usuario") {
        this.id = id
        this.username = username
        this.email = email
        this.passwordHash = passwordHash
        this.rol = rol
    }
}

module.exports = Usuario