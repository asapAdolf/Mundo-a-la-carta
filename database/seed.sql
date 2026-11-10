-- =====================================================================
-- PROYECTO: MUNDO A LA CARTA
-- SCRIPT: Datos de prueba y Catálogos Iniciales (Seed Data)
-- =====================================================================

-- 1. ROLES DEL SISTEMA
INSERT OR IGNORE INTO roles (id, descripcion, nivel_acceso) VALUES
('Administrador', 'Control total de todos los módulos del sistema', 10),
('Gerente', 'Autorizaciones especiales, cancelaciones de comandas y supervisión', 8),
('Mesero', 'Atención de mesas y captura de comandas de alimentos y bebidas', 4),
('Empleado', 'Ventas de mostrador de souvenirs y atención general', 3);

-- 2. EMPLEADOS (PERSONAL)
-- Nota: En producción las contraseñas deben estar encriptadas con bcrypt/argon2.
INSERT OR IGNORE INTO empleados (folio, nombre, telefono, area, correo, rol_puesto, clave_contrato, usuario, password_hash, estado, retencion_hasta) VALUES
('000123', 'Elena Morales', '5543219876', 'Administración', 'elena.morales@mundoalacarta.com', 'Administrador', '8492019', 'admin', 'admin123', 'Activo', NULL),
('000124', 'Carlos Eduardo Ramírez', '5543219877', 'Administración', 'carlos.ramirez@mundoalacarta.com', 'Gerente', '8492020', 'gerente', 'gerente123', 'Activo', NULL),
('000125', 'Juan Pérez', '5578901234', 'Operaciones', 'juan.perez@mundoalacarta.com', 'Mesero', '9384751', 'mesero', 'mesero123', 'Activo', NULL),
('000126', 'Luis Ramírez', '5598765432', 'Ventas', 'luis.ramirez@mundoalacarta.com', 'Empleado', '6712390', 'ventas', 'ventas123', 'Activo', NULL),
('000127', 'Mariana Gómez Herrera', '5511122233', 'Ventas', 'mariana.gomez@mundoalacarta.com', 'Empleado', '6712391', 'mariana', 'mariana123', 'Activo', NULL),
('000128', 'Roberto Solís Vargas', '5544455566', 'Cocina', 'roberto.solis@mundoalacarta.com', 'Empleado', '6712392', 'roberto', 'roberto123', 'Baja', '2031-11-10'),
('000129', 'Ana Lucía Pineda', '5577788899', 'Cocina', 'ana.pineda@mundoalacarta.com', 'Empleado', '6712393', 'ana', 'ana123', 'Activo', NULL),
('000130', 'Héctor Villalobos', '5512398745', 'Operaciones', 'hector.villalobos@mundoalacarta.com', 'Mesero', '6712394', 'hector', 'hector123', 'Activo', NULL);

