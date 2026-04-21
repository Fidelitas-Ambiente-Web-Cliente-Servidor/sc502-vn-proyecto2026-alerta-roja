USE appdb;

-- =========================
-- TABLA ROLES
-- =========================
CREATE TABLE IF NOT EXISTS ar_roles (
    id_rol INT AUTO_INCREMENT PRIMARY KEY,
    nombre_rol VARCHAR(50) NOT NULL UNIQUE
);

-- =========================
-- TABLA USUARIOS
-- =========================
CREATE TABLE IF NOT EXISTS ar_usuarios (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    correo VARCHAR(150) NOT NULL UNIQUE,
    contrasena VARCHAR(255) NOT NULL,
    fecha_registro DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    activo TINYINT(1) NOT NULL DEFAULT 1,
    id_rol INT NOT NULL,
    CONSTRAINT fk_ar_usuarios_roles
        FOREIGN KEY (id_rol) REFERENCES ar_roles(id_rol)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
);

-- =========================
-- TABLA PROVINCIAS
-- =========================
CREATE TABLE IF NOT EXISTS ar_provincias (
    id_provincia INT AUTO_INCREMENT PRIMARY KEY,
    nombre_provincia VARCHAR(100) NOT NULL UNIQUE
);

-- =========================
-- TABLA CANTONES
-- =========================
CREATE TABLE IF NOT EXISTS ar_cantones (
    id_canton INT AUTO_INCREMENT PRIMARY KEY,
    nombre_canton VARCHAR(100) NOT NULL,
    id_provincia INT NOT NULL,
    CONSTRAINT fk_ar_cantones_provincias
        FOREIGN KEY (id_provincia) REFERENCES ar_provincias(id_provincia)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,
    CONSTRAINT uq_ar_canton_provincia UNIQUE (nombre_canton, id_provincia)
);

-- =========================
-- TABLA CATEGORIAS
-- =========================
CREATE TABLE IF NOT EXISTS ar_categorias (
    id_categoria INT AUTO_INCREMENT PRIMARY KEY,
    nombre_categoria VARCHAR(100) NOT NULL UNIQUE,
    descripcion VARCHAR(255)
);

-- =========================
-- TABLA ESTADOS REPORTE
-- =========================
CREATE TABLE IF NOT EXISTS ar_estados_reporte (
    id_estado INT AUTO_INCREMENT PRIMARY KEY,
    nombre_estado VARCHAR(50) NOT NULL UNIQUE
);

-- =========================
-- TABLA INSTITUCIONES
-- =========================
CREATE TABLE IF NOT EXISTS ar_instituciones (
    id_institucion INT AUTO_INCREMENT PRIMARY KEY,
    nombre_institucion VARCHAR(120) NOT NULL UNIQUE,
    tipo_institucion VARCHAR(100),
    correo_contacto VARCHAR(150),
    telefono VARCHAR(30),
    activo TINYINT(1) NOT NULL DEFAULT 1
);

-- =========================
-- TABLA REPORTES
-- =========================
CREATE TABLE IF NOT EXISTS ar_reportes (
    id_reporte INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(150) NOT NULL,
    descripcion TEXT NOT NULL,
    fecha_reporte DATE NOT NULL,
    hora_reporte TIME NOT NULL,
    anonimo TINYINT(1) NOT NULL DEFAULT 0,
    prioridad INT NOT NULL DEFAULT 0,
    cantidad_votos INT NOT NULL DEFAULT 0,
    id_usuario INT NULL,
    id_categoria INT NOT NULL,
    id_provincia INT NOT NULL,
    id_canton INT NOT NULL,
    id_estado INT NOT NULL,
    fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_ar_reportes_usuarios
        FOREIGN KEY (id_usuario) REFERENCES ar_usuarios(id_usuario)
        ON UPDATE CASCADE
        ON DELETE SET NULL,
    CONSTRAINT fk_ar_reportes_categorias
        FOREIGN KEY (id_categoria) REFERENCES ar_categorias(id_categoria)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,
    CONSTRAINT fk_ar_reportes_provincias
        FOREIGN KEY (id_provincia) REFERENCES ar_provincias(id_provincia)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,
    CONSTRAINT fk_ar_reportes_cantones
        FOREIGN KEY (id_canton) REFERENCES ar_cantones(id_canton)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,
    CONSTRAINT fk_ar_reportes_estados
        FOREIGN KEY (id_estado) REFERENCES ar_estados_reporte(id_estado)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
);

