-- =====================================================================
-- PROYECTO: MUNDO A LA CARTA
-- SCRIPT: Catálogos Operativos Iniciales (Sin registros de prueba)
-- =====================================================================

-- 1. ROLES DEL SISTEMA (Necesarios para control de acceso)
INSERT OR IGNORE INTO roles (id, descripcion, nivel_acceso) VALUES
('Administrador', 'Control total de todos los módulos del sistema', 10),
('Gerente', 'Autorizaciones especiales, cancelaciones de comandas y supervisión', 8),
('Mesero', 'Atención de mesas y captura de comandas de alimentos y bebidas', 4),
('Empleado', 'Ventas de mostrador de souvenirs y atención general', 3);

-- 2. CUENTAS OPERATIVAS MÍNIMAS POR ROL (Para acceder al panel y autorizar operaciones)
INSERT OR IGNORE INTO empleados (folio, nombre, telefono, area, correo, rol_puesto, clave_contrato, usuario, password_hash, estado, retencion_hasta) VALUES
('000123', 'Administrador General', '5500000001', 'Administración', 'admin@mundoalacarta.com', 'Administrador', '8492019', 'admin', 'admin123', 'Activo', NULL),
('000124', 'Gerente en Turno', '5500000002', 'Administración', 'gerente@mundoalacarta.com', 'Gerente', '8492020', 'gerente', 'gerente123', 'Activo', NULL),
('000125', 'Mesero Principal', '5500000003', 'Operaciones', 'mesero@mundoalacarta.com', 'Mesero', '9384751', 'mesero', 'mesero123', 'Activo', NULL),
('000126', 'Cajero de Ventas', '5500000004', 'Ventas', 'ventas@mundoalacarta.com', 'Empleado', '6712390', 'ventas', 'ventas123', 'Activo', NULL);

-- 3. CATÁLOGO BASE DE PROVEEDORES (Necesario para compras y souvenirs)
INSERT OR IGNORE INTO proveedores (id, nombre, departamento, contacto, telefono, correo, activo) VALUES
('10001', 'Distribuidora Gourmet', 'Cocina', 'Departamento de Ventas', '2221112233', 'ventas@distribuidoragourmet.com', 1),
('10002', 'Importadora del Sur', 'Accesorios', 'Departamento de Ventas', '5511223344', 'pedidos@importadoradelsur.com', 1),
('10005', 'Artesanías Puebla', 'Artesanías', 'Departamento de Ventas', '2227778899', 'contacto@artesaniaspuebla.com', 1);

-- 4. CATÁLOGOS DE RESERVACIONES (SALAS, AMBIENTACIONES, MENÚS)
INSERT OR IGNORE INTO salas (id, nombre, capacidad, estado) VALUES
('Sala 1', 'Sala París', 6, 'Disponible'),
('Sala 2', 'Sala Selva Amazónica', 8, 'Disponible'),
('Sala 3', 'Sala Océano Profundo', 10, 'Disponible'),
('Sala 4', 'Sala Cosmos y Galaxias', 12, 'Disponible'),
('Sala 5', 'Sala Gran Salón Clásico', 14, 'Disponible'),
('Sala 6', 'Sala Terraza Panorámica', 16, 'Disponible');

INSERT OR IGNORE INTO ambientaciones (id, descripcion, icono) VALUES
('Torre Eiffel', 'Cena gourmet con vistas y sonido ambiental parisino', 'fa-landmark'),
('Playa', 'Mariscos y coctelería con brisa marina y sonido de olas', 'fa-umbrella-beach'),
('Selva', 'Expedición exótica rodeada de naturaleza y sonidos de jungla', 'fa-tree'),
('Espacio', 'Experiencia molecular flotando entre planetas y nebulosas', 'fa-user-astronaut'),
('Clásica', 'Salón clásico y elegante ideal para reuniones ejecutivas', 'fa-champagne-glasses');

INSERT OR IGNORE INTO menus (tipo, precio_persona, descripcion) VALUES
('Gourmet', 600.00, 'Menú de 4 tiempos con ingredientes selectos'),
('Degustación', 850.00, 'Maridaje y cata de 7 tiempos'),
('Ejecutivo', 350.00, 'Comida rápida de alta gama para negocios'),
('Infantil', 250.00, 'Platillos divertidos y saludables para menores');

