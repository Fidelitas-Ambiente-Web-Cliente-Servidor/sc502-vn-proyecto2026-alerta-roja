<?php
header('Content-Type: application/json');

require_once 'conexion.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode([
        'success' => false,
        'message' => 'Método no permitido'
    ]);
    exit;
}

$nombre = trim($_POST['nombre'] ?? '');
$correo = trim($_POST['correo'] ?? '');
$contrasena = trim($_POST['contrasena'] ?? '');

if ($nombre === '' || $correo === '' || $contrasena === '') {
    echo json_encode([
        'success' => false,
        'message' => 'Todos los campos son obligatorios'
    ]);
    exit;
}

if (!filter_var($correo, FILTER_VALIDATE_EMAIL)) {
    echo json_encode([
        'success' => false,
        'message' => 'El correo no es válido'
    ]);
    exit;
}

if (strlen($contrasena) < 6) {
    echo json_encode([
        'success' => false,
        'message' => 'La contraseña debe tener al menos 6 caracteres'
    ]);
    exit;
}

// Verificar si el correo ya existe
$sqlVerificar = "SELECT id_usuario FROM ar_usuarios WHERE correo = ?";
$stmtVerificar = $conn->prepare($sqlVerificar);
$stmtVerificar->bind_param("s", $correo);
$stmtVerificar->execute();
$resultadoVerificar = $stmtVerificar->get_result();

if ($resultadoVerificar->num_rows > 0) {
    echo json_encode([
        'success' => false,
        'message' => 'Ese correo ya está registrado'
    ]);
    $stmtVerificar->close();
    $conn->close();
    exit;
}
$stmtVerificar->close();

// Encriptar contraseña
$contrasenaHash = password_hash($contrasena, PASSWORD_DEFAULT);

// Insertar usuario con rol Ciudadano = 2
$sqlInsertar = "INSERT INTO ar_usuarios (nombre, correo, contrasena, id_rol) VALUES (?, ?, ?, 2)";
$stmtInsertar = $conn->prepare($sqlInsertar);
$stmtInsertar->bind_param("sss", $nombre, $correo, $contrasenaHash);

if ($stmtInsertar->execute()) {
    echo json_encode([
        'success' => true,
        'message' => 'Usuario registrado correctamente'
    ]);
} else {
    echo json_encode([
        'success' => false,
        'message' => 'Error al registrar el usuario'
    ]);
}

$stmtInsertar->close();
$conn->close();
?>