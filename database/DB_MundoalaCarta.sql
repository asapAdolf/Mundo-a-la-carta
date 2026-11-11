-- 1. CATÁLOGOS BASE Y ESTADOS

CREATE TABLE Estados (

idEstado INT PRIMARY KEY,

descripcion VARCHAR(30) NOT NULL

);
CREATE TABLE Areas (

idArea INT PRIMARY KEY,

nombre VARCHAR(50) NOT NULL

);



CREATE TABLE Roles (

idRol INT PRIMARY KEY,

nombre VARCHAR(50) NOT NULL

);



-- PRECARGA DE ROLES

INSERT INTO Roles (idRol, nombre) VALUES

(1, 'Cliente'),

(2, 'Recepcionista'),

(3, 'Gerente de Compras'),

(4, 'Gerente de Ventas'),

(5, 'Empleado General'),

(6, 'Mesero'),

(7, 'Chofer'),

(8, 'Administrador');



-- PRECARGA DE ESTADOS

INSERT INTO Estados (idEstado, descripcion) VALUES

(1, 'Activo'),

(2, 'Baja'),

(3, 'Disponible'),

(4, 'Reservada'),

(5, 'Ocupada'),

(6, 'En curso'),

(7, 'Emitida'),

(8, 'Devuelta');



-- 2. PERSONAS Y USUARIOS (EMPLEADOS, CLIENTES Y CREDENCIALES)

CREATE TABLE Empleados (

idEmpleado INT PRIMARY KEY,

nombre VARCHAR(150) NOT NULL,

telefono VARCHAR(12),

correo VARCHAR(50),

claveContrato VARCHAR(10),

foto BYTEA,

idArea INT REFERENCES Areas(idArea),

idRol INT REFERENCES Roles(idRol),

idEstado INT REFERENCES Estados(idEstado)

);



CREATE TABLE Clientes (

idCliente INT PRIMARY KEY,

nombre VARCHAR(150) NOT NULL,

contrasena VARCHAR(20),

tipoCliente VARCHAR(15),

telefono VARCHAR(12),

correo VARCHAR(50),

direccion VARCHAR(150),

contactoEmergencia VARCHAR(150),

telefonoContacto VARCHAR(12),

observaciones VARCHAR(150),

foto BYTEA,

idEstado INT REFERENCES Estados(idEstado)

);



CREATE TABLE Credenciales (

idCredencial INT PRIMARY KEY,

usuario VARCHAR(50) UNIQUE NOT NULL,

contrasena VARCHAR(20) NOT NULL,

idEmpleado INT REFERENCES Empleados(idEmpleado),

idCliente INT REFERENCES Clientes(idCliente),

idEstado INT REFERENCES Estados(idEstado)

);



CREATE TABLE Proveedores (

idProveedor INT PRIMARY KEY,

nombre VARCHAR(100) NOT NULL,

correo VARCHAR(50),

telefono VARCHAR(12),

descripcion VARCHAR(100),

idEstado INT REFERENCES Estados(idEstado)

);



-- 3. ALMACÉN Y ARTÍCULOS / SOUVENIRS

CREATE TABLE Almacenes (

idAlmacen INT PRIMARY KEY,

descripcion VARCHAR(30) NOT NULL

);



CREATE TABLE TipoArticulo (

idTipoArticulo INT PRIMARY KEY,

descripcion VARCHAR(30) NOT NULL

);



CREATE TABLE Articulos (

idArticulo INT PRIMARY KEY,

descripcion VARCHAR(100) NOT NULL,

precioConIVA NUMERIC(10,2) NOT NULL,

foto BYTEA,

idTipoArticulo INT REFERENCES TipoArticulo(idTipoArticulo),

idEstado INT REFERENCES Estados(idEstado)

);



CREATE TABLE ArticulosAlmacenes (

idArtAlm INT PRIMARY KEY,

idArticulo INT REFERENCES Articulos(idArticulo),

idAlmacen INT REFERENCES Almacenes(idAlmacen),

existencia INT NOT NULL DEFAULT 0

);



-- 4. MODULO DE COMPRAS

CREATE TABLE OrdenesCompra (

idOrden INT PRIMARY KEY,

fechaCompra DATE NOT NULL,

observaciones VARCHAR(150),

total NUMERIC(10,2) NOT NULL,

idProveedor INT REFERENCES Proveedores(idProveedor),

idEmpleado INT REFERENCES Empleados(idEmpleado),

idEstado INT REFERENCES Estados(idEstado)

);



CREATE TABLE DetalleOrdenCompra (

idDetalleOrden INT PRIMARY KEY,

idOrden INT REFERENCES OrdenesCompra(idOrden),

idArticulo INT REFERENCES Articulos(idArticulo),

cantidad INT NOT NULL,

precioUnitario NUMERIC(10,2) NOT NULL,

subtotal NUMERIC(10,2) NOT NULL

);



CREATE TABLE DevolucionesCompra (

idDevolucionC INT PRIMARY KEY,

idOrden INT REFERENCES OrdenesCompra(idOrden),

idEmpleado INT REFERENCES Empleados(idEmpleado),

fecha DATE NOT NULL,

motivo VARCHAR(150),

idEstado INT REFERENCES Estados(idEstado)

);