-- 5. MESAS DEL RESTAURANTE (Todas libres para operar)
INSERT OR IGNORE INTO mesas (folio, zona, numero, capacidad, estado, mesero_folio, comanda) VALUES
('A1', 'A', 1, 4, 'Libre', NULL, NULL),
('A2', 'A', 2, 4, 'Libre', NULL, NULL),
('A3', 'A', 3, 4, 'Libre', NULL, NULL),
('A4', 'A', 4, 4, 'Libre', NULL, NULL),
('A5', 'A', 5, 4, 'Libre', NULL, NULL),
('A6', 'A', 6, 4, 'Libre', NULL, NULL),
('B1', 'B', 1, 4, 'Libre', NULL, NULL),
('B2', 'B', 2, 4, 'Libre', NULL, NULL),
('B3', 'B', 3, 4, 'Libre', NULL, NULL),
('B4', 'B', 4, 4, 'Libre', NULL, NULL),
('B5', 'B', 5, 4, 'Libre', NULL, NULL),
('B6', 'B', 6, 4, 'Libre', NULL, NULL),
('C1', 'C', 1, 6, 'Libre', NULL, NULL),
('C2', 'C', 2, 6, 'Libre', NULL, NULL),
('C3', 'C', 3, 6, 'Libre', NULL, NULL),
('C4', 'C', 4, 6, 'Libre', NULL, NULL),
('C5', 'C', 5, 6, 'Libre', NULL, NULL),
('C6', 'C', 6, 6, 'Libre', NULL, NULL);

-- 6. CATÁLOGO DE PRODUCTOS DE LA CARTA
INSERT OR IGNORE INTO productos_carta (folio, nombre, precio, categoria, icono, tipo, estado) VALUES
('champagne', 'Dom Pérignon Vintage Flute', 35.50, 'Bebidas', 'fa-champagne-glasses', 'Carta', 'Activo'),
('popcorn', 'Saffron & Gold Leaf Popcorn', 14.50, 'Entradas', 'fa-bowl-food', 'Carta', 'Activo'),
('tapas-jamon', 'Iberian Ham & Olive Tapas', 22.09, 'Entradas', 'fa-bacon', 'Carta', 'Activo'),
('arancini', 'Truffled Wild Mushroom Arancini', 18.50, 'Entradas', 'fa-bowl-rice', 'Carta', 'Activo'),
('old-fashioned', 'Signature Smoked Old Fashioned Cocktail', 18.50, 'Bebidas', 'fa-martini-glass-citrus', 'Carta', 'Activo'),
('foie-gras', 'Seared Foie Gras Crostini', 22.00, 'Entradas', 'fa-bread-slice', 'Carta', 'Activo'),
('pinot-noir', 'Domaine Serene Pinot Noir Glass', 94.00, 'Bebidas', 'fa-wine-glass', 'Carta', 'Activo'),
('agua', 'Hildon Premium Sparkling Water', 8.00, 'Bebidas', 'fa-glass-water', 'Carta', 'Activo'),
('caviar', 'Caviar & Blini Bites', 13.00, 'Entradas', 'fa-fish', 'Carta', 'Activo'),
('salmon', 'Smoked Salmon & Cream Cheese Rolls', 18.00, 'Entradas', 'fa-fish-fins', 'Carta', 'Activo'),
('huevos', 'Truffle Deviled Eggs', 8.00, 'Entradas', 'fa-egg', 'Carta', 'Activo'),
('baklava', 'Pistachio & Rosewater Baklava', 18.00, 'Postres', 'fa-cookie-bite', 'Carta', 'Activo');

-- 7. CATÁLOGO DE EXPERIENCIAS INMERSIVAS
INSERT OR IGNORE INTO experiencias (folio, nombre, ambientacion_id, descripcion, precio, icono, tipo, estado) VALUES
('exp-paris', 'Noche en París', 'Torre Eiffel', 'Cena gourmet bajo la Torre Eiffel con música en vivo.', 600.00, 'fa-landmark', 'Experiencia', 'Activo'),
('exp-playa', 'Atardecer en la playa', 'Playa', 'Mariscos y coctelería con brisa marina y sonido de olas.', 850.00, 'fa-umbrella-beach', 'Experiencia', 'Activo'),
('exp-selva', 'Expedición a la selva', 'Selva', 'Menú infantil y familiar rodeados de naturaleza.', 250.00, 'fa-tree', 'Experiencia', 'Activo'),
('exp-espacio', 'Cena en el espacio', 'Espacio', 'Degustación molecular flotando entre planetas.', 850.00, 'fa-user-astronaut', 'Experiencia', 'Activo'),
('exp-clasica', 'Salón clásico', 'Clásica', 'Menú ejecutivo ideal para eventos corporativos.', 350.00, 'fa-champagne-glasses', 'Experiencia', 'Activo');
