<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

include "conexion.php";

$response = [];

// TOTAL DE REPORTES
$sql1 = "SELECT COUNT(*) as total FROM reportes";
$result1 = mysqli_query($conn, $sql1);
$response['total_reportes'] = mysqli_fetch_assoc($result1)['total'] ?? 0;

// REPORTES PRIORITARIOS (según tu lógica >= 20)
$sql2 = "SELECT COUNT(*) as total FROM reportes WHERE prioridad >= 20";
$result2 = mysqli_query($conn, $sql2);
$response['prioritarios'] = mysqli_fetch_assoc($result2)['total'] ?? 0;

// USUARIOS REGISTRADOS
$sql3 = "SELECT COUNT(*) as total FROM usuarios";
$result3 = mysqli_query($conn, $sql3);
$response['usuarios'] = mysqli_fetch_assoc($result3)['total'] ?? 0;

// REPORTES ENVIADOS (ojo mayúscula)
$sql4 = "SELECT COUNT(*) as total FROM reportes WHERE estado = 'Enviado'";
$result4 = mysqli_query($conn, $sql4);
$response['enviados'] = mysqli_fetch_assoc($result4)['total'] ?? 0;

header('Content-Type: application/json');
echo json_encode($response);
?>