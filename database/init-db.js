/**
 * database/init-db.js
 * Script de inicialización y migración de base de datos para Mundo a la Carta.
 * Utiliza el motor nativo SQLite de Node.js (node:sqlite) disponible en Node 22+.
 *
 * Uso:
 *   node database/init-db.js         # Inicializa o migra tablas y siembra datos
 *   node database/init-db.js --reset # Elimina y reconstruye desde cero
 */

const fs = require('fs');
const path = require('path');
const { DatabaseSync } = require('node:sqlite');

const DB_PATH = path.join(__dirname, 'mundo_a_la_carta.db');
const SCHEMA_PATH = path.join(__dirname, 'schema.sql');
const SEED_PATH = path.join(__dirname, 'seed.sql');

const resetRequested = process.argv.includes('--reset');

if (resetRequested && fs.existsSync(DB_PATH)) {
  console.log('🧹 Eliminando base de datos existente por solicitud (--reset)...');
  fs.unlinkSync(DB_PATH);
}

console.log('🚀 Conectando a SQLite:', DB_PATH);
const db = new DatabaseSync(DB_PATH);

try {
  // Habilitar claves foráneas
  db.exec('PRAGMA foreign_keys = ON;');

  console.log('📜 Ejecutando schema.sql...');
  const schemaSql = fs.readFileSync(SCHEMA_PATH, 'utf-8');
  db.exec(schemaSql);
  console.log('✅ Esquema creado con éxito.');

  console.log('🌱 Ejecutando seed.sql (semilla de datos)...');
  const seedSql = fs.readFileSync(SEED_PATH, 'utf-8');
  db.exec(seedSql);
  console.log('✅ Datos sembrados con éxito.');

  console.log('\n📊 Resumen de registros por tabla:');
  const tablas = [
    'roles',
    'empleados',
    'usuarios',
    'proveedores',
    'souvenirs',
    'transporte',
    'salas',
    'ambientaciones',
    'menus',
    'mesas',
    'productos_carta',
    'experiencias',
    'reservaciones',
    'recepciones',
    'inmersiones',
    'ventas',
    'compras',
    'compra_detalles'
  ];

  for (const t of tablas) {
    const row = db.prepare(`SELECT COUNT(*) as total FROM ${t}`).get();
    console.log(`   • ${t.padEnd(20)} : ${row.total} registros`);
  }

  console.log('\n🎉 ¡Base de datos de Mundo a la Carta lista para operar!');
} catch (err) {
  console.error('❌ Error al inicializar la base de datos:', err);
  process.exit(1);
} finally {
  db.close();
}

