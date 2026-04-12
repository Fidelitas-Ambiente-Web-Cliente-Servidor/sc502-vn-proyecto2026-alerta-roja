document.addEventListener("DOMContentLoaded", function () {
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
});