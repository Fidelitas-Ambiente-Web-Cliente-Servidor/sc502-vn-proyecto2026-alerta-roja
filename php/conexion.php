<?php
$host = "db";
$puerto = 3306;
$basedatos = "appdb";
$usuario = "appuser";
$contrasena = "apppass";

$conn = new mysqli($host, $usuario, $contrasena, $basedatos, $puerto);

if ($conn->connect_error) {
    die("Error de conexión: " . $conn->connect_error);
}

$conn->set_charset("utf8mb4");
?>