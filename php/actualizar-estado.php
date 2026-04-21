<?php
require_once "conexion.php";

$id = $_POST['id_reporte'] ?? 0;
$estado = $_POST['estado'] ?? '';

$sql = "UPDATE ar_reportes SET id_estado = 
    (SELECT id_estado FROM ar_estados_reporte WHERE nombre_estado = ?) 
    WHERE id_reporte = ?";

$stmt = $conn->prepare($sql);
$stmt->bind_param("si", $estado, $id);

if ($stmt->execute()) {
    echo json_encode(["success" => true]);
} else {
    echo json_encode(["success" => false]);
}