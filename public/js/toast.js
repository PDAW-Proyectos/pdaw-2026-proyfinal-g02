export function mostrarAlerta(mensaje, tipo = "info") {
    let contenedor = document.getElementById("toast-container");
    if (!contenedor) {
        contenedor = document.createElement("div");
        contenedor.id = "toast-container";
        contenedor.className = "toast-container position-fixed bottom-0 end-0 p-3";
        contenedor.style.zIndex = "9999";
        document.body.appendChild(contenedor);
    }

    const variantes = {
        exito: "text-bg-success",
        error: "text-bg-danger",
        aviso: "text-bg-warning",
        info: "text-bg-dark",
    };
    const claseVariante = variantes[tipo] || variantes.info;

    const toastEl = document.createElement("div");
    toastEl.className = `toast align-items-center border-0 ${claseVariante}`;
    toastEl.setAttribute("role", "alert");
    toastEl.setAttribute("aria-live", "assertive");
    toastEl.setAttribute("aria-atomic", "true");

    toastEl.innerHTML = `
        <div class="d-flex">
            <div class="toast-body"></div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Cerrar"></button>
        </div>
    `;
    toastEl.querySelector(".toast-body").textContent = mensaje;

    contenedor.appendChild(toastEl);

    const toast = new bootstrap.Toast(toastEl, { delay: 3500 });
    toastEl.addEventListener("hidden.bs.toast", () => toastEl.remove());
    toast.show();
}