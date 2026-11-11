/**
 * api.js - Backend REST API para conectar el frontend con SQLite nativo.
 * Compatible con Node 22+ (node:sqlite) y despliegue en Render.
 */

const fs = require('fs');
const path = require('path');
const { DatabaseSync } = require('node:sqlite');

const DB_PATH = path.join(__dirname, 'database', 'mundo_a_la_carta.db');
const SCHEMA_PATH = path.join(__dirname, 'database', 'schema.sql');
const SEED_PATH = path.join(__dirname, 'database', 'seed.sql');

// Asegurar existencia e inicialización de la base de datos
function obtenerBD() {
  const existe = fs.existsSync(DB_PATH);
  const db = new DatabaseSync(DB_PATH);
  db.exec('PRAGMA foreign_keys = ON;');
  if (!existe) {
    console.log('📦 Inicializando base de datos en primer arranque...');
    if (fs.existsSync(SCHEMA_PATH)) db.exec(fs.readFileSync(SCHEMA_PATH, 'utf-8'));
    if (fs.existsSync(SEED_PATH)) db.exec(fs.readFileSync(SEED_PATH, 'utf-8'));
    console.log('✅ Base de datos inicializada.');
  }
  return db;
}

let db = obtenerBD();

// Mapeo entre nombre de colección del frontend y tabla en SQLite
const TABLAS = {
  usuarios: 'usuarios',
  souvenirs: 'souvenirs',
  empleados: 'empleados',
  transporte: 'transporte',
  reservaciones: 'reservaciones',
  recepciones: 'recepciones',
  inmersiones: 'inmersiones',
  mesas: 'mesas',
  comandas: 'comandas',
  compras: 'compras',
  ventas: 'ventas',
  pedidos: 'pedidos',
  productos: 'productos_carta',
  experiencias: 'experiencias',
  devoluciones: 'devoluciones_ventas'
};

// Generador de folios
const anio = new Date().getFullYear();
const FORMATO_FOLIO = {
  usuarios: (n) => String(n).padStart(6, '0'),
  souvenirs: (n) => String(n).padStart(6, '0'),
  empleados: (n) => String(n).padStart(6, '0'),
  transporte: (n) => String(n).padStart(6, '0'),
  reservaciones: (n) => String(n),
  ventas: (n) => String(n),
  pedidos: (n) => 'PED-' + String(n).padStart(6, '0'),
  comandas: (n) => String(n).padStart(7, '0'),
  compras: (n) => 'OC-' + anio + '-' + String(n).padStart(4, '0'),
  devoluciones: (n) => 'D-' + anio + '-' + String(n).padStart(6, '0')
};

const BASE_FOLIO = {
  usuarios: 123,
  souvenirs: 123,
  empleados: 123,
  transporte: 123,
  reservaciones: 1024,
  ventas: 214589,
  pedidos: 1,
  comandas: 1024,
  compras: 150,
  devoluciones: 451
};

function siguienteNumeroFolio(col, tabla) {
  const base = BASE_FOLIO[col] || 1;
  const rows = db.prepare(`SELECT folio FROM ${tabla}`).all();
  let max = 0;
  for (const r of rows) {
    const match = String(r.folio || '').match(/(\d+)$/);
    if (match) {
      const num = parseInt(match[1], 10);
      if (num > max) max = num;
    }
  }
  return Math.max(base, max + 1);
}

