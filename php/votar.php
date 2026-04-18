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

if (!isset($_SESSION['id_usuario'])) {
    echo json_encode([
        'success' => false,
        'message' => 'Debe iniciar sesión para votar'
    ]);
    exit;
}

$idUsuario = (int)$_SESSION['id_usuario'];
$idReporte = (int)($_POST['id_reporte'] ?? 0);

if ($idReporte <= 0) {
    echo json_encode([
        'success' => false,
        'message' => 'Reporte inválido'
    ]);
    exit;
}

// Verificar si ya votó
$sqlVerificar = "SELECT id_voto 
                 FROM ar_votos 
                 WHERE id_usuario = ? AND id_reporte = ?";

$stmtVerificar = $conn->prepare($sqlVerificar);

if (!$stmtVerificar) {
    echo json_encode([
        'success' => false,
        'message' => 'Error al preparar validación: ' . $conn->error
    ]);
    exit;
}

$stmtVerificar->bind_param("ii", $idUsuario, $idReporte);
$stmtVerificar->execute();
$resultadoVerificar = $stmtVerificar->get_result();

if ($resultadoVerificar->num_rows > 0) {
    echo json_encode([
        'success' => false,
        'message' => 'Ya votó por este reporte'
    ]);
    $stmtVerificar->close();
    $conn->close();
    exit;
}

$stmtVerificar->close();

// Insertar voto
$sqlVoto = "INSERT INTO ar_votos (id_usuario, id_reporte) VALUES (?, ?)";
$stmtVoto = $conn->prepare($sqlVoto);

if (!$stmtVoto) {
    echo json_encode([
        'success' => false,
        'message' => 'Error al preparar voto: ' . $conn->error
    ]);
    exit;
}

$stmtVoto->bind_param("ii", $idUsuario, $idReporte);

if (!$stmtVoto->execute()) {
    echo json_encode([
        'success' => false,
        'message' => 'Error al guardar voto: ' . $stmtVoto->error
    ]);
    $stmtVoto->close();
    $conn->close();
    exit;
}

$stmtVoto->close();

// Actualizar cantidad de votos
$sqlActualizar = "UPDATE ar_reportes
                  SET cantidad_votos = cantidad_votos + 1,
                      prioridad = cantidad_votos + 1
                  WHERE id_reporte = ?";

$stmtActualizar = $conn->prepare($sqlActualizar);

if (!$stmtActualizar) {
    echo json_encode([
        'success' => false,
        'message' => 'Error al preparar actualización: ' . $conn->error
    ]);
    exit;
}

$stmtActualizar->bind_param("i", $idReporte);

if ($stmtActualizar->execute()) {
    echo json_encode([
        'success' => true,
        'message' => 'Voto registrado correctamente'
    ]);
} else {
    echo json_encode([
        'success' => false,
        'message' => 'Error al actualizar reporte: ' . $stmtActualizar->error
    ]);
}

$stmtActualizar->close();
$conn->close();
