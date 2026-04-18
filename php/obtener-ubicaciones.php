<?php
header('Content-Type: application/json');

require_once 'conexion.php';

$tipo = $_GET['tipo'] ?? '';

if ($tipo === 'provincias') {
    $sql = "SELECT id_provincia, nombre_provincia
            FROM ar_provincias
            ORDER BY nombre_provincia ASC";

    $resultado = $conn->query($sql);

    if (!$resultado) {
        echo json_encode([
            'success' => false,
            'message' => 'Error al consultar provincias: ' . $conn->error
        ]);
        exit;
    }

    $provincias = [];

    while ($fila = $resultado->fetch_assoc()) {
        $provincias[] = $fila;
    }

    echo json_encode([
        'success' => true,
        'data' => $provincias
    ]);

    $conn->close();
    exit;
}

if ($tipo === 'cantones') {
    $idProvincia = (int)($_GET['id_provincia'] ?? 0);

    if ($idProvincia <= 0) {
        echo json_encode([
            'success' => false,
            'message' => 'Falta id_provincia válido'
        ]);
        exit;
    }

    $sql = "SELECT id_canton, nombre_canton
            FROM ar_cantones
            WHERE id_provincia = ?
            ORDER BY nombre_canton ASC";

    $stmt = $conn->prepare($sql);

    if (!$stmt) {
        echo json_encode([
            'success' => false,
            'message' => 'Error al preparar consulta de cantones: ' . $conn->error
        ]);
        exit;
    }

    $stmt->bind_param("i", $idProvincia);
    $stmt->execute();
    $resultado = $stmt->get_result();

    $cantones = [];

    while ($fila = $resultado->fetch_assoc()) {
        $cantones[] = $fila;
    }

    echo json_encode([
        'success' => true,
        'data' => $cantones
    ]);

    $stmt->close();
    $conn->close();
    exit;
}

echo json_encode([
    'success' => false,
    'message' => 'Tipo de consulta inválido'
]);

$conn->close();
?>