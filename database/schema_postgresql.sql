-- =====================================================================
-- PROYECTO: MUNDO A LA CARTA - ESQUEMA PARA POSTGRESQL 14+
-- =====================================================================

-- 1. SEGURIDAD Y EMPLEADOS
CREATE TABLE IF NOT EXISTS roles (
    id VARCHAR(30) PRIMARY KEY,
    descripcion VARCHAR(200) NOT NULL,
    nivel_acceso INT NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS empleados (
    folio VARCHAR(10) PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    telefono VARCHAR(15),
    area VARCHAR(50) NOT NULL CHECK (area IN ('Administración', 'Ventas', 'Cocina', 'Operaciones', 'Recursos Humanos')),
    correo VARCHAR(100) NOT NULL UNIQUE,
    rol_puesto VARCHAR(30) NOT NULL REFERENCES roles(id) ON UPDATE CASCADE,
    clave_contrato VARCHAR(20) NOT NULL UNIQUE,
    usuario VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    estado VARCHAR(20) NOT NULL DEFAULT 'Activo' CHECK (estado IN ('Activo', 'Baja', 'Inactivo')),
    foto_url VARCHAR(255),
    retencion_hasta DATE,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    modificado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. CLIENTES / USUARIOS
CREATE TABLE IF NOT EXISTS usuarios (
    folio VARCHAR(10) PRIMARY KEY,
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
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    modificado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. PROVEEDORES Y SOUVENIRS
CREATE TABLE IF NOT EXISTS proveedores (
    id VARCHAR(20) PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    departamento VARCHAR(50),
    contacto VARCHAR(100),
    telefono VARCHAR(20),
    correo VARCHAR(100),
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS souvenirs (
    folio VARCHAR(10) PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    precio_unitario NUMERIC(10,2) NOT NULL CHECK (precio_unitario >= 0),
    departamento VARCHAR(50) NOT NULL,
    proveedor_id VARCHAR(20) NOT NULL REFERENCES proveedores(id) ON UPDATE CASCADE,
    descripcion VARCHAR(300),
    existencia INT NOT NULL DEFAULT 0 CHECK (existencia >= 0),
    estado VARCHAR(20) NOT NULL DEFAULT 'Activo' CHECK (estado IN ('Activo', 'Inactivo', 'Vigente', 'Descontinuado')),
    foto_url VARCHAR(255),
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    modificado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. TRANSPORTE
CREATE TABLE IF NOT EXISTS transporte (
    folio VARCHAR(10) PRIMARY KEY,
    vin VARCHAR(17) NOT NULL UNIQUE,
    equipamiento_inmersivo VARCHAR(150),
    marca VARCHAR(50) NOT NULL,
    capacidad INT NOT NULL CHECK (capacidad > 0),
    modelo VARCHAR(50) NOT NULL,
    folio_poliza_seguro VARCHAR(30) NOT NULL,
    placas VARCHAR(15) NOT NULL UNIQUE,
    vigencia_poliza DATE NOT NULL,
    tipo_vehiculo VARCHAR(50) NOT NULL,
    vigencia_tarjeta_circulacion DATE NOT NULL,
    color VARCHAR(30) NOT NULL,
    estatus_verificacion VARCHAR(30) NOT NULL,
    estado VARCHAR(25) NOT NULL DEFAULT 'Disponible' CHECK (estado IN ('Disponible', 'En mantenimiento', 'Retirado')),
    motivo_baja VARCHAR(250),
    foto_url VARCHAR(255),
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    modificado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. SALAS, AMBIENTACIONES Y RESERVAS
CREATE TABLE IF NOT EXISTS salas (
    id VARCHAR(20) PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    capacidad INT NOT NULL CHECK (capacidad > 0),
    estado VARCHAR(20) NOT NULL DEFAULT 'Disponible' CHECK (estado IN ('Disponible', 'Ocupada', 'Mantenimiento'))
);

CREATE TABLE IF NOT EXISTS ambientaciones (
    id VARCHAR(30) PRIMARY KEY,
    descripcion VARCHAR(255),
    icono VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS menus (
    tipo VARCHAR(30) PRIMARY KEY,
    precio_persona NUMERIC(10,2) NOT NULL CHECK (precio_persona >= 0),
    descripcion VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS reservaciones (
    folio VARCHAR(15) PRIMARY KEY,
    cliente_folio VARCHAR(10) NOT NULL REFERENCES usuarios(folio) ON UPDATE CASCADE,
    fecha DATE NOT NULL,
    hora_entrada TIME NOT NULL,
    hora_salida TIME NOT NULL,
    comensales INT NOT NULL CHECK (comensales > 0),
    tipo_evento VARCHAR(50) NOT NULL CHECK (tipo_evento IN ('Cumpleaños', 'Aniversario', 'Boda', 'Corporativo', 'Otro')),
    tipo_menu VARCHAR(30) NOT NULL REFERENCES menus(tipo) ON UPDATE CASCADE,
    tipo_mesa VARCHAR(50) NOT NULL CHECK (tipo_mesa IN ('Estándar', 'Redonda', 'Privada', 'Terraza')),
    sala_id VARCHAR(20) NOT NULL REFERENCES salas(id) ON UPDATE CASCADE,
    ambientacion_id VARCHAR(30) NOT NULL REFERENCES ambientaciones(id) ON UPDATE CASCADE,
    alergias VARCHAR(200) DEFAULT 'Ninguna',
    descorche BOOLEAN NOT NULL DEFAULT FALSE,
    vegetariano BOOLEAN NOT NULL DEFAULT FALSE,
    vegano BOOLEAN NOT NULL DEFAULT FALSE,
    precio_persona NUMERIC(10,2) NOT NULL,
    monto_reserva NUMERIC(10,2) NOT NULL CHECK (monto_reserva >= 0),
    observaciones VARCHAR(250),
    estado VARCHAR(30) NOT NULL DEFAULT 'Activa' CHECK (estado IN ('Activa', 'Completada', 'Cancelada', 'Cancelada con Devolución', 'Baja')),
    motivo_cancelacion VARCHAR(200),
    multa_monto NUMERIC(10,2) DEFAULT 0.00,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    modificado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS recepciones (
    folio VARCHAR(15) PRIMARY KEY REFERENCES reservaciones(folio) ON DELETE CASCADE,
    reservacion_folio VARCHAR(15) NOT NULL UNIQUE REFERENCES reservaciones(folio) ON DELETE CASCADE,
    fecha_hora TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    observaciones VARCHAR(250),
    empleado_folio VARCHAR(10) REFERENCES empleados(folio),
    estado VARCHAR(20) NOT NULL DEFAULT 'Registrada'
);

CREATE TABLE IF NOT EXISTS inmersiones (
    folio VARCHAR(15) PRIMARY KEY REFERENCES reservaciones(folio) ON DELETE CASCADE,
    reservacion_folio VARCHAR(15) NOT NULL UNIQUE REFERENCES reservaciones(folio) ON DELETE CASCADE,
    vehiculo_folio VARCHAR(10) REFERENCES transporte(folio),
    fecha_hora TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    observaciones VARCHAR(250),
    empleado_folio VARCHAR(10) REFERENCES empleados(folio),
    estado VARCHAR(20) NOT NULL DEFAULT 'En curso'
);

-- 6. MESAS Y COMANDAS
CREATE TABLE IF NOT EXISTS mesas (
    folio VARCHAR(10) PRIMARY KEY,
    zona VARCHAR(10) NOT NULL,
    numero INT NOT NULL,
    capacidad INT NOT NULL DEFAULT 4,
    estado VARCHAR(20) NOT NULL DEFAULT 'Libre' CHECK (estado IN ('Libre', 'Ocupada', 'Reservada', 'Mantenimiento')),
    mesero_folio VARCHAR(10) REFERENCES empleados(folio)
);

CREATE TABLE IF NOT EXISTS comandas (
    folio VARCHAR(15) PRIMARY KEY,
    mesa_folio VARCHAR(10) NOT NULL REFERENCES mesas(folio),
    mesero_folio VARCHAR(10) NOT NULL REFERENCES empleados(folio),
    fecha_hora TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    subtotal NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    iva NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    total NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    estado VARCHAR(20) NOT NULL DEFAULT 'Abierta' CHECK (estado IN ('Abierta', 'En cocina', 'Cobrada', 'Cancelada')),
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    cerrado_en TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS comanda_detalles (
    id SERIAL PRIMARY KEY,
    comanda_folio VARCHAR(15) NOT NULL REFERENCES comandas(folio) ON DELETE CASCADE,
    articulo_nombre VARCHAR(100) NOT NULL,
    precio_unitario NUMERIC(10,2) NOT NULL,
    cantidad INT NOT NULL CHECK (cantidad > 0),
    subtotal NUMERIC(10,2) NOT NULL,
    enviado_cocina BOOLEAN NOT NULL DEFAULT FALSE,
    cancelado BOOLEAN NOT NULL DEFAULT FALSE,
    cancelado_por_gerente VARCHAR(10) REFERENCES empleados(folio),
    motivo_cancelacion VARCHAR(200)
);

-- 7. CARTA Y EXPERIENCIAS
CREATE TABLE IF NOT EXISTS productos_carta (
    folio VARCHAR(50) PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    precio NUMERIC(10,2) NOT NULL CHECK (precio >= 0),
    categoria VARCHAR(50) NOT NULL CHECK (categoria IN (
        'Bebidas', 'Entradas', 'Postres', 'Mar y Tierra', 'Pastas', 'Pizzas', 
        'Sopas', 'Croisssants', 'Molletes', 'Tapas', 'Crepas', 'Paninos', 'Cafe', 'Cocteleria'
    )),
    icono VARCHAR(50),
    tipo VARCHAR(20) NOT NULL DEFAULT 'Carta',
    estado VARCHAR(20) NOT NULL DEFAULT 'Activo'
);

CREATE TABLE IF NOT EXISTS experiencias (
    folio VARCHAR(50) PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    ambientacion_id VARCHAR(30) NOT NULL REFERENCES ambientaciones(id),
    descripcion VARCHAR(255),
    precio NUMERIC(10,2) NOT NULL CHECK (precio >= 0),
    icono VARCHAR(50),
    tipo VARCHAR(20) NOT NULL DEFAULT 'Experiencia',
    estado VARCHAR(20) NOT NULL DEFAULT 'Activo'
);

CREATE TABLE IF NOT EXISTS pedidos (
    folio VARCHAR(20) PRIMARY KEY,
    cliente_folio VARCHAR(10) REFERENCES usuarios(folio),
    fecha_hora TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    metodo_entrega VARCHAR(50) NOT NULL,
    subtotal NUMERIC(10,2) NOT NULL,
    servicio NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    iva NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    total NUMERIC(10,2) NOT NULL,
    metodo_pago VARCHAR(50) NOT NULL,
    estado VARCHAR(20) NOT NULL DEFAULT 'Pagado' CHECK (estado IN ('Pendiente', 'Pagado', 'Entregado', 'Cancelado'))
);

CREATE TABLE IF NOT EXISTS pedido_detalles (
    id SERIAL PRIMARY KEY,
    pedido_folio VARCHAR(20) NOT NULL REFERENCES pedidos(folio) ON DELETE CASCADE,
    producto_folio VARCHAR(50) NOT NULL REFERENCES productos_carta(folio),
    nombre VARCHAR(100) NOT NULL,
    precio_unitario NUMERIC(10,2) NOT NULL,
    cantidad INT NOT NULL CHECK (cantidad > 0),
    subtotal NUMERIC(10,2) NOT NULL
);

-- 8. VENTAS DE SOUVENIRS
CREATE TABLE IF NOT EXISTS ventas (
    folio VARCHAR(20) PRIMARY KEY,
    fecha_hora TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    cliente_nombre VARCHAR(150) NOT NULL,
    cliente_folio VARCHAR(10) REFERENCES usuarios(folio),
    souvenir_folio VARCHAR(10) NOT NULL REFERENCES souvenirs(folio),
    cantidad INT NOT NULL CHECK (cantidad > 0),
    precio_unitario NUMERIC(10,2) NOT NULL,
    total NUMERIC(10,2) NOT NULL,
    metodo_pago VARCHAR(20) NOT NULL CHECK (metodo_pago IN ('Efectivo', 'Tarjeta')),
    monto_recibido NUMERIC(10,2),
    cambio NUMERIC(10,2),
    vendedor_folio VARCHAR(10) NOT NULL REFERENCES empleados(folio),
    estado VARCHAR(20) NOT NULL DEFAULT 'Pagado' CHECK (estado IN ('Pagado', 'Devuelto', 'Cancelado')),
    observaciones VARCHAR(200)
);

-- 9. COMPRAS
CREATE TABLE IF NOT EXISTS compras (
    folio VARCHAR(20) PRIMARY KEY,
    proveedor_id VARCHAR(20) NOT NULL REFERENCES proveedores(id),
    fecha_compra DATE NOT NULL,
    fecha_registro TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    estado VARCHAR(20) NOT NULL DEFAULT 'Emitida' CHECK (estado IN ('Emitida', 'Recibida', 'Devuelta', 'Cancelada')),
    observaciones VARCHAR(250),
    total NUMERIC(10,2) NOT NULL DEFAULT 0.00
);

CREATE TABLE IF NOT EXISTS compra_detalles (
    id SERIAL PRIMARY KEY,
    compra_folio VARCHAR(20) NOT NULL REFERENCES compras(folio) ON DELETE CASCADE,
    tipo_producto VARCHAR(20) NOT NULL CHECK (tipo_producto IN ('Souvenir', 'Ingrediente')),
    articulo VARCHAR(100) NOT NULL,
    estado_articulo VARCHAR(20) DEFAULT 'Vigente',
    cantidad INT NOT NULL CHECK (cantidad > 0),
    precio_unitario NUMERIC(10,2) NOT NULL,
    subtotal NUMERIC(10,2) NOT NULL
);

-- 10. DEVOLUCIONES
CREATE TABLE IF NOT EXISTS devoluciones_compras (
    folio VARCHAR(25) PRIMARY KEY,
    compra_folio VARCHAR(20) NOT NULL UNIQUE REFERENCES compras(folio),
    fecha_hora TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    total_devuelto NUMERIC(10,2) NOT NULL,
    motivo VARCHAR(250),
    estado VARCHAR(20) NOT NULL DEFAULT 'Devuelta'
);

CREATE TABLE IF NOT EXISTS devoluciones_ventas (
    folio VARCHAR(25) PRIMARY KEY,
    venta_folio VARCHAR(20) NOT NULL UNIQUE REFERENCES ventas(folio),
    fecha_hora TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    motivo VARCHAR(200) NOT NULL,
    monto_reembolso NUMERIC(10,2) NOT NULL,
    forma_reembolso VARCHAR(20) NOT NULL CHECK (forma_reembolso IN ('Tarjeta', 'Efectivo', 'Transferencia')),
    estado_souvenir VARCHAR(50) DEFAULT 'Bueno · se reintegra al inventario',
    reintegra_inventario BOOLEAN NOT NULL DEFAULT TRUE,
    observaciones_dictamen VARCHAR(250),
    autorizado_por VARCHAR(10) REFERENCES empleados(folio),
    estado VARCHAR(20) NOT NULL DEFAULT 'Pendiente' CHECK (estado IN ('Pendiente', 'Autorizada', 'Rechazada'))
);