-- =========================
-- TABLA VOTOS
-- =========================
CREATE TABLE IF NOT EXISTS ar_votos (
    id_voto INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    id_reporte INT NOT NULL,
    fecha_voto DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_ar_votos_usuarios
        FOREIGN KEY (id_usuario) REFERENCES ar_usuarios(id_usuario)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    CONSTRAINT fk_ar_votos_reportes
        FOREIGN KEY (id_reporte) REFERENCES ar_reportes(id_reporte)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    CONSTRAINT uq_ar_voto_usuario_reporte UNIQUE (id_usuario, id_reporte)
);

-- =========================
-- TABLA ENVIO REPORTES
-- =========================
CREATE TABLE IF NOT EXISTS ar_envio_reportes (
    id_envio INT AUTO_INCREMENT PRIMARY KEY,
    id_reporte INT NOT NULL,
    id_institucion INT NOT NULL,
    fecha_envio DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    observacion VARCHAR(255),
    CONSTRAINT fk_ar_envio_reportes_reporte
        FOREIGN KEY (id_reporte) REFERENCES ar_reportes(id_reporte)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    CONSTRAINT fk_ar_envio_reportes_institucion
        FOREIGN KEY (id_institucion) REFERENCES ar_instituciones(id_institucion)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
);

-- =========================
-- DATOS INICIALES
-- =========================
INSERT IGNORE INTO ar_roles (id_rol, nombre_rol) VALUES
(1, 'Administrador'),
(2, 'Ciudadano');

INSERT IGNORE INTO ar_estados_reporte (id_estado, nombre_estado) VALUES
(1, 'Registrado'),
(2, 'En revisión'),
(3, 'Prioritario'),
(4, 'Enviado'),
(5, 'Atendido'),
(6, 'Cerrado');

INSERT IGNORE INTO ar_categorias (id_categoria, nombre_categoria, descripcion) VALUES
(1, 'Inundación', 'Reportes relacionados con inundaciones'),
(2, 'Incendio', 'Reportes relacionados con incendios'),
(3, 'Accidente', 'Accidentes de tránsito u otros'),
(4, 'Deslizamiento', 'Deslizamientos o derrumbes'),
(5, 'Asalto', 'Situaciones de inseguridad o asalto'),
(6, 'Riesgo comunitario', 'Otras problemáticas comunitarias');

INSERT IGNORE INTO ar_instituciones (id_institucion, nombre_institucion, tipo_institucion, correo_contacto, telefono, activo) VALUES
(1, 'Cruz Roja Costarricense', 'Emergencias', 'contacto@cruzroja.or.cr', '0000-0000', 1),
(2, 'Cuerpo de Bomberos', 'Rescate y atención', 'contacto@bomberos.go.cr', '0000-0001', 1),
(3, 'Fuerza Pública', 'Seguridad', 'contacto@seguridad.go.cr', '0000-0002', 1),
(4, 'Municipalidad', 'Gobierno local', 'contacto@municipalidad.go.cr', '0000-0003', 1);

INSERT IGNORE INTO ar_provincias (id_provincia, nombre_provincia) VALUES
(1, 'San José'),
(2, 'Alajuela'),
(3, 'Cartago'),
(4, 'Heredia'),
(5, 'Guanacaste'),
(6, 'Puntarenas'),
(7, 'Limón');

INSERT IGNORE INTO ar_cantones (id_canton, nombre_canton, id_provincia) VALUES
(1, 'San José', 1),
(2, 'Escazú', 1),
(3, 'Desamparados', 1),
(4, 'Alajuela', 2),
(5, 'San Ramón', 2),
(6, 'Cartago', 3),
(7, 'Paraíso', 3),
(8, 'Heredia', 4),
(9, 'Barva', 4),
(10, 'Liberia', 5),
(11, 'Nicoya', 5),
(12, 'Puntarenas', 6),
(13, 'Quepos', 6),
(14, 'Limón', 7),
(15, 'Pococí', 7);