function consultarTodos(col, tabla) {
  if (col === 'reservaciones') {
    return db.prepare(`SELECT r.*, COALESCE(u.nombre, '') AS cliente FROM reservaciones r LEFT JOIN usuarios u ON r.cliente_folio = u.folio`).all();
  }
  if (col === 'recepciones') {
    return db.prepare(`
      SELECT rec.folio, rec.reservacion_folio, rec.fecha_hora, rec.observaciones, rec.empleado_folio, rec.estado,
             r.fecha, r.hora_entrada, r.hora_salida, r.comensales, r.tipo_evento, r.tipo_menu, r.tipo_mesa,
             r.sala_id, r.ambientacion_id, r.alergias, r.descorche, r.vegetariano, r.vegano,
             r.precio_persona, r.monto_reserva, r.cliente_folio,
             COALESCE(u.nombre, '') AS cliente
      FROM recepciones rec
      LEFT JOIN reservaciones r ON rec.reservacion_folio = r.folio
      LEFT JOIN usuarios u ON r.cliente_folio = u.folio
    `).all();
  }
  if (col === 'inmersiones') {
    return db.prepare(`
      SELECT inm.folio, inm.reservacion_folio, inm.vehiculo_folio, inm.fecha_hora, inm.observaciones, inm.empleado_folio, inm.estado,
             r.fecha, r.hora_entrada, r.hora_salida, r.comensales, r.tipo_evento, r.tipo_menu, r.tipo_mesa,
             r.sala_id, r.ambientacion_id, r.alergias, r.descorche, r.vegetariano, r.vegano,
             r.precio_persona, r.monto_reserva, r.cliente_folio,
             COALESCE(u.nombre, '') AS cliente
      FROM inmersiones inm
      LEFT JOIN reservaciones r ON inm.reservacion_folio = r.folio
      LEFT JOIN usuarios u ON r.cliente_folio = u.folio
    `).all();
  }
  return db.prepare(`SELECT * FROM ${tabla}`).all();
}

function consultarPorFolio(col, tabla, folio) {
  if (col === 'reservaciones') {
    return db.prepare(`SELECT r.*, COALESCE(u.nombre, '') AS cliente FROM reservaciones r LEFT JOIN usuarios u ON r.cliente_folio = u.folio WHERE r.folio = ?`).get(folio);
  }
  if (col === 'recepciones') {
    return db.prepare(`
      SELECT rec.folio, rec.reservacion_folio, rec.fecha_hora, rec.observaciones, rec.empleado_folio, rec.estado,
             r.fecha, r.hora_entrada, r.hora_salida, r.comensales, r.tipo_evento, r.tipo_menu, r.tipo_mesa,
             r.sala_id, r.ambientacion_id, r.alergias, r.descorche, r.vegetariano, r.vegano,
             r.precio_persona, r.monto_reserva, r.cliente_folio,
             COALESCE(u.nombre, '') AS cliente
      FROM recepciones rec
      LEFT JOIN reservaciones r ON rec.reservacion_folio = r.folio
      LEFT JOIN usuarios u ON r.cliente_folio = u.folio
      WHERE rec.folio = ?
    `).get(folio);
  }
  if (col === 'inmersiones') {
    return db.prepare(`
      SELECT inm.folio, inm.reservacion_folio, inm.vehiculo_folio, inm.fecha_hora, inm.observaciones, inm.empleado_folio, inm.estado,
             r.fecha, r.hora_entrada, r.hora_salida, r.comensales, r.tipo_evento, r.tipo_menu, r.tipo_mesa,
             r.sala_id, r.ambientacion_id, r.alergias, r.descorche, r.vegetariano, r.vegano,
             r.precio_persona, r.monto_reserva, r.cliente_folio,
             COALESCE(u.nombre, '') AS cliente
      FROM inmersiones inm
      LEFT JOIN reservaciones r ON inm.reservacion_folio = r.folio
      LEFT JOIN usuarios u ON r.cliente_folio = u.folio
      WHERE inm.folio = ?
    `).get(folio);
  }
  return db.prepare(`SELECT * FROM ${tabla} WHERE folio = ?`).get(folio);
}

