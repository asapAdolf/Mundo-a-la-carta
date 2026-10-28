/**
 * datos.js - Capa de acceso a datos del sistema (MC.datos).
 *
 * Mientras el equipo de Base de Datos implementa el backend, la información se
 * guarda en localStorage del navegador y se siembra con datos de ejemplo.
 * Todas las funciones devuelven Promesas para que, cuando exista la API real,
 * baste con reemplazar el ADAPTADOR por llamadas fetch() sin tocar las pantallas:
 *
 *   listar(col, opciones)      GET    /api/<col>?q=&pagina=&porPagina=
 *   obtener(col, folio)        GET    /api/<col>/<folio>
 *   crear(col, datos)          POST   /api/<col>
 *   actualizar(col, folio, c)  PATCH  /api/<col>/<folio>
 *   eliminar(col, folio)       DELETE /api/<col>/<folio>
 *
 * Cada registro tiene un "folio" único (llave primaria) y las llaves del resto
 * de campos coinciden con el id de su campo en las vistas HTML.
 */
(function () {
  'use strict';
  var MC = (window.MC = window.MC || {});
  var CLAVE = 'mc_bd_v1';

  /* ---------- Utilidades de fecha compartidas ---------- */
  var dos = function (n) { return String(n).padStart(2, '0'); };
  MC.hoy = function (desfaseDias) {
    var d = new Date();
    if (desfaseDias) d.setDate(d.getDate() + desfaseDias);
    return d.getFullYear() + '-' + dos(d.getMonth() + 1) + '-' + dos(d.getDate());
  };
  MC.fechaMx = function (iso) {
    if (!iso) return '';
    var p = String(iso).slice(0, 10).split('-');
    return p.length === 3 ? p[2] + '/' + p[1] + '/' + p[0] : iso;
  };
  MC.ahoraMx = function () {
    var d = new Date();
    return MC.fechaMx(MC.hoy()) + ' ' + dos(d.getHours()) + ':' + dos(d.getMinutes());
  };

  /* ---------- Formato de folios por colección ---------- */
  var anio = new Date().getFullYear();
  var FOLIOS = {
    usuarios:     function (n) { return String(n).padStart(6, '0'); },
    souvenirs:    function (n) { return String(n).padStart(6, '0'); },
    empleados:    function (n) { return String(n).padStart(6, '0'); },
    transporte:   function (n) { return String(n).padStart(6, '0'); },
    reservaciones: function (n) { return String(n); },
    ventas:       function (n) { return String(n); },
    pedidos:      function (n) { return 'PED-' + String(n).padStart(6, '0'); },
    comandas:     function (n) { return String(n).padStart(7, '0'); },
    compras:      function (n) { return 'OC-' + anio + '-' + String(n).padStart(4, '0'); },
    devoluciones: function (n) { return 'D-' + anio + '-' + String(n).padStart(6, '0'); }
  };

  /* ---------- Datos de ejemplo ---------- */
  function semilla() {
    var c = {};

    var nombres = [
      ['María Fernanda López', 'Av. Reforma 123, CDMX', 'Frecuente', 'Luis López', '5512345678', '5587654321', 'maria.lopez@correo.com', 'Sin gluten'],
      ['Juan Pérez', 'Calle 5 de Mayo 45, Puebla', 'Nuevo', 'Ana Pérez', '2221234567', '2227654321', 'juan.perez@email.com', ''],
      ['Sofía Ramírez', 'Blvd. Atlixco 300, Puebla', 'VIP', 'Pedro Ramírez', '2229876543', '2223456789', 'sofia.ramirez@correo.com', 'Vegana'],
      ['Carlos Hernández', 'Av. Juárez 10, CDMX', 'Frecuente', '', '5598761234', '', 'carlos.hdz@correo.com', ''],
      ['Valeria Torres', 'Calle Hidalgo 88, Cholula', 'Nuevo', 'Marta Torres', '2224567890', '2220987654', 'valeria.torres@correo.com', 'Alergia a nueces'],
      ['Diego Martínez', 'Av. Universidad 200, CDMX', 'Corporativo', '', '5543218765', '', 'diego.mtz@empresa.com', ''],
      ['Fernanda Castillo', 'Calle Morelos 12, Puebla', 'Frecuente', 'José Castillo', '2226543210', '2221112233', 'fer.castillo@correo.com', ''],
      ['Ricardo Gómez', 'Privada Las Flores 5, Tlaxcala', 'Nuevo', '', '2461234567', '', 'ricardo.gomez@correo.com', 'Silla de ruedas'],
      ['Andrea Morales', 'Av. 31 Poniente 400, Puebla', 'VIP', 'Laura Morales', '2228887766', '2225554433', 'andrea.morales@correo.com', ''],
      ['Jorge Navarro', 'Calle Allende 70, CDMX', 'Frecuente', '', '5576543210', '', 'jorge.navarro@correo.com', ''],
      ['Paola Jiménez', 'Av. Zaragoza 15, Puebla', 'Nuevo', 'Raúl Jiménez', '2223334455', '2229998877', 'paola.jimenez@correo.com', 'Sin lactosa'],
      ['Miguel Ángel Ruiz', 'Calle Reforma 99, Cholula', 'Corporativo', '', '2227778899', '', 'miguel.ruiz@empresa.com', '']
    ];
    c.usuarios = nombres.map(function (u, i) {
      return {
        folio: FOLIOS.usuarios(123 + i), nombre: u[0], direccion: u[1], 'tipo-de-cliente': u[2],
        'contacto-de-emergencia': u[3], telefono: u[4], 'telefono-del-contacto-de-emergencia': u[5],
        'correo-electronico': u[6], 'observaciones-especiales': u[7], password: 'cliente123',
        estado: i === 10 ? 'Inactivo' : 'Activo'
      };
    });

    var souv = [
      ['Taza UMAD', 180, 'Cocina', '10001', 'Taza de cerámica con logotipo'],
      ['Llavero Mundo a la Carta', 60, 'Accesorios', '10002', 'Llavero metálico'],
      ['Playera', 250, 'Ropa', '10003', 'Playera de algodón bordada'],
      ['Imán de recuerdo', 45, 'Accesorios', '10002', 'Imán decorativo'],
      ['Postal', 25, 'Papelería', '10004', 'Postal ilustrada de las salas'],
      ['Taza de talavera', 725, 'Artesanías', '10005', 'Taza de talavera pintada a mano'],
      ['Gorra bordada', 220, 'Ropa', '10003', 'Gorra ajustable'],
      ['Libreta artesanal', 140, 'Papelería', '10004', 'Libreta con pasta de piel'],
      ['Termo de acero', 390, 'Cocina', '10001', 'Termo de 500 ml'],
      ['Plato decorativo', 510, 'Artesanías', '10005', 'Plato de talavera poblana'],
      ['Separador de libros', 30, 'Papelería', '10004', 'Separador metálico'],
      ['Sudadera', 650, 'Ropa', '10003', 'Sudadera con capucha']
    ];
    c.souvenirs = souv.map(function (s, i) {
      return {
        folio: FOLIOS.souvenirs(123 + i), nombre: s[0], 'precio-por-unidad': String(s[1]), departamento: s[2],
        'clave-del-proveedor': s[3], descripcion: s[4], existencia: 20, estado: i === 11 ? 'Inactivo' : 'Activo'
      };
    });

    var emp = [
      ['Elena Morales', '5543219876', 'Administración', 'elena.morales@mundoalacarta.com', 'Administrador', '8492019', 'admin'],
      ['Carlos Eduardo Ramírez', '5543219877', 'Administración', 'carlos.ramirez@mundoalacarta.com', 'Gerente', '8492020', 'gerente'],
      ['Juan Pérez', '5578901234', 'Operaciones', 'juan.perez@mundoalacarta.com', 'Mesero', '9384751', 'mesero'],
      ['Luis Ramírez', '5598765432', 'Ventas', 'luis.ramirez@mundoalacarta.com', 'Empleado', '6712390', 'ventas'],
      ['Mariana Gómez Herrera', '5511122233', 'Ventas', 'mariana.gomez@mundoalacarta.com', 'Empleado', '6712391', 'mariana'],
      ['Roberto Solís Vargas', '5544455566', 'Cocina', 'roberto.solis@mundoalacarta.com', 'Empleado', '6712392', 'roberto'],
      ['Ana Lucía Pineda', '5577788899', 'Cocina', 'ana.pineda@mundoalacarta.com', 'Empleado', '6712393', 'ana'],
      ['Héctor Villalobos', '5512398745', 'Operaciones', 'hector.villalobos@mundoalacarta.com', 'Mesero', '6712394', 'hector']
    ];
    c.empleados = emp.map(function (e, i) {
      return {
        folio: FOLIOS.empleados(123 + i), nombre: e[0], telefono: e[1], area: e[2], correo: e[3], 'rol-puesto': e[4],
        'clave-del-contrato': e[5], usuario: e[6], password: e[6] + '123', estado: i === 5 ? 'Baja' : 'Activo'
      };
    });

    var veh = [
      ['1HGCM82633A004352', 'Pantallas 4K y audio envolvente', 'Mercedes-Benz', '18', 'Sprinter 2024', 'POL-2026-0457', 'ABC-123-D', '2027-03-15', 'Van', '2027-01-20', 'Blanco', 'Vigente'],
      ['3VWFE21C04M000001', 'Realidad virtual', 'Volkswagen', '14', 'Crafter 2023', 'POL-2026-0458', 'PUE-456-A', '2027-05-10', 'Van', '2027-02-11', 'Gris', 'Vigente'],
      ['1FTFW1ET5EFA00002', '', 'Ford', '20', 'Transit 2022', 'POL-2026-0459', 'PUE-789-B', '2026-12-31', 'Minibús', '2026-11-30', 'Azul', 'Vigente'],
      ['JTDKB20U093000003', 'Iluminación ambiental', 'Toyota', '12', 'Hiace 2024', 'POL-2026-0460', 'TLX-111-C', '2027-08-01', 'Van', '2027-07-15', 'Negro', 'Vigente'],
      ['WDB9066331S000004', 'Pantallas 4K', 'Mercedes-Benz', '22', 'Sprinter 2021', 'POL-2026-0461', 'CDM-222-D', '2026-10-01', 'Minibús', '2026-09-30', 'Plata', 'Vencida'],
      ['2C4RDGBG5ER000005', '', 'Chrysler', '7', 'Pacifica 2023', 'POL-2026-0462', 'PUE-333-E', '2027-04-20', 'Camioneta', '2027-04-20', 'Rojo', 'Vigente'],
      ['5YJSA1E26HF000006', 'Audio envolvente', 'Nissan', '15', 'Urvan 2022', 'POL-2026-0463', 'PUE-444-F', '2027-06-12', 'Van', '2027-06-12', 'Blanco', 'Vigente']
    ];
    c.transporte = veh.map(function (v, i) {
      return {
        folio: FOLIOS.transporte(123 + i), vin: v[0], 'equipamiento-inmersivo': v[1], marca: v[2], capacidad: v[3], modelo: v[4],
        'folio-de-poliza-de-seguro': v[5], placas: v[6], 'vigencia-de-poliza': v[7], 'tipo-de-vehiculo': v[8],
        'vigencia-de-tarjeta-de-circulacion': v[9], color: v[10], 'estatus-de-verificacion-vehicular': v[11],
        estado: i === 4 ? 'En mantenimiento' : 'Disponible'
      };
    });

    /* [días a partir de hoy, evento, folio de cliente, hora, comensales, menú, mesa, alergias, sala, ambientación, observaciones] */
    var res = [
      [3, 'Aniversario', '000124', '19:30', '2', 'Gourmet', 'Estándar', 'Ninguna', 'Sala 1', 'Torre Eiffel', 'Mesa junto a la ventana'],
      [5, 'Cumpleaños', '000125', '14:00', '6', 'Infantil', 'Redonda', 'Ninguna', 'Sala 3', 'Selva', ''],
      [1, 'Corporativo', '000128', '13:00', '10', 'Ejecutivo', 'Privada', 'Mariscos', 'Sala 4', 'Clásica', 'Proyector'],
      [10, 'Boda', '000131', '18:00', '12', 'Degustación', 'Terraza', 'Ninguna', 'Sala 6', 'Playa', ''],
      [7, 'Otro', '000132', '20:00', '4', 'Gourmet', 'Estándar', 'Ninguna', 'Sala 1', 'Espacio', ''],
      [3, 'Cumpleaños', '000133', '15:00', '8', 'Infantil', 'Redonda', 'Lactosa', 'Sala 2', 'Selva', ''],
      [14, 'Boda', '000129', '17:00', '12', 'Degustación', 'Terraza', 'Ninguna', 'Sala 6', 'Clásica', 'Banquete'],
      [20, 'Corporativo', '000134', '12:00', '10', 'Ejecutivo', 'Privada', 'Ninguna', 'Sala 4', 'Clásica', ''],
      [4, 'Aniversario', '000123', '19:00', '2', 'Gourmet', 'Privada', 'Gluten', 'Sala 1', 'Torre Eiffel', 'Experiencia París'],
      [9, 'Otro', '000130', '18:30', '4', 'Degustación', 'Estándar', 'Ninguna', 'Sala 3', 'Espacio', '']
    ];
    c.reservaciones = res.map(function (r, i) {
      var pp = MC_PRECIO_MENU[r[5]] || 600;
      var cli = c.usuarios.find(function (u) { return u.folio === r[2]; });
      return {
        folio: FOLIOS.reservaciones(1024 + i), fecha: MC.hoy(r[0]), 'tipo-evento': r[1], cliente: cli.nombre, clienteFolio: cli.folio,
        'hora-entrada': r[3], 'hora-salida': sumarHoras(r[3], 3), comensales: r[4], 'tipo-menu': r[5], 'tipo-mesa': r[6],
        alergias: r[7], sala: r[8], ambientacion: r[9], observaciones: r[10], descorche: i % 2 === 0, vegetariano: false,
        vegano: cli.nombre === 'Sofía Ramírez', 'precio-persona': String(pp), 'monto-reserva': (pp * Number(r[4])).toFixed(2),
        estado: 'Activa'
      };
    });
    /* Recepciones e inmersiones usan el mismo folio de la reservación a la que pertenecen */
    var derivar = function (r, extra) { var x = copia(r); Object.keys(extra).forEach(function (k) { x[k] = extra[k]; }); return x; };
    c.recepciones = [derivar(c.reservaciones[3], { observaciones: 'Banquete para 12 personas' }), derivar(c.reservaciones[6], {})];
    c.inmersiones = [derivar(c.reservaciones[8], { observaciones: 'Experiencia París' }), derivar(c.reservaciones[9], {})];

    c.ventas = [
      { folio: '214589', fecha: MC.hoy(-3) + ' 10:15', cliente: 'María González', souvenir: 'Taza de talavera', souvenirFolio: '000128', cantidad: 2, precio: 725, total: 1450, metodo: 'Tarjeta', vendedor: 'Luis Ramírez', estado: 'Pagado', observaciones: 'Sin observaciones' },
      { folio: '214590', fecha: MC.hoy(-2) + ' 12:40', cliente: 'Juan Pérez', souvenir: 'Playera', souvenirFolio: '000125', cantidad: 1, precio: 250, total: 250, metodo: 'Efectivo', vendedor: 'Luis Ramírez', estado: 'Pagado', observaciones: 'Sin observaciones' },
      { folio: '214591', fecha: MC.hoy(-1) + ' 17:05', cliente: 'Sofía Ramírez', souvenir: 'Taza UMAD', souvenirFolio: '000123', cantidad: 3, precio: 180, total: 540, metodo: 'Efectivo', vendedor: 'Mariana Gómez Herrera', estado: 'Pagado', observaciones: 'Sin observaciones' }
    ];

    c.compras = [
      { folio: FOLIOS.compras(148), proveedor: 'Artesanías Puebla', fecha: MC.hoy(-5), registro: MC.fechaMx(MC.hoy(-5)) + ' 09:30', estado: 'Emitida', observaciones: '', lineas: [{ tipo: 'Souvenir', articulo: 'Taza UMAD', cantidad: 2, precio: 180 }], total: 360 },
      { folio: FOLIOS.compras(149), proveedor: 'Distribuidora Gourmet', fecha: MC.hoy(-4), registro: MC.fechaMx(MC.hoy(-4)) + ' 11:00', estado: 'Emitida', observaciones: '', lineas: [{ tipo: 'Ingrediente', articulo: 'Aceite de oliva', cantidad: 5, precio: 120 }], total: 600 }
    ];

    var mesas = ['A', 'B', 'C'];
    c.mesas = [];
    mesas.forEach(function (l) { for (var n = 1; n <= 6; n++) c.mesas.push({ folio: l + n, estado: 'Libre', comanda: null }); });

    /* Catálogo público: carta (mismos productos de vistas/carta/carta.html) y experiencias inmersivas */
    var carta = [
      ['champagne', 'Dom Pérignon Vintage Flute', 35.5, 'Bebidas', 'fa-champagne-glasses'],
      ['popcorn', 'Saffron & Gold Leaf Popcorn', 14.5, 'Entradas', 'fa-bowl-food'],
      ['tapas-jamon', 'Iberian Ham & Olive Tapas', 22.09, 'Entradas', 'fa-bacon'],
      ['arancini', 'Truffled Wild Mushroom Arancini', 18.5, 'Entradas', 'fa-bowl-rice'],
      ['old-fashioned', 'Signature Smoked Old Fashioned Cocktail', 18.5, 'Bebidas', 'fa-martini-glass-citrus'],
      ['foie-gras', 'Seared Foie Gras Crostini', 22, 'Entradas', 'fa-bread-slice'],
      ['pinot-noir', 'Domaine Serene Pinot Noir Glass', 94, 'Bebidas', 'fa-wine-glass'],
      ['agua', 'Hildon Premium Sparkling Water', 8, 'Bebidas', 'fa-glass-water'],
      ['caviar', 'Caviar & Blini Bites', 13, 'Entradas', 'fa-fish'],
      ['salmon', 'Smoked Salmon & Cream Cheese Rolls', 18, 'Entradas', 'fa-fish-fins'],
      ['huevos', 'Truffle Deviled Eggs', 8, 'Entradas', 'fa-egg'],
      ['baklava', 'Pistachio & Rosewater Baklava', 18, 'Postres', 'fa-cookie-bite']
    ];
    c.productos = carta.map(function (p) {
      return { folio: p[0], nombre: p[1], precio: p[2], categoria: p[3], icono: p[4], tipo: 'Carta', estado: 'Activo' };
    });
    var exp = [
      ['exp-paris', 'Noche en París', 'Torre Eiffel', 'Cena gourmet bajo la Torre Eiffel con música en vivo.', 600, 'fa-landmark'],
      ['exp-playa', 'Atardecer en la playa', 'Playa', 'Mariscos y coctelería con brisa marina y sonido de olas.', 850, 'fa-umbrella-beach'],
      ['exp-selva', 'Expedición a la selva', 'Selva', 'Menú infantil y familiar rodeados de naturaleza.', 250, 'fa-tree'],
      ['exp-espacio', 'Cena en el espacio', 'Espacio', 'Degustación molecular flotando entre planetas.', 850, 'fa-user-astronaut'],
      ['exp-clasica', 'Salón clásico', 'Clásica', 'Menú ejecutivo ideal para eventos corporativos.', 350, 'fa-champagne-glasses']
    ];
    c.experiencias = exp.map(function (e) {
      return { folio: e[0], nombre: e[1], ambientacion: e[2], descripcion: e[3], precio: e[4], icono: e[5], tipo: 'Experiencia', estado: 'Activo' };
    });

    c.comandas = [];
    c.pedidos = [];
    c.devoluciones = [];

    return {
      colecciones: c,
      secuencias: {
        usuarios: 123 + c.usuarios.length, souvenirs: 123 + c.souvenirs.length, empleados: 123 + c.empleados.length,
        transporte: 123 + c.transporte.length, reservaciones: 1024 + c.reservaciones.length, ventas: 214592,
        pedidos: 1, comandas: 1024, compras: 150, devoluciones: 451
      }
    };
  }

  /* Precio por persona según el tipo de menú (usado por reservas) */
  var MC_PRECIO_MENU = MC.PRECIO_MENU = { Gourmet: 600, Ejecutivo: 350, Infantil: 250, 'Degustación': 850 };

  function sumarHoras(hhmm, horas) {
    if (!hhmm) return '';
    var p = hhmm.split(':');
    return dos((parseInt(p[0], 10) + horas) % 24) + ':' + (p[1] || '00');
  }
  MC.sumarHoras = sumarHoras;

  /* ---------- Adaptador: localStorage (reemplazable por fetch) ---------- */
  var memoria = null;
  function bd() {
    if (memoria) return memoria;
    try { memoria = JSON.parse(localStorage.getItem(CLAVE)); } catch (e) { memoria = null; }
    if (!memoria || !memoria.colecciones) { memoria = semilla(); guardar(); return memoria; }
    /* Migración: agrega colecciones nuevas a datos guardados por una versión anterior */
    var nueva = semilla();
    var faltantes = Object.keys(nueva.colecciones).filter(function (k) { return !memoria.colecciones[k]; });
    if (faltantes.length) {
      faltantes.forEach(function (k) { memoria.colecciones[k] = nueva.colecciones[k]; });
      guardar();
    }
    return memoria;
  }
  function guardar() {
    try { localStorage.setItem(CLAVE, JSON.stringify(memoria)); } catch (e) { /* almacenamiento lleno o bloqueado */ }
  }
  function coleccion(col) {
    var b = bd();
    if (!b.colecciones[col]) b.colecciones[col] = [];
    return b.colecciones[col];
  }
  var copia = function (o) { return o == null ? o : JSON.parse(JSON.stringify(o)); };
  var normal = function (s) { return String(s == null ? '' : s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase(); };
  var listo = function (v) { return Promise.resolve(copia(v)); };
  var falla = function (msg) { return Promise.reject(new Error(msg)); };

  MC.datos = {
    /**
     * Lista registros con búsqueda, filtro y paginación.
     * opciones: { q, campos: [...], filtro: {campo: valor} | fn, pagina (1..n), porPagina }
     * Resuelve: { items, total, pagina, paginas, porPagina }
     */
    listar: function (col, o) {
      o = o || {};
      var items = coleccion(col).slice();
      if (typeof o.filtro === 'function') items = items.filter(o.filtro);
      else if (o.filtro) items = items.filter(function (r) {
        return Object.keys(o.filtro).every(function (k) { return r[k] === o.filtro[k]; });
      });
      if (o.q) {
        var q = normal(o.q);
        items = items.filter(function (r) {
          var campos = o.campos || Object.keys(r);
          return campos.some(function (k) { return normal(r[k]).indexOf(q) !== -1; });
        });
      }
      if (o.orden) items.sort(o.orden);
      var total = items.length;
      var porPagina = o.porPagina || total || 1;
      var paginas = Math.max(1, Math.ceil(total / porPagina));
      var pagina = Math.min(Math.max(1, o.pagina || 1), paginas);
      return listo({ items: items.slice((pagina - 1) * porPagina, pagina * porPagina), total: total, pagina: pagina, paginas: paginas, porPagina: porPagina });
    },
    obtener: function (col, folio) {
      var r = coleccion(col).find(function (x) { return String(x.folio) === String(folio); });
      return r ? listo(r) : falla('No existe el registro con folio ' + folio);
    },
    /* Primer registro que cumple fn (o null) */
    buscar: function (col, fn) {
      return listo(coleccion(col).find(fn) || null);
    },
    /* Si datos.folio viene definido se respeta (p. ej. recepción ligada a una reservación) */
    crear: function (col, datos) {
      var b = bd();
      var registro = copia(datos);
      if (registro.folio) {
        var existe = coleccion(col).some(function (x) { return String(x.folio) === String(registro.folio); });
        if (existe) return falla('Ya existe un registro con folio ' + registro.folio);
      } else {
        var n = b.secuencias[col] || 1;
        registro.folio = FOLIOS[col] ? FOLIOS[col](n) : String(n);
        b.secuencias[col] = n + 1;
      }
      registro.creado = new Date().toISOString();
      coleccion(col).push(registro);
      guardar();
      return listo(registro);
    },
    actualizar: function (col, folio, cambios) {
      var r = coleccion(col).find(function (x) { return String(x.folio) === String(folio); });
      if (!r) return falla('No existe el registro con folio ' + folio);
      Object.keys(cambios).forEach(function (k) { if (k !== 'folio') r[k] = cambios[k]; });
      r.modificado = new Date().toISOString();
      guardar();
      return listo(r);
    },
    eliminar: function (col, folio) {
      var lista = coleccion(col);
      var i = lista.findIndex(function (x) { return String(x.folio) === String(folio); });
      if (i === -1) return falla('No existe el registro con folio ' + folio);
      lista.splice(i, 1);
      guardar();
      return listo(true);
    },
    /* Siguiente folio que se asignará (solo informativo) */
    siguienteFolio: function (col) {
      var n = bd().secuencias[col] || 1;
      return Promise.resolve(FOLIOS[col] ? FOLIOS[col](n) : String(n));
    },
    /* Restaura los datos de ejemplo */
    reiniciar: function () {
      memoria = semilla();
      guardar();
      return Promise.resolve(true);
    }
  };
})();
