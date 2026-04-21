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

            // cambiar login → cerrar sesión
            if (enlaceLogin) {
                enlaceLogin.parentElement.innerHTML = '<a href="../php/logout.php">Cerrar sesión</a>';
            }

            // eliminar registro
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
            const idProvincia = this.value;
            cargarCantones(idProvincia);
        });
    }

    async function cargarProvincias() {
        try {
            const response = await fetch("../php/obtener-ubicaciones.php?tipo=provincias");
            const data = await response.json();

            if (data.success) {
                selectProvincia.innerHTML = '<option value="">Seleccione una provincia</option>';

                data.data.forEach(provincia => {
                    selectProvincia.innerHTML += `<option value="${provincia.id_provincia}">${provincia.nombre_provincia}</option>`;
                });
            } else {
                console.error(data.message);
            }
        } catch (error) {
            console.error("Error al cargar provincias:", error);
        }
    }

    async function cargarCantones(idProvincia) {
        selectCanton.innerHTML = '<option value="">Seleccione un cantón</option>';

        if (!idProvincia) {
            return;
        }

        try {
            const response = await fetch(`../php/obtener-ubicaciones.php?tipo=cantones&id_provincia=${idProvincia}`);
            const data = await response.json();

            if (data.success) {
                data.data.forEach(canton => {
                    selectCanton.innerHTML += `<option value="${canton.id_canton}">${canton.nombre_canton}</option>`;
                });
            } else {
                console.error(data.message);
            }
        } catch (error) {
            console.error("Error al cargar cantones:", error);
        }
    }

    // =========================
    // CREAR REPORTE
    // =========================
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

                    if (selectCanton) {
                        selectCanton.innerHTML = '<option value="">Seleccione un cantón</option>';
                    }

                    setTimeout(() => {
                        window.location.href = "reportes.html";
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
    // CARGAR REPORTES
    // =========================
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

    async function cargarReportes() {
        const filtroCategoria = document.getElementById("filtroCategoria")?.value || "";
        const filtroProvincia = document.getElementById("filtroProvincia")?.value || "";
        const filtroEstado = document.getElementById("filtroEstado")?.value || "";

        let url = `../php/obtener-reportes.php?categoria=${encodeURIComponent(filtroCategoria)}&provincia=${encodeURIComponent(filtroProvincia)}&estado=${encodeURIComponent(filtroEstado)}`;

        try {
            const response = await fetch(url);
            const data = await response.json();

            if (!data.success) {
                contenedorReportes.innerHTML = `<p>${data.message}</p>`;
                return;
            }

            if (data.data.length === 0) {
                contenedorReportes.innerHTML = `<p>No hay reportes disponibles.</p>`;
                return;
            }

            contenedorReportes.innerHTML = "";

            data.data.forEach(reporte => {
                let prioridadTexto = "Baja";

                if (parseInt(reporte.prioridad) >= 20) {
                    prioridadTexto = "Alta";
                } else if (parseInt(reporte.prioridad) >= 10) {
                    prioridadTexto = "Media";
                }

                let claseEstado = "registrado";

                if (reporte.nombre_estado === "En revisión") {
                    claseEstado = "revision";
                } else if (reporte.nombre_estado === "Prioritario") {
                    claseEstado = "prioritario";
                }

                const tarjeta = document.createElement("article");
                tarjeta.className = "tarjeta-reporte";

                tarjeta.innerHTML = `
                    <div class="tarjeta-superior">
                        <div>
                            <span class="badge badge-categoria">${reporte.nombre_categoria}</span>
                            <h3>${reporte.titulo}</h3>
                            <p class="ubicacion">${reporte.nombre_provincia}, ${reporte.nombre_canton}</p>
                            <p class="ubicacion"><strong>Reportado por:</strong> ${reporte.autor}</p>
                        </div>
                        <span class="badge badge-estado ${claseEstado}">${reporte.nombre_estado}</span>
                    </div>

                    <p class="descripcion-reporte">
                        ${reporte.descripcion}
                    </p>

                    <div class="meta-reporte">
                        <span><strong>Fecha:</strong> ${reporte.fecha_reporte}</span>
                        <span><strong>Hora:</strong> ${reporte.hora_reporte}</span>
                        <span><strong>Prioridad:</strong> ${prioridadTexto}</span>
                        <span><strong>Votos:</strong> ${reporte.cantidad_votos}</span>
                    </div>

                    <div class="acciones-tarjeta">
                        <button class="btn btn-principal btn-votar" type="button" data-id="${reporte.id_reporte}">
                            Votar
                        </button>
                    </div>
                `;

                contenedorReportes.appendChild(tarjeta);
            });

            agregarEventosVotacion();
        } catch (error) {
            contenedorReportes.innerHTML = `<p>Error al cargar reportes.</p>`;
            console.error(error);
        }
    }

    function agregarEventosVotacion() {
        const botonesVotar = document.querySelectorAll(".btn-votar");

        botonesVotar.forEach(boton => {
            boton.addEventListener("click", async function () {
                const idReporte = this.getAttribute("data-id");

                try {
                    const formData = new FormData();
                    formData.append("id_reporte", idReporte);

                    const response = await fetch("../php/votar.php", {
                        method: "POST",
                        body: formData
                    });

                    const data = await response.json();
                    alert(data.message);

                    if (data.success) {
                        cargarReportes();
                    }
                } catch (error) {
                    alert("Error al registrar el voto.");
                    console.error(error);
                }
            });
        });
    }
});