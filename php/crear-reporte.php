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
        'message' => 'Debe iniciar sesión para crear un reporte'
    ]);
    exit;
}

$titulo = trim($_POST['titulo'] ?? '');
$descripcion = trim($_POST['descripcion'] ?? '');
$categoria = trim($_POST['categoria'] ?? '');
$tipo = trim($_POST['tipo'] ?? '');
$idProvincia = (int)($_POST['provincia'] ?? 0);
$idCanton = (int)($_POST['canton'] ?? 0);
$fecha = trim($_POST['fecha'] ?? '');
$hora = trim($_POST['hora'] ?? '');

if (
    $titulo === '' ||
    $descripcion === '' ||
    $categoria === '' ||
    $tipo === '' ||
    $idProvincia <= 0 ||
    $idCanton <= 0 ||
    $fecha === '' ||
    $hora === ''
) {
    echo json_encode([
        'success' => false,
        'message' => 'Todos los campos son obligatorios'
    ]);
    exit;
}

if (strlen($titulo) < 5) {
    echo json_encode([
        'success' => false,
        'message' => 'El título debe tener al menos 5 caracteres'
    ]);
    exit;
}

if (strlen($descripcion) < 10) {
    echo json_encode([
        'success' => false,
        'message' => 'La descripción debe tener al menos 10 caracteres'
    ]);
    exit;
}

// Validar categoría
$sqlCategoria = "SELECT id_categoria
                 FROM ar_categorias
                 WHERE nombre_categoria = ?
                 LIMIT 1";

$stmtCategoria = $conn->prepare($sqlCategoria);

if (!$stmtCategoria) {
    echo json_encode([
        'success' => false,
        'message' => 'Error al preparar categoría: ' . $conn->error
    ]);
    exit;
}

$stmtCategoria->bind_param("s", $categoria);
$stmtCategoria->execute();
$resultadoCategoria = $stmtCategoria->get_result();

if ($resultadoCategoria->num_rows === 0) {
    echo json_encode([
        'success' => false,
        'message' => 'Categoría inválida'
    ]);
    $stmtCategoria->close();
    exit;
}

$idCategoria = (int)$resultadoCategoria->fetch_assoc()['id_categoria'];
$stmtCategoria->close();

// Validar provincia
$sqlProvincia = "SELECT id_provincia
                 FROM ar_provincias
                 WHERE id_provincia = ?
                 LIMIT 1";

$stmtProvincia = $conn->prepare($sqlProvincia);

if (!$stmtProvincia) {
    echo json_encode([
        'success' => false,
        'message' => 'Error al preparar provincia: ' . $conn->error
    ]);
    exit;
}

$stmtProvincia->bind_param("i", $idProvincia);
$stmtProvincia->execute();
$resultadoProvincia = $stmtProvincia->get_result();

if ($resultadoProvincia->num_rows === 0) {
    echo json_encode([
        'success' => false,
        'message' => 'Provincia inválida'
    ]);
    $stmtProvincia->close();
    exit;
}

$stmtProvincia->close();

// Validar cantón dentro de la provincia
$sqlCanton = "SELECT id_canton
              FROM ar_cantones
              WHERE id_canton = ? AND id_provincia = ?
              LIMIT 1";

$stmtCanton = $conn->prepare($sqlCanton);

if (!$stmtCanton) {
    echo json_encode([
        'success' => false,
        'message' => 'Error al preparar cantón: ' . $conn->error
    ]);
    exit;
}

$stmtCanton->bind_param("ii", $idCanton, $idProvincia);
$stmtCanton->execute();
$resultadoCanton = $stmtCanton->get_result();

if ($resultadoCanton->num_rows === 0) {
    echo json_encode([
        'success' => false,
        'message' => 'Cantón inválido para la provincia seleccionada'
    ]);
    $stmtCanton->close();
    exit;
}

$stmtCanton->close();

$idEstado = 1;
$anonimo = ($tipo === 'anonimo') ? 1 : 0;

if ($anonimo === 1) {
    $sql = "INSERT INTO ar_reportes (
                titulo,
                descripcion,
                fecha_reporte,
                hora_reporte,
                anonimo,
                prioridad,
                cantidad_votos,
                id_usuario,
                id_categoria,
                id_provincia,
                id_canton,
                id_estado
            ) VALUES (?, ?, ?, ?, ?, 0, 0, NULL, ?, ?, ?, ?)";

    $stmt = $conn->prepare($sql);

    if (!$stmt) {
        echo json_encode([
            'success' => false,
            'message' => 'Error al preparar inserción: ' . $conn->error
        ]);
        exit;
    }

    $stmt->bind_param(
        "ssssiiiii",
        $titulo,
        $descripcion,
        $fecha,
        $hora,
        $anonimo,
        $idCategoria,
        $idProvincia,
        $idCanton,
        $idEstado
    );
} else {
    $idUsuario = (int)$_SESSION['id_usuario'];

    $sql = "INSERT INTO ar_reportes (
                titulo,
                descripcion,
                fecha_reporte,
                hora_reporte,
                anonimo,
                prioridad,
                cantidad_votos,
                id_usuario,
                id_categoria,
                id_provincia,
                id_canton,
                id_estado
            ) VALUES (?, ?, ?, ?, ?, 0, 0, ?, ?, ?, ?, ?)";

    $stmt = $conn->prepare($sql);

    if (!$stmt) {
        echo json_encode([
            'success' => false,
            'message' => 'Error al preparar inserción: ' . $conn->error
        ]);
        exit;
    }

    $stmt->bind_param(
        "ssssiiiiii",
        $titulo,
        $descripcion,
        $fecha,
        $hora,
        $anonimo,
        $idUsuario,
        $idCategoria,
        $idProvincia,
        $idCanton,
        $idEstado
    );
}

if ($stmt->execute()) {
    echo json_encode([
        'success' => true,
        'message' => 'Reporte creado correctamente'
    ]);
} else {
    echo json_encode([
        'success' => false,
        'message' => 'Error al crear el reporte: ' . $stmt->error
    ]);
}

$stmt->close();
$conn->close();
?>