// Normalizar objeto de BD para el frontend (bidireccional: kebab-case y snake_case)
function normalizarFila(col, row) {
  if (!row) return null;
  const item = { ...row };

  // Campos comunes con guiones para el frontend
  if (col === 'usuarios') {
    item['tipo-de-cliente'] = item.tipo_cliente;
    item['contacto-de-emergencia'] = item.contacto_emergencia;
    item['telefono-del-contacto-de-emergencia'] = item.telefono_contacto_emergencia;
    item['correo-electronico'] = item.correo_electronico;
    item['observaciones-especiales'] = item.observaciones_especiales;
    item.password = item.password_hash;
  } else if (col === 'souvenirs') {
    item['precio-por-unidad'] = String(item.precio_unitario);
    item['clave-del-proveedor'] = item.proveedor_id;
  } else if (col === 'empleados') {
    item['rol-puesto'] = item.rol_puesto;
    item['clave-del-contrato'] = item.clave_contrato;
    item.password = item.password_hash;
  } else if (col === 'transporte') {
    item['equipamiento-inmersivo'] = item.equipamiento_inmersivo;
    item['folio-de-poliza-de-seguro'] = item.folio_poliza_seguro;
    item['vigencia-de-poliza'] = item.vigencia_poliza;
    item['tipo-de-vehiculo'] = item.tipo_vehiculo;
    item['vigencia-de-tarjeta-de-circulacion'] = item.vigencia_tarjeta_circulacion;
    item['estatus-de-verificacion-vehicular'] = item.estatus_verificacion;
  } else if (col === 'reservaciones' || col === 'recepciones' || col === 'inmersiones') {
    item['tipo-evento'] = item.tipo_evento;
    item['tipo-menu'] = item.tipo_menu;
    item['tipo-mesa'] = item.tipo_mesa;
    item['hora-entrada'] = item.hora_entrada;
    item['hora-salida'] = item.hora_salida;
    item['precio-persona'] = item.precio_persona != null ? String(item.precio_persona) : '';
    item['monto-reserva'] = item.monto_reserva != null ? String(item.monto_reserva) : '';
    item.sala = item.sala_id;
    item.ambientacion = item.ambientacion_id;
    item.clienteFolio = item.cliente_folio;
    item.descorche = Boolean(item.descorche);
    item.vegetariano = Boolean(item.vegetariano);
    item.vegano = Boolean(item.vegano);
  } else if (col === 'comandas') {
    item.mesa = item.mesa_folio;
    item.mesero = item.mesero_folio;
    // Cargar lineas de la comanda
    try {
      const lineas = db.prepare('SELECT * FROM comanda_detalles WHERE comanda_folio = ?').all(item.folio);
      item.lineas = lineas.map(l => ({
        nombre: l.articulo_nombre,
        precio: l.precio_unitario,
        cant: l.cantidad,
        sub: l.subtotal,
        enviado: Boolean(l.enviado_cocina),
        cancelado: Boolean(l.cancelado)
      }));
    } catch (e) {
      item.lineas = [];
    }
  } else if (col === 'compras') {
    try {
      const lineas = db.prepare('SELECT * FROM compra_detalles WHERE compra_folio = ?').all(item.folio);
      item.lineas = lineas.map(l => ({
        tipo: l.tipo_producto,
        articulo: l.articulo,
        cantidad: l.cantidad,
        precio: l.precio_unitario,
        subtotal: l.subtotal
      }));
    } catch (e) {
      item.lineas = [];
    }
  }

  return item;
}

