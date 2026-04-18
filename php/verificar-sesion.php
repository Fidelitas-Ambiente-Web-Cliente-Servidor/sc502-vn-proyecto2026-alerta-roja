<?php
session_start();
header('Content-Type: application/json');

if (isset($_SESSION['id_usuario'])) {
    echo json_encode([
        'logged_in' => true,
        'id_usuario' => $_SESSION['id_usuario'],
        'nombre' => $_SESSION['nombre'] ?? '',
        'correo' => $_SESSION['correo'] ?? '',
        'rol' => $_SESSION['rol'] ?? ''
    ]);
} else {
    echo json_encode([
        'logged_in' => false
    ]);
}
?>