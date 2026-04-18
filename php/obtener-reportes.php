<?php
header('Content-Type: application/json');

require_once 'conexion.php';

$categoria = trim($_GET['categoria'] ?? '');
$provincia = trim($_GET['provincia'] ?? '');
$estado = trim($_GET['estado'] ?? '');

$sql = "SELECT 
            r.id_reporte,
            r.titulo,
            r.descripcion,
            r.fecha_reporte,
            r.hora_reporte,
            r.anonimo,
            r.prioridad,
            r.cantidad_votos,
            c.nombre_categoria,
            p.nombre_provincia,
            ca.nombre_canton,
            e.nombre_estado,
            u.nombre AS nombre_usuario,
            u.correo AS correo_usuario
        FROM ar_reportes r
        INNER JOIN ar_categorias c ON r.id_categoria = c.id_categoria
        INNER JOIN ar_provincias p ON r.id_provincia = p.id_provincia
        INNER JOIN ar_cantones ca ON r.id_canton = ca.id_canton
        INNER JOIN ar_estados_reporte e ON r.id_estado = e.id_estado
        LEFT JOIN ar_usuarios u ON r.id_usuario = u.id_usuario
        WHERE 1 = 1";

$parametros = [];
$tipos = "";

if ($categoria !== '') {
    $sql .= " AND c.nombre_categoria = ?";
    $parametros[] = $categoria;
    $tipos .= "s";
}

if ($provincia !== '') {
    $sql .= " AND p.nombre_provincia = ?";
    $parametros[] = $provincia;
    $tipos .= "s";
}

if ($estado !== '') {
    $sql .= " AND e.nombre_estado = ?";
    $parametros[] = $estado;
    $tipos .= "s";
}

$sql .= " ORDER BY r.fecha_creacion DESC";

$stmt = $conn->prepare($sql);

if (!$stmt) {
    echo json_encode([
        'success' => false,
        'message' => 'Error al preparar consulta: ' . $conn->error
    ]);
    exit;
}

if (!empty($parametros)) {
    $stmt->bind_param($tipos, ...$parametros);
}

$stmt->execute();
$resultado = $stmt->get_result();

$reportes = [];

while ($fila = $resultado->fetch_assoc()) {
    $fila['autor'] = ($fila['anonimo'] == 1)
        ? 'Anónimo'
        : ($fila['nombre_usuario'] ?: 'Identificado');

    $reportes[] = $fila;
}

echo json_encode([
    'success' => true,
    'data' => $reportes
]);

$stmt->close();
$conn->close();
