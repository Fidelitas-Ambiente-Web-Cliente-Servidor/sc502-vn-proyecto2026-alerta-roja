<?php
session_start();
header('Content-Type: application/json');

require_once 'conexion.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode([
        'success' => false,
        'message' => 'Método no permitido'
    ]);
    exit;
}

$correo = trim($_POST['correo'] ?? '');
$contrasena = trim($_POST['contrasena'] ?? '');

if ($correo === '' || $contrasena === '') {
    echo json_encode([
        'success' => false,
        'message' => 'Correo y contraseña son obligatorios'
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

$sql = "SELECT u.id_usuario, u.nombre, u.correo, u.contrasena, u.activo, r.nombre_rol
        FROM ar_usuarios u
        INNER JOIN ar_roles r ON u.id_rol = r.id_rol
        WHERE u.correo = ? 
        LIMIT 1";

$stmt = $conn->prepare($sql);
$stmt->bind_param("s", $correo);
$stmt->execute();
$resultado = $stmt->get_result();

if ($resultado->num_rows === 0) {
    echo json_encode([
        'success' => false,
        'message' => 'Credenciales incorrectas'
    ]);
    $stmt->close();
    $conn->close();
    exit;
}

$usuario = $resultado->fetch_assoc();

if ((int)$usuario['activo'] !== 1) {
    echo json_encode([
        'success' => false,
        'message' => 'Usuario inactivo'
    ]);
    $stmt->close();
    $conn->close();
    exit;
}

if (!password_verify($contrasena, $usuario['contrasena'])) {
    echo json_encode([
        'success' => false,
        'message' => 'Credenciales incorrectas'
    ]);
    $stmt->close();
    $conn->close();
    exit;
}

$_SESSION['id_usuario'] = $usuario['id_usuario'];
$_SESSION['nombre'] = $usuario['nombre'];
$_SESSION['correo'] = $usuario['correo'];
$_SESSION['rol'] = $usuario['nombre_rol'];

echo json_encode([
    'success' => true,
    'message' => 'Inicio de sesión exitoso',
    'rol' => $usuario['nombre_rol']
]);

$stmt->close();
$conn->close();
?>