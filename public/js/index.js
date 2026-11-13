import { setearAuthForms, checkAuthStatus } from "./auth.js";
import { cargarNavbar } from "./navbar.js";
import { cargarReseñasPopulares, cargarUltimasReseñas } from "./homeReseñas.js";

document.addEventListener("DOMContentLoaded", async() => {
    const user = await checkAuthStatus();
    cargarNavbar(user);
    setearAuthForms();

    cargarReseñasPopulares();
    cargarUltimasReseñas();
});