// Convertir datos del frontend a columnas de BD
function prepararDatosBD(col, datos) {
  const d = { ...datos };
  const out = {};

  if (col === 'usuarios') {
    if (d.folio !== undefined) out.folio = d.folio;
    if (d.nombre !== undefined) out.nombre = d.nombre;
    if (d.direccion !== undefined) out.direccion = d.direccion;
    if (d['tipo-de-cliente'] || d.tipo_cliente) out.tipo_cliente = d['tipo-de-cliente'] || d.tipo_cliente;
    if (d['contacto-de-emergencia'] || d.contacto_emergencia) out.contacto_emergencia = d['contacto-de-emergencia'] || d.contacto_emergencia;
    if (d.telefono !== undefined) out.telefono = d.telefono;
    if (d['telefono-del-contacto-de-emergencia'] || d.telefono_contacto_emergencia) out.telefono_contacto_emergencia = d['telefono-del-contacto-de-emergencia'] || d.telefono_contacto_emergencia;
    if (d['correo-electronico'] || d.correo_electronico) out.correo_electronico = d['correo-electronico'] || d.correo_electronico;
    if (d['observaciones-especiales'] || d.observaciones_especiales) out.observaciones_especiales = d['observaciones-especiales'] || d.observaciones_especiales;
    if (d.password || d.password_hash) out.password_hash = d.password || d.password_hash;
    if (d.estado !== undefined) out.estado = d.estado;
  } else if (col === 'souvenirs') {
    if (d.folio !== undefined) out.folio = d.folio;
    if (d.nombre !== undefined) out.nombre = d.nombre;
    if (d['precio-por-unidad'] !== undefined || d.precio_unitario !== undefined) out.precio_unitario = Number(d['precio-por-unidad'] || d.precio_unitario);
    if (d.departamento !== undefined) out.departamento = d.departamento;
    if (d['clave-del-proveedor'] || d.proveedor_id) out.proveedor_id = d['clave-del-proveedor'] || d.proveedor_id;
    if (d.descripcion !== undefined) out.descripcion = d.descripcion;
    if (d.existencia !== undefined) out.existencia = Number(d.existencia);
    if (d.estado !== undefined) out.estado = d.estado;
  } else if (col === 'empleados') {
    if (d.folio !== undefined) out.folio = d.folio;
    if (d.nombre !== undefined) out.nombre = d.nombre;
    if (d.telefono !== undefined) out.telefono = d.telefono;
    if (d.area !== undefined) out.area = d.area;
    if (d.correo !== undefined) out.correo = d.correo;
    if (d['rol-puesto'] || d.rol_puesto) out.rol_puesto = d['rol-puesto'] || d.rol_puesto;
    if (d['clave-del-contrato'] || d.clave_contrato) out.clave_contrato = d['clave-del-contrato'] || d.clave_contrato;
    if (d.usuario !== undefined) out.usuario = d.usuario;
    if (d.password || d.password_hash) out.password_hash = d.password || d.password_hash;
    if (d.estado !== undefined) out.estado = d.estado;
  } else if (col === 'transporte') {
    if (d.folio !== undefined) out.folio = d.folio;
    if (d.vin !== undefined) out.vin = d.vin;
    if (d['equipamiento-inmersivo'] || d.equipamiento_inmersivo) out.equipamiento_inmersivo = d['equipamiento-inmersivo'] || d.equipamiento_inmersivo;
    if (d.marca !== undefined) out.marca = d.marca;
    if (d.capacidad !== undefined) out.capacidad = Number(d.capacidad);
    if (d.modelo !== undefined) out.modelo = d.modelo;
    if (d['folio-de-poliza-de-seguro'] || d.folio_poliza_seguro) out.folio_poliza_seguro = d['folio-de-poliza-de-seguro'] || d.folio_poliza_seguro;
    if (d.placas !== undefined) out.placas = d.placas;
    if (d['vigencia-de-poliza'] || d.vigencia_poliza) out.vigencia_poliza = d['vigencia-de-poliza'] || d.vigencia_poliza;
    if (d['tipo-de-vehiculo'] || d.tipo_vehiculo) out.tipo_vehiculo = d['tipo-de-vehiculo'] || d.tipo_vehiculo;
    if (d['vigencia-de-tarjeta-de-circulacion'] || d.vigencia_tarjeta_circulacion) out.vigencia_tarjeta_circulacion = d['vigencia-de-tarjeta-de-circulacion'] || d.vigencia_tarjeta_circulacion;
    if (d.color !== undefined) out.color = d.color;
    if (d['estatus-de-verificacion-vehicular'] || d.estatus_verificacion) out.estatus_verificacion = d['estatus-de-verificacion-vehicular'] || d.estatus_verificacion;
    if (d.estado !== undefined) out.estado = d.estado;
    if (d.motivo_baja !== undefined) out.motivo_baja = d.motivo_baja;
  } else if (col === 'reservaciones') {
    if (d.folio !== undefined) out.folio = d.folio;
    if (d.clienteFolio || d.cliente_folio) {
      out.cliente_folio = d.clienteFolio || d.cliente_folio;
    } else if (d.cliente) {
      const u = db.prepare('SELECT folio FROM usuarios WHERE LOWER(nombre) = LOWER(?) LIMIT 1').get(String(d.cliente).trim());
      if (u) out.cliente_folio = u.folio;
      else {
        const primero = db.prepare('SELECT folio FROM usuarios LIMIT 1').get();
        if (primero) out.cliente_folio = primero.folio;
      }
    }
    if (d.fecha !== undefined) out.fecha = d.fecha;
    if (d['hora-entrada'] || d.hora_entrada) out.hora_entrada = d['hora-entrada'] || d.hora_entrada;
    if (d['hora-salida'] || d.hora_salida) out.hora_salida = d['hora-salida'] || d.hora_salida;
    if (d.comensales !== undefined) out.comensales = Number(d.comensales);
    if (d['tipo-evento'] || d.tipo_evento) out.tipo_evento = d['tipo-evento'] || d.tipo_evento;
    if (d['tipo-menu'] || d.tipo_menu) out.tipo_menu = d['tipo-menu'] || d.tipo_menu;
    if (d['tipo-mesa'] || d.tipo_mesa) out.tipo_mesa = d['tipo-mesa'] || d.tipo_mesa;
    if (d.sala || d.sala_id) out.sala_id = d.sala || d.sala_id;
    if (d.ambientacion || d.ambientacion_id) out.ambientacion_id = d.ambientacion || d.ambientacion_id;
    if (d.alergias !== undefined) out.alergias = d.alergias;
    if (d.descorche !== undefined) out.descorche = d.descorche ? 1 : 0;
    if (d.vegetariano !== undefined) out.vegetariano = d.vegetariano ? 1 : 0;
    if (d.vegano !== undefined) out.vegano = d.vegano ? 1 : 0;
    if (d['precio-persona'] || d.precio_persona) out.precio_persona = Number(d['precio-persona'] || d.precio_persona);
    if (d['monto-reserva'] || d.monto_reserva) out.monto_reserva = Number(d['monto-reserva'] || d.monto_reserva);
    if (d.observaciones !== undefined) out.observaciones = d.observaciones;
    if (d.estado !== undefined) out.estado = d.estado;
    if (d.motivo !== undefined || d.motivo_cancelacion !== undefined) out.motivo_cancelacion = d.motivo || d.motivo_cancelacion;
    if (d.multa !== undefined || d.multa_monto !== undefined) out.multa_monto = Number(d.multa || d.multa_monto || 0);
  } else if (col === 'recepciones' || col === 'inmersiones') {
    if (d.folio !== undefined) {
      out.folio = d.folio;
      out.reservacion_folio = d.reservacion_folio || d.folio;
    }
    if (d.observaciones !== undefined) out.observaciones = d.observaciones;
    if (d.estado !== undefined) out.estado = d.estado;
    if (d.vehiculo_folio !== undefined) out.vehiculo_folio = d.vehiculo_folio;
    if (d.empleado_folio !== undefined) out.empleado_folio = d.empleado_folio;
  } else if (col === 'mesas') {
    if (d.folio !== undefined) out.folio = d.folio;
    if (d.estado !== undefined) out.estado = d.estado;
    if (d.mesero_folio !== undefined || d.mesero !== undefined) out.mesero_folio = d.mesero_folio || d.mesero;
  } else if (col === 'comandas') {
    if (d.folio !== undefined) out.folio = d.folio;
    if (d.mesa || d.mesa_folio) out.mesa_folio = d.mesa || d.mesa_folio;
    if (d.mesero || d.mesero_folio) out.mesero_folio = d.mesero || d.mesero_folio;
    if (d.total !== undefined) out.total = Number(d.total);
    if (d.estado !== undefined) out.estado = d.estado;
  } else if (col === 'ventas') {
    if (d.folio !== undefined) out.folio = d.folio;
    if (d.cliente || d.cliente_nombre) out.cliente_nombre = d.cliente || d.cliente_nombre;
    if (d.clienteFolio || d.cliente_folio) out.cliente_folio = d.clienteFolio || d.cliente_folio;
    if (d.souvenirFolio || d.souvenir_folio) out.souvenir_folio = d.souvenirFolio || d.souvenir_folio;
    if (d.cantidad !== undefined) out.cantidad = Number(d.cantidad);
    if (d.precio !== undefined || d.precio_unitario !== undefined) out.precio_unitario = Number(d.precio || d.precio_unitario);
    if (d.total !== undefined) out.total = Number(d.total);
    if (d.metodo || d.metodo_pago) out.metodo_pago = d.metodo || d.metodo_pago;
    if (d.monto_recibido !== undefined) out.monto_recibido = Number(d.monto_recibido);
    if (d.cambio !== undefined) out.cambio = Number(d.cambio);
    if (d.vendedor || d.vendedor_folio) out.vendedor_folio = d.vendedor || d.vendedor_folio;
    if (d.estado !== undefined) out.estado = d.estado;
    if (d.observaciones !== undefined) out.observaciones = d.observaciones;
  } else if (col === 'compras') {
    if (d.folio !== undefined) out.folio = d.folio;
    if (d.proveedor || d.proveedor_id) out.proveedor_id = d.proveedor || d.proveedor_id;
    if (d.fecha || d.fecha_compra) out.fecha_compra = d.fecha || d.fecha_compra;
    if (d.estado !== undefined) out.estado = d.estado;
    if (d.total !== undefined) out.total = Number(d.total);
    if (d.observaciones !== undefined) out.observaciones = d.observaciones;
  } else {
    // Genérico
    Object.keys(d).forEach(k => {
      const sqlKey = k.replace(/-/g, '_');
      out[sqlKey] = d[k];
    });
  }

  return out;
}

