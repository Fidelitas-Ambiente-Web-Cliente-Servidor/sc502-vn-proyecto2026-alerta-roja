<?php
require_once "conexion.php";

$sql1 = "SELECT COUNT(*) as total FROM ar_reportes";
$result1 = mysqli_query($conn, $sql1);
$total_reportes = mysqli_fetch_assoc($result1)['total'] ?? 0;

$sql2 = "
SELECT COUNT(*) as total
FROM ar_reportes r
JOIN ar_estados_reporte e ON r.id_estado = e.id_estado
WHERE e.nombre_estado = 'Prioritario'
";
$result2 = mysqli_query($conn, $sql2);
$prioritarios = mysqli_fetch_assoc($result2)['total'] ?? 0;

$sql3 = "SELECT COUNT(*) as total FROM ar_usuarios";
$result3 = mysqli_query($conn, $sql3);
$usuarios = mysqli_fetch_assoc($result3)['total'] ?? 0;

$sql4 = "
SELECT COUNT(*) as total
FROM ar_reportes r
JOIN ar_estados_reporte e ON r.id_estado = e.id_estado
WHERE e.nombre_estado = 'Enviado'
";
$result4 = mysqli_query($conn, $sql4);
$enviados = mysqli_fetch_assoc($result4)['total'] ?? 0;

echo json_encode([
    "total_reportes" => $total_reportes,
    "prioritarios" => $prioritarios,
    "usuarios" => $usuarios,
    "enviados" => $enviados
]);