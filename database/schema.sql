-- =====================================================================
-- PROYECTO: MUNDO A LA CARTA - SISTEMA GASTRONÓMICO E INMERSIVO
-- SCRIPT: Definición de Esquema de Base de Datos Relacional (DDL)
-- COMPATIBILIDAD: SQLite 3 / MySQL 8.0+ / PostgreSQL 14+
-- =====================================================================

-- Habilitar claves foráneas (para SQLite)
PRAGMA foreign_keys = ON;

-- ---------------------------------------------------------------------
-- 1. MÓDULO DE SEGURIDAD, ROLES Y RECURSOS HUMANOS (EMPLEADOS)
-- ---------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS roles (
    id VARCHAR(30) PRIMARY KEY,
    descripcion VARCHAR(200) NOT NULL,
    nivel_acceso INT NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS empleados (
    folio VARCHAR(10) PRIMARY KEY, -- Formato: 6 dígitos (ej. 000123) - RN_87
    nombre VARCHAR(150) NOT NULL,
    telefono VARCHAR(15),
    area VARCHAR(50) NOT NULL CHECK (area IN ('Administración', 'Ventas', 'Cocina', 'Operaciones', 'Recursos Humanos')),
    correo VARCHAR(100) NOT NULL UNIQUE, -- RN_30
    rol_puesto VARCHAR(30) NOT NULL, -- RN_29
    clave_contrato VARCHAR(20) NOT NULL UNIQUE, -- RN_30
    usuario VARCHAR(50) NOT NULL UNIQUE, -- RN_30
    password_hash VARCHAR(255) NOT NULL,
    estado VARCHAR(20) NOT NULL DEFAULT 'Activo' CHECK (estado IN ('Activo', 'Baja', 'Inactivo')), -- RN_22, RN_26
    foto_url VARCHAR(255),
    retencion_hasta DATE, -- RN_28: 5 años a partir de la fecha de baja
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    modificado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (rol_puesto) REFERENCES roles(id) ON UPDATE CASCADE
);

-- ---------------------------------------------------------------------
-- 2. MÓDULO DE CLIENTES Y USUARIOS
-- ---------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS usuarios (
    folio VARCHAR(10) PRIMARY KEY, -- Formato: 6 dígitos (ej. 000123)
    nombre VARCHAR(150) NOT NULL,
    direccion VARCHAR(150),
    tipo_cliente VARCHAR(50) NOT NULL DEFAULT 'Nuevo' CHECK (tipo_cliente IN ('Nuevo', 'Frecuente', 'VIP', 'Corporativo')),
    contacto_emergencia VARCHAR(150),
    telefono VARCHAR(15) NOT NULL,
    telefono_contacto_emergencia VARCHAR(15),
    correo_electronico VARCHAR(150) NOT NULL UNIQUE,
    observaciones_especiales VARCHAR(250),
    password_hash VARCHAR(255) NOT NULL,
    estado VARCHAR(20) NOT NULL DEFAULT 'Activo' CHECK (estado IN ('Activo', 'Inactivo', 'Baja')),
    foto_url VARCHAR(255),
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    modificado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------------------
-- 3. MÓDULO DE PROVEEDORES E INVENTARIO DE SOUVENIRS
-- ---------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS proveedores (
    id VARCHAR(20) PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    departamento VARCHAR(50),
    contacto VARCHAR(100),
    telefono VARCHAR(20),
    correo VARCHAR(100),
    activo BOOLEAN NOT NULL DEFAULT 1,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS souvenirs (
    folio VARCHAR(10) PRIMARY KEY, -- Formato: 6 dígitos (ej. 000123)
    nombre VARCHAR(150) NOT NULL,
    precio_unitario DECIMAL(10,2) NOT NULL CHECK (precio_unitario >= 0),
    departamento VARCHAR(50) NOT NULL,
    proveedor_id VARCHAR(20) NOT NULL,
    descripcion VARCHAR(300),
    existencia INT NOT NULL DEFAULT 0 CHECK (existencia >= 0),
    estado VARCHAR(20) NOT NULL DEFAULT 'Activo' CHECK (estado IN ('Activo', 'Inactivo', 'Vigente', 'Descontinuado')),
    foto_url VARCHAR(255),
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    modificado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (proveedor_id) REFERENCES proveedores(id) ON UPDATE CASCADE
);

-- ---------------------------------------------------------------------
-- 4. MÓDULO DE TRANSPORTE Y EXPERIENCIAS INMERSIVAS MÓVILES
-- ---------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS transporte (
    folio VARCHAR(10) PRIMARY KEY, -- Formato: 6 dígitos (ej. 000123)
    vin VARCHAR(17) NOT NULL UNIQUE, -- RN_189: 17 caracteres alfanuméricos válidos
    equipamiento_inmersivo VARCHAR(150),
    marca VARCHAR(50) NOT NULL,
    capacidad INT NOT NULL CHECK (capacidad > 0), -- RN_190
    modelo VARCHAR(50) NOT NULL,
    folio_poliza_seguro VARCHAR(30) NOT NULL,
    placas VARCHAR(15) NOT NULL UNIQUE,
    vigencia_poliza DATE NOT NULL, -- RN_201: Debe estar vigente al registrar
    tipo_vehiculo VARCHAR(50) NOT NULL,
    vigencia_tarjeta_circulacion DATE NOT NULL,
    color VARCHAR(30) NOT NULL,
    estatus_verificacion VARCHAR(30) NOT NULL,
    estado VARCHAR(25) NOT NULL DEFAULT 'Disponible' CHECK (estado IN ('Disponible', 'En mantenimiento', 'Retirado')), -- RN_185
    motivo_baja VARCHAR(250), -- RN_197
    foto_url VARCHAR(255),
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    modificado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------------------
-- 5. MÓDULO DE RESERVACIONES, RECEPCIONES Y SALAS INMERSIVAS
-- ---------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS salas (
    id VARCHAR(20) PRIMARY KEY, -- ej. 'Sala 1', 'Sala 2'
    nombre VARCHAR(50) NOT NULL,
    capacidad INT NOT NULL CHECK (capacidad > 0),
    estado VARCHAR(20) NOT NULL DEFAULT 'Disponible' CHECK (estado IN ('Disponible', 'Ocupada', 'Mantenimiento'))
);

CREATE TABLE IF NOT EXISTS ambientaciones (
    id VARCHAR(30) PRIMARY KEY, -- ej. 'Torre Eiffel', 'Playa', 'Selva', 'Espacio', 'Clásica'
    descripcion VARCHAR(255),
    icono VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS menus (
    tipo VARCHAR(30) PRIMARY KEY, -- 'Gourmet', 'Ejecutivo', 'Infantil', 'Degustación'
    precio_persona DECIMAL(10,2) NOT NULL CHECK (precio_persona >= 0),
    descripcion VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS reservaciones (
    folio VARCHAR(15) PRIMARY KEY, -- ej. '1024'
    cliente_folio VARCHAR(10),
    cliente_nombre VARCHAR(150),
    fecha DATE NOT NULL,
    hora_entrada TIME NOT NULL,
    hora_salida TIME NOT NULL,
    comensales INT NOT NULL CHECK (comensales > 0),
    tipo_evento VARCHAR(50) NOT NULL CHECK (tipo_evento IN ('Cumpleaños', 'Aniversario', 'Boda', 'Corporativo', 'Otro')),
    tipo_menu VARCHAR(30) NOT NULL,
    tipo_mesa VARCHAR(50) NOT NULL CHECK (tipo_mesa IN ('Estándar', 'Redonda', 'Privada', 'Terraza')),
    sala_id VARCHAR(20) NOT NULL,
    ambientacion_id VARCHAR(30) NOT NULL,
    alergias VARCHAR(200) DEFAULT 'Ninguna',
    descorche BOOLEAN NOT NULL DEFAULT 0,
    vegetariano BOOLEAN NOT NULL DEFAULT 0,
    vegano BOOLEAN NOT NULL DEFAULT 0,
    precio_persona DECIMAL(10,2) NOT NULL,
    monto_reserva DECIMAL(10,2) NOT NULL CHECK (monto_reserva >= 0),
    observaciones VARCHAR(250),
    estado VARCHAR(30) NOT NULL DEFAULT 'Activa' CHECK (estado IN ('Activa', 'Completada', 'Cancelada', 'Cancelada con Devolución', 'Baja')),
    motivo_cancelacion VARCHAR(200),
    multa_monto DECIMAL(10,2) DEFAULT 0.00, -- 15% si no es anticipada
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    modificado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cliente_folio) REFERENCES usuarios(folio) ON UPDATE CASCADE,
    FOREIGN KEY (tipo_menu) REFERENCES menus(tipo) ON UPDATE CASCADE,
    FOREIGN KEY (sala_id) REFERENCES salas(id) ON UPDATE CASCADE,
    FOREIGN KEY (ambientacion_id) REFERENCES ambientaciones(id) ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS recepciones (
    folio VARCHAR(15) PRIMARY KEY, -- Comparte folio con la reservación
    reservacion_folio VARCHAR(15) NOT NULL UNIQUE,
    fecha_hora TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    observaciones VARCHAR(250),
    empleado_folio VARCHAR(10),
    estado VARCHAR(20) NOT NULL DEFAULT 'Registrada',
    FOREIGN KEY (reservacion_folio) REFERENCES reservaciones(folio) ON DELETE CASCADE,
    FOREIGN KEY (empleado_folio) REFERENCES empleados(folio)
);

CREATE TABLE IF NOT EXISTS inmersiones (
    folio VARCHAR(15) PRIMARY KEY, -- Comparte folio con la reservación
    reservacion_folio VARCHAR(15) NOT NULL UNIQUE,
    vehiculo_folio VARCHAR(10),
    fecha_hora TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    observaciones VARCHAR(250),
    empleado_folio VARCHAR(10),
    estado VARCHAR(20) NOT NULL DEFAULT 'En curso',
    FOREIGN KEY (reservacion_folio) REFERENCES reservaciones(folio) ON DELETE CASCADE,
    FOREIGN KEY (vehiculo_folio) REFERENCES transporte(folio),
    FOREIGN KEY (empleado_folio) REFERENCES empleados(folio)
);

-- ---------------------------------------------------------------------
-- 6. MÓDULO DE MESAS Y COMANDAS DE RESTAURANTE
-- ---------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS mesas (
    folio VARCHAR(10) PRIMARY KEY, -- ej. 'A1'..'A6', 'B1'..'B6', 'C1'..'C6'
    zona VARCHAR(10) NOT NULL,
    numero INT NOT NULL,
    capacidad INT NOT NULL DEFAULT 4,
    estado VARCHAR(20) NOT NULL DEFAULT 'Libre' CHECK (estado IN ('Libre', 'Ocupada', 'Reservada', 'Mantenimiento')),
    mesero_folio VARCHAR(10),
    comanda VARCHAR(15),
    FOREIGN KEY (mesero_folio) REFERENCES empleados(folio)
);

CREATE TABLE IF NOT EXISTS comandas (
    folio VARCHAR(15) PRIMARY KEY, -- Formato: 7 dígitos (ej. 0001024)
    mesa_folio VARCHAR(10) NOT NULL,
    mesero_folio VARCHAR(10) NOT NULL,
    fecha_hora TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    subtotal DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    iva DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    total DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    metodo_pago VARCHAR(30),
    estado VARCHAR(20) NOT NULL DEFAULT 'Abierta' CHECK (estado IN ('Abierta', 'Enviada', 'En cocina', 'Pagada', 'Cobrada', 'Cancelada')),
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    cerrado_en TIMESTAMP,
    FOREIGN KEY (mesa_folio) REFERENCES mesas(folio),
    FOREIGN KEY (mesero_folio) REFERENCES empleados(folio)
);

CREATE TABLE IF NOT EXISTS comanda_detalles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    comanda_folio VARCHAR(15) NOT NULL,
    articulo_nombre VARCHAR(100) NOT NULL,
    precio_unitario DECIMAL(10,2) NOT NULL,
    cantidad INT NOT NULL CHECK (cantidad > 0),
    subtotal DECIMAL(10,2) NOT NULL,
    enviado_cocina BOOLEAN NOT NULL DEFAULT 0,
    cancelado BOOLEAN NOT NULL DEFAULT 0,
    cancelado_por_gerente VARCHAR(10),
    motivo_cancelacion VARCHAR(200),
    FOREIGN KEY (comanda_folio) REFERENCES comandas(folio) ON DELETE CASCADE,
    FOREIGN KEY (cancelado_por_gerente) REFERENCES empleados(folio)
);

CREATE TABLE IF NOT EXISTS comanda_cancelaciones (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    comanda_folio VARCHAR(15) NOT NULL,
    gerente_folio VARCHAR(10) NOT NULL,
    motivo VARCHAR(200) NOT NULL,
    fecha_hora TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    detalles_texto VARCHAR(250),
    FOREIGN KEY (comanda_folio) REFERENCES comandas(folio) ON DELETE CASCADE,
    FOREIGN KEY (gerente_folio) REFERENCES empleados(folio)
);

-- ---------------------------------------------------------------------
-- 7. MÓDULO DE CARTA PÚBLICA, EXPERIENCIAS Y PEDIDOS EN LÍNEA
-- ---------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS productos_carta (
    folio VARCHAR(50) PRIMARY KEY, -- ej. 'champagne', 'popcorn'
    nombre VARCHAR(100) NOT NULL,
    precio DECIMAL(10,2) NOT NULL CHECK (precio >= 0),
    categoria VARCHAR(50) NOT NULL CHECK (categoria IN (
        'Bebidas', 'Entradas', 'Postres', 'Mar y Tierra', 'Pastas', 'Pizzas', 
        'Sopas', 'Croisssants', 'Molletes', 'Tapas', 'Crepas', 'Paninos', 'Cafe', 'Cocteleria'
    )),
    icono VARCHAR(50),
    tipo VARCHAR(20) NOT NULL DEFAULT 'Carta',
    estado VARCHAR(20) NOT NULL DEFAULT 'Activo'
);

CREATE TABLE IF NOT EXISTS experiencias (
    folio VARCHAR(50) PRIMARY KEY, -- ej. 'exp-paris', 'exp-playa'
    nombre VARCHAR(100) NOT NULL,
    ambientacion_id VARCHAR(30) NOT NULL,
    descripcion VARCHAR(255),
    precio DECIMAL(10,2) NOT NULL CHECK (precio >= 0),
    icono VARCHAR(50),
    tipo VARCHAR(20) NOT NULL DEFAULT 'Experiencia',
    estado VARCHAR(20) NOT NULL DEFAULT 'Activo',
    FOREIGN KEY (ambientacion_id) REFERENCES ambientaciones(id)
);

CREATE TABLE IF NOT EXISTS pedidos (
    folio VARCHAR(20) PRIMARY KEY, -- Formato: PED-000001
    cliente_folio VARCHAR(10),
    fecha_hora TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metodo_entrega VARCHAR(50) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    servicio DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    iva DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    total DECIMAL(10,2) NOT NULL,
    metodo_pago VARCHAR(50) NOT NULL,
    estado VARCHAR(20) NOT NULL DEFAULT 'Pagado' CHECK (estado IN ('Pendiente', 'Pagado', 'Entregado', 'Cancelado')),
    FOREIGN KEY (cliente_folio) REFERENCES usuarios(folio)
);

CREATE TABLE IF NOT EXISTS pedido_detalles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pedido_folio VARCHAR(20) NOT NULL,
    producto_folio VARCHAR(50) NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    precio_unitario DECIMAL(10,2) NOT NULL,
    cantidad INT NOT NULL CHECK (cantidad > 0),
    subtotal DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (pedido_folio) REFERENCES pedidos(folio) ON DELETE CASCADE,
    FOREIGN KEY (producto_folio) REFERENCES productos_carta(folio)
);

-- ---------------------------------------------------------------------
-- 8. MÓDULO DE VENTAS FÍSICAS DE SOUVENIRS
-- ---------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS ventas (
    folio VARCHAR(20) PRIMARY KEY, -- Folio de ticket (ej. 214589)
    fecha_hora TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    cliente_nombre VARCHAR(150) NOT NULL,
    cliente_folio VARCHAR(10),
    souvenir_folio VARCHAR(10) NOT NULL,
    cantidad INT NOT NULL CHECK (cantidad > 0),
    precio_unitario DECIMAL(10,2) NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    metodo_pago VARCHAR(20) NOT NULL CHECK (metodo_pago IN ('Efectivo', 'Tarjeta')),
    monto_recibido DECIMAL(10,2),
    cambio DECIMAL(10,2),
    vendedor_folio VARCHAR(10) NOT NULL,
    estado VARCHAR(20) NOT NULL DEFAULT 'Pagado' CHECK (estado IN ('Pagado', 'Devuelto', 'Cancelado')),
    observaciones VARCHAR(200),
    FOREIGN KEY (cliente_folio) REFERENCES usuarios(folio),
    FOREIGN KEY (souvenir_folio) REFERENCES souvenirs(folio),
    FOREIGN KEY (vendedor_folio) REFERENCES empleados(folio)
);

-- ---------------------------------------------------------------------
-- 9. MÓDULO DE COMPRAS (ÓRDENES DE COMPRA A PROVEEDORES)
-- ---------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS compras (
    folio VARCHAR(20) PRIMARY KEY, -- Formato: OC-AAAA-0001
    proveedor_id VARCHAR(20) NOT NULL,
    fecha_compra DATE NOT NULL,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    estado VARCHAR(20) NOT NULL DEFAULT 'Emitida' CHECK (estado IN ('Emitida', 'Recibida', 'Devuelta', 'Cancelada')),
    observaciones VARCHAR(250),
    total DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    FOREIGN KEY (proveedor_id) REFERENCES proveedores(id)
);

CREATE TABLE IF NOT EXISTS compra_detalles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    compra_folio VARCHAR(20) NOT NULL,
    tipo_producto VARCHAR(20) NOT NULL CHECK (tipo_producto IN ('Souvenir', 'Ingrediente')),
    folio_souvenir VARCHAR(10),
    articulo VARCHAR(100) NOT NULL,
    estado_articulo VARCHAR(20) DEFAULT 'Vigente',
    cantidad INT NOT NULL CHECK (cantidad > 0),
    precio_unitario DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (compra_folio) REFERENCES compras(folio) ON DELETE CASCADE
);

-- ---------------------------------------------------------------------
-- 10. MÓDULO DE DEVOLUCIONES (COMPRAS Y VENTAS)
-- ---------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS devoluciones_compras (
    folio VARCHAR(25) PRIMARY KEY, -- Formato: DEV-AAAA-0001
    compra_folio VARCHAR(20) NOT NULL UNIQUE,
    fecha_hora TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total_devuelto DECIMAL(10,2) NOT NULL,
    motivo VARCHAR(250),
    estado VARCHAR(20) NOT NULL DEFAULT 'Devuelta',
    FOREIGN KEY (compra_folio) REFERENCES compras(folio)
);

CREATE TABLE IF NOT EXISTS devoluciones_ventas (
    folio VARCHAR(25) PRIMARY KEY, -- Formato: D-AAAA-000001
    venta_folio VARCHAR(20) NOT NULL UNIQUE,
    fecha_hora TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    motivo VARCHAR(200) NOT NULL,
    monto_reembolso DECIMAL(10,2) NOT NULL,
    forma_reembolso VARCHAR(20) NOT NULL CHECK (forma_reembolso IN ('Tarjeta', 'Efectivo', 'Transferencia')),
    estado_souvenir VARCHAR(50) DEFAULT 'Bueno · se reintegra al inventario',
    reintegra_inventario BOOLEAN NOT NULL DEFAULT 1,
    observaciones_dictamen VARCHAR(250),
    autorizado_por VARCHAR(10),
    estado VARCHAR(20) NOT NULL DEFAULT 'Pendiente' CHECK (estado IN ('Pendiente', 'Autorizada', 'Rechazada')),
    FOREIGN KEY (venta_folio) REFERENCES ventas(folio),
    FOREIGN KEY (autorizado_por) REFERENCES empleados(folio)
);

-- ---------------------------------------------------------------------
-- 11. ÍNDICES DE RENDIMIENTO PARA CONSULTAS Y BÚSQUEDAS
-- ---------------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_empleados_usuario ON empleados(usuario);
CREATE INDEX IF NOT EXISTS idx_empleados_area ON empleados(area);
CREATE INDEX IF NOT EXISTS idx_usuarios_correo ON usuarios(correo_electronico);
CREATE INDEX IF NOT EXISTS idx_souvenirs_departamento ON souvenirs(departamento);
CREATE INDEX IF NOT EXISTS idx_transporte_vin ON transporte(vin);
CREATE INDEX IF NOT EXISTS idx_reservaciones_fecha ON reservaciones(fecha);
CREATE INDEX IF NOT EXISTS idx_reservaciones_cliente ON reservaciones(cliente_folio);
CREATE INDEX IF NOT EXISTS idx_comandas_mesa ON comandas(mesa_folio);
CREATE INDEX IF NOT EXISTS idx_comandas_estado ON comandas(estado);
CREATE INDEX IF NOT EXISTS idx_ventas_souvenir ON ventas(souvenir_folio);
CREATE INDEX IF NOT EXISTS idx_compras_proveedor ON compras(proveedor_id);