-- 3. CLIENTES / USUARIOS
INSERT OR IGNORE INTO usuarios (folio, nombre, direccion, tipo_cliente, contacto_emergencia, telefono, telefono_contacto_emergencia, correo_electronico, observaciones_especiales, password_hash, estado) VALUES
('000123', 'María Fernanda López', 'Av. Reforma 123, CDMX', 'Frecuente', 'Luis López', '5512345678', '5587654321', 'maria.lopez@correo.com', 'Sin gluten', 'cliente123', 'Activo'),
('000124', 'Juan Pérez', 'Calle 5 de Mayo 45, Puebla', 'Nuevo', 'Ana Pérez', '2221234567', '2227654321', 'juan.perez@email.com', '', 'cliente123', 'Activo'),
('000125', 'Sofía Ramírez', 'Blvd. Atlixco 300, Puebla', 'VIP', 'Pedro Ramírez', '2229876543', '2223456789', 'sofia.ramirez@correo.com', 'Vegana', 'cliente123', 'Activo'),
('000126', 'Carlos Hernández', 'Av. Juárez 10, CDMX', 'Frecuente', '', '5598761234', '', 'carlos.hdz@correo.com', '', 'cliente123', 'Activo'),
('000127', 'Valeria Torres', 'Calle Hidalgo 88, Cholula', 'Nuevo', 'Marta Torres', '2224567890', '2220987654', 'valeria.torres@correo.com', 'Alergia a nueces', 'cliente123', 'Activo'),
('000128', 'Diego Martínez', 'Av. Universidad 200, CDMX', 'Corporativo', '', '5543218765', '', 'diego.mtz@empresa.com', '', 'cliente123', 'Activo'),
('000129', 'Fernanda Castillo', 'Calle Morelos 12, Puebla', 'Frecuente', 'José Castillo', '2226543210', '2221112233', 'fer.castillo@correo.com', '', 'cliente123', 'Activo'),
('000130', 'Ricardo Gómez', 'Privada Las Flores 5, Tlaxcala', 'Nuevo', '', '2461234567', '', 'ricardo.gomez@correo.com', 'Silla de ruedas', 'cliente123', 'Activo'),
('000131', 'Andrea Morales', 'Av. 31 Poniente 400, Puebla', 'VIP', 'Laura Morales', '2228887766', '2225554433', 'andrea.morales@correo.com', '', 'cliente123', 'Activo'),
('000132', 'Jorge Navarro', 'Calle Allende 70, CDMX', 'Frecuente', '', '5576543210', '', 'jorge.navarro@correo.com', '', 'cliente123', 'Activo'),
('000133', 'Paola Jiménez', 'Av. Zaragoza 15, Puebla', 'Nuevo', 'Raúl Jiménez', '2223334455', '2229998877', 'paola.jimenez@correo.com', 'Sin lactosa', 'cliente123', 'Inactivo'),
('000134', 'Miguel Ángel Ruiz', 'Calle Reforma 99, Cholula', 'Corporativo', '', '2227778899', '', 'miguel.ruiz@empresa.com', '', 'cliente123', 'Activo');

-- 4. PROVEEDORES
INSERT OR IGNORE INTO proveedores (id, nombre, departamento, contacto, telefono, correo, activo) VALUES
('10001', 'Distribuidora Gourmet del Centro', 'Cocina', 'Roberto Andrade', '2221112233', 'ventas@gourmetcentro.com', 1),
('10002', 'Accesorios y Diseños de México', 'Accesorios', 'Lucía Mendoza', '5511223344', 'pedidos@accesoriosmex.com', 1),
('10003', 'Textiles y Confecciones Puebla', 'Ropa', 'Eduardo Téllez', '2223334455', 'contacto@textilespuebla.com', 1),
('10004', 'Papelería e Impresos de Arte', 'Papelería', 'Beatriz Soto', '2225556677', 'ventas@impresosarte.mx', 1),
('10005', 'Artesanías y Talavera Poblana', 'Artesanías', 'Manuel Domínguez', '2227778899', 'manuel@talaverapuebla.com', 1);

-- 5. SOUVENIRS
INSERT OR IGNORE INTO souvenirs (folio, nombre, precio_unitario, departamento, proveedor_id, descripcion, existencia, estado) VALUES
('000123', 'Taza UMAD', 180.00, 'Cocina', '10001', 'Taza de cerámica con logotipo oficial', 20, 'Activo'),
('000124', 'Llavero Mundo a la Carta', 60.00, 'Accesorios', '10002', 'Llavero metálico de colección', 20, 'Activo'),
('000125', 'Playera conmemorativa', 250.00, 'Ropa', '10003', 'Playera de algodón bordada premium', 20, 'Activo'),
('000126', 'Imán de recuerdo', 45.00, 'Accesorios', '10002', 'Imán decorativo de alta resistencia', 20, 'Activo'),
('000127', 'Postal panorámica', 25.00, 'Papelería', '10004', 'Postal ilustrada de las salas inmersivas', 20, 'Activo'),
('000128', 'Taza de talavera', 725.00, 'Artesanías', '10005', 'Taza de talavera pintada a mano con certificado', 20, 'Activo'),
('000129', 'Gorra bordada', 220.00, 'Ropa', '10003', 'Gorra ajustable con escudo del restaurante', 20, 'Activo'),
('000130', 'Libreta artesanal', 140.00, 'Papelería', '10004', 'Libreta con pasta de piel y hojas recicladas', 20, 'Activo'),
('000131', 'Termo de acero', 390.00, 'Cocina', '10001', 'Termo de 500 ml con aislamiento térmico', 20, 'Activo'),
('000132', 'Plato decorativo', 510.00, 'Artesanías', '10005', 'Plato de talavera poblana con base de madera', 20, 'Activo'),
('000133', 'Separador de libros', 30.00, 'Papelería', '10004', 'Separador metálico con grabado láser', 20, 'Activo'),
('000134', 'Sudadera premium', 650.00, 'Ropa', '10003', 'Sudadera con capucha y felpa interior', 20, 'Inactivo');