// Despachador de peticiones API
async function manejarApi(req, res, pathname, query) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  // GET /api/health
  if (pathname === '/api/health') {
    res.writeHead(200);
    return res.end(JSON.stringify({ status: 'ok', server: 'Mundo a la Carta', time: new Date().toISOString() }));
  }

  // POST /api/reiniciar
  if (pathname === '/api/reiniciar' && req.method === 'POST') {
    try {
      db.close();
      if (fs.existsSync(DB_PATH)) fs.unlinkSync(DB_PATH);
      db = obtenerBD();
      res.writeHead(200);
      return res.end(JSON.stringify({ ok: true, mensaje: 'Base de datos reiniciada con semilla oficial' }));
    } catch (e) {
      res.writeHead(500);
      return res.end(JSON.stringify({ error: e.message }));
    }
  }

  // Parsear ruta: /api/:coleccion o /api/:coleccion/:folio o /api/secuencias/:coleccion
  const partes = pathname.replace(/^\/api\//, '').split('/');
  const primerSegmento = partes[0];

  // GET /api/secuencias/:coleccion
  if (primerSegmento === 'secuencias' && partes[1]) {
    const col = partes[1];
    const tabla = TABLAS[col];
    if (!tabla) {
      res.writeHead(404);
      return res.end(JSON.stringify({ error: 'Colección no encontrada' }));
    }
    const n = siguienteNumeroFolio(col, tabla);
    const fnFolio = FORMATO_FOLIO[col] || ((x) => String(x));
    res.writeHead(200);
    return res.end(JSON.stringify({ folio: fnFolio(n) }));
  }

  const coleccion = primerSegmento;
  const tabla = TABLAS[coleccion];
  const folio = partes[1] ? decodeURIComponent(partes[1]) : null;

  if (!tabla) {
    res.writeHead(404);
    return res.end(JSON.stringify({ error: `Colección '${coleccion}' no soportada por la API.` }));
  }

  // Leer cuerpo si es POST o PATCH
  const leerCuerpo = () => new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try { resolve(body ? JSON.parse(body) : {}); }
      catch (e) { reject(new Error('JSON inválido en solicitud')); }
    });
    req.on('error', reject);
  });

  try {
    // 1. GET /api/:coleccion/:folio
    if (req.method === 'GET' && folio) {
      const row = consultarPorFolio(coleccion, tabla, folio);
      if (!row) {
        res.writeHead(404);
        return res.end(JSON.stringify({ error: `No existe el registro con folio ${folio}` }));
      }
      res.writeHead(200);
      return res.end(JSON.stringify(normalizarFila(coleccion, row)));
    }

    // 2. GET /api/:coleccion (Listar con filtros y paginación)
    if (req.method === 'GET' && !folio) {
      const rows = consultarTodos(coleccion, tabla);
      let items = rows.map(r => normalizarFila(coleccion, r));

      // Búsqueda q
      if (query.q) {
        const q = String(query.q).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        items = items.filter(r => {
          return Object.values(r).some(v => {
            if (v == null || typeof v === 'object') return false;
            return String(v).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(q);
          });
        });
      }

      // Filtros específicos query param (ej. ?estado=Activo)
      Object.keys(query).forEach(k => {
        if (!['q', 'pagina', 'porPagina', 'orden'].includes(k)) {
          items = items.filter(r => String(r[k]) === String(query[k]) || String(r[k.replace(/-/g, '_')]) === String(query[k]));
        }
      });

      const total = items.length;
      const porPagina = parseInt(query.porPagina, 10) || total || 1;
      const paginas = Math.max(1, Math.ceil(total / porPagina));
      const pagina = Math.min(Math.max(1, parseInt(query.pagina, 10) || 1), paginas);
      const paginados = items.slice((pagina - 1) * porPagina, pagina * porPagina);

      res.writeHead(200);
      return res.end(JSON.stringify({
        items: paginados,
        total,
        pagina,
        paginas,
        porPagina
      }));
    }

    // 3. POST /api/:coleccion (Crear registro)
    if (req.method === 'POST') {
      const body = await leerCuerpo();
      if (!body.folio) {
        const n = siguienteNumeroFolio(coleccion, tabla);
        const fnFolio = FORMATO_FOLIO[coleccion] || ((x) => String(x));
        body.folio = fnFolio(n);
      }

      const columnasValidas = db.prepare(`PRAGMA table_info(${tabla})`).all().map(c => c.name);
      const datosBD = prepararDatosBD(coleccion, body);
      const colsInsert = [];
      const valsInsert = [];
      const placeholders = [];

      columnasValidas.forEach(colName => {
        if (datosBD[colName] !== undefined) {
          colsInsert.push(colName);
          valsInsert.push(datosBD[colName]);
          placeholders.push('?');
        }
      });

      if (colsInsert.length === 0) {
        res.writeHead(400);
        return res.end(JSON.stringify({ error: 'No se enviaron campos válidos para la tabla' }));
      }

      const sqlInsert = `INSERT INTO ${tabla} (${colsInsert.join(', ')}) VALUES (${placeholders.join(', ')})`;
      db.prepare(sqlInsert).run(...valsInsert);

      // Si vienen líneas en comanda, guardarlas en comanda_detalles
      if (coleccion === 'comandas' && Array.isArray(body.lineas)) {
        const insLinea = db.prepare('INSERT INTO comanda_detalles (comanda_folio, articulo_nombre, precio_unitario, cantidad, subtotal, enviado_cocina) VALUES (?, ?, ?, ?, ?, ?)');
        for (const l of body.lineas) {
          insLinea.run(body.folio, l.nombre, Number(l.precio || 0), Number(l.cant || 1), Number(l.sub || l.precio || 0), l.enviado ? 1 : 0);
        }
      }

      const nuevo = consultarPorFolio(coleccion, tabla, body.folio);
      res.writeHead(201);
      return res.end(JSON.stringify(normalizarFila(coleccion, nuevo)));
    }

    // 4. PATCH /api/:coleccion/:folio (Actualizar registro)
    if (req.method === 'PATCH' && folio) {
      const body = await leerCuerpo();
      const columnasValidas = db.prepare(`PRAGMA table_info(${tabla})`).all().map(c => c.name);
      const datosBD = prepararDatosBD(coleccion, body);
      const sets = [];
      const vals = [];

      columnasValidas.forEach(colName => {
        if (colName !== 'folio' && datosBD[colName] !== undefined) {
          sets.push(`${colName} = ?`);
          vals.push(datosBD[colName]);
        }
      });

      if (sets.length > 0) {
        vals.push(folio);
        const sqlUpdate = `UPDATE ${tabla} SET ${sets.join(', ')} WHERE folio = ?`;
        db.prepare(sqlUpdate).run(...vals);
      }

      // Si se actualizan líneas de comanda
      if (coleccion === 'comandas' && Array.isArray(body.lineas)) {
        db.prepare('DELETE FROM comanda_detalles WHERE comanda_folio = ?').run(folio);
        const insLinea = db.prepare('INSERT INTO comanda_detalles (comanda_folio, articulo_nombre, precio_unitario, cantidad, subtotal, enviado_cocina) VALUES (?, ?, ?, ?, ?, ?)');
        for (const l of body.lineas) {
          insLinea.run(folio, l.nombre, Number(l.precio || 0), Number(l.cant || 1), Number(l.sub || l.precio || 0), l.enviado ? 1 : 0);
        }
      }

      const actualizado = consultarPorFolio(coleccion, tabla, folio);
      res.writeHead(200);
      return res.end(JSON.stringify(normalizarFila(coleccion, actualizado)));
    }

    // 5. DELETE /api/:coleccion/:folio
    if (req.method === 'DELETE' && folio) {
      db.prepare(`DELETE FROM ${tabla} WHERE folio = ?`).run(folio);
      res.writeHead(200);
      return res.end(JSON.stringify({ ok: true, eliminado: folio }));
    }

    res.writeHead(405);
    return res.end(JSON.stringify({ error: `Método ${req.method} no permitido.` }));
  } catch (error) {
    console.error(`Error en API [${req.method} ${pathname}]:`, error);
    res.writeHead(500);
    return res.end(JSON.stringify({ error: error.message }));
  }
}

module.exports = { manejarApi };

