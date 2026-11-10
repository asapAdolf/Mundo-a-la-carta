-- =====================================================================
-- PROYECTO: MUNDO A LA CARTA - ESQUEMA PARA MYSQL / MARIADB
-- =====================================================================

CREATE DATABASE IF NOT EXISTS mundo_a_la_carta CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE mundo_a_la_carta;

-- 1. SEGURIDAD Y EMPLEADOS
CREATE TABLE IF NOT EXISTS roles (
    id VARCHAR(30) PRIMARY KEY,
    descripcion VARCHAR(200) NOT NULL,
    nivel_acceso INT NOT NULL DEFAULT 1
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS empleados (
    folio VARCHAR(10) PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    telefono VARCHAR(15),
    area ENUM('Administración', 'Ventas', 'Cocina', 'Operaciones', 'Recursos Humanos') NOT NULL,
    correo VARCHAR(100) NOT NULL UNIQUE,
    rol_puesto VARCHAR(30) NOT NULL,
    clave_contrato VARCHAR(20) NOT NULL UNIQUE,
    usuario VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    estado ENUM('Activo', 'Baja', 'Inactivo') NOT NULL DEFAULT 'Activo',
    foto_url VARCHAR(255),
    retencion_hasta DATE NULL,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    modificado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (rol_puesto) REFERENCES roles(id) ON UPDATE CASCADE
) ENGINE=InnoDB;

-- 2. CLIENTES / USUARIOS
CREATE TABLE IF NOT EXISTS usuarios (
    folio VARCHAR(10) PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    direccion VARCHAR(150),
    tipo_cliente ENUM('Nuevo', 'Frecuente', 'VIP', 'Corporativo') NOT NULL DEFAULT 'Nuevo',
    contacto_emergencia VARCHAR(150),
    telefono VARCHAR(15) NOT NULL,
    telefono_contacto_emergencia VARCHAR(15),
    correo_electronico VARCHAR(150) NOT NULL UNIQUE,
    observaciones_especiales VARCHAR(250),
    password_hash VARCHAR(255) NOT NULL,
    estado ENUM('Activo', 'Inactivo', 'Baja') NOT NULL DEFAULT 'Activo',
    foto_url VARCHAR(255),
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    modificado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 3. PROVEEDORES Y SOUVENIRS
CREATE TABLE IF NOT EXISTS proveedores (
    id VARCHAR(20) PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    departamento VARCHAR(50),
    contacto VARCHAR(100),
    telefono VARCHAR(20),
    correo VARCHAR(100),
    activo TINYINT(1) NOT NULL DEFAULT 1,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS souvenirs (
    folio VARCHAR(10) PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    precio_unitario DECIMAL(10,2) NOT NULL,
    departamento VARCHAR(50) NOT NULL,
    proveedor_id VARCHAR(20) NOT NULL,
    descripcion VARCHAR(300),
    existencia INT NOT NULL DEFAULT 0,
    estado ENUM('Activo', 'Inactivo', 'Vigente', 'Descontinuado') NOT NULL DEFAULT 'Activo',
    foto_url VARCHAR(255),
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    modificado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (proveedor_id) REFERENCES proveedores(id) ON UPDATE CASCADE
) ENGINE=InnoDB;

-- 4. TRANSPORTE
CREATE TABLE IF NOT EXISTS transporte (
    folio VARCHAR(10) PRIMARY KEY,
    vin VARCHAR(17) NOT NULL UNIQUE,
    equipamiento_inmersivo VARCHAR(150),
    marca VARCHAR(50) NOT NULL,
    capacidad INT NOT NULL,
    modelo VARCHAR(50) NOT NULL,
    folio_poliza_seguro VARCHAR(30) NOT NULL,
    placas VARCHAR(15) NOT NULL UNIQUE,
    vigencia_poliza DATE NOT NULL,
    tipo_vehiculo VARCHAR(50) NOT NULL,
    vigencia_tarjeta_circulacion DATE NOT NULL,
    color VARCHAR(30) NOT NULL,
    estatus_verificacion VARCHAR(30) NOT NULL,
    estado ENUM('Disponible', 'En mantenimiento', 'Retirado') NOT NULL DEFAULT 'Disponible',
    motivo_baja VARCHAR(250),
    foto_url VARCHAR(255),
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    modificado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 5. SALAS, AMBIENTACIONES Y RESERVAS
CREATE TABLE IF NOT EXISTS salas (
    id VARCHAR(20) PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    capacidad INT NOT NULL,
    estado ENUM('Disponible', 'Ocupada', 'Mantenimiento') NOT NULL DEFAULT 'Disponible'
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS ambientaciones (
    id VARCHAR(30) PRIMARY KEY,
    descripcion VARCHAR(255),
    icono VARCHAR(50)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS menus (
    tipo VARCHAR(30) PRIMARY KEY,
    precio_persona DECIMAL(10,2) NOT NULL,
    descripcion VARCHAR(255)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS reservaciones (
    folio VARCHAR(15) PRIMARY KEY,
    cliente_folio VARCHAR(10) NOT NULL,
    fecha DATE NOT NULL,
    hora_entrada TIME NOT NULL,
    hora_salida TIME NOT NULL,
    comensales INT NOT NULL,
    tipo_evento ENUM('Cumpleaños', 'Aniversario', 'Boda', 'Corporativo', 'Otro') NOT NULL,
    tipo_menu VARCHAR(30) NOT NULL,
    tipo_mesa ENUM('Estándar', 'Redonda', 'Privada', 'Terraza') NOT NULL,
    sala_id VARCHAR(20) NOT NULL,
    ambientacion_id VARCHAR(30) NOT NULL,
    alergias VARCHAR(200) DEFAULT 'Ninguna',
    descorche TINYINT(1) NOT NULL DEFAULT 0,
    vegetariano TINYINT(1) NOT NULL DEFAULT 0,
    vegano TINYINT(1) NOT NULL DEFAULT 0,
    precio_persona DECIMAL(10,2) NOT NULL,
    monto_reserva DECIMAL(10,2) NOT NULL,
    observaciones VARCHAR(250),
    estado ENUM('Activa', 'Completada', 'Cancelada', 'Cancelada con Devolución', 'Baja') NOT NULL DEFAULT 'Activa',
    motivo_cancelacion VARCHAR(200),
    multa_monto DECIMAL(10,2) DEFAULT 0.00,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    modificado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (cliente_folio) REFERENCES usuarios(folio) ON UPDATE CASCADE,
    FOREIGN KEY (tipo_menu) REFERENCES menus(tipo) ON UPDATE CASCADE,
    FOREIGN KEY (sala_id) REFERENCES salas(id) ON UPDATE CASCADE,
    FOREIGN KEY (ambientacion_id) REFERENCES ambientaciones(id) ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS recepciones (
    folio VARCHAR(15) PRIMARY KEY,
    reservacion_folio VARCHAR(15) NOT NULL UNIQUE,
    fecha_hora TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    observaciones VARCHAR(250),
    empleado_folio VARCHAR(10),
    estado VARCHAR(20) NOT NULL DEFAULT 'Registrada',
    FOREIGN KEY (reservacion_folio) REFERENCES reservaciones(folio) ON DELETE CASCADE,
    FOREIGN KEY (empleado_folio) REFERENCES empleados(folio)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS inmersiones (
    folio VARCHAR(15) PRIMARY KEY,
    reservacion_folio VARCHAR(15) NOT NULL UNIQUE,
    vehiculo_folio VARCHAR(10),
    fecha_hora TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    observaciones VARCHAR(250),
    empleado_folio VARCHAR(10),
    estado VARCHAR(20) NOT NULL DEFAULT 'En curso',
    FOREIGN KEY (reservacion_folio) REFERENCES reservaciones(folio) ON DELETE CASCADE,
    FOREIGN KEY (vehiculo_folio) REFERENCES transporte(folio),
    FOREIGN KEY (empleado_folio) REFERENCES empleados(folio)
) ENGINE=InnoDB;

-- 6. MESAS Y COMANDAS
CREATE TABLE IF NOT EXISTS mesas (
    folio VARCHAR(10) PRIMARY KEY,
    zona VARCHAR(10) NOT NULL,
    numero INT NOT NULL,
    capacidad INT NOT NULL DEFAULT 4,
    estado ENUM('Libre', 'Ocupada', 'Reservada', 'Mantenimiento') NOT NULL DEFAULT 'Libre',
    mesero_folio VARCHAR(10),
    FOREIGN KEY (mesero_folio) REFERENCES empleados(folio)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS comandas (
    folio VARCHAR(15) PRIMARY KEY,
    mesa_folio VARCHAR(10) NOT NULL,
    mesero_folio VARCHAR(10) NOT NULL,
    fecha_hora TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    subtotal DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    iva DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    total DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    estado ENUM('Abierta', 'En cocina', 'Cobrada', 'Cancelada') NOT NULL DEFAULT 'Abierta',
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    cerrado_en TIMESTAMP NULL,
    FOREIGN KEY (mesa_folio) REFERENCES mesas(folio),
    FOREIGN KEY (mesero_folio) REFERENCES empleados(folio)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS comanda_detalles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    comanda_folio VARCHAR(15) NOT NULL,
    articulo_nombre VARCHAR(100) NOT NULL,
    precio_unitario DECIMAL(10,2) NOT NULL,
    cantidad INT NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    enviado_cocina TINYINT(1) NOT NULL DEFAULT 0,
    cancelado TINYINT(1) NOT NULL DEFAULT 0,
    cancelado_por_gerente VARCHAR(10),
    motivo_cancelacion VARCHAR(200),
    FOREIGN KEY (comanda_folio) REFERENCES comandas(folio) ON DELETE CASCADE,
    FOREIGN KEY (cancelado_por_gerente) REFERENCES empleados(folio)
) ENGINE=InnoDB;

-- 7. CARTA Y EXPERIENCIAS
CREATE TABLE IF NOT EXISTS productos_carta (
    folio VARCHAR(50) PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    precio DECIMAL(10,2) NOT NULL,
    categoria ENUM(
        'Bebidas', 'Entradas', 'Postres', 'Mar y Tierra', 'Pastas', 'Pizzas', 
        'Sopas', 'Croisssants', 'Molletes', 'Tapas', 'Crepas', 'Paninos', 'Cafe', 'Cocteleria'
    ) NOT NULL,
    icono VARCHAR(50),
    tipo VARCHAR(20) NOT NULL DEFAULT 'Carta',
    estado VARCHAR(20) NOT NULL DEFAULT 'Activo'
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS experiencias (
    folio VARCHAR(50) PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    ambientacion_id VARCHAR(30) NOT NULL,
    descripcion VARCHAR(255),
    precio DECIMAL(10,2) NOT NULL,
    icono VARCHAR(50),
    tipo VARCHAR(20) NOT NULL DEFAULT 'Experiencia',
    estado VARCHAR(20) NOT NULL DEFAULT 'Activo',
    FOREIGN KEY (ambientacion_id) REFERENCES ambientaciones(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS pedidos (
    folio VARCHAR(20) PRIMARY KEY,
    cliente_folio VARCHAR(10),
    fecha_hora TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metodo_entrega VARCHAR(50) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    servicio DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    iva DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    total DECIMAL(10,2) NOT NULL,
    metodo_pago VARCHAR(50) NOT NULL,
    estado ENUM('Pendiente', 'Pagado', 'Entregado', 'Cancelado') NOT NULL DEFAULT 'Pagado',
    FOREIGN KEY (cliente_folio) REFERENCES usuarios(folio)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS pedido_detalles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pedido_folio VARCHAR(20) NOT NULL,
    producto_folio VARCHAR(50) NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    precio_unitario DECIMAL(10,2) NOT NULL,
    cantidad INT NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (pedido_folio) REFERENCES pedidos(folio) ON DELETE CASCADE,
    FOREIGN KEY (producto_folio) REFERENCES productos_carta(folio)
) ENGINE=InnoDB;

-- 8. VENTAS DE SOUVENIRS
CREATE TABLE IF NOT EXISTS ventas (
    folio VARCHAR(20) PRIMARY KEY,
    fecha_hora TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    cliente_nombre VARCHAR(150) NOT NULL,
    cliente_folio VARCHAR(10),
    souvenir_folio VARCHAR(10) NOT NULL,
    cantidad INT NOT NULL,
    precio_unitario DECIMAL(10,2) NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    metodo_pago ENUM('Efectivo', 'Tarjeta') NOT NULL,
    monto_recibido DECIMAL(10,2),
    cambio DECIMAL(10,2),
    vendedor_folio VARCHAR(10) NOT NULL,
    estado ENUM('Pagado', 'Devuelto', 'Cancelado') NOT NULL DEFAULT 'Pagado',
    observaciones VARCHAR(200),
    FOREIGN KEY (cliente_folio) REFERENCES usuarios(folio),
    FOREIGN KEY (souvenir_folio) REFERENCES souvenirs(folio),
    FOREIGN KEY (vendedor_folio) REFERENCES empleados(folio)
) ENGINE=InnoDB;

-- 9. COMPRAS
CREATE TABLE IF NOT EXISTS compras (
    folio VARCHAR(20) PRIMARY KEY,
    proveedor_id VARCHAR(20) NOT NULL,
    fecha_compra DATE NOT NULL,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    estado ENUM('Emitida', 'Recibida', 'Devuelta', 'Cancelada') NOT NULL DEFAULT 'Emitida',
    observaciones VARCHAR(250),
    total DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    FOREIGN KEY (proveedor_id) REFERENCES proveedores(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS compra_detalles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    compra_folio VARCHAR(20) NOT NULL,
    tipo_producto ENUM('Souvenir', 'Ingrediente') NOT NULL,
    articulo VARCHAR(100) NOT NULL,
    estado_articulo VARCHAR(20) DEFAULT 'Vigente',
    cantidad INT NOT NULL,
    precio_unitario DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (compra_folio) REFERENCES compras(folio) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 10. DEVOLUCIONES
CREATE TABLE IF NOT EXISTS devoluciones_compras (
    folio VARCHAR(25) PRIMARY KEY,
    compra_folio VARCHAR(20) NOT NULL UNIQUE,
    fecha_hora TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total_devuelto DECIMAL(10,2) NOT NULL,
    motivo VARCHAR(250),
    estado VARCHAR(20) NOT NULL DEFAULT 'Devuelta',
    FOREIGN KEY (compra_folio) REFERENCES compras(folio)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS devoluciones_ventas (
    folio VARCHAR(25) PRIMARY KEY,
    venta_folio VARCHAR(20) NOT NULL UNIQUE,
    fecha_hora TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    motivo VARCHAR(200) NOT NULL,
    monto_reembolso DECIMAL(10,2) NOT NULL,
    forma_reembolso ENUM('Tarjeta', 'Efectivo', 'Transferencia') NOT NULL,
    estado_souvenir VARCHAR(50) DEFAULT 'Bueno · se reintegra al inventario',
    reintegra_inventario TINYINT(1) NOT NULL DEFAULT 1,
    observaciones_dictamen VARCHAR(250),
    autorizado_por VARCHAR(10),
    estado ENUM('Pendiente', 'Autorizada', 'Rechazada') NOT NULL DEFAULT 'Pendiente',
    FOREIGN KEY (venta_folio) REFERENCES ventas(folio),
    FOREIGN KEY (autorizado_por) REFERENCES empleados(folio)
) ENGINE=InnoDB;