-- 6. TRANSPORTE (VEHÍCULOS PARA EXPERIENCIAS MÓVILES)
INSERT OR IGNORE INTO transporte (folio, vin, equipamiento_inmersivo, marca, capacidad, modelo, folio_poliza_seguro, placas, vigencia_poliza, tipo_vehiculo, vigencia_tarjeta_circulacion, color, estatus_verificacion, estado) VALUES
('000123', '1HGCM82633A004352', 'Pantallas 4K y audio envolvente', 'Mercedes-Benz', 18, 'Sprinter 2024', 'POL-2026-0457', 'ABC-123-D', '2027-03-15', 'Van', '2027-01-20', 'Blanco', 'Vigente', 'Disponible'),
('000124', '3VWFE21C04M000001', 'Realidad virtual y visores 360', 'Volkswagen', 14, 'Crafter 2023', 'POL-2026-0458', 'PUE-456-A', '2027-05-10', 'Van', '2027-02-11', 'Gris', 'Vigente', 'Disponible'),
('000125', '1FTFW1ET5EFA00002', 'Audio Dolby Atmos y proyector', 'Ford', 20, 'Transit 2022', 'POL-2026-0459', 'PUE-789-B', '2026-12-31', 'Minibús', '2026-11-30', 'Azul', 'Vigente', 'Disponible'),
('000126', 'JTDKB20U093000003', 'Iluminación ambiental inteligente', 'Toyota', 12, 'Hiace 2024', 'POL-2026-0460', 'TLX-111-C', '2027-08-01', 'Van', '2027-07-15', 'Negro', 'Vigente', 'Disponible'),
('000127', 'WDB9066331S000004', 'Pantallas 4K', 'Mercedes-Benz', 22, 'Sprinter 2021', 'POL-2026-0461', 'CDM-222-D', '2026-10-01', 'Minibús', '2026-09-30', 'Plata', 'Vencida', 'En mantenimiento'),
('000128', '2C4RDGBG5ER000005', 'Audio envolvente acústico', 'Chrysler', 7, 'Pacifica 2023', 'POL-2026-0462', 'PUE-333-E', '2027-04-20', 'Camioneta', '2027-04-20', 'Rojo', 'Vigente', 'Disponible'),
('000129', '5YJSA1E26HF000006', 'Pantallas táctiles y audio inmersivo', 'Nissan', 15, 'Urvan 2022', 'POL-2026-0463', 'PUE-444-F', '2027-06-12', 'Van', '2027-06-12', 'Blanco', 'Vigente', 'Disponible');

-- 7. CATÁLOGOS DE RESERVACIONES (SALAS, AMBIENTACIONES, MENÚS)
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