-- 5. TRANSPORTE Y FLOTA

CREATE TABLE TiposVehiculo (

idTipoVehiculo INT PRIMARY KEY,

descripcion VARCHAR(30) NOT NULL

);



CREATE TABLE Transportes (

VIN VARCHAR(17) PRIMARY KEY,

marca VARCHAR(30) NOT NULL,

modelo VARCHAR(30) NOT NULL,

anio INT NOT NULL,

capacidad INT NOT NULL,

combustible VARCHAR(20),

transmision VARCHAR(20),

foto BYTEA,

nota VARCHAR(150),

idTipoVehiculo INT REFERENCES TiposVehiculo(idTipoVehiculo),

idEstado INT REFERENCES Estados(idEstado)

);



CREATE TABLE PolizasSeguro (

folioPoliza INT PRIMARY KEY,

vigencia DATE NOT NULL,

idEstado INT REFERENCES Estados(idEstado)

);



CREATE TABLE TransportesPoliza (

idTransportePoliza INT PRIMARY KEY,

folioPoliza INT REFERENCES PolizasSeguro(folioPoliza),

VIN VARCHAR(17) REFERENCES Transportes(VIN)

);



CREATE TABLE TransportesEquipamiento (

idTransporteEquip INT PRIMARY KEY,

noSerie VARCHAR(17) NOT NULL,

VIN VARCHAR(17) REFERENCES Transportes(VIN)

);



-- 6. EXPERIENCIA Y AMBIENTACIÓN

CREATE TABLE TipoEvento (

idTipoEvento INT PRIMARY KEY,

nombre VARCHAR(50) NOT NULL,

duracionHoras INT NOT NULL,

idEstado INT REFERENCES Estados(idEstado)

);



CREATE TABLE Ambientaciones (

idAmbientacion INT PRIMARY KEY,

nombre VARCHAR(50) NOT NULL,

idEstado INT REFERENCES Estados(idEstado)

);



CREATE TABLE TipoMenu (

idTipoMenu INT PRIMARY KEY,

nombre VARCHAR(50) NOT NULL,

costoPorPersona NUMERIC(10,2) NOT NULL,

idEstado INT REFERENCES Estados(idEstado)

);



CREATE TABLE Salas (

idSala INT PRIMARY KEY,

numero VARCHAR(10) NOT NULL,

tipo VARCHAR(20) NOT NULL,

capacidad INT NOT NULL,

idEstado INT REFERENCES Estados(idEstado)

);



CREATE TABLE TipoPago (

idTipoPago INT PRIMARY KEY,

forma VARCHAR(20) NOT NULL,

idEstado INT REFERENCES Estados(idEstado)

);



CREATE TABLE ModulosVR (

idModuloVR INT PRIMARY KEY,

categoria VARCHAR(30),

nombre VARCHAR(50) NOT NULL,

clasificacionEdad VARCHAR(10),

idiomasDisponibles VARCHAR(50),

costoAdicional NUMERIC(10,2),

idEstado INT REFERENCES Estados(idEstado)

);



-- 7. RESERVACIONES, RECEPCIÓN E INMERSIÓN VR

CREATE TABLE Reservaciones (

idReservacion INT PRIMARY KEY,

idCliente INT REFERENCES Clientes(idCliente),

idTipoEvento INT REFERENCES TipoEvento(idTipoEvento),

idAmbientacion INT REFERENCES Ambientaciones(idAmbientacion),

idTipoMenu INT REFERENCES TipoMenu(idTipoMenu),

idSala INT REFERENCES Salas(idSala),

idTipoPago INT REFERENCES TipoPago(idTipoPago),

idEstado INT REFERENCES Estados(idEstado),

fechaReservacion DATE NOT NULL,

horaEntradaReservacion TIME,

horaSalidaReservacion TIME,

comensalesReservacion INT,

vegetarianosReservacion INT,

veganosReservacion INT,

alergiasReservacion VARCHAR(200),

descorcheReservacion BOOLEAN DEFAULT FALSE,

precioPorPersonaReservacion NUMERIC(10,2),

extrasReservacion NUMERIC(10,2),

posibleMontoReservacion NUMERIC(10,2),

observacionesReservacion VARCHAR(200),

motivoCancelacion VARCHAR(150),

multaCancelacion NUMERIC(10,2),

firmaAlta VARCHAR(40),

-- Datos Recepción

idEmpleadoRecepcion INT REFERENCES Empleados(idEmpleado),

fechaRecepcion DATE,

horaEntradaRecepcion TIME,

horaSalidaRecepcion TIME,

comensalesRecepcion INT,

vegetarianosRecepcion INT,

veganosRecepcion INT,

alergiasRecepcion VARCHAR(200),

descorcheRecepcion BOOLEAN DEFAULT FALSE,

montoACobrarRecepcion NUMERIC(10,2),

observacionesRecepcion VARCHAR(200),

firmaClienteRecepcion BOOLEAN DEFAULT FALSE,

-- Datos Inmersión VR

idEmpleadoInmersion INT REFERENCES Empleados(idEmpleado),

idModuloVRInmersion INT REFERENCES ModulosVR(idModuloVR),

horaInicioInmersion TIME,

horaFinInmersion TIME,

numeroJugadoresInmersion INT,

idiomaInmersion VARCHAR(30),

misionesGrupoInmersion BOOLEAN DEFAULT FALSE,

costoExtraInmersion NUMERIC(10,2),

sillasFuncionalesInmersion INT,

bocinasFuncionalesInmersion VARCHAR(15),

responsivaAceptadaInmersion BOOLEAN DEFAULT FALSE,

observacionesInmersion VARCHAR(200)

);



