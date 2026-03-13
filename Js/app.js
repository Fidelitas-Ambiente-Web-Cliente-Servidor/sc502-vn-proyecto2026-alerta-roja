let login = document.getElementById("formLogin");

if (login) {
    login.addEventListener("submit", function(e) {
        e.preventDefault();

        let correo = document.getElementById("correo").value;
        let clave = document.getElementById("clave").value;

        if (correo == "" || clave == "") {
            alert("Complete todos los campos");
        } else {
            alert("Ingreso correcto");
        }
    });
}

let registro = document.getElementById("formRegistro");

if (registro) {
    registro.addEventListener("submit", function(e) {
        e.preventDefault();

        let nombre = document.getElementById("nombre").value;
        let correo = document.getElementById("correoRegistro").value;
        let clave = document.getElementById("claveRegistro").value;

        if (nombre == "" || correo == "" || clave == "") {
            alert("Faltan datos");
        } else if (clave.length < 6) {
            alert("La contraseña debe tener mínimo 6 caracteres");
        } else {
            alert("Registro guardado");
        }
    });
}