-- 8. MESAS DEL RESTAURANTE
INSERT OR IGNORE INTO mesas (folio, zona, numero, capacidad, estado, mesero_folio) VALUES
('A1', 'A', 1, 4, 'Libre', '000125'),
('A2', 'A', 2, 4, 'Libre', '000125'),
('A3', 'A', 3, 4, 'Libre', '000125'),
('A4', 'A', 4, 4, 'Libre', '000125'),
('A5', 'A', 5, 4, 'Libre', '000125'),
('A6', 'A', 6, 4, 'Libre', '000125'),
('B1', 'B', 1, 4, 'Libre', '000130'),
('B2', 'B', 2, 4, 'Ocupada', '000130'),
('B3', 'B', 3, 4, 'Libre', '000130'),
('B4', 'B', 4, 4, 'Libre', '000130'),
('B5', 'B', 5, 4, 'Libre', '000130'),
('B6', 'B', 6, 4, 'Libre', '000130'),
('C1', 'C', 1, 6, 'Libre', '000125'),
('C2', 'C', 2, 6, 'Libre', '000125'),
('C3', 'C', 3, 6, 'Libre', '000125'),
('C4', 'C', 4, 6, 'Libre', '000125'),
('C5', 'C', 5, 6, 'Ocupada', '000130'),
('C6', 'C', 6, 6, 'Libre', '000130');

-- 9. PRODUCTOS DE LA CARTA
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

-- 10. EXPERIENCIAS PÚBLICAS
INSERT OR IGNORE INTO experiencias (folio, nombre, ambientacion_id, descripcion, precio, icono, tipo, estado) VALUES
('exp-paris', 'Noche en París', 'Torre Eiffel', 'Cena gourmet bajo la Torre Eiffel con música en vivo.', 600.00, 'fa-landmark', 'Experiencia', 'Activo'),
('exp-playa', 'Atardecer en la playa', 'Playa', 'Mariscos y coctelería con brisa marina y sonido de olas.', 850.00, 'fa-umbrella-beach', 'Experiencia', 'Activo'),
('exp-selva', 'Expedición a la selva', 'Selva', 'Menú infantil y familiar rodeados de naturaleza.', 250.00, 'fa-tree', 'Experiencia', 'Activo'),
('exp-espacio', 'Cena en el espacio', 'Espacio', 'Degustación molecular flotando entre planetas.', 850.00, 'fa-user-astronaut', 'Experiencia', 'Activo'),
('exp-clasica', 'Salón clásico', 'Clásica', 'Menú ejecutivo ideal para eventos corporativos.', 350.00, 'fa-champagne-glasses', 'Experiencia', 'Activo');

-- 11. RESERVACIONES
INSERT OR IGNORE INTO reservaciones (folio, cliente_folio, fecha, hora_entrada, hora_salida, comensales, tipo_evento, tipo_menu, tipo_mesa, sala_id, ambientacion_id, alergias, descorche, vegetariano, vegano, precio_persona, monto_reserva, observaciones, estado) VALUES
('1024', '000124', '2026-11-13', '19:30', '22:30', 2, 'Aniversario', 'Gourmet', 'Estándar', 'Sala 1', 'Torre Eiffel', 'Ninguna', 1, 0, 0, 600.00, 1200.00, 'Mesa junto a la ventana', 'Activa'),
('1025', '000125', '2026-11-15', '14:00', '17:00', 6, 'Cumpleaños', 'Infantil', 'Redonda', 'Sala 3', 'Selva', 'Ninguna', 0, 0, 1, 250.00, 1500.00, '', 'Activa'),
('1026', '000128', '2026-11-11', '13:00', '16:00', 10, 'Corporativo', 'Ejecutivo', 'Privada', 'Sala 4', 'Clásica', 'Mariscos', 1, 0, 0, 350.00, 3500.00, 'Proyector requerido', 'Activa'),
('1027', '000131', '2026-11-20', '18:00', '21:00', 12, 'Boda', 'Degustación', 'Terraza', 'Sala 6', 'Playa', 'Ninguna', 0, 0, 0, 850.00, 10200.00, 'Banquete para 12 personas', 'Activa'),
('1028', '000132', '2026-11-17', '20:00', '23:00', 4, 'Otro', 'Gourmet', 'Estándar', 'Sala 1', 'Espacio', 'Ninguna', 1, 0, 0, 600.00, 2400.00, '', 'Activa'),
('1029', '000133', '2026-11-13', '15:00', '18:00', 8, 'Cumpleaños', 'Infantil', 'Redonda', 'Sala 2', 'Selva', 'Lactosa', 0, 0, 0, 250.00, 2000.00, '', 'Activa'),
('1030', '000129', '2026-11-24', '17:00', '20:00', 12, 'Boda', 'Degustación', 'Terraza', 'Sala 6', 'Clásica', 'Ninguna', 1, 0, 0, 850.00, 10200.00, '', 'Activa'),
('1031', '000134', '2026-11-30', '12:00', '15:00', 10, 'Corporativo', 'Ejecutivo', 'Privada', 'Sala 4', 'Clásica', 'Ninguna', 0, 0, 0, 350.00, 3500.00, '', 'Activa'),
('1032', '000123', '2026-11-14', '19:00', '22:00', 2, 'Aniversario', 'Gourmet', 'Privada', 'Sala 1', 'Torre Eiffel', 'Gluten', 1, 0, 0, 600.00, 1200.00, 'Experiencia París con música en vivo', 'Activa'),
('1033', '000130', '2026-11-19', '18:30', '21:30', 4, 'Otro', 'Degustación', 'Estándar', 'Sala 3', 'Espacio', 'Ninguna', 0, 0, 0, 850.00, 3400.00, '', 'Activa');

