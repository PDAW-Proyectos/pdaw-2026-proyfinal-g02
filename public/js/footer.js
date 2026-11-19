export function cargarFooter(selector = "#main-footer") {
    const footerEl = document.querySelector(selector);
    if (!footerEl) return;

    footerEl.className = "border-top py-4 text-center mt-auto";
    footerEl.innerHTML = `
        <p class="small py-2 mb-0">Podés encontrarnos también en:</p>
        <div class="container">
            <div class="row">
                <div class="col d-flex justify-content-center align-items-center gap-2 my-2">
                    <a href="#" class="text-light fs-4" aria-label="Facebook"><i class="bi bi-facebook"></i></a>
                    <a href="#" class="text-light fs-4" aria-label="Twitter X"><i class="bi bi-twitter-x"></i></a>
                    <a href="#" class="text-light fs-4" aria-label="Instagram"><i class="bi bi-instagram"></i></a>
                </div>
            </div>
        </div>
        <p class="small py-2 mb-0">Copyright 2026 Beatácora©. Todos los derechos reservados</p>
    `;
}