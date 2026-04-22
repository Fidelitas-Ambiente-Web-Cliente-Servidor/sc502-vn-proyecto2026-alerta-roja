 console.log("JS CARGADO");
document.addEventListener("DOMContentLoaded", function () {
    // =========================
    // VALIDAR SESION Y ROL
    // =========================
    async function verificarSesion() {
        try {
            const response = await fetch("../php/verificar-sesion.php");
            return await response.json();
        } catch (error) {
            console.error("Error al verificar sesión:", error);
            return { logged_in: false };
        }
    }

    verificarSesion().then(s => window.sesionActual = s);

    async function protegerCrearReporte() {
        const formReporte = document.getElementById("formReporte");

        if (formReporte) {
            const sesion = await verificarSesion();

            if (!sesion.logged_in) {
                alert("Debe iniciar sesión para crear un reporte.");
                window.location.href = "login.html";
                return;
            }
        }
    }

    async function protegerAdmin() {
        const paginaAdmin = document.body.getAttribute("data-admin");

        if (paginaAdmin === "true") {
            const sesion = await verificarSesion();

            if (!sesion.logged_in) {
                alert("Debe iniciar sesión.");
                window.location.href = "login.html";
                return;
            }

            if (sesion.rol !== "Administrador") {
                alert("No tiene permisos para acceder a esta página.");
                window.location.href = "reportes.html";
                return;
            }
        }
    }

    async function actualizarMenuSegunSesion() {
        const menu = document.querySelector(".menu");

        if (!menu) return;

        const sesion = await verificarSesion();

        const enlaceLogin = menu.querySelector('a[href="login.html"]');
        const enlaceRegistro = menu.querySelector('a[href="registro.html"]');
        const enlaceAdmin = menu.querySelector('a[href="admin.html"]');

        if (sesion.logged_in) {

            if (enlaceLogin) {
                enlaceLogin.parentElement.innerHTML = '<a href="../php/logout.php">Cerrar sesión</a>';
            }

            if (enlaceRegistro) {
                enlaceRegistro.parentElement.remove();
            }

            const liUser = document.createElement("li");
            liUser.innerHTML = `
                <span style="color:white; font-weight:600; margin-left:80px;">
                    ${sesion.nombre} (${sesion.rol})
                </span>
            `;
            menu.appendChild(liUser);

            if (sesion.rol !== "Administrador" && enlaceAdmin) {
                enlaceAdmin.parentElement.remove();
            }
        }
    }

    protegerCrearReporte();
    protegerAdmin();
    actualizarMenuSegunSesion();

    // =========================
    // LOGIN
    // =========================
    const login = document.getElementById("formLogin");

    if (login) {
        login.addEventListener("submit", async function (e) {
            e.preventDefault();

            const correo = document.getElementById("correo").value.trim();
            const contrasena = document.getElementById("contrasena").value.trim();
            const mensaje = document.getElementById("mensajeLogin");

            mensaje.textContent = "";
            mensaje.style.color = "";

            if (correo === "" || contrasena === "") {
                mensaje.textContent = "Complete todos los campos.";
                mensaje.style.color = "red";
                return;
            }

            try {
                const formData = new FormData();
                formData.append("correo", correo);
                formData.append("contrasena", contrasena);

                const response = await fetch("../php/login.php", {
                    method: "POST",
                    body: formData
                });

                const data = await response.json();

                mensaje.textContent = data.message;
                mensaje.style.fontWeight = "bold";
                mensaje.style.marginTop = "10px";

                if (data.success) {
                    mensaje.style.color = "green";

                    setTimeout(() => {
                        if (data.rol === "Administrador") {
                            window.location.href = "admin.html";
                        } else {
                            window.location.href = "reportes.html";
                        }
                    }, 1000);
                } else {
                    mensaje.style.color = "red";
                }
            } catch (error) {
                mensaje.textContent = "Error al conectar con el servidor.";
                mensaje.style.color = "red";
                console.error(error);
            }
        });
    }

    // =========================
    // REGISTRO
    // =========================
    const registro = document.getElementById("formRegistro");

    if (registro) {
        registro.addEventListener("submit", async function (e) {
            e.preventDefault();

            const nombre = document.getElementById("nombre").value.trim();
            const correo = document.getElementById("correo").value.trim();
            const contrasena = document.getElementById("contrasena").value.trim();
            const mensaje = document.getElementById("mensajeRegistro");

            mensaje.textContent = "";
            mensaje.style.color = "";

            if (nombre === "" || correo === "" || contrasena === "") {
                mensaje.textContent = "Complete todos los campos.";
                mensaje.style.color = "red";
                return;
            }

            if (contrasena.length < 6) {
                mensaje.textContent = "La contraseña debe tener mínimo 6 caracteres.";
                mensaje.style.color = "red";
                return;
            }

            try {
                const formData = new FormData();
                formData.append("nombre", nombre);
                formData.append("correo", correo);
                formData.append("contrasena", contrasena);

                const response = await fetch("../php/registro.php", {
                    method: "POST",
                    body: formData
                });

                const data = await response.json();

                mensaje.textContent = data.message;
                mensaje.style.fontWeight = "bold";
                mensaje.style.marginTop = "10px";

                if (data.success) {
                    mensaje.style.color = "green";
                    registro.reset();

                    setTimeout(() => {
                        window.location.href = "login.html";
                    }, 1500);
                } else {
                    mensaje.style.color = "red";
                }
            } catch (error) {
                mensaje.textContent = "Error al conectar con el servidor.";
                mensaje.style.color = "red";
                console.error(error);
            }
        });
    }

     // =========================
    // SELECTS DE UBICACION
    // =========================
    const selectProvincia = document.getElementById("provincia");
    const selectCanton = document.getElementById("canton");

    if (selectProvincia && selectCanton) {
        cargarProvincias();

        selectProvincia.addEventListener("change", function () {
            cargarCantones(this.value);
        });
    }

    async function cargarProvincias() {
        try {
            const response = await fetch("../php/obtener-ubicaciones.php?tipo=provincias");
            const data = await response.json();

            if (data.success) {
                selectProvincia.innerHTML = '<option value="">Seleccione una provincia</option>';

                data.data.forEach(p => {
                    selectProvincia.innerHTML += `<option value="${p.id_provincia}">${p.nombre_provincia}</option>`;
                });
            }
        } catch (error) {
            console.error("Error provincias:", error);
        }
    }

    async function cargarCantones(idProvincia) {
        selectCanton.innerHTML = '<option value="">Seleccione un cantón</option>';
        if (!idProvincia) return;

        try {
            const response = await fetch(`../php/obtener-ubicaciones.php?tipo=cantones&id_provincia=${idProvincia}`);
            const data = await response.json();

            if (data.success) {
                data.data.forEach(c => {
                    selectCanton.innerHTML += `<option value="${c.id_canton}">${c.nombre_canton}</option>`;
                });
            }
        } catch (error) {
            console.error("Error cantones:", error);
        }
    }

    // ==========
   // CREAR REPORTE
  // ===============
const formReporte = document.getElementById("formReporte");

if (formReporte) {
    formReporte.addEventListener("submit", async function (e) {
        e.preventDefault();

        const mensaje = document.getElementById("mensajeReporte");
        const formData = new FormData(formReporte);

        mensaje.textContent = "";
        mensaje.style.color = "";

        try {
            const response = await fetch("../php/crear-reporte.php", {
                method: "POST",
                body: formData
            });

            const data = await response.json();

            mensaje.textContent = data.message;
            mensaje.style.fontWeight = "bold";
            mensaje.style.marginTop = "10px";

            if (data.success) {
                mensaje.style.color = "green";
                formReporte.reset();

                const canton = document.getElementById("canton");
                if (canton) {
                    canton.innerHTML = '<option value="">Seleccione un cantón</option>';
                }

                setTimeout(() => {
                    window.location.href = "reportes.html";
                }, 1200);

            } else {
                mensaje.style.color = "red";
            }

        } catch (error) {
            mensaje.textContent = "Error al enviar el reporte.";
            mensaje.style.color = "red";
            console.error(error);
        }
    });
}

    // ===============
    // CARGAR REPORTES
    // ===============
    const contenedorReportes = document.getElementById("contenedorReportes");
const btnFiltrarReportes = document.getElementById("btnFiltrarReportes");

if (contenedorReportes) {
    cargarReportes();

    if (btnFiltrarReportes) {
        btnFiltrarReportes.addEventListener("click", function () {
            cargarReportes();
        });
    }
}

function obtenerIcono(categoria) {
    switch (categoria) {
        case "Accidente": return "🚗";
        case "Inundación": return "🌊";
        case "Deslizamiento": return "🌳";
        case "Asalto": return "⚠️";
        default: return "📍";
    }
}

async function cargarReportes() {
    const filtroCategoria = document.getElementById("filtroCategoria")?.value || "";
    const filtroProvincia = document.getElementById("filtroProvincia")?.value || "";
    const filtroEstado = document.getElementById("filtroEstado")?.value || "";

    let url = `../php/obtener-reportes.php?categoria=${encodeURIComponent(filtroCategoria)}&provincia=${encodeURIComponent(filtroProvincia)}&estado=${encodeURIComponent(filtroEstado)}`;

    try {
        const response = await fetch(url);
        const res = await response.json();

        if (!res.success) {
            contenedorReportes.innerHTML = `<p>${res.message}</p>`;
            return;
        }

        if (res.data.length === 0) {
            contenedorReportes.innerHTML = `<p>No hay reportes disponibles.</p>`;
            return;
        }

        contenedorReportes.innerHTML = "";

        const sesion = window.sesionActual || {};

        res.data.forEach(reporte => {

            let prioridadTexto = "Baja";
            if (parseInt(reporte.prioridad) >= 20) prioridadTexto = "Alta";
            else if (parseInt(reporte.prioridad) >= 10) prioridadTexto = "Media";

            let claseEstado = "registrado";
            if (reporte.nombre_estado === "En revisión") claseEstado = "revision";
            else if (reporte.nombre_estado === "Prioritario") claseEstado = "prioritario";
            else if (reporte.nombre_estado === "Atendido") claseEstado = "atendido";

            let accionesHTML = "";

            if (sesion.rol !== "Administrador") {
                accionesHTML = `
                    <div class="tarjeta-acciones">
                        <button class="btn btn-principal btn-votar" data-id="${reporte.id_reporte}">
                            👍 Votar
                        </button>
                    </div>
                `;
            }

            if (sesion.rol === "Administrador") {
                accionesHTML = `
                    <div class="tarjeta-acciones">
                        <button class="btn btn-principal btn-votar" data-id="${reporte.id_reporte}">
                            👍 Votar
                        </button>

                        <select id="estado-${reporte.id_reporte}" class="select-estado">
                            <option ${reporte.nombre_estado === 'Registrado' ? 'selected' : ''}>Registrado</option>
                            <option ${reporte.nombre_estado === 'En revisión' ? 'selected' : ''}>En revisión</option>
                            <option ${reporte.nombre_estado === 'Prioritario' ? 'selected' : ''}>Prioritario</option>
                            <option ${reporte.nombre_estado === 'Enviado' ? 'selected' : ''}>Enviado</option>
                            <option ${reporte.nombre_estado === 'Atendido' ? 'selected' : ''}>Atendido</option>
                            <option ${reporte.nombre_estado === 'Cerrado' ? 'selected' : ''}>Cerrado</option>
                        </select>

                        <button onclick="actualizarEstado(${reporte.id_reporte})"
                            class="btn btn-principal btn-actualizar">
                            Actualizar
                        </button>
                    </div>
                `;
            }

            const tarjeta = document.createElement("article");
            tarjeta.className = "timeline-item";

            tarjeta.innerHTML = `
                <div class="timeline-left">
                    <div class="timeline-icon ${claseEstado}">
                        ${obtenerIcono(reporte.nombre_categoria)}
                    </div>
                    <div class="timeline-fecha">
                        ${reporte.fecha_reporte}<br>
                        ${reporte.hora_reporte}
                    </div>
                </div>

                <div class="tarjeta-reporte">
                    <div class="tarjeta-layout">

                        <div class="tarjeta-info">
                            <div class="tarjeta-header">
                                <div>
                                    <span class="badge badge-categoria">${reporte.nombre_categoria}</span>
                                    <h3>${reporte.titulo}</h3>
                                    <p class="ubicacion">${reporte.nombre_provincia}, ${reporte.nombre_canton}</p>
                                    <p class="ubicacion"><strong>Reportado por:</strong> ${reporte.autor}</p>
                                </div>

                                <span class="badge badge-estado ${claseEstado}">
                                    ${reporte.nombre_estado}
                                </span>
                            </div>

                            <p class="descripcion-reporte">${reporte.descripcion}</p>

                            <div class="meta-reporte">
                                <span><strong>Fecha:</strong> ${reporte.fecha_reporte}</span>
                                <span><strong>Hora:</strong> ${reporte.hora_reporte}</span>
                                <span><strong>Prioridad:</strong> ${prioridadTexto}</span>
                                <span><strong>Votos:</strong> ${reporte.cantidad_votos}</span>
                            </div>
                        </div>

                        ${accionesHTML}

                    </div>
                </div>
            `;

            contenedorReportes.appendChild(tarjeta);
        });

    } catch (error) {
        contenedorReportes.innerHTML = `<p>Error al cargar reportes.</p>`;
        console.error(error);
    }
}

document.addEventListener("click", async function(e) {
    if (e.target.classList.contains("btn-votar")) {

        const id = e.target.getAttribute("data-id");

        const formData = new FormData();
        formData.append("id_reporte", id);

        try {
            const response = await fetch("../php/votar.php", {
                method: "POST",
                body: formData
            });

            const data = await response.json();

            alert(data.message);

            if (data.success) {
                location.reload();
            }

        } catch (error) {
            alert("Error al votar");
            console.error(error);
        }
    }
});

window.actualizarEstado = async function(id) {
    const select = document.getElementById(`estado-${id}`);
    const nuevoEstado = select.value;

    const formData = new FormData();
    formData.append("id_reporte", id);
    formData.append("estado", nuevoEstado);

    const response = await fetch("../php/actualizar-estado.php", {
        method: "POST",
        body: formData
    });

    const data = await response.json();

    if (data.success) {
        alert("Estado actualizado");

        const tarjeta = select.closest(".tarjeta-reporte");
        const badge = tarjeta.querySelector(".tarjeta-header .badge-estado");

        if (badge) {
            badge.textContent = nuevoEstado;
            badge.className = "badge badge-estado";

            if (nuevoEstado === "En revisión") badge.classList.add("revision");
            else if (nuevoEstado === "Prioritario") badge.classList.add("prioritario");
            else if (nuevoEstado === "Atendido") badge.classList.add("atendido");
            else badge.classList.add("registrado");
        }

    } else {
        alert("Error al actualizar");
    }
}

// =========================
// RESUMEN ADMIN
// =========================
async function cargarResumenAdmin() {

    if (document.body.getAttribute("data-admin") !== "true") return;

    try {
        console.log("Cargando resumen...");

        const response = await fetch("../php/resumen.php");
        const data = await response.json();

        console.log(data);

        document.getElementById("totalReportes").textContent = data.total_reportes;
        document.getElementById("reportesPrioritarios").textContent = data.prioritarios;
        document.getElementById("usuariosRegistrados").textContent = data.usuarios;
        document.getElementById("reportesEnviados").textContent = data.enviados;

    } catch (error) {
        console.error("Error cargando resumen:", error);
    }
}

cargarResumenAdmin();

});