-- 12. RECEPCIONES E INMERSIONES VINCULADAS
INSERT OR IGNORE INTO recepciones (folio, reservacion_folio, observaciones, empleado_folio, estado) VALUES
('1027', '1027', 'Banquete para 12 personas en Terraza', '000125', 'Registrada'),
('1030', '1030', 'Recepción de boda', '000125', 'Registrada');

INSERT OR IGNORE INTO inmersiones (folio, reservacion_folio, vehiculo_folio, observaciones, empleado_folio, estado) VALUES
('1032', '1032', '000123', 'Experiencia París en unidad Mercedes Sprinter', '000125', 'En curso'),
('1033', '1033', '000124', 'Inmersión molecular en unidad VW Crafter', '000125', 'En curso');

-- 13. VENTAS FÍSICAS DE SOUVENIRS (TICKETS)
INSERT OR IGNORE INTO ventas (folio, fecha_hora, cliente_nombre, cliente_folio, souvenir_folio, cantidad, precio_unitario, total, metodo_pago, monto_recibido, cambio, vendedor_folio, estado, observaciones) VALUES
('214589', '2026-11-07 10:15:00', 'María González', '000123', '000128', 2, 725.00, 1450.00, 'Tarjeta', 1450.00, 0.00, '000126', 'Pagado', 'Venta en mostrador'),
('214590', '2026-11-08 12:40:00', 'Juan Pérez', '000124', '000125', 1, 250.00, 250.00, 'Efectivo', 300.00, 50.00, '000126', 'Pagado', 'Sin observaciones'),
('214591', '2026-11-09 17:05:00', 'Sofía Ramírez', '000125', '000123', 3, 180.00, 540.00, 'Efectivo', 600.00, 60.00, '000127', 'Pagado', 'Sin observaciones');

-- 14. ÓRDENES DE COMPRA
INSERT OR IGNORE INTO compras (folio, proveedor_id, fecha_compra, fecha_registro, estado, total, observaciones) VALUES
('OC-2026-0148', '10005', '2026-11-05', '2026-11-05 09:30:00', 'Emitida', 360.00, 'Compra de souvenirs para resurtido'),
('OC-2026-0149', '10001', '2026-11-06', '2026-11-06 11:00:00', 'Emitida', 600.00, 'Compra de insumos gourmet');

INSERT OR IGNORE INTO compra_detalles (compra_folio, tipo_producto, articulo, estado_articulo, cantidad, precio_unitario, subtotal) VALUES
('OC-2026-0148', 'Souvenir', 'Taza UMAD', 'Vigente', 2, 180.00, 360.00),
('OC-2026-0149', 'Ingrediente', 'Aceite de oliva', 'Vigente', 5, 120.00, 600.00);