CREATE TABLE ServiciosTransporte (

idServicio INT PRIMARY KEY,

idReservacion INT REFERENCES Reservaciones(idReservacion),

noSerie VARCHAR(17),

idChofer INT REFERENCES Empleados(idEmpleado),

tipoServicio VARCHAR(10),

fechaHora TIMESTAMP NOT NULL,

direccion VARCHAR(150),

idEstado INT REFERENCES Estados(idEstado)

);



-- 8. CAJAS Y TICKETS DE VENTAS

CREATE TABLE Cajas (

idCaja INT PRIMARY KEY,

fondoInicial NUMERIC(10,2) NOT NULL,

fechaApertura TIMESTAMP NOT NULL,

fechaCierre TIMESTAMP,

idEmpleado INT REFERENCES Empleados(idEmpleado),

idEstado INT REFERENCES Estados(idEstado)

);



CREATE TABLE Tickets (

idTicket INT PRIMARY KEY,

idTipoPago INT REFERENCES TipoPago(idTipoPago),

montoRecibido NUMERIC(10,2),

cambio NUMERIC(10,2),

fechaHora TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

idEmpleado INT REFERENCES Empleados(idEmpleado),

idEstado INT REFERENCES Estados(idEstado)

);



CREATE TABLE DetalleTicket (

idDetalleTicket INT PRIMARY KEY,

idTicket INT REFERENCES Tickets(idTicket),

idArticulo INT REFERENCES Articulos(idArticulo),

cantidad INT NOT NULL,

precioUnitario NUMERIC(10,2) NOT NULL,

total NUMERIC(10,2) NOT NULL

);



CREATE TABLE TarjetasCredito (

idTarjeta INT PRIMARY KEY,

idTicket INT REFERENCES Tickets(idTicket),

numeroEnmascarado VARCHAR(19) NOT NULL,

codigoAutorizacion VARCHAR(20) NOT NULL,

idEstado INT REFERENCES Estados(idEstado)

);



CREATE TABLE DevolucionesTicket (

idDevolucionesTicket INT PRIMARY KEY,

idTicket INT REFERENCES Tickets(idTicket),

idEmpleado INT REFERENCES Empleados(idEmpleado),

fecha DATE NOT NULL,

hora TIME NOT NULL,

motivo VARCHAR(150),

subtotal NUMERIC(10,2),

montoReembolsar NUMERIC(10,2),

IVA NUMERIC(10,2)

);



CREATE TABLE DetalleDevolucionesTicket (

idDetalleDevolucionesTicket INT PRIMARY KEY,

idDevolucionesTicket INT REFERENCES DevolucionesTicket(idDevolucionesTicket),

idEmpleado INT REFERENCES Empleados(idEmpleado),

idArticulo INT REFERENCES Articulos(idArticulo),

motivo VARCHAR(150),

cantidad INT NOT NULL,

precioConIVA NUMERIC(10,2)

);



-- 9. RESTAURANTE: COMANDAS EXTRAS Y MENU

CREATE TABLE CategoriaAlimentos (

idCategoria INT PRIMARY KEY,

descripcion VARCHAR(40) NOT NULL

);



CREATE TABLE Platillos (

idPlatillo INT PRIMARY KEY,

nombre VARCHAR(80) NOT NULL,

gramaje INT,

caloriasTotales INT,

precio NUMERIC(10,2) NOT NULL,

idCategoria INT REFERENCES CategoriaAlimentos(idCategoria),

idEstado INT REFERENCES Estados(idEstado)

);



CREATE TABLE Comandas (

idComanda INT PRIMARY KEY,

fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

totalAPagar NUMERIC(10,2),

idSala INT REFERENCES Salas(idSala),

idEmpleado INT REFERENCES Empleados(idEmpleado),

idReservacion INT REFERENCES Reservaciones(idReservacion),

idEstado INT REFERENCES Estados(idEstado)

);



CREATE TABLE DetalleComanda (

idDetalleComanda INT PRIMARY KEY,

idComanda INT REFERENCES Comandas(idComanda),

idPlatillo INT REFERENCES Platillos(idPlatillo),

cantidad INT NOT NULL,

precioUnitario NUMERIC(10,2) NOT NULL,

subtotal NUMERIC(10,2) NOT NULL

);



CREATE TABLE Cancelaciones (

idCancelacion INT PRIMARY KEY,

idComanda INT REFERENCES Comandas(idComanda),

cantidad INT NOT NULL,

contrasenaAutorizacion VARCHAR(20) NOT NULL

);

